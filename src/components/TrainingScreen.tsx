import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Dumbbell, Play, Home, Sparkles, Loader2, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ActiveWorkout from "./training/ActiveWorkout";
import type { Exercise } from "./training/ExerciseCard";
import { getGifUrl } from "./training/homeExerciseGifs";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evo-ai-chat`;

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const [tab, setTab] = useState<"gym" | "home">("gym");
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

  // AI-generated plan state (gym)
  const [generatedPlan, setGeneratedPlan] = useState<Record<string, Exercise[]> | null>(null);
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // AI-generated home plan state
  const [homePlan, setHomePlan] = useState<Record<string, Exercise[]> | null>(null);
  const [homePlanName, setHomePlanName] = useState("");
  const [homePlanDesc, setHomePlanDesc] = useState("");
  const [isGeneratingHome, setIsGeneratingHome] = useState(false);
  const [homeError, setHomeError] = useState("");

  const generateTrainingPlan = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-training",
          userProfile,
          messages: [{ role: "user", content: "Gere meu plano de treino personalizado completo." }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.workouts) {
        setGeneratedPlan(parsed.workouts);
        setPlanName(parsed.planName || "Seu Plano Personalizado");
        setPlanDesc(parsed.description || "");
      }
    } catch (err) {
      console.error(err);
      setGenerateError("Erro ao gerar plano. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHomePlan = async () => {
    setIsGeneratingHome(true);
    setHomeError("");
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-home-training",
          userProfile: { ...userProfile, preference: "home" },
          messages: [{ role: "user", content: "Gere meu plano de treino em casa personalizado completo, com equivalentes de exercícios de academia." }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.workouts) {
        // Map gifKey to actual GIF URLs
        const mappedWorkouts: Record<string, Exercise[]> = {};
        for (const [name, exercises] of Object.entries(parsed.workouts)) {
          mappedWorkouts[name] = (exercises as any[]).map((ex) => ({
            ...ex,
            gifUrl: getGifUrl(ex.gifKey) || undefined,
          }));
        }
        setHomePlan(mappedWorkouts);
        setHomePlanName(parsed.planName || "Treino em Casa");
        setHomePlanDesc(parsed.description || "");
      }
    } catch (err) {
      console.error(err);
      setHomeError("Erro ao gerar plano. Tente novamente.");
    } finally {
      setIsGeneratingHome(false);
    }
  };

  const startWorkout = (name: string, plan: Record<string, Exercise[]>) => {
    if (plan[name]) {
      setActiveExercises(plan[name]);
      setActiveWorkout(name);
    }
  };

  if (activeWorkout) {
    return (
      <ActiveWorkout
        workoutName={activeWorkout}
        exercises={activeExercises}
        onBack={() => { setActiveWorkout(null); setActiveExercises([]); }}
      />
    );
  }

  const renderEmptyState = (
    isHome: boolean,
    loading: boolean,
    error: string,
    onGenerate: () => void
  ) => (
    <div className="flex flex-col items-center text-center py-8 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 animate-pulse-glow">
        {isHome ? <Home className="w-10 h-10 text-primary-foreground" /> : <Sparkles className="w-10 h-10 text-primary-foreground" />}
      </div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-2">
        {isHome ? "Treino em Casa com IA" : "Crie seu treino personalizado"}
      </h2>
      <p className="text-sm text-muted-foreground mb-2 max-w-xs">
        {isHome
          ? "Nossa IA vai montar exercícios equivalentes aos de academia usando apenas seu peso corporal e itens de casa (cadeira, toalha, mochila). Cada exercício vem com GIF demonstrativo!"
          : "Nossa IA vai montar um plano de treino completo baseado no seu perfil: objetivo, nível e disponibilidade."}
      </p>

      <div className="glass-card rounded-2xl p-4 mb-6 w-full text-left">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Seu perfil:</p>
        <div className="space-y-1">
          <p className="text-xs text-foreground">🎯 Objetivo: <span className="text-primary font-medium">{userProfile.goal || "não definido"}</span></p>
          <p className="text-xs text-foreground">📊 Nível: <span className="text-primary font-medium">{userProfile.level || "não definido"}</span></p>
          <p className="text-xs text-foreground">📅 Dias/semana: <span className="text-primary font-medium">{userProfile.daysPerWeek}</span></p>
          <p className="text-xs text-foreground">⚖️ Peso: <span className="text-primary font-medium">{userProfile.weight}kg</span></p>
          {isHome && (
            <p className="text-xs text-foreground">🏠 Treino: <span className="text-accent font-medium">Em casa sem equipamentos</span></p>
          )}
        </div>
      </div>

      {isHome && (
        <div className="glass-card rounded-2xl p-4 mb-6 w-full text-left">
          <p className="text-xs text-muted-foreground mb-2 font-medium">🔄 Equivalências de academia:</p>
          <div className="space-y-1 text-xs text-foreground">
            <p>💪 Supino → <span className="text-primary">Flexões (variações)</span></p>
            <p>🦵 Leg Press → <span className="text-primary">Agachamento búlgaro</span></p>
            <p>🚣 Remada → <span className="text-primary">Remada com toalha</span></p>
            <p>🏋️ Desenvolvimento → <span className="text-primary">Pike push-up</span></p>
            <p>⬇️ Tríceps pulley → <span className="text-primary">Mergulho na cadeira</span></p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive mb-4">{error}</p>}

      <Button
        className="w-full h-14 rounded-2xl text-base gap-2 gradient-primary text-primary-foreground font-semibold"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isHome ? "Montando treino em casa..." : "Gerando seu plano..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {isHome ? "Gerar Treino em Casa com IA" : "Gerar Meu Treino com IA"}
          </>
        )}
      </Button>

      {loading && (
        <div className="mt-4 space-y-2 w-full">
          <div className="glass-card rounded-xl p-3 animate-pulse">
            <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
            <div className="h-2 bg-secondary rounded w-1/2" />
          </div>
          <div className="glass-card rounded-xl p-3 animate-pulse" style={{ animationDelay: '150ms' }}>
            <div className="h-3 bg-secondary rounded w-2/3 mb-2" />
            <div className="h-2 bg-secondary rounded w-1/3" />
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanView = (
    plan: Record<string, Exercise[]>,
    name: string,
    desc: string,
    onReset: () => void,
    isHome: boolean
  ) => (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg">{name}</h2>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Refazer
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(plan).map(([workoutName, exercises], idx) => {
          const firstEmoji = exercises[0]?.emoji || (isHome ? "🏠" : "💪");
          const hasGifs = isHome && exercises.some(e => e.gifUrl);
          return (
            <button
              key={workoutName}
              onClick={() => startWorkout(workoutName, plan)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all text-left animate-fade-in active:scale-[0.98]"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center text-xl border border-border/30">
                {firstEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm">{workoutName}</h4>
                <p className="text-xs text-muted-foreground">
                  {exercises.length} exercícios • ~{exercises.length * 7} min
                  {hasGifs && " • 🎬 Com demonstração"}
                </p>
              </div>
              <Play className="w-4 h-4 text-primary shrink-0" />
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6 animate-fade-in">Treino</h1>

      {/* Tab switch */}
      <div className="flex glass-card rounded-2xl p-1 mb-6 animate-fade-in">
        <button
          onClick={() => setTab("gym")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "gym" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Academia
        </button>
        <button
          onClick={() => setTab("home")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "home" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Home className="w-4 h-4" /> Em casa
        </button>
      </div>

      {tab === "gym" ? (
        <div className="animate-fade-in space-y-6">
          {!generatedPlan
            ? renderEmptyState(false, isGenerating, generateError, generateTrainingPlan)
            : renderPlanView(generatedPlan, planName, planDesc, () => {
                setGeneratedPlan(null); setPlanName(""); setPlanDesc("");
              }, false)}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          {!homePlan
            ? renderEmptyState(true, isGeneratingHome, homeError, generateHomePlan)
            : renderPlanView(homePlan, homePlanName, homePlanDesc, () => {
                setHomePlan(null); setHomePlanName(""); setHomePlanDesc("");
              }, true)}
        </div>
      )}
    </div>
  );
};

export default TrainingScreen;
