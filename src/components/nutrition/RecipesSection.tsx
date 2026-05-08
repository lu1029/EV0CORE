import React, { useMemo, useState } from "react";
import { ChefHat, Clock, X } from "lucide-react";
import { FITNESS_RECIPES, getRecipesByGoal, type FitnessRecipe } from "./fitnessRecipes";

interface Props {
  goal?: string;
}

const CATEGORIES: FitnessRecipe["category"][] = ["café", "almoço", "jantar", "lanche", "pré-treino", "pós-treino"];

const RecipesSection: React.FC<Props> = ({ goal }) => {
  const [activeCat, setActiveCat] = useState<FitnessRecipe["category"] | "todas">("todas");
  const [open, setOpen] = useState<FitnessRecipe | null>(null);

  const recipes = useMemo(() => {
    const base = goal ? getRecipesByGoal(goal) : FITNESS_RECIPES;
    return activeCat === "todas" ? base : base.filter((r) => r.category === activeCat);
  }, [goal, activeCat]);

  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <ChefHat className="w-5 h-5 text-primary" />
        <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Receitas fitness</h2>
      </div>
      <p className="text-[13px] text-muted-foreground mb-4">Curadas para o seu objetivo. Toque para ver o passo a passo.</p>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-none">
        {(["todas", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-colors ${
              activeCat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      <div className="grid grid-cols-2 gap-3">
        {recipes.map((r) => (
          <button
            key={r.id}
            onClick={() => setOpen(r)}
            className="bg-card rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border border-border/40"
          >
            <div className="text-[28px] mb-2">{r.emoji}</div>
            <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2 mb-2">{r.name}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular">
              <span>{r.calories} kcal</span>
              <span>·</span>
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {r.prepTime}min</span>
            </div>
          </button>
        ))}
      </div>

      {recipes.length === 0 && (
        <p className="text-center text-[13px] text-muted-foreground py-8">Nenhuma receita nesta categoria.</p>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        >
          <div
            className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card flex items-start justify-between p-5 border-b border-border z-10">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-[36px] shrink-0">{open.emoji}</div>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-bold text-foreground tracking-tight leading-tight">{open.name}</h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5 capitalize">{open.category} · {open.prepTime} min</p>
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 active:opacity-60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "kcal", v: open.calories },
                  { l: "Prot.", v: `${open.protein}g` },
                  { l: "Carb.", v: `${open.carbs}g` },
                  { l: "Gord.", v: `${open.fat}g` },
                ].map((m) => (
                  <div key={m.l} className="bg-secondary rounded-xl p-2.5 text-center">
                    <p className="text-[15px] font-bold text-foreground tabular">{m.v}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.l}</p>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="text-[13px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Ingredientes</h4>
                <ul className="space-y-1.5">
                  {open.ingredients.map((i, idx) => (
                    <li key={idx} className="text-[14px] text-foreground flex gap-2">
                      <span className="text-primary">·</span><span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-[13px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Modo de preparo</h4>
                <ol className="space-y-2.5">
                  {open.steps.map((s, idx) => (
                    <li key={idx} className="text-[14px] text-foreground flex gap-3 leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="flex-1 pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecipesSection;
