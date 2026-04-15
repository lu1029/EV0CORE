import React from "react";

interface ExercisePlaceholderProps {
  exerciseName: string;
  muscleGroup: string;
  className?: string;
}

const muscleGradients: Record<string, string> = {
  "Peito": "from-primary/20 to-primary/5",
  "Tríceps": "from-blue-500/20 to-blue-500/5",
  "Costas": "from-purple-500/20 to-purple-500/5",
  "Bíceps": "from-orange-500/20 to-orange-500/5",
  "Pernas": "from-red-500/20 to-red-500/5",
  "Ombros": "from-cyan-500/20 to-cyan-500/5",
  "Trapézio": "from-yellow-500/20 to-yellow-500/5",
};

const muscleIcons: Record<string, string> = {
  "Peito": "🏋️",
  "Tríceps": "💪",
  "Costas": "🔻",
  "Bíceps": "💪",
  "Pernas": "🦵",
  "Ombros": "🏋️",
  "Trapézio": "⬆️",
};

const ExercisePlaceholder = ({ exerciseName, muscleGroup, className = "" }: ExercisePlaceholderProps) => {
  const gradient = muscleGradients[muscleGroup] || "from-primary/20 to-primary/5";

  return (
    <div className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent"
        style={{ backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite" }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center text-3xl backdrop-blur-sm border border-border/50">
          {muscleIcons[muscleGroup] || "🏋️"}
        </div>
        <div className="px-3 py-1 rounded-full bg-secondary/60 backdrop-blur-sm border border-border/30">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Demonstração em breve
          </span>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
    </div>
  );
};

export default ExercisePlaceholder;
