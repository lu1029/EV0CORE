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
        "instruction": "Instrução detalhada de execução com dicas de postura e respiração"
      }
    ]
  }
}

IMPORTANTE: Retorne APENAS o JSON, nada mais.`;
    } else if (mode === "generate-home-training") {
      const equipMap: Record<string, string> = {
        cadeira:  "🪑 Cadeira firme (mergulho de tríceps, step-up, búlgaro com pé apoiado, remada invertida)",
        sofa:     "🛋️ Sofá baixo (hip thrust, flexão declinada com pés no sofá, búlgaro)",
        mochila:  "🎒 Mochila com livros 5–15kg (goblet squat, afundo, rosca, remada, peso extra na flexão)",
        garrafas: "💧 Garrafas PET 1.5–2L como halteres (rosca, elevação lateral/frontal, crucifixo, tríceps francês)",
        toalha:   "🧺 Toalha (remada na porta, deslizamentos, alongamento)",
        parede:   "🧱 Parede (wall sit, handstand, flexão na parede, push-up pliométrico)",
      };
      const available: string[] = Array.isArray(userProfile?.availableEquipment) ? userProfile.availableEquipment : [];
      const allKeys = ["cadeira", "sofa", "mochila", "garrafas", "toalha", "parede"];
      const useAll = available.length === 0 || available.length === allKeys.length;
      const availableList = useAll ? allKeys : available;
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
3. Para CADA exercício de academia tradicional, ofereça o EQUIVALENTE CASEIRO claro:
   - Supino → Flexão (variações: diamante, declinada com pés no sofá, archer, com mochila nas costas)
   - Puxada/Remada → Remada invertida sob mesa, remada com toalha na porta, remada curvada com mochila
   - Leg Press → Agachamento búlgaro com pé na cadeira, pistol squat assistido, agachamento com mochila
   - Cadeira extensora → Sissy squat, extensão com toalha
   - Desenvolvimento → Pike push-up, handstand na parede, desenvolvimento com garrafas d'água
   - Rosca bíceps → Rosca com mochila ou galão de água
   - Tríceps pulley → Mergulho na cadeira, tríceps francês com garrafa, diamante
   - Hip thrust com barra → Hip thrust no sofá com mochila no quadril
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
      const extra = userProfile?.primaryGoal || userProfile?.pace || userProfile?.mealsPerDay
        ? `
PREFERÊNCIAS DA SESSÃO (responda obedecendo a estas):
- Objetivo principal: ${userProfile.primaryGoal || userProfile.goal}
- Ritmo desejado: ${userProfile.pace || "moderado"}
- Restrições alimentares: ${(userProfile.restrictions || []).join(", ") || "nenhuma"}
- Refeições por dia: ${userProfile.mealsPerDay || 4}
- Orçamento: ${userProfile.budget || "intermediário"}
`
        : "";

      systemPrompt = `Você é um nutricionista esportivo certificado. Use métodos científicos validados e a Tabela TACO (UNICAMP) para alimentos brasileiros. Suas referências: International Society of Sports Nutrition, Academy of Nutrition and Dietetics, Sociedade Brasileira de Nutrição Esportiva.

${profileContext}
${extra}

INSTRUÇÕES OBRIGATÓRIAS:
1. Calcule a TMB usando Mifflin-St Jeor (mais preciso que Harris-Benedict).
2. Calcule o GET multiplicando pelo fator de atividade adequado.
3. Ajuste calorias ao ritmo: suave (±200kcal), moderado (±400kcal), acelerado (±600kcal). Direção depende do objetivo.
4. Distribua macros: proteína 1.6-2.2g/kg para hipertrofia/perda; carbo conforme atividade; gordura mínimo 0.8g/kg.
5. Crie EXATAMENTE o número de refeições solicitado em "mealsPerDay". Inclua horários realistas.
6. Respeite restrições alimentares e orçamento. Use alimentos brasileiros acessíveis.
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
    console.error('evo-ai-chat error:', e);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
