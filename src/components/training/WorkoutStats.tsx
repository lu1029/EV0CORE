import React from "react";
import { Flame, Clock, Dumbbell, TrendingUp } from "lucide-react";

interface WorkoutStatsProps {
  completedExercises: number;
  totalExercises: number;
  totalSets: number;
  completedSets: number;
  elapsedMinutes: number;
  estimatedVolume: number;
}

const WorkoutStats = ({ completedExercises, totalExercises, totalSets, completedSets, elapsedMinutes, estimatedVolume }: WorkoutStatsProps) => {
  const stats = [
    { icon: Dumbbell, label: "Exercícios", value: `${completedExercises}/${totalExercises}`, color: "text-primary" },
    { icon: TrendingUp, label: "Séries", value: `${completedSets}/${totalSets}`, color: "text-blue-400" },
    { icon: Clock, label: "Tempo", value: `${elapsedMinutes} min`, color: "text-purple-400" },
    { icon: Flame, label: "Volume", value: `${estimatedVolume}kg`, color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-secondary/50 rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-border/50">
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
          <span className="text-sm font-bold text-foreground font-heading">{stat.value}</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default WorkoutStats;
