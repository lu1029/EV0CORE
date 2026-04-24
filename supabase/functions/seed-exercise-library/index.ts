// Importa em massa exercícios do ExerciseDB OSS (gratuito, sem API key) para a exercise_library.
// Roda paginado até esgotar ou atingir o limite. Idempotente (upsert por external_id).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";

const API_BASE = "https://oss.exercisedb.dev/api/v1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface OssExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
}

function normalize(e: OssExercise) {
  return {
    external_id: e.exerciseId,
    name: e.name,
    body_part: e.bodyParts?.[0] ?? null,
    target: e.targetMuscles?.[0] ?? null,
    equipment: e.equipments?.[0] ?? null,
    gif_url: e.gifUrl,
    secondary_muscles: e.secondaryMuscles ?? [],
    instructions: (e.instructions ?? []).map((s) => s.replace(/^Step:\d+\s*/i, "").trim()),
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const maxPages = Math.min(Number(url.searchParams.get("pages") ?? "20"), 30);
    const PAGE = 100;
    let cursor: string | undefined;
    let imported = 0;
    let pages = 0;

    for (let i = 0; i < maxPages; i++) {
      const qs = new URLSearchParams({ limit: String(PAGE) });
      if (cursor) qs.set("cursor", cursor);
      const res = await fetch(`${API_BASE}/exercises?${qs.toString()}`);
      if (!res.ok) break;
      const json = await res.json();
      const data: OssExercise[] = json.data ?? [];
      if (!data.length) break;

      const items = data
        .filter((e) => e.gifUrl && e.exerciseId && e.name)
        .map(normalize);

      if (items.length) {
        const { error } = await supabase
          .from("exercise_library")
          .upsert(items, { onConflict: "external_id" });
        if (error) {
          console.error("upsert error:", error);
        } else {
          imported += items.length;
        }
      }

      pages++;
      cursor = json.meta?.nextCursor;
      if (!cursor || !json.meta?.hasNextPage) break;
    }

    return new Response(
      JSON.stringify({ ok: true, imported, pages }),
      { headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
    );
  }
});
