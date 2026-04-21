import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2, ChevronRight, Plus, Sparkles, Pencil, Lock } from "lucide-react";
import ActiveWorkout from "./training/ActiveWorkout";
import ExerciseLibraryBrowser from "./training/ExerciseLibraryBrowser";
import WorkoutBuilder from "./training/WorkoutBuilder";
import type { Exercise } from "./training/ExerciseCard";
import { getGifUrl } from "./training/homeExerciseGifs";
import { getCuratedPlans, type Level, type CuratedPlan } from "./training/curatedPlans";
import { useSavedPlan } from "@/hooks/useSavedPlan";
import { TrainingSkeleton } from "./skeletons/TrainingSkeleton";
import { fadeUp, stagger, staggerFast, springSnappy, easeApple } from "@/lib/motion";
import EquipmentSelector from "./training/EquipmentSelector";
import { EQUIPMENT_OPTIONS, loadEquipment, saveEquipment, planFits, type EquipmentKey } from "./training/equipmentTypes";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evo-ai-chat`;

const LEVELS: { key: Level; title: string; subtitle: string }[] = [
  { key: "iniciante",     title: "Iniciante",     subtitle: "Construindo a base. Foco em forma e consistência." },
  { key: "intermediario", title: "Intermediário", subtitle: "Volume crescente. Maior intensidade e variação." },
  { key: "avancado",      title: "Avançado",      subtitle: "Alta carga e técnica refinada. Treinos densos." },
];

const inferLevelFromProfile = (level?: string): Level => {
  const l = (level || "").toLowerCase();
  if (l.includes("avan")) return "avancado";
  if (l.includes("inter")) return "intermediario";
  return "iniciante";
};

const TrainingScreen = () => {
  const { userProfile } = useApp();
  const { isActive: isPremium } = useSubscription();
  const [tab, setTab] = useState<"gym" | "home" | "library">("gym");
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level>(inferLevelFromProfile(userProfile.level));
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderInitial, setBuilderInitial] = useState<{ name: string; workouts: Record<string, Exercise[]> } | undefined>();
  const [equipment, setEquipment] = useState<EquipmentKey[]>(() => loadEquipment());

  useEffect(() => { saveEquipment(equipment); }, [equipment]);

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
      const equipmentLabels = equipment
        .map(k => EQUIPMENT_OPTIONS.find(o => o.key === k)?.aiHint)
        .filter(Boolean);
      const equipmentDesc = equipmentLabels.length
        ? `Itens disponíveis em casa: ${equipmentLabels.join("; ")}.`
        : "Apenas peso corporal — nenhum item adicional disponível.";

      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-home-training",
          userProfile: { ...userProfile, preference: "home", level: selectedLevel, availableEquipment: equipment },
          messages: [{ role: "user", content: `Gere meu plano de treino em casa para o nível ${selectedLevel}. ${equipmentDesc} Use APENAS exercícios compatíveis com esses itens.` }],
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

  const startCuratedWorkout = (curated: CuratedPlan, workoutName: string) => {
    setActiveExercises(curated.workouts[workoutName]);
    setActiveWorkout(workoutName);
  };

  const openBuilderEmpty = () => {
    setBuilderInitial(undefined);
    setShowBuilder(true);
  };

  const openBuilderFromCurated = (curated: CuratedPlan) => {
    setBuilderInitial({ name: `${curated.name} (cópia)`, workouts: curated.workouts });
    setShowBuilder(true);
  };

  const openBuilderFromGenerated = () => {
    const current = tab === "gym" ? generatedPlan : homePlan;
    const currName = tab === "gym" ? planName : homePlanName;
    if (current) {
      setBuilderInitial({ name: `${currName} (cópia)`, workouts: current });
      setShowBuilder(true);
    }
  };

  const curatedForTab = useMemo(() => {
    if (tab === "library") return [];
    const all = getCuratedPlans(tab as "gym" | "home", selectedLevel);
    if (tab !== "home") return all;
    const filtered = all.filter(p => planFits(p, equipment));
    // se filtro deixar tudo vazio, mostra todos para não bloquear UX
    return filtered.length ? filtered : all;
  }, [tab, selectedLevel, equipment]);

  if (showBuilder) {
    return (
      <WorkoutBuilder
        mode={tab === "home" ? "home" : "gym"}
        initialPlanName={builderInitial?.name}
        initialWorkouts={builderInitial?.workouts}
        onClose={() => setShowBuilder(false)}
        onSaved={(name, workouts) => {
          if (tab === "home") {
            setHomePlan(workouts);
            setHomePlanName(name);
          } else {
            setGeneratedPlan(workouts);
            setPlanName(name);
          }
        }}
      />
    );
  }

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
    <motion.div
      className="pb-32 max-w-lg mx-auto relative z-10"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Large title */}
      <motion.div variants={fadeUp} className="px-5 pt-6 pb-4">
        <p className="text-[13px] font-medium text-muted-foreground mb-1">Treino</p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeApple, delay: 0.1 }}
          className="text-[34px] leading-tight font-bold tracking-tight text-foreground"
        >
          Hoje
        </motion.h1>
      </motion.div>

      {/* Segmented control */}
      <motion.div variants={fadeUp} className="px-5 mb-6">
        <div className="flex bg-white/[0.06] rounded-[10px] p-[3px]">
          {([
            { key: "gym",     label: "Academia" },
            { key: "home",    label: "Em casa" },
            { key: "library", label: "Biblioteca" },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTab(opt.key)}
              className={`relative flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                tab === opt.key ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab === opt.key && (
                <motion.div
                  layoutId="training-tab-pill"
                  transition={springSnappy}
                  className="absolute inset-0 bg-white/[0.14] rounded-[8px] shadow-[0_1px_0_rgba(0,0,0,0.2)]"
                />
              )}
              <span className="relative">{opt.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "library" ? (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: easeApple }}
          >
            <ExerciseLibraryBrowser />
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
            variants={stagger}
            transition={{ duration: 0.25, ease: easeApple }}
          >
            {/* Nível */}
            <motion.div variants={fadeUp} className="px-5 mb-2">
              <h2 className="text-[22px] font-bold tracking-tight text-foreground mb-3">Nível</h2>
              <div className="rounded-2xl bg-card overflow-hidden border border-white/[0.06]">
                {LEVELS.map((lvl, idx) => {
                  const active = selectedLevel === lvl.key;
                  return (
                    <motion.button
                      key={lvl.key}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLevel(lvl.key)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.04] ${
                        idx > 0 ? "border-t border-white/[0.06]" : ""
                      }`}
                    >
                      <motion.div
                        animate={{ borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                        className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0"
                      >
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={springSnappy}
                              className="w-[10px] h-[10px] rounded-full bg-primary"
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-foreground leading-tight">{lvl.title}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{lvl.subtitle}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Equipamentos disponíveis + atalho de geração (apenas em casa) */}
            {tab === "home" && (
              <>
                <EquipmentSelector selected={equipment} onChange={setEquipment} />
                <motion.div variants={fadeUp} className="px-5 pt-4">
                  <button
                    onClick={generateHomePlan}
                    disabled={isGeneratingHome}
                    className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 active:opacity-80"
                  >
                    {isGeneratingHome ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando treino…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Gerar treino com IA</>
                    )}
                  </button>
                  {homeError && (
                    <p className="text-[13px] text-destructive mt-2 text-center">{homeError}</p>
                  )}
                  <p className="text-[12px] text-muted-foreground mt-2 text-center">
                    Personalizado para o seu nível e itens disponíveis
                  </p>
                </motion.div>
              </>
            )}

            {/* Treinos prontos curados */}
            <motion.div variants={fadeUp} className="px-5 pt-8">
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-[22px] font-bold tracking-tight text-foreground">Prontos para começar</h2>
                <span className="text-[13px] text-muted-foreground">{LEVELS.find(l => l.key === selectedLevel)?.title}</span>
              </div>

              <motion.div variants={staggerFast} initial="hidden" animate="visible" className="space-y-3">
                {curatedForTab.map((curated) => (
                  <motion.div
                    key={curated.id}
                    variants={fadeUp}
                    className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden"
                  >
                    <div className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-foreground leading-tight">{curated.name}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">{curated.description}</p>
                      </div>
                      <button
                        onClick={() => openBuilderFromCurated(curated)}
                        className="text-[12px] font-medium text-primary px-2 py-1 rounded-full bg-primary/10 inline-flex items-center gap-1 shrink-0"
                        title={isPremium ? "Duplicar e editar" : "Premium"}
                      >
                        {isPremium ? <Pencil className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        Editar
                      </button>
                    </div>
                    <div>
                      {Object.entries(curated.workouts).map(([wname, exs], idx) => (
                        <button
                          key={wname}
                          onClick={() => startCuratedWorkout(curated, wname)}
                          className={`w-full flex items-center gap-3 px-5 py-3 text-left active:bg-white/[0.04] ${
                            idx === 0 ? "border-t border-white/[0.06]" : "border-t border-white/[0.04]"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-foreground truncate">{wname}</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                              {exs.length} exercícios · ~{exs.length * 7} min
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Criar próprio (Premium) */}
            <motion.div variants={fadeUp} className="px-5 pt-6">
              <button
                onClick={openBuilderEmpty}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-white/[0.06] text-left active:bg-white/[0.04]"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  {isPremium ? <Plus className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground leading-tight">
                    Criar meu próprio treino {!isPremium && <span className="text-[11px] uppercase tracking-wider text-primary ml-1">Premium</span>}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Monte do zero com exercícios da biblioteca
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </motion.div>

            {/* Plano IA / Gerado */}
            <motion.div variants={fadeUp} className="px-5 pt-6">
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-[22px] font-bold tracking-tight text-foreground inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Plano com IA
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
                <TrainingSkeleton />
              ) : !currentPlan ? (
                <motion.div className="rounded-2xl bg-card border border-white/[0.06] p-5">
                  <p className="text-[15px] text-foreground leading-relaxed">
                    {tab === "gym"
                      ? "Gere um plano 100% personalizado pelo seu perfil e nível."
                      : "Gere um treino em casa adaptado, com itens do seu dia-a-dia."}
                  </p>
                  {error && <p className="text-[13px] text-destructive mt-3">{error}</p>}

                  <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 active:opacity-80"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Gerar com IA</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
                  <div className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-semibold text-foreground leading-tight truncate">{currentName}</p>
                      <p className="text-[13px] text-muted-foreground mt-0.5">Gerado pela IA</p>
                    </div>
                    <button
                      onClick={openBuilderFromGenerated}
                      className="text-[12px] font-medium text-primary px-2 py-1 rounded-full bg-primary/10 inline-flex items-center gap-1 shrink-0"
                    >
                      {isPremium ? <Pencil className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      Editar
                    </button>
                  </div>
                  {Object.entries(currentPlan).map(([workoutName, exercises], idx) => (
                    <button
                      key={workoutName}
                      onClick={() => startWorkout(workoutName, currentPlan)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left active:bg-white/[0.04] border-t border-white/[0.06]`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground truncate">{workoutName}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {exercises.length} exercícios · ~{exercises.length * 7} min
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrainingScreen;
