// Dicionário de tradução PT-BR para nomes de exercícios da ExerciseDB.
// Mapeia o nome em inglês (lowercase) → nome em PT-BR usado em academias brasileiras.
// Quando não há tradução, devolve o nome original capitalizado.

const dict: Record<string, string> = {
  // ===== Peito =====
  "barbell bench press": "Supino reto com barra",
  "incline barbell bench press": "Supino inclinado com barra",
  "decline barbell bench press": "Supino declinado com barra",
  "dumbbell bench press": "Supino reto com halteres",
  "incline dumbbell press": "Supino inclinado com halteres",
  "decline dumbbell press": "Supino declinado com halteres",
  "dumbbell fly": "Crucifixo com halteres",
  "incline dumbbell fly": "Crucifixo inclinado",
  "cable crossover": "Crossover (cruzamento de cabos)",
  "cable fly": "Voador no cabo",
  "machine fly": "Voador (peck deck)",
  "push-up": "Flexão de braço",
  "push up": "Flexão de braço",
  "pushup": "Flexão de braço",
  "incline push-up": "Flexão inclinada",
  "decline push-up": "Flexão declinada",
  "diamond push-up": "Flexão diamante",
  "wide push-up": "Flexão aberta",
  "chest dip": "Mergulho para peito",
  "smith machine bench press": "Supino no Smith",

  // ===== Costas =====
  "pull-up": "Barra fixa",
  "pull up": "Barra fixa",
  "pullup": "Barra fixa",
  "chin-up": "Barra supinada",
  "lat pulldown": "Puxada frontal",
  "wide-grip lat pulldown": "Puxada pegada aberta",
  "close-grip lat pulldown": "Puxada pegada fechada",
  "v-bar pulldown": "Puxada com triângulo",
  "barbell row": "Remada curvada com barra",
  "bent-over row": "Remada curvada",
  "bent over row": "Remada curvada",
  "dumbbell row": "Remada com halter",
  "one-arm dumbbell row": "Remada unilateral com halter",
  "seated cable row": "Remada baixa no cabo",
  "t-bar row": "Remada cavalinho",
  "deadlift": "Levantamento terra",
  "romanian deadlift": "Stiff (terra romeno)",
  "sumo deadlift": "Terra sumô",
  "rack pull": "Rack pull",
  "good morning": "Bom dia",
  "hyperextension": "Hiperextensão lombar",
  "back extension": "Extensão lombar",

  // ===== Ombros =====
  "overhead press": "Desenvolvimento militar",
  "barbell overhead press": "Desenvolvimento com barra",
  "dumbbell shoulder press": "Desenvolvimento com halteres",
  "arnold press": "Desenvolvimento Arnold",
  "lateral raise": "Elevação lateral",
  "dumbbell lateral raise": "Elevação lateral com halteres",
  "front raise": "Elevação frontal",
  "rear delt fly": "Crucifixo invertido",
  "reverse fly": "Crucifixo invertido",
  "face pull": "Face pull (cabo)",
  "upright row": "Remada alta",
  "shrug": "Encolhimento",
  "dumbbell shrug": "Encolhimento com halteres",
  "barbell shrug": "Encolhimento com barra",

  // ===== Bíceps =====
  "barbell curl": "Rosca direta com barra",
  "dumbbell curl": "Rosca direta com halteres",
  "alternate biceps curl": "Rosca alternada",
  "hammer curl": "Rosca martelo",
  "preacher curl": "Rosca scott",
  "concentration curl": "Rosca concentrada",
  "cable curl": "Rosca no cabo",
  "incline dumbbell curl": "Rosca inclinada",
  "spider curl": "Rosca spider",
  "ez-bar curl": "Rosca W (barra EZ)",

  // ===== Tríceps =====
  "triceps dip": "Mergulho para tríceps",
  "triceps pushdown": "Tríceps pulley",
  "triceps rope pushdown": "Tríceps corda",
  "rope pushdown": "Tríceps corda",
  "skull crusher": "Tríceps testa",
  "skullcrusher": "Tríceps testa",
  "lying triceps extension": "Tríceps testa deitado",
  "overhead triceps extension": "Tríceps francês",
  "close-grip bench press": "Supino pegada fechada",
  "kickback": "Tríceps coice",
  "diamond push-up triceps": "Flexão diamante (tríceps)",

  // ===== Pernas (quadríceps/glúteos) =====
  "barbell squat": "Agachamento livre com barra",
  "back squat": "Agachamento livre",
  "front squat": "Agachamento frontal",
  "goblet squat": "Agachamento goblet",
  "bodyweight squat": "Agachamento livre (peso do corpo)",
  "jump squat": "Agachamento com salto",
  "sumo squat": "Agachamento sumô",
  "split squat": "Agachamento búlgaro",
  "bulgarian split squat": "Búlgaro",
  "leg press": "Leg press",
  "hack squat": "Agachamento hack",
  "leg extension": "Cadeira extensora",
  "lunge": "Afundo",
  "walking lunge": "Afundo caminhando",
  "reverse lunge": "Afundo reverso",
  "step-up": "Step up",
  "wall sit": "Cadeira na parede",
  "hip thrust": "Hip thrust (elevação de quadril)",
  "glute bridge": "Ponte de glúteo",
  "single leg glute bridge": "Ponte unilateral",
  "cable kickback": "Glúteo no cabo (coice)",
  "donkey kick": "Coice de burro",
  "fire hydrant": "Hidrante",

  // ===== Posterior de coxa =====
  "lying leg curl": "Mesa flexora",
  "seated leg curl": "Cadeira flexora",
  "nordic hamstring curl": "Nórdico",

  // ===== Panturrilha =====
  "calf raise": "Elevação de panturrilha",
  "standing calf raise": "Panturrilha em pé",
  "seated calf raise": "Panturrilha sentado",
  "donkey calf raise": "Panturrilha burrinho",

  // ===== Abdômen / Core =====
  "crunch": "Abdominal",
  "sit-up": "Abdominal completo",
  "plank": "Prancha",
  "side plank": "Prancha lateral",
  "russian twist": "Russian twist",
  "leg raise": "Elevação de pernas",
  "hanging leg raise": "Elevação de pernas suspenso",
  "mountain climber": "Mountain climber",
  "bicycle crunch": "Abdominal bicicleta",
  "cable crunch": "Abdominal no cabo",
  "ab wheel rollout": "Rolinho abdominal",
  "v-up": "V-up",
  "dead bug": "Dead bug",
  "bird dog": "Bird dog (cachorro pássaro)",

  // ===== Cardio =====
  "burpee": "Burpee",
  "jumping jack": "Polichinelo",
  "high knees": "Joelhos altos",
  "jump rope": "Pular corda",
  "skipping rope": "Pular corda",
  "running": "Corrida",
  "sprint": "Tiro de velocidade",
  "rowing": "Remo (ergômetro)",
  "battle ropes": "Cordas navais",
  "box jump": "Salto na caixa",

  // ===== Olímpicos =====
  "clean and jerk": "Arremesso (clean & jerk)",
  "snatch": "Arranco",
  "power clean": "Power clean",
  "thruster": "Thruster",
  "kettlebell swing": "Kettlebell swing",
  "turkish get-up": "Turkish get-up",

  // ===== Alongamento =====
  "cat stretch": "Alongamento gato-vaca",
  "child pose": "Postura da criança",
  "downward dog": "Cachorro olhando para baixo",
  "cobra stretch": "Alongamento da cobra",
  "quad stretch": "Alongamento de quadríceps",
  "hamstring stretch": "Alongamento de posterior",
  "shoulder stretch": "Alongamento de ombro",
};

/** Capitaliza a primeira letra de cada palavra. */
function capitalize(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Tenta traduzir um nome de exercício do inglês para PT-BR.
 * Estratégia em camadas: match exato → match parcial → fallback formatado.
 */
export function translateExerciseName(nameEn: string): string {
  if (!nameEn) return "";
  const key = nameEn.trim().toLowerCase();

  // 1) Match direto
  if (dict[key]) return dict[key];

  // 2) Remove sufixos comuns ("(machine)", "v.2", etc.)
  const cleaned = key.replace(/\s*\(.*?\)\s*/g, "").replace(/\s+v\.?\d+/g, "").trim();
  if (dict[cleaned]) return dict[cleaned];

  // 3) Tenta encontrar a chave mais longa que esteja contida no nome
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    if (cleaned.includes(k)) {
      // Acrescenta variação restante ao final (ex.: "with cable")
      const rest = cleaned.replace(k, "").trim();
      return rest ? `${dict[k]} (${capitalize(rest)})` : dict[k];
    }
  }

  // 4) Fallback: capitaliza o nome em inglês
  return capitalize(nameEn);
}

/** Traduz nomes de grupos musculares vindos da API. */
const muscleDict: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  "upper arms": "Braços",
  "lower arms": "Antebraços",
  "upper legs": "Pernas",
  "lower legs": "Panturrilhas",
  waist: "Abdômen",
  cardio: "Cardio",
  neck: "Pescoço",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quads: "Quadríceps",
  hamstrings: "Posterior",
  glutes: "Glúteos",
  abs: "Abdômen",
  calves: "Panturrilha",
  forearms: "Antebraços",
  lats: "Dorsal",
  traps: "Trapézio",
  delts: "Deltoides",
  pectorals: "Peitoral",
  abductors: "Abdutores",
  adductors: "Adutores",
  "serratus anterior": "Serrátil",
  "spine": "Coluna",
  "cardiovascular system": "Cardiovascular",
};

export function translateMuscle(name?: string | null): string {
  if (!name) return "";
  const key = name.toLowerCase().trim();
  return muscleDict[key] || capitalize(name);
}

/** Traduz equipamentos. */
const equipmentDict: Record<string, string> = {
  "body weight": "Peso do corpo",
  "barbell": "Barra",
  "dumbbell": "Halteres",
  "cable": "Cabo (polia)",
  "leverage machine": "Máquina articulada",
  "sled machine": "Máquina sled",
  "smith machine": "Smith",
  "kettlebell": "Kettlebell",
  "ez barbell": "Barra EZ (W)",
  "olympic barbell": "Barra olímpica",
  "trap bar": "Barra trap",
  "resistance band": "Faixa elástica",
  "band": "Faixa elástica",
  "medicine ball": "Bola medicinal",
  "stability ball": "Bola suíça",
  "bosu ball": "Bosu",
  "rope": "Corda",
  "wheel roller": "Roda abdominal",
  "stationary bike": "Bicicleta ergométrica",
  "stepmill machine": "Escada (stepmill)",
  "elliptical machine": "Elíptico",
  "rower": "Remo ergométrico",
  "tire": "Pneu",
  "assisted": "Assistido",
  "weighted": "Com peso adicional",
  "hammer": "Martelo (Hammer Strength)",
};

export function translateEquipment(name?: string | null): string {
  if (!name) return "";
  const key = name.toLowerCase().trim();
  return equipmentDict[key] || capitalize(name);
}

/** Define se o equipamento permite treinar em casa (sem academia). */
const HOME_EQUIPMENT = new Set([
  "body weight",
  "resistance band",
  "band",
  "dumbbell",
  "kettlebell",
  "stability ball",
  "bosu ball",
  "medicine ball",
  "rope",
  "wheel roller",
]);

export function isHomeFriendly(equipment?: string | null): boolean {
  if (!equipment) return false;
  return HOME_EQUIPMENT.has(equipment.toLowerCase().trim());
}
