import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, QrCode } from "lucide-react";
import { PixCheckoutForm } from "@/components/PixCheckoutForm";
import { useApp } from "@/contexts/AppContext";

export default function PixCheckout() {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background px-5 pt-8 pb-16 max-w-lg mx-auto"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-[15px] text-primary mb-6 active:opacity-60"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center gap-2 mb-2">
        <QrCode className="w-5 h-5 text-primary" />
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">Pagamento via Pix</h1>
      </div>
      <p className="text-[14px] text-muted-foreground mb-6">
        Preencha seus dados para gerar o QR Code Pix.
      </p>

      <PixCheckoutForm
        amountCents={1499}
        description="Assinatura EvoCore Premium"
        defaultEmail={user?.email || ""}
      />
    </motion.div>
  );
}
