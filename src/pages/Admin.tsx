import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, Shield, Users, Crown, Activity, Search, ShieldCheck, ShieldOff,
  CreditCard, AlertTriangle, Megaphone, Dumbbell, FileText, RefreshCw, QrCode,
  CheckCircle2, XCircle, Trash2,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null;
  created_at: string;
  email?: string | null;
  is_admin?: boolean;
}

interface Stats {
  users: number;
  premium: number;
  workouts: number;
  posts: number;
  activeSubs: number;
  pendingPix: number;
  pendingReports: number;
  mrrCents: number;
}

export default function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({
    users: 0, premium: 0, workouts: 0, posts: 0,
    activeSubs: 0, pendingPix: 0, pendingReports: 0, mrrCents: 0,
  });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [pix, setPix] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!user) {
        navigate("/home");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error || !data) {
        toast.error("Acesso restrito a administradores");
        navigate("/home");
        return;
      }
      setIsAdmin(true);
      setChecking(false);
    };
    verify();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { count: usersCount },
        { count: premiumCount },
        { count: workoutsCount },
        { count: postsCount },
        { count: activeSubsCount },
        { count: pendingPixCount },
        { count: pendingReportsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("workouts").select("*", { count: "exact", head: true }),
        supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).in("status", ["active", "trialing"]),
        supabase.from("pix_charges").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
        supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url, is_premium, created_at, email")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminSet = new Set((admins || []).map((a: any) => a.user_id));

      const { data: subsData } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: pixData } = await supabase
        .from("pix_charges")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: reportsData } = await supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const mrr = (subsData || [])
        .filter((s: any) => ["active", "trialing"].includes(s.status))
        .reduce((acc: number, _s: any) => acc + 1499, 0);

      setStats({
        users: usersCount || 0,
        premium: premiumCount || 0,
        workouts: workoutsCount || 0,
        posts: postsCount || 0,
        activeSubs: activeSubsCount || 0,
        pendingPix: pendingPixCount || 0,
        pendingReports: pendingReportsCount || 0,
        mrrCents: mrr,
      });

      setUsers(
        (profiles || []).map((p: any) => ({
          id: p.user_id || p.id,
          name: p.name,
          avatar_url: p.avatar_url,
          is_premium: p.is_premium,
          created_at: p.created_at,
          email: p.email,
          is_admin: adminSet.has(p.user_id || p.id),
        }))
      );
      setSubs(subsData || []);
      setPix(pixData || []);
      setReports(reportsData || []);
    } catch (e: any) {
      toast.error("Erro ao carregar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const togglePremium = async (u: UserRow) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: !u.is_premium })
      .eq("user_id", u.id);
    if (error) return toast.error(error.message);
    toast.success(u.is_premium ? "Premium removido" : "Premium concedido");
    loadData();
  };

  const toggleAdmin = async (u: UserRow) => {
    if (u.is_admin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", u.id)
        .eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin removido");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: u.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin concedido");
    }
    loadData();
  };

  const cancelSub = async (sub: any) => {
    if (!confirm("Cancelar essa assinatura?")) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (error) return toast.error(error.message);
    toast.success("Assinatura cancelada");
    loadData();
  };

  const grantManualSub = async (u: UserRow, days = 30) => {
    const end = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from("subscriptions").insert({
      user_id: u.id,
      stripe_subscription_id: `manual_${Date.now()}_${u.id.slice(0, 6)}`,
      stripe_customer_id: `manual_${u.id.slice(0, 6)}`,
      product_id: "manual_admin",
      price_id: "pro_monthly",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: end,
      environment: "pix",
    });
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ is_premium: true }).eq("user_id", u.id);
    toast.success(`Premium concedido por ${days} dias`);
    loadData();
  };

  const updateReport = async (r: any, status: "resolved" | "dismissed") => {
    const { error } = await supabase
      .from("content_reports")
      .update({ status })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Denúncia atualizada");
    loadData();
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      return toast.error("Preencha título e mensagem");
    }
    setSending(true);
    try {
      const { data: allUsers } = await supabase.from("profiles").select("user_id");
      const rows = (allUsers || []).map((p: any) => ({
        user_id: p.user_id,
        title: broadcastTitle,
        message: broadcastMessage,
        type: "admin_broadcast",
      }));
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from("notifications").insert(chunk);
        if (error) throw error;
      }
      toast.success(`Enviado para ${rows.length} usuários`);
      setBroadcastOpen(false);
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = users.filter((u) =>
    !search ||
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  const fmtCurrency = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Controle total do EvoCore</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="ml-1">Atualizar</span>
          </Button>
          <Button size="sm" onClick={() => setBroadcastOpen(true)}>
            <Megaphone className="w-4 h-4 mr-1" /> Notificar todos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Usuários" value={stats.users} />
        <StatCard icon={Crown} label="Premium" value={stats.premium} />
        <StatCard icon={CreditCard} label="Assinaturas ativas" value={stats.activeSubs} />
        <StatCard icon={CreditCard} label="MRR estimado" value={fmtCurrency(stats.mrrCents)} />
        <StatCard icon={Dumbbell} label="Treinos" value={stats.workouts} />
        <StatCard icon={FileText} label="Posts" value={stats.posts} />
        <StatCard icon={QrCode} label="Pix pendentes" value={stats.pendingPix} />
        <StatCard icon={AlertTriangle} label="Denúncias abertas" value={stats.pendingReports} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="subs">Assinaturas</TabsTrigger>
          <TabsTrigger value="pix">Pix</TabsTrigger>
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <Card className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{u.name || "Sem nome"}</p>
                      {u.is_premium && <Badge variant="default" className="text-xs">Premium</Badge>}
                      {u.is_admin && <Badge variant="destructive" className="text-xs">Admin</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email || u.id}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => togglePremium(u)} title={u.is_premium ? "Remover premium" : "Conceder premium"}>
                      <Crown className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => grantManualSub(u, 30)} title="Conceder 30d de premium">
                      +30d
                    </Button>
                    <Button size="sm" variant={u.is_admin ? "destructive" : "outline"} onClick={() => toggleAdmin(u)} title={u.is_admin ? "Remover admin" : "Tornar admin"}>
                      {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhum usuário encontrado</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subs" className="space-y-2 mt-4">
          <Card className="p-4 space-y-2">
            {subs.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma assinatura</p>}
            {subs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={s.status === "active" ? "default" : s.status === "trialing" ? "secondary" : "outline"}>
                      {s.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{s.environment}</span>
                    <span className="text-xs font-mono truncate">{s.price_id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">User: {s.user_id}</p>
                  {s.current_period_end && (
                    <p className="text-xs text-muted-foreground">
                      Expira: {new Date(s.current_period_end).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                {["active", "trialing"].includes(s.status) && (
                  <Button size="sm" variant="destructive" onClick={() => cancelSub(s)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="pix" className="space-y-2 mt-4">
          <Card className="p-4 space-y-2">
            {pix.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma cobrança Pix</p>}
            {pix.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <QrCode className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "PAID" ? "default" : p.status === "PENDING" ? "secondary" : "outline"}>
                      {p.status}
                    </Badge>
                    <span className="text-sm font-semibold">{fmtCurrency(p.amount)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">User: {p.user_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-2 mt-4">
          <Card className="p-4 space-y-2">
            {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma denúncia</p>}
            {reports.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={r.status === "pending" ? "destructive" : "outline"}>{r.status}</Badge>
                    <span className="text-xs">{r.content_type}</span>
                    <span className="text-xs font-medium">{r.reason}</span>
                  </div>
                  {r.details && <p className="text-sm mt-1 text-muted-foreground">{r.details}</p>}
                  <p className="text-xs text-muted-foreground mt-1 truncate">Conteúdo: {r.content_id}</p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => updateReport(r, "resolved")} title="Marcar resolvido">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateReport(r, "dismissed")} title="Descartar">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificar todos os usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Título"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
            <Textarea
              placeholder="Mensagem"
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Cancelar</Button>
            <Button onClick={sendBroadcast} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Megaphone className="w-4 h-4 mr-1" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-xl font-bold truncate">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>
      </div>
    </Card>
  );
}
