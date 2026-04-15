import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Crown, Check, X, Zap, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { name: "Treinos básicos", free: true, premium: true },
  { name: "Registro de corrida", free: true, premium: true },
  { name: "Nutrição básica", free: true, premium: true },
  { name: "Progresso básico", free: true, premium: true },
  { name: "Planos personalizados", free: false, premium: true },
  { name: "Treino adaptativo", free: false, premium: true },
  { name: "Análises avançadas", free: false, premium: true },
  { name: "Relatórios completos", free: false, premium: true },
  { name: "Nutrição personalizada", free: false, premium: true },
  { name: "Programas por objetivo", free: false, premium: true },
  { name: "Desafios exclusivos", free: false, premium: true },
  { name: "Vídeos e treinos guiados", free: false, premium: true },
];

const PremiumScreen = () => {
  const { setCurrentTab, setIsPremium, isPremium } = useApp();

  if (isPremium) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Crown className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Você é PRO! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-6">Aproveite todos os recursos premium do EVOCORE.</p>
        <Button variant="glass" onClick={() => setCurrentTab("home")} className="rounded-xl">
          Voltar para home
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">EVOCORE PRO</h1>
        <p className="text-muted-foreground text-sm">Desbloqueie sua evolução completa</p>
      </div>

      {/* Plans */}
      <div className="space-y-3 mb-6 animate-fade-in">
        <div className="bg-card border-2 border-primary rounded-2xl p-4 relative">
          <div className="absolute -top-3 right-4 gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Anual</h3>
              <p className="text-xs text-muted-foreground">Economize 60%</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gradient font-heading">R$ 19,90</p>
              <p className="text-[10px] text-muted-foreground">/mês</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Mensal</h3>
              <p className="text-xs text-muted-foreground">Cancele quando quiser</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground font-heading">R$ 39,90</p>
              <p className="text-[10px] text-muted-foreground">/mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features comparison */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-4">Comparação de planos</h3>
        <div className="grid grid-cols-[1fr,60px,60px] gap-y-3 text-xs">
          <span className="text-muted-foreground font-medium">Recurso</span>
          <span className="text-center text-muted-foreground font-medium">Free</span>
          <span className="text-center text-primary font-medium">PRO</span>
          {features.map((f) => (
            <React.Fragment key={f.name}>
              <span className="text-foreground">{f.name}</span>
              <span className="text-center">
                {f.free ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />}
              </span>
              <span className="text-center">
                <Check className="w-4 h-4 text-primary mx-auto" />
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Premium features */}
      <div className="space-y-3 mb-6 animate-fade-in">
        {[
          { icon: Zap, title: "Treino adaptativo", desc: "Planos que evoluem com você" },
          { icon: Star, title: "Análises inteligentes", desc: "Insights de performance avançados" },
          { icon: Crown, title: "Nutrição personalizada", desc: "Baseada no seu peso e objetivo" },
        ].map((f) => (
          <div key={f.title} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <f.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="hero"
        className="w-full h-14 rounded-xl text-base"
        onClick={() => {
          setIsPremium(true);
          setCurrentTab("home");
        }}
      >
        Assinar PRO agora 🚀
      </Button>
      <p className="text-center text-[10px] text-muted-foreground mt-3">
        7 dias grátis • Cancele quando quiser • Pagamento seguro
      </p>
    </div>
  );
};

export default PremiumScreen;
