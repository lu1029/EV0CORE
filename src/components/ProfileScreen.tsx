import React from "react";
import { useApp } from "@/contexts/AppContext";
import { User, Settings, Crown, Bell, ChevronRight, LogOut, Moon, Shield, HelpCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfileScreen = () => {
  const { userProfile, setIsLoggedIn, setHasOnboarded, isPremium, setCurrentTab } = useApp();
  const name = userProfile.name || "Atleta";

  const menuItems = [
    { icon: User, label: "Editar perfil", action: () => {} },
    { icon: Bell, label: "Notificações", action: () => {} },
    { icon: Settings, label: "Configurações", action: () => {} },
    { icon: Shield, label: "Privacidade", action: () => {} },
    { icon: HelpCircle, label: "Ajuda & suporte", action: () => {} },
    { icon: Star, label: "Avaliar app", action: () => {} },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Profile header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl font-bold text-foreground">{name[0]?.toUpperCase()}</span>
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground">{userProfile.email || "atleta@evocore.app"}</p>
        {isPremium && (
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
            <Crown className="w-3 h-3" /> PRO
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">48</p>
          <p className="text-[10px] text-muted-foreground">Treinos</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">12</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">86km</p>
          <p className="text-[10px] text-muted-foreground">Corrida</p>
        </div>
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <button
          onClick={() => setCurrentTab("premium")}
          className="w-full bg-card border border-primary/30 rounded-2xl p-4 mb-4 flex items-center gap-3 hover:border-primary/50 transition-all animate-fade-in"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground text-sm">Upgrade para PRO</p>
            <p className="text-xs text-muted-foreground">Desbloqueie todos os recursos</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* Menu */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4 animate-fade-in">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-all ${
              i < menuItems.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="glass"
        className="w-full h-12 rounded-xl text-destructive gap-2"
        onClick={async () => {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.auth.signOut();
        }}
      >
        <LogOut className="w-4 h-4" /> Sair da conta
      </Button>

      <p className="text-center text-[10px] text-muted-foreground mt-4">EVOCORE v1.0.0</p>
    </div>
  );
};

export default ProfileScreen;
