import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Dumbbell, Footprints, Apple, TrendingUp, User, Users, Trophy, PlayCircle } from "lucide-react";

/**
 * Bottom tab bar — 8 tabs (added Comunidade + Clubes).
 * Floating pill, rounded, with active highlight + sliding pill.
 * Horizontal scroll for narrow screens.
 */
const BottomNav = () => {
  const location = useLocation();
  const tabs = [
    { to: "/home",       label: "Início",    icon: Home },
    { to: "/treinos",    label: "Treino",    icon: Dumbbell },
    { to: "/corrida",    label: "Corrida",   icon: Footprints },
    { to: "/nutricao",   label: "Nutrição",  icon: Apple },
    { to: "/evolucao",   label: "Progresso", icon: TrendingUp },
    { to: "/comunidade", label: "Feed",      icon: Users },
    { to: "/clipes",     label: "Clipes",    icon: PlayCircle },
    { to: "/clubes",     label: "Clubes",    icon: Trophy },
    { to: "/perfil",     label: "Perfil",    icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 safe-area-bottom pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="relative bg-card/85 backdrop-blur-xl border border-border/60 rounded-full h-16 flex items-center px-2 shadow-[0_10px_40px_-12px_hsl(0_0%_0%/0.6)] overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-around w-full min-w-max gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to || (tab.to !== "/home" && location.pathname.startsWith(tab.to));
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                onClick={() => { try { (navigator as any).vibrate?.(8); } catch {} }}
                className="relative flex items-center justify-center w-11 h-11 rounded-2xl active:scale-90 transition-transform shrink-0"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 m-auto w-11 h-11 rounded-2xl bg-primary/12 border border-primary/25"
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
