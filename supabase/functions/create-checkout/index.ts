import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Best-effort identify caller for rate limiting (the function itself
    // does not require auth — guests can buy — but we limit per-user when present)
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    let userId: string | null = null;
    if (jwt) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data } = await supabase.auth.getUser(jwt);
      userId = data.user?.id ?? null;

      // 5 requests / 15 min per user
      const rl = await checkRateLimit(supabase, `checkout:user:${userId}`, 5, 15);
      if (!rl.allowed) {
        return rateLimitResponse(15, 5, { ...corsHeaders, ...securityHeaders });
      }
    }

    const { priceId, quantity, customerEmail, userId: bodyUserId, returnUrl, environment, uiMode, cancelUrl } = await req.json();
    if (!priceId || typeof priceId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }

    const env = (environment || 'sandbox') as StripeEnv;
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: "Price not found" }), {
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const effectiveUserId = userId || bodyUserId;

    const useHosted = uiMode === "hosted";
    const origin = req.headers.get("origin") || "";

    const sessionParams: any = {
      line_items: [{ price: stripePrice.id, quantity: quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ...(customerEmail && { customer_email: customerEmail }),
      ...(effectiveUserId && {
        metadata: { userId: effectiveUserId },
        ...(isRecurring && { subscription_data: { metadata: { userId: effectiveUserId } } }),
      }),
    };

    if (useHosted) {
      sessionParams.success_url = returnUrl || `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
      sessionParams.cancel_url = cancelUrl || `${origin}/premium`;
    } else {
      sessionParams.ui_mode = "embedded";
      sessionParams.return_url = returnUrl || `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret, url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error('create-checkout error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }
});
