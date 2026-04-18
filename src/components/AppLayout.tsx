import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import BottomNav from "@/components/BottomNav";
import evocoreLogo from "@/assets/evocore-logo.png";

const DynamicBackground = () => {
  const { config } = useTheme();
  return (
    <>
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000"
        style={{ background: config.baseBg }}
      >
        <div className="absolute w-[800px] h-[800px] -top-[300px] -left-[200px] blur-[100px]"
          style={{ background: config.orb1, animation: "float-orb-1 25s ease-in-out infinite" }} />
        <div className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] blur-[100px]"
          style={{ background: config.orb2, animation: "float-orb-2 30s ease-in-out infinite" }} />
        <div className="absolute w-[600px] h-[600px] top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 blur-[80px]"
          style={{ background: config.orb3, animation: "float-orb-3 20s ease-in-out infinite" }} />
        <div className="absolute w-[500px] h-[500px] top-[60%] -left-[10%] blur-[90px]"
          style={{ background: config.orb4, animation: "float-orb-4 22s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] top-[10%] -right-[5%] blur-[80px]"
          style={{ background: config.orb5, animation: "float-orb-1 18s ease-in-out infinite reverse" }} />
      </div>
      <div className="noise-overlay" />
    </>
  );
};

const AppLayout = () => {
  const { isLoggedIn, hasOnboarded } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoggedIn) return <LoginScreen />;
  if (!hasOnboarded) return <OnboardingScreen />;

  const isProfile = location.pathname.startsWith("/perfil");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <DynamicBackground />

      <div className="sticky top-0 z-40 glass border-0 border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/home")} className="active:scale-95 transition-transform">
            <img src={evocoreLogo} alt="EvoCore" className="h-8 object-contain" />
          </button>
          <button
            onClick={() => navigate(isProfile ? "/home" : "/perfil")}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center active:scale-90 transition-transform"
            aria-label={isProfile ? "Voltar" : "Abrir perfil"}
          >
            <span className="text-xs font-bold text-foreground">{isProfile ? "✕" : "☰"}</span>
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
