import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  Footprints,
  Apple,
  TrendingUp,
  User,
  Users,
  Trophy,
  MoreHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * SmartNavigationBar
 * - 4 abas principais sempre visíveis (Início, Treino, Nutrição, Perfil)
 * - Botão "Mais" abre sheet com as restantes (Corrida, Progresso, Feed, Clubes)
 * - Compatível mobile-first, sem scroll horizontal e sem overflow
 * - Pronto para personalização futura (basta trocar a ordem das tabs)
 */

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const PRIMARY_TABS: Tab[] = [
  { to: "/home",     label: "Início",   icon: Home },
  { to: "/workouts", label: "Treino",   icon: Dumbbell },
  { to: "/nutricao", label: "Nutrição", icon: Apple },
  { to: "/perfil",   label: "Perfil",   icon: User },
];

const SECONDARY_TABS: Tab[] = [
  { to: "/corrida",    label: "Corrida",   icon: Footprints },
  { to: "/evolucao",   label: "Progresso", icon: TrendingUp },
  { to: "/comunidade", label: "Feed",      icon: Users },
  { to: "/clubes",     label: "Clubes",    icon: Trophy },
];

const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];

const isPathActive = (pathname: string, to: string) =>
  pathname === to || (to !== "/home" && pathname.startsWith(to));

const SmartNavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeSecondary = SECONDARY_TABS.find((t) => isPathActive(location.pathname, t.to));
  const moreActive = !!activeSecondary;

  // Close sheet on route change
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  // Close sheet on ESC
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const handleTabClick = () => {
    try { (navigator as any).vibrate?.(8); } catch {}
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 safe-area-bottom pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <div className="relative bg-card/85 backdrop-blur-xl border border-border/60 rounded-full h-16 flex items-center px-2 shadow-[0_10px_40px_-12px_hsl(0_0%_0%/0.6)]">
            <div className="flex items-center justify-around w-full gap-1">
              {PRIMARY_TABS.map((tab) => {
                const isActive = isPathActive(location.pathname, tab.to);
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    aria-label={tab.label}
                    onClick={handleTabClick}
                    className="relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl active:scale-90 transition-transform shrink-0"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="smartnav-active"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-primary/12 border border-primary/25"
                      />
                    )}
                    <tab.icon
                      className={`relative w-[22px] h-[22px] transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </NavLink>
                );
              })}

              {/* "Mais" button */}
              <button
                type="button"
                aria-label="Mais opções"
                aria-expanded={moreOpen}
                onClick={() => { handleTabClick(); setMoreOpen((v) => !v); }}
                className="relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl active:scale-90 transition-transform shrink-0"
              >
                {(moreActive || moreOpen) && !moreOpen && (
                  <motion.span
                    layoutId="smartnav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-primary/12 border border-primary/25"
                  />
                )}
                {moreOpen && (
                  <span className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-primary/12 border border-primary/25" />
                )}
                <MoreHorizontal
                  className={`relative w-[22px] h-[22px] transition-colors ${
                    moreActive || moreOpen ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={moreActive || moreOpen ? 2.4 : 2}
                />
                {moreActive && !moreOpen && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* "Mais" sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Mais opções"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="fixed bottom-24 left-0 right-0 z-[61] px-4 pointer-events-none"
            >
              <div className="max-w-lg mx-auto pointer-events-auto bg-card/95 backdrop-blur-xl border border-border/60 rounded-3xl p-5 shadow-[0_20px_60px_-20px_hsl(0_0%_0%/0.8)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-bold text-foreground">Mais opções</h3>
                  <button
                    type="button"
                    aria-label="Fechar"
                    onClick={() => setMoreOpen(false)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SECONDARY_TABS.map((tab) => {
                    const isActive = isPathActive(location.pathname, tab.to);
                    return (
                      <button
                        key={tab.to}
                        type="button"
                        onClick={() => { handleTabClick(); navigate(tab.to); setMoreOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all active:scale-95 ${
                          isActive
                            ? "bg-primary/12 border-primary/30"
                            : "bg-secondary/40 border-border/40 hover:border-primary/20"
                        }`}
                      >
                        <tab.icon
                          className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                          strokeWidth={isActive ? 2.4 : 2}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export { ALL_TABS, PRIMARY_TABS, SECONDARY_TABS };
export default SmartNavigationBar;
