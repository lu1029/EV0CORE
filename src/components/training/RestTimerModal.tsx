import React, { useState, useEffect, useRef } from "react";
import { Timer, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  onClose: () => void;
  onSkip: () => void;
}

const RestTimerModal = ({ isOpen, initialSeconds, onClose, onSkip }: RestTimerModalProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isOpen) {
      setSeconds(initialSeconds);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, initialSeconds, onClose]);

  if (!isOpen) return null;

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col items-center gap-8 animate-scale-in">
        {/* Circular timer */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke="url(#timerGradient)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" />
                <stop offset="100%" stopColor="hsl(160 84% 39%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Timer className="w-5 h-5 text-primary mb-1" />
            <span className="text-4xl font-heading font-bold text-foreground">
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Descanso</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="glass"
            className="rounded-2xl gap-2 h-12 px-6"
            onClick={() => { setSeconds(initialSeconds); }}
          >
            <RotateCcw className="w-4 h-4" /> Reiniciar
          </Button>
          <Button
            variant="hero"
            className="rounded-2xl gap-2 h-12 px-6"
            onClick={onSkip}
          >
            <SkipForward className="w-4 h-4" /> Pular
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestTimerModal;
