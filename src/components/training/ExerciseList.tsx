import React from "react";
import { Check, Play } from "lucide-react";
import type { Exercise } from "./ExerciseCard";
import ExerciseThumb from "./ExerciseThumb";

interface ExerciseListProps {
  exercises: Exercise[];
  currentIndex: number;
  completedIndices: Set<number>;
  onSelect: (index: number) => void;
}

const ExerciseList = ({ exercises, currentIndex, completedIndices, onSelect }: ExerciseListProps) => {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Exercícios do treino
      </h4>
      {exercises.map((ex, i) => {
        const isCurrent = i === currentIndex;
        const isDone = completedIndices.has(i);

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all border text-left ${
              isCurrent
                ? "border-primary/40 bg-primary/5"
                : isDone
                  ? "border-border/30 bg-secondary/30 opacity-60"
                  : "border-border/20 bg-secondary/20 hover:bg-secondary/40"
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Status indicator */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
              isDone
                ? "gradient-primary text-primary-foreground"
                : isCurrent
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary text-muted-foreground"
            }`}>
              {isDone ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <Play className="w-3 h-3" /> : i + 1}
            </div>

            {/* Thumbnail */}
            <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-base shrink-0 border border-border/30 overflow-hidden">
              <ExerciseThumb
                name={ex.name}
                muscle={ex.muscle}
                emoji={ex.emoji}
                fallbackGifUrl={ex.gifUrl}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {ex.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                <span>{ex.muscle}</span>
                <span>•</span>
                <span>{ex.sets}×{ex.reps}</span>
                {ex.weight !== "Corpo" && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-semibold">{ex.weight}</span>
                  </>
                )}
              </div>
            </div>

            {/* Status badge */}
            <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
              isDone
                ? "bg-primary/10 text-primary"
                : isCurrent
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
            }`}>
              {isDone ? "Feito" : isCurrent ? "Atual" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ExerciseList;
