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
      // Load existing unlocked achievements
      const { data: unlocked } = await supabase
        .from("achievements")
        .select("name, unlocked_at")
        .eq("user_id", user.id);

      const unlockedMap = new Map<string, string>();
      (unlocked || []).forEach(a => unlockedMap.set(a.name, a.unlocked_at));

      // Load stats for checking
      const [workoutsRes, exercisesRes, runsRes] = await Promise.all([
        supabase.from("workouts").select("completed_at").eq("user_id", user.id).eq("completed", true).order("completed_at", { ascending: false }),
        supabase.from("workout_exercises").select("sets, reps, weight_kg").eq("user_id", user.id),
        supabase.from("runs").select("distance_km").eq("user_id", user.id),
      ]);

      const workouts = workoutsRes.data || [];
      const exercises = exercisesRes.data || [];
      const runs = runsRes.data || [];

      // Calc stats
      const totalWorkouts = workouts.length;
      const totalVolume = exercises.reduce((a, e) => a + (e.sets || 0) * (e.reps || 0) * (Number(e.weight_kg) || 0), 0);
      const totalDistanceKm = runs.reduce((a, r) => a + (Number(r.distance_km) || 0), 0);
      const totalRuns = runs.length;

      // Streak
      const uniqueDates = new Set<string>();
      workouts.forEach(w => { if (w.completed_at) uniqueDates.add(new Date(w.completed_at).toISOString().slice(0, 10)); });
      const today = new Date().toISOString().slice(0, 10);
      let streak = 0;
      const d = new Date();
      if (!uniqueDates.has(today)) d.setDate(d.getDate() - 1);
      while (uniqueDates.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
      if (uniqueDates.has(today)) streak = Math.max(streak, 1);

      const stats: Stats = { totalWorkouts, streak, totalVolume, totalRuns, totalDistanceKm };

      // Check and unlock new achievements
      const newUnlocks: Achievement[] = [];
      const allAchievements: Achievement[] = ACHIEVEMENT_DEFS.map(def => {
        const isUnlocked = unlockedMap.has(def.key);
        const shouldUnlock = def.check(stats);
        
        if (shouldUnlock && !isUnlocked) {
          // New unlock!
          newUnlocks.push({ id: def.key, key: def.key, name: def.name, description: def.description, icon: def.icon, unlocked: true, unlockedAt: new Date().toISOString() });
        }

        return {
          id: def.key,
          key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          unlocked: isUnlocked || shouldUnlock,
          unlockedAt: unlockedMap.get(def.key),
        };
      });

      // Save new unlocks to DB
      if (newUnlocks.length > 0) {
        const rows = newUnlocks.map(a => ({
          user_id: user.id,
          name: a.key,
          description: a.description,
          icon: a.icon,
        }));
        await supabase.from("achievements").insert(rows);
        
        // Show toasts for new unlocks
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
