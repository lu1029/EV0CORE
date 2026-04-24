import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LocationType = "casa" | "academia";
export type Goal = "hipertrofia" | "emagrecimento" | "forca" | "condicionamento";
export type Level = "iniciante" | "intermediario" | "avancado";

export interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  goal: Goal;
  level: Level;
  location_type: LocationType;
  estimated_minutes: number;
  is_premium: boolean;
  cover_url: string | null;
}

export interface TemplateExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    body_part: string | null;
    target: string | null;
    equipment: string | null;
    gif_url: string | null;
  };
}

export interface WorkoutTemplateDetail extends WorkoutTemplate {
  items: TemplateExercise[];
}

export function useWorkoutTemplates(locationType: LocationType, goal?: Goal) {
  const [items, setItems] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      let q = supabase
        .from("workout_templates")
        .select("*")
        .eq("location_type", locationType)
        .order("created_at", { ascending: false });
      if (goal) q = q.eq("goal", goal);
      const { data, error } = await q;
      if (!active) return;
      if (error) setError(error.message);
      else setItems((data ?? []) as WorkoutTemplate[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [locationType, goal]);

  return { items, loading, error };
}

export function useWorkoutTemplate(id: string | undefined) {
  const [data, setData] = useState<WorkoutTemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    const { data: tpl, error: e1 } = await supabase
      .from("workout_templates").select("*").eq("id", id).maybeSingle();
    if (e1 || !tpl) { setError(e1?.message ?? "Treino não encontrado"); setLoading(false); return; }
    const { data: items, error: e2 } = await supabase
      .from("workout_template_items")
      .select("*, exercise:exercise_library(id,name,body_part,target,equipment,gif_url)")
      .eq("workout_template_id", id)
      .order("order_index");
    if (e2) { setError(e2.message); setLoading(false); return; }
    setData({ ...(tpl as WorkoutTemplate), items: (items ?? []) as TemplateExercise[] });
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
