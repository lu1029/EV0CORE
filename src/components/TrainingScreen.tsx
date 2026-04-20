import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { Loader2, ChevronRight, Plus } from "lucide-react";
import ActiveWorkout from "./training/ActiveWorkout";
import ExerciseLibraryBrowser from "./training/ExerciseLibraryBrowser";
import type { Exercise } from "./training/ExerciseCard";
import { getGifUrl } from "./training/homeExerciseGifs";
import { useSavedPlan } from "@/hooks/useSavedPlan";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evo-ai-chat`;

type LevelKey = "iniciante" | "intermediario" | "avancado";

const LEVELS: { key: LevelKey; title: string; subtitle: string }[] = [
  { key: "iniciante",     title: "Iniciante",     subtitle: "Construindo a base. Foco em forma e consistência." },
  { key: "intermediario", title: "Intermediário", subtitle: "Volume crescente. Maior intensidade e variação." },
  { key: "avancado",      title: "Avançado",      subtitle: "Alta carga e técnica refinada. Treinos densos." },
];

const inferLevelFromProfile = (level?: string): LevelKey => {
  const l = (level || "").toLowerCase();
  if (l.includes("avan")) return "avancado";
  if (l.includes("inter")) return "intermediario";
  return "iniciante";
};

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const [tab, setTab] = useState<"gym" | "home" | "library">("gym");
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>(inferLevelFromProfile(userProfile.level));

  const gymSaved = useSavedPlan("gym");
  const homeSaved = useSavedPlan("home");

  const [generatedPlan, setGeneratedPlan] = useState<Record<string, Exercise[]> | null>(null);
  const [planName, setPlanName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const [homePlan, setHomePlan] = useState<Record<string, Exercise[]> | null>(null);
  const [homePlanName, setHomePlanName] = useState("");
  const [isGeneratingHome, setIsGeneratingHome] = useState(false);
  const [homeError, setHomeError] = useState("");

  useEffect(() => {
    if (gymSaved.plan && !generatedPlan) {
      const data = gymSaved.plan.plan_data as any;
      setGeneratedPlan(data.workouts || null);
      setPlanName(data.planName || gymSaved.plan.plan_name);
    }
  }, [gymSaved.plan]);

  useEffect(() => {
    if (homeSaved.plan && !homePlan) {
      const data = homeSaved.plan.plan_data as any;
      const mapped: Record<string, Exercise[]> = {};
      for (const [name, exercises] of Object.entries(data.workouts || {})) {
        mapped[name] = (exercises as any[]).map((ex) => ({
          ...ex,
          gifUrl: getGifUrl(ex.gifKey) || ex.gifUrl || undefined,
        }));
      }
      setHomePlan(mapped);
      setHomePlanName(data.planName || homeSaved.plan.plan_name);
    }
  }, [homeSaved.plan]);

  const generateTrainingPlan = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-training",
          userProfile: { ...userProfile, level: selectedLevel },
          messages: [{ role: "user", content: `Gere meu plano de treino personalizado para o nível ${selectedLevel}.` }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.workouts) {
        setGeneratedPlan(parsed.workouts);
        setPlanName(parsed.planName || "Plano personalizado");
        await gymSaved.savePlan(parsed.planName || "Plano personalizado", parsed.description || "", parsed);
      }
    } catch (err) {
      console.error(err);
      setGenerateError("Não foi possível gerar agora. Tente novamente.");
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
          userProfile: { ...userProfile, preference: "home", level: selectedLevel },
          messages: [{ role: "user", content: `Gere meu plano de treino em casa para o nível ${selectedLevel}, com equivalentes de academia.` }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar plano");
      const data = await res.json();
      const parsed = JSON.parse(data.result);
      if (parsed.workouts) {
        const mapped: Record<string, Exercise[]> = {};
        for (const [name, exercises] of Object.entries(parsed.workouts)) {
          mapped[name] = (exercises as any[]).map((ex) => ({ ...ex, gifUrl: getGifUrl(ex.gifKey) || undefined }));
        }
        setHomePlan(mapped);
        setHomePlanName(parsed.planName || "Treino em casa");
        await homeSaved.savePlan(parsed.planName || "Treino em casa", parsed.description || "", parsed);
      }
    } catch (err) {
      console.error(err);
      setHomeError("Não foi possível gerar agora. Tente novamente.");
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
        workoutType={tab === "home" ? "home" : "gym"}
        onBack={() => { setActiveWorkout(null); setActiveExercises([]); }}
      />
    );
  }

  const currentPlan = tab === "gym" ? generatedPlan : homePlan;
  const currentName = tab === "gym" ? planName : homePlanName;
  const loading = tab === "gym" ? isGenerating : isGeneratingHome;
  const error = tab === "gym" ? generateError : homeError;
  const onGenerate = tab === "gym" ? generateTrainingPlan : generateHomePlan;
  const savedLoading = tab === "gym" ? gymSaved.loading : homeSaved.loading;

  return (
    <div className="pb-32 max-w-lg mx-auto relative z-10">
      {/* Large title — Apple style */}
      <div className="px-5 pt-6 pb-4 animate-fade-in">
        <p className="text-[13px] font-medium text-muted-foreground mb-1">Treino</p>
        <h1 className="text-[34px] leading-tight font-bold tracking-tight text-foreground">
          Hoje
        </h1>
      </div>

      {/* Segmented control — iOS */}
      <div className="px-5 mb-6 animate-fade-in">
        <div className="flex bg-white/[0.06] rounded-[10px] p-[3px]">
          {([
            { key: "gym",     label: "Academia" },
            { key: "home",    label: "Em casa" },
            { key: "library", label: "Biblioteca" },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTab(opt.key)}
              className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all ${
                tab === opt.key
                  ? "bg-white/[0.14] text-foreground shadow-[0_1px_0_rgba(0,0,0,0.2)]"
                  : "text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "library" ? (
        <ExerciseLibraryBrowser />
      ) : (
      <>
      {/* Level selector — horizontal blocks (no cards) */}
      <div className="px-5 mb-2 animate-fade-in">
        <h2 className="text-[22px] font-bold tracking-tight text-foreground mb-3">Nível</h2>
        <div className="rounded-2xl bg-card overflow-hidden border border-white/[0.06]">
          {LEVELS.map((lvl, idx) => {
            const active = selectedLevel === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => setSelectedLevel(lvl.key)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.04] ${
                  idx > 0 ? "border-t border-white/[0.06]" : ""
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  active ? "border-primary" : "border-white/20"
                }`}>
                  {active && <div className="w-[10px] h-[10px] rounded-full bg-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-semibold text-foreground leading-tight">{lvl.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{lvl.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan section */}
      <div className="px-5 pt-8 animate-fade-in">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-[22px] font-bold tracking-tight text-foreground">
            {currentPlan ? "Treinos" : "Seu plano"}
          </h2>
          {currentPlan && (
            <button
              onClick={onGenerate}
              disabled={loading}
              className="text-[15px] text-primary font-medium active:opacity-60 transition-opacity disabled:opacity-40"
            >
              Refazer
            </button>
          )}
        </div>

        {savedLoading ? (
          <div className="flex items-center gap-3 py-10 justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">Carregando…</p>
          </div>
        ) : !currentPlan ? (
          <div className="rounded-2xl bg-card border border-white/[0.06] p-5">
            <p className="text-[15px] text-foreground leading-relaxed">
              {tab === "gym"
                ? "Vamos montar seu plano com base no seu perfil e nível."
                : "Treino em casa adaptado, sem equipamentos."}
            </p>
            <p className="text-[13px] text-muted-foreground mt-1">
              {currentName || `Nível selecionado: ${LEVELS.find(l => l.key === selectedLevel)?.title}`}
            </p>

            {error && <p className="text-[13px] text-destructive mt-3">{error}</p>}

            <button
              onClick={onGenerate}
              disabled={loading}
              className="mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Gerando…</>
              ) : (
                <><Plus className="w-4 h-4" /> Gerar plano</>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
            {Object.entries(currentPlan).map(([workoutName, exercises], idx, arr) => {
              const totalMin = exercises.length * 7;
              return (
                <button
                  key={workoutName}
                  onClick={() => startWorkout(workoutName, currentPlan)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.04] ${
                    idx > 0 ? "border-t border-white/[0.06]" : ""
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-semibold text-foreground leading-tight truncate">{workoutName}</p>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      {exercises.length} exercícios · {totalMin} min · {LEVELS.find(l => l.key === selectedLevel)?.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default TrainingScreen;
