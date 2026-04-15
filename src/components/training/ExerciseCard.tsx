import React, { useState } from "react";
import { Check, Timer, Info, ChevronUp, ChevronDown } from "lucide-react";
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
    <div className="relative w-full aspect-square overflow-hidden bg-secondary/20 flex items-center justify-center">
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
        loading="lazy"
      />
    </div>
  );
};

const ExerciseCard = ({
  exercise, index, totalExercises, isActive, completedSets, onCompleteSet, onStartRest, onCompleteExercise, isCompleted
}: ExerciseCardProps) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const allSetsCompleted = completedSets.size >= exercise.sets;

  if (!isActive) return null;

  const handleSetComplete = () => {
    // Find next incomplete set
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets.has(i)) {
        onCompleteSet(i);
        onStartRest();
        return;
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Exercise GIF - large and centered */}
      <div className="rounded-3xl overflow-hidden glass-card mb-4">
        <ExerciseMedia exercise={exercise} />
      </div>

      {/* Exercise name + muscle */}
      <div className="text-center mb-5">
        <h3 className="text-xl font-heading font-bold text-foreground">{exercise.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Peso recomendado: <span className="font-semibold text-foreground">{exercise.weight}</span>
        </p>
      </div>

      {/* 3 stat circles */}
      <div className="flex justify-center gap-4 mb-5">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-heading font-bold text-primary">{exercise.reps}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Repetições</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-heading font-bold text-primary">{Math.floor(exercise.rest / 60)}:{String(exercise.rest % 60).padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Descanso</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-accent/30 bg-accent/10 flex items-center justify-center">
            <span className="text-xl font-heading font-bold text-accent">{completedSets.size}/{exercise.sets}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Séries<br/>feitas</span>
        </div>
      </div>

      {/* Instruction toggle */}
      <button
        onClick={() => setShowInstruction(!showInstruction)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto mb-4 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        <span>{showInstruction ? "Ocultar instruções" : "Ver instruções"}</span>
        {showInstruction ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showInstruction && (
        <div className="glass-card rounded-xl p-3 mb-4 animate-fade-in border border-border/30">
          <p className="text-sm text-muted-foreground leading-relaxed">{exercise.instruction}</p>
        </div>
      )}

      {/* Complete set button */}
      {!allSetsCompleted ? (
        <button
          onClick={handleSetComplete}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Check className="w-5 h-5" />
          Completar Série {completedSets.size + 1}
        </button>
      ) : (
        <button
          onClick={onCompleteExercise}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform animate-scale-in"
        >
          {index < totalExercises - 1 ? "Próximo Exercício →" : "Finalizar Treino 🎉"}
        </button>
      )}
    </div>
  );
};

export default ExerciseCard;
