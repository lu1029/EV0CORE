import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { Loader2, RotateCcw, Plus, Minus, Pencil, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedPlan } from "@/hooks/useSavedPlan";
import NutritionWizard, { type NutritionPreferences } from "./nutrition/NutritionWizard";
import MealEditor, { type EditableMeal } from "./nutrition/MealEditor";
import RecipesSection from "./nutrition/RecipesSection";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";
import { NutritionSkeleton } from "./skeletons/NutritionSkeleton";
import { AnimatedText } from "./motion/AnimatedText";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evo-ai-chat`;

interface NutritionPlan {
  planName: string;
  dailyCalories: number;
  macros: {
    protein: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
  };
  waterLiters: number;
  meals: EditableMeal[];
  tips: string[];
  preferences?: NutritionPreferences;
}

const SOURCES = [
  "Diretrizes da Sociedade Brasileira de Nutrição Esportiva",
  "International Society of Sports Nutrition (ISSN)",
  "Academy of Nutrition and Dietetics",
  "Tabela TACO — UNICAMP",
];

const NutritionScreen = () => {
  const { userProfile } = useApp();
  const [waterCups, setWaterCups] = useState(0);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const saved = useSavedPlan("nutrition");

  useEffect(() => {
    if (saved.plan && !nutritionPlan) {
      const data = saved.plan.plan_data as any;
      if (data?.dailyCalories) setNutritionPlan(data as NutritionPlan);
    }
  }, [saved.plan]);

  // Discreet "thinking" rotation while generating
  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(() => setThinkingStep((s) => (s + 1) % 4), 1800);
    return () => clearInterval(id);
  }, [isGenerating]);

  const generateNutritionPlan = async (prefs: NutritionPreferences) => {
    setIsGenerating(true);
    setGenerateError("");
    setThinkingStep(0);
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-nutrition",
          userProfile: { ...userProfile, ...prefs },
          messages: [{ role: "user", content: "Gere meu plano nutricional personalizado completo." }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.dailyCalories) {
        const planWithPrefs = { ...parsed, preferences: prefs };
        setNutritionPlan(planWithPrefs);
        await saved.savePlan(parsed.planName || "Plano Nutricional", `${parsed.dailyCalories} kcal/dia`, planWithPrefs);
      }
    } catch {
      setGenerateError("Não conseguimos gerar agora. Tente novamente em alguns segundos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const persist = async (updated: NutritionPlan) => {
    setNutritionPlan(updated);
    await saved.savePlan(updated.planName, `${updated.dailyCalories} kcal/dia`, updated);
  };

  const updateMeal = async (idx: number, meal: EditableMeal) => {
    if (!nutritionPlan) return;
    const meals = nutritionPlan.meals.map((m, i) => (i === idx ? meal : m));
    await persist({ ...nutritionPlan, meals });
    setEditingIdx(null);
  };

  const deleteMeal = async (idx: number) => {
    if (!nutritionPlan) return;
    const meals = nutritionPlan.meals.filter((_, i) => i !== idx);
    await persist({ ...nutritionPlan, meals });
    setEditingIdx(null);
  };

  const addMeal = async (meal: EditableMeal) => {
    if (!nutritionPlan) return;
    await persist({ ...nutritionPlan, meals: [...nutritionPlan.meals, meal] });
    setAdding(false);
  };

  const resetPlan = async () => {
    setNutritionPlan(null);
    await saved.deletePlan();
  };

  const waterGoal = nutritionPlan ? Math.round(nutritionPlan.waterLiters * 4) : 10;

  // ============ Loading state with discreet "AI working" feedback ============
  if (isGenerating) {
    const phases = [
      "Calculando suas calorias diárias…",
      "Distribuindo proteína, carbo e gordura…",
      "Selecionando alimentos da Tabela TACO…",
      "Validando com diretrizes esportivas…",
    ];
    return (
      <div className="pb-28 px-5 pt-20 max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5 animate-pulse">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-[24px] font-bold text-foreground tracking-[-0.02em] mb-2">Montando seu plano</h2>
        <p className="text-[14px] text-muted-foreground mb-8 transition-opacity" key={thinkingStep}>
          {phases[thinkingStep]}
        </p>
        <div className="bg-card rounded-2xl p-5 text-left">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Fontes consultadas</p>
          <ul className="space-y-1.5">
            {SOURCES.map((s) => (
              <li key={s} className="text-[13px] text-foreground flex gap-2">
                <span className="text-primary">·</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ============ Wizard (no plan yet) ============
  if (!nutritionPlan) {
    return (
      <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
        <AnimatedText as="h1" text="Nutrição" gradient className="text-[32px] font-bold tracking-[-0.03em] mb-8 block" />
        {saved.loading ? (
          <NutritionSkeleton />
        ) : (
          <>
            {generateError && <p className="text-[13px] text-destructive mb-4">{generateError}</p>}
            <NutritionWizard onComplete={generateNutritionPlan} loading={false} />
          </>
        )}
      </div>
    );
  }

  // ============ Active plan ============
  const consumed = nutritionPlan.meals.reduce((acc, m) => acc + m.calories, 0);
  const pct = Math.min((consumed / nutritionPlan.dailyCalories) * 100, 100);

  return (
    <motion.div
      className="pb-28 px-5 pt-8 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
        <AnimatedText as="h1" text="Nutrição" gradient className="text-[32px] font-bold tracking-[-0.03em] block" />
        <button onClick={resetPlan} className="text-[13px] text-muted-foreground flex items-center gap-1 active:opacity-60">
          <RotateCcw className="w-3.5 h-3.5" /> Refazer
        </button>
      </motion.div>

      {/* Calorie ring */}
      <motion.section
        variants={fadeUp}
        whileHover={{ y: -2, transition: springSnappy }}
        className="bg-card rounded-2xl p-6 mb-6 border border-border/40"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50" cy="50" r="44"
                stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 276" }}
                animate={{ strokeDasharray: `${(pct / 100) * 276} 276` }}
                transition={{ duration: 1, ease: easeApple, delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[28px] font-bold text-foreground tabular tracking-tight">{consumed}</p>
              <p className="text-[11px] text-muted-foreground tabular">/ {nutritionPlan.dailyCalories} kcal</p>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { label: "Proteína", g: nutritionPlan.macros.protein.grams, pct: nutritionPlan.macros.protein.percentage },
              { label: "Carbos", g: nutritionPlan.macros.carbs.grams, pct: nutritionPlan.macros.carbs.percentage },
              { label: "Gordura", g: nutritionPlan.macros.fat.grams, pct: nutritionPlan.macros.fat.percentage },
            ].map((m, i) => (
              <div key={m.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[13px] text-muted-foreground">{m.label}</span>
                  <span className="text-[13px] text-foreground tabular font-medium">{m.g}g</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, ease: easeApple, delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Water */}
      <section className="bg-card rounded-2xl p-5 mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[15px] font-medium text-foreground">Água</span>
          <span className="text-[13px] text-muted-foreground tabular">{waterCups * 250}ml / {nutritionPlan.waterLiters}L</span>
        </div>
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => setWaterCups(i + 1)}
              className={`flex-1 h-2 rounded-full transition-colors ${i < waterCups ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setWaterCups(Math.max(0, waterCups - 1))}
            className="flex-1 h-10 rounded-xl bg-secondary text-foreground text-[14px] font-medium flex items-center justify-center gap-2 active:opacity-60"
          >
            <Minus className="w-4 h-4" /> 250ml
          </button>
          <button
            onClick={() => setWaterCups(Math.min(waterGoal, waterCups + 1))}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold flex items-center justify-center gap-2 active:opacity-80"
          >
            <Plus className="w-4 h-4" /> 250ml
          </button>
        </div>
      </section>

      {/* Meals — editable */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Refeições</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-[13px] text-primary font-medium flex items-center gap-1 active:opacity-60"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <motion.div variants={staggerFast} initial="hidden" animate="visible" className="bg-card rounded-2xl overflow-hidden mb-8 border border-border/40">
        {nutritionPlan.meals.map((m, i) => (
          <motion.button
            key={i}
            variants={fadeUp}
            whileHover={{ x: 4, transition: springSnappy }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setEditingIdx(i)}
            className={`w-full text-left px-5 py-4 ${i > 0 ? "border-t border-border" : ""} active:bg-secondary/40 transition-colors`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-[16px] font-medium text-foreground flex items-center gap-2">
                {m.name}
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </p>
              <p className="text-[13px] text-muted-foreground tabular">{m.calories} kcal</p>
            </div>
            <p className="text-[13px] text-muted-foreground mb-2">{m.time}</p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">{m.foods.join(" · ")}</p>
            <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground tabular">
              <span>P {m.protein}g</span>
              <span>C {m.carbs}g</span>
              <span>G {m.fat}g</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Tips */}
      {nutritionPlan.tips?.length > 0 && (
        <section className="animate-fade-in mb-8">
          <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3">Dicas</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            {nutritionPlan.tips.map((tip, i) => (
              <p key={i} className="px-5 py-3.5 text-[14px] text-foreground leading-relaxed">{tip}</p>
            ))}
          </div>
        </section>
      )}

      {/* Recipes section */}
      <RecipesSection goal={nutritionPlan.preferences?.primaryGoal || (userProfile.goal as any)} />

      {/* Sources footer */}
      <section className="mt-8 animate-fade-in">
        <details className="bg-card rounded-2xl px-5 py-4">
          <summary className="text-[13px] text-muted-foreground cursor-pointer flex items-center gap-2 list-none">
            <BookOpen className="w-3.5 h-3.5" /> Fontes utilizadas
          </summary>
          <ul className="mt-3 space-y-1.5">
            {SOURCES.map((s) => (
              <li key={s} className="text-[12px] text-muted-foreground flex gap-2">
                <span className="text-primary">·</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* Editors */}
      {editingIdx !== null && nutritionPlan.meals[editingIdx] && (
        <MealEditor
          meal={nutritionPlan.meals[editingIdx]}
          onSave={(m) => updateMeal(editingIdx, m)}
          onClose={() => setEditingIdx(null)}
          onDelete={() => deleteMeal(editingIdx)}
        />
      )}
      {adding && (
        <MealEditor
          meal={{ name: "Nova refeição", time: "12:00", calories: 0, foods: [], protein: 0, carbs: 0, fat: 0 }}
          onSave={addMeal}
          onClose={() => setAdding(false)}
        />
      )}
    </motion.div>
  );
};

export default NutritionScreen;
