import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, Flame, Dumbbell, Apple, MapPin, TrendingUp, Users, ChevronDown, Bell, Check } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { useNavigate } from "react-router-dom";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";
import { AnimatedText } from "@/components/motion/AnimatedText";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const { streak, trainedToday, weekDays: activeWeek } = useStreak();
  const navigate = useNavigate();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const weekDayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

  // Build a 6-day rolling window centered around today (3 past, today, 2 future)
  // matching the print: Qui Sex Sáb Dom Hoje Ter
  const dayShortPt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const todayDow = new Date().getDay();
  const monday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((todayDow + 6) % 7));
    return d;
  })();
  const timeline = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 4 + i); // 4 past .. today .. 1 future
    const dow = d.getDay();
    const isToday = d.toDateString() === new Date().toDateString();
    const isFuture = d > new Date() && !isToday;
    // Map to monday-indexed week to read activeWeek
    const diffFromMonday = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    const trained = diffFromMonday >= 0 && diffFromMonday < 7 ? activeWeek[diffFromMonday] : false;
    return {
      label: isToday ? "Hoje" : dayShortPt[dow],
      isToday,
      isFuture,
      trained,
    };
  });

  const tiles = [
    { id: "training", label: "Treino",   sub: "Plano com IA",        icon: Dumbbell,   tint: "from-violet-500/25 to-violet-500/5",  ring: "text-violet-400" },
    { id: "running",  label: "Corrida",  sub: "Iniciar atividade",   icon: MapPin,     tint: "from-sky-500/25 to-sky-500/5",         ring: "text-sky-400" },
    { id: "nutrition",label: "Nutrição", sub: "Dieta personalizada", icon: Apple,      tint: "from-emerald-500/25 to-emerald-500/5", ring: "text-emerald-400" },
    { id: "progress", label: "Progresso",sub: "Sua evolução",        icon: TrendingUp, tint: "from-amber-500/25 to-amber-500/5",     ring: "text-amber-400" },
  ] as const;

  return (
    <motion.div
      className="pb-28 px-5 pt-6 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* ============ Top bar (Gymrats-style) ============ */}
      <motion.header variants={fadeUp} className="flex items-center gap-2 mb-5">
        {/* Following pill */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 h-10 px-3 rounded-full bg-card border border-border/60 text-foreground"
        >
          <Users className="w-4 h-4" />
          <span className="text-[14px] font-semibold">Seguindo</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>

        {/* PRO badge */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setCurrentTab("premium")}
          className="h-7 px-3 rounded-full bg-yellow-400 text-black text-[11px] font-extrabold tracking-wider shadow-[0_4px_14px_-4px_hsl(48_100%_50%/0.6)]"
        >
          {isPremium ? "PRO" : "PRO"}
        </motion.button>

        <div className="flex-1" />

        {/* Streak fire */}
        <motion.div
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-card border border-border/60"
        >
          <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} fill={streak > 0 ? "currentColor" : "none"} />
          <span className="text-[14px] font-semibold tabular text-foreground">{streak}</span>
        </motion.div>

        {/* Bell */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:bg-card transition-colors"
        >
          <Bell className="w-5 h-5" />
        </motion.button>
      </motion.header>

      {/* ============ Day timeline + Start workout card ============ */}
      <motion.section variants={fadeUp} className="flex items-end gap-3 mb-8">
        {/* Days */}
        <div className="flex-1 flex justify-between items-end">
          {timeline.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, ease: easeApple, duration: 0.4 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className={`text-[12px] font-medium ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>
                {d.label}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  d.isToday
                    ? "border-primary text-primary"
                    : d.isFuture
                      ? "border-border/60 text-muted-foreground/40"
                      : d.trained
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground/60"
                }`}
              >
                {d.isToday ? (
                  <span className="block w-2.5 h-0.5 bg-primary rounded-full" />
                ) : d.trained ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Start workout card */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setCurrentTab("training")}
          className="shrink-0 flex items-center gap-2 h-[58px] px-4 rounded-2xl bg-card border border-border/60 text-left"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium leading-none">Treino</p>
            <p className="text-[14px] font-extrabold text-foreground tracking-wide mt-1">INICIAR</p>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground" />
        </motion.button>
      </motion.section>

      {/* ============ Greeting (compacto) ============ */}
      <motion.div variants={fadeUp} className="mb-8">
        <p className="text-[14px] text-muted-foreground tracking-tight mb-1">{greeting},</p>
        <AnimatedText
          as="h1"
          text={name}
          gradient
          delay={0.1}
          duration={0.6}
          className="text-[34px] leading-[1.05] font-bold tracking-[-0.04em] block"
        />
        {trainedToday && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springSnappy, delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10"
          >
            <span className="w-1.5 h-1.5 rounded-full accent-dot" />
            <span className="text-[12px] font-medium text-primary">Treinado hoje</span>
          </motion.div>
        )}
      </motion.div>

      {/* Streak card */}
      <motion.section variants={fadeUp} className="mb-10">
        <div className="flex items-baseline justify-between mb-4 px-1">
          <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Esta semana</h2>
          <span className="text-[13px] text-muted-foreground tabular">
            {activeWeek.filter(Boolean).length}/7
          </span>
        </div>
        <motion.div
          whileHover={{ y: -2, transition: springSnappy }}
          className="bg-card rounded-2xl p-5 border border-border/40"
        >
          <div className="flex items-center gap-2 mb-5">
            <Flame className={`w-4 h-4 transition-colors ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[15px] font-medium text-foreground">
              {streak > 0 ? `${streak} dia${streak > 1 ? "s" : ""} de sequência` : "Sem sequência"}
            </span>
          </div>
          <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex justify-between">
            {weekDayLabels.map((d, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-muted-foreground tabular">{d}</span>
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: activeWeek[i] ? 1 : 0.85 }}
                  transition={{ ...springSnappy, delay: i * 0.04 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    activeWeek[i] ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  {activeWeek[i] && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Activity tiles */}
      <motion.section variants={fadeUp}>
        <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3 px-1">Atividades</h2>
        <motion.div variants={staggerFast} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <motion.button
              key={t.id}
              variants={fadeUp}
              whileHover={{ y: -4, transition: springSnappy }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentTab(t.id)}
              className="group relative overflow-hidden bg-card rounded-2xl p-4 text-left border border-border/40"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${t.tint} opacity-80 pointer-events-none`} />
              <div className="relative flex flex-col gap-3">
                <motion.div
                  whileHover={{ rotate: -6, scale: 1.06 }}
                  transition={springSnappy}
                  className="w-10 h-10 rounded-xl bg-background/40 backdrop-blur-sm flex items-center justify-center shadow-sm"
                >
                  <t.icon className={`w-5 h-5 ${t.ring}`} strokeWidth={2.2} />
                </motion.div>
                <div>
                  <p className="text-[16px] font-semibold text-foreground tracking-tight">{t.label}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{t.sub}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {!isPremium && (
        <motion.button
          variants={fadeUp}
          whileHover={{ y: -2, transition: springSnappy }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentTab("premium")}
          className="w-full mt-6 py-4 px-5 rounded-2xl bg-card border border-border/40 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[13px] font-bold text-primary">Pro</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-[15px] font-medium text-foreground">EVOCORE Pro</p>
            <p className="text-[13px] text-muted-foreground">Desbloqueie tudo</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default HomeScreen;
