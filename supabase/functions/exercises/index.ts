// Backend para a biblioteca de exercícios.
// Fonte: ExerciseDB OSS (oss.exercisedb.dev) — pública, sem API key, com GIFs animados reais.
// Cache em exercise_library para reduzir latência.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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

interface OssListResponse {
  success: boolean;
  meta?: { total: number; hasNextPage: boolean; nextCursor?: string };
  data: OssExercise[];
}

interface NormalizedExercise {
  external_id: string;
  name: string;
  body_part: string | null;
  target: string | null;
  equipment: string | null;
  gif_url: string | null;
  secondary_muscles: string[];
  instructions: string[];
}

function normalize(e: OssExercise): NormalizedExercise {
  return {
    external_id: e.exerciseId,
    name: e.name,
    body_part: e.bodyParts?.[0] ?? null,
    target: e.targetMuscles?.[0] ?? null,
    equipment: e.equipments?.[0] ?? null,
    gif_url: e.gifUrl,
    secondary_muscles: e.secondaryMuscles ?? [],
    instructions: (e.instructions ?? []).map((s) =>
      // Remove "Step:1 " do começo das instruções para ficar mais limpo
      s.replace(/^Step:\d+\s*/i, "").trim()
    ),
  };
}

/** Busca em múltiplas páginas até atingir o `needed` filtrado.
 *  A API OSS ignora filtros nos query params, então paginamos e filtramos no servidor. */
async function fetchAndFilter(opts: {
  bodyPart?: string;
  target?: string;
  search?: string;
  needed: number;
}): Promise<OssExercise[]> {
  const { bodyPart, target, search, needed } = opts;
  const matches: OssExercise[] = [];
  let cursor: string | undefined;
  const PAGE = 100;
  for (let i = 0; i < 16 && matches.length < needed; i++) {
    const qs = new URLSearchParams({ limit: String(PAGE) });
    if (cursor) qs.set("cursor", cursor);
    const res = await fetch(`${API_BASE}/exercises?${qs.toString()}`);
    if (!res.ok) break;
    const json = (await res.json()) as OssListResponse;
    const page = json.data ?? [];
    for (const e of page) {
      if (bodyPart && !e.bodyParts?.includes(bodyPart)) continue;
      if (target && !e.targetMuscles?.includes(target)) continue;
      if (search) {
        const q = search.toLowerCase();
        const inName = e.name.toLowerCase().includes(q);
        const inMuscle = e.targetMuscles?.some((m) => m.toLowerCase().includes(q));
        if (!inName && !inMuscle) continue;
      }
      matches.push(e);
      if (matches.length >= needed) break;
    }
    cursor = json.meta?.nextCursor;
    if (!cursor || !json.meta?.hasNextPage) break;
  }
  return matches;
}

async function cacheExercises(items: NormalizedExercise[]) {
  if (!items.length) return;
  const { error } = await supabase
    .from("exercise_library")
    .upsert(items, { onConflict: "external_id" });
  if (error) console.error("cache upsert error:", error);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth obrigatória
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: authErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const bodyPart = url.searchParams.get("bodyPart");
    const target = url.searchParams.get("target");
    const search = url.searchParams.get("search");
    const limitParam = Number(url.searchParams.get("limit") ?? "30");
    const limit = Math.min(Math.max(limitParam, 1), 50);

    // 1) Tenta cache primeiro (apenas com gif_url válido)
    let q = supabase
      .from("exercise_library")
      .select("*")
      .not("gif_url", "is", null)
      .limit(limit);
    if (bodyPart) q = q.eq("body_part", bodyPart);
    if (target) q = q.eq("target", target);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data: cached } = await q;
    if (cached && cached.length >= Math.min(limit, 8)) {
      return new Response(
        JSON.stringify({ source: "cache", items: cached }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Busca da OSS API filtrando no servidor (a API ignora filtros nos query params)
    const raw = await fetchAndFilter({
      bodyPart: bodyPart ?? undefined,
      target: target ?? undefined,
      search: search ?? undefined,
      needed: limit,
    });
    const normalized = raw.map(normalize);

    // Cache em background
    cacheExercises(normalized).catch((e) => console.error("cache error:", e));

    return new Response(
      JSON.stringify({ source: "oss", items: normalized }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("exercises error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
