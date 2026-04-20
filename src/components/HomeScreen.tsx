import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, Flame, Dumbbell, Apple, MapPin, TrendingUp } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, isPremium } = useApp();
  const { streak, trainedToday, weekDays: activeWeek } = useStreak();
  const name = userProfile.name || "Atleta";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const weekDayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

  const tiles = [
    { id: "training", label: "Treino", sub: "Plano com IA",        icon: Dumbbell,    tint: "from-violet-500/25 to-violet-500/5",  ring: "text-violet-400" },
    { id: "running",  label: "Corrida", sub: "Iniciar atividade",  icon: MapPin,      tint: "from-sky-500/25 to-sky-500/5",         ring: "text-sky-400" },
    { id: "nutrition",label: "Nutrição",sub: "Dieta personalizada",icon: Apple,       tint: "from-emerald-500/25 to-emerald-500/5", ring: "text-emerald-400" },
    { id: "progress", label: "Progresso",sub: "Sua evolução",      icon: TrendingUp,  tint: "from-amber-500/25 to-amber-500/5",     ring: "text-amber-400" },
  ] as const;

  return (
    <motion.div
      className="pb-28 px-5 pt-10 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.header variants={fadeUp} className="text-center mb-12">
        <p className="text-[15px] text-muted-foreground tracking-tight mb-2">{greeting},</p>
        <motion.h1
          initial={{ opacity: 0, y: 16, letterSpacing: "0em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.04em" }}
          transition={{ duration: 0.6, ease: easeApple, delay: 0.1 }}
          className="text-[44px] leading-[1.05] font-bold text-foreground"
        >
          {name}
        </motion.h1>
        {trainedToday && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springSnappy, delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-primary/10"
          >
            <span className="w-1.5 h-1.5 rounded-full accent-dot" />
            <span className="text-[12px] font-medium text-primary">Treinado hoje</span>
          </motion.div>
        )}
      </motion.header>

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
