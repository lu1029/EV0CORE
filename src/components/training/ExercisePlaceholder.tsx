import React, { useState } from "react";

interface ExercisePlaceholderProps {
  exerciseName: string;
  muscleGroup: string;
  className?: string;
}

const muscleGradients: Record<string, string> = {
  "Peito": "from-emerald-500/20 via-emerald-600/10 to-transparent",
  "Tríceps": "from-blue-500/20 via-blue-600/10 to-transparent",
  "Costas": "from-purple-500/20 via-purple-600/10 to-transparent",
  "Bíceps": "from-orange-500/20 via-orange-600/10 to-transparent",
  "Pernas": "from-red-500/20 via-red-600/10 to-transparent",
  "Ombros": "from-cyan-500/20 via-cyan-600/10 to-transparent",
  "Trapézio": "from-yellow-500/20 via-yellow-600/10 to-transparent",
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

const muscleSilhouettes: Record<string, string> = {
  "Peito": "M20,60 Q30,40 50,35 Q70,40 80,60",
  "Tríceps": "M35,20 L35,80 Q50,85 65,80 L65,20",
  "Costas": "M25,30 Q50,15 75,30 L70,80 Q50,85 30,80 Z",
  "Bíceps": "M40,20 Q30,50 40,80 L60,80 Q70,50 60,20 Z",
  "Pernas": "M30,10 L25,90 L45,90 L50,10 Z",
  "Ombros": "M20,50 Q50,20 80,50 Q70,60 50,55 Q30,60 20,50",
  "Trapézio": "M30,40 Q50,20 70,40 L65,70 Q50,75 35,70 Z",
};

const ExercisePlaceholder = ({ exerciseName, muscleGroup, className = "" }: ExercisePlaceholderProps) => {
  const gradient = muscleGradients[muscleGroup] || "from-primary/20 via-primary/10 to-transparent";
  const silhouette = muscleSilhouettes[muscleGroup] || muscleSilhouettes["Peito"];

  return (
    <div className={`relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.02] to-transparent"
        style={{ backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite" }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* SVG muscle silhouette */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <path d={silhouette} fill="currentColor" className="text-foreground" />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-2xl border border-border/40 shadow-lg">
          {muscleIcons[muscleGroup] || "🏋️"}
        </div>
        <p className="text-xs font-medium text-muted-foreground/70">{exerciseName}</p>
        <div className="px-3 py-0.5 rounded-full bg-secondary/60 border border-border/20">
          <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            📹 Em breve
          </span>
        </div>
      </div>

      {/* Animated accent dots */}
      <div className="absolute top-3 right-3 flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
    </div>
  );
};

export default ExercisePlaceholder;
