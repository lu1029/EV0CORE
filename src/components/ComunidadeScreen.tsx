import { useState } from "react";
import { Loader2, Plus, Trophy } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { useRanking, type RankingMetric, type RankingPeriod } from "@/hooks/useRanking";
import FeedPostCard from "@/components/social/FeedPostCard";
import FeedComposer from "@/components/social/FeedComposer";
import Stories from "@/components/social/Stories";

const TABS = [
  { value: "feed", label: "Feed" },
  { value: "ranking", label: "Ranking" },
] as const;

const METRICS: { value: RankingMetric; label: string; unit?: string }[] = [
  { value: "workouts", label: "Treinos" },
  { value: "runs", label: "Corridas" },
  { value: "distance", label: "Distância", unit: "km" },
  { value: "calories", label: "Calorias", unit: "kcal" },
  { value: "streak", label: "Consistência" },
];
const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "all", label: "Geral" },
];

export default function ComunidadeScreen() {
  const [tab, setTab] = useState<"feed" | "ranking">("feed");
  const [composer, setComposer] = useState(false);
  const { posts, loading, toggleLike, toggleSave } = useFeed();
  const [metric, setMetric] = useState<RankingMetric>("workouts");
  const [period, setPeriod] = useState<RankingPeriod>("week");
  const { rows, loading: rankingLoading } = useRanking(metric, period);
  const unit = METRICS.find(m => m.value === metric)?.unit;

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Comunidade</h1>
          <p className="text-sm text-muted-foreground">Compartilhe sua jornada</p>
        </div>
        <button
          onClick={() => setComposer(true)}
          className="h-10 px-4 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Postar
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-secondary/50 p-1 rounded-full flex mb-4">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`flex-1 h-10 rounded-full text-sm font-bold transition ${tab === t.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <div className="space-y-6">
          <Stories />
          {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <EmptyFeed onCreate={() => setComposer(true)} />
        ) : (
          <div className="space-y-4">
            {posts.map(p => <FeedPostCard key={p.id} post={p} onLike={toggleLike} onSave={toggleSave} />)}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 scrollbar-hide">
            {METRICS.map(m => (
              <button key={m.value} onClick={() => setMetric(m.value)}
                className={`shrink-0 px-3 h-9 rounded-full text-xs font-bold border ${metric === m.value ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="bg-secondary/50 p-1 rounded-full flex">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`flex-1 h-9 rounded-full text-xs font-bold transition ${period === p.value ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {rankingLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Sem dados ainda neste período.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={r.user_id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border ${
                    i === 0 ? "bg-gradient-to-r from-yellow-500/15 to-transparent border-yellow-500/30" :
                    i === 1 ? "bg-gradient-to-r from-slate-400/15 to-transparent border-slate-400/30" :
                    i === 2 ? "bg-gradient-to-r from-orange-500/15 to-transparent border-orange-500/30" :
                    "bg-card border-border"
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-yellow-500 text-black" :
                    i === 1 ? "bg-slate-400 text-black" :
                    i === 2 ? "bg-orange-500 text-black" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-sm font-bold">{r.name[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-lg leading-none">{Math.round(r.score)}</p>
                    {unit && <p className="text-[10px] text-muted-foreground uppercase">{unit}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <FeedComposer open={composer} onClose={() => setComposer(false)} />
    </div>
  );
}

function EmptyFeed({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <p className="font-bold">Feed vazio</p>
      <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar sua jornada</p>
      <button onClick={onCreate} className="mt-3 h-11 px-6 rounded-full gradient-primary text-primary-foreground font-bold">
        Criar primeiro post
      </button>
    </div>
  );
}
