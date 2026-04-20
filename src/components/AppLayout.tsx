import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import BottomNav from "@/components/BottomNav";
import EvoAIFab from "@/components/EvoAIFab";
import { Sun, Moon } from "lucide-react";
import evocoreLogo from "@/assets/evocore-logo.png";

const AppLayout = () => {
  const { isLoggedIn, hasOnboarded } = useApp();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoggedIn) return <LoginScreen />;
  if (!hasOnboarded) return <OnboardingScreen />;

  const isProfile = location.pathname.startsWith("/perfil");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {/* iOS-style header with theme toggle */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-5 py-3 safe-area-top">
          <button onClick={() => navigate("/home")} className="active:opacity-60 transition-opacity">
            <img src={evocoreLogo} alt="EvoCore" className="h-7 object-contain" />
          </button>
          <div className="flex items-center gap-2">
            {/* Theme toggle pill — sun/moon */}
            <button
              onClick={toggleTheme}
              aria-label={resolvedTheme === "dark" ? "Mudar para claro" : "Mudar para escuro"}
              className="relative w-14 h-8 rounded-full bg-secondary flex items-center px-1 transition-colors active:opacity-70"
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-card shadow-sm flex items-center justify-center transition-all duration-300 ease-out ${
                  resolvedTheme === "dark" ? "translate-x-0" : "translate-x-6"
                }`}
              >
                {resolvedTheme === "dark"
                  ? <Moon className="w-3.5 h-3.5 text-foreground" />
                  : <Sun className="w-3.5 h-3.5 text-primary" />}
              </span>
              <Sun className={`w-3.5 h-3.5 ml-1 transition-opacity ${resolvedTheme === "dark" ? "opacity-30" : "opacity-0"} text-muted-foreground`} />
              <Moon className={`w-3.5 h-3.5 ml-auto mr-1 transition-opacity ${resolvedTheme === "dark" ? "opacity-0" : "opacity-30"} text-muted-foreground`} />
            </button>

            <button
              onClick={() => navigate(isProfile ? "/home" : "/perfil")}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:opacity-60 transition-opacity"
              aria-label={isProfile ? "Fechar" : "Abrir perfil"}
            >
              <span className="text-[13px] font-semibold text-foreground">{isProfile ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="animate-fade-in" key={location.pathname}>
        <Outlet />
      </div>
      <EvoAIFab />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
