import React from "react";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumGateProps {
  children: React.ReactNode;
  /** Inline mode blurs the content with an overlay. Block mode replaces content entirely. */
  mode?: "inline" | "block";
  /** Short label shown in the upgrade prompt */
  feature?: string;
}

const PremiumGate = ({ children, mode = "inline", feature = "este recurso" }: PremiumGateProps) => {
  const { isPremium, setCurrentTab } = useApp();
  const { isActive } = useSubscription();

  if (isPremium || isActive) {
    return <>{children}</>;
  }

  if (mode === "block") {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-heading font-bold text-foreground mb-1">Recurso PRO</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Desbloqueie <span className="text-primary font-medium">{feature}</span> e muito mais com o EVOCORE PRO.
        </p>
        <Button
          variant="hero"
          className="rounded-xl gap-2 px-6"
          onClick={() => setCurrentTab("premium")}
        >
          <Crown className="w-4 h-4" /> Desbloquear PRO
        </Button>
      </div>
    );
  }

  // inline mode — blur overlay
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl z-10">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground mb-2 text-center px-4">
          <span className="text-primary font-medium">{feature}</span> é exclusivo PRO
        </p>
        <Button
          variant="hero"
          size="sm"
          className="rounded-xl gap-1 text-xs"
          onClick={() => setCurrentTab("premium")}
        >
          <Crown className="w-3 h-3" /> Desbloquear
        </Button>
      </div>
    </div>
  );
};

export default PremiumGate;
