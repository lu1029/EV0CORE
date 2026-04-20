import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import BottomNav from "@/components/BottomNav";
import evocoreLogo from "@/assets/evocore-logo.png";

const AppLayout = () => {
  const { isLoggedIn, hasOnboarded } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoggedIn) return <LoginScreen />;
  if (!hasOnboarded) return <OnboardingScreen />;

  const isProfile = location.pathname.startsWith("/perfil");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {/* iOS-style large title bar */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-5 py-3 safe-area-top">
          <button onClick={() => navigate("/home")} className="active:opacity-60 transition-opacity">
            <img src={evocoreLogo} alt="EvoCore" className="h-7 object-contain" />
          </button>
          <button
            onClick={() => navigate(isProfile ? "/home" : "/perfil")}
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center active:opacity-60 transition-opacity"
            aria-label={isProfile ? "Fechar" : "Abrir perfil"}
          >
            <span className="text-[13px] font-semibold text-foreground">{isProfile ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <div className="animate-fade-in" key={location.pathname}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
