import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import {
  ChevronRight,
  Flame,
  Dumbbell,
  Bell,
  Search,
  TrendingUp,
  Clock,
  ArrowRight,
  ListChecks,
  BarChart3,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { TrialCountdown } from "./premium/TrialCountdown";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { useStreak } from "@/hooks/useStreak";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useActiveWorkoutPlan } from "@/hooks/useActiveWorkoutPlan";
import { useNavigate } from "react-router-dom";
import evocoreLogo from "@/assets/evocore-logo.jpeg";
import { fadeUp, stagger, easeApple } from "@/lib/motion";

const HomeScreen = () => {
  const { userProfile, setCurrentTab, user } = useApp();
  const { streak, weekDays: activeWeek } = useStreak();
  const { stats } = useProfileStats();
  const { activePlan } = useActiveWorkoutPlan();
  const { subscription } = useSubscription();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const name = (userProfile.name || "Atleta").split(" ")[0];

  // Avatar
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const stored = data?.avatar_url ?? null;
        if (!stored) return;
        if (/^https?:\/\//i.test(stored)) return setAvatarUrl(stored);
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(stored);
        setAvatarUrl(pub.publicUrl);
      });
  }, [user]);

  // Week — Seg..Dom centered as in reference
  const todayDow = new Date().getDay();
  const monday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((todayDow + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const dayShortPt = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  // Build 7-day window starting Monday
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === new Date().toDateString();
    const isFuture = d > new Date() && !isToday;
    const trained = activeWeek[i] ?? false;
    return { label: dayShortPt[d.getDay()], isToday, isFuture, trained };
  });

  // Today's workout
  const todayWorkoutName =
    activePlan?.template?.name || activePlan?.custom_name || "Sem treino ativo";
  const todayWorkoutSub =
    activePlan?.template?.focus || activePlan?.template?.description || "Crie seu plano";
  const todayDuration = activePlan?.template?.duration_min || activePlan?.template?.duration || 45;
  const todayLevel =
    activePlan?.template?.level || activePlan?.template?.difficulty || "Intermediário";

  // Format total time roughly: totalWorkouts * ~45min, fallback to 0
  const totalMinutes = stats.totalWorkouts * 45;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRestMin = totalMinutes % 60;
  const totalTimeLabel = stats.totalWorkouts > 0 ? `${totalHours}h${totalRestMin.toString().padStart(2, "0")}m` : "0h00m";

  // Frequência: % of week days trained
  const trainedThisWeek = activeWeek.filter(Boolean).length;
  const freqPct = Math.round((trainedThisWeek / 7) * 100);

  return (
    <div className="relative min-h-screen">
      {/* Ambient background — premium */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-violet-600/25 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-32 w-[320px] h-[320px] rounded-full bg-blue-700/15 blur-3xl" />
      </div>

      <motion.div
        className="relative pb-28 px-5 pt-5 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* ============ Header ============ */}
        <motion.header variants={fadeUp} className="flex items-center justify-between mb-7">
          {/* Brand — real logo */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center active:opacity-70 transition-opacity"
            aria-label="EvoCore"
          >
            <img
              src={evocoreLogo}
              alt="EvoCore"
              className="h-10 w-auto object-contain"
              style={{ filter: "drop-shadow(0 4px 16px rgba(99,102,241,0.35))" }}
            />
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotifications(true)}
              aria-label="Notificações"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-white/85 bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate("/buscar")}
              aria-label="Buscar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/85 bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.06] transition-colors"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setCurrentTab("profile")}
              aria-label="Perfil"
              className="relative w-10 h-10 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white/80" strokeWidth={1.8} />
                )}
              </div>
            </motion.button>
          </div>
        </motion.header>

        {/* Trial banner */}
        {subscription?.status === "trialing" && subscription?.current_period_end && (
          <motion.div variants={fadeUp} className="mb-5">
            <TrialCountdown expiryDate={new Date(subscription.current_period_end)} />
          </motion.div>
        )}

        {/* ============ Greeting card ============ */}
        <motion.section
          variants={fadeUp}
          className="relative mb-3 rounded-[28px] p-5 bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-20 -right-10 w-56 h-56 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative w-[60px] h-[60px] rounded-full p-[1.5px] bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white/80" strokeWidth={1.6} />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] leading-tight font-bold text-white tracking-[-0.02em] truncate">
                Olá, {name}!
              </h1>
              <p className="text-[13px] text-white/55 mt-0.5 truncate">
                Foco hoje, resultado sempre.
              </p>
              {streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, ease: easeApple }}
                  className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20"
                >
                  <Flame className="w-3 h-3 text-violet-300" fill="currentColor" />
                  <span className="text-[11px] font-semibold text-violet-200">
                    {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ============ Stats grid (2x2 mobile) ============ */}
        <motion.section variants={fadeUp} className="grid grid-cols-2 gap-2.5 mb-6">
          {[
            {
              icon: Flame,
              value: String(streak),
              label: "Sequência",
              hint: streak > 0 ? `${streak} dias` : "comece hoje",
              color: "text-violet-300",
              glow: "bg-violet-500/10",
            },
            {
              icon: Dumbbell,
              value: String(stats.totalWorkouts),
              label: "Treinos",
              hint: "este mês",
              color: "text-indigo-300",
              glow: "bg-indigo-500/10",
            },
            {
              icon: Clock,
              value: totalTimeLabel,
              label: "Tempo total",
              hint: "este mês",
              color: "text-blue-300",
              glow: "bg-blue-500/10",
            },
            {
              icon: TrendingUp,
              value: `${freqPct}%`,
              label: "Frequência",
              hint: "esta semana",
              color: "text-indigo-300",
              glow: "bg-indigo-500/10",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i + 0.1, ease: easeApple }}
              className="relative rounded-[20px] p-3.5 bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl overflow-hidden"
            >
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${s.glow} blur-2xl pointer-events-none`} />
              <div className="relative flex items-center gap-2 mb-1.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} strokeWidth={2.2} />
                <span className="text-[11px] font-medium text-white/55 tracking-tight">{s.label}</span>
              </div>
              <p className="relative text-[20px] font-bold text-white tracking-[-0.02em] leading-none">
                {s.value}
              </p>
              <p className={`relative text-[10.5px] mt-1.5 ${s.color} font-medium`}>{s.hint}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ============ Plano semanal ============ */}
        <motion.section
          variants={fadeUp}
          className="relative mb-4 rounded-[28px] p-5 bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl overflow-hidden"
        >
          <div className="pointer-events-none absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <h2 className="relative text-[17px] font-bold text-white tracking-[-0.02em]">
            Seu plano semanal
          </h2>
          <p className="relative text-[12.5px] text-white/50 mt-0.5 mb-5">
            A constância é o que transforma.
          </p>

          <div className="relative grid grid-cols-7 gap-1">
            {week.map((d, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i + 0.15, ease: easeApple }}
                whileTap={{ scale: 0.94 }}
                className="flex flex-col items-center gap-2.5"
              >
                <span
                  className={`text-[10.5px] font-semibold tracking-[0.06em] ${
                    d.isToday ? "text-indigo-300" : "text-white/45"
                  }`}
                >
                  {d.label}
                </span>
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {d.isToday ? (
                    <>
                      <motion.span
                        animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.15, 0.55] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-indigo-500/40 blur-md"
                      />
                      <span className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_18px_-2px_rgba(99,102,241,0.7)]">
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </span>
                    </>
                  ) : d.trained ? (
                    <span className="w-8 h-8 rounded-full border border-violet-400/40 bg-violet-500/10 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-violet-300" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8.5L6.5 12L13 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                        d.isFuture
                          ? "border-white/[0.06] bg-white/[0.02]"
                          : "border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                    </span>
                  )}
                </div>
                {d.isToday && (
                  <span className="w-5 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ============ Treino de hoje ============ */}
        <motion.button
          variants={fadeUp}
          whileTap={{ scale: 0.985 }}
          onClick={() => navigate("/workouts")}
          className="relative w-full text-left mb-4 rounded-[28px] overflow-hidden border border-white/[0.08] bg-gradient-to-br from-indigo-950/80 via-[#0c1230] to-black"
        >
          {/* Subtle backdrop visual */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.35),transparent_55%)]" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.5),transparent_60%)]" />

          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Dumbbell className="w-3 h-3 text-indigo-300" strokeWidth={2.4} />
              </div>
              <span className="text-[10.5px] font-bold tracking-[0.18em] text-indigo-300/90">
                TREINO DE HOJE
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[24px] font-bold text-white tracking-[-0.02em] leading-tight truncate">
                  {todayWorkoutName}
                </h3>
                <p className="text-[13px] text-white/55 mt-1 truncate">{todayWorkoutSub}</p>

                <div className="flex items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06]">
                    <Clock className="w-3 h-3 text-white/70" strokeWidth={2} />
                    <span className="text-[11px] font-medium text-white/80">{todayDuration} min</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06]">
                    <BarChart3 className="w-3 h-3 text-white/70" strokeWidth={2} />
                    <span className="text-[11px] font-medium text-white/80 capitalize">{todayLevel}</span>
                  </span>
                </div>
              </div>

              <motion.span
                animate={{ boxShadow: ["0 0 0 0 rgba(99,102,241,0.45)", "0 0 0 10px rgba(99,102,241,0)"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.4} />
              </motion.span>
            </div>
          </div>

          <div className="relative border-t border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-300" strokeWidth={2} />
              <span className="text-[13px] font-medium text-white/80">Ver exercícios do dia</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
        </motion.button>
      </motion.div>

      {/* Notification overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100]"
          >
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeScreen;
