import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ChevronLeft, Brain, Dumbbell, TrendingUp, Salad, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const benefits = [
  { icon: Brain,      title: "EvoAI ilimitado",        desc: "Conversas e planos sob medida sem limite diário." },
  { icon: Dumbbell,   title: "Treino adaptativo",      desc: "Planos que evoluem com seu desempenho." },
  { icon: TrendingUp, title: "Análises avançadas",     desc: "Insights detalhados de cada sessão." },
  { icon: Salad,      title: "Nutrição personalizada", desc: "Dieta calculada com base no seu objetivo." },
];

type PlanId = "weekly" | "monthly" | "annual";

const plans: { id: PlanId; priceId: string; title: string; price: string; per: string; sub: string; badge: string | null; highlight?: boolean }[] = [
  { id: "annual",  priceId: "premium_annual_v2",  title: "Anual",   price: "R$ 119,90", per: "/ano",     sub: "Equivale a R$ 9,99/mês",   badge: "Economize 33%", highlight: true },
  { id: "monthly", priceId: "premium_monthly_v2", title: "Mensal",  price: "R$ 14,99",  per: "/mês",     sub: "Cancele quando quiser",     badge: null },
  { id: "weekly",  priceId: "premium_weekly",     title: "Semanal", price: "R$ 4,99",   per: "/semana",  sub: "Experimente sem compromisso", badge: null },
];

const PremiumScreen = () => {
  const { setCurrentTab, isPremium, user } = useApp();
  const { subscription, isActive } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("annual");
  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.origin, environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error("Erro ao abrir portal");
      window.open(data.url, "_blank");
    } catch {
      toast.error("Não foi possível abrir o gerenciamento.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const selected = plans.find((p) => p.id === selectedPlan)!;

  if (showCheckout) {
    return (
      <div className="pb-28 px-5 pt-6 max-w-lg mx-auto">
        <PaymentTestModeBanner />
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-1 text-[15px] text-primary mb-6 active:opacity-60"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-[28px] font-bold text-foreground tracking-[-0.03em] mb-1">Finalizar assinatura</h1>
        <p className="text-[14px] text-muted-foreground mb-6">Plano {selected.title} · {selected.price}{selected.per}</p>
        <StripeEmbeddedCheckout
          priceId={selected.priceId}
          quantity={1}
          customerEmail={user?.email || ""}
          userId={user?.id || ""}
          returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
        />
      </div>
    );
  }

  if (isPremium || isActive) {
    return (
      <div className="pb-28 px-5 pt-12 max-w-lg mx-auto">
        <div className="text-center animate-fade-in mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em]">Você é PRO</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Aproveite todos os recursos.</p>
          {subscription?.cancel_at_period_end && subscription.current_period_end && (
            <p className="text-[13px] text-muted-foreground mt-3">
              Expira em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        <div className="bg-card rounded-2xl divide-y divide-border mb-8">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-center gap-4 px-5 py-4">
              <b.icon className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-foreground">{b.title}</p>
                <p className="text-[13px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-[15px] font-semibold"
          >
            {loadingPortal ? "Carregando…" : "Gerenciar assinatura"}
          </Button>
          <button
            onClick={() => setCurrentTab("home")}
            className="w-full h-12 rounded-xl bg-secondary text-foreground text-[15px] font-medium active:opacity-60"
          >
            Voltar para home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 px-5 pt-12 max-w-lg mx-auto">
      <PaymentTestModeBanner />

      {/* Hero */}
      <header className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="text-[12px] uppercase tracking-[0.2em] text-primary font-semibold">EVOCORE Pro</p>
        </div>
        <h1 className="text-[40px] leading-[1.05] font-bold text-foreground tracking-[-0.035em]">
          Sua evolução,<br />sem limites.
        </h1>
        <p className="text-[16px] text-muted-foreground mt-4 max-w-sm mx-auto leading-relaxed">
          Tudo o que você precisa para treinar como um atleta — em um único app.
        </p>
      </header>

      {/* Benefits */}
      <section className="mb-10 animate-fade-in">
        <div className="bg-card rounded-2xl divide-y divide-border">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <b.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-foreground">{b.title}</p>
                <p className="text-[13px] text-muted-foreground leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="mb-8 animate-fade-in">
        <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-3">Escolha seu plano</h2>
        <div className="space-y-3">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`w-full text-left bg-card rounded-2xl p-5 transition-all border-2 ${
                  isSelected ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[16px] font-semibold text-foreground">{p.title}</p>
                      {p.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.badge}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{p.sub}</p>
                  </div>
                  <div className="text-right tabular shrink-0">
                    <p className="text-[17px] font-bold text-foreground tracking-tight">{p.price}</p>
                    <p className="text-[11px] text-muted-foreground">{p.per}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={() => setShowCheckout(true)}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold active:opacity-80 transition-opacity shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
      >
        Continuar
      </button>
      <p className="text-center text-[12px] text-muted-foreground mt-3">
        Pagamento seguro · Cancele a qualquer momento
      </p>
    </div>
  );
};

export default PremiumScreen;
