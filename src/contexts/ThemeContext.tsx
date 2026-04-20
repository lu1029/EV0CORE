import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
  // Settings (kept for back-compat)
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

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("evocore-theme") as ThemeMode) || "dark";
  });
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  const [units, setUnitsState] = useState<"metric" | "imperial">(
    () => (localStorage.getItem("evocore-units") as "metric" | "imperial") || "metric"
  );
  const [notifications, setNotificationsState] = useState(() => localStorage.getItem("evocore-notif") !== "false");
  const [soundEffects, setSoundEffectsState] = useState(() => localStorage.getItem("evocore-sound") !== "false");
  const [restTimerVibration, setRestTimerVibrationState] = useState(() => localStorage.getItem("evocore-vibration") !== "false");

  const resolvedTheme: "light" | "dark" = mode === "auto" ? systemTheme : mode;

  // Listen to system changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "light" : "dark");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Apply class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [resolvedTheme]);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("evocore-theme", m);
  };

  const toggleTheme = () => {
    setMode(resolvedTheme === "light" ? "dark" : "light");
  };

  const setUnits = (u: "metric" | "imperial") => { setUnitsState(u); localStorage.setItem("evocore-units", u); };
  const setNotifications = (n: boolean) => { setNotificationsState(n); localStorage.setItem("evocore-notif", String(n)); };
  const setSoundEffects = (s: boolean) => { setSoundEffectsState(s); localStorage.setItem("evocore-sound", String(s)); };
  const setRestTimerVibration = (v: boolean) => { setRestTimerVibrationState(v); localStorage.setItem("evocore-vibration", String(v)); };

  return (
    <ThemeContext.Provider value={{
      mode, setMode, resolvedTheme, toggleTheme,
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
      mode: "dark" as ThemeMode,
      setMode: () => {},
      resolvedTheme: "dark" as const,
      toggleTheme: () => {},
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
