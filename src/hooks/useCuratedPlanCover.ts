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

  // O edge `generate-exercise-image` cacheia por name.toLowerCase().
  // Passamos uma chave única por plano como `name` para evitar colisão entre planos
  // e garantir que a thumbnail só seja gerada uma vez por plano.
  const uniqueName = `[plan:${planId}] ${coverPrompt}`;

  const promise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-image", {
        body: { name: uniqueName, muscle: muscleHint },
      });
      if (!error && data?.image_url) return data.image_url as string;
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
