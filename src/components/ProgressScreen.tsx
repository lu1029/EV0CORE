import React, { useState } from "react";
import { Camera } from "lucide-react";
import PremiumGate from "@/components/PremiumGate";

const ProgressScreen = () => {
  const [tab, setTab] = useState<"overview" | "body" | "achievements">("overview");

  const badges = [
    { name: "Primeiro treino", earned: true },
    { name: "5 corridas", earned: true },
    { name: "Streak 7 dias", earned: true },
    { name: "10kg progresso", earned: false },
    { name: "Maratonista", earned: false },
    { name: "Mestre nutrição", earned: false },
  ];

  return (
    <div className="pb-28 px-5 pt-8 max-w-lg mx-auto">
      <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em] mb-8 animate-fade-in">Progresso</h1>

      {/* iOS segmented control */}
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

      {tab === "overview" && (
        <div className="animate-fade-in space-y-8">
          {/* Calendar */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Abril</h2>
              <span className="text-[13px] text-primary tabular">82% adesão</span>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 30 }).map((_, i) => {
                  const active = [0, 1, 3, 4, 6, 7, 8, 10, 11, 13, 14].includes(i);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-[11px] tabular ${
                        active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Weekly stats */}
          <section>
            <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Esta semana</h2>
            <div className="bg-card rounded-2xl divide-y divide-border">
              {[
                ["Treinos", "4"],
                ["Corrida", "14.2 km"],
                ["Calorias", "2 340"],
                ["Meta atingida", "85%"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[15px] text-foreground">{k}</span>
                  <span className="text-[15px] text-foreground tabular font-medium">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Performance chart */}
          <PremiumGate feature="análises de evolução">
            <section>
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Evolução de carga</h2>
              <div className="bg-card rounded-2xl p-5">
                <div className="flex items-end gap-2 h-32 mb-3">
                  {[40, 45, 50, 50, 55, 55, 60, 60, 65, 70, 70, 75].map((v, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i === 11 ? "bg-primary" : "bg-secondary"}`}
                      style={{ height: `${(v / 80) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground tabular">
                  <span>Jan</span>
                  <span>Abr</span>
                </div>
                <p className="text-[13px] text-primary mt-3">Supino reto +35 kg desde janeiro</p>
              </div>
            </section>
          </PremiumGate>
        </div>
      )}

      {tab === "body" && (
        <PremiumGate mode="block" feature="acompanhamento corporal">
          <div className="animate-fade-in space-y-8">
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Peso</h2>
                <span className="text-[13px] text-primary tabular">−3.2 kg</span>
              </div>
              <div className="bg-card rounded-2xl p-5">
                <div className="flex items-end gap-1 h-24 mb-3">
                  {[78, 77.5, 77.8, 77.2, 76.8, 76.5, 76.2, 75.8, 75.5, 75.2, 75, 74.8].map((w, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i === 11 ? "bg-primary" : "bg-secondary"}`}
                      style={{ height: `${((w - 73) / 6) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] tabular">
                  <span className="text-muted-foreground">Jan</span>
                  <span className="text-foreground font-medium">74.8 kg</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Medidas</h2>
              <div className="bg-card rounded-2xl divide-y divide-border">
                {[
                  { part: "Peito", current: "98 cm", change: "+2 cm" },
                  { part: "Braço", current: "35 cm", change: "+1.5 cm" },
                  { part: "Cintura", current: "82 cm", change: "−3 cm" },
                  { part: "Coxa", current: "58 cm", change: "+2 cm" },
                ].map((m) => (
                  <div key={m.part} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-[15px] text-foreground">{m.part}</span>
                    <div className="flex items-center gap-3 tabular">
                      <span className="text-[15px] text-foreground font-medium">{m.current}</span>
                      <span className={`text-[12px] ${m.change.startsWith("+") ? "text-primary" : "text-muted-foreground"}`}>
                        {m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Fotos</h2>
                <button className="text-[13px] text-primary flex items-center gap-1 active:opacity-60">
                  <Camera className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-card rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </PremiumGate>
      )}

      {tab === "achievements" && (
        <div className="animate-fade-in space-y-8">
          <section>
            <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Conquistas</h2>
            <div className="bg-card rounded-2xl divide-y divide-border">
              {badges.map((b) => (
                <div key={b.name} className="flex items-center justify-between px-5 py-3.5">
                  <span className={`text-[15px] ${b.earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {b.name}
                  </span>
                  <span className={`text-[12px] tabular ${b.earned ? "text-primary" : "text-muted-foreground/60"}`}>
                    {b.earned ? "Concluído" : "Bloqueado"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-foreground tracking-[-0.02em] mb-4">Metas do mês</h2>
            <div className="bg-card rounded-2xl p-5 space-y-5">
              {[
                { goal: "Treinar 20 dias", progress: 15, target: 20 },
                { goal: "Correr 50 km", progress: 32, target: 50 },
                { goal: "Bater meta calórica 25 dias", progress: 12, target: 25 },
              ].map((g) => (
                <div key={g.goal}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[14px] text-foreground">{g.goal}</span>
                    <span className="text-[12px] text-muted-foreground tabular">{g.progress}/{g.target}</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(g.progress / g.target) * 100}%` }} />
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
