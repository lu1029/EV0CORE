import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Loader2, Sparkles } from "lucide-react";

export interface NutritionPreferences {
  primaryGoal: "lose" | "gain" | "maintain" | "performance";
  pace: "slow" | "moderate" | "fast";
  restrictions: string[];
  mealsPerDay: 3 | 4 | 5 | 6;
  budget: "low" | "medium" | "high";
}

interface Props {
  onComplete: (prefs: NutritionPreferences) => Promise<void>;
  loading: boolean;
}

const STEPS = ["Objetivo", "Ritmo", "Restrições", "Refeições", "Orçamento"] as const;

const NutritionWizard: React.FC<Props> = ({ onComplete, loading }) => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<NutritionPreferences>({
    primaryGoal: "maintain",
    pace: "moderate",
    restrictions: [],
    mealsPerDay: 4,
    budget: "medium",
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => onComplete(prefs);

  const toggleRestriction = (r: string) => {
    setPrefs((p) => ({
      ...p,
      restrictions: p.restrictions.includes(r) ? p.restrictions.filter((x) => x !== r) : [...p.restrictions, r],
    }));
  };

  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`}
          />
        ))}
      </div>

      <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">{STEPS[step]} · {step + 1}/{STEPS.length}</p>

      {/* Step 0: Goal */}
      {step === 0 && (
        <>
          <h2 className="text-[26px] font-bold text-foreground tracking-[-0.02em] mb-2">Qual seu objetivo?</h2>
          <p className="text-[14px] text-muted-foreground mb-6">Vamos personalizar tudo a partir disso.</p>
          <div className="space-y-2.5">
            {[
              { v: "lose", t: "Perder gordura", e: "🔥" },
              { v: "gain", t: "Ganhar massa muscular", e: "💪" },
              { v: "maintain", t: "Manter o peso atual", e: "⚖️" },
              { v: "performance", t: "Performance esportiva", e: "🏃" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setPrefs({ ...prefs, primaryGoal: o.v as any })}
                className={`w-full flex items-center gap-3 bg-card p-4 rounded-2xl border-2 transition-all ${
                  prefs.primaryGoal === o.v ? "border-primary" : "border-transparent"
                }`}
              >
                <span className="text-[24px]">{o.e}</span>
                <span className="text-[15px] font-medium text-foreground flex-1 text-left">{o.t}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 1: Pace */}
      {step === 1 && (
        <>
          <h2 className="text-[26px] font-bold text-foreground tracking-[-0.02em] mb-2">Em que ritmo?</h2>
          <p className="text-[14px] text-muted-foreground mb-6">Quanto mais rápido, mais agressivo o déficit/superávit.</p>
          <div className="space-y-2.5">
            {[
              { v: "slow", t: "Suave", d: "Resultados graduais e sustentáveis" },
              { v: "moderate", t: "Moderado", d: "Equilíbrio entre velocidade e conforto" },
              { v: "fast", t: "Acelerado", d: "Mudanças rápidas, exige disciplina" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setPrefs({ ...prefs, pace: o.v as any })}
                className={`w-full bg-card p-4 rounded-2xl text-left border-2 transition-all ${
                  prefs.pace === o.v ? "border-primary" : "border-transparent"
                }`}
              >
                <p className="text-[15px] font-medium text-foreground">{o.t}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{o.d}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Restrictions */}
      {step === 2 && (
        <>
          <h2 className="text-[26px] font-bold text-foreground tracking-[-0.02em] mb-2">Alguma restrição?</h2>
          <p className="text-[14px] text-muted-foreground mb-6">Selecione todas que se aplicam (opcional).</p>
          <div className="grid grid-cols-2 gap-2.5">
            {["Sem lactose", "Vegetariano", "Vegano", "Sem glúten", "Low carb", "Nenhuma"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  if (r === "Nenhuma") setPrefs({ ...prefs, restrictions: [] });
                  else toggleRestriction(r);
                }}
                className={`bg-card p-3.5 rounded-xl text-[13px] font-medium border-2 transition-all ${
                  (r === "Nenhuma" && prefs.restrictions.length === 0) || prefs.restrictions.includes(r)
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3: Meals */}
      {step === 3 && (
        <>
          <h2 className="text-[26px] font-bold text-foreground tracking-[-0.02em] mb-2">Quantas refeições por dia?</h2>
          <p className="text-[14px] text-muted-foreground mb-6">Inclui lanches.</p>
          <div className="grid grid-cols-4 gap-2.5">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setPrefs({ ...prefs, mealsPerDay: n as any })}
                className={`aspect-square bg-card rounded-2xl text-[24px] font-bold border-2 transition-all ${
                  prefs.mealsPerDay === n ? "border-primary text-primary" : "border-transparent text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 4: Budget */}
      {step === 4 && (
        <>
          <h2 className="text-[26px] font-bold text-foreground tracking-[-0.02em] mb-2">Orçamento</h2>
          <p className="text-[14px] text-muted-foreground mb-6">Adaptamos os alimentos ao seu bolso.</p>
          <div className="space-y-2.5">
            {[
              { v: "low", t: "Econômico", d: "Ovos, frango, arroz, feijão, batata" },
              { v: "medium", t: "Intermediário", d: "Adiciona iogurtes, queijos, frutas variadas" },
              { v: "high", t: "Premium", d: "Inclui salmão, oleaginosas, suplementos" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setPrefs({ ...prefs, budget: o.v as any })}
                className={`w-full bg-card p-4 rounded-2xl text-left border-2 transition-all ${
                  prefs.budget === o.v ? "border-primary" : "border-transparent"
                }`}
              >
                <p className="text-[15px] font-medium text-foreground">{o.t}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{o.d}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Nav */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" onClick={back} disabled={loading} className="h-12 rounded-xl px-5">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
            Continuar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={finish} disabled={loading} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Montando seu plano…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar dieta</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NutritionWizard;
