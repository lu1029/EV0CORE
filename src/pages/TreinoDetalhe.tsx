import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Dumbbell, Clock, Flame } from "lucide-react";

interface Workout {
  id: string;
  title: string;
  type: string;
  muscle_group: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
  completed: boolean;
}
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number | null;
  weight_kg: number | null;
  notes: string | null;
}

export default function TreinoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: w }, { data: ex }] = await Promise.all([
        supabase.from("workouts").select("*").eq("id", id).maybeSingle(),
        supabase.from("workout_exercises").select("*").eq("workout_id", id).order("sort_order"),
      ]);
      setWorkout(w as Workout | null);
      setExercises((ex ?? []) as Exercise[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!workout) return (
    <div className="px-4 py-10 text-center space-y-4">
      <p className="text-muted-foreground">Treino não encontrado.</p>
      <button onClick={() => navigate("/treinos")} className="text-primary underline">Voltar</button>
    </div>
  );

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{workout.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-primary/15 text-primary">{workout.type}</span>
          {workout.muscle_group && <span className="px-2 py-1 rounded-full bg-accent/15 text-accent">{workout.muscle_group}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4">
          <Clock className="w-4 h-4 text-muted-foreground mb-1" />
          <p className="text-lg font-bold text-foreground">{workout.duration_minutes ?? "—"} min</p>
          <p className="text-xs text-muted-foreground">Duração</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <Flame className="w-4 h-4 text-muted-foreground mb-1" />
          <p className="text-lg font-bold text-foreground">{workout.calories_burned ?? "—"} kcal</p>
          <p className="text-xs text-muted-foreground">Calorias</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exercícios</h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum exercício cadastrado.</p>
        ) : exercises.map((e) => (
          <div key={e.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{e.name}</p>
              <p className="text-xs text-muted-foreground">
                {e.sets}x{e.reps}{e.weight_kg ? ` · ${e.weight_kg}kg` : ""}{e.rest_seconds ? ` · ${e.rest_seconds}s desc.` : ""}
              </p>
            </div>
          </div>
        ))}
      </section>

      {workout.notes && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notas</h2>
          <p className="glass-card rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap">{workout.notes}</p>
        </section>
      )}
    </div>
  );
}
