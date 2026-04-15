import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

interface ProfileStats {
  totalWorkouts: number;
  totalVolume: number;
  totalDistanceKm: number;
  streak: number;
}

export function useProfileStats() {
  const { user } = useApp();
  const [stats, setStats] = useState<ProfileStats>({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDistanceKm: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      // Parallel queries
      const [workoutsRes, exercisesRes, runsRes] = await Promise.all([
        supabase
          .from("workouts")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("completed", true)
          .order("completed_at", { ascending: false }),
        supabase
          .from("workout_exercises")
          .select("sets, reps, weight_kg")
          .eq("user_id", user.id),
        supabase
          .from("runs")
          .select("distance_km")
          .eq("user_id", user.id),
      ]);

      const workouts = workoutsRes.data || [];
      const exercises = exercisesRes.data || [];
      const runs = runsRes.data || [];

      // Total workouts
      const totalWorkouts = workouts.length;

      // Total volume
      const totalVolume = exercises.reduce((acc, ex) => {
        return acc + (ex.sets || 0) * (ex.reps || 0) * (Number(ex.weight_kg) || 0);
      }, 0);

      // Total distance
      const totalDistanceKm = runs.reduce((acc, r) => acc + (Number(r.distance_km) || 0), 0);

      // Streak calculation
      const uniqueDates = new Set<string>();
      workouts.forEach(w => {
        if (w.completed_at) {
          uniqueDates.add(new Date(w.completed_at).toISOString().slice(0, 10));
        }
      });

      const today = new Date().toISOString().slice(0, 10);
      let streak = 0;
      const checkDate = new Date();
      if (!uniqueDates.has(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (uniqueDates.has(checkDate.toISOString().slice(0, 10))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      if (uniqueDates.has(today)) streak = Math.max(streak, 1);

      setStats({ totalWorkouts, totalVolume: Math.round(totalVolume), totalDistanceKm: Math.round(totalDistanceKm * 10) / 10, streak });
    } catch (err) {
      console.error("Error loading profile stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, refresh: load };
}
