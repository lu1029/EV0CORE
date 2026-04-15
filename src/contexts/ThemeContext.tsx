import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeBackground = "default" | "midnight" | "ocean" | "forest" | "sunset" | "neon" | "minimal";

interface ThemeConfig {
  name: string;
  label: string;
  emoji: string;
  orb1: string;
  orb2: string;
  orb3: string;
  orb4: string;
  orb5: string;
  baseBg: string;
}

export const themeConfigs: Record<ThemeBackground, ThemeConfig> = {
  default: {
    name: "default",
    label: "Padrão",
    emoji: "🌌",
    orb1: "radial-gradient(circle, hsl(280 70% 55% / 0.25) 0%, hsl(239 84% 67% / 0.15) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(142 71% 45% / 0.18) 0%, hsl(160 84% 39% / 0.08) 40%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, hsl(239 84% 67% / 0.05) 50%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(239 84% 67% / 0.12) 0%, hsl(280 70% 55% / 0.06) 50%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(280 70% 55% / 0.15) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(239 60% 15% / 0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, hsl(142 50% 12% / 0.3) 0%, transparent 50%), hsl(222 47% 7%)",
  },
  midnight: {
    name: "midnight",
    label: "Meia-noite",
    emoji: "🌙",
    orb1: "radial-gradient(circle, hsl(250 80% 40% / 0.3) 0%, hsl(260 70% 30% / 0.15) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(220 80% 50% / 0.15) 0%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(240 60% 50% / 0.12) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(270 60% 40% / 0.1) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(230 70% 45% / 0.12) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(250 60% 10% / 0.6) 0%, transparent 60%), hsl(230 50% 5%)",
  },
  ocean: {
    name: "ocean",
    label: "Oceano",
    emoji: "🌊",
    orb1: "radial-gradient(circle, hsl(200 80% 50% / 0.25) 0%, hsl(210 70% 40% / 0.12) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(180 70% 45% / 0.2) 0%, hsl(190 60% 35% / 0.08) 40%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(195 80% 50% / 0.15) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(210 70% 50% / 0.1) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(170 60% 40% / 0.12) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(200 60% 12% / 0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, hsl(180 50% 10% / 0.3) 0%, transparent 50%), hsl(210 50% 6%)",
  },
  forest: {
    name: "forest",
    label: "Floresta",
    emoji: "🌿",
    orb1: "radial-gradient(circle, hsl(140 60% 40% / 0.25) 0%, hsl(150 50% 30% / 0.12) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(120 50% 35% / 0.18) 0%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(160 60% 40% / 0.12) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(130 50% 30% / 0.1) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(100 40% 35% / 0.12) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(140 50% 10% / 0.5) 0%, transparent 60%), hsl(150 40% 6%)",
  },
  sunset: {
    name: "sunset",
    label: "Pôr do sol",
    emoji: "🌅",
    orb1: "radial-gradient(circle, hsl(20 80% 50% / 0.25) 0%, hsl(350 70% 45% / 0.12) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(40 70% 50% / 0.18) 0%, hsl(30 60% 40% / 0.08) 40%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(10 70% 55% / 0.12) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(340 60% 45% / 0.1) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(50 60% 45% / 0.12) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(20 60% 12% / 0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, hsl(350 40% 10% / 0.3) 0%, transparent 50%), hsl(15 45% 6%)",
  },
  neon: {
    name: "neon",
    label: "Neon",
    emoji: "💜",
    orb1: "radial-gradient(circle, hsl(300 80% 55% / 0.3) 0%, hsl(280 70% 50% / 0.15) 40%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(180 90% 50% / 0.2) 0%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(320 80% 55% / 0.15) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(260 70% 50% / 0.12) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(190 80% 50% / 0.15) 0%, transparent 70%)",
    baseBg: "radial-gradient(ellipse at 50% 0%, hsl(300 60% 12% / 0.5) 0%, transparent 60%), hsl(280 50% 5%)",
  },
  minimal: {
    name: "minimal",
    label: "Minimalista",
    emoji: "⬛",
    orb1: "radial-gradient(circle, hsl(0 0% 30% / 0.1) 0%, transparent 70%)",
    orb2: "radial-gradient(circle, hsl(0 0% 25% / 0.08) 0%, transparent 70%)",
    orb3: "radial-gradient(circle, hsl(0 0% 20% / 0.06) 0%, transparent 70%)",
    orb4: "radial-gradient(circle, hsl(0 0% 25% / 0.05) 0%, transparent 70%)",
    orb5: "radial-gradient(circle, hsl(0 0% 20% / 0.04) 0%, transparent 70%)",
    baseBg: "hsl(0 0% 5%)",
  },
};

interface ThemeContextType {
  background: ThemeBackground;
  setBackground: (bg: ThemeBackground) => void;
  config: ThemeConfig;
  // Settings
  units: "metric" | "imperial";
  setUnits: (u: "metric" | "imperial") => void;
  notifications: boolean;
  setNotifications: (n: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (s: boolean) => void;
  restTimerVibration: boolean;
  setRestTimerVibration: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [background, setBackgroundState] = useState<ThemeBackground>(() => {
    return (localStorage.getItem("evocore-bg") as ThemeBackground) || "default";
  });
  const [units, setUnitsState] = useState<"metric" | "imperial">(() => {
    return (localStorage.getItem("evocore-units") as "metric" | "imperial") || "metric";
  });
  const [notifications, setNotificationsState] = useState(() => {
    return localStorage.getItem("evocore-notif") !== "false";
  });
  const [soundEffects, setSoundEffectsState] = useState(() => {
    return localStorage.getItem("evocore-sound") !== "false";
  });
  const [restTimerVibration, setRestTimerVibrationState] = useState(() => {
    return localStorage.getItem("evocore-vibration") !== "false";
  });

  const setBackground = (bg: ThemeBackground) => {
    setBackgroundState(bg);
    localStorage.setItem("evocore-bg", bg);
  };
  const setUnits = (u: "metric" | "imperial") => {
    setUnitsState(u);
    localStorage.setItem("evocore-units", u);
  };
  const setNotifications = (n: boolean) => {
    setNotificationsState(n);
    localStorage.setItem("evocore-notif", String(n));
  };
  const setSoundEffects = (s: boolean) => {
    setSoundEffectsState(s);
    localStorage.setItem("evocore-sound", String(s));
  };
  const setRestTimerVibration = (v: boolean) => {
    setRestTimerVibrationState(v);
    localStorage.setItem("evocore-vibration", String(v));
  };

  return (
    <ThemeContext.Provider value={{
      background,
      setBackground,
      config: themeConfigs[background],
      units, setUnits,
      notifications, setNotifications,
      soundEffects, setSoundEffects,
      restTimerVibration, setRestTimerVibration,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      background: "default" as ThemeBackground,
      setBackground: () => {},
      config: themeConfigs.default,
      units: "metric" as const,
      setUnits: () => {},
      notifications: true,
      setNotifications: () => {},
      soundEffects: true,
      setSoundEffects: () => {},
      restTimerVibration: true,
      setRestTimerVibration: () => {},
    };
  }
  return ctx;
};
