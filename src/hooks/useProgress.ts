import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export interface ProgressData {
  loading: boolean;
  // This month
  monthName: string;
  monthDays: number[]; // day numbers with workouts
  monthTotal: number;
  monthAdherence: number; // 0-100
  // This week
  weekWorkouts: number;
  weekDistanceKm: number;
  weekCalories: number;
  weekGoalReached: number; // 0-100
  // Body
  weightHistory: { date: string; kg: number }[];
  measurements: { peito?: number; braco?: number; cintura?: number; coxa?: number };
  weightDelta: number; // kg vs first
  // Goals
  monthlyGoals: { id: string; goal: string; progress: number; target: number }[];
}

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};
const startOfWeek = () => {
  const d = new Date();
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const useProgress = () => {
  const { user, userProfile } = useApp();
  const [data, setData] = useState<ProgressData>({
    loading: true,
    monthName: new Date().toLocaleDateString("pt-BR", { month: "long" }),
    monthDays: [],
    monthTotal: 0,
    monthAdherence: 0,
    weekWorkouts: 0,
    weekDistanceKm: 0,
    weekCalories: 0,
    weekGoalReached: 0,
    weightHistory: [],
    measurements: {},
    weightDelta: 0,
    monthlyGoals: [],
  });

  useEffect(() => {
    if (!user) return;
    let alive = true;

    (async () => {
      const monthStart = startOfMonth();
      const weekStart = startOfWeek();
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const [
        monthWorkoutsRes,
        weekWorkoutsRes,
        weekRunsRes,
        weekMealsRes,
        progressLogsRes,
        monthRunsRes,
      ] = await Promise.all([
        supabase.from("workouts").select("completed_at, duration_minutes, calories_burned").eq("user_id", user.id).eq("completed", true).gte("completed_at", monthStart),
        supabase.from("workouts").select("id, calories_burned").eq("user_id", user.id).eq("completed", true).gte("completed_at", weekStart),
        supabase.from("runs").select("distance_km, calories_burned").eq("user_id", user.id).gte("started_at", weekStart),
        supabase.from("meals").select("calories").eq("user_id", user.id).gte("logged_at", weekStart),
        supabase.from("progress_logs").select("logged_at, weight_kg, body_measurements").eq("user_id", user.id).order("logged_at", { ascending: true }),
        supabase.from("runs").select("distance_km").eq("user_id", user.id).gte("started_at", monthStart),
      ]);

      if (!alive) return;

      const monthDays = new Set<number>();
      (monthWorkoutsRes.data || []).forEach((w) => {
        if (w.completed_at) monthDays.add(new Date(w.completed_at).getDate());
      });

      const targetWorkoutsThisMonth = (userProfile.daysPerWeek || 4) * 4;
      const monthAdherence = Math.min(100, Math.round((monthDays.size / Math.max(1, targetWorkoutsThisMonth)) * 100));

      const weekWorkouts = (weekWorkoutsRes.data || []).length;
      const weekKm = (weekRunsRes.data || []).reduce((a, r) => a + Number(r.distance_km || 0), 0);
      const weekCals =
        (weekWorkoutsRes.data || []).reduce((a, w) => a + (w.calories_burned || 0), 0) +
        (weekRunsRes.data || []).reduce((a, r) => a + (r.calories_burned || 0), 0) +
        (weekMealsRes.data || []).reduce((a, m) => a + (m.calories || 0), 0);

      const weeklyGoal = userProfile.daysPerWeek || 4;
      const weekGoalReached = Math.min(100, Math.round((weekWorkouts / weeklyGoal) * 100));

      const logs = progressLogsRes.data || [];
      const weightHistory = logs
        .filter((l) => l.weight_kg != null)
        .map((l) => ({ date: l.logged_at, kg: Number(l.weight_kg) }));
      const lastMeasurement = logs[logs.length - 1]?.body_measurements as any;
      const weightDelta = weightHistory.length >= 2
        ? +(weightHistory[weightHistory.length - 1].kg - weightHistory[0].kg).toFixed(1)
        : 0;

      const monthKm = (monthRunsRes.data || []).reduce((a, r) => a + Number(r.distance_km || 0), 0);

      setData({
        loading: false,
        monthName: now.toLocaleDateString("pt-BR", { month: "long" }),
        monthDays: Array.from(monthDays),
        monthTotal: daysInMonth,
        monthAdherence,
        weekWorkouts,
        weekDistanceKm: +weekKm.toFixed(1),
        weekCalories: Math.round(weekCals),
        weekGoalReached,
        weightHistory,
        measurements: lastMeasurement || {},
        weightDelta,
        monthlyGoals: [
          { id: "workouts", goal: `Treinar ${targetWorkoutsThisMonth} dias`, progress: monthDays.size, target: targetWorkoutsThisMonth },
          { id: "km", goal: "Correr 30 km", progress: Math.round(monthKm), target: 30 },
        ],
      });
    })();

    return () => { alive = false; };
  }, [user, userProfile.daysPerWeek]);

  return data;
};
