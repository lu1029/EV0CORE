import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LibraryExercise {
  external_id: string;
  name: string;
  body_part: string | null;
  target: string | null;
  equipment: string | null;
  gif_url: string | null;
  secondary_muscles: string[];
  instructions: string[];
}

interface Params {
  bodyPart?: string;
  target?: string;
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export function useExerciseLibrary({ bodyPart, target, search, limit = 20, enabled = true }: Params = {}) {
  const [items, setItems] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: String(limit) };
      if (bodyPart) params.bodyPart = bodyPart;
      if (target) params.target = target;
      if (search) params.search = search;
      const qs = new URLSearchParams(params).toString();
      const { data, error: invokeError } = await supabase.functions.invoke(`exercises?${qs}`, {
        method: "GET",
      });
      if (invokeError) throw new Error(invokeError.message);
      setItems((data?.items ?? []) as LibraryExercise[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar exercícios");
    } finally {
      setLoading(false);
    }
  }, [bodyPart, target, search, limit]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
  }, [enabled, fetchData]);

  return { items, loading, error, refetch: fetchData };
}
