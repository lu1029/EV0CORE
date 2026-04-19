// Backend seguro para ExerciseDB (RapidAPI). A chave NUNCA sai do servidor.
// Faz cache na tabela exercise_library para reduzir custo e latência.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface ExerciseDBItem {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

async function fetchFromRapidAPI(path: string): Promise<ExerciseDBItem[]> {
  const key = Deno.env.get("RAPIDAPI_KEY");
  if (!key) throw new Error("RAPIDAPI_KEY not configured");

  const res = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });
  if (!res.ok) {
    throw new Error(`RapidAPI ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

async function cacheExercises(items: ExerciseDBItem[]) {
  if (!items.length) return;
  const rows = items.map((e) => ({
    external_id: e.id,
    name: e.name,
    body_part: e.bodyPart,
    target: e.target,
    equipment: e.equipment,
    gif_url: e.gifUrl,
    secondary_muscles: e.secondaryMuscles ?? [],
    instructions: e.instructions ?? [],
  }));
  await supabase.from("exercise_library").upsert(rows, { onConflict: "external_id" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação obrigatória — só usuários logados consultam
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
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: authErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
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
    const limitParam = Number(url.searchParams.get("limit") ?? "20");
    const limit = Math.min(Math.max(limitParam, 1), 50);

    // 1) Tenta cache primeiro
    let q = supabase.from("exercise_library").select("*").limit(limit);
    if (bodyPart) q = q.eq("body_part", bodyPart);
    if (target) q = q.eq("target", target);
    if (search) q = q.ilike("name", `%${search}%`);

    const { data: cached } = await q;
    if (cached && cached.length >= Math.min(limit, 5)) {
      return new Response(JSON.stringify({ source: "cache", items: cached }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Fallback para RapidAPI
    let path = "/exercises";
    if (bodyPart) path = `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`;
    else if (target) path = `/exercises/target/${encodeURIComponent(target)}`;
    else if (search) path = `/exercises/name/${encodeURIComponent(search)}`;

    const items = await fetchFromRapidAPI(path);
    const sliced = items.slice(0, limit);
    // Cache em background (não bloqueia resposta)
    cacheExercises(sliced).catch((e) => console.error("cache error:", e));

    const normalized = sliced.map((e) => ({
      external_id: e.id,
      name: e.name,
      body_part: e.bodyPart,
      target: e.target,
      equipment: e.equipment,
      gif_url: e.gifUrl,
      secondary_muscles: e.secondaryMuscles ?? [],
      instructions: e.instructions ?? [],
    }));

    return new Response(JSON.stringify({ source: "rapidapi", items: normalized }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("exercises error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
