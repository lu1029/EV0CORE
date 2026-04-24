import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Dumbbell, Lock, Clock, Flame, Target, Activity, Zap } from "lucide-react";
import { useWorkoutTemplates, type LocationType, type Goal } from "@/hooks/useWorkoutTemplates";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

const GOALS: { value: Goal; label: string; icon: typeof Target }[] = [
  { value: "hipertrofia", label: "Hipertrofia", icon: Dumbbell },
  { value: "emagrecimento", label: "Emagrecimento", icon: Flame },
  { value: "forca", label: "Força", icon: Zap },
  { value: "condicionamento", label: "Condicionamento", icon: Activity },
];

const LEVEL_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export default function Workouts() {
  const [tab, setTab] = useState<LocationType>("casa");
  const [goal, setGoal] = useState<Goal | undefined>(undefined);
  const { items, loading } = useWorkoutTemplates(tab, goal);
  const { profile } = useApp();
  const navigate = useNavigate();
  const isPremium = !!profile?.is_premium;

  return (
    <div className="px-4 pt-4 pb-32 max-w-lg mx-auto animate-fade-in">
      <header className="px-1 pb-4">
        <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">Treinos</p>
        <h1 className="text-[34px] font-bold tracking-tight text-foreground mt-1 leading-tight">
          Escolha seu treino
        </h1>
      </header>

      {/* Tabs Casa/Academia */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary/60 mb-5">
        {([
          { v: "casa" as const, l: "Em Casa", Icon: Home },
          { v: "academia" as const, l: "Academia", Icon: Dumbbell },
        ]).map(({ v, l, Icon }) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`h-11 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold transition-all ${
              tab === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" /> {l}
          </button>
        ))}
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setGoal(undefined)}
          className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium transition-colors ${
            !goal ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          Todos
        </button>
        {GOALS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setGoal(value)}
            className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
              goal === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3 mt-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : items.length === 0 ? (
          <EmptyState locationType={tab} />
        ) : (
          items.map((t) => {
            const locked = t.is_premium && !isPremium;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/workout/${t.id}`)}
                className="w-full text-left rounded-2xl bg-card border border-border overflow-hidden active:scale-[0.99] transition-transform"
              >
                <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-end p-4">
                  {locked && (
                    <div className="absolute inset-0 backdrop-blur-md bg-background/40 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/90 text-background text-[12px] font-semibold">
                        <Lock className="w-3.5 h-3.5" /> Premium
                      </div>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground/10 text-foreground backdrop-blur-md">
                      {t.location_type === "casa" ? "Casa" : "Academia"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary backdrop-blur-md">
                      {t.goal}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-[17px] font-bold text-foreground leading-tight">{t.title}</h3>
                  {t.description && (
                    <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.estimated_minutes} min</span>
                    <span>·</span>
                    <span>{LEVEL_LABEL[t.level]}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ locationType }: { locationType: LocationType }) => (
  <div className="text-center py-16 px-6">
    <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-4">
      {locationType === "casa" ? <Home className="w-7 h-7 text-muted-foreground" /> : <Dumbbell className="w-7 h-7 text-muted-foreground" />}
    </div>
    <h3 className="text-[17px] font-semibold text-foreground">Em breve</h3>
    <p className="text-[14px] text-muted-foreground mt-1">
      Estamos preparando treinos {locationType === "casa" ? "para casa" : "para academia"} para você.
    </p>
  </div>
);
