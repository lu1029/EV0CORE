import React from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import HomeScreen from "@/components/HomeScreen";
import TrainingScreen from "@/components/TrainingScreen";
import RunningScreen from "@/components/RunningScreen";
import NutritionScreen from "@/components/NutritionScreen";
import ProgressScreen from "@/components/ProgressScreen";
import PremiumScreen from "@/components/PremiumScreen";
import ProfileScreen from "@/components/ProfileScreen";
import AIChatScreen from "@/components/AIChatScreen";
import BottomNav from "@/components/BottomNav";

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
      {/* Mesh gradient background */}
      <div className="mesh-bg">
        <div className="mesh-bg-extra" />
      </div>
      <div className="noise-overlay" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 glass border-0 border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setCurrentTab("home")} className="active:scale-95 transition-transform">
            <h2 className="text-sm font-heading font-bold text-gradient tracking-wider">EVOCORE</h2>
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

      <div className="animate-fade-in">
        {renderScreen()}
      </div>
      <BottomNav />
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
