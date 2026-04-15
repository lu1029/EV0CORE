import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export function useStreak() {
  const { user } = useApp();
  const [streak, setStreak] = useState(0);
  const [trainedToday, setTrainedToday] = useState(false);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      // Get last 30 days of completed workouts
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("workouts")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("completed_at", thirtyDaysAgo.toISOString())
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Get unique dates
      const uniqueDates = new Set<string>();
      (data || []).forEach(w => {
        if (w.completed_at) {
          uniqueDates.add(new Date(w.completed_at).toISOString().slice(0, 10));
        }
      });

      const today = new Date().toISOString().slice(0, 10);
      setTrainedToday(uniqueDates.has(today));

      // Calculate streak
      let currentStreak = 0;
      const checkDate = new Date();
      // If haven't trained today, start checking from yesterday
      if (!uniqueDates.has(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      while (true) {
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (uniqueDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      if (uniqueDates.has(today)) currentStreak = Math.max(currentStreak, 1);
      setStreak(currentStreak);

      // Build current week (Mon-Sun)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      
      const week: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(uniqueDates.has(d.toISOString().slice(0, 10)));
      }
      setWeekDays(week);
    } catch (err) {
      console.error("Error loading streak:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadStreak(); }, [loadStreak]);

  return { streak, trainedToday, weekDays, loading, refresh: loadStreak };
}
