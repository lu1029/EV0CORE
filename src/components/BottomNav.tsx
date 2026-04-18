import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Dumbbell, MapPin, Apple, TrendingUp } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/treinos", label: "Treino", icon: Dumbbell },
  { to: "/corrida", label: "Corrida", icon: MapPin },
  { to: "/nutricao", label: "Nutrição", icon: Apple },
  { to: "/evolucao", label: "Progresso", icon: TrendingUp },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-0 border-t border-border/20 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-[48px] min-h-[48px] justify-center active:scale-90 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={`w-5 h-5 transition-all ${isActive ? "drop-shadow-[0_0_8px_hsl(239,84%,67%,0.5)]" : ""}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : ""}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full gradient-primary mt-0.5 animate-scale-in" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
