import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import evoaiLogo from "@/assets/evoai-logo.png";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
  const today = new Date().getDay();
  // Shift so Monday=0
  const activeToday = [true, true, false, true, true, false, false];

  const macros = [
    { label: "Proteína", current: 128, target: 180, color: "from-primary to-blue-500" },
    { label: "Carboidrato", current: 210, target: 300, color: "from-blue-400 to-cyan-400" },
    { label: "Gordura", current: 45, target: 70, color: "from-accent to-emerald-400" },
  ];

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

      {/* Weekly streak */}
      <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Semana atual</span>
          <span className="text-xs text-primary font-medium">{activeToday.filter(Boolean).length}/7 dias ✅</span>
        </div>
        <div className="flex justify-between">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                activeToday[i]
                  ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/60 text-muted-foreground"
              }`}>
                {activeToday[i] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-semibold text-foreground text-sm mb-3">Macros do dia</h3>
        <div className="space-y-3">
          {macros.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="text-foreground font-medium">{m.current}g / {m.target}g</span>
              </div>
              <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                  style={{ width: `${Math.min((m.current / m.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
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
