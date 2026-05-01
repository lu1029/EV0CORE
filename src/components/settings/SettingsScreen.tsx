import React, { useState } from "react";
import evocoreLogo from "@/assets/evocore-logo.png";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import {
  Bell, Volume2, Vibrate, Ruler, Info, ChevronLeft,
  Moon, Sun, Shield, HelpCircle, Star, Share2,
  Timer, Target, Dumbbell, Smartphone, Clock
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ReminderSettings } from "../reminders/ReminderSettings";

interface SettingsScreenProps {
  onBack: () => void;
}

type SettingsPage = "main" | "workout" | "about" | "reminders";

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const {
    mode, setMode,
    units, setUnits,
    notifications, setNotifications,
    soundEffects, setSoundEffects,
    restTimerVibration, setRestTimerVibration,
  } = useTheme();

  const { userProfile } = useApp();
  const [page, setPage] = useState<SettingsPage>("main");

  const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "auto", label: "Auto", icon: Smartphone },
  ];

  const renderMainPage = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Theme */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Aparência</h3>
        <div className="bg-card rounded-2xl p-2 flex gap-1">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setMode(opt.id); toast.success(`Tema: ${opt.label}`); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-[12px] font-medium transition-all ${
                mode === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground active:bg-secondary"
              }`}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 px-1">
          Use o botão sol/lua no topo para alternar rapidamente.
        </p>
      </section>

      {/* Notifications & Reminders */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Geral</h3>
        <div className="bg-card rounded-2xl divide-y divide-border">
          <button
            onClick={() => setPage("reminders")}
            className="w-full flex items-center px-5 py-3.5 gap-3 active:bg-secondary/40 transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-[15px] text-foreground">Lembretes</p>
              <p className="text-[12px] text-muted-foreground">Nutrição, treino e corrida</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
          <div className="flex items-center px-5 py-3.5 gap-3">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[15px] text-foreground">Notificações do Sistema</p>
              <p className="text-[12px] text-muted-foreground">Alertas de progresso</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="px-5 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[15px] text-foreground">Unidades</p>
                <p className="text-[12px] text-muted-foreground">Sistema de medidas</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    units === u ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {u === "metric" ? "kg / cm" : "lbs / in"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workout */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Treino</h3>
        <button
          onClick={() => setPage("workout")}
          className="w-full bg-card rounded-2xl px-5 py-3.5 flex items-center gap-3 active:bg-secondary/40 transition-colors"
        >
          <Dumbbell className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left text-[15px] text-foreground">Sons, vibração e timer</span>
          <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
        </button>
      </section>

      {/* About + Links */}
      <section>
        <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Sobre</h3>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {[
            { icon: Info, label: "Sobre o EvoCore", action: () => setPage("about") },
            { icon: Shield, label: "Política de Privacidade", action: () => window.open("/privacidade", "_blank") },
            { icon: HelpCircle, label: "Ajuda & Suporte", action: () => toast.info("suporte@evocore.app") },
            { icon: Star, label: "Avaliar o app", action: () => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const storeUrl = isIOS 
                ? "https://apps.apple.com/app/evocore" // Placeholder, update if real ID exists
                : "https://play.google.com/store/apps/details?id=com.ev0core.app";
              window.open(storeUrl, "_blank");
            }},
            { icon: Share2, label: "Compartilhar", action: () => {
              if (navigator.share) navigator.share({ title: "EvoCore", url: "https://ev0core.com" });
              else { navigator.clipboard.writeText("https://ev0core.com"); toast.success("Link copiado"); }
            }},
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-secondary/40 transition-colors"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left text-[15px] text-foreground">{item.label}</span>
              <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderWorkoutPage = () => (
    <div className="space-y-3 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-[14px] text-muted-foreground active:opacity-60 mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>
      <h3 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Treino</h3>

      <div className="bg-card rounded-2xl divide-y divide-border">
        <div className="flex items-center px-5 py-3.5 gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[15px] text-foreground">Sons</p>
            <p className="text-[12px] text-muted-foreground">Alertas de descanso</p>
          </div>
          <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
        </div>
        <div className="flex items-center px-5 py-3.5 gap-3">
          <Vibrate className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[15px] text-foreground">Vibração</p>
            <p className="text-[12px] text-muted-foreground">Vibrar ao final do descanso</p>
          </div>
          <Switch checked={restTimerVibration} onCheckedChange={setRestTimerVibration} />
        </div>
        <div className="flex items-center px-5 py-3.5 gap-3">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[15px] text-foreground">Timer padrão</p>
            <p className="text-[12px] text-muted-foreground">Configurado por exercício</p>
          </div>
        </div>
        <div className="flex items-center px-5 py-3.5 gap-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[15px] text-foreground">Meta semanal</p>
            <p className="text-[12px] text-muted-foreground">{userProfile.daysPerWeek}x por semana</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutPage = () => (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-[14px] text-muted-foreground active:opacity-60 mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-card rounded-2xl p-6 text-center">
        <img src={evocoreLogo} alt="EvoCore" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-contain" />
        <h3 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">EvoCore</h3>
        <p className="text-[13px] text-muted-foreground mt-1">Treine, corra e coma melhor.</p>
        <p className="text-[12px] text-primary mt-2 font-medium tabular">Versão 1.0.0</p>
      </div>

      <div className="bg-card rounded-2xl p-5 space-y-2">
        <p className="text-[14px] text-foreground leading-relaxed">
          O EvoCore foi criado pra quem quer cuidar do corpo sem complicação.
          Ele monta seu treino, organiza sua dieta e acompanha sua corrida — tudo no mesmo lugar.
        </p>
      </div>
    </div>
  );

  const renderRemindersPage = () => (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-[14px] text-muted-foreground active:opacity-60 mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>
      <h3 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Lembretes</h3>
      <ReminderSettings />
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.02em]">Configurações</h1>
      </div>

      {page === "reminders" && renderRemindersPage()}
      {page === "main" && renderMainPage()}
      {page === "workout" && renderWorkoutPage()}
      {page === "about" && renderAboutPage()}
    </div>
  );
};

export default SettingsScreen;
