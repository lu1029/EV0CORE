import React from "react";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const { streak, trainedToday, weekDays: activeWeek } = useStreak();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const weekDayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

  const tiles = [
    { id: "training", label: "Treino", sub: "Plano com IA" },
    { id: "running", label: "Corrida", sub: "Iniciar atividade" },
    { id: "nutrition", label: "Nutrição", sub: "Dieta personalizada" },
    { id: "progress", label: "Progresso", sub: "Sua evolução" },
  ] as const;

  return (
    <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-end justify-between mb-10 animate-fade-in">
        <div>
          <p className="text-[13px] text-muted-foreground tracking-tight">{greeting}</p>
          <h1 className="text-[32px] leading-tight font-bold text-foreground tracking-[-0.03em] mt-0.5">{name}</h1>
        </div>
        <button
          onClick={() => setCurrentTab("profile")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="text-sm font-semibold text-foreground">{name[0]?.toUpperCase()}</span>
        </button>
      </header>

      {/* EvoAI row */}
      <button
        onClick={() => setCurrentTab("ai")}
        className="w-full flex items-center justify-between py-4 mb-2 active:opacity-60 transition-opacity animate-fade-in"
      >
        <div className="text-left">
          <p className="text-[17px] font-semibold text-foreground tracking-tight">EvoAI</p>
          <p className="text-[13px] text-muted-foreground">Seu personal trainer</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
      <div className="h-px bg-border mb-8" />

      {/* Streak card */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Esta semana</h2>
          <span className="text-[13px] text-muted-foreground tabular">
            {activeWeek.filter(Boolean).length}/7
          </span>
        </div>
        <div className="bg-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[15px] font-medium text-foreground">
              {streak > 0 ? `${streak} dia${streak > 1 ? "s" : ""}` : "Sem sequência"}
            </span>
            {trainedToday && <span className="text-[12px] text-primary ml-auto">Treinado hoje</span>}
          </div>
          <div className="flex justify-between">
            {weekDayLabels.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-muted-foreground tabular">{d}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    activeWeek[i] ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  {activeWeek[i] && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access — list rows, Apple-like */}
      <section className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3">Atividades</h2>
        <div className="bg-card rounded-2xl overflow-hidden">
          {tiles.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className="w-full flex items-center justify-between px-5 py-4 active:bg-secondary/60 transition-colors"
            >
              <div className="text-left">
                <p className="text-[16px] font-medium text-foreground">{t.label}</p>
                <p className="text-[13px] text-muted-foreground">{t.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              {i < tiles.length - 1 && (
                <div className="absolute left-5 right-0 bottom-0 h-px bg-border pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </section>

      {!isPremium && (
        <button
          onClick={() => setCurrentTab("premium")}
          className="w-full mt-8 py-4 flex items-center justify-between animate-fade-in active:opacity-60 transition-opacity"
          style={{ animationDelay: "180ms" }}
        >
          <div className="text-left">
            <p className="text-[15px] font-medium text-foreground">EVOCORE Pro</p>
            <p className="text-[13px] text-muted-foreground">Desbloqueie a experiência completa</p>
          </div>
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      )}
    </div>
  );
};

export default HomeScreen;
