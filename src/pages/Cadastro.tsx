import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import evocoreLogo from "@/assets/evocore-logo.png";

export default function Cadastro() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { full_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Confirme seu e-mail para entrar.");
    navigate("/login");
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
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground space-x-2">
          <Link to="/login" className="text-primary hover:underline">Já tenho conta</Link>
          <span>·</span>
          <Link to="/esqueci-senha" className="text-primary hover:underline">Esqueci a senha</Link>
        </div>
      </div>
    </div>
  );
}
