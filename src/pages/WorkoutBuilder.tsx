import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import { isHomeFriendly, translateEquipment, translateExerciseName, translateMuscle } from "@/lib/exerciseTranslations";

interface PickedEx { ex: LibraryExercise; sets: number; reps: string; rest_seconds: number; }

const GOALS = ["hipertrofia", "emagrecimento", "forca", "condicionamento"] as const;
const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
const LOCS = ["casa", "academia"] as const;

export default function WorkoutBuilderPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState<typeof GOALS[number]>("hipertrofia");
  const [level, setLevel] = useState<typeof LEVELS[number]>("iniciante");
  const [location, setLocation] = useState<typeof LOCS[number]>("casa");
  const [picked, setPicked] = useState<PickedEx[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    items: library,
    loading: isLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = useExerciseLibrary({
    search: search.trim() || undefined,
    pageSize: 60,
    enabled: showPicker,
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showPicker) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading && !loadingMore) loadMore();
      },
      { rootMargin: "350px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showPicker, hasMore, isLoading, loadingMore, loadMore, library.length]);

  const filtered = useMemo(() => {
    return library.filter((e) => location !== "casa" || isHomeFriendly(e.equipment));
  }, [library, location]);

  const addEx = (ex: LibraryExercise) => {
    setPicked((p) => [...p, { ex, sets: 3, reps: "10-12", rest_seconds: 60 }]);
    setShowPicker(false);
    setSearch("");
  };

  const removeEx = (idx: number) => setPicked((p) => p.filter((_, i) => i !== idx));
  const updateField = (idx: number, field: keyof PickedEx, value: any) =>
    setPicked((p) => p.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const save = async () => {
    if (!user) return;
    if (!title.trim()) return toast.error("Dê um nome ao treino");
    if (picked.length === 0) return toast.error("Adicione pelo menos 1 exercício");
    setSaving(true);
    try {
      const { data: tpl, error: e1 } = await supabase
        .from("workout_templates")
        .insert({
          title: title.trim(),
          description: "Treino personalizado",
          goal, level, location_type: location,
          estimated_minutes: Math.max(15, picked.length * 8),
          cover_url: picked.find((p) => p.ex.gif_url)?.ex.gif_url ?? null,
          is_premium: false,
          user_id: user.id,
        })
        .select().single();
      if (e1) throw e1;
      const items = picked.map((p, i) => ({
        workout_template_id: tpl.id,
        exercise_id: p.ex.id,
        order_index: i,
        sets: p.sets,
        reps: p.reps,
        rest_seconds: p.rest_seconds,
      }));
      const { error: e2 } = await supabase.from("workout_template_items").insert(items);
      if (e2) throw e2;
      toast.success("Treino criado!");
      navigate(`/workout/${tpl.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar treino");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-32 max-w-lg mx-auto animate-fade-in">
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-primary"><ChevronLeft className="w-6 h-6 -ml-1" /></button>
        <p className="text-[15px] font-semibold">Novo treino</p>
        <button
          onClick={save}
          disabled={saving}
          className="text-[14px] font-semibold text-primary disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do treino"
          className="w-full text-[24px] font-bold bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <Select label="Local" value={location} onChange={(v) => setLocation(v as any)} options={[["casa", "Em Casa"], ["academia", "Academia"]]} />
          <Select label="Objetivo" value={goal} onChange={(v) => setGoal(v as any)} options={GOALS.map(g => [g, g.charAt(0).toUpperCase() + g.slice(1)] as [string, string])} />
          <Select label="Nível" value={level} onChange={(v) => setLevel(v as any)} options={[["iniciante", "Iniciante"], ["intermediario", "Intermediário"], ["avancado", "Avançado"]]} />
        </div>

        <div className="pt-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Exercícios ({picked.length})</p>
          <div className="space-y-2">
            {picked.map((p, idx) => (
              <div key={idx} className="rounded-2xl bg-card border border-border p-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                  {p.ex.gif_url && <img src={p.ex.gif_url} alt={p.ex.name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{translateExerciseName(p.ex.name)}</p>
                  <div className="flex gap-2 mt-1">
                    <NumInput value={p.sets} onChange={(v) => updateField(idx, "sets", v)} suffix="s" />
                    <input
                      value={p.reps}
                      onChange={(e) => updateField(idx, "reps", e.target.value)}
                      className="w-16 h-7 px-2 rounded-md bg-secondary text-[12px] text-center outline-none"
                    />
                    <NumInput value={p.rest_seconds} onChange={(v) => updateField(idx, "rest_seconds", v)} suffix="s" step={15} />
                  </div>
                </div>
                <button onClick={() => removeEx(idx)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowPicker(true)}
            className="mt-3 w-full h-12 rounded-2xl border-2 border-dashed border-border text-[14px] font-semibold text-muted-foreground flex items-center justify-center gap-2 active:opacity-60"
          >
            <Plus className="w-4 h-4" /> Adicionar exercício
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowPicker(false)}><X className="w-6 h-6 text-foreground" /></button>
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar exercício..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[14px] outline-none"
              />
            </div>
          </div>
          <div className="max-w-lg mx-auto p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 70px)" }}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum exercício encontrado</p>
            ) : (
              <>
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addEx(ex)}
                  className="w-full flex gap-3 items-center p-3 rounded-2xl bg-card border border-border active:scale-[0.99] text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {ex.gif_url && <img src={ex.gif_url} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{translateExerciseName(ex.name)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {translateMuscle(ex.body_part)} · {translateEquipment(ex.equipment)}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              ))}
              <div ref={sentinelRef} className="h-8" />
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[12px]">Carregando mais exercícios…</span>
                </div>
              )}
              {!hasMore && filtered.length > 0 && (
                <p className="text-center text-[11px] text-muted-foreground py-4">{filtered.length} exercícios disponíveis</p>
              )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) => (
  <label className="block">
    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-xl bg-secondary text-[14px] font-medium outline-none">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </label>
);

const NumInput = ({ value, onChange, suffix, step = 1 }: { value: number; onChange: (v: number) => void; suffix?: string; step?: number }) => (
  <div className="flex items-center h-7 rounded-md bg-secondary px-2 gap-1">
    <button onClick={() => onChange(Math.max(1, value - step))} className="text-muted-foreground text-[13px]">−</button>
    <span className="text-[12px] font-semibold tabular w-8 text-center">{value}{suffix}</span>
    <button onClick={() => onChange(value + step)} className="text-muted-foreground text-[13px]">+</button>
  </div>
);
