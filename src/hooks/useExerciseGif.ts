import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Cache global em memória: nome (lowercase) -> gifUrl encontrado. */
const memCache = new Map<string, string | null>();
/** Cache de promessas em andamento para deduplicar requests paralelos. */
const inflight = new Map<string, Promise<string | null>>();

/** Mapa rápido PT-BR -> termo de busca em inglês usado pela ExerciseDB. */
const PT_TO_EN: Array<[RegExp, string]> = [
  [/flex(ã|a)o.*ombro/i, "shoulder tap push up"],
  [/flex(ã|a)o.*diamante/i, "diamond push up"],
  [/flex(ã|a)o.*declinad/i, "decline push up"],
  [/flex(ã|a)o.*inclinad/i, "incline push up"],
  [/flex(ã|a)o.*aberta/i, "wide push up"],
  [/flex(ã|a)o.*joelh/i, "kneeling push up"],
  [/flex(ã|a)o.*braço|^flex(ã|a)o$|push.?up/i, "push up"],
  [/agachamento.*salto|jump squat/i, "jump squat"],
  [/agachamento.*sum(ô|o)/i, "sumo squat"],
  [/agachamento.*b(ú|u)lgaro|bulgarian/i, "bulgarian split squat"],
  [/agachamento.*goblet/i, "goblet squat"],
  [/agachamento.*frontal|front squat/i, "front squat"],
  [/agachamento|squat/i, "squat"],
  [/afundo.*caminh/i, "walking lunge"],
  [/afundo|lunge/i, "lunge"],
  [/burpee/i, "burpee"],
  [/mountain.?climber|escalador/i, "mountain climber"],
  [/jumping.?jack|polichinelo/i, "jumping jack"],
  [/prancha.*lateral|side plank/i, "side plank"],
  [/prancha|plank/i, "plank"],
  [/abdominal.*bicicleta|bicycle crunch/i, "bicycle crunch"],
  [/abdominal.*infra|leg raise|eleva(ç|c)(ã|a)o.*pernas/i, "lying leg raise"],
  [/abdominal|crunch|sit.?up/i, "crunch"],
  [/russian.?twist/i, "russian twist"],
  [/hip.?thrust|eleva(ç|c)(ã|a)o.*quadril/i, "hip thrust"],
  [/glute.?bridge|ponte.*gl(ú|u)teo/i, "glute bridge"],
  [/superman/i, "superman"],
  [/bird.?dog/i, "bird dog"],
  [/dead.?bug/i, "dead bug"],
  // Costas / puxada
  [/puxada.*frontal|lat.*pulldown/i, "lat pulldown"],
  [/remada.*curvada|barbell row/i, "barbell row"],
  [/remada.*halter|dumbbell row/i, "one-arm dumbbell row"],
  [/remada.*baixa|seated row/i, "seated cable row"],
  [/remada.*toalha|inverted row/i, "inverted row"],
  [/barra.*fixa|pull.?up/i, "pull up"],
  [/levantamento.*terra|deadlift/i, "barbell deadlift"],
  // Peito
  [/supino.*reto.*barra|bench press.*barbell/i, "barbell bench press"],
  [/supino.*reto.*halter|dumbbell bench press/i, "dumbbell bench press"],
  [/supino.*inclinado.*halter/i, "incline dumbbell press"],
  [/supino.*inclinado/i, "incline barbell bench press"],
  [/supino.*declinad/i, "decline barbell bench press"],
  [/supino/i, "barbell bench press"],
  [/crossover/i, "cable crossover"],
  [/crucifixo|fly/i, "dumbbell fly"],
  [/mergulho|dip/i, "chest dip"],
  // Ombros
  [/desenvolvimento.*halter/i, "dumbbell shoulder press"],
  [/desenvolvimento|overhead press/i, "barbell overhead press"],
  [/eleva(ç|c)(ã|a)o.*lateral|lateral raise/i, "dumbbell lateral raise"],
  [/eleva(ç|c)(ã|a)o.*frontal|front raise/i, "dumbbell front raise"],
  [/crucifixo invertido|reverse fly/i, "rear deltoid fly"],
  [/encolhimento|shrug/i, "dumbbell shrug"],
  // Braços
  [/rosca.*direta.*barra|barbell curl/i, "barbell curl"],
  [/rosca.*direta|biceps curl/i, "dumbbell curl"],
  [/rosca.*martelo|hammer curl/i, "hammer curl"],
  [/rosca.*scott|preacher/i, "preacher curl"],
  [/rosca.*concentrada|concentration/i, "concentration curl"],
  [/tr(í|i)ceps.*corda|rope pushdown/i, "triceps rope pushdown"],
  [/tr(í|i)ceps.*pulley|tricep pushdown/i, "triceps pushdown"],
  [/tr(í|i)ceps.*testa|skullcrusher/i, "skull crusher"],
  [/tr(í|i)ceps.*franc(ê|e)s|overhead.*tric/i, "overhead triceps extension"],
  // Pernas / glúteos
  [/leg press/i, "leg press"],
  [/cadeira extensora|leg extension/i, "leg extension"],
  [/mesa flexora|lying leg curl/i, "lying leg curl"],
  [/cadeira flexora|seated leg curl/i, "seated leg curl"],
  [/panturrilha.*sentado|seated calf/i, "seated calf raise"],
  [/panturrilha|calf raise/i, "standing calf raise"],
  [/kickback|coice|donkey kick/i, "cable kickback"],
  // Cardio
  [/pular corda|jump rope/i, "jump rope"],
  [/corrida no lugar|high knees/i, "high knees"],
  [/box jump/i, "box jump"],
];

/** Converte um nome PT-BR/EN livre para um termo de busca em inglês. */
function toSearchTerm(name: string): string {
  for (const [re, en] of PT_TO_EN) {
    if (re.test(name)) return en;
  }
  return name; // assume já em inglês
}

async function lookupGif(name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (memCache.has(key)) return memCache.get(key) ?? null;
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    const term = toSearchTerm(key);

    // 1) Busca direta no cache do banco (RLS permite SELECT a usuários autenticados)
    {
      const { data } = await supabase
        .from("exercise_library")
        .select("gif_url")
        .ilike("name", `%${term}%`)
        .not("gif_url", "is", null)
        .limit(1)
        .maybeSingle();
      if (data?.gif_url) {
        memCache.set(key, data.gif_url);
        return data.gif_url;
      }
    }

    // 2) Chama edge function que busca na ExerciseDB e cacheia
    try {
      const qs = new URLSearchParams({ search: term, limit: "1" }).toString();
      const { data } = await supabase.functions.invoke(`exercises?${qs}`, {
        method: "GET",
      });
      const url: string | null = data?.items?.[0]?.gif_url ?? null;
      memCache.set(key, url);
      return url;
    } catch {
      memCache.set(key, null);
      return null;
    }
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Hook que resolve o GIF de um exercício pelo nome.
 * Retorna o gifUrl original se já existir, ou busca na biblioteca remota.
 */
export function useExerciseGif(name: string, fallbackGifUrl?: string): {
  gifUrl: string | null;
  loading: boolean;
} {
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
    lookupGif(name).then((url) => {
      if (!cancelled) {
        setGifUrl(url);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [name, fallbackGifUrl]);

  return { gifUrl, loading };
}
