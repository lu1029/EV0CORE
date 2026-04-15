import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {sessionId ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Premium ativado com sucesso! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Aproveite todos os recursos premium do EVOCORE.
            </p>
            <Button variant="hero" onClick={() => navigate("/")} className="rounded-xl">
              Voltar para o app
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Nenhuma sessão encontrada</h1>
            <Button variant="ghost" onClick={() => navigate("/")} className="rounded-xl">
              Voltar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
