import React, { useState } from "react";
import { TrendingUp, Trophy, Calendar, Target, Award, Flame, Dumbbell, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProgressScreen = () => {
  const [tab, setTab] = useState<"overview" | "body" | "achievements">("overview");

  const badges = [
    { name: "Primeiro treino", icon: "🏋️", earned: true },
    { name: "5 corridas", icon: "🏃", earned: true },
    { name: "Streak 7 dias", icon: "🔥", earned: true },
    { name: "10kg progresso", icon: "💪", earned: false },
    { name: "Maratonista", icon: "🏅", earned: false },
    { name: "Mestre nutrição", icon: "🥗", earned: false },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Progresso</h1>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1 mb-6">
        {[
          { id: "overview" as const, label: "Geral" },
          { id: "body" as const, label: "Corporal" },
          { id: "achievements" as const, label: "Conquistas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="animate-fade-in space-y-4">
          {/* Consistency calendar */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Abril 2026</h3>
              <span className="text-xs text-primary font-medium">82% adesão</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => {
                const active = [0, 1, 3, 4, 6, 7, 8, 10, 11, 13, 14].includes(i);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                      active ? "gradient-primary text-primary-foreground font-bold" : i < 15 ? "bg-secondary text-muted-foreground" : "bg-secondary/50 text-muted-foreground/50"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly summary */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Resumo semanal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-xl p-3 flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">4</p>
                  <p className="text-[10px] text-muted-foreground">Treinos</p>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-3 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">14.2km</p>
                  <p className="text-[10px] text-muted-foreground">Corrida</p>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-3 flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">2,340</p>
                  <p className="text-[10px] text-muted-foreground">Calorias</p>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-3 flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">85%</p>
                  <p className="text-[10px] text-muted-foreground">Meta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance chart */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Evolução de carga</h3>
            <div className="flex items-end gap-2 h-32">
              {[40, 45, 50, 50, 55, 55, 60, 60, 65, 70, 70, 75].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm ${i === 11 ? "gradient-primary" : "bg-secondary"}`}
                    style={{ height: `${(v / 80) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">Jan</span>
              <span className="text-[10px] text-muted-foreground">Abr</span>
            </div>
            <p className="text-xs text-primary mt-2">Supino reto: +35kg desde janeiro 📈</p>
          </div>

          {/* Streak */}
          <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
              <Flame className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-heading">12 dias</p>
              <p className="text-xs text-muted-foreground">Streak de treino 🔥</p>
            </div>
          </div>
        </div>
      )}

      {tab === "body" && (
        <div className="animate-fade-in space-y-4">
          {/* Weight chart */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Peso corporal</h3>
              <span className="text-xs text-primary">-3.2 kg</span>
            </div>
            <div className="flex items-end gap-1 h-24 mb-2">
              {[78, 77.5, 77.8, 77.2, 76.8, 76.5, 76.2, 75.8, 75.5, 75.2, 75, 74.8].map((w, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={`w-full rounded-sm ${i === 11 ? "gradient-primary" : "bg-secondary"}`}
                    style={{ height: `${((w - 73) / 6) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground">Jan</span>
              <span className="text-[10px] text-primary font-medium">74.8 kg</span>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Medidas</h3>
            <div className="space-y-3">
              {[
                { part: "Peito", current: "98cm", change: "+2cm" },
                { part: "Braço", current: "35cm", change: "+1.5cm" },
                { part: "Cintura", current: "82cm", change: "-3cm" },
                { part: "Coxa", current: "58cm", change: "+2cm" },
              ].map((m) => (
                <div key={m.part} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{m.part}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{m.current}</span>
                    <span className={`text-xs font-medium ${m.change.startsWith("+") ? "text-primary" : "text-blue-400"}`}>
                      {m.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress photos */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Fotos de progresso</h3>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                <Camera className="w-4 h-4" /> Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-secondary rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "achievements" && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div
                key={b.name}
                className={`bg-card border rounded-2xl p-4 text-center transition-all ${
                  b.earned ? "border-primary/30" : "border-border opacity-50"
                }`}
              >
                <span className="text-3xl block mb-2">{b.icon}</span>
                <p className="text-[10px] text-foreground font-medium">{b.name}</p>
                {b.earned && <p className="text-[8px] text-primary mt-1">Conquistado ✅</p>}
              </div>
            ))}
          </div>

          {/* Monthly goals */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-foreground text-sm mb-3">Metas do mês</h3>
            <div className="space-y-3">
              {[
                { goal: "Treinar 20 dias", progress: 15, target: 20 },
                { goal: "Correr 50km", progress: 32, target: 50 },
                { goal: "Bater meta calórica 25 dias", progress: 12, target: 25 },
              ].map((g) => (
                <div key={g.goal}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{g.goal}</span>
                    <span className="text-muted-foreground">{g.progress}/{g.target}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${(g.progress / g.target) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;
