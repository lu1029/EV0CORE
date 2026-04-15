import React, { useState } from "react";
import { Check, Timer, ChevronUp, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-secondary/30">
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
  exercise, index, isActive, completedSets, onCompleteSet, onStartRest, onCompleteExercise, isCompleted
}: ExerciseCardProps) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const allSetsCompleted = completedSets.size >= exercise.sets;

  if (!isActive) return null;

  return (
    <div className="rounded-3xl glass-card-purple overflow-hidden animate-scale-in">
      {/* Exercise GIF / media */}
      <ExerciseMedia exercise={exercise} />

      {/* Exercise info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-1">
              Exercício {index + 1}
            </p>
            <h3 className="text-xl font-heading font-bold text-foreground">{exercise.name}</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            {exercise.muscle}
          </span>
        </div>

        {/* Instruction toggle */}
        <button
          onClick={() => setShowInstruction(!showInstruction)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-2 mb-3 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showInstruction ? "Ocultar instruções" : "Ver instruções"}</span>
          {showInstruction ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showInstruction && (
          <div className="bg-secondary/50 rounded-xl p-3 mb-4 animate-fade-in border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed">{exercise.instruction}</p>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Séries", value: exercise.sets.toString() },
            { label: "Reps", value: exercise.reps },
            { label: "Carga", value: exercise.weight },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl py-2.5 px-3 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
              <p className="text-lg font-heading font-bold text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sets tracker */}
        <div className="space-y-2 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Séries</p>
          {Array.from({ length: exercise.sets }).map((_, setIdx) => {
            const isDone = completedSets.has(setIdx);
            return (
              <div
                key={setIdx}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isDone
                    ? "glass-card-purple"
                    : "glass-card"
                }`}
              >
                <button
                  onClick={() => {
                    onCompleteSet(setIdx);
                    if (!isDone) onStartRest();
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                    isDone
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary border border-border hover:border-primary/50"
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                </button>
                <span className="text-sm font-medium text-foreground flex-1">Série {setIdx + 1}</span>
                <span className="text-xs text-muted-foreground">{exercise.reps} reps</span>
                <span className="text-xs font-semibold text-primary">{exercise.weight}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="glass"
            className="flex-1 rounded-2xl h-12 gap-2"
            onClick={onStartRest}
          >
            <Timer className="w-4 h-4" /> Descanso ({exercise.rest}s)
          </Button>
          {allSetsCompleted && (
            <Button
              variant="hero"
              className="flex-1 rounded-2xl h-12 gap-2 animate-scale-in"
              onClick={onCompleteExercise}
            >
              <Check className="w-4 h-4" /> Concluir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
