import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Note: API key is restricted by HTTP referrer in Google Cloud Console,
  // so it's safe to return without JWT validation.
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ key: apiKey }), {
    headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
