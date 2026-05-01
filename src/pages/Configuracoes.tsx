import { Link } from "react-router-dom";
import { Globe, LogOut, Shield, FileText, CreditCard, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Configuracoes() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
  };

  const items = [
    { to: "/configuracoes/idioma", icon: Globe, label: "Idioma" },
    { to: "/premium", icon: CreditCard, label: "Assinatura" },
    { to: "/privacidade", icon: Shield, label: "Privacidade" },
    { to: "/termos", icon: FileText, label: "Termos de Serviço" },
  ];

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      <div className="glass-card rounded-2xl divide-y divide-border/30 overflow-hidden">
        {items.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-4 py-4 hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-foreground">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="w-full glass-card rounded-2xl px-4 py-4 flex items-center gap-3 text-destructive active:scale-[0.99] transition-transform"
      >
        <LogOut className="w-5 h-5" />
        <span className="flex-1 text-left font-medium">Sair</span>
      </button>
    </div>
  );
}
