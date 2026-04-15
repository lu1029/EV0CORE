import React, { useState } from "react";
import { useTheme, themeConfigs, ThemeBackground } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import {
  Bell, Volume2, Vibrate, Ruler, Palette, Info, ChevronLeft,
  Moon, Sun, Shield, HelpCircle, Star, MessageCircle, Share2,
  Smartphone, Timer, Target, Dumbbell
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsScreenProps {
  onBack: () => void;
}

type SettingsPage = "main" | "appearance" | "workout" | "about";

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const {
    background, setBackground,
    units, setUnits,
    notifications, setNotifications,
    soundEffects, setSoundEffects,
    restTimerVibration, setRestTimerVibration,
  } = useTheme();

  const { userProfile } = useApp();
  const [page, setPage] = useState<SettingsPage>("main");

  const renderMainPage = () => (
    <div className="space-y-3 animate-fade-in">
      {/* Appearance */}
      <button
        onClick={() => setPage("appearance")}
        className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Aparência</p>
          <p className="text-xs text-muted-foreground">Plano de fundo e personalização</p>
        </div>
        <span className="text-xs text-muted-foreground">{themeConfigs[background].emoji}</span>
      </button>

      {/* Workout settings */}
      <button
        onClick={() => setPage("workout")}
        className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Treino</p>
          <p className="text-xs text-muted-foreground">Timer, sons e vibrações</p>
        </div>
      </button>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Notificações</p>
          <p className="text-xs text-muted-foreground">Lembretes de treino</p>
        </div>
        <Switch checked={notifications} onCheckedChange={setNotifications} />
      </div>

      {/* Units */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Ruler className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Unidades</p>
            <p className="text-xs text-muted-foreground">Sistema de medidas</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => { setUnits(u); toast.success(`Unidades: ${u === "metric" ? "Métricas (kg/cm)" : "Imperiais (lbs/in)"}`); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                units === u
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {u === "metric" ? "🇧🇷 kg / cm" : "🇺🇸 lbs / in"}
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <button
        onClick={() => setPage("about")}
        className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Sobre o app</p>
          <p className="text-xs text-muted-foreground">Versão e informações</p>
        </div>
      </button>

      {/* Links */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {[
          { icon: Shield, label: "Política de Privacidade", action: () => toast.info("Em breve") },
          { icon: HelpCircle, label: "Ajuda & Suporte", action: () => toast.info("Entre em contato: suporte@evocore.app") },
          { icon: Star, label: "Avaliar o app", action: () => toast.success("Obrigado! ⭐") },
          { icon: Share2, label: "Compartilhar app", action: () => {
            if (navigator.share) {
              navigator.share({ title: "EvoCore", text: "Confira o EvoCore - seu personal trainer com IA!", url: "https://ev0core.lovable.app" });
            } else {
              navigator.clipboard.writeText("https://ev0core.lovable.app");
              toast.success("Link copiado!");
            }
          }},
        ].map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-all active:scale-[0.99] ${
              i < arr.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAppearancePage = () => (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <h3 className="font-heading font-bold text-foreground text-lg">Plano de Fundo</h3>
      <p className="text-xs text-muted-foreground -mt-2">Personalize a aparência do app com temas únicos</p>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(themeConfigs) as ThemeBackground[]).map((key) => {
          const theme = themeConfigs[key];
          const isActive = background === key;
          return (
            <button
              key={key}
              onClick={() => { setBackground(key); toast.success(`Tema: ${theme.label}`); }}
              className={`relative rounded-2xl p-4 text-left transition-all active:scale-[0.96] overflow-hidden ${
                isActive
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "glass-card hover:border-primary/30"
              }`}
            >
              {/* Mini preview */}
              <div
                className="w-full h-16 rounded-xl mb-3 overflow-hidden relative"
                style={{ background: theme.baseBg }}
              >
                <div
                  className="absolute w-12 h-12 -top-2 -left-2 rounded-full blur-md opacity-80"
                  style={{ background: theme.orb1 }}
                />
                <div
                  className="absolute w-10 h-10 bottom-0 right-0 rounded-full blur-md opacity-60"
                  style={{ background: theme.orb2 }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{theme.emoji}</span>
                <span className="text-sm font-medium text-foreground">{theme.label}</span>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center animate-scale-in">
                  <span className="text-[10px] text-primary-foreground">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderWorkoutPage = () => (
    <div className="space-y-3 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <h3 className="font-heading font-bold text-foreground text-lg">Configurações de Treino</h3>

      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Sons</p>
          <p className="text-xs text-muted-foreground">Alertas sonoros de descanso</p>
        </div>
        <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
      </div>

      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Vibrate className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Vibração</p>
          <p className="text-xs text-muted-foreground">Vibrar ao final do descanso</p>
        </div>
        <Switch checked={restTimerVibration} onCheckedChange={setRestTimerVibration} />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Timer className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">Timer de descanso padrão</p>
            <p className="text-xs text-muted-foreground">Configurado por exercício via IA</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">Objetivos semanais</p>
            <p className="text-xs text-muted-foreground">{userProfile.daysPerWeek}x por semana (edite no perfil)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutPage = () => (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => setPage("main")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="glass-card-purple rounded-2xl p-6 text-center">
        <img
          src={evocoreLogo}
          alt="EvoCore"
          className="w-16 h-16 rounded-2xl mx-auto mb-3 object-contain drop-shadow-[0_0_20px_hsl(239,84%,67%,0.3)]"
        />
        <h3 className="font-heading font-bold text-foreground text-xl">EvoCore</h3>
        <p className="text-xs text-muted-foreground mt-1">Seu companheiro fitness do dia a dia</p>
        <p className="text-xs text-primary mt-2 font-medium">Versão 1.0.0</p>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-2">
        <p className="text-sm text-foreground font-medium">Treinar ficou mais simples.</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          O EvoCore foi criado pra quem quer cuidar do corpo sem complicação. 
          Ele monta seu treino, organiza sua dieta e acompanha sua corrida — tudo no mesmo lugar, 
          direto no celular, prático pro seu dia a dia.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Seja na academia ou em casa, o app se adapta ao seu nível e objetivo. 
          É como ter um personal no bolso, disponível a qualquer hora.
        </p>
      </div>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button onClick={onBack} className="w-8 h-8 rounded-xl glass-card flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Configurações</h1>
      </div>

      {page === "main" && renderMainPage()}
      {page === "appearance" && renderAppearancePage()}
      {page === "workout" && renderWorkoutPage()}
      {page === "about" && renderAboutPage()}
    </div>
  );
};

export default SettingsScreen;
