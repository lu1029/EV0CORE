// Simple sliding-window rate limiter backed by the public.rate_limits table.
// Use a service-role Supabase client. On any internal failure, fail OPEN
// (allow the request) so a database hiccup never blocks legitimate traffic.

export async function checkRateLimit(
  supabase: any,
  key: string,
  maxRequests: number,
  windowMinutes: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(Math.floor(now.getMinutes() / windowMinutes) * windowMinutes);
    const windowStart = now.toISOString();

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count")
      .eq("key", key)
      .eq("window_start", windowStart)
      .maybeSingle();

    const currentCount = existing?.count ?? 0;

    if (currentCount >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    await supabase.from("rate_limits").upsert(
      { key, window_start: windowStart, count: currentCount + 1 },
      { onConflict: "key,window_start" },
    );

    return { allowed: true, remaining: maxRequests - currentCount - 1 };
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}

export function rateLimitResponse(
  windowMinutes: number,
  maxRequests: number,
  baseHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(windowMinutes * 60),
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
