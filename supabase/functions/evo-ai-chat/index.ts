import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, securityHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GENDER_WHITELIST = ["male", "female", "other"];
const GOAL_WHITELIST = ["lose", "gain", "condition", "define", "health"];
const LEVEL_WHITELIST = ["beginner", "intermediate", "advanced"];
const PREF_WHITELIST = ["gym", "home", "running", "all"];

function clamp(n: any, min: number, max: number, fallback: number): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function cleanString(v: any): string {
  return String(v ?? "")
    .slice(0, 100)
    .trim()
    // Strip dangerous characters
    .replace(/[<>"`{}\[\]\\]/g, "")
    // Strip prompt-injection keywords
    .replace(/\b(ignore|system|prompt|instruction|forget|pretend|jailbreak|override|disregard)\b/gi, "");
}

function sanitizeProfileForPrompt(profile: any) {
  const p = profile ?? {};
  return {
    name: cleanString(p.name) || "Atleta",
    age: clamp(p.age, 10, 120, 25),
    weight: clamp(p.weight, 20, 300, 70),
    height: clamp(p.height, 100, 250, 175),
    daysPerWeek: clamp(p.days_per_week ?? p.daysPerWeek, 1, 7, 4),
    gender: GENDER_WHITELIST.includes(p.gender) ? p.gender : "other",
    goal: GOAL_WHITELIST.includes(p.goal) ? p.goal : "health",
    level: LEVEL_WHITELIST.includes(p.level) ? p.level : "beginner",
    preference: PREF_WHITELIST.includes(p.preference) ? p.preference : "all",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // ──────────────────────────────────────────────────────────────
  // 1. Authentication: require a valid Bearer token
  // ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  // Service-role client for trusted reads + rate limiting writes
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // ──────────────────────────────────────────────────────────────
  // 2. Rate limit: 20 requests / 60 min per user
  // ──────────────────────────────────────────────────────────────
  const rl = await checkRateLimit(admin, `evo-ai-chat:user:${user.id}`, 20, 60);
  if (!rl.allowed) {
    return rateLimitResponse(60, 20, { ...corsHeaders, ...securityHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ────────────────────────────────────────────────────────────
    // 3. Trusted profile from DB (NEVER from request body)
    // ────────────────────────────────────────────────────────────
    const { data: profileRow } = await admin
      .from("profiles")
      .select("name, age, gender, weight, height, goal, level, preference, days_per_week")
      .eq("user_id", user.id)
      .maybeSingle();

    const safeProfile = sanitizeProfileForPrompt(profileRow);

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

    const profileContext = `
PERFIL DO USUÁRIO:
- Nome: ${safeProfile.name}
- Idade: ${safeProfile.age} anos
- Gênero: ${safeProfile.gender === "male" ? "Masculino" : safeProfile.gender === "female" ? "Feminino" : "Outro"}
- Peso: ${safeProfile.weight} kg
- Altura: ${safeProfile.height} cm
- Objetivo: ${goals[safeProfile.goal]}
- Nível: ${levels[safeProfile.level]}
- Preferência: ${preferences[safeProfile.preference]}
- Dias de treino por semana: ${safeProfile.daysPerWeek}
`;

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
        "instruction": "Instrução detalhada de execução com dicas de postura e respiração"
      }
    ]
  }
}

IMPORTANTE: Retorne APENAS o JSON, nada mais.`;
    } else if (mode === "generate-home-training") {
      // For home training we accept *only* a small whitelist coming from the body
      // (the available equipment list). It does NOT influence the rest of the prompt.
      const equipMap: Record<string, string> = {
        cadeira:  "🪑 Cadeira firme (mergulho de tríceps, step-up, búlgaro com pé apoiado, remada invertida)",
        sofa:     "🛋️ Sofá baixo (hip thrust, flexão declinada com pés no sofá, búlgaro)",
        mochila:  "🎒 Mochila com livros 5–15kg (goblet squat, afundo, rosca, remada, peso extra na flexão)",
        garrafas: "💧 Garrafas PET 1.5–2L como halteres (rosca, elevação lateral/frontal, crucifixo, tríceps francês)",
        toalha:   "🧺 Toalha (remada na porta, deslizamentos, alongamento)",
        parede:   "🧱 Parede (wall sit, handstand, flexão na parede, push-up pliométrico)",
      };
      const allKeys = ["cadeira", "sofa", "mochila", "garrafas", "toalha", "parede"];
      let bodyEquip: string[] = [];
      try {
        const raw = (await req.clone().json())?.userProfile?.availableEquipment;
        if (Array.isArray(raw)) bodyEquip = raw.filter((k) => allKeys.includes(k));
      } catch { /* ignore */ }
      const useAll = bodyEquip.length === 0 || bodyEquip.length === allKeys.length;
      const availableList = useAll ? allKeys : bodyEquip;
      const unavailable = allKeys.filter(k => !availableList.includes(k));

      const equipBlock = `
EQUIPAMENTOS DISPONÍVEIS NESTA CASA (USE APENAS ESTES):
${availableList.map(k => `- ${equipMap[k]}`).join("\n")}
${unavailable.length ? `\nNÃO USAR (o usuário não tem): ${unavailable.map(k => equipMap[k]).join("; ")}` : ""}
`;

      systemPrompt = `Você é um personal trainer certificado especialista em TREINOS EM CASA e CALISTENIA. Crie um plano de treino COMPLETO usando APENAS o corpo e os ITENS LISTADOS ABAIXO — nada de equipamento de academia, e NUNCA itens fora da lista.

${profileContext}
${equipBlock}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie um plano semanal completo baseado nos dias disponíveis do usuário.
2. PRIORIZE exercícios usando OBJETOS DO DIA-A-DIA — torne o treino realista para quem treina em casa:
   - 🪑 Cadeira firme: mergulho de tríceps, step-up, búlgaro com pé apoiado, remada invertida, elevação de pernas sentado
   - 🎒 Mochila com livros/roupas (5-15kg): agachamento goblet, afundo, rosca direta, remada curvada, desenvolvimento, peso extra em flexão
   - 💧 Garrafas PET 1.5L–2L ou galão 5L (halteres improvisados): rosca alternada, elevação lateral/frontal, crucifixo deitado no chão, tríceps francês
   - 🧺 Toalha: remada na porta (toalha presa), face pull, alongamento de ombro, deslizamento de glúteo no piso
   - 🧱 Parede: wall sit, handstand encostado, flexão na parede (iniciante), push-up pliométrico
   - 🛏️ Cama/sofá baixo: hip thrust, elevação de quadril, flexão declinada com pés no sofá, abdominal infra
   - 🚪 Batente de porta / mesa robusta: barra fixa improvisada (com toalha na porta), remada invertida sob a mesa
   - 📚 Pilha de livros: caixote para box step / step-up
3. Para CADA exercício de academia tradicional, ofereça o EQUIVALENTE CASEIRO claro.
4. SEMPRE descreva no campo "instruction" QUAL OBJETO DE CASA usar e COMO posicioná-lo com segurança.
5. Adapte ao nível: iniciante (mais reps, exercícios básicos, sem peso extra), intermediário (mochila leve, variações), avançado (mochila pesada, unilaterais, pliométricos, isometrias longas).
6. Inclua aquecimento (5min) e alongamento final.
7. OBRIGATÓRIO: Para CADA exercício, inclua o campo "gifKey" com um desses valores exatos:
   flexao, flexao_diamante, flexao_declinada, flexao_inclinada, agachamento, agachamento_salto, agachamento_sumo, afundo, afundo_bulgaro, prancha, prancha_lateral, mountain_climber, burpee, jumping_jack, mergulho_cadeira, hip_thrust, elevacao_pernas, abdominal, bicicleta_ar, superman, remada_toalha, pike_pushup, step_up, wall_sit, corrida_lugar, polichinelo, kickback, gato_vaca, alongamento_posterior, alongamento_quadriceps

FORMATO DE RESPOSTA - OBRIGATÓRIO JSON:
{
  "planName": "Nome do plano",
  "description": "Descrição breve do plano caseiro",
  "workouts": {
    "Nome do Treino (ex: Upper Body em Casa)": [
      {
        "name": "Nome do exercício",
        "muscle": "Grupo muscular",
        "emoji": "emoji relevante",
        "sets": 3,
        "reps": "12-15",
        "weight": "Peso corporal",
        "rest": 45,
        "instruction": "Instrução detalhada com dicas de postura, respiração e como usar itens de casa se aplicável",
        "gifKey": "flexao"
      }
    ]
  }
}

IMPORTANTE: Retorne APENAS o JSON, nada mais. Use exercícios REAIS e COMPROVADOS.`;
    } else if (mode === "generate-nutrition") {
      systemPrompt = `Você é um nutricionista esportivo certificado. Use métodos científicos validados e a Tabela TACO (UNICAMP) para alimentos brasileiros. Suas referências: International Society of Sports Nutrition, Academy of Nutrition and Dietetics, Sociedade Brasileira de Nutrição Esportiva.

${profileContext}

INSTRUÇÕES OBRIGATÓRIAS:
1. Calcule a TMB usando Mifflin-St Jeor (mais preciso que Harris-Benedict).
2. Calcule o GET multiplicando pelo fator de atividade adequado.
3. Ajuste calorias ao ritmo conforme objetivo do usuário.
4. Distribua macros: proteína 1.6-2.2g/kg para hipertrofia/perda; carbo conforme atividade; gordura mínimo 0.8g/kg.
5. Crie 4 refeições por padrão. Inclua horários realistas.
6. Use alimentos brasileiros acessíveis.
7. Seja PRECISO nos macros e calorias por refeição — eles devem somar perto do total diário.

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
  "tips": ["Dica 1", "Dica 2", "Dica 3"]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown, sem texto antes ou depois.`;
    } else {
      systemPrompt = `Você é o EvoAI, um personal trainer virtual inteligente e amigável do app EVOCORE. Você é como um amigo especialista em fitness que realmente se importa com o progresso do usuário.

${profileContext}

SUAS DIRETRIZES:
1. PERSONALIZE tudo baseado no perfil do usuário acima. Nunca dê respostas genéricas.
2. Seja HUMANO, simpático e motivador. Use emojis com moderação.
3. Ao montar treinos, seja ESPECÍFICO: exercício, séries, repetições, carga sugerida e descanso.
4. Se o usuário treina em casa, PRIORIZE exercícios com peso corporal, calistenia, HIIT e circuitos. Sugira itens domésticos como peso extra (garrafas, mochilas, cadeiras).
5. Ao sugerir dietas, considere peso, objetivo e nível de atividade.
6. Use linguagem informal brasileira (pt-BR), como se fosse um amigo personal.
7. Se o usuário perguntar algo fora do escopo fitness/saúde, responda brevemente e redirecione.
8. Calcule TMB e macros baseado nos dados reais do perfil quando relevante.
9. Sempre dê orientações seguras. Recomende procurar um profissional para situações médicas.
10. Formate respostas com markdown: use **negrito**, listas e cabeçalhos para organizar.
11. Seja conciso mas completo. Não faça respostas muito longas a menos que peçam detalhes.`;
    }

    const isStructured = mode === "generate-training" || mode === "generate-home-training" || mode === "generate-nutrition";

    // Defensive cap on the number/size of user messages forwarded to the model.
    const safeMessages = Array.isArray(messages) ? messages.slice(-20).map((m: any) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: String(m?.content ?? "").slice(0, 4000),
    })) : [];

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
          ...safeMessages,
        ],
        stream: !isStructured,
        ...(isStructured ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }

    if (isStructured) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      return new Response(JSON.stringify({ result: content }), {
        headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("evo-ai-chat error:", e);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500, headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
    });
  }
});
