import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckSquare, Square } from "lucide-react";
import { validatePassword, getPasswordStrength, validateEmail, sanitizeText } from "@/lib/sanitize";
import evocoreLogo from "@/assets/evocore-logo.png";

export default function Cadastro() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Digite seu nome.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Formato de e-mail inválido.");
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      toast.error(pwError);
      return;
    }
    if (!acceptedTerms) {
      toast.error("Aceite os Termos de Uso e Política de Privacidade.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: sanitizeText(name).slice(0, 60) },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message?.includes("already registered")
        ? "Este e-mail já está cadastrado."
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Conta criada! Confirme seu e-mail para entrar.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <img src={evocoreLogo} alt="EvoCore" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Comece sua jornada fitness agora</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength.level ? strength.color : "bg-secondary"}`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className="flex items-start gap-2 text-left w-full">
            {acceptedTerms ? <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
            <span className="text-[11px] text-muted-foreground leading-tight">
              Li e aceito os{" "}
              <Link to="/termos" target="_blank" className="text-primary underline">Termos de Uso</Link>{" "}e a{" "}
              <Link to="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link>
            </span>
          </button>

          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground space-x-2">
          <Link to="/" className="text-primary hover:underline">Já tenho conta</Link>
          <span>·</span>
          <Link to="/esqueci-senha" className="text-primary hover:underline">Esqueci a senha</Link>
        </div>
      </div>
    </div>
  );
}
