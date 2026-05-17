import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Shield, Users, Crown, Activity, Search, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null;
  created_at: string;
  is_admin?: boolean;
}

interface Stats {
  users: number;
  premium: number;
  workouts: number;
  posts: number;
}

export default function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({ users: 0, premium: 0, workouts: 0, posts: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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
      const [{ count: usersCount }, { count: premiumCount }, { count: workoutsCount }, { count: postsCount }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
          supabase.from("workouts").select("*", { count: "exact", head: true }),
          supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        ]);
      setStats({
        users: usersCount || 0,
        premium: premiumCount || 0,
        workouts: workoutsCount || 0,
        posts: postsCount || 0,
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_premium, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminSet = new Set((admins || []).map((a: any) => a.user_id));

      setUsers(
        (profiles || []).map((p: any) => ({ ...p, is_admin: adminSet.has(p.id) }))
      );
    } catch (e: any) {
      toast.error("Erro ao carregar dados: " + e.message);
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
      .eq("id", u.id);
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

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = users.filter((u) =>
    !search || (u.name || "").toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)
  );

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Controle total do EvoCore</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Usuários" value={stats.users} />
        <StatCard icon={Crown} label="Premium" value={stats.premium} />
        <StatCard icon={Activity} label="Treinos" value={stats.workouts} />
        <StatCard icon={Activity} label="Posts" value={stats.posts} />
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
          </Button>
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
                <p className="text-xs text-muted-foreground truncate">{u.id}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePremium(u)}
                  title={u.is_premium ? "Remover premium" : "Conceder premium"}
                >
                  <Crown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={u.is_admin ? "destructive" : "outline"}
                  onClick={() => toggleAdmin(u)}
                  title={u.is_admin ? "Remover admin" : "Tornar admin"}
                >
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
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value.toLocaleString("pt-BR")}</p>
        </div>
      </div>
    </Card>
  );
}
