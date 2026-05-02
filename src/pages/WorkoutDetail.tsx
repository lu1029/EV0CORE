import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Dumbbell, Target, Lock, Play, ImageOff, CheckCircle2 } from "lucide-react";
import { useWorkoutTemplate, type WeekDay } from "@/hooks/useWorkoutTemplates";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useExerciseGif } from "@/hooks/useExerciseGif";
import { useState, useMemo } from "react";
import { useActiveWorkoutPlan } from "@/hooks/useActiveWorkoutPlan";
import { toast } from "sonner";

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading: templateLoading } = useWorkoutTemplate(id);
  const { activePlan, setActiveTemplate, loading: planLoading } = useActiveWorkoutPlan();
  const { profile } = useApp();
  const [selectedDay, setSelectedDay] = useState<WeekDay>(() => {
    const days: WeekDay[] = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    return days[new Date().getDay()];
  });

  const isPremium = !!profile?.is_premium;
  const locked = data?.is_premium && !isPremium;
  const isActive = activePlan?.template_id === id;

  const weekDays: WeekDay[] = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

  const filteredExercises = useMemo(() => {
    if (!data?.items) return [];
    // Se o template tem dias definidos, filtra. Se não, mostra todos (legado).
    const hasDays = data.items.some(it => it.day_of_week);
    if (!hasDays) return data.items;
    return data.items.filter(it => it.day_of_week === selectedDay);
  }, [data, selectedDay]);

  const handleSelectPlan = async () => {
    try {
      if (!id) return;
      await setActiveTemplate(id);
      toast.success("Plano definido como principal!");
    } catch (e) {
      toast.error("Erro ao definir plano");
    }
  };

  const loading = templateLoading || planLoading;

  return (
    <div className="pb-32 max-w-lg mx-auto animate-fade-in">
      <div className="px-5 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary text-[15px] font-medium active:opacity-60 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 -ml-1" /> Voltar
        </button>
      </div>

      {loading ? (
        <div className="px-5 pt-6 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        </div>
      ) : !data ? (
        <p className="px-5 pt-10 text-center text-muted-foreground">Treino não encontrado.</p>
      ) : (
        <>
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground">
                  {data.location_type === "casa" ? "Casa" : "Academia"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                  {data.goal}
                </span>
                {data.is_premium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>
              
              {isActive ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Plano Ativo
                </span>
              ) : (
                <button 
                  onClick={handleSelectPlan}
                  className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider underline underline-offset-4"
                >
                  Usar este plano
                </button>
              )}
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">{data.title}</h1>
            {data.description && <p className="text-[14px] text-muted-foreground mt-2">{data.description}</p>}

            <div className="grid grid-cols-3 gap-2 mt-5 rounded-2xl bg-card border border-border overflow-hidden">
              <Stat icon={Clock} value={`${data.estimated_minutes}`} unit="min" label="Duração" />
              <Stat icon={Dumbbell} value={`${data.items.length}`} unit="" label="Exercícios" border />
              <Stat icon={Target} value={data.level.slice(0, 4)} unit="" label="Nível" border />
            </div>
          </div>

          <div className="px-5 mb-8">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Divisão Semanal
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
              {weekDays.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all border ${
                    selectedDay === day 
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "bg-card border-border/40 text-muted-foreground"
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                Exercícios
              </h2>
              <span className="text-[11px] text-muted-foreground font-medium">
                {filteredExercises.length} exercícios
              </span>
            </div>
            
            <div className={`space-y-2 ${locked ? "blur-md select-none pointer-events-none" : ""}`}>
              {filteredExercises.length === 0 ? (
                <div className="text-center py-10 bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                  <p className="text-sm text-muted-foreground">Dia de descanso ou sem exercícios.</p>
                </div>
              ) : (
                filteredExercises.map((it, i) => (
                  <div key={it.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border">
                    <ExerciseGif url={it.exercise.gif_url} name={it.exercise.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {String(i + 1).padStart(2, "0")} · {it.exercise.body_part ?? ""}
                      </p>
                      <p className="text-[15px] font-semibold text-foreground truncate">{it.exercise.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {it.sets} séries · {it.reps} reps · {it.rest_seconds}s desc.
                      </p>
                      {it.exercise.equipment && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{it.exercise.equipment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-5">
            {locked ? (
              <button
                onClick={() => navigate("/premium")}
                className="w-full h-14 rounded-full bg-foreground text-background font-semibold text-[17px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity shadow-lg"
              >
                <Lock className="w-5 h-5" /> Desbloquear Premium
              </button>
            ) : (
              <button
                onClick={() => navigate(`/workout-session/${data.id}?day=${selectedDay}`)}
                className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-[17px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity shadow-lg"
              >
                <Play className="w-5 h-5 fill-current" /> Iniciar treino
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const Stat = ({ icon: Icon, value, unit, label, border }: any) => (
  <div className={`px-3 py-3 text-center ${border ? "border-l border-border" : ""}`}>
    <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
    <p className="text-[18px] font-bold text-foreground tabular leading-none">
      {value}<span className="text-muted-foreground text-[12px] font-medium ml-0.5">{unit}</span>
    </p>
    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
  </div>
);

const ExerciseGif = ({ url, name }: { url: string | null; name: string }) => {
  const { gifUrl } = useExerciseGif(name, url ?? undefined);
  const finalUrl = gifUrl || url;

  if (!finalUrl) {
    return (
      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <ImageOff className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={finalUrl}
      alt={name}
      loading="lazy"
      className="w-16 h-16 rounded-xl object-cover bg-secondary shrink-0"
    />
  );
};
