import React, { useState, useEffect } from "react";
import { ChevronLeft, Check } from "lucide-react";
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

const haptic = (ms: number = 10) => { try { (navigator as any).vibrate?.(ms); } catch {} };

const ActiveWorkout = ({ workoutName, exercises, onBack, workoutType = "gym" }: ActiveWorkoutProps) => {
  const { user } = useApp();
  const [phase, setPhase] = useState<WorkoutPhase>("preview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<number, Set<number>>>({});
  const [showRest, setShowRest] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [, setElapsed] = useState(0);

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
    haptic(20);
    setStartTime(Date.now());
    setPhase("active");
  };

  const handleCompleteSet = (setIdx: number) => {
    setCompletedSetsMap(prev => {
      const next = new Set(prev[currentIndex] || []);
      if (next.has(setIdx)) next.delete(setIdx); else next.add(setIdx);
      return { ...prev, [currentIndex]: next };
    });
  };

  const handleCompleteExercise = () => {
    setCompletedIndices(prev => new Set(prev).add(currentIndex));
    if (currentIndex < exercises.length - 1) setShowRest(true);
    else handleFinishWorkout();
  };

  const handleRestEnd = () => {
    setShowRest(false);
    if (currentIndex < exercises.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleFinishWorkout = async () => {
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
          })
          .select()
          .single();
        if (error) throw error;
        if (workout) {
          await supabase.from("workout_exercises").insert(
            exercises.map((ex, i) => ({
              workout_id: workout.id,
              user_id: user.id,
              name: ex.name,
              sets: ex.sets,
              reps: parseInt(ex.reps) || 12,
              weight_kg: parseFloat(ex.weight) || null,
              rest_seconds: ex.rest || 60,
              sort_order: i,
            })),
          );
        }
        toast.success("Treino salvo");
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar treino");
      }
    }
    setPhase("finished");
  };

  // === PREVIEW ===
  if (phase === "preview") {
    return (
      <div className="pb-32 max-w-lg mx-auto animate-fade-in">
        <div className="px-5 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-primary text-[15px] font-medium active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 -ml-1" /> Voltar
          </button>
        </div>

        <div className="px-5 pt-6 pb-6">
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
            {exercises.length} exercícios · ~{exercises.length * 7} min
          </p>
          <h1 className="text-[34px] font-bold tracking-tight text-foreground mt-1 leading-tight">
            {workoutName}
          </h1>
        </div>

        <div className="px-5">
          <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 px-5 py-3.5 ${idx > 0 ? "border-t border-white/[0.06]" : ""}`}
              >
                <span className="text-[15px] font-semibold text-muted-foreground tabular w-6">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground truncate">{ex.name}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {ex.sets} × {ex.reps} {ex.weight && ex.weight !== "Corpo" ? `· ${ex.weight}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-8">
          <button
            onClick={handleStartWorkout}
            className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center active:opacity-80 transition-opacity"
          >
            Iniciar treino
          </button>
        </div>
      </div>
    );
  }

  // === FINISHED ===
  if (phase === "finished") {
    const durationMin = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
    return (
      <div className="pb-28 max-w-lg mx-auto min-h-[80vh] flex flex-col animate-fade-in">
        <div className="px-5 pt-12 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-8 animate-scale-in">
            <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
          </div>
          <p className="text-[15px] font-medium text-muted-foreground uppercase tracking-wider">Concluído</p>
          <h1 className="text-[34px] font-bold tracking-tight text-foreground mt-2">{workoutName}</h1>

          <div className="w-full max-w-sm grid grid-cols-3 mt-10 rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
            <div className="px-3 py-4 text-center">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tempo</p>
              <p className="text-[22px] font-bold text-foreground tabular mt-1">{durationMin}<span className="text-muted-foreground text-[14px] font-medium ml-0.5">min</span></p>
            </div>
            <div className="px-3 py-4 text-center border-l border-white/[0.06]">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Exercícios</p>
              <p className="text-[22px] font-bold text-foreground tabular mt-1">{exercises.length}</p>
            </div>
            <div className="px-3 py-4 text-center border-l border-white/[0.06]">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Volume</p>
              <p className="text-[22px] font-bold text-foreground tabular mt-1">{Math.round(estimatedVolume)}<span className="text-muted-foreground text-[14px] font-medium ml-0.5">kg</span></p>
            </div>
          </div>
        </div>

        <div className="px-5">
          <button
            onClick={onBack}
            className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center active:opacity-80 transition-opacity"
          >
            Concluído
          </button>
        </div>
      </div>
    );
  }

  // === ACTIVE ===
  return (
    <div className="pb-28 max-w-lg mx-auto animate-fade-in">
      {/* Top bar — minimal */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="px-5 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-primary active:opacity-60 transition-opacity">
            <ChevronLeft className="w-6 h-6 -ml-1" />
          </button>
          <p className="text-[13px] font-semibold text-foreground tabular">
            {currentIndex + 1} / {exercises.length}
          </p>
          <div className="w-6" />
        </div>
        {/* Hairline progress */}
        <div className="h-[2px] bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 pt-4">
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
