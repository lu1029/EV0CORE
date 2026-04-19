import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Loader2, Calendar, MapPin, Dumbbell } from "lucide-react";

interface RunRow {
  id: string;
  started_at: string;
  distance_km: number;
  duration_seconds: number;
}
interface WorkoutRow {
  id: string;
  title: string;
  type: string;
  completed_at: string | null;
}

export default function Historico() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: r }, { data: w }] = await Promise.all([
        supabase.from("runs").select("id, started_at, distance_km, duration_seconds")
          .eq("user_id", user.id).order("started_at", { ascending: false }).limit(20),
        supabase.from("workouts").select("id, title, type, completed_at")
          .eq("user_id", user.id).eq("completed", true)
          .order("completed_at", { ascending: false }).limit(20),
      ]);
      setRuns(r ?? []);
      setWorkouts(w ?? []);
      setLoading(false);
    })();
  }, [user]);

  const fmtPace = (km: number, s: number) => {
    if (!km) return "—";
    const min = s / 60 / km;
    const m = Math.floor(min);
    const sec = Math.round((min - m) * 60);
    return `${m}:${sec.toString().padStart(2, "0")}/km`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground">Histórico</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Corridas</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma corrida registrada ainda.</p>
        ) : (
          runs.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/corrida/resultado/${r.id}`)}
              className="w-full glass-card rounded-xl p-4 flex items-center justify-between active:scale-[0.99] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{Number(r.distance_km).toFixed(2)} km</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.started_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{fmtPace(Number(r.distance_km), r.duration_seconds)}</span>
            </button>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Treinos concluídos</h2>
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum treino concluído ainda.</p>
        ) : (
          workouts.map((w) => (
            <div key={w.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{w.title}</p>
                <p className="text-xs text-muted-foreground">
                  {w.completed_at ? new Date(w.completed_at).toLocaleDateString("pt-BR") : ""} · {w.type}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
