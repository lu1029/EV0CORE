import React, { useState, useEffect, useRef, useCallback } from "react";

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  onClose: () => void;
  onSkip: () => void;
}

/**
 * Apple-Fitness-style rest timer.
 * - Pure black overlay
 * - Thin progress ring (single color)
 * - Huge ultralight numerals, tabular
 * - Minimal controls: -15 / +15 / Pular
 */
const RestTimerModal = ({ isOpen, initialSeconds, onClose, onSkip }: RestTimerModalProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((frequency: number, duration: number, volume = 0.3) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSeconds(initialSeconds);
      setTotalSeconds(initialSeconds);
      setIsFinished(false);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, initialSeconds]);

  // Subtle ticks last 3s + finish chime
  useEffect(() => {
    if (!isOpen) return;
    if (seconds > 0 && seconds <= 3) {
      playBeep(880, 0.06, 0.18);
      try { (navigator as any).vibrate?.(20); } catch {}
    }
  }, [seconds, isOpen, playBeep]);

  useEffect(() => {
    if (isFinished) {
      setTimeout(() => playBeep(523, 0.18, 0.35), 0);
      setTimeout(() => playBeep(784, 0.28, 0.4), 180);
      try { (navigator as any).vibrate?.([180, 80, 220]); } catch {}
      const t = setTimeout(onClose, 1400);
      return () => clearTimeout(t);
    }
  }, [isFinished, playBeep, onClose]);

  if (!isOpen) return null;

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const addTime = (delta: number) => {
    setSeconds(prev => Math.max(0, prev + delta));
    setTotalSeconds(prev => Math.max(0, prev + delta));
    if (isFinished) setIsFinished(false);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 bg-black animate-fade-in">
      {/* Top label */}
      <div className="text-center">
        <p className="text-[13px] font-medium text-white/50 uppercase tracking-[0.15em]">
          {isFinished ? "Pronto" : "Descanso"}
        </p>
      </div>

      {/* Big ring + number */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120" cy="120" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3"
          />
          <circle
            cx="120" cy="120" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="flex flex-col items-center justify-center">
          <span
            className="text-[96px] leading-none font-extralight text-white tabular tracking-tight"
            style={{ fontVariationSettings: "'wght' 200" }}
          >
            {minutes > 0 ? `${minutes}:${String(secs).padStart(2, "0")}` : secs}
          </span>
          {minutes === 0 && (
            <span className="text-[13px] text-white/40 mt-2 uppercase tracking-[0.2em]">segundos</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full px-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-12">
          <button
            onClick={() => addTime(-15)}
            disabled={isFinished}
            className="w-16 h-16 rounded-full bg-white/[0.08] flex items-center justify-center text-white text-[15px] font-semibold active:opacity-60 transition-opacity disabled:opacity-30 tabular"
          >
            −15
          </button>
          <button
            onClick={() => addTime(15)}
            className="w-16 h-16 rounded-full bg-white/[0.08] flex items-center justify-center text-white text-[15px] font-semibold active:opacity-60 transition-opacity tabular"
          >
            +15
          </button>
        </div>
        <button
          onClick={onSkip}
          className="w-full max-w-xs h-14 rounded-full bg-white text-black font-semibold text-[17px] active:opacity-70 transition-opacity"
        >
          {isFinished ? "Continuar" : "Pular descanso"}
        </button>
      </div>
    </div>
  );
};

export default RestTimerModal;
