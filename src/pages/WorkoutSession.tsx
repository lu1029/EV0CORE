import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ImageOff, Pause, Play, SkipForward } from "lucide-react";
import { useWorkoutTemplate, type TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface SetState { reps: number; weight: number; done: boolean; }

const haptic = (ms = 10) => { try { (navigator as any).vibrate?.(ms); } catch {} };

export default function WorkoutSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { data, loading } = useWorkoutTemplate(id);

  const isHome = data?.location_type === "casa";
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sets, setSets] = useState<Record<number, SetState[]>>({});
  const [startTime] = useState(Date.now());
  const [restLeft, setRestLeft] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const restRef = useRef<number | null>(null);

  // Init sets when data loads
  useEffect(() => {
    if (!data) return;
    const initial: Record<number, SetState[]> = {};
    data.items.forEach((it, i) => {
      initial[i] = Array.from({ length: it.sets }, () => ({
        reps: parseInt(String(it.reps).split("-")[0]) || 10,
        weight: 0,
        done: false,
      }));
    });
    setSets(initial);
  }, [data]);

  // Rest timer
  useEffect(() => {
    if (!restRunning) { if (restRef.current) clearInterval(restRef.current); return; }
    restRef.current = window.setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) { setRestRunning(false); haptic(40); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restRunning]);

  const current = data?.items[currentIdx];
  const currentSets = sets[currentIdx] ?? [];
  const totalSets = useMemo(() => Object.values(sets).reduce((a, s) => a + s.length, 0), [sets]);
  const doneSets = useMemo(() => Object.values(sets).reduce((a, s) => a + s.filter(x => x.done).length, 0), [sets]);
  const progress = totalSets ? (doneSets / totalSets) * 100 : 0;

  const toggleSet = (setIdx: number) => {
    haptic();
    setSets((prev) => {
      const next = { ...prev };
      const arr = [...(next[currentIdx] ?? [])];
      arr[setIdx] = { ...arr[setIdx], done: !arr[setIdx].done };
      next[currentIdx] = arr;
      // Trigger rest if just completed
      if (arr[setIdx].done && current) {
        setRestLeft(current.rest_seconds);
        setRestRunning(true);
      }
      return next;
    });
  };

  const updateSet = (setIdx: number, field: "reps" | "weight", value: number) => {
    setSets((prev) => {
      const arr = [...(prev[currentIdx] ?? [])];
      arr[setIdx] = { ...arr[setIdx], [field]: value };
      return { ...prev, [currentIdx]: arr };
    });
  };

  const next = () => {
    if (!data) return;
    if (currentIdx < data.items.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setRestRunning(false);
      setRestLeft(0);
    } else {
      finish();
    }
  };

  const finish = async () => {
    if (!data || !user) { navigate("/workouts"); return; }
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const totalVolume = Object.entries(sets).reduce((acc, [, arr]) => {
      return acc + arr.filter(s => s.done).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
    }, 0);

    try {
      const { data: log, error } = await supabase
        .from("user_workout_logs")
        .insert({
          user_id: user.id,
          workout_template_id: data.id,
          started_at: new Date(startTime).toISOString(),
          finished_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          total_volume: totalVolume,
        })
        .select().single();
      if (error) throw error;

      const setRows: any[] = [];
      data.items.forEach((it, i) => {
        (sets[i] ?? []).forEach((s, idx) => {
          setRows.push({
            workout_log_id: log.id,
            exercise_id: it.exercise_id,
            set_number: idx + 1,
            reps: s.reps,
            weight: s.weight,
            completed: s.done,
          });
        });
      });
      if (setRows.length) await supabase.from("user_set_logs").insert(setRows);

      navigate(`/workout-summary/${log.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar treino");
    }
  };

  if (loading || !data || !current) {
    return (
      <div className="px-5 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-lg mx-auto animate-fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="px-5 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-primary active:opacity-60">
            <ChevronLeft className="w-6 h-6 -ml-1" />
          </button>
          <p className="text-[13px] font-semibold text-foreground tabular">
            {currentIdx + 1} / {data.items.length}
          </p>
          <button onClick={finish} className="text-[13px] font-semibold text-muted-foreground active:opacity-60">
            Encerrar
          </button>
        </div>
        <div className="h-[2px] bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* GIF grande */}
        <ExerciseHero ex={current} />

        <div className="mt-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {current.exercise.body_part} {current.exercise.equipment && `· ${current.exercise.equipment}`}
          </p>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight leading-tight mt-1">
            {current.exercise.name}
          </h1>
        </div>

        {/* Sets */}
        <div className="mt-5 rounded-2xl bg-card border border-border overflow-hidden">
          <div className={`grid ${isHome ? "grid-cols-[40px,1fr,40px]" : "grid-cols-[40px,1fr,1fr,40px]"} px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border`}>
            <span>Set</span>
            {!isHome && <span>Kg</span>}
            <span>Reps</span>
            <span></span>
          </div>
          {currentSets.map((s, idx) => (
            <div key={idx} className={`grid ${isHome ? "grid-cols-[40px,1fr,40px]" : "grid-cols-[40px,1fr,1fr,40px]"} items-center px-4 py-3 ${idx > 0 ? "border-t border-border" : ""}`}>
              <span className="text-[15px] font-semibold text-muted-foreground tabular">{idx + 1}</span>
              {!isHome && (
                <input
                  type="number"
                  inputMode="decimal"
                  value={s.weight || ""}
                  onChange={(e) => updateSet(idx, "weight", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-transparent text-[15px] font-semibold text-foreground tabular outline-none w-16"
                />
              )}
              <input
                type="number"
                inputMode="numeric"
                value={s.reps || ""}
                onChange={(e) => updateSet(idx, "reps", parseInt(e.target.value) || 0)}
                placeholder="0"
                className="bg-transparent text-[15px] font-semibold text-foreground tabular outline-none w-16"
              />
              <button
                onClick={() => toggleSet(idx)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  s.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>

        {/* Rest timer */}
        {restLeft > 0 && (
          <div className="mt-4 rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
            <button
              onClick={() => setRestRunning(r => !r)}
              className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              {restRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Descanso</p>
              <p className="text-[24px] font-bold text-foreground tabular leading-none mt-0.5">
                {Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, "0")}
              </p>
            </div>
            <button
              onClick={() => { setRestRunning(false); setRestLeft(0); }}
              className="text-[13px] font-semibold text-muted-foreground"
            >
              Pular
            </button>
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-5">
        <button
          onClick={next}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center gap-2 active:opacity-80 shadow-lg"
        >
          {currentIdx < data.items.length - 1 ? (<><SkipForward className="w-5 h-5" /> Próximo exercício</>) : (<><Check className="w-5 h-5" strokeWidth={3} /> Finalizar treino</>)}
        </button>
      </div>
    </div>
  );
}

const ExerciseHero = ({ ex }: { ex: TemplateExercise }) => {
  if (!ex.exercise.gif_url) {
    return (
      <div className="aspect-square rounded-3xl bg-secondary flex items-center justify-center">
        <ImageOff className="w-10 h-10 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="aspect-square rounded-3xl overflow-hidden bg-secondary">
      <img src={ex.exercise.gif_url} alt={ex.exercise.name} className="w-full h-full object-cover" />
    </div>
  );
};
