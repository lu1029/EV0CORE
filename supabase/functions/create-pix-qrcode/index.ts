import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";

interface PixRequestBody {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  amount: number;
  description?: string;
  expiresIn?: number;
  plan?: "weekly" | "monthly" | "yearly";
}

const PLAN_PRICE_IDS: Record<string, string> = {
  weekly: "evocore_premium_weekly",
  monthly: "evocore_premium_monthly",
  yearly: "evocore_premium_yearly",
};

const onlyDigits = (s: string) => (s || "").replace(/\D+/g, "");
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
function isValidCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]);
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ABACATEPAY_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
      );
    }

    // Identify user from JWT (optional but recommended so webhook can activate premium)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    let userId: string | null = null;
    if (jwt) {
      const { data } = await supabase.auth.getUser(jwt);
      userId = data.user?.id ?? null;
    }

    // Rate limit: 3 charges per 60 min per authenticated user
    if (userId) {
      const rl = await checkRateLimit(supabase, `pix:user:${userId}`, 3, 60);
      if (!rl.allowed) {
        return rateLimitResponse(60, 3, { ...corsHeaders, ...securityHeaders });
      }
    }

    const body = (await req.json()) as PixRequestBody;
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = onlyDigits(body.phone || "");
    const cpf = onlyDigits(body.cpf || "");
    const amount = Number(body.amount);
    const description = (body.description || "Assinatura EvoCore Premium").slice(0, 140);
    const expiresIn = Number.isFinite(Number(body.expiresIn)) ? Number(body.expiresIn) : 3600;
    const plan = (body.plan && PLAN_PRICE_IDS[body.plan]) ? body.plan : "monthly";
    const priceId = PLAN_PRICE_IDS[plan];

    const errors: Record<string, string> = {};
    if (fullName.length < 3 || fullName.length > 120) errors.fullName = "Nome inválido";
    if (!isValidEmail(email)) errors.email = "E-mail inválido";
    if (phone.length < 10 || phone.length > 13) errors.phone = "Telefone inválido";
    if (!isValidCPF(cpf)) errors.cpf = "CPF inválido";
    if (!Number.isFinite(amount) || amount < 100) errors.amount = "Valor inválido (mínimo R$ 1,00 em centavos)";

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({ error: "validation", fields: errors }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }

    const externalId = `evocore_${crypto.randomUUID()}`;

    const abacateRes = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        expiresIn,
        description,
        customer: {
          name: fullName,
          email,
          cellphone: phone,
          taxId: cpf,
        },
        metadata: { externalId, userId, plan, priceId },
      }),
    });

    const json = await abacateRes.json().catch(() => ({}));

    if (!abacateRes.ok) {
      console.error("Abacate Pay error", abacateRes.status, json);
      return new Response(
        JSON.stringify({
          error: "Falha ao gerar QR Code Pix",
          status: abacateRes.status,
          details: json,
        }),
        { status: 502, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = (json as any)?.data ?? json;

    if (userId) {
      const { error: insErr } = await supabase.from("pix_charges").insert({
        user_id: userId,
        external_id: externalId,
        abacate_id: data?.id ?? null,
        amount: data?.amount ?? amount,
        status: data?.status ?? "PENDING",
        expires_at: data?.expiresAt ?? null,
        price_id: priceId,
      });
      if (insErr) console.error("pix_charges insert error", insErr);
    } else {
      console.warn("create-pix-qrcode: no userId in JWT, charge will not auto-activate premium");
    }

    return new Response(
      JSON.stringify({
        id: data?.id,
        brCode: data?.brCode,
        brCodeBase64: data?.brCodeBase64,
        amount: data?.amount,
        status: data?.status,
        expiresAt: data?.expiresAt,
        externalId,
      }),
      { status: 200, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-pix-qrcode error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }
});
