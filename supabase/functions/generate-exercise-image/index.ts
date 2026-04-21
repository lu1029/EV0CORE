// Gera imagem realista de um exercício combinando múltiplas fontes em cascata:
//   1. cache (exercise_image_cache) — instantâneo
//   2. Hugging Face FLUX.1-schnell — fotorrealista, rápido (~3s)
//   3. Lovable AI (Nano Banana) — fallback se HF falhar
// Salva no bucket público `exercise-images` para servir como CDN.
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
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");

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

/** Prompt otimizado. Suporta dois modos:
 *   - exercício (padrão): demonstração técnica do movimento
 *   - capa de plano (prefixo "[plan:...]"): hero photo motivacional do plano */
function buildPrompt(name: string, hint?: string) {
  const planMatch = name.match(/^\[plan:[^\]]+\]\s*(.+)$/i);
  if (planMatch) {
    const theme = planMatch[1];
    const muscleHint = hint ? `, focused on ${hint}` : "";
    return `Cinematic high-end fitness magazine cover photo: ${theme}${muscleHint}. Single fit athlete in dynamic powerful pose, dramatic studio lighting with subtle blue and purple accent rim light, modern dark background with soft gradient, shallow depth of field, professional photography, ultra sharp focus, hyperrealistic muscle definition, athletic apparel. Premium fitness brand aesthetic, 8k detail. No text, no logos, no watermarks, no graphics overlays, single still image.`;
  }
  const muscleHint = hint ? `, emphasizing the ${hint} muscles being worked` : "";
  return `Photorealistic professional fitness photography of a single fit athlete demonstrating the exercise "${name}" with perfect technical form${muscleHint}. Full body visible, side angle showing correct posture and movement, clean modern gym environment with soft natural lighting. Sharp focus on the athlete, anatomically accurate, realistic muscles and proportions, proper equipment if needed. Magazine quality, 8k detail, no text, no watermark, no logos, no graphics overlays, no multiple frames, single still image.`;
}

async function uploadBytes(bytes: Uint8Array, mime: string, name: string): Promise<string> {
  const ext = mime.split("/")[1] ?? "png";
  const path = `${slug(name)}-${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage
    .from("exercise-images")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = admin.storage.from("exercise-images").getPublicUrl(path);
  return pub.publicUrl;
}

/** 1ª opção: Hugging Face FLUX.1-schnell — fotorrealista de alta qualidade. */
async function generateWithHuggingFace(name: string, hint?: string): Promise<string> {
  if (!HUGGINGFACE_API_KEY) throw new Error("HF key not configured");
  const res = await fetch("https://router.huggingface.co/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt: buildPrompt(name, hint),
      size: "1024x1024",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  // Resposta tipo OpenAI: data: [{ b64_json } | { url }]
  const item = json?.data?.[0];
  if (item?.b64_json) {
    const bytes = Uint8Array.from(atob(item.b64_json), (c) => c.charCodeAt(0));
    return await uploadBytes(bytes, "image/png", name);
  }
  if (item?.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`HF image fetch failed ${imgRes.status}`);
    const buf = new Uint8Array(await imgRes.arrayBuffer());
    const mime = imgRes.headers.get("content-type") ?? "image/png";
    return await uploadBytes(buf, mime, name);
  }
  throw new Error("HF returned no image");
}

/** 2ª opção: Lovable AI (Nano Banana). */
async function generateWithLovableAI(name: string, hint?: string): Promise<string> {
  if (!LOVABLE_API_KEY) throw new Error("Lovable AI key not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Lovable AI ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const dataUrl: string | undefined =
    json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl?.startsWith("data:image/")) throw new Error("Lovable AI no image");
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(image\/[a-z]+);base64/)?.[1] ?? "image/png";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return await uploadBytes(bytes, mime, name);
}

/** Tenta cascata: HF -> Lovable AI. Retorna URL pública. */
async function generateAndStore(name: string, hint?: string): Promise<{ url: string; provider: string }> {
  const errors: string[] = [];

  if (HUGGINGFACE_API_KEY) {
    try {
      const url = await generateWithHuggingFace(name, hint);
      return { url, provider: "huggingface" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("HF failed, falling back to Lovable AI:", msg);
      errors.push(`HF: ${msg}`);
    }
  }

  if (LOVABLE_API_KEY) {
    try {
      const url = await generateWithLovableAI(name, hint);
      return { url, provider: "lovable_ai" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Lovable AI failed:", msg);
      errors.push(`LovableAI: ${msg}`);
    }
  }

  throw new Error(`All providers failed. ${errors.join(" | ")}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    // 2) gera com cascata HF -> Lovable AI
    const { url, provider } = await generateAndStore(name, muscle);

    // 3) cache write
    await admin
      .from("exercise_image_cache")
      .upsert({ name_key: key, image_url: url, source: provider }, { onConflict: "name_key" });

    return new Response(
      JSON.stringify({ source: provider, image_url: url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    console.error("generate-exercise-image error:", msg);
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
