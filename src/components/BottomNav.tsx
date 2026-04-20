import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Dumbbell, Footprints, Apple, TrendingUp } from "lucide-react";

/**
 * iOS-style tab bar — 5 tabs. EvoAI is now a floating button (see EvoAIFab).
 */
const BottomNav = () => {
  const { t } = useTranslation();
  const tabs = [
    { to: "/home", label: t("nav.home"), icon: Home },
    { to: "/treinos", label: t("nav.training"), icon: Dumbbell },
    { to: "/corrida", label: t("nav.running"), icon: Footprints },
    { to: "/nutricao", label: t("nav.nutrition"), icon: Apple },
    { to: "/evolucao", label: t("nav.progress"), icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-label={tab.label}
            onClick={() => { try { (navigator as any).vibrate?.(8); } catch {} }}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <tab.icon
                className={`w-[24px] h-[24px] transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.4 : 2}
              />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
