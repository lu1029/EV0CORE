import { createClient } from "npm:@supabase/supabase-js@2";

// Public webhook called by Abacate Pay. Authenticated via a shared secret in the query string (?webhookSecret=...)
// as recommended by Abacate Pay's docs.

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PRODUCT_ID = "evocore_premium";

const PLAN_DURATION_DAYS: Record<string, number> = {
  evocore_premium_weekly: 7,
  evocore_premium_monthly: 30,
  evocore_premium_yearly: 365,
  evocore_premium_pix: 30, // legacy fallback
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const expected = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");
    const provided = req.headers.get("X-Webhook-Secret");
    if (!expected || !provided || expected !== provided) {
      console.warn("abacatepay-webhook: invalid secret");
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = await req.json().catch(() => ({} as any));
    const eventType: string = event?.event || event?.type || "unknown";
    const data = event?.data?.pixQrCode || event?.data?.billing || event?.data || {};
    console.log("abacatepay-webhook event:", eventType, JSON.stringify(data).slice(0, 500));

    const abacateId: string | undefined = data?.id;
    const status: string = data?.status || "";
    const amount: number = Number(data?.amount || 0);
    const metadataExternalId: string | undefined = data?.metadata?.externalId;
    const metadataUserId: string | undefined = data?.metadata?.userId;

    // Find the pending charge
    let charge: any = null;
    if (abacateId) {
      const { data: c } = await supabase
        .from("pix_charges")
        .select("*")
        .eq("abacate_id", abacateId)
        .maybeSingle();
      charge = c;
    }
    if (!charge && metadataExternalId) {
      const { data: c } = await supabase
        .from("pix_charges")
        .select("*")
        .eq("external_id", metadataExternalId)
        .maybeSingle();
      charge = c;
    }

    const userId: string | undefined = charge?.user_id || metadataUserId;
    if (!userId) {
      console.error("abacatepay-webhook: cannot resolve user for event", abacateId);
      return new Response(JSON.stringify({ received: true, note: "no user resolved" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the charge row
    if (charge) {
      await supabase
        .from("pix_charges")
        .update({
          status: status || charge.status,
          paid_at: status === "PAID" ? new Date().toISOString() : charge.paid_at,
          abacate_id: abacateId ?? charge.abacate_id,
        })
        .eq("id", charge.id);
    }

    // On payment confirmed, create/extend a subscription (30 days)
    const isPaid =
      status === "PAID" ||
      eventType === "billing.paid" ||
      eventType === "pixQrCode.paid";

    if (isPaid) {
      const now = new Date();
      const resolvedPriceId: string =
        charge?.price_id ||
        data?.metadata?.priceId ||
        "evocore_premium_monthly";
      const days = PLAN_DURATION_DAYS[resolvedPriceId] ?? 30;
      const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const subscriptionId = `pix_${abacateId || charge?.external_id || crypto.randomUUID()}`;

      const { error: subErr } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: `pix_customer_${userId}`,
          product_id: PRODUCT_ID,
          price_id: resolvedPriceId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: true,
          environment: "pix",
          updated_at: now.toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      );
      if (subErr) console.error("subscriptions upsert error", subErr);
      console.log("abacatepay-webhook: premium activated for user", userId, "amount", amount);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("abacatepay-webhook error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
