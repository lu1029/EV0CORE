import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export interface DailyCheckin {
  id: string;
  checkin_date: string;
  worked_out: boolean;
  ran: boolean;
  logged_meal: boolean;
  hit_calorie_goal: boolean;
  manual_checkin: boolean;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

/** Read & upsert the user's daily check-ins. Powers the consistency calendar. */
export function useCheckins(monthStart?: Date) {
  const { user } = useApp();
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setCheckins([]); setLoading(false); return; }
    const start = monthStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const { data } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .gte("checkin_date", start.toISOString().slice(0, 10))
      .lte("checkin_date", end.toISOString().slice(0, 10))
      .order("checkin_date", { ascending: true });
    setCheckins((data as any) ?? []);
    setLoading(false);
  }, [user, monthStart]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsertToday = useCallback(async (patch: Partial<Omit<DailyCheckin, "id" | "checkin_date">>) => {
    if (!user) return;
    const date = todayStr();
    const existing = checkins.find(c => c.checkin_date === date);
    if (existing) {
      const { data } = await supabase
        .from("daily_checkins")
        .update(patch)
        .eq("id", existing.id)
        .select()
        .single();
      if (data) setCheckins(prev => prev.map(c => c.id === existing.id ? (data as any) : c));
    } else {
      const { data } = await supabase
        .from("daily_checkins")
        .insert({ user_id: user.id, checkin_date: date, ...patch })
        .select()
        .single();
      if (data) setCheckins(prev => [...prev, data as any]);
    }
  }, [user, checkins]);

  // Compute streak (consecutive days with any activity, ending today or yesterday)
  const allDates = new Set(checkins.filter(c => c.worked_out || c.ran || c.logged_meal || c.hit_calorie_goal || c.manual_checkin).map(c => c.checkin_date));
  let streak = 0;
  const cursor = new Date();
  while (allDates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { checkins, loading, upsertToday, refetch: fetch, streak };
}
