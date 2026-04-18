import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RunRow {
  id: string;
  activity_type: string;
  distance_km: number;
  duration_seconds: number;
  pace_min_km: number | null;
  avg_speed_kmh: number | null;
  calories_burned: number | null;
  started_at: string;
  route_data: any;
}

export interface WeekStats {
  totalKm: number;
  count: number;
  avgPace: number | null;
}

export function useRunHistory() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStats, setWeekStats] = useState<WeekStats>({ totalKm: 0, count: 0, avgPace: null });

  const refresh = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRuns([]); setLoading(false); return; }
      const { data, error } = await supabase
        .from("runs")
        .select("id,activity_type,distance_km,duration_seconds,pace_min_km,avg_speed_kmh,calories_burned,started_at,route_data")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      const list = (data ?? []) as RunRow[];
      setRuns(list);

      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday = start
      const weekRuns = list.filter((r) => new Date(r.started_at) >= weekStart);
      const totalKm = weekRuns.reduce((s, r) => s + Number(r.distance_km || 0), 0);
      const totalSec = weekRuns.reduce((s, r) => s + Number(r.duration_seconds || 0), 0);
      const avgPace = totalKm > 0 ? totalSec / 60 / totalKm : null;
      setWeekStats({ totalKm, count: weekRuns.length, avgPace });
    } catch (e) {
      console.error("Failed to load runs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  return { runs, loading, weekStats, refresh };
}
