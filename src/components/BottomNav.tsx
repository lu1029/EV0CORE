import React from "react";
import { Home, Dumbbell, MapPin, Apple, TrendingUp } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "training", label: "Treino", icon: Dumbbell },
  { id: "running", label: "Corrida", icon: MapPin },
  { id: "nutrition", label: "Nutrição", icon: Apple },
  { id: "progress", label: "Progresso", icon: TrendingUp },
];

const BottomNav = () => {
  const { currentTab, setCurrentTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(142,71%,45%,0.5)]" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full gradient-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
