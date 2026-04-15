import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserProfile {
  name: string;
  email: string;
  gender: "male" | "female" | "";
  age: number;
  weight: number;
  height: number;
  goal: string;
  level: string;
  preference: string;
  daysPerWeek: number;
}

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  currentTab: string;
  setCurrentTab: (v: string) => void;
  userProfile: UserProfile;
  setUserProfile: (v: UserProfile) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  gender: "",
  age: 25,
  weight: 70,
  height: 175,
  goal: "",
  level: "",
  preference: "",
  daysPerWeek: 4,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currentTab, setCurrentTab] = useState("home");
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isPremium, setIsPremium] = useState(false);

  return (
    <AppContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      hasOnboarded, setHasOnboarded,
      currentTab, setCurrentTab,
      userProfile, setUserProfile,
      isPremium, setIsPremium,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
