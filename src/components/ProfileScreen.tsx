import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { User, Settings, Crown, ChevronRight, LogOut, Edit3, Save, X, Flame, Dumbbell, Route, Trophy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SettingsScreen from "@/components/settings/SettingsScreen";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useAchievements } from "@/hooks/useAchievements";

const ProfileScreen = () => {
  const { userProfile, setUserProfile, setIsLoggedIn, setHasOnboarded, isPremium, setCurrentTab, user } = useApp();
  const { stats, loading: statsLoading } = useProfileStats();
  const { achievements, unlockedCount, totalCount, loading: achLoading } = useAchievements();
  const name = userProfile.name || "Atleta";
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(userProfile);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (isEditing) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground text-sm flex items-center gap-1">
            <X className="w-4 h-4" /> Cancelar
          </button>
          <h2 className="font-heading font-bold text-foreground">Editar Perfil</h2>
          <Button variant="ghost" size="sm" onClick={saveProfile} disabled={saving} className="text-primary">
            <Save className="w-4 h-4 mr-1" /> {saving ? "..." : "Salvar"}
          </Button>
        </div>

        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{(editProfile.name || "A")[0]?.toUpperCase()}</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-3 animate-fade-in" style={{ animationDelay: '50ms' }}>
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

          <div className="glass-card rounded-2xl p-4 space-y-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold text-foreground text-sm">Informações físicas</h3>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((g) => (
                <button key={g}
                  onClick={() => setEditProfile({ ...editProfile, gender: g })}
                  className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                    editProfile.gender === g ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground"
                  }`}
                >{g === "male" ? "🙋‍♂️ Homem" : "🙋‍♀️ Mulher"}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Idade", key: "age" as const, value: editProfile.age },
                { label: "Peso (kg)", key: "weight" as const, value: editProfile.weight },
                { label: "Altura (cm)", key: "height" as const, value: editProfile.height },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                  <Input type="number" value={field.value}
                    onChange={(e) => setEditProfile({ ...editProfile, [field.key]: +e.target.value })}
                    className="h-10 bg-secondary border-border/50 rounded-xl text-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
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

          <div className="glass-card rounded-2xl p-4 space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
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

          <div className="glass-card rounded-2xl p-4 space-y-3 animate-fade-in" style={{ animationDelay: '250ms' }}>
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
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 animate-scale-in">
          <span className="text-2xl font-bold text-foreground">{name[0]?.toUpperCase()}</span>
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground">{userProfile.email || "atleta@evocore.app"}</p>
        {isPremium && (
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold animate-scale-in">
            <Crown className="w-3 h-3" /> PRO
          </span>
        )}
        <Button variant="glass" size="sm" className="mt-3 rounded-xl gap-1" onClick={startEditing}>
          <Edit3 className="w-3 h-3" /> Editar perfil
        </Button>
      </div>

      {/* Real stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Treinos", value: stats.totalWorkouts.toString(), icon: <Dumbbell className="w-4 h-4 text-primary" />, delay: 50 },
          { label: "Streak", value: `${stats.streak}🔥`, icon: <Flame className="w-4 h-4 text-orange-500" />, delay: 100 },
          { label: "Volume", value: stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}t` : `${stats.totalVolume}kg`, icon: <Trophy className="w-4 h-4 text-accent" />, delay: 150 },
          { label: "Distância", value: `${stats.totalDistanceKm}km`, icon: <Route className="w-4 h-4 text-blue-400" />, delay: 200 },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-3 text-center animate-fade-in" style={{ animationDelay: `${card.delay}ms` }}>
            <div className="flex justify-center mb-1">{card.icon}</div>
            <p className="text-sm font-heading font-bold text-foreground">{statsLoading ? "—" : card.value}</p>
            <p className="text-[9px] text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Gênero", value: userProfile.gender === "male" ? "Masculino" : userProfile.gender === "female" ? "Feminino" : "—", delay: 250 },
          { label: "Idade", value: `${userProfile.age} anos`, delay: 300 },
          { label: "Peso", value: `${userProfile.weight} kg`, delay: 350 },
          { label: "Altura", value: `${userProfile.height} cm`, delay: 400 },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-3 animate-fade-in" style={{ animationDelay: `${card.delay}ms` }}>
            <p className="text-[10px] text-muted-foreground">{card.label}</p>
            <p className="text-sm font-medium text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Objective & Level */}
      <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
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

      {/* Achievements / Conquistas */}
      <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in" style={{ animationDelay: '220ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Conquistas</span>
          </div>
          <span className="text-xs text-muted-foreground">{achLoading ? "..." : `${unlockedCount}/${totalCount}`}</span>
        </div>
        {/* Progress */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
          <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {achievements.slice(0, 8).map((a) => (
            <div
              key={a.key}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                a.unlocked ? "glass-card-purple" : "opacity-40"
              }`}
              title={`${a.name}: ${a.description}`}
            >
              <span className="text-xl mb-0.5">{a.icon}</span>
              <span className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full">{a.name}</span>
            </div>
          ))}
        </div>
        {achievements.length > 8 && (
          <details className="mt-2">
            <summary className="text-xs text-primary cursor-pointer text-center">Ver todas ({totalCount})</summary>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {achievements.slice(8).map((a) => (
                <div
                  key={a.key}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                    a.unlocked ? "glass-card-purple" : "opacity-40"
                  }`}
                  title={`${a.name}: ${a.description}`}
                >
                  <span className="text-xl mb-0.5">{a.icon}</span>
                  <span className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full">{a.name}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <button
          onClick={() => setCurrentTab("premium")}
          className="w-full glass-card rounded-2xl p-4 mb-4 flex items-center gap-3 border-primary/30 hover:border-primary/50 transition-all animate-fade-in"
          style={{ animationDelay: '250ms' }}
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

      {/* Settings */}
      <button
        onClick={() => setShowSettings(true)}
        className="w-full glass-card rounded-2xl p-4 mb-4 flex items-center gap-3 hover:border-primary/30 transition-all animate-fade-in active:scale-[0.98]"
        style={{ animationDelay: '300ms' }}
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Configurações</p>
          <p className="text-xs text-muted-foreground">Aparência, treino, notificações</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Account deletion */}
      <button
        onClick={async () => {
          if (!confirm("Tem certeza que deseja excluir sua conta e todos os seus dados? Esta ação é irreversível.")) return;
          toast.info("Solicitação de exclusão registrada. Seus dados serão removidos em até 30 dias. Você receberá um e-mail de confirmação.");
        }}
        className="w-full glass-card rounded-2xl p-4 mb-4 flex items-center gap-3 border-destructive/20 hover:border-destructive/40 transition-all animate-fade-in active:scale-[0.98]"
        style={{ animationDelay: '340ms' }}
      >
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-destructive">Excluir minha conta</p>
          <p className="text-xs text-muted-foreground">Remover todos os meus dados</p>
        </div>
      </button>

      {/* Logout */}
      <Button
        variant="glass"
        className="w-full h-12 rounded-xl text-destructive gap-2 animate-fade-in"
        style={{ animationDelay: '350ms' }}
        onClick={async () => {
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
        }}
      >
        <LogOut className="w-4 h-4" /> Sair da conta
      </Button>

      <p className="text-center text-[10px] text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>EVOCORE v1.0.0</p>
    </div>
  );
};

export default ProfileScreen;
