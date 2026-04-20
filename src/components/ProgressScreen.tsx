import React, { useState } from "react";
import { Camera, TrendingUp, Activity, Award } from "lucide-react";
import PremiumGate from "@/components/PremiumGate";
import { useProgress } from "@/hooks/useProgress";
import { useAchievements } from "@/hooks/useAchievements";

const ProgressScreen = () => {
  const [tab, setTab] = useState<"overview" | "body" | "achievements">("overview");
  const data = useProgress();
  const { achievements, unlockedCount, totalCount } = useAchievements();

  const EmptyState = ({ icon: Icon, title, hint }: { icon: typeof Activity; title: string; hint: string }) => (
    <div className="bg-card rounded-2xl py-10 px-5 flex flex-col items-center text-center animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-[15px] font-medium text-foreground mb-1">{title}</p>
      <p className="text-[13px] text-muted-foreground max-w-[260px] leading-relaxed">{hint}</p>
    </div>
  );

  return (
    <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
      <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em] mb-8 animate-fade-in">Progresso</h1>

      <div className="flex bg-secondary rounded-xl p-1 mb-8 animate-fade-in">
        {[
          { id: "overview" as const, label: "Geral" },
          { id: "body" as const, label: "Corporal" },
          { id: "achievements" as const, label: "Conquistas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {data.loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!data.loading && tab === "overview" && (
        <div className="animate-fade-in space-y-8">
          {/* Calendar */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] capitalize">{data.monthName}</h2>
              <span className="text-[13px] text-primary tabular">{data.monthAdherence}% adesão</span>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: data.monthTotal }).map((_, i) => {
                  const day = i + 1;
                  const active = data.monthDays.includes(day);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-[11px] tabular transition-colors ${
                        active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground bg-secondary/30"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Weekly stats */}
          <section>
            <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Esta semana</h2>
            {data.weekWorkouts === 0 && data.weekDistanceKm === 0 && data.weekCalories === 0 ? (
              <EmptyState
                icon={Activity}
                title="Nada por aqui ainda"
                hint="Complete um treino, corrida ou registre uma refeição para ver suas estatísticas."
              />
            ) : (
              <div className="bg-card rounded-2xl divide-y divide-border">
                {[
                  ["Treinos", data.weekWorkouts.toString()],
                  ["Corrida", `${data.weekDistanceKm} km`],
                  ["Calorias", data.weekCalories.toLocaleString("pt-BR")],
                  ["Meta atingida", `${data.weekGoalReached}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-[15px] text-foreground">{k}</span>
                    <span className="text-[15px] text-foreground tabular font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Performance — premium gate */}
          <PremiumGate feature="análises de evolução">
            <section>
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Evolução</h2>
              {data.monthDays.length < 4 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Continue treinando"
                  hint="Em breve mostraremos sua evolução de carga aqui — registre alguns treinos primeiro."
                />
              ) : (
                <div className="bg-card rounded-2xl p-5">
                  <p className="text-[13px] text-muted-foreground">
                    Você treinou <span className="text-foreground font-semibold">{data.monthDays.length} dias</span> em {data.monthName}.
                  </p>
                </div>
              )}
            </section>
          </PremiumGate>
        </div>
      )}

      {!data.loading && tab === "body" && (
        <PremiumGate mode="block" feature="acompanhamento corporal">
          <div className="animate-fade-in space-y-8">
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Peso</h2>
                {data.weightHistory.length >= 2 && (
                  <span className={`text-[13px] tabular ${data.weightDelta < 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {data.weightDelta > 0 ? "+" : ""}{data.weightDelta} kg
                  </span>
                )}
              </div>
              {data.weightHistory.length === 0 ? (
                <EmptyState icon={TrendingUp} title="Sem registros de peso" hint="Adicione seu peso periodicamente para ver a evolução." />
              ) : (
                <div className="bg-card rounded-2xl p-5">
                  <p className="text-[28px] font-bold text-foreground tabular">
                    {data.weightHistory[data.weightHistory.length - 1].kg} kg
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1">Último registro</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Medidas</h2>
              {!data.measurements.peito && !data.measurements.braco && !data.measurements.cintura && !data.measurements.coxa ? (
                <EmptyState icon={Activity} title="Sem medidas registradas" hint="Em breve você poderá registrar e acompanhar suas medidas corporais." />
              ) : (
                <div className="bg-card rounded-2xl divide-y divide-border">
                  {[
                    ["Peito", data.measurements.peito],
                    ["Braço", data.measurements.braco],
                    ["Cintura", data.measurements.cintura],
                    ["Coxa", data.measurements.coxa],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k as string} className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-[15px] text-foreground">{k}</span>
                      <span className="text-[15px] text-foreground font-medium tabular">{v} cm</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </PremiumGate>
      )}

      {!data.loading && tab === "achievements" && (
        <div className="animate-fade-in space-y-8">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Conquistas</h2>
              <span className="text-[13px] text-muted-foreground tabular">{unlockedCount}/{totalCount}</span>
            </div>
            {achievements.length === 0 ? (
              <EmptyState icon={Award} title="Nenhuma conquista ainda" hint="Treine, corra e mantenha sua sequência para desbloquear conquistas." />
            ) : (
              <div className="bg-card rounded-2xl divide-y divide-border">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                    <span className={`text-[15px] ${a.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.name}</span>
                    <span className={`text-[12px] tabular ${a.unlocked ? "text-primary" : "text-muted-foreground/60"}`}>
                      {a.unlocked ? "Concluído" : "Bloqueado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Metas do mês</h2>
            <div className="bg-card rounded-2xl p-5 space-y-5">
              {data.monthlyGoals.map((g) => (
                <div key={g.id}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[14px] text-foreground">{g.goal}</span>
                    <span className="text-[12px] text-muted-foreground tabular">{g.progress}/{g.target}</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (g.progress / g.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;
