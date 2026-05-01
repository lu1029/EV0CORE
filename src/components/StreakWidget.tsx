import React from "react";
import { Flame, Calendar, Trophy } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { motion } from "framer-motion";

export const StreakWidget = () => {
  const { streak, trainedToday, weekDays, loading } = useStreak();

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${trainedToday ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
            <Flame className={`w-5 h-5 ${trainedToday ? 'fill-orange-500' : ''}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sua Sequência</p>
            <p className="text-xl font-bold font-heading">{streak} {streak === 1 ? 'dia' : 'dias'}</p>
          </div>
        </div>
        {streak >= 7 && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-1">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              weekDays[i] 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'bg-secondary text-muted-foreground/30'
            }`}>
              {weekDays[i] && <Flame className="w-4 h-4 fill-current" />}
            </div>
          </div>
        ))}
      </div>
      
      {!trainedToday && (
        <p className="text-[11px] text-orange-500 font-medium mt-4 text-center">
          Complete um treino hoje para não perder seu foguinho!
        </p>
      )}
    </motion.div>
  );
};
