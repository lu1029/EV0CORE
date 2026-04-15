import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Droplets, Plus, Flame, ChevronRight, Coffee, Sun, Moon, Cookie, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

const meals = [
  { id: "breakfast", label: "Café da manhã", icon: Coffee, time: "07:00", cal: 320, items: ["Ovos mexidos", "Pão integral", "Café"] },
  { id: "lunch", label: "Almoço", icon: Sun, time: "12:30", cal: 580, items: ["Arroz", "Frango grelhado", "Salada"] },
  { id: "snack", label: "Lanche", icon: Cookie, time: "15:30", cal: 180, items: ["Whey protein", "Banana"] },
  { id: "dinner", label: "Jantar", icon: Moon, time: "19:30", cal: 0, items: [] },
];

const NutritionScreen = () => {
  const { userProfile } = useApp();
  const [waterCups, setWaterCups] = useState(6);
  const waterGoal = 10;

  const dailyCal = userProfile.gender === "female" ? 1800 : 2200;
  const consumed = 1080;
  const remaining = dailyCal - consumed;

  const macros = {
    protein: { current: 128, target: userProfile.gender === "female" ? 130 : 180 },
    carbs: { current: 210, target: userProfile.gender === "female" ? 220 : 300 },
    fat: { current: 45, target: userProfile.gender === "female" ? 55 : 70 },
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Nutrição</h1>

      {/* Calorie ring */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="hsl(220, 14%, 18%)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="42"
                stroke="url(#grad)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(consumed / dailyCal) * 264} 264`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-foreground font-heading">{remaining}</p>
              <p className="text-[10px] text-muted-foreground">restantes</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Consumido</span>
              <span className="text-foreground font-medium">{consumed} kcal</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Meta</span>
              <span className="text-foreground font-medium">{dailyCal} kcal</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Queimado</span>
              <span className="text-primary font-medium">350 kcal</span>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Proteína", ...macros.protein, color: "bg-primary", unit: "g" },
            { label: "Carbs", ...macros.carbs, color: "bg-blue-400", unit: "g" },
            { label: "Gordura", ...macros.fat, color: "bg-orange-400", unit: "g" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${(m.current / m.target) * 100}%` }} />
              </div>
              <p className="text-xs font-medium text-foreground">{m.current}{m.unit}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Water */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-foreground text-sm">Água</span>
          </div>
          <span className="text-xs text-muted-foreground">{waterCups * 250}ml / {waterGoal * 250}ml</span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => setWaterCups(i + 1)}
              className={`flex-1 h-6 rounded-sm transition-all ${
                i < waterCups ? "bg-blue-400" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="glass" size="sm" onClick={() => setWaterCups(Math.max(0, waterCups - 1))} className="rounded-lg text-xs">
            - 250ml
          </Button>
          <Button variant="hero" size="sm" onClick={() => setWaterCups(Math.min(waterGoal, waterCups + 1))} className="rounded-lg text-xs">
            + 250ml
          </Button>
        </div>
      </div>

      {/* Meals */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Refeições</h3>
      <div className="space-y-3">
        {meals.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.time} • {m.cal > 0 ? `${m.cal} kcal` : "Não registrado"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {m.items.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {m.items.map((item) => (
                  <span key={item} className="bg-secondary text-xs text-muted-foreground px-2 py-1 rounded-md">{item}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="mt-6 bg-card border border-primary/20 rounded-2xl p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Apple className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">Sugestão para você</span>
        </div>
        <p className="text-sm text-foreground">Ainda faltam <span className="text-primary font-bold">{macros.protein.target - macros.protein.current}g</span> de proteína hoje. Que tal um frango grelhado ou shake de whey no jantar?</p>
      </div>
    </div>
  );
};

export default NutritionScreen;
