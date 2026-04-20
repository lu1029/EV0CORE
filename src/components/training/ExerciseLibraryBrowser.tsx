import React, { useState } from "react";
import { Loader2, X, Search } from "lucide-react";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import ExercisePlaceholder from "./ExercisePlaceholder";

const MUSCLE_GROUPS = [
  { key: "chest",     label: "Peito" },
  { key: "back",      label: "Costas" },
  { key: "shoulders", label: "Ombros" },
  { key: "upper arms", label: "Braços" },
  { key: "upper legs", label: "Pernas" },
  { key: "waist",     label: "Abdômen" },
  { key: "cardio",    label: "Cardio" },
] as const;

type GroupKey = typeof MUSCLE_GROUPS[number]["key"];

const GifThumb = ({ ex }: { ex: LibraryExercise }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!ex.gif_url || error) {
    return (
      <div className="w-full aspect-square">
        <ExercisePlaceholder exerciseName={ex.name} muscleGroup={ex.body_part || ""} />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square overflow-hidden bg-black rounded-xl">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      <img
        src={ex.gif_url}
        alt={ex.name}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

const ExerciseDetailSheet = ({ ex, onClose }: { ex: LibraryExercise; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 max-h-[92vh] bg-background rounded-t-3xl overflow-hidden flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="w-9" />
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 absolute left-1/2 -translate-x-1/2 top-2" />
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:opacity-60"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="bg-black">
            <div className="max-w-md mx-auto">
              <GifThumb ex={ex} />
            </div>
          </div>

          <div className="px-5 pt-6 pb-10 max-w-lg mx-auto">
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
              {ex.body_part || "Exercício"}
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-1">
              {ex.name}
            </h2>

            <div className="grid grid-cols-2 mt-5 rounded-2xl bg-card border border-white/[0.06] overflow-hidden">
              <div className="px-4 py-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Alvo</p>
                <p className="text-[15px] font-semibold text-foreground mt-0.5 capitalize">{ex.target || "—"}</p>
              </div>
              <div className="px-4 py-3 border-l border-white/[0.06]">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Equipamento</p>
                <p className="text-[15px] font-semibold text-foreground mt-0.5 capitalize">{ex.equipment || "—"}</p>
              </div>
            </div>

            {ex.secondary_muscles?.length > 0 && (
              <div className="mt-5">
                <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Músculos secundários
                </p>
                <div className="flex flex-wrap gap-2">
                  {ex.secondary_muscles.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1.5 rounded-full bg-card border border-white/[0.06] text-[13px] text-foreground capitalize"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ex.instructions?.length > 0 && (
              <div className="mt-6">
                <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Como executar
                </p>
                <ol className="space-y-3">
                  {ex.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-[12px] font-bold flex items-center justify-center tabular">
                        {i + 1}
                      </span>
                      <p className="text-[15px] text-foreground/85 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExerciseLibraryBrowser = () => {
  const [group, setGroup] = useState<GroupKey>("chest");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LibraryExercise | null>(null);

  const { items, loading, error } = useExerciseLibrary({
    bodyPart: group,
    search: search.trim() || undefined,
    limit: 24,
  });

  return (
    <div className="animate-fade-in">
      {/* Group selector — horizontal scroll, iOS chip style */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
          {MUSCLE_GROUPS.map((g) => {
            const active = group === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setGroup(g.key)}
                className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-white/[0.06] text-foreground"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-card border border-white/[0.06]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar exercício"
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground active:opacity-60">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">Carregando exercícios…</p>
        </div>
      )}

      {error && !loading && (
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="px-5 py-16 text-center">
          <p className="text-[15px] text-muted-foreground">Nenhum exercício encontrado.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="px-5">
          <div className="grid grid-cols-2 gap-3">
            {items.map((ex, i) => (
              <button
                key={ex.external_id}
                onClick={() => setSelected(ex)}
                className="text-left active:scale-[0.97] transition-transform animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <GifThumb ex={ex} />
                <p className="text-[14px] font-semibold text-foreground mt-2 leading-tight line-clamp-2">
                  {ex.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                  {ex.target || ex.body_part}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && <ExerciseDetailSheet ex={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default ExerciseLibraryBrowser;
