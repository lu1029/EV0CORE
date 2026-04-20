// Gera uma imagem realista de um exercício de musculação/calistenia usando Lovable AI (Nano Banana)
// e salva no bucket público `exercise-images` para servir como CDN.
// Cacheia em `exercise_image_cache` (por name_key) e em `exercise_library.ai_image_url` quando aplicável.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildPrompt(name: string, hint?: string) {
  const extra = hint ? `, focus on the ${hint} muscle group` : "";
  return `A clean, photorealistic illustration of a fit athlete demonstrating the exercise "${name}"${extra}. Single person, full body visible, neutral gym background, soft studio lighting, side view showing correct form. Sharp focus, high detail, no text, no watermark, no logos. Professional fitness photography style.`;
}

async function generateAndStore(name: string, hint?: string): Promise<string> {
  // Chama Lovable AI (Nano Banana) para gerar a imagem
  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: buildPrompt(name, hint) }],
      modalities: ["image", "text"],
    }),
  });

  if (!aiRes.ok) {
    const txt = await aiRes.text();
    throw new Error(`AI gateway ${aiRes.status}: ${txt}`);
  }
  const aiJson = await aiRes.json();
  const dataUrl: string | undefined =
    aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl?.startsWith("data:image/")) {
    throw new Error("AI did not return an image");
  }

  // data:image/png;base64,xxxx
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(image\/[a-z]+);base64/)?.[1] ?? "image/png";
  const ext = mime.split("/")[1] ?? "png";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const path = `${slug(name)}-${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage
    .from("exercise-images")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = admin.storage.from("exercise-images").getPublicUrl(path);
  return pub.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth obrigatória — só usuários logados podem disparar geração
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: authErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const name: string = (body?.name ?? "").toString().trim();
    const muscle: string | undefined = body?.muscle?.toString().trim() || undefined;
    if (!name || name.length < 2 || name.length > 120) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = name.toLowerCase().trim();

    // 1) cache hit
    const { data: cached } = await admin
      .from("exercise_image_cache")
      .select("image_url")
      .eq("name_key", key)
      .maybeSingle();
    if (cached?.image_url) {
      return new Response(
        JSON.stringify({ source: "cache", image_url: cached.image_url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) gera + storage
    const imageUrl = await generateAndStore(name, muscle);

    // 3) cache write
    await admin
      .from("exercise_image_cache")
      .upsert({ name_key: key, image_url: imageUrl, source: "ai" }, { onConflict: "name_key" });

    return new Response(
      JSON.stringify({ source: "ai", image_url: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    console.error("generate-exercise-image error:", msg);
    // 429/402 do gateway — propaga para o cliente
    if (msg.includes("429")) {
      return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg.includes("402")) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
