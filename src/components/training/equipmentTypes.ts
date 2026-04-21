import type { CuratedPlan } from "./curatedPlans";

export type EquipmentKey = "cadeira" | "sofa" | "mochila" | "garrafas" | "toalha" | "parede";

export const EQUIPMENT_OPTIONS: { key: EquipmentKey; label: string; emoji: string; aliases: string[]; aiHint: string }[] = [
  { key: "cadeira",  label: "Cadeira",  emoji: "🪑", aliases: ["cadeira"],                     aiHint: "Cadeira firme (mergulho de tríceps, step-up, búlgaro)" },
  { key: "sofa",     label: "Sofá",     emoji: "🛋️", aliases: ["sofa", "sofá"],                aiHint: "Sofá baixo (hip thrust, flexão declinada, búlgaro)" },
  { key: "mochila",  label: "Mochila",  emoji: "🎒", aliases: ["mochila"],                     aiHint: "Mochila com livros 5–15kg (goblet, rosca, remada, peso extra)" },
  { key: "garrafas", label: "Garrafas", emoji: "💧", aliases: ["garrafa", "garrafas"],         aiHint: "Garrafas PET 1.5–2L como halteres (rosca, elevação, tríceps francês)" },
  { key: "toalha",   label: "Toalha",   emoji: "🧺", aliases: ["toalha"],                      aiHint: "Toalha (remada na porta, deslizamentos, alongamento)" },
  { key: "parede",   label: "Parede",   emoji: "🧱", aliases: ["parede", "wall sit", "wall_sit"], aiHint: "Parede (wall sit, handstand, flexão na parede)" },
];

const STORAGE_KEY = "evo:home-equipment";

export const loadEquipment = (): EquipmentKey[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EQUIPMENT_OPTIONS.map(o => o.key); // default: tudo selecionado
    return JSON.parse(raw);
  } catch { return EQUIPMENT_OPTIONS.map(o => o.key); }
};

export const saveEquipment = (eq: EquipmentKey[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(eq)); } catch {}
};

// Detecta equipamentos exigidos por um plano analisando nomes/instruções dos exercícios
export const detectPlanEquipment = (plan: CuratedPlan): EquipmentKey[] => {
  const text = Object.values(plan.workouts)
    .flat()
    .map(ex => `${ex.name} ${ex.instruction || ""} ${(ex as any).gifKey || ""}`)
    .join(" ")
    .toLowerCase();

  const found = new Set<EquipmentKey>();
  for (const opt of EQUIPMENT_OPTIONS) {
    if (opt.aliases.some(a => text.includes(a))) found.add(opt.key);
  }
  return Array.from(found);
};

// Plano é compatível se TODOS os equipamentos exigidos estão disponíveis
export const planFits = (plan: CuratedPlan, available: EquipmentKey[]): boolean => {
  const required = detectPlanEquipment(plan);
  return required.every(r => available.includes(r));
};
