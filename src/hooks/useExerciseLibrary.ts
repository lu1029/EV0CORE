import { useCallback, useEffect, useRef, useState } from "react";
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
  pageSize?: number;
  enabled?: boolean;
}

const PAGE = 40;

function normalizeRow(r: any): LibraryExercise {
  const parseJson = (v: unknown): string[] => {
    if (Array.isArray(v)) return v as string[];
    if (typeof v === "string") {
      try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };
  return {
    external_id: r.id,
    name: r.name,
    body_part: r.body_part,
    target: r.target,
    equipment: r.equipment,
    gif_url: r.gif_url,
    instructions: parseJson(r.instructions),
    secondary_muscles: parseJson(r.secondary_muscles),
  };
}

export function useExerciseLibrary({
  bodyPart,
  target,
  search,
  pageSize = PAGE,
  enabled = true,
}: Params = {}) {
  const [items, setItems] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const reqIdRef = useRef(0);

  const buildQuery = useCallback(() => {
    let q = supabase.from("exercises").select("*", { count: "exact" });
    if (bodyPart) q = q.eq("body_part", bodyPart);
    if (target) q = q.eq("target", target);
    if (search) q = q.ilike("name", `%${search}%`);
    return q.order("name", { ascending: true });
  }, [bodyPart, target, search]);

  const loadPage = useCallback(
    async (page: number, replace: boolean) => {
      const reqId = ++reqIdRef.current;
      if (replace) setLoading(true); else setLoadingMore(true);
      setError(null);
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, error: err, count } = await buildQuery().range(from, to);
        if (reqId !== reqIdRef.current) return;
        if (err) throw err;
        const normalized = (data ?? []).map(normalizeRow);
        setItems((prev) => (replace ? normalized : [...prev, ...normalized]));
        const total = count ?? 0;
        setHasMore(from + normalized.length < total && normalized.length === pageSize);
      } catch (e) {
        if (reqId !== reqIdRef.current) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar exercícios");
      } finally {
        if (reqId === reqIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [buildQuery, pageSize],
  );

  // Reset + carregar primeira página quando filtros mudam
  useEffect(() => {
    if (!enabled) return;
    pageRef.current = 0;
    setItems([]);
    setHasMore(true);
    loadPage(0, true);
  }, [enabled, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    pageRef.current += 1;
    loadPage(pageRef.current, false);
  }, [loading, loadingMore, hasMore, loadPage]);

  return { items, loading, loadingMore, error, hasMore, loadMore };
}
