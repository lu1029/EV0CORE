import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Cache em memória: planId -> url (foto IA cacheada). */
const memCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

/**
 * Resolve uma thumbnail (foto IA) para um plano curado.
 * Reusa a tabela `exercise_image_cache` com chave `plan-cover:<planId>` para cachear
 * por plano, gerando via edge `generate-exercise-image` apenas na primeira vez.
 */
async function lookupCover(
  planId: string,
  coverPrompt: string,
  muscleHint?: string,
): Promise<string | null> {
  if (memCache.has(planId)) return memCache.get(planId) ?? null;
  if (inflight.has(planId)) return inflight.get(planId)!;

  const cacheKey = `plan-cover:${planId}`;

  const promise = (async () => {
    // 1) Cache (se já gerado antes para este plano)
    try {
      const { data } = await supabase
        .from("exercise_image_cache")
        .select("image_url")
        .eq("name_key", cacheKey)
        .maybeSingle();
      if (data?.image_url) return data.image_url;
    } catch { /* ignore */ }

    // 2) Gera via edge function (a edge já cacheia com a name_key passada)
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-image", {
        body: { name: coverPrompt, muscle: muscleHint, cacheKey },
      });
      if (!error && data?.image_url) return data.image_url;
    } catch { /* ignore */ }

    return null;
  })();

  inflight.set(planId, promise);
  try {
    const url = await promise;
    memCache.set(planId, url);
    return url;
  } finally {
    inflight.delete(planId);
  }
}

export function useCuratedPlanCover(
  planId: string,
  coverPrompt: string,
  muscleHint?: string,
): { url: string | null; loading: boolean } {
  const [url, setUrl] = useState<string | null>(memCache.get(planId) ?? null);
  const [loading, setLoading] = useState(!memCache.has(planId));
  const lastId = useRef<string>("");

  useEffect(() => {
    if (!planId || planId === lastId.current) return;
    lastId.current = planId;
    if (memCache.has(planId)) {
      setUrl(memCache.get(planId) ?? null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    lookupCover(planId, coverPrompt, muscleHint).then((u) => {
      if (!cancelled) {
        setUrl(u);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [planId, coverPrompt, muscleHint]);

  return { url, loading };
}
