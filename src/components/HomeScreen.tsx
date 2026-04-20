import React from "react";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, Flame, Dumbbell, Apple, MapPin, TrendingUp } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const { streak, trainedToday, weekDays: activeWeek } = useStreak();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const weekDayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

  const tiles = [
    { id: "training", label: "Treino", sub: "Plano com IA",        icon: Dumbbell,    tint: "from-violet-500/25 to-violet-500/5",  ring: "text-violet-400" },
    { id: "running",  label: "Corrida", sub: "Iniciar atividade",  icon: MapPin,      tint: "from-sky-500/25 to-sky-500/5",         ring: "text-sky-400" },
    { id: "nutrition",label: "Nutrição",sub: "Dieta personalizada",icon: Apple,       tint: "from-emerald-500/25 to-emerald-500/5", ring: "text-emerald-400" },
    { id: "progress", label: "Progresso",sub: "Sua evolução",      icon: TrendingUp,  tint: "from-amber-500/25 to-amber-500/5",     ring: "text-amber-400" },
  ] as const;

  return (
    <div className="pb-28 px-5 pt-10 max-w-lg mx-auto">
      {/* Big centered greeting — Apple Fitness style */}
      <header className="text-center mb-12 animate-fade-in">
        <p className="text-[15px] text-muted-foreground tracking-tight mb-2">{greeting},</p>
        <h1 className="text-[44px] leading-[1.05] font-bold text-foreground tracking-[-0.04em]">
          {name}
        </h1>
        {trainedToday && (
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-primary/10 animate-scale-in">
            <span className="w-1.5 h-1.5 rounded-full accent-dot" />
            <span className="text-[12px] font-medium text-primary">Treinado hoje</span>
          </div>
        )}
      </header>

      {/* Streak card with animated rings */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="flex items-baseline justify-between mb-4 px-1">
          <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Esta semana</h2>
          <span className="text-[13px] text-muted-foreground tabular">
            {activeWeek.filter(Boolean).length}/7
          </span>
        </div>
        <div className="bg-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Flame className={`w-4 h-4 transition-colors ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[15px] font-medium text-foreground">
              {streak > 0 ? `${streak} dia${streak > 1 ? "s" : ""} de sequência` : "Sem sequência"}
            </span>
          </div>
          <div className="flex justify-between">
            {weekDayLabels.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="text-[11px] text-muted-foreground tabular">{d}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeWeek[i] ? "bg-primary scale-100" : "bg-secondary scale-90"
                  }`}
                >
                  {activeWeek[i] && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access — vibrant tiles */}
      <section className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3 px-1">Atividades</h2>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`group relative overflow-hidden bg-card rounded-2xl p-4 text-left active:scale-[0.97] hover:scale-[1.01] transition-transform duration-200 animate-fade-in border border-border/40`}
              style={{ animationDelay: `${140 + i * 60}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${t.tint} opacity-80 pointer-events-none`} />
              <div className="relative flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl bg-background/40 backdrop-blur-sm flex items-center justify-center shadow-sm`}>
                  <t.icon className={`w-5 h-5 ${t.ring}`} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-foreground tracking-tight">{t.label}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{t.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {!isPremium && (
        <button
          onClick={() => setCurrentTab("premium")}
          className="w-full mt-6 py-4 px-5 rounded-2xl bg-card flex items-center gap-3 animate-fade-in active:bg-secondary/40 transition-colors"
          style={{ animationDelay: "300ms" }}
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[13px] font-bold text-primary">Pro</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-[15px] font-medium text-foreground">EVOCORE Pro</p>
            <p className="text-[13px] text-muted-foreground">Desbloqueie tudo</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  );
};

export default HomeScreen;
