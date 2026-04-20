import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Dumbbell, MapPin, Apple, TrendingUp } from "lucide-react";

/**
 * iOS-style tab bar — icons only, blurred glass, hairline top border,
 * subtle haptic feedback on tap. No labels, no glow, no decoration.
 */
const BottomNav = () => {
  const { t } = useTranslation();
  const tabs = [
    { to: "/home", label: t("nav.home"), icon: Home },
    { to: "/treinos", label: t("nav.training"), icon: Dumbbell },
    { to: "/corrida", label: t("nav.running"), icon: MapPin },
    { to: "/nutricao", label: t("nav.nutrition"), icon: Apple },
    { to: "/evolucao", label: t("nav.progress"), icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-label={tab.label}
            onClick={() => { try { (navigator as any).vibrate?.(8); } catch {} }}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 active:opacity-50 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <tab.icon className="w-[26px] h-[26px]" strokeWidth={isActiveIconStroke()} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

// Lucide doesn't expose isActive here directly; keep stroke uniform — Apple uses 1.75-2.
function isActiveIconStroke() {
  return 2;
}

export default BottomNav;
