import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENT_DEFS = [
  { key: "first_workout", name: "Primeiro Passo", description: "Complete seu primeiro treino", icon: "🎯", check: (s: Stats) => s.totalWorkouts >= 1 },
  { key: "5_workouts", name: "Aquecendo", description: "Complete 5 treinos", icon: "💪", check: (s: Stats) => s.totalWorkouts >= 5 },
  { key: "10_workouts", name: "Dedicação", description: "Complete 10 treinos", icon: "🏋️", check: (s: Stats) => s.totalWorkouts >= 10 },
  { key: "25_workouts", name: "Máquina", description: "Complete 25 treinos", icon: "⚡", check: (s: Stats) => s.totalWorkouts >= 25 },
  { key: "50_workouts", name: "Imparável", description: "Complete 50 treinos", icon: "🔥", check: (s: Stats) => s.totalWorkouts >= 50 },
  { key: "100_workouts", name: "Lenda", description: "Complete 100 treinos", icon: "👑", check: (s: Stats) => s.totalWorkouts >= 100 },
  { key: "streak_3", name: "Constância", description: "3 dias consecutivos de treino", icon: "🔥", check: (s: Stats) => s.streak >= 3 },
  { key: "streak_7", name: "Semana Perfeita", description: "7 dias consecutivos de treino", icon: "🗓️", check: (s: Stats) => s.streak >= 7 },
  { key: "streak_14", name: "Duas Semanas", description: "14 dias consecutivos", icon: "⭐", check: (s: Stats) => s.streak >= 14 },
  { key: "streak_30", name: "Mês de Ferro", description: "30 dias consecutivos", icon: "🏆", check: (s: Stats) => s.streak >= 30 },
  { key: "volume_500", name: "Meio Tonelada", description: "Levante 500kg de volume total", icon: "🪨", check: (s: Stats) => s.totalVolume >= 500 },
  { key: "volume_1000", name: "Uma Tonelada", description: "Levante 1.000kg de volume total", icon: "💎", check: (s: Stats) => s.totalVolume >= 1000 },
  { key: "volume_5000", name: "5 Toneladas", description: "Levante 5.000kg de volume total", icon: "🚀", check: (s: Stats) => s.totalVolume >= 5000 },
  { key: "volume_10000", name: "10 Toneladas", description: "Levante 10.000kg de volume total", icon: "🌟", check: (s: Stats) => s.totalVolume >= 10000 },
  { key: "run_first", name: "Corredor", description: "Complete sua primeira corrida", icon: "🏃", check: (s: Stats) => s.totalRuns >= 1 },
  { key: "run_10km", name: "10K Runner", description: "Corra 10km no total", icon: "🛤️", check: (s: Stats) => s.totalDistanceKm >= 10 },
  { key: "run_42km", name: "Maratonista", description: "Corra 42km no total", icon: "🏅", check: (s: Stats) => s.totalDistanceKm >= 42 },
];

interface Stats {
  totalWorkouts: number;
  streak: number;
  totalVolume: number;
  totalRuns: number;
  totalDistanceKm: number;
}

export function useAchievements() {
  const { user } = useApp();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      // Ask the server to evaluate stats and grant any newly-earned achievements.
      // The client cannot insert directly (RLS restricts inserts to service_role)
      // to prevent users from awarding themselves arbitrary achievements.
      const { data: granted } = await supabase.functions.invoke("grant-achievements");
      const newlyGrantedKeys: string[] = Array.isArray(granted?.unlocked) ? granted.unlocked : [];

      // Load the up-to-date list of unlocked achievements.
      const { data: unlocked } = await supabase
        .from("achievements")
        .select("name, unlocked_at")
        .eq("user_id", user.id);

      const unlockedMap = new Map<string, string>();
      (unlocked || []).forEach(a => unlockedMap.set(a.name, a.unlocked_at));

      const newUnlocks: Achievement[] = [];
      const allAchievements: Achievement[] = ACHIEVEMENT_DEFS.map(def => {
        const isUnlocked = unlockedMap.has(def.key);
        if (newlyGrantedKeys.includes(def.key)) {
          newUnlocks.push({ id: def.key, key: def.key, name: def.name, description: def.description, icon: def.icon, unlocked: true, unlockedAt: unlockedMap.get(def.key) });
        }
        return {
          id: def.key,
          key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          unlocked: isUnlocked,
          unlockedAt: unlockedMap.get(def.key),
        };
      });

      if (newUnlocks.length > 0) {
        newUnlocks.forEach(a => {
          toast.success(`${a.icon} Conquista desbloqueada: ${a.name}!`, { description: a.description });
        });
        setNewlyUnlocked(newUnlocks);
      }

      setAchievements(allAchievements);
    } catch (err) {
      console.error("Error loading achievements:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return { achievements, loading, unlockedCount, totalCount, newlyUnlocked, refresh: load };
}
