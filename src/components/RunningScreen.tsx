import React, { useState } from "react";
import { MapPin, Play, Clock, Flame, TrendingUp, Trophy, ChevronRight, Pause, Square, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const RunningScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [tab, setTab] = useState<"run" | "history">("run");

  const recentRuns = [
    { date: "14 Abr", distance: "5.2 km", time: "28:15", pace: "5:26/km", calories: 380 },
    { date: "12 Abr", distance: "3.8 km", time: "21:40", pace: "5:42/km", calories: 270 },
    { date: "10 Abr", distance: "7.1 km", time: "38:50", pace: "5:28/km", calories: 510 },
    { date: "8 Abr", distance: "4.5 km", time: "24:30", pace: "5:27/km", calories: 320 },
  ];

  if (isRunning) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        {/* Simulated map area */}
        <div className="w-full h-64 bg-secondary rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20" />
          </div>
          <div className="absolute top-4 left-4 glass rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1 text-xs text-foreground">
              <Navigation className="w-3 h-3 text-primary" /> GPS ativo
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Mapa do percurso</p>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-6xl font-heading font-bold text-foreground">3.24</p>
          <p className="text-muted-foreground text-sm">quilômetros</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-xs">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">17:42</p>
            <p className="text-[10px] text-muted-foreground">Tempo</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">5:28</p>
            <p className="text-[10px] text-muted-foreground">Pace</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">231</p>
            <p className="text-[10px] text-muted-foreground">Calorias</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <Pause className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={() => setIsRunning(false)}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center"
          >
            <Square className="w-6 h-6 text-destructive-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Corrida & Cardio</h1>

      {/* Start run */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Play className="w-8 h-8 text-primary-foreground ml-1" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">Iniciar corrida</h2>
        <p className="text-sm text-muted-foreground mb-4">GPS • Pace • Distância • Calorias</p>
        <Button variant="hero" className="w-full h-12 rounded-xl text-base" onClick={() => setIsRunning(true)}>
          Começar agora 🏃
        </Button>
      </div>

      {/* Activity types */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {["Corrida", "Caminhada", "Bike", "Esteira", "Elíptico", "Escada"].map((a) => (
          <span key={a} className="bg-card border border-border rounded-full px-4 py-2 text-xs text-foreground whitespace-nowrap hover:border-primary/30 transition-all cursor-pointer">
            {a}
          </span>
        ))}
      </div>

      {/* Weekly stats */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-3">Esta semana</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient font-heading">14.2</p>
            <p className="text-[10px] text-muted-foreground">km total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">3</p>
            <p className="text-[10px] text-muted-foreground">corridas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">5:32</p>
            <p className="text-[10px] text-muted-foreground">pace médio</p>
          </div>
        </div>

        {/* Mini chart */}
        <div className="flex items-end gap-1 mt-4 h-16 justify-between px-2">
          {[4, 6, 3, 8, 5, 2, 7].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-sm transition-all ${i === 3 ? "gradient-primary" : "bg-secondary"}`}
                style={{ height: `${h * 7}px` }}
              />
              <span className="text-[8px] text-muted-foreground">{"STQQSSD"[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm">Recordes 🏆</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">12.5 km</p>
          <p className="text-[10px] text-muted-foreground">Maior distância</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">4:52/km</p>
          <p className="text-[10px] text-muted-foreground">Melhor pace</p>
        </div>
      </div>

      {/* History */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Histórico</h3>
      <div className="space-y-3">
        {recentRuns.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{r.distance}</p>
                <p className="text-xs text-muted-foreground">{r.date} • {r.time} • {r.pace}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3 h-3" /> {r.calories}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunningScreen;
