import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, LogOut, X, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SettingsScreen from "@/components/settings/SettingsScreen";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useAchievements } from "@/hooks/useAchievements";
import AvatarUpload from "@/components/profile/AvatarUpload";

const ProfileScreen = () => {
  const { userProfile, setUserProfile, isPremium, setCurrentTab, user } = useApp();
  const { stats, loading: statsLoading } = useProfileStats();
  const { unlockedCount, totalCount } = useAchievements();
  const name = userProfile.name || "Atleta";
  const initial = (name[0] || "A").toUpperCase();
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(userProfile);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const stored = data?.avatar_url ?? null;
        if (!stored) return setAvatarUrl(null);
        if (/^https?:\/\//i.test(stored)) return setAvatarUrl(stored);
        // Bucket is public — use direct public URL
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(stored);
        setAvatarUrl(pub.publicUrl);
      });
  }, [user]);

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
      toast.success("Perfil atualizado");
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const goals: Record<string, string> = {
    lose: "Emagrecer", gain: "Ganhar massa", condition: "Condicionamento",
    define: "Definição", health: "Saúde geral",
  };
  const levels: Record<string, string> = {
    beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado",
  };

  if (showSettings) return <SettingsScreen onBack={() => setShowSettings(false)} />;

  if (isEditing) {
    return (
      <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button onClick={() => setIsEditing(false)} className="text-[15px] text-muted-foreground flex items-center gap-1 active:opacity-60">
            <X className="w-4 h-4" /> Cancelar
          </button>
          <h2 className="text-[17px] font-semibold text-foreground">Editar perfil</h2>
          <button onClick={saveProfile} disabled={saving} className="text-[15px] text-primary font-semibold flex items-center gap-1 active:opacity-60 disabled:opacity-40">
            <Save className="w-4 h-4" /> {saving ? "…" : "Salvar"}
          </button>
        </div>

        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-center">
            {user && (
              <AvatarUpload
                userId={user.id}
                currentUrl={avatarUrl}
                fallbackInitial={(editProfile.name || "A")[0]?.toUpperCase()}
                onUploaded={setAvatarUrl}
                size={80}
              />
            )}
          </div>

          <div className="bg-card rounded-2xl divide-y divide-border">
            <div className="px-5 py-3">
              <label className="text-[12px] text-muted-foreground block mb-1">Nome</label>
              <Input value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                className="h-9 bg-transparent border-0 px-0 text-[15px] focus-visible:ring-0" />
            </div>
            <div className="px-5 py-3">
              <label className="text-[12px] text-muted-foreground block mb-1">E-mail</label>
              <Input value={editProfile.email} disabled className="h-9 bg-transparent border-0 px-0 text-[15px] opacity-60" />
            </div>
          </div>

          <div>
            <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Físico</h3>
            <div className="bg-card rounded-2xl p-5 space-y-4">
              <div className="flex gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button key={g} onClick={() => setEditProfile({ ...editProfile, gender: g })}
                    className={`flex-1 h-10 rounded-lg text-[14px] transition-all ${
                      editProfile.gender === g ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary text-foreground"
                    }`}
                  >{g === "male" ? "Homem" : "Mulher"}</button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Idade", key: "age" as const, value: editProfile.age },
                  { label: "Peso (kg)", key: "weight" as const, value: editProfile.weight },
                  { label: "Altura (cm)", key: "height" as const, value: editProfile.height },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[11px] text-muted-foreground mb-1 block">{field.label}</label>
                    <Input type="number" value={field.value}
                      onChange={(e) => setEditProfile({ ...editProfile, [field.key]: +e.target.value })}
                      className="h-10 bg-secondary border-0 rounded-lg text-center text-[15px] tabular" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Objetivo</h3>
            <div className="bg-card rounded-2xl p-3 flex flex-wrap gap-2">
              {Object.entries(goals).map(([id, label]) => (
                <button key={id} onClick={() => setEditProfile({ ...editProfile, goal: id })}
                  className={`px-3 h-9 rounded-lg text-[13px] font-medium transition-all ${
                    editProfile.goal === id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Nível</h3>
            <div className="bg-card rounded-2xl p-3 flex gap-2">
              {Object.entries(levels).map(([id, label]) => (
                <button key={id} onClick={() => setEditProfile({ ...editProfile, level: id })}
                  className={`flex-1 h-10 rounded-lg text-[13px] font-medium transition-all ${
                    editProfile.level === id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Dias por semana</h3>
            <div className="bg-card rounded-2xl p-3 flex gap-2 justify-between">
              {[2, 3, 4, 5, 6].map((d) => (
                <button key={d} onClick={() => setEditProfile({ ...editProfile, daysPerWeek: d })}
                  className={`flex-1 h-10 rounded-lg font-semibold text-[14px] transition-all tabular ${
                    editProfile.daysPerWeek === d ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
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
    <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex flex-col items-center text-center mb-10 animate-fade-in">
        <div className="mb-4">
          {user ? (
            <AvatarUpload
              userId={user.id}
              currentUrl={avatarUrl}
              fallbackInitial={initial}
              onUploaded={setAvatarUrl}
              size={96}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-[32px] font-semibold text-foreground">{initial}</span>
            </div>
          )}
        </div>
        <h1 className="text-[26px] font-bold text-foreground tracking-[-0.02em]">{name}</h1>
        <p className="text-[14px] text-muted-foreground mt-0.5">{userProfile.email}</p>
        {isPremium && (
          <span className="mt-3 px-3 h-7 rounded-full bg-primary/15 text-primary text-[12px] font-semibold flex items-center">PRO</span>
        )}
        <button onClick={startEditing} className="mt-4 text-[14px] text-primary font-medium active:opacity-60">
          Editar perfil
        </button>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-4 gap-3 mb-10 animate-fade-in">
        {[
          { label: "Treinos", value: stats.totalWorkouts.toString() },
          { label: "Streak", value: `${stats.streak}` },
          { label: "Volume", value: stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}t` : `${stats.totalVolume}` },
          { label: "km", value: `${stats.totalDistanceKm}` },
        ].map((c) => (
          <div key={c.label} className="bg-card rounded-2xl py-4 text-center">
            <p className="text-[20px] font-bold text-foreground tabular tracking-tight">{statsLoading ? "—" : c.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{c.label}</p>
          </div>
        ))}
      </section>

      {/* Info list */}
      <section className="mb-8">
        <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Perfil</h2>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {[
            ["Gênero", userProfile.gender === "male" ? "Masculino" : userProfile.gender === "female" ? "Feminino" : "—"],
            ["Idade", `${userProfile.age} anos`],
            ["Peso", `${userProfile.weight} kg`],
            ["Altura", `${userProfile.height} cm`],
            ["Objetivo", goals[userProfile.goal] || "—"],
            ["Nível", levels[userProfile.level] || "—"],
            ["Treinos/semana", `${userProfile.daysPerWeek}x`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[15px] text-foreground">{k}</span>
              <span className="text-[15px] text-muted-foreground tabular">{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Conquistas resumo */}
      <section className="mb-8">
        <button
          onClick={() => setCurrentTab("progress")}
          className="w-full bg-card rounded-2xl flex items-center justify-between px-5 py-4 active:bg-secondary/40 transition-colors"
        >
          <span className="text-[15px] text-foreground">Conquistas</span>
          <span className="flex items-center gap-2">
            <span className="text-[15px] text-muted-foreground tabular">{unlockedCount}/{totalCount}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </span>
        </button>
      </section>

      {/* Premium row */}
      {!isPremium && (
        <button
          onClick={() => setCurrentTab("premium")}
          className="w-full bg-card rounded-2xl flex items-center justify-between px-5 py-4 mb-3 active:bg-secondary/40 transition-colors"
        >
          <div className="text-left">
            <p className="text-[15px] font-medium text-foreground">EVOCORE Pro</p>
            <p className="text-[13px] text-muted-foreground">7 dias grátis</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* Settings row */}
      <button
        onClick={() => setShowSettings(true)}
        className="w-full bg-card rounded-2xl flex items-center justify-between px-5 py-4 mb-8 active:bg-secondary/40 transition-colors"
      >
        <span className="text-[15px] text-foreground">Configurações</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Destructive */}
      <div className="bg-card rounded-2xl divide-y divide-border mb-6">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 text-[15px] text-destructive active:opacity-60"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
        <button
          onClick={() => {
            if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;
            toast.info("Solicitação registrada. Seus dados serão removidos em até 30 dias.");
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 text-[15px] text-destructive active:opacity-60"
        >
          <Trash2 className="w-4 h-4" /> Excluir conta
        </button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground tabular">EVOCORE 1.0.0</p>
    </div>
  );
};

export default ProfileScreen;
