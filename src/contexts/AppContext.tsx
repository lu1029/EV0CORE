import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  user: User | null;
  session: Session | null;
  loading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoggedIn(!!newSession?.user);

        if (newSession?.user) {
          setUserProfile((prev) => ({
            ...prev,
            email: newSession.user.email ?? prev.email,
            name: newSession.user.user_metadata?.full_name ?? newSession.user.user_metadata?.name ?? prev.name,
          }));

          // Load profile from DB
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", newSession.user.id)
            .single();

          if (profile) {
            setUserProfile({
              name: profile.name || newSession.user.user_metadata?.full_name || "",
              email: profile.email || newSession.user.email || "",
              gender: (profile.gender as "male" | "female" | "") || "",
              age: profile.age ?? 25,
              weight: Number(profile.weight) ?? 70,
              height: Number(profile.height) ?? 175,
              goal: profile.goal || "",
              level: profile.level || "",
              preference: profile.preference || "",
              daysPerWeek: profile.days_per_week ?? 4,
            });
            setIsPremium(profile.is_premium ?? false);
            // If profile has goal set, user has onboarded
            if (profile.goal) {
              setHasOnboarded(true);
            }
          }
        } else {
          setHasOnboarded(false);
          setUserProfile(defaultProfile);
          setIsPremium(false);
        }

        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!initialSession) setLoading(false);
      // onAuthStateChange will handle the rest
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save profile to DB when onboarding completes
  const handleSetHasOnboarded = async (v: boolean) => {
    setHasOnboarded(v);
    if (v && user) {
      await supabase.from("profiles").update({
        name: userProfile.name,
        gender: userProfile.gender,
        age: userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        goal: userProfile.goal,
        level: userProfile.level,
        preference: userProfile.preference,
        days_per_week: userProfile.daysPerWeek,
      }).eq("user_id", user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-gradient mb-2">EVOCORE</h1>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      hasOnboarded, setHasOnboarded: handleSetHasOnboarded,
      currentTab, setCurrentTab,
      userProfile, setUserProfile,
      isPremium, setIsPremium,
      user, session, loading,
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
