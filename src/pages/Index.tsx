import React from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import evocoreLogo from "@/assets/evocore-logo.png";
import HomeScreen from "@/components/HomeScreen";
import TrainingScreen from "@/components/TrainingScreen";
import RunningScreen from "@/components/RunningScreen";
import NutritionScreen from "@/components/NutritionScreen";
import ProgressScreen from "@/components/ProgressScreen";
import PremiumScreen from "@/components/PremiumScreen";
import ProfileScreen from "@/components/ProfileScreen";
import AIChatScreen from "@/components/AIChatScreen";
import BottomNav from "@/components/BottomNav";

const DynamicBackground = () => {
  const { config } = useTheme();

  return (
    <>
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000"
        style={{ background: config.baseBg }}
      >
        <div
          className="absolute w-[800px] h-[800px] -top-[300px] -left-[200px] blur-[100px]"
          style={{ background: config.orb1, animation: "float-orb-1 25s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[700px] h-[700px] -bottom-[200px] -right-[200px] blur-[100px]"
          style={{ background: config.orb2, animation: "float-orb-2 30s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[600px] h-[600px] top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 blur-[80px]"
          style={{ background: config.orb3, animation: "float-orb-3 20s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[500px] h-[500px] top-[60%] -left-[10%] blur-[90px]"
          style={{ background: config.orb4, animation: "float-orb-4 22s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[400px] h-[400px] top-[10%] -right-[5%] blur-[80px]"
          style={{ background: config.orb5, animation: "float-orb-1 18s ease-in-out infinite reverse" }}
        />
      </div>
      <div className="noise-overlay" />
    </>
  );
};

const AppContent = () => {
  const { isLoggedIn, hasOnboarded, currentTab, setCurrentTab } = useApp();

  if (!isLoggedIn) return <LoginScreen />;
  if (!hasOnboarded) return <OnboardingScreen />;

  const renderScreen = () => {
    switch (currentTab) {
      case "home": return <HomeScreen />;
      case "training": return <TrainingScreen />;
      case "running": return <RunningScreen />;
      case "nutrition": return <NutritionScreen />;
      case "progress": return <ProgressScreen />;
      case "premium": return <PremiumScreen />;
      case "profile": return <ProfileScreen />;
      case "ai": return <AIChatScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <DynamicBackground />

      {/* Top bar */}
      <div className="sticky top-0 z-40 glass border-0 border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setCurrentTab("home")} className="active:scale-95 transition-transform">
            <img src={evocoreLogo} alt="EvoCore" className="h-8 object-contain" />
          </button>
          <button
            onClick={() => setCurrentTab(currentTab === "profile" ? "home" : "profile")}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="text-xs font-bold text-foreground">
              {currentTab === "profile" ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      <div className="animate-fade-in" key={currentTab}>
        {renderScreen()}
      </div>
      <BottomNav />
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </AppProvider>
);

export default Index;
