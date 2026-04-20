import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Cache global em memória: nome (lowercase) -> url (gif ou imagem) encontrado. */
const memCache = new Map<string, string | null>();
/** Cache de promessas em andamento para deduplicar requests paralelos. */
const inflight = new Map<string, Promise<string | null>>();

/** Mapa rápido PT-BR -> termo de busca em inglês usado pela ExerciseDB.
 *  Cobre 200+ variações: peito, costas, ombros, braços, pernas, glúteos, core,
 *  cardio, calistenia/casa e variações com equipamento/livre.
 *  A ordem importa: regras mais específicas primeiro. */
const PT_TO_EN: Array<[RegExp, string]> = [
  // ===== PEITO =====
  [/supino.*reto.*barra|barbell bench press/i, "barbell bench press"],
  [/supino.*reto.*halter|dumbbell bench press/i, "dumbbell bench press"],
  [/supino.*inclinado.*halter/i, "incline dumbbell press"],
  [/supino.*inclinado.*barra/i, "incline barbell bench press"],
  [/supino.*inclinado/i, "incline dumbbell press"],
  [/supino.*declinado.*halter/i, "decline dumbbell press"],
  [/supino.*declinad/i, "decline barbell bench press"],
  [/supino.*fechado|close.?grip bench/i, "close grip barbell bench press"],
  [/supino/i, "barbell bench press"],
  [/crossover.*alto|high cable crossover/i, "cable crossover high"],
  [/crossover.*baixo|low cable crossover/i, "cable crossover low"],
  [/crossover|cable fly/i, "cable crossover"],
  [/crucifixo.*inclinad/i, "incline dumbbell fly"],
  [/crucifixo.*m(á|a)quina|peck deck/i, "machine fly"],
  [/crucifixo|fly|voador/i, "dumbbell fly"],
  [/peck deck/i, "machine fly"],
  [/mergulho.*peit|chest dip/i, "chest dip"],
  [/mergulho|paralela|dip/i, "triceps dip"],
  [/pullover/i, "dumbbell pullover"],

  // ===== COSTAS / PUXADA =====
  [/puxada.*frontal|lat.*pulldown|pulldown frontal/i, "lat pulldown"],
  [/puxada.*aberta|wide.*pulldown/i, "wide grip lat pulldown"],
  [/puxada.*fechada|close.*pulldown/i, "close grip lat pulldown"],
  [/puxada.*triangulo|neutral.*pulldown/i, "v-bar pulldown"],
  [/puxada/i, "lat pulldown"],
  [/remada.*curvada.*barra|barbell row/i, "barbell bent over row"],
  [/remada.*curvada/i, "bent over row"],
  [/remada.*halter|dumbbell row|remada unilateral/i, "one-arm dumbbell row"],
  [/remada.*baixa|seated.*row|seated cable row/i, "seated cable row"],
  [/remada.*cavalinh|t.?bar row/i, "t-bar row"],
  [/remada.*toalha|inverted row/i, "inverted row"],
  [/remada.*alta|upright row/i, "barbell upright row"],
  [/remada/i, "seated cable row"],
  [/barra.*fixa.*pegada aberta|wide.*pull.?up/i, "wide grip pull-up"],
  [/barra.*fixa|pull.?up/i, "pull-up"],
  [/barra.*assistida|assisted pull/i, "assisted pull-up"],
  [/chin.?up/i, "chin-up"],
  [/levantamento.*terra.*sum(o|ô)|sumo deadlift/i, "sumo deadlift"],
  [/levantamento.*terra.*romeno|romanian deadlift|stiff/i, "romanian deadlift"],
  [/levantamento.*terra|deadlift/i, "barbell deadlift"],
  [/hiperextens(ã|a)o|extens(ã|a)o lombar|back extension/i, "back extension"],
  [/good.?morning/i, "barbell good morning"],

  // ===== OMBROS =====
  [/desenvolvimento.*halter|dumbbell shoulder press/i, "dumbbell shoulder press"],
  [/desenvolvimento.*arnold|arnold press/i, "arnold press"],
  [/desenvolvimento.*militar|military press/i, "military press"],
  [/desenvolvimento|overhead press|shoulder press/i, "barbell overhead press"],
  [/eleva(ç|c)(ã|a)o.*lateral|lateral raise/i, "dumbbell lateral raise"],
  [/eleva(ç|c)(ã|a)o.*frontal|front raise/i, "dumbbell front raise"],
  [/crucifixo.*invertid|reverse fly|reverse pec deck/i, "rear deltoid fly"],
  [/face.?pull/i, "cable face pull"],
  [/encolhimento|shrug/i, "dumbbell shrug"],

  // ===== BRAÇOS — BÍCEPS =====
  [/rosca.*direta.*barra w|w.?bar curl/i, "ez-barbell curl"],
  [/rosca.*direta.*barra|barbell curl/i, "barbell curl"],
  [/rosca.*direta|biceps curl|rosca biceps/i, "dumbbell curl"],
  [/rosca.*alternada/i, "dumbbell alternate biceps curl"],
  [/rosca.*martelo|hammer curl/i, "hammer curl"],
  [/rosca.*scott|preacher curl/i, "preacher curl"],
  [/rosca.*concentrada|concentration curl/i, "concentration curl"],
  [/rosca.*invertida|reverse curl/i, "reverse barbell curl"],
  [/rosca.*spider|spider curl/i, "spider curl"],
  [/rosca.*polia|cable curl/i, "cable biceps curl"],

  // ===== BRAÇOS — TRÍCEPS =====
  [/tr(í|i)ceps.*corda|rope pushdown|triceps rope/i, "triceps rope pushdown"],
  [/tr(í|i)ceps.*pulley|tricep pushdown|tr(í|i)ceps polia/i, "triceps pushdown"],
  [/tr(í|i)ceps.*testa|skull.?crusher|skullcrusher/i, "skull crusher"],
  [/tr(í|i)ceps.*franc(ê|e)s|overhead.*tric/i, "overhead triceps extension"],
  [/tr(í|i)ceps.*coice|kickback|tr(í|i)ceps unilateral/i, "triceps kickback"],
  [/tr(í|i)ceps.*banco|bench dip/i, "bench dip"],
  [/tr(í|i)ceps/i, "triceps pushdown"],

  // ===== ANTEBRAÇO =====
  [/rosca.*punho|wrist curl/i, "wrist curl"],
  [/extens(ã|a)o.*punho|reverse wrist curl/i, "reverse wrist curl"],
  [/farmer.*walk|caminhada do fazendeiro/i, "farmer's walk"],

  // ===== PERNAS — QUADRÍCEPS =====
  [/agachamento.*salto|jump squat/i, "jump squat"],
  [/agachamento.*sum(ô|o)/i, "barbell sumo squat"],
  [/agachamento.*b(ú|u)lgaro|bulgarian split squat/i, "bulgarian split squat"],
  [/agachamento.*goblet|goblet squat/i, "dumbbell goblet squat"],
  [/agachamento.*frontal|front squat/i, "barbell front squat"],
  [/agachamento.*pistola|pistol squat/i, "pistol squat"],
  [/agachamento.*hack|hack squat/i, "hack squat"],
  [/agachamento.*livre|agachamento.*barra/i, "barbell back squat"],
  [/agachamento.*sumo/i, "sumo squat"],
  [/agachamento|squat/i, "barbell back squat"],
  [/leg press.*45|45.*leg press/i, "leg press"],
  [/leg press|press de pernas/i, "leg press"],
  [/cadeira extensora|leg extension/i, "leg extension"],
  [/afundo.*caminh|walking lunge/i, "walking lunge"],
  [/afundo.*reverso|reverse lunge/i, "reverse lunge"],
  [/afundo.*lateral|side lunge/i, "side lunge"],
  [/afundo|avanço|lunge/i, "barbell lunge"],
  [/passada/i, "walking lunge"],
  [/step.?up|subida no banco/i, "dumbbell step up"],

  // ===== PERNAS — POSTERIOR =====
  [/mesa flexora|lying leg curl|flexora deitad/i, "lying leg curl"],
  [/cadeira flexora|seated leg curl/i, "seated leg curl"],
  [/flexora em p(é|e)|standing leg curl/i, "standing leg curl"],
  [/nordic|nordic curl/i, "nordic hamstring curl"],

  // ===== GLÚTEOS / QUADRIL =====
  [/hip.?thrust|eleva(ç|c)(ã|a)o.*quadril/i, "barbell hip thrust"],
  [/glute.?bridge|ponte.*gl(ú|u)teo|elevação pélvica/i, "glute bridge"],
  [/coice.*polia|cable kickback/i, "cable kickback"],
  [/coice.*4 apoios|donkey kick|burrinho/i, "donkey kick"],
  [/abdu(ç|c)(ã|a)o.*quadril|hip abduction|cadeira abdutora/i, "hip abduction"],
  [/adu(ç|c)(ã|a)o.*quadril|hip adduction|cadeira adutora/i, "hip adduction"],
  [/elevação.*lateral.*perna|side leg raise/i, "side hip abduction"],
  [/clamshell|concha/i, "clamshell"],
  [/fire.?hydrant/i, "fire hydrant"],

  // ===== PANTURRILHA =====
  [/panturrilha.*sentado|seated calf/i, "seated calf raise"],
  [/panturrilha.*em p(é|e)|standing calf/i, "standing calf raise"],
  [/panturrilha.*burrinho|donkey calf/i, "donkey calf raise"],
  [/panturrilha|calf raise/i, "standing calf raise"],

  // ===== CORE / ABDÔMEN =====
  [/abdominal.*bicicleta|bicycle crunch/i, "bicycle crunch"],
  [/abdominal.*infra|leg raise|eleva(ç|c)(ã|a)o.*pernas/i, "lying leg raise"],
  [/abdominal.*supra|crunch tradicional/i, "crunch"],
  [/abdominal.*remador|v.?up/i, "v-up"],
  [/abdominal.*canivete|jackknife/i, "jackknife sit-up"],
  [/abdominal.*oblíquo|oblique crunch/i, "oblique crunch"],
  [/abdominal|crunch|sit.?up/i, "crunch"],
  [/prancha.*lateral|side plank/i, "side plank"],
  [/prancha.*com toque ombro|shoulder tap plank/i, "plank shoulder tap"],
  [/prancha|plank/i, "plank"],
  [/russian.?twist|tor(ç|c)(ã|a)o russa/i, "russian twist"],
  [/superman/i, "superman"],
  [/bird.?dog/i, "bird dog"],
  [/dead.?bug/i, "dead bug"],
  [/hollow.?hold|hollow body/i, "hollow body hold"],
  [/mountain.?climber|escalador/i, "mountain climber"],
  [/ab.?wheel|roda abdominal|roller abdominal/i, "ab wheel rollout"],
  [/elevação de joelho.*suspens|hanging knee raise/i, "hanging knee raise"],
  [/hanging.*leg raise|elevação.*perna.*suspens/i, "hanging leg raise"],

  // ===== CALISTENIA / CASA — FLEXÕES =====
  [/flex(ã|a)o.*toque.*ombro|shoulder tap push.?up/i, "shoulder tap push up"],
  [/flex(ã|a)o.*diamante|diamond push.?up/i, "diamond push up"],
  [/flex(ã|a)o.*declinad/i, "decline push up"],
  [/flex(ã|a)o.*inclinad|knee push.?up/i, "incline push up"],
  [/flex(ã|a)o.*aberta|wide push.?up/i, "wide push up"],
  [/flex(ã|a)o.*joelho|kneeling push.?up/i, "kneeling push up"],
  [/flex(ã|a)o.*hindu|hindu push.?up/i, "hindu push up"],
  [/flex(ã|a)o.*archer|archer push.?up/i, "archer push up"],
  [/flex(ã|a)o.*spider|spider push.?up/i, "spider man push up"],
  [/flex(ã|a)o.*pino|handstand push/i, "handstand push up"],
  [/flex(ã|a)o.*explosiva|clap push.?up/i, "clapping push up"],
  [/flex(ã|a)o.*bra(ç|c)o|^flex(ã|a)o$|push.?up/i, "push up"],

  // ===== CARDIO / HIIT =====
  [/burpee/i, "burpee"],
  [/jumping.?jack|polichinelo/i, "jumping jacks"],
  [/pular corda|jump rope|corda/i, "jump rope"],
  [/corrida.*lugar|high knee|joelho alto/i, "high knees"],
  [/box jump|salto.*caixa/i, "box jump"],
  [/bear crawl|engatinhar/i, "bear crawl"],
  [/skater|patinador/i, "skater jump"],
  [/squat.*jump|jump squat/i, "jump squat"],
  [/agachamento.*tesoura|scissor jump/i, "scissor jump"],
  [/lunge.*jump|salto.*afundo/i, "jumping lunge"],
  [/tuck jump/i, "tuck jump"],
  [/star jump/i, "star jump"],
  [/kettlebell swing|swing kettlebell/i, "kettlebell swing"],
  [/clean and jerk|arremesso/i, "barbell clean and jerk"],
  [/snatch/i, "barbell snatch"],
  [/thruster/i, "dumbbell thruster"],
  [/wall ball/i, "wall ball"],

  // ===== ALONGAMENTO / MOBILIDADE =====
  [/alongamento.*isquio|hamstring stretch/i, "standing hamstring stretch"],
  [/alongamento.*peito|chest stretch/i, "chest stretch"],
  [/cat.?cow|gato.*vaca/i, "cat cow"],
  [/child.*pose|postura.*crian(ç|c)a/i, "child's pose"],
  [/cobra/i, "cobra stretch"],
  [/downward dog|c(ã|a)o olhando para baixo/i, "downward dog"],
  [/world.*greatest|greatest stretch/i, "world's greatest stretch"],
];

/** Converte um nome PT-BR/EN livre para um termo de busca em inglês. */
function toSearchTerm(name: string): string {
  for (const [re, en] of PT_TO_EN) {
    if (re.test(name)) return en;
  }
  return name; // assume já em inglês
}

async function lookupGif(name: string, muscle?: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (memCache.has(key)) return memCache.get(key) ?? null;
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    const term = toSearchTerm(key);

    // 1) Cache de IA por nome livre (resposta mais rápida quando já gerada)
    {
      const { data } = await supabase
        .from("exercise_image_cache")
        .select("image_url")
        .eq("name_key", key)
        .maybeSingle();
      if (data?.image_url) {
        memCache.set(key, data.image_url);
        return data.image_url;
      }
    }

    // 2) Busca direta no cache da biblioteca (gif ou ai_image_url)
    {
      const { data } = await supabase
        .from("exercise_library")
        .select("gif_url, ai_image_url")
        .ilike("name", `%${term}%`)
        .or("gif_url.not.is.null,ai_image_url.not.is.null")
        .limit(1)
        .maybeSingle();
      const url = data?.gif_url || data?.ai_image_url;
      if (url) {
        memCache.set(key, url);
        return url;
      }
    }

    // 3) Edge function da ExerciseDB OSS (GIFs animados reais)
    try {
      const qs = new URLSearchParams({ search: term, limit: "1" }).toString();
      const { data } = await supabase.functions.invoke(`exercises?${qs}`, {
        method: "GET",
      });
      const url: string | null = data?.items?.[0]?.gif_url ?? null;
      if (url) {
        memCache.set(key, url);
        return url;
      }
    } catch {
      /* fallthrough */
    }

    // 4) Fallback final: gera imagem com Lovable AI e cacheia
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-image", {
        body: { name, muscle },
      });
      if (!error && data?.image_url) {
        memCache.set(key, data.image_url);
        return data.image_url;
      }
    } catch {
      /* ignore */
    }

    memCache.set(key, null);
    return null;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Hook que resolve a mídia (GIF ou imagem gerada por IA) de um exercício pelo nome.
 * Retorna o gifUrl original se já existir, ou busca:
 *   1. cache de imagens IA por nome
 *   2. biblioteca local (gif/ai_image_url)
 *   3. ExerciseDB OSS via edge function
 *   4. gera com Lovable AI como fallback
 */
export function useExerciseGif(
  name: string,
  fallbackGifUrl?: string,
  muscle?: string,
): { gifUrl: string | null; loading: boolean } {
  const [gifUrl, setGifUrl] = useState<string | null>(fallbackGifUrl ?? null);
  const [loading, setLoading] = useState(false);
  const lastName = useRef<string>("");

  useEffect(() => {
    if (fallbackGifUrl) {
      setGifUrl(fallbackGifUrl);
      return;
    }
    if (!name || name === lastName.current) return;
    lastName.current = name;
    setLoading(true);
    let cancelled = false;
    lookupGif(name, muscle).then((url) => {
      if (!cancelled) {
        setGifUrl(url);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [name, fallbackGifUrl, muscle]);

  return { gifUrl, loading };
}
