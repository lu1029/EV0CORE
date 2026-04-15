import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, SkipForward, RotateCcw, Plus, Minus, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  onClose: () => void;
  onSkip: () => void;
}

const RestTimerModal = ({ isOpen, initialSeconds, onClose, onSkip }: RestTimerModalProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((frequency: number, duration: number, volume = 0.3) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
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
  }, [soundEnabled]);

  const playFinishSound = useCallback(() => {
    if (!soundEnabled) return;
    // Three ascending beeps
    setTimeout(() => playBeep(523, 0.2, 0.4), 0);
    setTimeout(() => playBeep(659, 0.2, 0.4), 200);
    setTimeout(() => playBeep(784, 0.4, 0.5), 400);
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, [soundEnabled, playBeep]);

  const playTickSound = useCallback(() => {
    playBeep(880, 0.08, 0.15);
    if (navigator.vibrate) navigator.vibrate(30);
  }, [playBeep]);

  useEffect(() => {
    if (isOpen) {
      setSeconds(initialSeconds);
      setTotalSeconds(initialSeconds);
      setIsFinished(false);
      setPulseIntensity(0);
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

  // Sound effects based on countdown
  useEffect(() => {
    if (!isOpen) return;
    if (seconds <= 3 && seconds > 0) {
      playTickSound();
      setPulseIntensity(3);
    } else if (seconds <= 10 && seconds > 3) {
      setPulseIntensity(2);
    } else if (seconds <= 30) {
      setPulseIntensity(1);
    } else {
      setPulseIntensity(0);
    }
  }, [seconds, isOpen, playTickSound]);

  // Finish effect
  useEffect(() => {
    if (isFinished) {
      playFinishSound();
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [isFinished, playFinishSound, onClose]);

  if (!isOpen) return null;

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const addTime = (delta: number) => {
    setSeconds(prev => Math.max(0, prev + delta));
    setTotalSeconds(prev => Math.max(0, prev + delta));
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Color transitions based on remaining time
  const getTimerColor = () => {
    if (isFinished) return "hsl(142, 71%, 45%)";
    if (seconds <= 3) return "hsl(0, 84%, 60%)";
    if (seconds <= 10) return "hsl(38, 92%, 50%)";
    return "url(#timerGradient)";
  };

  const getGlowColor = () => {
    if (isFinished) return "rgba(34, 197, 94, 0.4)";
    if (seconds <= 3) return "rgba(239, 68, 68, 0.4)";
    if (seconds <= 10) return "rgba(245, 158, 11, 0.3)";
    return "rgba(99, 102, 241, 0.2)";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl animate-fade-in">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full transition-all duration-1000"
          style={{
            width: `${300 + pulseIntensity * 40}px`,
            height: `${300 + pulseIntensity * 40}px`,
            background: `radial-gradient(circle, ${getGlowColor()}, transparent 70%)`,
            animation: pulseIntensity > 0 ? `pulse ${2 - pulseIntensity * 0.4}s ease-in-out infinite` : 'none',
          }}
        />
        <div
          className="absolute rounded-full opacity-30 transition-all duration-1000"
          style={{
            width: `${400 + pulseIntensity * 60}px`,
            height: `${400 + pulseIntensity * 60}px`,
            background: `radial-gradient(circle, ${getGlowColor()}, transparent 70%)`,
            animation: pulseIntensity > 1 ? `pulse ${2.5 - pulseIntensity * 0.3}s ease-in-out infinite reverse` : 'none',
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-6 animate-scale-in relative z-10">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            {isFinished ? "Descanso concluído!" : "Tempo de descanso"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isFinished ? "Prepare-se para a próxima série 💪" : "Relaxe e recupere suas forças"}
          </p>
        </div>

        {/* Circular timer */}
        <div className="relative w-56 h-56">
          {/* Glow behind circle */}
          <div
            className="absolute inset-2 rounded-full blur-xl transition-all duration-500"
            style={{ background: getGlowColor() }}
          />

          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 130 130">
            {/* Background track */}
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="5"
              opacity="0.3"
            />
            {/* Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 360;
              const rad = (angle - 90) * (Math.PI / 180);
              const isMajor = i % 5 === 0;
              const innerR = isMajor ? 50 : 52;
              const outerR = 54;
              return (
                <line
                  key={i}
                  x1={65 + innerR * Math.cos(rad)}
                  y1={65 + innerR * Math.sin(rad)}
                  x2={65 + outerR * Math.cos(rad)}
                  y2={65 + outerR * Math.sin(rad)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={isMajor ? 1.2 : 0.5}
                  opacity={isMajor ? 0.4 : 0.15}
                />
              );
            })}
            {/* Progress arc */}
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke={getTimerColor()}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 ${6 + pulseIntensity * 3}px ${getGlowColor()})`,
              }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" />
                <stop offset="50%" stopColor="hsl(160 84% 39%)" />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            {isFinished ? (
              <div className="flex flex-col items-center animate-scale-in">
                <span className="text-4xl mb-1">✅</span>
                <span className="text-sm font-heading font-semibold text-accent">Pronto!</span>
              </div>
            ) : (
              <>
                <span
                  className={`text-5xl font-heading font-bold tabular-nums transition-all duration-300 ${
                    seconds <= 3 ? 'text-red-400 scale-110' : seconds <= 10 ? 'text-amber-400' : 'text-foreground'
                  }`}
                  style={{
                    textShadow: seconds <= 3 ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
                  }}
                >
                  {minutes}:{secs.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                  restante
                </span>
              </>
            )}
          </div>
        </div>

        {/* Time adjustment */}
        {!isFinished && (
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              onClick={() => addTime(-15)}
              className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground font-medium w-12 text-center">±15s</span>
            <button
              onClick={() => addTime(15)}
              className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="glass"
            className="rounded-2xl gap-2 h-12 px-6"
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setSeconds(totalSeconds);
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
            }}
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

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {soundEnabled ? "Som ativado" : "Som desativado"}
        </button>
      </div>
    </div>
  );
};

export default RestTimerModal;
