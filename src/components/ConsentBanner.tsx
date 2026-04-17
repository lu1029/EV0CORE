import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { logSecurityEvent } from "@/lib/auditLog";

const CONSENT_KEY = "evocore_lgpd_consent";

const ConsentBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    const ts = new Date().toISOString();
    localStorage.setItem(CONSENT_KEY, ts);
    logSecurityEvent("consent_accepted", { version: "1.0", accepted_at: ts });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in">
      <div className="max-w-lg mx-auto glass-card rounded-2xl p-4 border border-border/50 shadow-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">Sua privacidade importa</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              O EvoCore coleta dados de saúde (peso, altura, treinos) para personalizar sua experiência. 
              Ao continuar, você concorda com o tratamento desses dados conforme nossa{" "}
              <a href="/privacidade" target="_blank" className="text-primary underline">
                Política de Privacidade
              </a>{" "}
              e a LGPD.
            </p>
            <Button onClick={handleAccept} size="sm" className="rounded-xl gradient-primary text-primary-foreground w-full">
              Aceitar e continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
