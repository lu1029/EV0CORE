import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Clock, Dumbbell, TrendingUp, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Summary {
  id: string;
  duration_seconds: number;
  total_volume: number;
  finished_at: string | null;
  workout_template_id: string | null;
  title?: string;
  exercisesCount: number;
  setsCount: number;
}

const MOTIVATIONAL = [
  "Mais um passo rumo à sua melhor versão.",
  "Consistência é o caminho. Continue assim!",
  "Treino concluído. Seu eu de amanhã agradece.",
  "Forte hoje, mais forte amanhã.",
  "Você apareceu. Isso é o que importa.",
];

export default function WorkoutSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [phrase] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: log } = await supabase.from("user_workout_logs").select("*").eq("id", id).maybeSingle();
      if (!log) { setLoading(false); return; }
      const { data: setRows } = await supabase
        .from("user_set_logs").select("exercise_id").eq("workout_log_id", id);
      const exercises = new Set((setRows ?? []).map((r: any) => r.exercise_id));
      let title: string | undefined;
      if (log.workout_template_id) {
        const { data: tpl } = await supabase
          .from("workout_templates").select("title").eq("id", log.workout_template_id).maybeSingle();
        title = tpl?.title;
      }
      setData({
        ...(log as any),
        title,
        exercisesCount: exercises.size,
        setsCount: setRows?.length ?? 0,
      });
      setLoading(false);
    })();
  }, [id]);

  const share = async () => {
    if (!data) return;
    const text = `Acabei de treinar no EvoCore 💪 ${formatTime(data.duration_seconds)} · ${data.exercisesCount} exercícios · ${Math.round(data.total_volume)}kg`;
    try {
      if (navigator.share) await navigator.share({ text, title: "Treino EvoCore" });
      else { await navigator.clipboard.writeText(text); toast.success("Copiado!"); }
    } catch {}
  };

  if (loading) {
    return (
      <div className="px-5 pt-10 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }
  if (!data) return <p className="px-5 pt-10 text-center text-muted-foreground">Resumo não encontrado.</p>;

  return (
    <div className="pb-32 max-w-lg mx-auto min-h-[80vh] flex flex-col animate-fade-in">
      <div className="px-5 pt-12 flex-1 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 animate-scale-in">
          <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
        </div>
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Concluído</p>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground mt-1">{data.title ?? "Treino"}</h1>
        <p className="text-[14px] text-muted-foreground mt-3 max-w-xs">{phrase}</p>

        <div className="w-full max-w-sm grid grid-cols-3 mt-8 rounded-2xl bg-card border border-border overflow-hidden">
          <SummaryStat icon={Clock} value={formatTime(data.duration_seconds)} label="Tempo" />
          <SummaryStat icon={Dumbbell} value={`${data.exercisesCount}`} label="Exercícios" border />
          <SummaryStat icon={TrendingUp} value={`${Math.round(data.total_volume)}`} unit="kg" label="Volume" border />
        </div>

        <div className="w-full max-w-sm mt-3 rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Séries totais</p>
          <p className="text-[28px] font-bold text-foreground tabular mt-1">{data.setsCount}</p>
        </div>
      </div>

      <div className="px-5 space-y-2">
        <button
          onClick={share}
          className="w-full h-12 rounded-full bg-secondary text-foreground font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-70"
        >
          <Share2 className="w-4 h-4" /> Compartilhar progresso
        </button>
        <button
          onClick={() => navigate("/workouts")}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] active:opacity-80"
        >
          Concluído
        </button>
      </div>
    </div>
  );
}

const SummaryStat = ({ icon: Icon, value, unit, label, border }: any) => (
  <div className={`px-2 py-4 ${border ? "border-l border-border" : ""}`}>
    <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
    <p className="text-[20px] font-bold text-foreground tabular leading-none">
      {value}{unit && <span className="text-muted-foreground text-[12px] font-medium ml-0.5">{unit}</span>}
    </p>
    <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{label}</p>
  </div>
);

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};
