import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Home, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { springSnappy, easeApple, fadeUp, stagger } from "@/lib/motion";

// Pleasant short success chime — synthesized inline so no asset is required
function playSuccessChime() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch {
    /* ignore */
  }
}

function fireConfetti() {
  const duration = 2500;
  const end = Date.now() + duration;
  const colors = ["#00C853", "#69F0AE", "#FFD700", "#ffffff"];

  // Initial burst
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors,
    scalar: 1.1,
  });

  // Side cannons
  const interval = window.setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 220);
}

const benefits = [
  "EvoAI ilimitado liberado",
  "Treinos adaptativos ativos",
  "Análises avançadas desbloqueadas",
  "Nutrição personalizada disponível",
];

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(true);
  const triggered = useRef(false);

  useEffect(() => {
    if (!sessionId || triggered.current) return;
    triggered.current = true;

    // Slight delay so the user sees the screen render first
    const t = setTimeout(() => {
      fireConfetti();
      if (soundOn) playSuccessChime();
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const replay = () => {
    fireConfetti();
    if (soundOn) playSuccessChime();
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeApple }}
          className="text-center max-w-md"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Nenhuma sessão encontrada</h1>
          <p className="text-muted-foreground mb-6">Não conseguimos identificar seu pagamento.</p>
          <Button variant="ghost" onClick={() => navigate("/")} className="rounded-xl">
            Voltar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 relative overflow-hidden">
      {/* Subtle radial glow background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeApple }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.18) 0%, transparent 55%)",
        }}
      />

      {/* Sound toggle */}
      <button
        onClick={() => setSoundOn((s) => !s)}
        aria-label={soundOn ? "Desligar som" : "Ligar som"}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center active:scale-95 transition-transform z-10"
      >
        {soundOn ? (
          <Volume2 className="w-4 h-4 text-foreground" />
        ) : (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative text-center max-w-md w-full"
      >
        {/* Animated check badge */}
        <motion.div variants={fadeUp} className="relative w-28 h-28 mx-auto mb-8">
          {/* Pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full bg-primary/30"
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springSnappy, delay: 0.15 }}
            className="absolute inset-0 rounded-full bg-primary flex items-center justify-center shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.6)]"
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: easeApple, delay: 0.45 }}
            >
              <Check className="w-14 h-14 text-primary-foreground" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Sparkle accent */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ ...springSnappy, delay: 0.6 }}
            className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-card border border-primary/40 flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>

        {/* PRO badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 mb-3"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
            EVOCORE PRO ATIVO
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-[34px] sm:text-[40px] leading-[1.05] font-bold text-foreground tracking-[-0.035em] mb-3"
        >
          Bem-vindo ao <span className="text-primary">PRO</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-[15px] text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto"
        >
          Pagamento confirmado. Sua evolução não tem mais limites.
        </motion.p>

        {/* Benefit list */}
        <motion.div
          variants={fadeUp}
          className="bg-card rounded-2xl border border-border/40 p-5 mb-8 text-left"
        >
          <ul className="space-y-3">
            <AnimatePresence>
              {benefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, ease: easeApple, duration: 0.35 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </div>
                  <span className="text-[14px] text-foreground">{b}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={springSnappy}
            onClick={() => navigate("/")}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.55)] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Voltar para o app
          </motion.button>

          <button
            onClick={replay}
            className="w-full h-11 rounded-2xl bg-secondary text-foreground text-[14px] font-medium active:opacity-60 transition-opacity"
          >
            🎉 Comemorar de novo
          </button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[11px] text-muted-foreground mt-6 tabular"
        >
          ID da sessão: {sessionId.slice(0, 16)}…
        </motion.p>
      </motion.div>
    </div>
  );
}
