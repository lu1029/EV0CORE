import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, Plus, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "evocore_pwa_install_dismissed_at";
const DISMISS_DAYS = 7;

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as any).standalone === true);

const isIos = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios|edgios/i.test(navigator.userAgent); // exclude Chrome/FF/Edge on iOS

const wasRecentlyDismissed = () => {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const InstallPwaPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (wasRecentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      setDeferred(null);
      setShowAndroid(false);
      setShowIos(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS doesn't fire beforeinstallprompt — show manual instructions after a small delay
    if (isIos()) {
      const t = setTimeout(() => setShowIos(true), 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShowAndroid(false);
    setShowIos(false);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setShowAndroid(false);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setDeferred(null);
    }
  };

  const visible = showAndroid || showIos;
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="install-pwa"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed bottom-24 left-0 right-0 z-[55] px-4 pointer-events-none"
        role="dialog"
        aria-label="Instalar EvoCore"
      >
        <div className="max-w-lg mx-auto pointer-events-auto bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-[0_20px_60px_-20px_hsl(0_0%_0%/0.8)]">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-heading font-bold text-foreground">Instalar EvoCore</p>
              {showAndroid ? (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Adicione à tela inicial para abrir como aplicativo.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug flex items-center gap-1 flex-wrap">
                  Toque em
                  <Share className="w-3.5 h-3.5 inline text-primary" />
                  <span className="font-medium text-foreground">Compartilhar</span>
                  e depois
                  <Plus className="w-3.5 h-3.5 inline text-primary" />
                  <span className="font-medium text-foreground">Adicionar à Tela de Início</span>.
                </p>
              )}
              {showAndroid && (
                <button
                  type="button"
                  onClick={install}
                  className="mt-3 h-9 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform"
                >
                  Instalar agora
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={dismiss}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPwaPrompt;
