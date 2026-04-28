import { useEffect, useState, useRef } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, CreditCard } from "lucide-react";
import * as Sentry from "@sentry/react";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

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

// Detect environments where the embedded iframe checkout struggles
// (Capacitor WebView, in-app browsers, restrictive previews).
function shouldUseHostedCheckout(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Capacitor / Cordova native shells
  if ((window as any).Capacitor?.isNativePlatform?.()) return true;
  // Common in-app browser signatures
  if (/(FBAN|FBAV|Instagram|Line|MicroMessenger|Twitter)/i.test(ua)) return true;
  return false;
}

export function StripeEmbeddedCheckout({
  priceId,
  quantity,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadingHosted, setLoadingHosted] = useState(false);
  const [embeddedFailed, setEmbeddedFailed] = useState(false);
  const useHostedDefault = shouldUseHostedCheckout();
  const fallbackTimerRef = useRef<number | null>(null);

  // If embedded mode is selected, watch for the iframe; if it never appears
  // within 6s, fall back to hosted redirect automatically.
  useEffect(() => {
    if (useHostedDefault || embeddedFailed) return;
    fallbackTimerRef.current = window.setTimeout(() => {
      const iframe = document.querySelector("#checkout iframe");
      if (!iframe) {
        console.warn("[Stripe] embedded iframe not detected, falling back to hosted");
        setEmbeddedFailed(true);
      }
    }, 6000);
    return () => {
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    };
  }, [useHostedDefault, embeddedFailed]);

  const openHostedCheckout = async () => {
    setError(null);
    setLoadingHosted(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          quantity,
          customerEmail,
          userId,
          environment: getStripeEnvironment(),
          uiMode: "hosted",
          returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/premium`,
        },
      });
      if (invokeError) throw new Error(invokeError.message || "invoke error");
      if (!data?.url) throw new Error(data?.error || "No checkout URL returned");
      // Redirect in same window — most reliable across mobile/web
      window.location.href = data.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Checkout] hosted failed:", msg);
      Sentry.captureException(e, { tags: { area: "checkout-hosted" }, extra: { priceId } });
      setError(mapStripeError(msg));
      setLoadingHosted(false);
    }
  };

  const fetchClientSecret = async (): Promise<string> => {
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
      setEmbeddedFailed(true);
      throw new Error(friendly);
    }
  };

  if (!stripePromise) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Sistema de pagamento indisponível. Tente novamente mais tarde.
      </div>
    );
  }

  // Hosted fallback view
  if (useHostedDefault || embeddedFailed) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="rounded-2xl border border-border/40 bg-card p-5 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <p className="text-[15px] font-semibold text-foreground">
            Pagamento seguro com cartão
          </p>
          <p className="text-[13px] text-muted-foreground">
            Você será direcionado para a tela segura da Stripe para concluir.
          </p>
          <Button
            onClick={openHostedCheckout}
            disabled={loadingHosted}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-[15px] font-semibold gap-2"
          >
            {loadingHosted ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Abrindo checkout…
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Pagar com cartão
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Pagamento processado por Stripe · Seguro
          </p>
        </div>
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
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
