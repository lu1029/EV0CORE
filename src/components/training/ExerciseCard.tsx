import React, { useState } from "react";
import { Info, ChevronUp, ChevronDown, Plus, Minus } from "lucide-react";
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
    <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center">
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
  const [editWeight, setEditWeight] = useState(parseFloat(exercise.weight) || 0);
  const [editReps, setEditReps] = useState(parseInt(exercise.reps) || 12);
  const allSetsCompleted = completedSets.size >= exercise.sets;

  if (!isActive) return null;

  const handleDoSet = () => {
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets.has(i)) {
        onCompleteSet(i);
        onStartRest();
        return;
      }
    }
  };

  const restMin = Math.floor(exercise.rest / 60);
  const restSec = exercise.rest % 60;
  const restDisplay = `${restMin}:${String(restSec).padStart(2, '0')}`;

  // Circle progress for sets
  const setsProgress = exercise.sets > 0 ? (completedSets.size / exercise.sets) : 0;
  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference * (1 - setsProgress);

  return (
    <div className="animate-fade-in">
      {/* Exercise image */}
      <div className="rounded-2xl overflow-hidden mb-4 bg-secondary/20">
        <ExerciseMedia exercise={exercise} />
      </div>

      {/* Exercise name */}
      <h3 className="text-lg font-heading font-bold text-foreground text-center">{exercise.name}</h3>

      {/* Weight recommendation */}
      <p className="text-xs text-muted-foreground text-center mt-1 mb-5">
        Peso recomendado: <span className="font-semibold text-foreground">{exercise.weight}</span>
      </p>

      {/* 3 stat circles - Fitness Online style */}
      <div className="flex justify-center items-start gap-5 mb-6">
        {/* Repetitions circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-[64px] h-[64px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-primary/20" />
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-primary"
                strokeDasharray={circumference} strokeDashoffset={0} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-heading font-bold text-primary">{editReps}</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Repetições<br/>necessárias</span>
        </div>

        {/* Rest circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-[64px] h-[64px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-primary/20" />
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-primary"
                strokeDasharray={circumference} strokeDashoffset={0} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-heading font-bold text-primary">{restDisplay}</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Descanso</span>
        </div>

        {/* Sets circle with progress */}
        <div className="flex flex-col items-center">
          <div className="relative w-[64px] h-[64px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-accent/20" />
              <circle cx="30" cy="30" r="26" fill="none" strokeWidth="2.5" className="stroke-accent"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-heading font-bold text-accent">{completedSets.size}/{exercise.sets}</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">Conjuntos<br/>feitos</span>
        </div>
      </div>

      {/* Editable weight and reps - like Fitness Online */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 glass-card rounded-xl flex items-center justify-between px-3 py-2.5">
          <button onClick={() => setEditWeight(Math.max(0, editWeight - 2.5))} className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center active:scale-90 transition-transform">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-sm font-heading font-bold text-foreground">{editWeight} kg</p>
            <p className="text-[9px] text-muted-foreground">Quilogramas</p>
          </div>
          <button onClick={() => setEditWeight(editWeight + 2.5)} className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center active:scale-90 transition-transform">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 glass-card rounded-xl flex items-center justify-between px-3 py-2.5">
          <button onClick={() => setEditReps(Math.max(1, editReps - 1))} className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center active:scale-90 transition-transform">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-sm font-heading font-bold text-foreground">{editReps}</p>
            <p className="text-[9px] text-muted-foreground">Repetições</p>
          </div>
          <button onClick={() => setEditReps(editReps + 1)} className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center active:scale-90 transition-transform">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Instructions toggle */}
      <button
        onClick={() => setShowInstruction(!showInstruction)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mx-auto mb-4 transition-colors"
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

      {/* Action button */}
      {!allSetsCompleted ? (
        <button
          onClick={handleDoSet}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          ✓ Completar Série {completedSets.size + 1} de {exercise.sets}
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
