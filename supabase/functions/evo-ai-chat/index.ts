import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userProfile, mode } = await req.json();
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

    let systemPrompt = "";

    if (mode === "generate-training") {
      systemPrompt = `Você é um personal trainer certificado e especialista em prescrição de exercícios. Baseado no perfil do usuário, gere um plano de treino PERSONALIZADO e PRECISO.

${profileContext}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie um plano semanal completo baseado nos dias disponíveis do usuário.
2. Para CADA exercício inclua: nome exato, grupo muscular, séries, repetições, carga sugerida baseada no nível/peso e tempo de descanso.
3. Use exercícios REAIS e comprovados cientificamente.
4. Adapte cargas ao nível: iniciante (cargas leves, mais reps), intermediário (cargas médias), avançado (cargas pesadas, técnicas avançadas).
5. Considere o objetivo: hipertrofia (8-12 reps), força (4-6 reps), definição (12-15 reps), resistência (15-20 reps).

FORMATO DE RESPOSTA - OBRIGATÓRIO JSON:
Responda APENAS com um JSON válido neste formato exato, sem markdown, sem texto antes ou depois:
{
  "planName": "Nome do plano",
  "description": "Descrição breve",
  "workouts": {
    "Nome do Treino (ex: Peito + Tríceps)": [
      {
        "name": "Nome do exercício",
        "muscle": "Grupo muscular",
        "emoji": "emoji relevante",
        "sets": 4,
        "reps": "8-12",
        "weight": "60kg",
        "rest": 90,
        "instruction": "Instrução detalhada de execução"
      }
    ]
  }
}

IMPORTANTE: Retorne APENAS o JSON, nada mais.`;
    } else if (mode === "generate-nutrition") {
      systemPrompt = `Você é um nutricionista esportivo certificado. Baseado no perfil do usuário, crie um plano nutricional PERSONALIZADO, PRECISO e CIENTÍFICO.

${profileContext}

INSTRUÇÕES OBRIGATÓRIAS:
1. Calcule a TMB (Taxa Metabólica Basal) usando Harris-Benedict com os dados reais.
2. Calcule o GET (Gasto Energético Total) baseado no nível de atividade.
3. Ajuste calorias ao objetivo: déficit para emagrecer (-300 a -500kcal), superávit para ganhar massa (+200 a +400kcal).
4. Distribua macros adequadamente: proteína (1.6-2.2g/kg para hipertrofia), carboidratos e gorduras.
5. Crie refeições REAIS, acessíveis e práticas para brasileiros.
6. Inclua horários sugeridos.

FORMATO DE RESPOSTA - OBRIGATÓRIO JSON:
Responda APENAS com um JSON válido neste formato exato:
{
  "planName": "Nome do plano nutricional",
  "dailyCalories": 2200,
  "macros": {
    "protein": { "grams": 180, "percentage": 33 },
    "carbs": { "grams": 250, "percentage": 45 },
    "fat": { "grams": 55, "percentage": 22 }
  },
  "waterLiters": 3.0,
  "meals": [
    {
      "name": "Café da manhã",
      "time": "07:00",
      "calories": 450,
      "foods": ["3 ovos mexidos", "2 fatias pão integral", "1 banana", "café sem açúcar"],
      "protein": 30,
      "carbs": 45,
      "fat": 15
    }
  ],
  "tips": ["Dica 1", "Dica 2"]
}

IMPORTANTE: Retorne APENAS o JSON, nada mais. Use dados REAIS e PRECISOS baseados em ciência nutricional.`;
    } else {
      systemPrompt = `Você é o EvoAI, um personal trainer virtual inteligente e amigável do app EVOCORE. Você é como um amigo especialista em fitness que realmente se importa com o progresso do usuário.

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
    }

    const isStructured = mode === "generate-training" || mode === "generate-nutrition";

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
        stream: !isStructured,
        ...(isStructured ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isStructured) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      return new Response(JSON.stringify({ result: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("evo-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
