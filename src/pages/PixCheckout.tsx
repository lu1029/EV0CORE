import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Copy, Loader2, QrCode, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type PixResult = {
  id: string;
  brCode: string;
  brCodeBase64: string;
  amount: number;
  status: string;
  expiresAt: string;
};

const formatCPF = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

const PIX_AMOUNT_CENTS = 1499; // R$ 14,99 — plano mensal

export default function PixCheckout() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-qrcode", {
        body: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          amount: PIX_AMOUNT_CENTS,
          description: "Assinatura EvoCore Premium",
          expiresIn: 3600,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) {
        const fields = (data as any).fields;
        const msg = fields ? Object.values(fields).join(" · ") : (data as any).error;
        throw new Error(typeof msg === "string" ? msg : "Erro ao gerar Pix");
      }
      setResult(data as PixResult);
      toast.success("QR Code Pix gerado!");
    } catch (err) {
      toast.error((err as Error).message || "Não foi possível gerar o Pix");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!result?.brCode) return;
    await navigator.clipboard.writeText(result.brCode);
    setCopied(true);
    toast.success("Código Pix copiado");
    setTimeout(() => setCopied(false), 2200);
  };

  if (result) {
    const qrSrc = result.brCodeBase64?.startsWith("data:")
      ? result.brCodeBase64
      : `data:image/png;base64,${result.brCodeBase64}`;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background px-5 pt-8 pb-16 max-w-lg mx-auto"
      >
        <button
          onClick={() => setResult(null)}
          className="flex items-center gap-1 text-[15px] text-primary mb-6 active:opacity-60"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-[26px] font-bold tracking-[-0.03em] mb-1">Pague com Pix</h1>
        <p className="text-[14px] text-muted-foreground mb-6">
          Escaneie o QR Code abaixo ou copie o código Pix.
        </p>

        <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl">
            <img src={qrSrc} alt="QR Code Pix" className="w-56 h-56" />
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Valor: <span className="text-foreground font-semibold">R$ {(result.amount / 100).toFixed(2).replace(".", ",")}</span>
          </p>
          {result.expiresAt && (
            <p className="text-[12px] text-muted-foreground mt-1">
              Expira em {new Date(result.expiresAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>

        <div className="mt-5">
          <Label className="text-[12px] text-muted-foreground">Código Pix copia e cola</Label>
          <div className="mt-2 flex gap-2">
            <Input value={result.brCode} readOnly className="font-mono text-[12px]" />
            <Button onClick={copyCode} className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <p className="text-center text-[12px] text-muted-foreground mt-6">
          Após o pagamento, sua assinatura é liberada automaticamente.
        </p>
      </motion.div>
    );
  }

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="João da Silva"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            required
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            required
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            className="mt-1.5"
          />
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-4 mt-2">
          <p className="text-[12px] text-muted-foreground">Total a pagar</p>
          <p className="text-[22px] font-bold tracking-tight">
            R$ {(PIX_AMOUNT_CENTS / 100).toFixed(2).replace(".", ",")}
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-[15px] font-semibold mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando QR Code…
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              Gerar QR Code Pix
            </>
          )}
        </Button>

        <p className="text-center text-[12px] text-muted-foreground">
          Pagamento processado por Abacate Pay · Seguro
        </p>
      </form>
    </motion.div>
  );
}
