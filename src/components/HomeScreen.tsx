import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, Flame, Dumbbell, Apple, MapPin, TrendingUp, Users, ChevronDown, Search, Check, Bell, AlertCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { TrialCountdown } from "./premium/TrialCountdown";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { useStreak } from "@/hooks/useStreak";
import { useNavigate } from "react-router-dom";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { StreakWidget } from "./StreakWidget";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const { streak, trainedToday, weekDays: activeWeek } = useStreak();
  const { subscription, isActive } = useSubscription();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);
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
      {/* ============ Top bar (Ev0core signature) ============ */}
      <motion.header variants={fadeUp} className="flex items-center gap-2 mb-6">
        {/* Brand mark + Following selector */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="group relative flex items-center gap-2.5 h-11 pl-1.5 pr-3.5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 text-foreground overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-emerald-500/10 opacity-60 pointer-events-none" />
          <span className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]">
            <Users className="w-4 h-4 text-white" strokeWidth={2.4} />
          </span>
          <span className="relative text-[13px] font-semibold tracking-tight">Seguindo</span>
          <ChevronDown className="relative w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>

        {/* PRO badge — Ev0core indigo→green */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setCurrentTab("premium")}
          className="relative h-8 px-3.5 rounded-full text-[11px] font-extrabold tracking-[0.18em] text-white bg-gradient-to-r from-primary via-violet-500 to-emerald-400 shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.7)] overflow-hidden"
        >
          <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] opacity-0 group-hover:opacity-100" />
          PRO
        </motion.button>

        <div className="flex-1" />

        {/* Streak — pill com chama suave */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-1.5 h-10 px-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50"
        >
          <Flame
            className={`w-4 h-4 ${streak > 0 ? "text-orange-400 drop-shadow-[0_0_6px_hsl(25_95%_55%/0.6)]" : "text-muted-foreground"}`}
            fill={streak > 0 ? "currentColor" : "none"}
          />
          <span className="text-[13px] font-bold tabular text-foreground">{streak}</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNotifications(true)}
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
          title="Notificações"
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-foreground bg-card/40 border border-border/40 hover:bg-card/70 transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-primary to-emerald-400 ring-2 ring-background" />
          )}
        </motion.button>

        {/* Search */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/buscar")}
          aria-label="Buscar usuários ou treinos"
          title="Buscar"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-foreground bg-card/40 border border-border/40 hover:bg-card/70 transition-colors"
        >
          <Search className="w-[18px] h-[18px]" strokeWidth={2} />
        </motion.button>
      </motion.header>

      {/* Trial Countdown Banner */}
      {subscription?.status === "trialing" && subscription?.current_period_end && (
        <motion.div
          variants={fadeUp}
          className="mb-6"
        >
          <TrialCountdown expiryDate={new Date(subscription.current_period_end)} />
        </motion.div>
      )}

      {/* Notification Center Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] md:relative md:inset-auto"
          >
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ Week pulse + Start workout (Ev0core) ============ */}
      <motion.section
        variants={fadeUp}
        className="relative mb-8 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden"
      >
        {/* Mesh ambient */}
        <div className="pointer-events-none absolute -top-16 -left-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative flex items-stretch gap-3 p-4">
          {/* Week pulse bars */}
          <div className="flex-1 flex justify-between items-end gap-1">
            {timeline.map((d, i) => {
              const active = d.trained || d.isToday;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, ease: easeApple, duration: 0.45 }}
                  whileTap={{ scale: 0.94 }}
                  className="group flex-1 flex flex-col items-center gap-2"
                >
                  <span className={`text-[11px] font-semibold tracking-tight ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {d.label}
                  </span>
                  <div className="relative w-full h-12 rounded-full bg-background/40 border border-border/40 overflow-hidden flex items-end justify-center">
                    {d.isToday ? (
                      <motion.div
                        initial={{ height: "20%" }}
                        animate={{ height: ["35%", "85%", "55%", "75%"] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-gradient-to-t from-primary via-violet-400 to-emerald-400 shadow-[0_0_18px_hsl(var(--primary)/0.55)]"
                      />
                    ) : d.trained ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: easeApple }}
                        className="w-full bg-gradient-to-t from-primary/70 to-emerald-400/80"
                      />
                    ) : d.isFuture ? (
                      <div className="w-1 h-1 mb-2 rounded-full bg-muted-foreground/30" />
                    ) : (
                      <div className="w-3 h-[2px] mb-[22px] rounded-full bg-muted-foreground/40" />
                    )}
                    {d.isToday && (
                      <span className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Start workout — Ev0core CTA */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setCurrentTab("training")}
            className="relative shrink-0 flex items-center gap-2 px-4 rounded-2xl text-left overflow-hidden bg-gradient-to-br from-primary via-violet-500 to-emerald-400 shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.7)]"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/80 font-semibold leading-none">Treino</p>
              <p className="text-[15px] font-extrabold text-white tracking-wide mt-1.5">INICIAR</p>
            </div>
            <ChevronRight className="relative w-4 h-4 text-white" strokeWidth={2.6} />
          </motion.button>
        </div>
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

      {/* Streak Widget */}
      <motion.section variants={fadeUp} className="mb-10">
        <StreakWidget />
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
              onClick={() => {
                if (t.id === "training") navigate("/workouts");
                else setCurrentTab(t.id);
              }}
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

      {!(isPremium || isActive) && (
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
