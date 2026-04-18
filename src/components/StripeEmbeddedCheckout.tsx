import { useCallback, useMemo, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import * as Sentry from "@sentry/react";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

// IMPORTANT: call getStripe() once at module load — passing a fresh Promise
// to EmbeddedCheckoutProvider on every render reinitializes Stripe and breaks the iframe.
const stripePromise = (() => {
  try {
    return getStripe();
  } catch (e) {
    console.error("[Stripe] init failed:", e);
    Sentry.captureException(e);
    return null;
  }
})();

function mapStripeError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("price not found")) return "Plano indisponível no momento. Tente novamente em instantes.";
  if (m.includes("invalid priceid")) return "Plano inválido. Recarregue a página.";
  if (m.includes("network") || m.includes("failed to fetch")) return "Falha de rede. Verifique sua conexão.";
  if (m.includes("unauthorized") || m.includes("401")) return "Sessão expirada. Faça login novamente.";
  return "Não foi possível iniciar o pagamento. Tente novamente.";
}

export function StripeEmbeddedCheckout({
  priceId,
  quantity,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, quantity, customerEmail, userId, returnUrl, environment: getStripeEnvironment() },
      });
      if (invokeError) throw new Error(invokeError.message || "invoke error");
      if (!data?.clientSecret) throw new Error(data?.error || "No client secret returned");
      return data.clientSecret;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Checkout] fetchClientSecret failed:", msg);
      Sentry.captureException(e, { tags: { area: "checkout" }, extra: { priceId } });
      const friendly = mapStripeError(msg);
      setError(friendly);
      throw new Error(friendly);
    }
  }, [priceId, quantity, customerEmail, userId, returnUrl]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (!stripePromise) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Sistema de pagamento indisponível. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div id="checkout" className="min-h-[500px]">
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
