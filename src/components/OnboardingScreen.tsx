import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Dumbbell, MapPin, Zap, Home as HomeIcon, ChevronRight, ChevronLeft } from "lucide-react";
import ScrollPicker from "@/components/ScrollPicker";

const goals = [
  { id: "lose", label: "Emagrecer", icon: "🔥", desc: "Perder gordura e peso" },
  { id: "gain", label: "Ganhar massa", icon: "💪", desc: "Hipertrofia muscular" },
  { id: "condition", label: "Condicionamento", icon: "🏃", desc: "Melhorar resistência" },
  { id: "define", label: "Definição", icon: "✂️", desc: "Secar e definir" },
  { id: "health", label: "Saúde geral", icon: "❤️", desc: "Qualidade de vida" },
];

const levels = [
  { id: "beginner", label: "Iniciante", desc: "Estou começando agora", icon: "🌱" },
  { id: "intermediate", label: "Intermediário", desc: "Treino há alguns meses", icon: "⚡" },
  { id: "advanced", label: "Avançado", desc: "Treino há mais de 1 ano", icon: "🔥" },
];

const preferences = [
  { id: "gym", label: "Academia", icon: Dumbbell, desc: "Equipamentos completos" },
  { id: "home", label: "Em casa", icon: HomeIcon, desc: "Sem equipamento" },
  { id: "running", label: "Corrida", icon: MapPin, desc: "Ao ar livre" },
  { id: "all", label: "Tudo junto", icon: Zap, desc: "Sem restrições" },
];

const ageValues = Array.from({ length: 68 }, (_, i) => i + 13); // 13-80
const weightValues = Array.from({ length: 151 }, (_, i) => i + 30); // 30-180
const heightValues = Array.from({ length: 81 }, (_, i) => i + 120); // 120-200

const OnboardingScreen = () => {
  const { setHasOnboarded, userProfile, setUserProfile } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const totalSteps = 7;

  const canProceed = () => {
    switch (step) {
      case 0: return !!userProfile.goal;
      case 1: return !!userProfile.level;
      case 2: return !!userProfile.preference;
      case 3: return !!userProfile.gender;
      case 4: return userProfile.age > 0;
      case 5: return userProfile.weight > 0;
      default: return true;
    }
  };

  const next = () => {
    if (!canProceed()) return;
    setDirection("next");
    if (step < totalSteps - 1) setStep(step + 1);
    else setHasOnboarded(true);
  };

  const prev = () => {
    setDirection("prev");
    if (step > 0) setStep(step - 1);
  };

  const animClass = direction === "next" ? "animate-fade-in" : "animate-fade-in";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "gradient-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-right">{step + 1}/{totalSteps}</p>
      </div>

      <div className="flex-1 flex flex-col px-6 overflow-hidden" key={step}>
        {/* Step 0: Goal */}
        {step === 0 && (
          <div className={`flex-1 flex flex-col ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Qual seu objetivo? 🎯
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Selecione um para começar</p>
            <div className="space-y-2.5">
              {goals.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setUserProfile({ ...userProfile, goal: g.id })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    userProfile.goal === g.id
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-3xl">{g.icon}</span>
                  <div className="text-left">
                    <span className="font-semibold text-foreground">{g.label}</span>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                  {userProfile.goal === g.id && (
                    <div className="ml-auto w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div className={`flex-1 flex flex-col ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Seu nível de treino 📊
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Sem julgamentos, vamos evoluir juntos</p>
            <div className="space-y-3">
              {levels.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setUserProfile({ ...userProfile, level: l.id })}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    userProfile.level === l.id
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <span className="text-3xl">{l.icon}</span>
                  <div className="text-left flex-1">
                    <span className="font-semibold text-foreground">{l.label}</span>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                  {userProfile.level === l.id && (
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Preference */}
        {step === 2 && (
          <div className={`flex-1 flex flex-col ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Onde prefere treinar? 🏋️
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Você pode mudar depois</p>
            <div className="grid grid-cols-2 gap-3">
              {preferences.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setUserProfile({ ...userProfile, preference: p.id })}
                  className={`flex flex-col items-center gap-2 p-6 rounded-2xl border transition-all duration-300 ${
                    userProfile.preference === p.id
                      ? "border-primary bg-primary/10 scale-[1.03]"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <p.icon className={`w-8 h-8 ${userProfile.preference === p.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-foreground text-sm">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Gender */}
        {step === 3 && (
          <div className={`flex-1 flex flex-col ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Seu gênero 👤
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Para personalizar seus planos</p>
            <div className="flex gap-4">
              {[
                { id: "male" as const, label: "Masculino", icon: "🙋‍♂️" },
                { id: "female" as const, label: "Feminino", icon: "🙋‍♀️" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setUserProfile({ ...userProfile, gender: g.id })}
                  className={`flex-1 flex flex-col items-center gap-3 p-8 rounded-2xl border transition-all duration-300 ${
                    userProfile.gender === g.id
                      ? "border-primary bg-primary/10 scale-[1.03]"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-5xl">{g.icon}</span>
                  <span className="font-semibold text-foreground">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Age */}
        {step === 4 && (
          <div className={`flex-1 flex flex-col items-center ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Qual sua idade? 🎂
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Role para selecionar</p>
            <div className="w-32">
              <ScrollPicker
                values={ageValues}
                selectedValue={userProfile.age}
                onChange={(v) => setUserProfile({ ...userProfile, age: v })}
                suffix=" anos"
              />
            </div>
          </div>
        )}

        {/* Step 5: Weight & Height */}
        {step === 5 && (
          <div className={`flex-1 flex flex-col items-center ${animClass}`}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Peso e altura ⚖️
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Role para selecionar</p>
            <div className="flex gap-8 w-full justify-center">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground font-medium mb-3">PESO</span>
                <div className="w-28">
                  <ScrollPicker
                    values={weightValues}
                    selectedValue={userProfile.weight}
                    onChange={(v) => setUserProfile({ ...userProfile, weight: v })}
                    suffix=" kg"
                  />
                </div>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground font-medium mb-3">ALTURA</span>
                <div className="w-28">
                  <ScrollPicker
                    values={heightValues}
                    selectedValue={userProfile.height}
                    onChange={(v) => setUserProfile({ ...userProfile, height: v })}
                    suffix=" cm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Days per week */}
        {step === 6 && (
          <div className={`flex-1 flex flex-col items-center justify-center text-center ${animClass}`}>
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 animate-pulse-glow">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
              Quantos dias por semana?
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Escolha sua frequência ideal</p>
            <div className="flex gap-3 mb-10">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => setUserProfile({ ...userProfile, daysPerWeek: d })}
                  className={`w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    userProfile.daysPerWeek === d
                      ? "gradient-primary text-primary-foreground scale-110"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {d}x
                </button>
              ))}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Treinos personalizados</p>
              <p>✅ Acompanhamento de corrida</p>
              <p>✅ Controle nutricional</p>
              <p>✅ Progresso completo</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 pb-8 pt-4">
        {step > 0 && (
          <Button variant="glass" onClick={prev} className="h-14 px-6 rounded-2xl">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="hero"
          onClick={next}
          disabled={!canProceed()}
          className="flex-1 h-14 rounded-2xl text-base gap-2 disabled:opacity-40"
        >
          {step === totalSteps - 1 ? "Começar 🚀" : "Continuar"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
