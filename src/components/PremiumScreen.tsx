import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ChevronLeft, Sparkles, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { fadeUp, stagger, staggerFast, easeApple, springSnappy } from "@/lib/motion";
import { SubscriptionSkeleton, PremiumPlansSkeleton } from "@/components/skeletons/SubscriptionSkeleton";

type PlanId = "weekly" | "monthly" | "annual";

interface Plan {
  id: PlanId;
  priceId: string;
  title: string;
  price: string;
  per: string;
  sub: string;
  badge: string | null;
  features: { label: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    id: "weekly",
    priceId: "premium_weekly",
    title: "Semanal",
    price: "R$ 4,99",
    per: "/semana",
    sub: "Experimente",
    badge: null,
    features: [
      { label: "EvoAI ilimitado", included: true },
      { label: "Treinos adaptativos", included: true },
      { label: "Análises avançadas", included: false },
      { label: "Nutrição personalizada", included: false },
      { label: "Acesso antecipado", included: false },
    ],
  },
  {
    id: "monthly",
    priceId: "premium_monthly_v2",
    title: "Mensal",
    price: "R$ 14,99",
    per: "/mês",
    sub: "Mais escolhido",
    badge: "POPULAR",
    features: [
      { label: "EvoAI ilimitado", included: true },
      { label: "Treinos adaptativos", included: true },
      { label: "Análises avançadas", included: true },
      { label: "Nutrição personalizada", included: true },
      { label: "Acesso antecipado", included: false },
    ],
  },
  {
    id: "annual",
    priceId: "premium_annual_v2",
    title: "Anual",
    price: "R$ 119,90",
    per: "/ano",
    sub: "Economize 33%",
    badge: "MELHOR VALOR",
    features: [
      { label: "EvoAI ilimitado", included: true },
      { label: "Treinos adaptativos", included: true },
      { label: "Análises avançadas", included: true },
      { label: "Nutrição personalizada", included: true },
      { label: "Acesso antecipado", included: true },
    ],
  },
];

const PremiumScreen = () => {
  const { setCurrentTab, isPremium, user } = useApp();
  const { subscription, isActive, isLoading: subLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");
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

  if (subLoading) {
    return (
      <div className="pb-28 px-5 pt-8 max-w-lg mx-auto space-y-6">
        <SubscriptionSkeleton />
        <PremiumPlansSkeleton />
      </div>
    );
  }

  if (showCheckout) {
    return (
      <motion.div
        className="pb-28 px-5 pt-6 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeApple }}
      >
        <PaymentTestModeBanner />
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-1 text-[15px] text-primary mb-6 active:opacity-60"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-[28px] font-bold text-foreground tracking-[-0.03em] mb-1">Finalizar assinatura</h1>
        <p className="text-[14px] text-muted-foreground mb-6">
          Plano {selected.title} · {selected.price}{selected.per}
        </p>
        <StripeEmbeddedCheckout
          priceId={selected.priceId}
          quantity={1}
          customerEmail={user?.email || ""}
          userId={user?.id || ""}
          returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
        />
      </motion.div>
    );
  }

  if (isPremium || isActive) {
    return (
      <motion.div
        className="pb-28 px-5 pt-12 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springSnappy, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5"
          >
            <Check className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em]">Você é PRO</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Aproveite todos os recursos.</p>
          {subscription?.cancel_at_period_end && subscription.current_period_end && (
            <p className="text-[13px] text-muted-foreground mt-3">
              Expira em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
            </p>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-3">
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
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pb-28 px-4 pt-10 max-w-3xl mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <PaymentTestModeBanner />

      {/* Hero */}
      <motion.header variants={fadeUp} className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springSnappy, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="text-[12px] uppercase tracking-[0.2em] text-primary font-semibold">EVOCORE Pro</p>
        </motion.div>
        <h1 className="text-[36px] sm:text-[44px] leading-[1.05] font-bold text-foreground tracking-[-0.035em]">
          Sua evolução,<br />
          <span className="text-primary">sem limites.</span>
        </h1>
        <p className="text-[15px] sm:text-[16px] text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
          Treine como um atleta. Tudo num único app.
        </p>
      </motion.header>

      {/* Plan cards — always side by side */}
      <motion.section variants={fadeUp} className="mb-8">
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-2 sm:gap-3"
        >
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <motion.button
                key={p.id}
                variants={fadeUp}
                onClick={() => setSelectedPlan(p.id)}
                whileHover={{ y: -4, transition: springSnappy }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  scale: isSelected ? 1.02 : 1,
                  transition: springSnappy,
                }}
                className={`relative text-left bg-card rounded-2xl p-3 sm:p-5 transition-colors border-2 overflow-hidden ${
                  isSelected
                    ? "border-primary shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.5)]"
                    : "border-border/40"
                }`}
              >
                {/* Badge */}
                <AnimatePresence>
                  {p.badge && (
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-2 right-2 text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-primary-foreground bg-primary px-1.5 sm:px-2 py-0.5 rounded-full"
                    >
                      {p.badge}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Glow on selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="relative">
                  <p className="text-[13px] sm:text-[15px] font-semibold text-foreground">{p.title}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{p.sub}</p>

                  <div className="mt-3 sm:mt-4">
                    <p className="text-[15px] sm:text-[20px] font-bold text-foreground tracking-tight tabular leading-none">
                      {p.price}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">{p.per}</p>
                  </div>

                  <motion.div
                    animate={{
                      backgroundColor: isSelected ? "hsl(var(--primary))" : "transparent",
                      borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
                    }}
                    className="mt-3 sm:mt-4 w-full h-7 sm:h-8 rounded-lg border-2 flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      {isSelected ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={springSnappy}
                        >
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground"
                        >
                          Escolher
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Comparison feature list — animates with selected plan */}
      <motion.section variants={fadeUp} className="mb-8">
        <div className="bg-card rounded-2xl border border-border/40 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">
            O que está incluído no plano {selected.title}
          </p>
          <AnimatePresence mode="wait">
            <motion.ul
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: easeApple }}
              className="space-y-3"
            >
              {selected.features.map((f, i) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ease: easeApple }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      f.included ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    {f.included ? (
                      <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" strokeWidth={3} />
                    )}
                  </div>
                  <span
                    className={`text-[14px] ${
                      f.included ? "text-foreground" : "text-muted-foreground line-through"
                    }`}
                  >
                    {f.label}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div variants={fadeUp}>
        <motion.button
          onClick={() => setShowCheckout(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={springSnappy}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-[16px] font-semibold shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.6)] flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" strokeWidth={2.5} />
          Continuar com {selected.title}
        </motion.button>
        <p className="text-center text-[12px] text-muted-foreground mt-3">
          Pagamento seguro · Cancele a qualquer momento
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PremiumScreen;
