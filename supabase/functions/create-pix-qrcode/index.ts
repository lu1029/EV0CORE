import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface PixRequestBody {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  amount: number; // amount in cents (BRL centavos)
  description?: string;
  expiresIn?: number; // seconds
}

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ABACATEPAY_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as PixRequestBody;
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = onlyDigits(body.phone || "");
    const cpf = onlyDigits(body.cpf || "");
    const amount = Number(body.amount);
    const description = (body.description || "Assinatura EvoCore Premium").slice(0, 140);
    const expiresIn = Number.isFinite(Number(body.expiresIn)) ? Number(body.expiresIn) : 3600;

    const errors: Record<string, string> = {};
    if (fullName.length < 3 || fullName.length > 120) errors.fullName = "Nome inválido";
    if (!isValidEmail(email)) errors.email = "E-mail inválido";
    if (phone.length < 10 || phone.length > 13) errors.phone = "Telefone inválido";
    if (!isValidCPF(cpf)) errors.cpf = "CPF inválido";
    if (!Number.isFinite(amount) || amount < 100) errors.amount = "Valor inválido (mínimo R$ 1,00 em centavos)";

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({ error: "validation", fields: errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        metadata: { externalId },
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
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Abacate returns { data: { id, brCode, brCodeBase64, amount, status, expiresAt, ... } }
    const data = (json as any)?.data ?? json;

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
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-pix-qrcode error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
