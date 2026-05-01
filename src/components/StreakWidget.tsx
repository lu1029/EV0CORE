import React from "react";
import { Flame, Calendar, Trophy } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { motion } from "framer-motion";

export const StreakWidget = () => {
  const { streak, trainedToday, weekDays, loading } = useStreak();

  if (loading) return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm animate-pulse h-[140px]" />
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] transition-colors duration-700 ${
        trainedToday ? 'bg-orange-500/20' : 'bg-muted/30'
      }`} />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={trainedToday ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              trainedToday 
                ? 'bg-orange-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)]' 
                : 'bg-secondary text-muted-foreground/40'
            }`}
          >
            <Flame className={`w-6 h-6 ${trainedToday ? 'fill-current' : ''}`} />
          </motion.div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Minha Sequência</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-heading tabular-nums">{streak}</span>
              <span className="text-sm font-medium text-muted-foreground">{streak === 1 ? 'dia' : 'dias'}</span>
            </div>
          </div>
        </div>
        
        {streak >= 7 && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5 relative z-10">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`w-full h-1 rounded-full transition-colors ${
              weekDays[i] ? 'bg-orange-500' : 'bg-border/40'
            }`} />
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
              weekDays[i] 
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                : 'bg-secondary/40 text-muted-foreground/20'
            }`}>
              <span className="text-[10px] font-bold">{day}</span>
            </div>
          </div>
        ))}
      </div>
      
      {!trainedToday && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 mt-4 py-2 px-3 bg-orange-500/5 rounded-xl border border-orange-500/10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <p className="text-[11px] text-orange-600 font-bold uppercase tracking-tight">
            Treine hoje para manter o fogo!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
