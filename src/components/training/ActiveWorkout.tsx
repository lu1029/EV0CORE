import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseCard from "./ExerciseCard";
import ExerciseList from "./ExerciseList";
import WorkoutStats from "./WorkoutStats";
import WorkoutNotes from "./WorkoutNotes";
import RestTimerModal from "./RestTimerModal";
import type { Exercise } from "./ExerciseCard";

interface ActiveWorkoutProps {
  workoutName: string;
  exercises: Exercise[];
  onBack: () => void;
}

const ActiveWorkout = ({ workoutName, exercises, onBack }: ActiveWorkoutProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<number, Set<number>>>({});
  const [showRest, setShowRest] = useState(false);
  const [notes, setNotes] = useState("");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 60000)), 10000);
    return () => clearInterval(t);
  }, [startTime]);

  const currentExercise = exercises[currentIndex];
  const currentSets = completedSetsMap[currentIndex] || new Set();
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const completedSetsTotal = Object.values(completedSetsMap).reduce((a, s) => a + s.size, 0);
  const progress = exercises.length > 0 ? (completedIndices.size / exercises.length) * 100 : 0;

  const estimatedVolume = exercises.reduce((acc, ex, i) => {
    const sets = completedSetsMap[i] || new Set();
    const w = parseFloat(ex.weight) || 0;
    const r = parseInt(ex.reps) || 10;
    return acc + sets.size * w * r;
  }, 0);

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
      setCurrentIndex(currentIndex + 1);
    }
  };

  const isFinished = completedIndices.size === exercises.length;

  return (
    <div className="pb-28 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{elapsed} min</span>
          </div>
        </div>

        <div className="mb-1">
          <h2 className="text-lg font-heading font-bold text-foreground">{workoutName}</h2>
          <p className="text-xs text-muted-foreground">{exercises.length} exercícios • {completedIndices.size} concluídos</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-primary font-medium mt-1 text-right">{Math.round(progress)}%</p>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Stats */}
        <WorkoutStats
          completedExercises={completedIndices.size}
          totalExercises={exercises.length}
          totalSets={totalSets}
          completedSets={completedSetsTotal}
          elapsedMinutes={elapsed}
          estimatedVolume={Math.round(estimatedVolume)}
        />

        {/* Current exercise */}
        {currentExercise && (
          <ExerciseCard
            exercise={currentExercise}
            index={currentIndex}
            isActive={true}
            completedSets={currentSets}
            onCompleteSet={handleCompleteSet}
            onStartRest={() => setShowRest(true)}
            onCompleteExercise={handleCompleteExercise}
            isCompleted={completedIndices.has(currentIndex)}
          />
        )}

        {/* Exercise list */}
        <ExerciseList
          exercises={exercises}
          currentIndex={currentIndex}
          completedIndices={completedIndices}
          onSelect={setCurrentIndex}
        />

        {/* Notes */}
        <WorkoutNotes notes={notes} onNotesChange={setNotes} />

        {/* Finish button */}
        {isFinished && (
          <Button
            variant="hero"
            className="w-full h-14 rounded-2xl text-base gap-2 animate-scale-in"
            onClick={onBack}
          >
            <Trophy className="w-5 h-5" /> Finalizar Treino 🎉
          </Button>
        )}
      </div>

      {/* Rest timer modal */}
      <RestTimerModal
        isOpen={showRest}
        initialSeconds={currentExercise?.rest || 90}
        onClose={() => setShowRest(false)}
        onSkip={() => setShowRest(false)}
      />
    </div>
  );
};

export default ActiveWorkout;
