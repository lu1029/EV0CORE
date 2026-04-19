import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import evocoreLogo from "@/assets/evocore-logo.png";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("E-mail de recuperação enviado.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <img src={evocoreLogo} alt="EvoCore" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            Enviaremos um link para você criar uma nova senha.
          </p>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground">
              Verifique sua caixa de entrada em <strong>{email}</strong>.
            </p>
            <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link"}
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground hover:text-foreground">Voltar ao login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
