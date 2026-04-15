import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { User, Settings, Crown, Bell, ChevronRight, LogOut, Shield, HelpCircle, Star, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileScreen = () => {
  const { userProfile, setUserProfile, setIsLoggedIn, setHasOnboarded, isPremium, setCurrentTab, user } = useApp();
  const name = userProfile.name || "Atleta";
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(userProfile);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setEditProfile({ ...userProfile });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (user) {
        await supabase.from("profiles").update({
          name: editProfile.name,
          gender: editProfile.gender,
          age: editProfile.age,
          weight: editProfile.weight,
          height: editProfile.height,
          goal: editProfile.goal,
          level: editProfile.level,
          preference: editProfile.preference,
          days_per_week: editProfile.daysPerWeek,
        }).eq("user_id", user.id);
      }
      setUserProfile(editProfile);
      setIsEditing(false);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const goals: Record<string, string> = {
    lose: "Emagrecer", gain: "Ganhar massa", condition: "Condicionamento",
    define: "Definição", health: "Saúde geral"
  };
  const levels: Record<string, string> = {
    beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado"
  };

  const menuItems = [
    { icon: Bell, label: "Notificações", action: () => {} },
    { icon: Settings, label: "Configurações", action: () => {} },
    { icon: Shield, label: "Privacidade", action: () => {} },
    { icon: HelpCircle, label: "Ajuda & suporte", action: () => {} },
    { icon: Star, label: "Avaliar app", action: () => {} },
  ];

  if (isEditing) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Cancelar
          </button>
          <h2 className="font-heading font-bold text-foreground">Editar Perfil</h2>
          <Button variant="ghost" size="sm" onClick={saveProfile} disabled={saving} className="text-primary">
            <Save className="w-4 h-4 mr-1" /> {saving ? "..." : "Salvar"}
          </Button>
        </div>

        <div className="space-y-4 animate-fade-in">
          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center relative">
              <span className="text-2xl font-bold text-foreground">{(editProfile.name || "A")[0]?.toUpperCase()}</span>
            </div>
          </div>

          {/* Name */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                className="h-10 bg-secondary border-border/50 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
              <Input value={editProfile.email} disabled className="h-10 bg-secondary/50 border-border/50 rounded-xl opacity-60" />
            </div>
          </div>

          {/* Physical */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Informações físicas</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setEditProfile({ ...editProfile, gender: "male" })}
                className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                  editProfile.gender === "male" ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground"
                }`}
              >🙋‍♂️ Homem</button>
              <button
                onClick={() => setEditProfile({ ...editProfile, gender: "female" })}
                className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                  editProfile.gender === "female" ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground"
                }`}
              >🙋‍♀️ Mulher</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Idade</label>
                <Input type="number" value={editProfile.age}
                  onChange={(e) => setEditProfile({ ...editProfile, age: +e.target.value })}
                  className="h-10 bg-secondary border-border/50 rounded-xl text-center" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Peso (kg)</label>
                <Input type="number" value={editProfile.weight}
                  onChange={(e) => setEditProfile({ ...editProfile, weight: +e.target.value })}
                  className="h-10 bg-secondary border-border/50 rounded-xl text-center" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</label>
                <Input type="number" value={editProfile.height}
                  onChange={(e) => setEditProfile({ ...editProfile, height: +e.target.value })}
                  className="h-10 bg-secondary border-border/50 rounded-xl text-center" />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Objetivo</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(goals).map(([id, label]) => (
                <button key={id}
                  onClick={() => setEditProfile({ ...editProfile, goal: id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    editProfile.goal === id ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Nível</h3>
            <div className="flex gap-2">
              {Object.entries(levels).map(([id, label]) => (
                <button key={id}
                  onClick={() => setEditProfile({ ...editProfile, level: id })}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    editProfile.level === id ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Days per week */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Dias por semana</h3>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button key={d}
                  onClick={() => setEditProfile({ ...editProfile, daysPerWeek: d })}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    editProfile.daysPerWeek === d ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Profile header */}
      <div className="glass-card-purple rounded-2xl p-6 mb-4 text-center animate-fade-in">
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
        <Button variant="glass" size="sm" className="mt-3 rounded-xl gap-1" onClick={startEditing}>
          <Edit3 className="w-3 h-3" /> Editar perfil
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-[10px] text-muted-foreground">Gênero</p>
          <p className="text-sm font-medium text-foreground">{userProfile.gender === "male" ? "Masculino" : userProfile.gender === "female" ? "Feminino" : "—"}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-[10px] text-muted-foreground">Idade</p>
          <p className="text-sm font-medium text-foreground">{userProfile.age} anos</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-[10px] text-muted-foreground">Peso</p>
          <p className="text-sm font-medium text-foreground">{userProfile.weight} kg</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-[10px] text-muted-foreground">Altura</p>
          <p className="text-sm font-medium text-foreground">{userProfile.height} cm</p>
        </div>
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

      {/* Objective & Level */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Objetivo</span>
          <span className="text-sm font-medium text-primary">{goals[userProfile.goal] || "Não definido"}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Nível</span>
          <span className="text-sm font-medium text-foreground">{levels[userProfile.level] || "Não definido"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Treinos/semana</span>
          <span className="text-sm font-medium text-foreground">{userProfile.daysPerWeek}x</span>
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
            <p className="text-xs text-muted-foreground">7 dias grátis • Desbloqueie tudo</p>
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
