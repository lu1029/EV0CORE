import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Flame, Droplets, Dumbbell, MapPin, ChevronRight, Zap, Crown, TrendingUp, Clock, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
  const activeToday = [true, true, false, true, true, false, false];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
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
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border/50 active:scale-95 transition-transform"
          >
            <span className="text-sm font-bold text-foreground">{name[0]?.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Weekly streak */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Semana atual</span>
          <span className="text-xs text-primary font-medium">3/5 dias ✅</span>
        </div>
        <div className="flex justify-between">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                activeToday[i]
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {activeToday[i] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: Flame, value: "460", label: "Calorias", iconColor: "text-orange-400" },
          { icon: Droplets, value: "1.5L", label: "Água", iconColor: "text-blue-400" },
          { icon: TrendingUp, value: "128g", label: "Proteína", iconColor: "text-primary" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <stat.icon className={`w-5 h-5 ${stat.iconColor} mx-auto mb-1`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's workout */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Peito + Tríceps</h3>
              <p className="text-xs text-muted-foreground">7 exercícios • ~45min</p>
            </div>
          </div>
          <Button variant="hero" size="sm" className="rounded-xl gap-1 active:scale-95 transition-transform" onClick={() => setCurrentTab("training")}>
            Iniciar <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {["Supino reto", "Supino inclinado", "Crossover", "Fly máquina", "Tríceps corda"].map((ex) => (
            <div key={ex} className="bg-secondary rounded-lg px-3 py-2 text-xs text-foreground whitespace-nowrap border border-border/30">
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setCurrentTab("running")}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Corrida</p>
            <p className="text-[10px] text-muted-foreground">Iniciar atividade</p>
          </div>
        </button>
        <button
          onClick={() => setCurrentTab("nutrition")}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Refeição</p>
            <p className="text-[10px] text-muted-foreground">Registrar</p>
          </div>
        </button>
      </div>

      {/* Macros */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-3">Macros do dia</h3>
        <div className="space-y-3">
          {[
            { label: "Proteína", current: 128, target: 180, color: "bg-primary" },
            { label: "Carboidrato", current: 210, target: 300, color: "bg-blue-400" },
            { label: "Gordura", current: 45, target: 70, color: "bg-orange-400" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="text-foreground font-medium">{m.current}g / {m.target}g</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-700`}
                  style={{ width: `${(m.current / m.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's summary */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Resumo do dia</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Tempo ativo</span>
            </div>
            <p className="text-lg font-bold text-foreground">1h 15min</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Meta diária</span>
            </div>
            <p className="text-lg font-bold text-foreground">72%</p>
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-card border border-border rounded-2xl p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">Motivação do dia</span>
        </div>
        <p className="text-foreground text-sm font-medium italic">
          "Disciplina é escolher entre o que você quer agora e o que você quer mais."
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
