import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ChevronLeft, Brain, Dumbbell, TrendingUp, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const benefits = [
  { icon: Brain, title: "IA Personal Trainer", desc: "Treinos gerados sob medida para você." },
  { icon: Dumbbell, title: "Treino adaptativo", desc: "Planos que evoluem com seu desempenho." },
  { icon: TrendingUp, title: "Análises avançadas", desc: "Insights detalhados de cada sessão." },
  { icon: Salad, title: "Nutrição personalizada", desc: "Dieta calculada com base no seu objetivo." },
];

const PremiumScreen = () => {
  const { setCurrentTab, isPremium, user } = useApp();
  const { subscription, isActive } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
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

  if (showCheckout) {
    const priceId = selectedPlan === "annual" ? "premium_annual" : "premium_monthly";
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
        <p className="text-[14px] text-muted-foreground mb-6">Pagamento processado com segurança.</p>
        <StripeEmbeddedCheckout
          priceId={priceId}
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
        <p className="text-[13px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">EVOCORE Pro</p>
        <h1 className="text-[40px] leading-[1.05] font-bold text-foreground tracking-[-0.035em]">
          Sua evolução,<br />sem limites.
        </h1>
        <p className="text-[16px] text-muted-foreground mt-4 max-w-sm mx-auto leading-relaxed">
          Tudo o que você precisa para treinar como um atleta — em um único app.
        </p>
      </header>

      {/* Benefits */}
      <section className="mb-12 animate-fade-in">
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

      {/* Plans — minimal radio rows */}
      <section className="mb-10 animate-fade-in">
        <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground px-1 mb-2">Escolha seu plano</h2>
        <div className="space-y-3">
          {[
            { id: "annual" as const, title: "Anual", sub: "Equivale a R$ 19,90/mês", price: "R$ 238,80", per: "/ano", badge: "Economize 60%" },
            { id: "monthly" as const, title: "Mensal", sub: "Cancele quando quiser", price: "R$ 39,90", per: "/mês", badge: null },
          ].map((p) => {
            const selected = selectedPlan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`w-full text-left bg-card rounded-2xl p-5 transition-all border ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-semibold text-foreground">{p.title}</p>
                      {p.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{p.badge}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{p.sub}</p>
                  </div>
                  <div className="text-right tabular">
                    <p className="text-[18px] font-bold text-foreground tracking-tight">{p.price}</p>
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
        className="w-full h-13 py-4 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold active:opacity-80 transition-opacity"
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
