import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import evocoreLogo from "@/assets/evocore-logo.png";

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
    let mounted = true;

    const loadProfile = async (userId: string, email: string, metadata: any) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!mounted) return;

        if (profile) {
          setUserProfile({
            name: profile.name || metadata?.full_name || metadata?.name || "",
            email: profile.email || email || "",
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
          if (profile.goal) {
            setHasOnboarded(true);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    // Get initial session first, then listen for changes
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoggedIn(!!initialSession?.user);

      if (initialSession?.user) {
        setUserProfile((prev) => ({
          ...prev,
          email: initialSession.user.email ?? prev.email,
          name: initialSession.user.user_metadata?.full_name ?? initialSession.user.user_metadata?.name ?? prev.name,
        }));
        loadProfile(
          initialSession.user.id,
          initialSession.user.email ?? "",
          initialSession.user.user_metadata
        ).finally(() => { if (mounted) setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoggedIn(!!newSession?.user);

        if (newSession?.user) {
          setUserProfile((prev) => ({
            ...prev,
            email: newSession.user.email ?? prev.email,
            name: newSession.user.user_metadata?.full_name ?? newSession.user.user_metadata?.name ?? prev.name,
          }));
          // Don't await inside onAuthStateChange to avoid deadlocks
          loadProfile(
            newSession.user.id,
            newSession.user.email ?? "",
            newSession.user.user_metadata
          );
        } else {
          setHasOnboarded(false);
          setUserProfile(defaultProfile);
          setIsPremium(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
        <div className="mesh-bg">
          <div className="mesh-bg-extra" />
          <div className="mesh-bg-orb-4" />
        </div>
        <div className="noise-overlay" />
        <div className="relative z-10 text-center animate-fade-in">
          <img
            src={evocoreLogo}
            alt="EvoCore"
            className="h-20 w-auto object-contain mx-auto mb-6 drop-shadow-[0_0_40px_hsl(239,84%,67%,0.4)] animate-pulse-glow"
            style={{ borderRadius: '1rem' }}
          />
          <p className="text-sm text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            Preparando seu treino...
          </p>
          <div className="flex justify-center gap-1.5 animate-fade-in" style={{ animationDelay: '500ms' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                style={{
                  animation: `pulse-glow 1.2s ease-in-out infinite ${i * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
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
  if (!ctx) {
    // During HMR, context may temporarily be null — return safe defaults
    console.warn("useApp called outside AppProvider (likely HMR refresh)");
    return {
      isLoggedIn: false, setIsLoggedIn: () => {},
      hasOnboarded: false, setHasOnboarded: () => {},
      currentTab: "home", setCurrentTab: () => {},
      userProfile: { name: "", email: "", gender: "" as const, age: 25, weight: 70, height: 175, goal: "", level: "", preference: "", daysPerWeek: 4 },
      setUserProfile: () => {},
      isPremium: false, setIsPremium: () => {},
      user: null, session: null, loading: true,
    } as any;
  }
  return ctx;
};
