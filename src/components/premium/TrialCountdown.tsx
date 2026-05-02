import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TrialCountdownProps {
  expiryDate: Date | null;
}

export const TrialCountdown = ({ expiryDate }: TrialCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUrgent: boolean;
  } | null>(null);

  useEffect(() => {
    if (!expiryDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference <= 0) {
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Urgent if less than 24 hours left
      const isUrgent = difference < (1000 * 60 * 60 * 24);

      return { days, hours, minutes, seconds, isUrgent };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border flex flex-col gap-2 transition-colors ${
        timeLeft.isUrgent 
          ? "bg-red-500/10 border-red-500/30 text-red-500" 
          : "bg-amber-500/10 border-amber-500/30 text-amber-500"
      }`}
    >
      <div className="flex items-center gap-2">
        {timeLeft.isUrgent ? <AlertCircle className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />}
        <span className="text-[13px] font-bold uppercase tracking-wider">
          {timeLeft.isUrgent ? "O teste termina em breve!" : "Seu teste grátis expira em:"}
        </span>
      </div>
      
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-black leading-none tabular-nums">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Dias</span>
        </div>
        <span className="text-xl font-bold pb-4">:</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black leading-none tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Horas</span>
        </div>
        <span className="text-xl font-bold pb-4">:</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black leading-none tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Min</span>
        </div>
        <span className="text-xl font-bold pb-4">:</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black leading-none tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Seg</span>
        </div>
      </div>

      {timeLeft.isUrgent && (
        <p className="text-[11px] font-medium mt-1">
          Faltam menos de 24 horas. Cancele agora se não quiser ser cobrado!
        </p>
      )}
    </motion.div>
  );
};
