import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Trash2, GripVertical, Check, Search, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useExerciseLibrary } from "@/hooks/useExerciseLibrary";
import { translateExerciseName, translateMuscle } from "@/lib/exerciseTranslations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Exercise } from "./ExerciseCard";
import { fadeUp, stagger, springSnappy } from "@/lib/motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WorkoutBuilderProps {
  mode: "gym" | "home";
  initialPlanName?: string;
  initialWorkouts?: Record<string, Exercise[]>;
  onClose: () => void;
  onSaved: (planName: string, workouts: Record<string, Exercise[]>) => void;
}

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  mode, initialPlanName, initialWorkouts, onClose, onSaved,
}) => {
  const { user } = useApp();
  const { isActive: isPremium } = useSubscription();
  const [planName, setPlanName] = useState(initialPlanName || "Meu plano");
  const [workouts, setWorkouts] = useState<Record<string, Exercise[]>>(
    initialWorkouts || { "Treino A": [] },
  );
  const [activeWorkout, setActiveWorkout] = useState<string>(
    Object.keys(initialWorkouts || { "Treino A": [] })[0],
  );
  const [showLibrary, setShowLibrary] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    items: libraryExercises,
    loading: libLoading,
    loadingMore: libLoadingMore,
    hasMore: libHasMore,
    loadMore: libLoadMore,
  } = useExerciseLibrary({
    search: search || undefined,
    pageSize: 50,
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showLibrary) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && libHasMore && !libLoading && !libLoadingMore) {
          libLoadMore();
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showLibrary, libHasMore, libLoading, libLoadingMore, libLoadMore, libraryExercises.length]);

  if (!isPremium) {
    return (
      <div className="pb-32 max-w-lg mx-auto px-5 pt-6">
        <button onClick={onClose} className="flex items-center gap-1 text-primary text-[15px] font-medium mb-6">
          <ChevronLeft className="w-5 h-5 -ml-1" /> Voltar
        </button>
        <div className="rounded-2xl bg-card border border-white/[0.06] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[22px] font-bold tracking-tight mb-2">Criar treino é Premium</h2>
          <p className="text-[15px] text-muted-foreground mb-6">
            Monte planos do zero, escolha cada exercício, séries e cargas. Disponível no Premium.
          </p>
          <button
            onClick={() => { onClose(); window.location.hash = "#premium"; }}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-[15px]"
          >
            Conhecer Premium
          </button>
        </div>
      </div>
    );
  }

  const addExercise = (libEx: any) => {
    const newEx: Exercise = {
      name: translateExerciseName(libEx.name),
      muscle: translateMuscle(libEx.target || libEx.body_part || ""),
      emoji: "💪",
      sets: 3,
      reps: "10-12",
      weight: mode === "home" ? "Corpo" : "—",
      rest: 60,
      instruction: Array.isArray(libEx.instructions) ? libEx.instructions.join(" ") : "",
      gifUrl: libEx.gif_url || libEx.ai_image_url || undefined,
    };
    setWorkouts({ ...workouts, [activeWorkout]: [...(workouts[activeWorkout] || []), newEx] });
    setShowLibrary(false);
    setSearch("");
  };

  const updateExercise = (idx: number, patch: Partial<Exercise>) => {
    const list = [...(workouts[activeWorkout] || [])];
    list[idx] = { ...list[idx], ...patch };
    setWorkouts({ ...workouts, [activeWorkout]: list });
  };

  const removeExercise = (idx: number) => {
    const list = [...(workouts[activeWorkout] || [])];
    list.splice(idx, 1);
    setWorkouts({ ...workouts, [activeWorkout]: list });
  };

  const reorderExercises = (fromIdx: number, toIdx: number) => {
    const list = workouts[activeWorkout] || [];
    setWorkouts({ ...workouts, [activeWorkout]: arrayMove(list, fromIdx, toIdx) });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = parseInt(String(active.id).replace("ex-", ""), 10);
    const to = parseInt(String(over.id).replace("ex-", ""), 10);
    if (Number.isFinite(from) && Number.isFinite(to)) reorderExercises(from, to);
  };

  const addWorkoutDay = () => {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const next = letters[Object.keys(workouts).length] || `${Object.keys(workouts).length + 1}`;
    const newName = `Treino ${next}`;
    setWorkouts({ ...workouts, [newName]: [] });
    setActiveWorkout(newName);
  };

  const removeWorkoutDay = (name: string) => {
    if (Object.keys(workouts).length === 1) return;
    const next = { ...workouts };
    delete next[name];
    setWorkouts(next);
    setActiveWorkout(Object.keys(next)[0]);
  };

  const handleSave = async () => {
    if (!user) return;
    if (Object.values(workouts).every((list) => list.length === 0)) {
      toast.error("Adicione ao menos um exercício");
      return;
    }
    setSaving(true);
    try {
      const planData = { planName, description: "Plano personalizado", workouts } as any;
      // Upsert: replace user's plan of this type
      const { data: existing } = await supabase
        .from("generated_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", mode)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("generated_plans").update({
          plan_name: planName, description: "Plano personalizado", plan_data: planData,
        }).eq("id", existing.id);
      } else {
        await supabase.from("generated_plans").insert({
          user_id: user.id, type: mode, plan_name: planName,
          description: "Plano personalizado", plan_data: planData,
        } as any);
      }
      toast.success("Plano salvo!");
      onSaved(planName, workouts);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const currentList = workouts[activeWorkout] || [];

  return (
    <motion.div className="pb-32 max-w-lg mx-auto" variants={stagger} initial="hidden" animate="visible">
      <div className="px-5 pt-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1 text-primary text-[15px] font-medium">
          <ChevronLeft className="w-5 h-5 -ml-1" /> Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary text-[15px] font-semibold disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>

      <motion.div variants={fadeUp} className="px-5 pt-4">
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="w-full bg-transparent text-[28px] font-bold tracking-tight text-foreground outline-none border-b border-white/[0.08] pb-2"
          placeholder="Nome do plano"
        />
      </motion.div>

      {/* Workout day tabs */}
      <motion.div variants={fadeUp} className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {Object.keys(workouts).map((name) => (
            <button
              key={name}
              onClick={() => setActiveWorkout(name)}
              className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-colors ${
                activeWorkout === name ? "bg-primary text-primary-foreground" : "bg-white/[0.06] text-muted-foreground"
              }`}
            >
              {name}
              {activeWorkout === name && Object.keys(workouts).length > 1 && (
                <X className="w-3 h-3 inline ml-2" onClick={(e) => { e.stopPropagation(); removeWorkoutDay(name); }} />
              )}
            </button>
          ))}
          <button
            onClick={addWorkoutDay}
            className="shrink-0 w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-muted-foreground"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Exercise list */}
      <div className="px-5 mt-4">
        {currentList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-8 text-center">
            <p className="text-[15px] text-muted-foreground mb-4">Nenhum exercício ainda</p>
            <button
              onClick={() => setShowLibrary(true)}
              className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar exercício
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={currentList.map((_, i) => `ex-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {currentList.map((ex, idx) => (
                  <SortableExerciseEditor
                    key={`ex-${idx}`}
                    id={`ex-${idx}`}
                    exercise={ex}
                    onChange={(patch) => updateExercise(idx, patch)}
                    onRemove={() => removeExercise(idx)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <button
              onClick={() => setShowLibrary(true)}
              className="w-full h-12 rounded-2xl border border-dashed border-white/[0.12] text-[14px] font-medium text-muted-foreground inline-flex items-center justify-center gap-2 active:opacity-60"
            >
              <Plus className="w-4 h-4" /> Adicionar exercício
            </button>
          </div>
        )}
      </div>

      {/* Library overlay */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="max-w-lg mx-auto h-full flex flex-col">
              <div className="px-5 pt-4 pb-2 flex items-center gap-3">
                <button onClick={() => { setShowLibrary(false); setSearch(""); }} className="text-primary">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar exercício…"
                    className="w-full h-10 pl-9 pr-3 rounded-full bg-white/[0.06] text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-8">
                {libLoading ? (
                  <p className="text-center text-muted-foreground py-8">Buscando…</p>
                ) : libraryExercises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum resultado</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {libraryExercises.map((libEx) => (
                      <button
                        key={libEx.external_id}
                        onClick={() => addExercise(libEx)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-white/[0.06] text-left active:opacity-70"
                      >
                        {libEx.gif_url && (
                          <img src={libEx.gif_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-black" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold truncate">{translateExerciseName(libEx.name)}</p>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {translateMuscle(libEx.target || libEx.body_part || "")}
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-primary shrink-0" />
                      </button>
                    ))}
                    <div ref={sentinelRef} className="h-6" />
                    {libLoadingMore && (
                      <p className="text-center text-muted-foreground py-4 text-[13px]">Carregando mais…</p>
                    )}
                    {!libHasMore && libraryExercises.length > 0 && (
                      <p className="text-center text-muted-foreground/60 py-4 text-[12px]">
                        {libraryExercises.length} exercícios
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SortableExerciseEditor: React.FC<{
  id: string;
  exercise: Exercise;
  onChange: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
}> = ({ id, exercise, onChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : ("auto" as any),
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "shadow-2xl shadow-black/40 rounded-2xl" : ""}>
      <ExerciseEditor
        exercise={exercise}
        onChange={onChange}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const ExerciseEditor: React.FC<{
  exercise: Exercise;
  onChange: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
  dragHandleProps?: Record<string, any>;
}> = ({ exercise, onChange, onRemove, dragHandleProps }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
      <div className="w-full flex items-center gap-2 p-3">
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            aria-label="Arrastar para reordenar"
            className="p-1.5 -ml-1 text-muted-foreground touch-none cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 text-left active:opacity-70 min-w-0"
        >
          {exercise.gifUrl ? (
            <img src={exercise.gifUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-black shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center text-xl shrink-0">
              {exercise.emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate">{exercise.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {exercise.sets}× {exercise.reps} · {exercise.rest}s
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 text-muted-foreground"
          aria-label="Remover exercício"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
          <Field label="Séries" value={String(exercise.sets)} onChange={(v) => onChange({ sets: parseInt(v) || 1 })} type="number" />
          <Field label="Reps" value={exercise.reps} onChange={(v) => onChange({ reps: v })} />
          <Field label="Carga" value={exercise.weight} onChange={(v) => onChange({ weight: v })} />
          <Field label="Descanso (s)" value={String(exercise.rest)} onChange={(v) => onChange({ rest: parseInt(v) || 30 })} type="number" />
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type }) => (
  <label className="block">
    <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
    <input
      type={type || "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2 rounded-lg bg-white/[0.06] text-[13px] text-foreground outline-none focus:bg-white/[0.1]"
    />
  </label>
);

export default WorkoutBuilder;
