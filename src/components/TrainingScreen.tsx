import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Dumbbell, ChevronRight, Play, Crown, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumGate from "@/components/PremiumGate";
import ActiveWorkout from "./training/ActiveWorkout";
import { exerciseDB, workoutPlans, homeWorkouts } from "./training/exerciseData";

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const [tab, setTab] = useState<"gym" | "home">("gym");
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<any[]>([]);

  const workoutNames = Object.keys(exerciseDB);
  const todayIndex = new Date().getDay() % workoutNames.length;
  const todayWorkout = workoutNames[todayIndex];
  const todayExercises = exerciseDB[todayWorkout];

  const startGymWorkout = (name: string) => {
    setActiveExercises(exerciseDB[name] || []);
    setActiveWorkout(name);
  };

  const startHomeWorkout = (workout: typeof homeWorkouts[0]) => {
    setActiveExercises(workout.exercises);
    setActiveWorkout(workout.name);
  };

  if (activeWorkout) {
    return (
      <ActiveWorkout
        workoutName={activeWorkout}
        exercises={activeExercises}
        onBack={() => { setActiveWorkout(null); setActiveExercises([]); }}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6 animate-fade-in">Treino</h1>

      {/* Tab switch */}
      <div className="flex glass-card rounded-2xl p-1 mb-6 animate-fade-in">
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
        <div className="animate-fade-in space-y-6">
          {/* Today's workout hero card */}
          <div className="rounded-3xl glass-card-purple p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-[0.06] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Treino do dia</p>
            <h3 className="font-heading font-bold text-foreground text-xl mb-1">{todayWorkout}</h3>
            <p className="text-xs text-muted-foreground mb-4">{todayExercises.length} exercícios • ~{todayExercises.length * 7} min</p>

            {/* Exercise preview */}
            <div className="space-y-1.5 mb-4">
              {todayExercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center text-sm border border-border/30">
                    {ex.emoji}
                  </div>
                  <p className="text-sm text-foreground flex-1 truncate">{ex.name}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>{ex.sets}×{ex.reps}</span>
                    {ex.weight !== "Corpo" && (
                      <span className="text-primary font-semibold">{ex.weight}</span>
                    )}
                  </div>
                </div>
              ))}
              {todayExercises.length > 4 && (
                <p className="text-xs text-muted-foreground text-center pt-1">+{todayExercises.length - 4} mais</p>
              )}
            </div>

            <Button
              variant="hero"
              className="w-full rounded-2xl h-12 text-sm gap-2"
              onClick={() => startGymWorkout(todayWorkout)}
            >
              <Play className="w-4 h-4" /> Iniciar Treino
            </Button>
          </div>

          {/* All workouts */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Todos os treinos</h3>
            <div className="space-y-2">
              {Object.entries(exerciseDB).map(([name, exercises]) => (
                <button
                  key={name}
                  onClick={() => startGymWorkout(name)}
                  className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center text-xl border border-border/30">
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
          </div>

          {/* Plans */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Planos de treino</h3>
            <div className="space-y-2">
              {workoutPlans.map((p) => {
                const card = (
                  <div className="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all">
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
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {homeWorkouts.map((w) => (
              <div key={w.name} className="bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer">
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
                <span key={f} className="bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-full border border-border/50">
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
