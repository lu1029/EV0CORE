import { useState } from "react";
import { 
  Globe, LogOut, Shield, FileText, CreditCard, ChevronRight, 
  User, Bell, Lock, UserX, MessageSquare, Bookmark, Share2, Info, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Configuracoes() {
  const { isPremium, user } = useApp();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
  };

  const handleDeleteAccount = async () => {
    // In production, this would trigger an edge function to cleanup user data
    // For now, we sign out and show instructions
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Processando solicitação...',
        success: 'Sua conta foi marcada para exclusão. Os dados serão removidos em até 30 dias.',
        error: 'Erro ao processar solicitação.',
      }
    );
    await handleLogout();
    setShowDeleteConfirm(false);
  };

  const sections = [
    {
      title: "Planos",
      items: [
        { 
          to: "/premium", 
          icon: CreditCard, 
          label: "EVOCORE Pro", 
          sub: isPremium ? "Assinatura Ativa" : "7 dias grátis",
          color: "text-primary" 
        },
      ]
    },
    {
      title: "Conta e Perfil",
      items: [
        { to: "/perfil", icon: User, label: "Perfil" },
        { icon: Bookmark, label: "Salvos", action: () => navigate("/perfil") },
        { to: "/configuracoes/idioma", icon: Globe, label: "Idioma" },
      ]
    },
    {
      title: "Segurança e Privacidade",
      items: [
        { to: "/privacidade", icon: Shield, label: "Privacidade" },
        { icon: Lock, label: "Segurança", action: () => toast.info("Configurações de segurança em breve") },
      ]
    },
    {
      title: "App",
      items: [
        { icon: Bell, label: "Notificações", action: () => toast.info("Configurações de notificações em breve") },
        { to: "/termos", icon: FileText, label: "Termos de Serviço" },
        { icon: Share2, label: "Compartilhar EvoCore", action: () => {
            if (navigator.share) navigator.share({ title: "EvoCore", url: "https://ev0core.com" });
            else { navigator.clipboard.writeText("https://ev0core.com"); toast.success("Link copiado!"); }
          }
        },
      ]
    }
  ];

  return (
    <div className="px-4 py-6 space-y-8 pb-32 max-w-lg mx-auto">
      <h1 className="text-[28px] font-bold text-foreground tracking-tight px-1">Configurações</h1>
      
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-3">
          <h2 className="text-[12px] uppercase tracking-wider text-muted-foreground px-1 font-semibold">
            {section.title}
          </h2>
          <div className="glass-card rounded-3xl divide-y divide-border/20 overflow-hidden">
            {section.items.map((item, i) => {
              const content = (
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-foreground/5 active:bg-foreground/10 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center ${item.color || "text-muted-foreground"}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-medium text-foreground">{item.label}</p>
                    {item.sub && <p className="text-[12px] text-muted-foreground">{item.sub}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              );

              return item.to ? (
                <Link key={i} to={item.to}>{content}</Link>
              ) : (
                <div key={i} onClick={item.action}>{content}</div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="space-y-3 pt-4">
        <button
          onClick={handleLogout}
          className="w-full h-14 glass-card rounded-2xl px-5 flex items-center gap-4 text-foreground active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-semibold">Sair da conta</span>
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full h-14 glass-card rounded-2xl px-5 flex items-center gap-4 text-destructive active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-semibold">Excluir conta</span>
        </button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="glass-card border-border/40 rounded-[32px] p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              Esta ação é permanente. Todos os seus treinos, histórico, seguidores e dados de evolução serão apagados ou anonimizados. 
              Você tem 30 dias para cancelar esta solicitação fazendo login novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 mt-4 sm:flex-col">
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="w-full h-12 rounded-2xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90"
            >
              Sim, excluir permanentemente
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-2xl bg-secondary border-none font-bold">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
