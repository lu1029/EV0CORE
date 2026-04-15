import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Dumbbell, MapPin, Apple, Target, ChevronRight, ChevronLeft, Zap, Home as HomeIcon } from "lucide-react";

const goals = [
  { id: "lose", label: "Emagrecer", icon: "🔥" },
  { id: "gain", label: "Ganhar massa", icon: "💪" },
  { id: "condition", label: "Condicionamento", icon: "🏃" },
  { id: "define", label: "Definição", icon: "✂️" },
  { id: "health", label: "Saúde geral", icon: "❤️" },
];

const levels = [
  { id: "beginner", label: "Iniciante", desc: "Estou começando agora" },
  { id: "intermediate", label: "Intermediário", desc: "Treino há alguns meses" },
  { id: "advanced", label: "Avançado", desc: "Treino há mais de 1 ano" },
];

const preferences = [
  { id: "gym", label: "Academia", icon: Dumbbell },
  { id: "home", label: "Em casa", icon: HomeIcon },
  { id: "running", label: "Corrida", icon: MapPin },
  { id: "all", label: "Tudo junto", icon: Zap },
];

const OnboardingScreen = () => {
  const { setHasOnboarded, userProfile, setUserProfile } = useApp();
  const [step, setStep] = useState(0);

  const totalSteps = 5;

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else setHasOnboarded(true);
  };
  const prev = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "gradient-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col animate-fade-in" key={step}>
        {step === 0 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Qual seu objetivo principal? 🎯
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Isso nos ajuda a personalizar tudo para você</p>
            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setUserProfile({ ...userProfile, goal: g.id })}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    userProfile.goal === g.id
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-medium text-foreground">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Qual seu nível? 📊
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Sem julgamentos, vamos evoluir juntos</p>
            <div className="space-y-3">
              {levels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setUserProfile({ ...userProfile, level: l.id })}
                  className={`w-full flex flex-col items-start p-4 rounded-xl border transition-all duration-300 ${
                    userProfile.level === l.id
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium text-foreground">{l.label}</span>
                  <span className="text-sm text-muted-foreground">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Como prefere treinar? 🏋️
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Você pode combinar depois</p>
            <div className="grid grid-cols-2 gap-3">
              {preferences.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setUserProfile({ ...userProfile, preference: p.id })}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 ${
                    userProfile.preference === p.id
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <p.icon className={`w-8 h-8 ${userProfile.preference === p.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-foreground text-sm">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Suas informações 📋
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Para personalizar seus planos</p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setUserProfile({ ...userProfile, gender: "male" })}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                    userProfile.gender === "male" ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl">🙋‍♂️</span>
                  <p className="text-sm font-medium text-foreground mt-1">Homem</p>
                </button>
                <button
                  onClick={() => setUserProfile({ ...userProfile, gender: "female" })}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                    userProfile.gender === "female" ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl">🙋‍♀️</span>
                  <p className="text-sm font-medium text-foreground mt-1">Mulher</p>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-3">
                  <label className="text-xs text-muted-foreground">Idade</label>
                  <input
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile({ ...userProfile, age: +e.target.value })}
                    className="w-full bg-transparent text-foreground text-lg font-bold outline-none"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3">
                  <label className="text-xs text-muted-foreground">Peso (kg)</label>
                  <input
                    type="number"
                    value={userProfile.weight}
                    onChange={(e) => setUserProfile({ ...userProfile, weight: +e.target.value })}
                    className="w-full bg-transparent text-foreground text-lg font-bold outline-none"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3">
                  <label className="text-xs text-muted-foreground">Altura (cm)</label>
                  <input
                    type="number"
                    value={userProfile.height}
                    onChange={(e) => setUserProfile({ ...userProfile, height: +e.target.value })}
                    className="w-full bg-transparent text-foreground text-lg font-bold outline-none"
                  />
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="text-xs text-muted-foreground">Dias por semana para treinar</label>
                <div className="flex gap-2 mt-2">
                  {[2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => setUserProfile({ ...userProfile, daysPerWeek: d })}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        userProfile.daysPerWeek === d
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 animate-pulse-glow">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">
              Tudo pronto! 🚀
            </h2>
            <p className="text-muted-foreground max-w-xs mb-2">
              Seu plano personalizado está sendo preparado. Vamos evoluir juntos!
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>✅ Treinos personalizados</p>
              <p>✅ Acompanhamento de corrida</p>
              <p>✅ Controle nutricional</p>
              <p>✅ Progresso completo</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        {step > 0 && (
          <Button variant="glass" onClick={prev} className="h-12 px-6 rounded-xl">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        <Button variant="hero" onClick={next} className="flex-1 h-12 rounded-xl text-base gap-2">
          {step === totalSteps - 1 ? "Começar" : "Continuar"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
