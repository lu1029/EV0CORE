import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const LoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      const msg = error.message?.includes("Invalid login")
        ? "E-mail ou senha incorretos"
        : error.message?.includes("already registered")
        ? "Este e-mail já está cadastrado"
        : error.message || "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("Link de recuperação enviado para seu e-mail!");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (error: any) {
      toast.error("Erro ao entrar com Google");
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (error: any) {
      toast.error("Erro ao entrar com Apple");
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1080} height={1920} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen px-6">
          <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-8">
            <h1 className="text-5xl font-heading font-bold tracking-tight text-gradient mb-2">EVOCORE</h1>
          </div>
          <div className="animate-slide-up pb-8 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground">Recuperar senha</h2>
              <p className="text-muted-foreground text-sm mt-1">Digite seu e-mail para receber o link</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl" />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full h-12 rounded-xl text-base" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
            </form>
            <div className="text-center pt-4">
              <button onClick={() => setIsForgotPassword(false)} className="text-sm text-primary font-medium">
                Voltar ao login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1080} height={1920} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen px-6">
        <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-8">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-heading font-bold tracking-tight text-gradient mb-2">EVOCORE</h1>
            <p className="text-muted-foreground text-center text-sm">Evolua seu corpo. Domine sua rotina.</p>
          </div>
        </div>
        <div className="animate-slide-up pb-8 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? "Comece sua evolução agora" : "Entre na sua conta para continuar"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full h-12 rounded-xl text-base" disabled={loading}>
              {loading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="flex gap-3">
            <Button variant="glass" className="flex-1 h-12 rounded-xl gap-2" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Button>
            <Button variant="glass" className="flex-1 h-12 rounded-xl gap-2" onClick={handleAppleLogin} disabled={loading}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </Button>
          </div>

          <div className="text-center pt-4 pb-2">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground">
              {isSignUp ? "Já tem conta? " : "Não tem conta? "}
              <span className="text-primary font-medium">{isSignUp ? "Fazer login" : "Criar conta"}</span>
            </button>
          </div>

          {!isSignUp && (
            <button onClick={() => setIsForgotPassword(true)} className="block mx-auto text-xs text-muted-foreground hover:text-primary transition-colors">
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
