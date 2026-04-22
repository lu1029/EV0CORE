import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";

const ALLOWED_EVENTS = new Set([
  "login_success",
  "login_failure",
  "logout",
  "logout_inactivity",
  "consent_accepted",
  "account_deletion_requested",
  "premium_status_changed",
  "password_changed",
]);

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limit per IP: 50 per 15 min
    const rl = await checkRateLimit(admin, `audit:ip:${ip}`, 50, 15);
    if (!rl.allowed) {
      return rateLimitResponse(15, 50, { ...corsHeaders, ...securityHeaders });
    }

    const { event_type, event_data } = await req.json();

    if (typeof event_type !== "string" || !ALLOWED_EVENTS.has(event_type)) {
      return new Response(JSON.stringify({ error: "Invalid event type" }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to identify the user (optional — login_failure may not have a user)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    // Sanitize event_data — drop any key longer than 100 chars or value > 500 chars
    const safeData: Record<string, unknown> = {};
    if (event_data && typeof event_data === "object") {
      for (const [k, v] of Object.entries(event_data)) {
        if (k.length > 100) continue;
        const strV = typeof v === "string" ? v : JSON.stringify(v);
        if (strV && strV.length <= 500) safeData[k] = v;
      }
    }

    const ua = req.headers.get("user-agent")?.slice(0, 300) || null;

    await admin.from("security_audit_logs").insert({
      user_id: userId,
      event_type,
      event_data: safeData,
      ip_address: ip === "unknown" ? null : ip,
      user_agent: ua,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("log-security-event error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }
});
