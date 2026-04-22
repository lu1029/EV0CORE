import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RankingMetric = "workouts" | "runs" | "distance" | "calories" | "streak";
export type RankingPeriod = "week" | "month" | "all";

export interface RankRow {
  user_id: string;
  name: string;
  avatar_url: string | null;
  score: number;
}

function periodStart(period: RankingPeriod): string {
  const d = new Date();
  if (period === "week") d.setDate(d.getDate() - 7);
  else if (period === "month") d.setMonth(d.getMonth() - 1);
  else d.setFullYear(d.getFullYear() - 5);
  return d.toISOString();
}

/** Aggregate global ranking from real activity tables. Top 50. */
export function useRanking(metric: RankingMetric, period: RankingPeriod) {
  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const since = periodStart(period);
      let aggregates = new Map<string, number>();

      if (metric === "workouts") {
        const { data } = await supabase
          .from("workouts")
          .select("user_id, completed_at")
          .eq("completed", true)
          .gte("completed_at", since);
        (data as any[] ?? []).forEach(r => aggregates.set(r.user_id, (aggregates.get(r.user_id) ?? 0) + 1));
      } else if (metric === "runs") {
        const { data } = await supabase
          .from("runs").select("user_id, started_at").gte("started_at", since);
        (data as any[] ?? []).forEach(r => aggregates.set(r.user_id, (aggregates.get(r.user_id) ?? 0) + 1));
      } else if (metric === "distance") {
        const { data } = await supabase
          .from("runs").select("user_id, distance_km, started_at").gte("started_at", since);
        (data as any[] ?? []).forEach(r => aggregates.set(r.user_id, (aggregates.get(r.user_id) ?? 0) + Number(r.distance_km ?? 0)));
      } else if (metric === "calories") {
        const { data } = await supabase
          .from("runs").select("user_id, calories_burned, started_at").gte("started_at", since);
        (data as any[] ?? []).forEach(r => aggregates.set(r.user_id, (aggregates.get(r.user_id) ?? 0) + Number(r.calories_burned ?? 0)));
      } else if (metric === "streak") {
        const { data } = await supabase
          .from("daily_checkins").select("user_id, checkin_date").gte("checkin_date", since.slice(0, 10));
        (data as any[] ?? []).forEach(r => aggregates.set(r.user_id, (aggregates.get(r.user_id) ?? 0) + 1));
      }

      const userIds = Array.from(aggregates.keys());
      if (!userIds.length) { if (alive) { setRows([]); setLoading(false); } return; }
      const { data: profs } = await supabase
        .from("profiles").select("user_id, name, avatar_url").in("user_id", userIds);
      const pm = new Map((profs ?? []).map((p: any) => [p.user_id, p]));

      const list: RankRow[] = userIds.map(uid => ({
        user_id: uid,
        name: (pm.get(uid) as any)?.name || "Atleta",
        avatar_url: (pm.get(uid) as any)?.avatar_url ?? null,
        score: aggregates.get(uid) ?? 0,
      })).sort((a, b) => b.score - a.score).slice(0, 50);

      if (alive) { setRows(list); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [metric, period]);

  return { rows, loading };
}
