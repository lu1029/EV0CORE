import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Crown, Check, X, Zap, Star, ChevronRight, Sparkles, Brain, Dumbbell, TrendingUp, Shield, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { name: "Treinos básicos", free: true, premium: true },
  { name: "Registro de corrida", free: true, premium: true },
  { name: "Nutrição básica", free: true, premium: true },
  { name: "Progresso básico", free: true, premium: true },
  { name: "IA Personal Trainer", free: false, premium: true },
  { name: "Planos personalizados", free: false, premium: true },
  { name: "Treino adaptativo", free: false, premium: true },
  { name: "Análises avançadas", free: false, premium: true },
  { name: "Nutrição personalizada", free: false, premium: true },
  { name: "Programas por objetivo", free: false, premium: true },
  { name: "Desafios exclusivos", free: false, premium: true },
  { name: "Vídeos e treinos guiados", free: false, premium: true },
];

const PremiumScreen = () => {
  const { setCurrentTab, setIsPremium, isPremium } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");

  if (isPremium) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto text-center">
        <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Crown className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Você é PRO! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-2">Aproveite todos os recursos premium do EVOCORE.</p>
        <div className="bg-card border border-primary/30 rounded-2xl p-4 mt-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Seus benefícios ativos</span>
          </div>
          <div className="space-y-2 text-left">
            {["IA Personal Trainer", "Treinos ilimitados", "Nutrição personalizada", "Análises avançadas"].map(b => (
              <div key={b} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <Button variant="glass" onClick={() => setCurrentTab("home")} className="rounded-xl">
          Voltar para home
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header with animated gradient */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-yellow-900" />
          </div>
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-1">EVOCORE PRO</h1>
        <p className="text-muted-foreground text-sm">Desbloqueie sua evolução completa</p>
      </div>

      {/* Free trial banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">7 dias grátis!</p>
            <p className="text-xs text-muted-foreground">Teste todos os recursos PRO sem pagar nada. Cancele quando quiser.</p>
          </div>
        </div>
      </div>

      {/* Premium features highlights */}
      <div className="space-y-3 mb-6 animate-fade-in">
        {[
          { icon: Brain, title: "IA Personal Trainer", desc: "Treinos personalizados com inteligência artificial", gradient: true },
          { icon: Dumbbell, title: "Treino adaptativo", desc: "Planos que evoluem automaticamente com você", gradient: false },
          { icon: TrendingUp, title: "Análises inteligentes", desc: "Insights avançados de performance", gradient: false },
          { icon: Star, title: "Nutrição personalizada", desc: "Dieta baseada no seu peso e objetivo", gradient: false },
        ].map((f) => (
          <div key={f.title} className={`border rounded-2xl p-4 flex items-center gap-3 ${f.gradient ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.gradient ? 'gradient-primary' : 'bg-secondary'}`}>
              <f.icon className={`w-5 h-5 ${f.gradient ? 'text-primary-foreground' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
            {f.gradient && <span className="text-[10px] text-primary font-bold">NOVO</span>}
          </div>
        ))}
      </div>

      {/* Plans */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Escolha seu plano</h3>
      <div className="space-y-3 mb-6 animate-fade-in">
        <button
          onClick={() => setSelectedPlan("annual")}
          className={`w-full text-left border rounded-2xl p-4 relative transition-all ${
            selectedPlan === "annual" ? "border-primary bg-primary/5 glow-primary" : "border-border bg-card"
          }`}
        >
          <div className="absolute -top-3 right-4 gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "annual" ? "border-primary" : "border-muted-foreground"
              }`}>
                {selectedPlan === "annual" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">Anual</h3>
                <p className="text-xs text-muted-foreground">Economize 60%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gradient font-heading">R$ 19,90</p>
              <p className="text-[10px] text-muted-foreground">/mês</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedPlan("monthly")}
          className={`w-full text-left border rounded-2xl p-4 transition-all ${
            selectedPlan === "monthly" ? "border-primary bg-primary/5 glow-primary" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "monthly" ? "border-primary" : "border-muted-foreground"
              }`}>
                {selectedPlan === "monthly" && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">Mensal</h3>
                <p className="text-xs text-muted-foreground">Cancele quando quiser</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground font-heading">R$ 39,90</p>
              <p className="text-[10px] text-muted-foreground">/mês</p>
            </div>
          </div>
        </button>
      </div>

      {/* Features comparison */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-4">Comparação de planos</h3>
        <div className="grid grid-cols-[1fr,50px,50px] gap-y-3 text-xs">
          <span className="text-muted-foreground font-medium">Recurso</span>
          <span className="text-center text-muted-foreground font-medium">Free</span>
          <span className="text-center text-primary font-medium">PRO</span>
          {features.map((f) => (
            <React.Fragment key={f.name}>
              <span className="text-foreground">{f.name}</span>
              <span className="text-center">
                {f.free ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </span>
              <span className="text-center">
                <Check className="w-4 h-4 text-primary mx-auto" />
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 mb-4 animate-fade-in">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span className="text-[10px]">Pagamento seguro</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-[10px]">Cancele a qualquer momento</span>
        </div>
      </div>

      <Button
        variant="hero"
        className="w-full h-14 rounded-xl text-base"
        onClick={() => {
          // Payment integration required - premium cannot be granted client-side
          toast.info("Integração de pagamento em breve! 🚀");
        }}
      >
        Começar 7 dias grátis 🚀
      </Button>
      <p className="text-center text-[10px] text-muted-foreground mt-3">
        Após o período de teste, {selectedPlan === "annual" ? "R$ 238,80/ano (R$ 19,90/mês)" : "R$ 39,90/mês"}
      </p>
    </div>
  );
};

export default PremiumScreen;
