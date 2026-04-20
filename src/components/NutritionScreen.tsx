import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Loader2, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedPlan } from "@/hooks/useSavedPlan";

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
  meals: {
    name: string;
    time: string;
    calories: number;
    foods: string[];
    protein: number;
    carbs: number;
    fat: number;
  }[];
  tips: string[];
}

const NutritionScreen = () => {
  const { userProfile } = useApp();
  const [waterCups, setWaterCups] = useState(0);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const saved = useSavedPlan("nutrition");

  useEffect(() => {
    if (saved.plan && !nutritionPlan) {
      const data = saved.plan.plan_data;
      if (data.dailyCalories) setNutritionPlan(data as NutritionPlan);
    }
  }, [saved.plan]);

  const generateNutritionPlan = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-nutrition",
          userProfile,
          messages: [{ role: "user", content: "Gere meu plano nutricional personalizado completo." }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.dailyCalories) {
        setNutritionPlan(parsed);
        await saved.savePlan(parsed.planName || "Plano Nutricional", `${parsed.dailyCalories} kcal/dia`, parsed);
      }
    } catch {
      setGenerateError("Erro ao gerar plano nutricional. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlan = async () => {
    setNutritionPlan(null);
    await saved.deletePlan();
  };

  const waterGoal = nutritionPlan ? Math.round(nutritionPlan.waterLiters * 4) : 10;

  if (!nutritionPlan) {
    return (
      <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em] mb-10 animate-fade-in">Nutrição</h1>

        {saved.loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 className="text-[22px] font-semibold text-foreground tracking-[-0.02em] mb-2">
              Crie sua dieta
            </h2>
            <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed">
              Calculamos suas calorias e macros baseado no seu perfil e objetivo.
            </p>

            <div className="bg-card rounded-2xl divide-y divide-border mb-8">
              {[
                ["Objetivo", userProfile.goal || "—"],
                ["Peso", `${userProfile.weight} kg`],
                ["Altura", `${userProfile.height} cm`],
                ["Idade", `${userProfile.age} anos`],
                ["Nível", userProfile.level || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[15px] text-foreground">{k}</span>
                  <span className="text-[15px] text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>

            {generateError && <p className="text-[13px] text-destructive mb-4">{generateError}</p>}

            <Button
              className="w-full h-12 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={generateNutritionPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando…</>
              ) : (
                "Gerar dieta"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const consumed = nutritionPlan.meals.reduce((acc, m) => acc + m.calories, 0);
  const pct = Math.min((consumed / nutritionPlan.dailyCalories) * 100, 100);

  return (
    <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
      <div className="flex items-end justify-between mb-8 animate-fade-in">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em]">Nutrição</h1>
        <button onClick={resetPlan} className="text-[13px] text-muted-foreground flex items-center gap-1 active:opacity-60">
          <RotateCcw className="w-3.5 h-3.5" /> Refazer
        </button>
      </div>

      {/* Calorie ring — Apple Fitness style */}
      <section className="bg-card rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
              <circle
                cx="50" cy="50" r="44"
                stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
                strokeDasharray={`${(pct / 100) * 276} 276`}
                strokeLinecap="round"
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
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[13px] text-muted-foreground">{m.label}</span>
                  <span className="text-[13px] text-foreground tabular font-medium">{m.g}g</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Meals */}
      <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3">Refeições</h2>
      <div className="bg-card rounded-2xl overflow-hidden mb-8">
        {nutritionPlan.meals.map((m, i) => (
          <div key={i} className={`px-5 py-4 ${i > 0 ? "border-t border-border" : ""} animate-fade-in`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-[16px] font-medium text-foreground">{m.name}</p>
              <p className="text-[13px] text-muted-foreground tabular">{m.calories} kcal</p>
            </div>
            <p className="text-[13px] text-muted-foreground mb-2">{m.time}</p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">{m.foods.join(" · ")}</p>
            <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground tabular">
              <span>P {m.protein}g</span>
              <span>C {m.carbs}g</span>
              <span>G {m.fat}g</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      {nutritionPlan.tips?.length > 0 && (
        <section className="animate-fade-in">
          <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-3">Dicas</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            {nutritionPlan.tips.map((tip, i) => (
              <p key={i} className="px-5 py-3.5 text-[14px] text-foreground leading-relaxed">{tip}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default NutritionScreen;
