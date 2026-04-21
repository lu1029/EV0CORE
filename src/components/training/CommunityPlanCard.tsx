import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, ChevronRight, Pencil, Lock, Sparkles, X, Dumbbell, ListChecks, Clock } from "lucide-react";
import { useCuratedPlanCover } from "@/hooks/useCuratedPlanCover";
import type { CuratedPlan } from "./curatedPlans";
import type { Exercise } from "./ExerciseCard";
import { easeApple, springSnappy } from "@/lib/motion";

interface Props {
  plan: CuratedPlan;
  isPremium: boolean;
  onStart: (workoutName: string, exercises: Exercise[]) => void;
  onEdit: () => void;
}

const LEVEL_LABEL: Record<CuratedPlan["level"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const Cover: React.FC<{ plan: CuratedPlan }> = ({ plan }) => {
  const muscle = plan.mode === "gym" ? "fitness gym training" : "home bodyweight workout";
  const { url, loading } = useCuratedPlanCover(plan.id, plan.coverPrompt, muscle);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden shrink-0 bg-secondary">
      {/* Skeleton/placeholder */}
      {(!url || !imgLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/40 animate-pulse flex items-center justify-center">
          {loading ? (
            <Sparkles className="w-5 h-5 text-white/70 animate-pulse" />
          ) : (
            <Dumbbell className="w-6 h-6 text-white/60" />
          )}
        </div>
      )}
      {url && (
        <img
          src={url}
          alt={plan.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};

const CommunityPlanCard: React.FC<Props> = ({ plan, isPremium, onStart, onEdit }) => {
  const [open, setOpen] = useState(false);
  const workoutEntries = Object.entries(plan.workouts);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="w-full flex items-stretch gap-3 p-2.5 rounded-2xl bg-card border border-white/[0.06] text-left active:bg-white/[0.04] transition-colors"
      >
        <Cover plan={plan} />
        <div className="flex-1 min-w-0 py-1 pr-1 flex flex-col">
          <p className="text-[16px] font-bold text-foreground leading-tight truncate">{plan.name}</p>
          <p className="text-[12px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
            por <span className="text-foreground/80 font-medium">{plan.author}</span>
            <BadgeCheck className="w-3.5 h-3.5 text-accent fill-accent/20" />
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.08] text-foreground/90">
              {LEVEL_LABEL[plan.level]}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {plan.sessions} sessões
            </span>
          </div>
        </div>
      </motion.button>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeApple }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={springSnappy}
              className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/[0.06]"
            >
              {/* Hero */}
              <div className="relative h-44 overflow-hidden">
                <PlanCoverHero plan={plan} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white active:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent text-accent-foreground mb-1.5">
                    {LEVEL_LABEL[plan.level]}
                  </span>
                  <h2 className="text-[22px] font-bold text-foreground leading-tight">{plan.name}</h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                    por <span className="text-foreground/80 font-medium">{plan.author}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-accent fill-accent/20" />
                  </p>
                </div>
              </div>

              {/* Conteúdo scrollável */}
              <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-white/[0.04] py-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Sessões</p>
                    <p className="text-[15px] font-bold text-foreground mt-0.5">{plan.sessions}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] py-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Duração</p>
                    <p className="text-[15px] font-bold text-foreground mt-0.5">~{plan.durationMin}min</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] py-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Treinos</p>
                    <p className="text-[15px] font-bold text-foreground mt-0.5">{workoutEntries.length}</p>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-[14px] text-foreground/90 leading-relaxed mb-5">
                  {plan.description}
                </p>

                {/* Orientações */}
                <div className="mb-5">
                  <h3 className="text-[15px] font-bold text-foreground mb-2 inline-flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    Orientações
                  </h3>
                  <ul className="space-y-2">
                    {plan.guidelines.map((g, i) => (
                      <li key={i} className="flex gap-2.5 text-[13px] text-foreground/85 leading-snug">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lista de treinos */}
                <div className="mb-5">
                  <h3 className="text-[15px] font-bold text-foreground mb-2 inline-flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    Treinos do programa
                  </h3>
                  <div className="rounded-2xl bg-white/[0.03] overflow-hidden border border-white/[0.05]">
                    {workoutEntries.map(([wname, exs], idx) => (
                      <button
                        key={wname}
                        onClick={() => {
                          setOpen(false);
                          onStart(wname, exs);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/[0.05] ${
                          idx > 0 ? "border-t border-white/[0.05]" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-foreground truncate">{wname}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exs.length} exercícios · ~{Math.round(exs.length * 7)}min
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editar (Premium) */}
                <button
                  onClick={() => { setOpen(false); onEdit(); }}
                  className="w-full h-11 rounded-full bg-white/[0.06] text-foreground font-semibold text-[14px] inline-flex items-center justify-center gap-2 active:bg-white/[0.1]"
                >
                  {isPremium ? <Pencil className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Duplicar e personalizar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero grande dentro do modal
const PlanCoverHero: React.FC<{ plan: CuratedPlan }> = ({ plan }) => {
  const muscle = plan.mode === "gym" ? "fitness gym training" : "home bodyweight workout";
  const { url } = useCuratedPlanCover(plan.id, plan.coverPrompt, muscle);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {(!url || !loaded) && (
        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/40 animate-pulse" />
      )}
      {url && (
        <img
          src={url}
          alt={plan.name}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </>
  );
};

export default CommunityPlanCard;
