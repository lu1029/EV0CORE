import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dumbbell, ChevronRight, Clock, Flame, Trophy, Plus, Play, Check, Timer, Home, Crown } from "lucide-react";
import PremiumGate from "@/components/PremiumGate";
import { Button } from "@/components/ui/button";

const muscleGroups = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdômen"];

const workoutPlans = [
  { id: "abc", name: "ABC", desc: "Peito/Costas/Pernas", days: 3, level: "Iniciante" },
  { id: "abcd", name: "ABCD", desc: "Peito/Costas/Ombros/Pernas", days: 4, level: "Intermediário" },
  { id: "ppl", name: "Push Pull Legs", desc: "Empurrar/Puxar/Pernas", days: 6, level: "Avançado" },
  { id: "full", name: "Full Body", desc: "Corpo inteiro", days: 3, level: "Todos" },
];

const todayExercises = [
  { name: "Supino reto", sets: 4, reps: "8-12", weight: "60kg", done: true },
  { name: "Supino inclinado", sets: 4, reps: "10-12", weight: "50kg", done: true },
  { name: "Crossover", sets: 3, reps: "12-15", weight: "20kg", done: false },
  { name: "Tríceps corda", sets: 4, reps: "12-15", weight: "25kg", done: false },
  { name: "Tríceps testa", sets: 3, reps: "10-12", weight: "15kg", done: false },
  { name: "Mergulho", sets: 3, reps: "Até falha", weight: "Corpo", done: false },
];

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const [tab, setTab] = useState<"gym" | "home">("gym");
  const [showWorkout, setShowWorkout] = useState(false);
  const [restTimer, setRestTimer] = useState(false);
  const [restTime, setRestTime] = useState(90);

  const homeWorkouts = [
    { name: "HIIT Express", duration: "20 min", level: "Intermediário", icon: "🔥" },
    { name: "Core Power", duration: "15 min", level: "Todos", icon: "💪" },
    { name: "Alongamento", duration: "10 min", level: "Todos", icon: "🧘" },
    { name: "Full Body", duration: "30 min", level: "Iniciante", icon: "⚡" },
    { name: "Glúteos", duration: "25 min", level: "Intermediário", icon: "🍑" },
    { name: "Cardio em casa", duration: "20 min", level: "Todos", icon: "❤️" },
  ];

  if (showWorkout) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowWorkout(false)} className="text-muted-foreground text-sm">← Voltar</button>
          <span className="text-xs text-primary font-medium">2/6 concluídos</span>
        </div>

        <h2 className="text-xl font-heading font-bold text-foreground mb-1">Peito + Tríceps</h2>
        <p className="text-sm text-muted-foreground mb-6">Treino A • {userProfile.gender === "female" ? "Feminino" : "Masculino"}</p>

        {/* Rest timer */}
        {restTimer && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Descanso</p>
                <p className="text-2xl font-bold text-foreground font-heading">{Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, "0")}</p>
              </div>
            </div>
            <Button variant="glass" size="sm" onClick={() => setRestTimer(false)}>Pular</Button>
          </div>
        )}

        <div className="space-y-3">
          {todayExercises.map((ex, i) => (
            <div
              key={i}
              className={`bg-card border rounded-2xl p-4 transition-all ${
                ex.done ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    ex.done ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {ex.done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.sets}x{ex.reps} • {ex.weight}</p>
                  </div>
                </div>
                {!ex.done && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => setRestTimer(true)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="hero" className="w-full h-12 rounded-xl mt-6 text-base">
          Concluir treino ✅
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Treino</h1>

      {/* Tab switch */}
      <div className="flex bg-secondary rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab("gym")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "gym" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Academia
        </button>
        <button
          onClick={() => setTab("home")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "home" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Home className="w-4 h-4" /> Em casa
        </button>
      </div>

      {tab === "gym" ? (
        <div className="animate-fade-in">
          {/* Today */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">Treino do dia</h3>
                <p className="text-xs text-muted-foreground">Peito + Tríceps • Treino A</p>
              </div>
              <Button variant="hero" size="sm" className="rounded-xl gap-1" onClick={() => setShowWorkout(true)}>
                Iniciar <Play className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> 6 exercícios</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~45 min</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> ~350 kcal</span>
            </div>
          </div>

          {/* Plans */}
          <h3 className="font-semibold text-foreground mb-3">Planos de treino</h3>
          <div className="space-y-3 mb-6">
            {workoutPlans.map((p) => {
              const isAdvanced = p.id === "ppl" || p.id === "abcd";
              const card = (
                <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      {p.name}
                      {isAdvanced && <Crown className="w-3 h-3 text-primary" />}
                    </h4>
                    <p className="text-xs text-muted-foreground">{p.desc} • {p.days}x/semana • {p.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              );
              if (isAdvanced) {
                return <PremiumGate key={p.id} feature="planos avançados">{card}</PremiumGate>;
              }
              return card;
            })}
          </div>

          {/* Muscle groups */}
          <h3 className="font-semibold text-foreground mb-3">Por grupo muscular</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {muscleGroups.map((g) => (
              <div key={g} className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-all cursor-pointer">
                <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-foreground font-medium">{g}</p>
              </div>
            ))}
          </div>

          {/* Records */}
          <h3 className="font-semibold text-foreground mb-3">Recordes pessoais 🏆</h3>
          <div className="space-y-2">
            {[
              { name: "Supino reto", record: "80kg", date: "12 Abr" },
              { name: "Agachamento", record: "120kg", date: "8 Abr" },
              { name: "Terra", record: "140kg", date: "5 Abr" },
            ].map((r) => (
              <div key={r.name} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-foreground">{r.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{r.record}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {homeWorkouts.map((w) => (
              <div key={w.name} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer">
                <span className="text-2xl mb-2 block">{w.icon}</span>
                <h4 className="font-semibold text-foreground text-sm">{w.name}</h4>
                <p className="text-xs text-muted-foreground">{w.duration} • {w.level}</p>
                <Button variant="hero" size="sm" className="mt-3 w-full rounded-lg text-xs">
                  Começar
                </Button>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3">Filtrar por</h3>
            <div className="flex flex-wrap gap-2">
              {["Sem equipamento", "Com halteres", "10-15 min", "20-30 min", "Iniciante", "Avançado"].map((f) => (
                <span key={f} className="bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-full border border-border">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingScreen;
