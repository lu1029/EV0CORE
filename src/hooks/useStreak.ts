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
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sinceISO = thirtyDaysAgo.toISOString();

      const [workoutsRes, runsRes] = await Promise.all([
        supabase
          .from("workouts")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("completed", true)
          .gte("completed_at", sinceISO)
          .order("completed_at", { ascending: false }),
        supabase
          .from("runs")
          .select("started_at")
          .eq("user_id", user.id)
          .gte("started_at", sinceISO)
          .order("started_at", { ascending: false }),
      ]);

      if (workoutsRes.error) throw workoutsRes.error;
      if (runsRes.error) throw runsRes.error;

      const uniqueDates = new Set<string>();
      (workoutsRes.data || []).forEach((w: any) => {
        if (w.completed_at) uniqueDates.add(new Date(w.completed_at).toISOString().slice(0, 10));
      });
      (runsRes.data || []).forEach((r: any) => {
        if (r.started_at) uniqueDates.add(new Date(r.started_at).toISOString().slice(0, 10));
      });

      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const hasTrainedToday = uniqueDates.has(today);
      const hasTrainedYesterday = uniqueDates.has(yesterdayStr);
      
      setTrainedToday(hasTrainedToday);

      let currentStreak = 0;
      
      // Se não treinou hoje E não treinou ontem, a sequência quebra (reseta para 0)
      if (!hasTrainedToday && !hasTrainedYesterday) {
        currentStreak = 0;
      } else {
        // Começa a contagem
        const checkDate = new Date();
        if (!hasTrainedToday) {
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
      }

      setStreak(currentStreak);

      const now = new Date();
      const dayOfWeek = now.getDay();
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
