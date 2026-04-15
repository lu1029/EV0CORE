import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const goals: Record<string, string> = {
      lose: "emagrecer e perder gordura",
      gain: "ganhar massa muscular (hipertrofia)",
      condition: "melhorar condicionamento físico",
      define: "definir o corpo",
      health: "melhorar a saúde geral",
    };

    const levels: Record<string, string> = {
      beginner: "iniciante",
      intermediate: "intermediário",
      advanced: "avançado",
    };

    const preferences: Record<string, string> = {
      gym: "academia com equipamentos",
      home: "treino em casa sem equipamento",
      running: "corrida ao ar livre",
      all: "todos os tipos de treino",
    };

    const profileContext = userProfile
      ? `
PERFIL DO USUÁRIO:
- Nome: ${userProfile.name || "Atleta"}
- Idade: ${userProfile.age} anos
- Gênero: ${userProfile.gender === "male" ? "Masculino" : "Feminino"}
- Peso: ${userProfile.weight} kg
- Altura: ${userProfile.height} cm
- Objetivo: ${goals[userProfile.goal] || userProfile.goal || "não definido"}
- Nível: ${levels[userProfile.level] || userProfile.level || "não definido"}
- Preferência: ${preferences[userProfile.preference] || userProfile.preference || "não definido"}
- Dias de treino por semana: ${userProfile.daysPerWeek || 4}
`
      : "";

    const systemPrompt = `Você é o EvoAI, um personal trainer virtual inteligente e amigável do app EVOCORE. Você é como um amigo especialista em fitness que realmente se importa com o progresso do usuário.

${profileContext}

SUAS DIRETRIZES:
1. PERSONALIZE tudo baseado no perfil do usuário acima. Nunca dê respostas genéricas.
2. Seja HUMANO, simpático e motivador. Use emojis com moderação.
3. Ao montar treinos, seja ESPECÍFICO: exercício, séries, repetições, carga sugerida e descanso.
4. Ao sugerir dietas, considere peso, objetivo e nível de atividade.
5. Use linguagem informal brasileira (pt-BR), como se fosse um amigo personal.
6. Se o usuário perguntar algo fora do escopo fitness/saúde, responda brevemente e redirecione.
7. Calcule TMB e macros baseado nos dados reais do perfil quando relevante.
8. Sempre dê orientações seguras. Recomende procurar um profissional para situações médicas.
9. Formate respostas com markdown: use **negrito**, listas e cabeçalhos para organizar.
10. Seja conciso mas completo. Não faça respostas muito longas a menos que peçam detalhes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("evo-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
