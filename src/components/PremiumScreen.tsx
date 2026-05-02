import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ChevronLeft, Sparkles, Zap, X, CreditCard, QrCode, Calendar, Info, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { TrialCountdown } from "./premium/TrialCountdown";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PixCheckoutForm } from "@/components/PixCheckoutForm";
import { fadeUp, stagger, staggerFast, easeApple, springSnappy } from "@/lib/motion";
import { SubscriptionSkeleton, PremiumPlansSkeleton } from "@/components/skeletons/SubscriptionSkeleton";
import { AnimatedText } from "@/components/motion/AnimatedText";

type PlanId = "weekly" | "monthly" | "annual";

interface Plan {
  id: PlanId;
  priceId: string;
  title: string;
  price: string;
  per: string;
  sub: string;
  badge: string | null;
  amountCents: number;
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
    amountCents: 499,
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
    amountCents: 1499,
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
    amountCents: 11990,
    features: [
      { label: "EvoAI ilimitado", included: true },
      { label: "Treinos adaptativos", included: true },
      { label: "Análises avançadas", included: true },
      { label: "Nutrição personalizada", included: true },
      { label: "Acesso antecipado", included: true },
    ],
  },
];

type PaymentMethod = "card" | "pix";

const PremiumScreen = () => {
  const { setCurrentTab, isPremium, user } = useApp();
  const { subscription, isActive, isLoading: subLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
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
        <p className="text-[14px] text-muted-foreground mb-5">
          Plano {selected.title} · {selected.price}{selected.per}
        </p>

        {/* Payment method tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={`h-10 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${
              paymentMethod === "card"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Cartão
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("pix")}
            className={`h-10 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${
              paymentMethod === "pix"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Pix
          </button>
        </div>

        {paymentMethod === "card" ? (
          <StripeEmbeddedCheckout
            priceId={selected.priceId}
            quantity={1}
            customerEmail={user?.email || ""}
            userId={user?.id || ""}
            returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
          />
        ) : (
          <PixCheckoutForm
            amountCents={selected.amountCents}
            description={`Assinatura EvoCore Premium ${selected.title}`}
            defaultEmail={user?.email || ""}
          />
        )}
      </motion.div>
    );
  }

  const hasPremiumAccess = isPremium || isActive;

  if (hasPremiumAccess) {
    const isTrial = subscription?.status === "trialing";
    const isCanceled = subscription?.status === "canceled" || subscription?.cancel_at_period_end;
    const expiryDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
    const startDate = subscription?.created_at ? new Date(subscription.created_at) : null;
    const planName = subscription?.price_id === "premium_annual_v2" ? "Anual" : 
                    subscription?.price_id === "premium_monthly_v2" ? "Mensal" : "Semanal";

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
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-inner"
          >
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-[32px] font-bold text-foreground tracking-[-0.03em]">EvoCore Pro</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Sua conta está ativa e turbinada.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-6">
          {/* Plan Status Card */}
          <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assinatura Atual</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                  isTrial ? "bg-amber-500/10 text-amber-500" : 
                  isCanceled ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  {isTrial ? "Em Teste (7 Dias)" : isCanceled ? "Cancelado" : "Ativo"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Plano {planName}</p>
                  <p className="text-xs text-muted-foreground">Premium ilimitado</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Início
                  </p>
                  <p className="text-[14px] font-bold text-foreground">
                    {startDate ? startDate.toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {isCanceled ? "Término" : "Próxima Cobrança"}
                  </p>
                  <p className="text-[14px] font-bold text-foreground">
                    {expiryDate ? expiryDate.toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>

              {isTrial && (
                <div className="pt-2 border-t border-border/40">
                  <TrialCountdown expiryDate={expiryDate} />
                </div>
              )}
            </div>
          </div>

          {/* Manage Payment Section */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest px-1">Pagamento e Gestão</h3>
            
            <Button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="w-full h-14 rounded-2xl bg-card border border-border/60 text-foreground hover:bg-secondary/50 shadow-sm text-[15px] font-bold flex items-center justify-between px-5 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="leading-none">{isCanceled ? "Ver faturas" : "Gerenciar Assinatura"}</p>
                  <p className="text-[11px] font-normal text-muted-foreground mt-1">Alterar cartão ou cancelar</p>
                </div>
              </div>
              {loadingPortal ? (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </div>
              )}
            </Button>

            {isTrial && !isCanceled && (
              <Button
                variant="ghost"
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/5 text-[14px] font-semibold"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar Teste Grátis
              </Button>
            )}

            {!isCanceled && (
              <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed">
                Você será redirecionado para o portal seguro da Stripe para {isTrial ? "interromper o teste ou " : ""}ajustar sua forma de pagamento.
              </p>
            )}

            {isCanceled && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mt-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-red-500">Assinatura Cancelada</p>
                    <p className="text-[12px] text-red-500/80 leading-snug mt-1">
                      Seu acesso Pro será encerrado em {expiryDate?.toLocaleDateString("pt-BR")}. Você pode reativar a qualquer momento.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => setCurrentTab("home")}
              className="w-full h-13 rounded-2xl bg-secondary/80 text-foreground text-[15px] font-bold active:scale-95 transition-all shadow-sm"
            >
              Voltar ao Início
            </button>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div variants={fadeUp} className="mt-10 p-5 rounded-2xl bg-secondary/30 border border-border/40 flex items-start gap-4 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-foreground leading-tight">Suporte Premium</p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Prioridade total para assinantes Pro. Te ajudamos com qualquer dúvida.</p>
            <button className="text-[13px] text-primary font-bold mt-2 hover:underline inline-flex items-center gap-1">
              Abrir chamado <ChevronLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
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
        <h1 className="text-[36px] sm:text-[44px] leading-[1.05] font-bold tracking-[-0.035em]">
          <AnimatedText as="span" text="Sua evolução," className="text-foreground block" duration={0.6} />
          <AnimatedText as="span" text="sem limites." className="text-gradient-flow block" delay={0.25} duration={0.6} />
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

      {/* Trial Promo */}
      <motion.div 
        variants={fadeUp}
        className="mb-8 p-6 rounded-[24px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-bold text-primary uppercase tracking-wider">Oferta por tempo limitado</span>
          </div>
          <h3 className="text-[20px] font-bold text-foreground mb-2">Inicie com 7 dias grátis</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
            Assine qualquer plano com cartão hoje e ganhe 7 dias de acesso premium sem cobrança. Se cancelar antes do fim do teste, você não paga nada.
          </p>
        </div>
        <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 rotate-12" />
      </motion.div>

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
        <p className="text-center text-[11px] text-muted-foreground mt-2">
          Pague com cartão ou Pix na próxima etapa
        </p>
        <p className="text-center text-[12px] text-muted-foreground mt-3">
          Pagamento seguro · Cancele a qualquer momento
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PremiumScreen;
