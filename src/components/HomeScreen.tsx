import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Zap, Crown } from "lucide-react";
import evoaiLogo from "@/assets/evoai-logo.png";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
  // All days start as false - real data should come from DB
  const activeToday = [false, false, false, false, false, false, false];

  const motivations = [
    "Disciplina é escolher entre o que você quer agora e o que você quer mais.",
    "Cada repetição te aproxima da melhor versão de si.",
    "O treino de hoje é a conquista de amanhã.",
    "Sua única competição é quem você era ontem.",
  ];
  const todayMotivation = motivations[new Date().getDate() % motivations.length];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <p className="text-muted-foreground text-sm">{greeting} 👋</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <button
              onClick={() => setCurrentTab("premium")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full gradient-primary text-primary-foreground text-xs font-semibold active:scale-95 transition-transform"
            >
              <Crown className="w-3 h-3" /> PRO
            </button>
          )}
          <button
            onClick={() => setCurrentTab("profile")}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="text-sm font-bold text-foreground">{name[0]?.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Button */}
      <button
        onClick={() => setCurrentTab("ai")}
        className="w-full glass-card-purple rounded-2xl p-4 mb-4 flex items-center gap-3 hover:border-primary/40 active:scale-[0.98] transition-all animate-fade-in"
      >
        <div className="w-12 h-12 rounded-2xl overflow-hidden animate-pulse-glow">
          <img src={evoaiLogo} alt="EvoAI" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">EvoAI — Seu Personal</p>
          <p className="text-xs text-muted-foreground">Converse com sua IA para treinos e nutrição personalizada</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-xs">→</span>
        </div>
      </button>

      {/* Streak Widget */}
      <div className="glass-card-purple rounded-2xl p-4 mb-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium text-foreground">
              {streak > 0 ? `${streak} dia${streak > 1 ? "s" : ""} consecutivo${streak > 1 ? "s" : ""}` : "Comece sua streak!"}
            </span>
            {streak >= 3 && <span className="text-lg">🔥</span>}
          </div>
          <span className="text-xs text-muted-foreground font-medium">{activeWeek.filter(Boolean).length}/7 dias</span>
        </div>
        <div className="flex justify-between">
          {weekDayLabels.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                activeWeek[i]
                  ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/60 text-muted-foreground"
              }`}>
                {activeWeek[i] ? <Flame className="w-4 h-4" /> : ""}
              </div>
            </div>
          ))}
        </div>
        {trainedToday && (
          <p className="text-xs text-primary font-medium mt-2 text-center animate-fade-in">✅ Você já treinou hoje!</p>
        )}
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <button onClick={() => setCurrentTab("training")} className="glass-card-purple rounded-2xl p-4 text-left active:scale-[0.97] transition-transform">
          <span className="text-2xl mb-2 block">🏋️</span>
          <p className="text-sm font-semibold text-foreground">Treino</p>
          <p className="text-xs text-muted-foreground">Monte seu plano com IA</p>
        </button>
        <button onClick={() => setCurrentTab("running")} className="glass-card-blue rounded-2xl p-4 text-left active:scale-[0.97] transition-transform">
          <span className="text-2xl mb-2 block">🏃</span>
          <p className="text-sm font-semibold text-foreground">Corrida</p>
          <p className="text-xs text-muted-foreground">Inicie sua atividade</p>
        </button>
        <button onClick={() => setCurrentTab("nutrition")} className="glass-card-green rounded-2xl p-4 text-left active:scale-[0.97] transition-transform">
          <span className="text-2xl mb-2 block">🥗</span>
          <p className="text-sm font-semibold text-foreground">Nutrição</p>
          <p className="text-xs text-muted-foreground">Dieta personalizada</p>
        </button>
        <button onClick={() => setCurrentTab("progress")} className="glass-card rounded-2xl p-4 text-left active:scale-[0.97] transition-transform">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-sm font-semibold text-foreground">Progresso</p>
          <p className="text-xs text-muted-foreground">Acompanhe evolução</p>
        </button>
      </div>

      {/* Motivation */}
      <div className="glass-card-purple rounded-2xl p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">Motivação do dia</span>
        </div>
        <p className="text-foreground text-sm font-medium italic">
          "{todayMotivation}"
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
