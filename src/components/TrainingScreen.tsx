import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Dumbbell, ChevronRight, Clock, Flame, Trophy, Play, Check, Timer,
  Home, Crown, ChevronDown, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumGate from "@/components/PremiumGate";

// Exercise database with muscle group icons
const exerciseDB: Record<string, { name: string; muscle: string; emoji: string; sets: number; reps: string; weight: string }[]> = {
  "Peito + Tríceps": [
    { name: "Supino reto com barra", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "8-12", weight: "60kg" },
    { name: "Supino inclinado halteres", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "10-12", weight: "24kg" },
    { name: "Crossover", muscle: "Peito", emoji: "🔄", sets: 3, reps: "12-15", weight: "20kg" },
    { name: "Fly máquina", muscle: "Peito", emoji: "🦋", sets: 3, reps: "12-15", weight: "40kg" },
    { name: "Tríceps corda", muscle: "Tríceps", emoji: "💪", sets: 4, reps: "12-15", weight: "25kg" },
    { name: "Tríceps testa", muscle: "Tríceps", emoji: "💪", sets: 3, reps: "10-12", weight: "15kg" },
    { name: "Mergulho", muscle: "Tríceps", emoji: "⬇️", sets: 3, reps: "Falha", weight: "Corpo" },
  ],
  "Costas + Bíceps": [
    { name: "Puxada frontal", muscle: "Costas", emoji: "🔻", sets: 4, reps: "10-12", weight: "55kg" },
    { name: "Remada curvada", muscle: "Costas", emoji: "🚣", sets: 4, reps: "8-10", weight: "50kg" },
    { name: "Remada unilateral", muscle: "Costas", emoji: "🚣", sets: 3, reps: "10-12", weight: "22kg" },
    { name: "Pulldown corda", muscle: "Costas", emoji: "🔻", sets: 3, reps: "12-15", weight: "30kg" },
    { name: "Rosca direta barra", muscle: "Bíceps", emoji: "💪", sets: 4, reps: "10-12", weight: "25kg" },
    { name: "Rosca martelo", muscle: "Bíceps", emoji: "🔨", sets: 3, reps: "12", weight: "14kg" },
    { name: "Rosca concentrada", muscle: "Bíceps", emoji: "💪", sets: 3, reps: "12", weight: "10kg" },
  ],
  "Pernas + Ombros": [
    { name: "Agachamento livre", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "8-10", weight: "80kg" },
    { name: "Leg press 45°", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "10-12", weight: "200kg" },
    { name: "Cadeira extensora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "50kg" },
    { name: "Mesa flexora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "35kg" },
    { name: "Desenvolvimento halteres", muscle: "Ombros", emoji: "🏋️", sets: 4, reps: "10-12", weight: "16kg" },
    { name: "Elevação lateral", muscle: "Ombros", emoji: "↔️", sets: 4, reps: "12-15", weight: "10kg" },
    { name: "Encolhimento", muscle: "Trapézio", emoji: "⬆️", sets: 3, reps: "12-15", weight: "24kg" },
  ],
};

const workoutPlans = [
  { id: "abc", name: "ABC", desc: "3 divisões clássicas", days: 3, level: "Iniciante", premium: false },
  { id: "abcd", name: "ABCD", desc: "4 divisões otimizadas", days: 4, level: "Intermediário", premium: true },
  { id: "ppl", name: "Push Pull Legs", desc: "Empurrar/Puxar/Pernas", days: 6, level: "Avançado", premium: true },
  { id: "full", name: "Full Body", desc: "Corpo inteiro", days: 3, level: "Todos", premium: false },
];

const homeWorkouts = [
  { name: "HIIT Express", duration: "20 min", level: "Intermediário", icon: "🔥" },
  { name: "Core Power", duration: "15 min", level: "Todos", icon: "💪" },
  { name: "Alongamento", duration: "10 min", level: "Todos", icon: "🧘" },
  { name: "Full Body", duration: "30 min", level: "Iniciante", icon: "⚡" },
  { name: "Glúteos", duration: "25 min", level: "Intermediário", icon: "🍑" },
  { name: "Cardio em casa", duration: "20 min", level: "Todos", icon: "❤️" },
];

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const [tab, setTab] = useState<"gym" | "home">("gym");
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [restTimer, setRestTimer] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  // Determine today's workout
  const workoutNames = Object.keys(exerciseDB);
  const todayIndex = new Date().getDay() % workoutNames.length;
  const todayWorkout = workoutNames[todayIndex];
  const todayExercises = exerciseDB[todayWorkout];

  const toggleComplete = (idx: number) => {
    const next = new Set(completedExercises);
    if (next.has(idx)) next.delete(idx);
    else {
      next.add(idx);
      setRestTimer(true);
      setRestTime(90);
    }
    setCompletedExercises(next);
  };

  const completedCount = completedExercises.size;
  const totalCount = todayExercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Active workout view
  if (activeWorkout) {
    const exercises = exerciseDB[activeWorkout] || [];

    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => { setActiveWorkout(null); setCompletedExercises(new Set()); }} className="text-muted-foreground text-sm flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
          </button>
          <span className="text-xs font-medium text-primary">{completedCount}/{totalCount}</span>
        </div>

        {/* Workout title */}
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">{activeWorkout}</h2>
        <p className="text-sm text-muted-foreground mb-4">{exercises.length} exercícios • ~{exercises.length * 7} min</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Rest timer */}
        {restTimer && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Descanso</p>
                <p className="text-2xl font-bold text-foreground font-heading">
                  {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" className="rounded-xl text-xs" onClick={() => setRestTimer(false)}>
                Pular
              </Button>
            </div>
          </div>
        )}

        {/* Exercise list - Reft style */}
        <div className="space-y-2">
          {exercises.map((ex, i) => {
            const isDone = completedExercises.has(i);
            const isExpanded = expandedExercise === i;

            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isDone
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedExercise(isExpanded ? null : i)}
                >
                  {/* Number / Check */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isDone ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : i + 1}
                  </div>

                  {/* Exercise icon */}
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
                    {ex.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {ex.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-primary font-medium">SETS {ex.sets}</span>
                      <span>•</span>
                      <span>REPS {ex.reps}</span>
                      {ex.weight !== "Corpo" && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-semibold">{ex.weight}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Grupo muscular</p>
                      <p className="text-sm font-medium text-foreground">{ex.muscle}</p>
                    </div>

                    {/* Sets tracker */}
                    <div className="space-y-2 mb-3">
                      {Array.from({ length: ex.sets }).map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2">
                          <span className="text-xs text-muted-foreground w-12">Set {setIdx + 1}</span>
                          <span className="text-xs text-foreground flex-1 text-center">{ex.reps} reps</span>
                          <span className="text-xs text-primary font-medium">{ex.weight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={isDone ? "glass" : "hero"}
                        size="sm"
                        className="flex-1 rounded-xl gap-1"
                        onClick={(e) => { e.stopPropagation(); toggleComplete(i); }}
                      >
                        {isDone ? (
                          <><RotateCcw className="w-3 h-3" /> Refazer</>
                        ) : (
                          <><Check className="w-3 h-3" /> Concluir</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete workout button */}
        {completedCount === totalCount && totalCount > 0 && (
          <Button
            variant="hero"
            className="w-full h-14 rounded-2xl mt-6 text-base animate-scale-in"
            onClick={() => { setActiveWorkout(null); setCompletedExercises(new Set()); }}
          >
            Concluir treino ✅
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6 animate-fade-in">Treino</h1>

      {/* Tab switch */}
      <div className="flex bg-secondary rounded-2xl p-1 mb-6 animate-fade-in">
        <button
          onClick={() => setTab("gym")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "gym" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Academia
        </button>
        <button
          onClick={() => setTab("home")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "home" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Home className="w-4 h-4" /> Em casa
        </button>
      </div>

      {tab === "gym" ? (
        <div className="animate-fade-in">
          {/* Today's workout card */}
          <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-1">Treino do dia</p>
                <h3 className="font-heading font-bold text-foreground text-lg">{todayWorkout}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{todayExercises.length} exercícios • ~{todayExercises.length * 7} min</p>
              </div>
              <Button
                variant="hero"
                size="sm"
                className="rounded-xl gap-1.5 h-10"
                onClick={() => setActiveWorkout(todayWorkout)}
              >
                <Play className="w-4 h-4" /> Iniciar
              </Button>
            </div>

            {/* Exercise preview - Reft style */}
            <div className="space-y-1.5 mt-4">
              {todayExercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm">
                    {ex.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{ex.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>SETS <span className="text-foreground font-medium">{ex.sets}</span></span>
                    <span>·</span>
                    <span>REPS <span className="text-foreground font-medium">{ex.reps}</span></span>
                    {ex.weight !== "Corpo" && (
                      <>
                        <span>·</span>
                        <span className="text-primary font-semibold">{ex.weight}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {todayExercises.length > 4 && (
                <p className="text-xs text-muted-foreground text-center pt-1">+{todayExercises.length - 4} exercícios</p>
              )}
            </div>
          </div>

          {/* All workouts */}
          <h3 className="font-semibold text-foreground mb-3 text-sm">Todos os treinos</h3>
          <div className="space-y-2 mb-6">
            {Object.entries(exerciseDB).map(([name, exercises]) => (
              <button
                key={name}
                onClick={() => setActiveWorkout(name)}
                className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                  {exercises[0].emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">{name}</h4>
                  <p className="text-xs text-muted-foreground">{exercises.length} exercícios • ~{exercises.length * 7} min</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          {/* Plans */}
          <h3 className="font-semibold text-foreground mb-3 text-sm">Planos de treino</h3>
          <div className="space-y-2 mb-6">
            {workoutPlans.map((p) => {
              const card = (
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      {p.name}
                      {p.premium && <Crown className="w-3 h-3 text-primary" />}
                    </h4>
                    <p className="text-xs text-muted-foreground">{p.desc} • {p.days}x/semana • {p.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              );
              if (p.premium) {
                return <PremiumGate key={p.id} feature="planos avançados">{card}</PremiumGate>;
              }
              return <React.Fragment key={p.id}>{card}</React.Fragment>;
            })}
          </div>

          {/* Records */}
          <h3 className="font-semibold text-foreground mb-3 text-sm">Recordes pessoais 🏆</h3>
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
                <Button variant="hero" size="sm" className="mt-3 w-full rounded-xl text-xs">
                  Começar
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Filtrar por</h3>
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
