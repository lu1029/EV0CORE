import React, { useState, useEffect } from "react";
import { ChevronLeft, Trophy, Play, Flame } from "lucide-react";
import ExerciseCard from "./ExerciseCard";
import RestTimerModal from "./RestTimerModal";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Exercise } from "./ExerciseCard";

interface ActiveWorkoutProps {
  workoutName: string;
  exercises: Exercise[];
  onBack: () => void;
  workoutType?: "gym" | "home";
}

type WorkoutPhase = "preview" | "active" | "finished";

const ActiveWorkout = ({ workoutName, exercises, onBack, workoutType = "gym" }: ActiveWorkoutProps) => {
  const { user } = useApp();
  const [phase, setPhase] = useState<WorkoutPhase>("preview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<number, Set<number>>>({});
  const [showRest, setShowRest] = useState(false);
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (phase !== "active") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 60000)), 10000);
    return () => clearInterval(t);
  }, [startTime, phase]);

  const currentExercise = exercises[currentIndex];
  const currentSets = completedSetsMap[currentIndex] || new Set();
  const progress = exercises.length > 0 ? (completedIndices.size / exercises.length) * 100 : 0;

  const estimatedVolume = exercises.reduce((acc, ex, i) => {
    const sets = completedSetsMap[i] || new Set();
    const w = parseFloat(ex.weight) || 0;
    const r = parseInt(ex.reps) || 10;
    return acc + sets.size * w * r;
  }, 0);

  const handleStartWorkout = () => {
    setStartTime(Date.now());
    setPhase("active");
  };

  const handleCompleteSet = (setIdx: number) => {
    setCompletedSetsMap(prev => {
      const next = new Set(prev[currentIndex] || []);
      if (next.has(setIdx)) next.delete(setIdx);
      else next.add(setIdx);
      return { ...prev, [currentIndex]: next };
    });
  };

  const handleCompleteExercise = () => {
    setCompletedIndices(prev => new Set(prev).add(currentIndex));
    if (currentIndex < exercises.length - 1) {
      setShowRest(true);
    } else {
      // Last exercise — finish
      handleFinishWorkout();
    }
  };

  const handleRestEnd = () => {
    setShowRest(false);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinishWorkout = async () => {
    setSaving(true);
    const durationMin = Math.max(1, Math.floor((Date.now() - startTime) / 60000));

    if (user) {
      try {
        const { data: workout, error } = await supabase
          .from("workouts")
          .insert({
            user_id: user.id,
            title: workoutName,
            type: workoutType,
            completed: true,
            completed_at: new Date().toISOString(),
            duration_minutes: durationMin,
            calories_burned: Math.round(durationMin * 6),
            notes: notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        if (workout) {
          const exerciseRows = exercises.map((ex, i) => ({
            workout_id: workout.id,
            user_id: user.id,
            name: ex.name,
            sets: ex.sets,
            reps: parseInt(ex.reps) || 12,
            weight_kg: parseFloat(ex.weight) || null,
            rest_seconds: ex.rest || 60,
            sort_order: i,
          }));
          await supabase.from("workout_exercises").insert(exerciseRows);
        }

        toast.success("Treino salvo! 💪🔥");
      } catch (err) {
        console.error("Error saving workout:", err);
        toast.error("Erro ao salvar treino");
      }
    }

    setSaving(false);
    setPhase("finished");
  };

  // === PREVIEW PHASE ===
  if (phase === "preview") {
    return (
      <div className="pb-28 max-w-lg mx-auto animate-fade-in">
        <div className="px-4 pt-4">
          <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Play className="w-10 h-10 text-primary-foreground ml-1" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">{workoutName}</h2>
            <p className="text-sm text-muted-foreground">{exercises.length} exercícios • ~{exercises.length * 7} min</p>
          </div>

          <div className="space-y-2 mb-6">
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className="glass-card rounded-xl p-3 flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-lg border border-border/30">
                  {ex.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.sets} séries × {ex.reps} reps • {ex.weight}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform animate-scale-in"
          >
            <Play className="w-5 h-5" /> Começar Exercício
          </button>
        </div>
      </div>
    );
  }

  // === FINISHED PHASE ===
  if (phase === "finished") {
    const durationMin = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
    return (
      <div className="pb-28 max-w-lg mx-auto animate-fade-in">
        <div className="px-4 pt-8 text-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Treino Concluído! 🎉</h2>
          <p className="text-muted-foreground mb-6">Você arrasou hoje!</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Duração</p>
              <p className="text-lg font-heading font-bold text-foreground">{durationMin} min</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Exercícios</p>
              <p className="text-lg font-heading font-bold text-foreground">{exercises.length}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-lg font-heading font-bold text-foreground">{Math.round(estimatedVolume)} kg</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-heading font-bold text-foreground">+1 dia de streak!</span>
            <Flame className="w-6 h-6 text-orange-500" />
          </div>

          <button
            onClick={onBack}
            className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  // === ACTIVE PHASE ===
  return (
    <div className="pb-28 max-w-lg mx-auto animate-fade-in">
      {/* Simple header like Fitness Online */}
      <div className="sticky top-0 z-30 bg-background/95 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-sm font-heading font-bold text-foreground">
            {currentIndex + 1}/{exercises.length} {currentExercise?.muscle}
          </p>
        </div>
        <div className="w-6" /> {/* spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-2">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current exercise - clean layout */}
      <div className="px-4 pt-2">
        {currentExercise && (
          <ExerciseCard
            exercise={currentExercise}
            index={currentIndex}
            totalExercises={exercises.length}
            isActive={true}
            completedSets={currentSets}
            onCompleteSet={handleCompleteSet}
            onStartRest={() => setShowRest(true)}
            onCompleteExercise={handleCompleteExercise}
            isCompleted={completedIndices.has(currentIndex)}
          />
        )}
      </div>

      {/* Rest timer modal */}
      <RestTimerModal
        isOpen={showRest}
        initialSeconds={currentExercise?.rest || 90}
        onClose={handleRestEnd}
        onSkip={handleRestEnd}
      />
    </div>
  );
};

export default ActiveWorkout;
