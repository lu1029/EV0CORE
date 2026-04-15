import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Droplets, Sparkles, Loader2, RotateCcw, Coffee, Sun, Moon, Cookie, Apple } from "lucide-react";
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

const mealIcons: Record<string, any> = {
  "Café da manhã": Coffee,
  "Lanche da manhã": Cookie,
  "Almoço": Sun,
  "Lanche da tarde": Cookie,
  "Lanche": Cookie,
  "Jantar": Moon,
  "Ceia": Moon,
};

const NutritionScreen = () => {
  const { userProfile } = useApp();
  const [waterCups, setWaterCups] = useState(0);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const saved = useSavedPlan("nutrition");

  // Load saved plan
  useEffect(() => {
    if (saved.plan && !nutritionPlan) {
      const data = saved.plan.plan_data;
      if (data.dailyCalories) {
        setNutritionPlan(data as NutritionPlan);
      }
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
        await saved.savePlan(
          parsed.planName || "Plano Nutricional",
          `${parsed.dailyCalories} kcal/dia`,
          parsed
        );
      }
    } catch (err) {
      console.error(err);
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
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6 animate-fade-in">Nutrição</h1>

        {saved.loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Carregando plano salvo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl gradient-green flex items-center justify-center mb-6 animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Crie sua dieta personalizada
            </h2>
            <p className="text-sm text-muted-foreground mb-2 max-w-xs">
              Nossa IA vai calcular suas calorias, macros e montar refeições reais baseadas no seu perfil e objetivo.
            </p>

            <div className="glass-card rounded-2xl p-4 mb-6 w-full text-left">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Seu perfil:</p>
              <div className="space-y-1">
                <p className="text-xs text-foreground">🎯 Objetivo: <span className="text-accent font-medium">{userProfile.goal || "não definido"}</span></p>
                <p className="text-xs text-foreground">⚖️ Peso: <span className="text-accent font-medium">{userProfile.weight}kg</span></p>
                <p className="text-xs text-foreground">📏 Altura: <span className="text-accent font-medium">{userProfile.height}cm</span></p>
                <p className="text-xs text-foreground">🎂 Idade: <span className="text-accent font-medium">{userProfile.age} anos</span></p>
                <p className="text-xs text-foreground">📊 Nível: <span className="text-accent font-medium">{userProfile.level || "não definido"}</span></p>
              </div>
            </div>

            {generateError && <p className="text-xs text-destructive mb-4">{generateError}</p>}

            <Button
              className="w-full h-14 rounded-2xl text-base gap-2 gradient-green text-primary-foreground font-semibold"
              onClick={generateNutritionPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Gerando plano nutricional...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Gerar Minha Dieta com IA</>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4 space-y-2 w-full">
                <p className="text-xs text-muted-foreground">Calculando TMB, macros e montando refeições...</p>
                {[0, 1, 2].map(i => (
                  <div key={i} className="glass-card rounded-xl p-3 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-2 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const consumed = nutritionPlan.meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground">Nutrição</h1>
        <button onClick={resetPlan} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <RotateCcw className="w-3 h-3" /> Refazer
        </button>
      </div>

      {/* Calorie ring */}
      <div className="glass-card-green rounded-2xl p-6 mb-4 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="hsl(220, 14%, 18%)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="url(#grad)" strokeWidth="8" fill="none"
                strokeDasharray={`${Math.min((consumed / nutritionPlan.dailyCalories) * 264, 264)} 264`}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-foreground font-heading">{nutritionPlan.dailyCalories}</p>
              <p className="text-[10px] text-muted-foreground">kcal/dia</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Meta diária</span>
              <span className="text-foreground font-medium">{nutritionPlan.dailyCalories} kcal</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Proteína</span>
              <span className="text-foreground font-medium">{nutritionPlan.macros.protein.grams}g</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Carboidratos</span>
              <span className="text-foreground font-medium">{nutritionPlan.macros.carbs.grams}g</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Gordura</span>
              <span className="text-foreground font-medium">{nutritionPlan.macros.fat.grams}g</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Proteína", g: nutritionPlan.macros.protein.grams, pct: nutritionPlan.macros.protein.percentage, color: "bg-primary" },
            { label: "Carbs", g: nutritionPlan.macros.carbs.grams, pct: nutritionPlan.macros.carbs.percentage, color: "bg-blue-400" },
            { label: "Gordura", g: nutritionPlan.macros.fat.grams, pct: nutritionPlan.macros.fat.percentage, color: "bg-orange-400" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
              <p className="text-xs font-medium text-foreground">{m.g}g</p>
              <p className="text-[10px] text-muted-foreground">{m.label} ({m.pct}%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Water */}
      <div className="glass-card-blue rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-foreground text-sm">Água</span>
          </div>
          <span className="text-xs text-muted-foreground">{waterCups * 250}ml / {nutritionPlan.waterLiters}L</span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <button key={i} onClick={() => setWaterCups(i + 1)}
              className={`flex-1 h-6 rounded-sm transition-all ${i < waterCups ? "bg-blue-400" : "bg-secondary"}`} />
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="glass" size="sm" onClick={() => setWaterCups(Math.max(0, waterCups - 1))} className="rounded-lg text-xs">- 250ml</Button>
          <Button variant="hero" size="sm" onClick={() => setWaterCups(Math.min(waterGoal, waterCups + 1))} className="rounded-lg text-xs">+ 250ml</Button>
        </div>
      </div>

      {/* Meals */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Refeições do dia</h3>
      <div className="space-y-3">
        {nutritionPlan.meals.map((m, i) => {
          const Icon = mealIcons[m.name] || Coffee;
          return (
            <div key={i} className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.time} • {m.calories} kcal</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {m.foods.map((food) => (
                  <span key={food} className="bg-secondary text-xs text-muted-foreground px-2 py-1 rounded-md">{food}</span>
                ))}
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                <span>P: {m.protein}g</span>
                <span>C: {m.carbs}g</span>
                <span>G: {m.fat}g</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      {nutritionPlan.tips && nutritionPlan.tips.length > 0 && (
        <div className="mt-6 glass-card-green rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Apple className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent font-medium">Dicas da IA</span>
          </div>
          <ul className="space-y-1.5">
            {nutritionPlan.tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground">• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NutritionScreen;
