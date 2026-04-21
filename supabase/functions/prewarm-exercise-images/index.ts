import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lista enxuta de exercícios mais comuns (academia + casa com objetos)
// que devem ter imagem fotorrealista pré-cacheada para garantir UX instantânea.
const COMMON_EXERCISES: Array<{ name: string; muscle: string }> = [
  // Academia
  { name: "Supino reto barra", muscle: "Peito" },
  { name: "Supino inclinado halteres", muscle: "Peito" },
  { name: "Crossover", muscle: "Peito" },
  { name: "Puxada frontal", muscle: "Costas" },
  { name: "Remada curvada", muscle: "Costas" },
  { name: "Remada unilateral", muscle: "Costas" },
  { name: "Agachamento livre", muscle: "Pernas" },
  { name: "Leg press 45°", muscle: "Pernas" },
  { name: "Cadeira extensora", muscle: "Quadríceps" },
  { name: "Mesa flexora", muscle: "Posterior" },
  { name: "Desenvolvimento halteres", muscle: "Ombros" },
  { name: "Elevação lateral", muscle: "Ombros" },
  { name: "Rosca direta barra", muscle: "Bíceps" },
  { name: "Rosca martelo", muscle: "Bíceps" },
  { name: "Tríceps corda", muscle: "Tríceps" },
  { name: "Tríceps testa", muscle: "Tríceps" },
  { name: "Mergulho", muscle: "Tríceps" },
  { name: "Levantamento terra", muscle: "Costas" },
  { name: "Stiff", muscle: "Posterior" },
  { name: "Panturrilha em pé", muscle: "Panturrilha" },

  // Em casa com objetos
  { name: "Flexão de braço", muscle: "Peito" },
  { name: "Flexão diamante", muscle: "Tríceps" },
  { name: "Flexão declinada (pés no sofá)", muscle: "Peito" },
  { name: "Pike push-up", muscle: "Ombros" },
  { name: "Mergulho na cadeira", muscle: "Tríceps" },
  { name: "Agachamento livre", muscle: "Pernas" },
  { name: "Agachamento goblet com mochila", muscle: "Quadríceps" },
  { name: "Afundo búlgaro", muscle: "Quadríceps" },
  { name: "Step-up na cadeira", muscle: "Pernas" },
  { name: "Hip thrust no sofá", muscle: "Glúteos" },
  { name: "Wall sit", muscle: "Quadríceps" },
  { name: "Glute bridge", muscle: "Glúteos" },
  { name: "Remada com toalha na porta", muscle: "Costas" },
  { name: "Remada invertida sob a mesa", muscle: "Costas" },
  { name: "Remada curvada com mochila", muscle: "Costas" },
  { name: "Rosca com mochila", muscle: "Bíceps" },
  { name: "Rosca martelo com garrafas", muscle: "Bíceps" },
  { name: "Desenvolvimento com garrafas 2L", muscle: "Ombros" },
  { name: "Elevação lateral com garrafas", muscle: "Ombros" },
  { name: "Tríceps francês com garrafa", muscle: "Tríceps" },
  { name: "Prancha", muscle: "Core" },
  { name: "Prancha lateral", muscle: "Oblíquos" },
  { name: "Mountain climbers", muscle: "Core" },
  { name: "Burpees", muscle: "Full Body" },
  { name: "Polichinelo", muscle: "Cardio" },
  { name: "Superman", muscle: "Lombar" },
  { name: "Russian twist com mochila", muscle: "Oblíquos" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verifica quais ainda não estão cacheados
    const { data: cached } = await supabase
      .from("exercise_image_cache")
      .select("name_key")
      .in("name_key", COMMON_EXERCISES.map((e) => e.name.toLowerCase()));

    const cachedSet = new Set((cached || []).map((c: any) => c.name_key));
    const todo = COMMON_EXERCISES.filter((e) => !cachedSet.has(e.name.toLowerCase()));

    console.log(`Pre-warm: ${todo.length}/${COMMON_EXERCISES.length} a gerar`);

    let success = 0;
    let failed = 0;

    // Gera em série com pequena pausa para não esgotar rate limit
    for (const ex of todo) {
      try {
        const res = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-exercise-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ name: ex.name, muscle: ex.muscle }),
          },
        );
        if (res.ok) success++;
        else failed++;
      } catch (e) {
        failed++;
      }
      // ~1.5s entre chamadas
      await new Promise((r) => setTimeout(r, 1500));
    }

    return new Response(
      JSON.stringify({
        total: COMMON_EXERCISES.length,
        already_cached: cachedSet.size,
        generated: success,
        failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("prewarm-exercise-images error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
