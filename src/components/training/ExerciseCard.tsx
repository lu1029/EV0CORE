import React, { useState } from "react";
import ExercisePlaceholder from "./ExercisePlaceholder";

export interface Exercise {
  name: string;
  muscle: string;
  emoji: string;
  sets: number;
  reps: string;
  weight: string;
  rest: number;
  instruction: string;
  gifUrl?: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  isActive: boolean;
  completedSets: Set<number>;
  onCompleteSet: (setIdx: number) => void;
  onStartRest: () => void;
  onCompleteExercise: () => void;
  isCompleted: boolean;
}

const ExerciseMedia = ({ exercise }: { exercise: Exercise }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!exercise.gifUrl || error) {
    return <ExercisePlaceholder exerciseName={exercise.name} muscleGroup={exercise.muscle} />;
  }

  return (
    <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-black">
      {!loaded && (
        <div className="absolute inset-0">
          <ExercisePlaceholder exerciseName={exercise.name} muscleGroup={exercise.muscle} />
        </div>
      )}
      <img
        src={exercise.gifUrl}
        alt={exercise.name}
        className={`w-full h-full object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="eager"
      />
    </div>
  );
};

const haptic = (ms: number = 12) => {
  try { (navigator as any).vibrate?.(ms); } catch {}
};

const ExerciseCard = ({
  exercise, index, totalExercises, isActive, completedSets,
  onCompleteSet, onStartRest, onCompleteExercise,
}: ExerciseCardProps) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const allSetsCompleted = completedSets.size >= exercise.sets;

  if (!isActive) return null;

  const handleDoSet = () => {
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets.has(i)) {
        haptic(15);
        onCompleteSet(i);
        onStartRest();
        return;
      }
    }
  };

  const restMin = Math.floor(exercise.rest / 60);
  const restSec = exercise.rest % 60;
  const restDisplay = restMin > 0
    ? `${restMin}:${String(restSec).padStart(2, '0')}`
    : `${restSec}s`;

  return (
    <div className="animate-fade-in -mx-4">
      {/* Media — full bleed, dark, no borders */}
      <div className="bg-black">
        <ExerciseMedia exercise={exercise} />
      </div>

      <div className="px-5 pt-6">
        {/* Title */}
        <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
          {exercise.muscle}
        </p>
        <h2 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-1">
          {exercise.name}
        </h2>

        {/* Stats row — iOS Health style */}
        <div className="grid grid-cols-3 mt-6 rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Séries</p>
            <p className="text-[22px] font-bold text-foreground tabular mt-0.5">{completedSets.size}<span className="text-muted-foreground font-medium">/{exercise.sets}</span></p>
          </div>
          <div className="px-4 py-3 text-center border-l border-white/[0.06]">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Reps</p>
            <p className="text-[22px] font-bold text-foreground tabular mt-0.5">{exercise.reps}</p>
          </div>
          <div className="px-4 py-3 text-center border-l border-white/[0.06]">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Descanso</p>
            <p className="text-[22px] font-bold text-foreground tabular mt-0.5">{restDisplay}</p>
          </div>
        </div>

        {/* Carga (peso) */}
        {exercise.weight && exercise.weight !== "Corpo" && (
          <p className="text-center text-[13px] text-muted-foreground mt-3">
            Carga sugerida <span className="text-foreground font-semibold">{exercise.weight}</span>
          </p>
        )}

        {/* Instructions toggle — minimal */}
        <button
          onClick={() => setShowInstruction(!showInstruction)}
          className="w-full text-center text-[15px] text-primary font-medium mt-5 active:opacity-60 transition-opacity"
        >
          {showInstruction ? "Ocultar instruções" : "Ver instruções"}
        </button>

        {showInstruction && (
          <div className="rounded-2xl bg-card border border-white/[0.06] p-4 mt-3 animate-fade-in">
            <p className="text-[15px] text-foreground/85 leading-relaxed">{exercise.instruction}</p>
          </div>
        )}

        {/* Primary action — large, full-width pill */}
        <div className="mt-8 mb-4">
          {!allSetsCompleted ? (
            <button
              onClick={handleDoSet}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center active:opacity-80 transition-opacity"
            >
              Concluir série {completedSets.size + 1} de {exercise.sets}
            </button>
          ) : (
            <button
              onClick={() => { haptic(25); onCompleteExercise(); }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center active:opacity-80 transition-opacity animate-scale-in"
            >
              {index < totalExercises - 1 ? "Próximo exercício" : "Finalizar treino"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
