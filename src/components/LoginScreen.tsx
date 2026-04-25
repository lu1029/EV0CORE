import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { validatePassword, getPasswordStrength, validateEmail, sanitizeText } from "@/lib/sanitize";
import { logSecurityEvent } from "@/lib/auditLog";
import evocoreLogo from "@/assets/evocore-logo.png";

const LoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [customDomainDown, setCustomDomainDown] = useState(false);
  const [retryState, setRetryState] = useState<{
    provider: "google" | "apple";
    failedUri: string;
    nextUri: string;
    errorMessage: string;
  } | null>(null);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  useEffect(() => {
    // Staggered entrance animations
    const t1 = setTimeout(() => setMounted(true), 100);
    const t2 = setTimeout(() => setShowForm(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Handle OAuth error returned by the broker (e.g. State verification failed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const errCode = params.get("error_code") || params.get("code");
    const errDesc = params.get("error_description") || params.get("message");
    if (!err && !errDesc) return;

    // Clean stale OAuth state so the next attempt starts fresh
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (/oauth|state|pkce|verifier/i.test(k)) sessionStorage.removeItem(k);
      });
      Object.keys(localStorage).forEach((k) => {
        if (/oauth-state|pkce|code-verifier/i.test(k)) localStorage.removeItem(k);
      });
    } catch {}

    const isStateError =
      /state/i.test(err || "") ||
      /state/i.test(errDesc || "") ||
      errCode === "invalid_request";

    const friendly = isStateError
      ? "A sessão de login expirou. Tente entrar novamente."
      : errDesc || "Não foi possível concluir o login. Tente novamente.";

    toast.error(friendly);
    logSecurityEvent("login_failure", {
      reason: "oauth_callback_error",
      error: err,
      error_code: errCode,
      message: errDesc,
    });

    // Clean the URL so the error doesn't persist on refresh
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  // Detect if the custom domain is reachable. If we're already on the
  // Lovable domain or localhost, no check is needed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const isCustomDomain = !/lovable\.app$/i.test(host) && !/^localhost$/i.test(host) && host !== "127.0.0.1";
    if (!isCustomDomain) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    // Probe a tiny static asset on the same origin. If it fails (offline,
    // ERR_CONNECTION_CLOSED, DNS issue), surface the fallback notice.
    fetch(`${window.location.origin}/favicon.ico?cb=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => { if (!r.ok) setCustomDomainDown(true); })
      .catch(() => setCustomDomainDown(true))
      .finally(() => clearTimeout(timeout));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Formato de e-mail inválido");
      return;
    }
    if (isSignUp) {
      const pwError = validatePassword(password);
      if (pwError) { toast.error(pwError); return; }
      if (!acceptedTerms) { toast.error("Aceite os Termos de Uso e Política de Privacidade"); return; }
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: sanitizeText(name).slice(0, 60) },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar antes de entrar.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          toast.error("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
          logSecurityEvent("login_failure", { reason: "email_not_confirmed" });
          return;
        }
      }
    } catch (error: any) {
      const msg = error.message?.includes("Invalid login")
        ? "E-mail ou senha incorretos"
        : error.message?.includes("already registered")
        ? "Este e-mail já está cadastrado"
        : error.message || "Erro ao autenticar";
      if (!isSignUp) logSecurityEvent("login_failure", { reason: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotCooldown > 0 || loading) return;
    if (!email) { toast.error("Digite seu e-mail"); return; }
    setLoading(true);
    try {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } catch {
        // swallow — always show generic message
      }
      toast.success("Se este e-mail estiver cadastrado, você receberá um link em breve.");
      setIsForgotPassword(false);
      setForgotCooldown(60);
      const interval = setInterval(() => {
        setForgotCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const runOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    setRetryState(null);

    // Clean any stale OAuth state from a previous/aborted attempt before starting
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (/oauth|state|pkce|verifier/i.test(k)) sessionStorage.removeItem(k);
      });
    } catch {}

    const redirect_uri = typeof window !== "undefined" ? window.location.origin : "";
    console.info(`[OAuth:${provider}] iniciando`, { redirect_uri });

    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri });
      console.info(`[OAuth:${provider}] result:`, {
        redirected: result?.redirected,
        hasError: !!result?.error,
        errorMessage: result?.error?.message,
      });
      if (result?.redirected) return;
      if (result?.error) throw result.error;
      // success — session set
    } catch (err: any) {
      console.error(`[OAuth:${provider}] falhou:`, err);
      logSecurityEvent("login_failure", { reason: "oauth_error", provider, message: err?.message });
      const msg = err?.message || `Erro ao entrar com ${provider === "google" ? "Google" : "Apple"}`;
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => runOAuth("google");
  const handleAppleLogin = () => runOAuth("apple");

  const handleRetryWithFallback = () => {
    if (!retryState) return;
    runOAuth(retryState.provider);
  };



  const formContent = isForgotPassword ? (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground">Recuperar senha</h2>
        <p className="text-muted-foreground text-sm mt-1">Digite seu e-mail para receber o link</p>
      </div>
      <form onSubmit={handleForgotPassword} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl backdrop-blur-sm" />
        </div>
        <Button type="submit" className="w-full h-12 rounded-xl text-base gradient-primary text-primary-foreground font-semibold" disabled={loading || forgotCooldown > 0}>
          {loading ? "Enviando..." : forgotCooldown > 0 ? `Aguarde ${forgotCooldown}s` : "Enviar link"}
        </Button>
      </form>
      <div className="text-center pt-4">
        <button onClick={() => setIsForgotPassword(false)} className="text-sm text-primary font-medium">
          Voltar ao login
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isSignUp ? "Comece sua evolução agora" : "Entre na sua conta para continuar"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignUp && (
          <div className="relative animate-fade-in">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
              className="pl-10 h-12 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl backdrop-blur-sm" />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl backdrop-blur-sm" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl backdrop-blur-sm" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button type="submit" className="w-full h-12 rounded-xl text-base gradient-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Carregando...
            </div>
          ) : isSignUp ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border/30" />
        <span className="text-xs text-muted-foreground">ou continue com</span>
        <div className="flex-1 h-px bg-border/30" />
        </div>
        {/* Password strength indicator */}
        {isSignUp && password.length > 0 && (
          <div className="space-y-1 animate-fade-in">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength.level ? passwordStrength.color : 'bg-secondary'}`} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">{passwordStrength.label}</p>
          </div>
        )}
        {/* Terms checkbox for signup */}
        {isSignUp && (
          <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className="flex items-start gap-2 text-left animate-fade-in">
            {acceptedTerms ? <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
            <span className="text-[11px] text-muted-foreground leading-tight">
              Li e aceito os{" "}
              <a href="/termos" target="_blank" className="text-primary underline">Termos de Uso</a>{" "}e a{" "}
              <a href="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</a>
            </span>
          </button>
        )}
      <div className="flex gap-3">
        <button onClick={handleGoogleLogin} disabled={loading}
          className="flex-1 h-12 rounded-xl glass-card flex items-center justify-center gap-2 text-sm text-foreground font-medium active:scale-95 transition-all hover:border-primary/30">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button onClick={handleAppleLogin} disabled={loading}
          className="flex-1 h-12 rounded-xl glass-card flex items-center justify-center gap-2 text-sm text-foreground font-medium active:scale-95 transition-all hover:border-primary/30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Apple
        </button>
      </div>

      <div className="text-center pt-3 pb-1">
        <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground active:scale-95 transition-transform">
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
  );

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Animated mesh background */}
      <div className="mesh-bg">
        <div className="mesh-bg-extra" />
        <div className="mesh-bg-orb-4" />
        <div className="mesh-bg-orb-5" />
      </div>
      <div className="noise-overlay" />

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animation: `float-orb-${(i % 4) + 1} ${15 + i * 3}s ease-in-out infinite ${i * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-6">
        {/* Logo section - centered with staggered animation */}
        <div className="flex-1 flex flex-col items-center justify-center pt-12 pb-4">
          <div
            className="transition-all duration-1000 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
            }}
          >
            <img
              src={evocoreLogo}
              alt="EvoCore"
              className="h-28 w-auto object-contain mx-auto mb-4 drop-shadow-[0_0_30px_hsl(239,84%,67%,0.3)]"
            />
          </div>
          <div
            className="transition-all duration-700 ease-out delay-300"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p className="text-muted-foreground text-center text-sm tracking-wide">
              Evolua seu corpo. Domine sua rotina.
            </p>
          </div>
        </div>

        {/* Form section with slide-up animation */}
        <div
          className="pb-8 transition-all duration-700 ease-out"
          style={{
            opacity: showForm ? 1 : 0,
            transform: showForm ? "translateY(0)" : "translateY(40px)",
          }}
        >
          {formContent}
        </div>
      </div>

      {/* Retry modal: shown when OAuth fails with a redirect_uri error */}
      {retryState && (
        <div
          className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="oauth-retry-title"
        >
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-destructive/15 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6 text-destructive" />
              </div>
              <h2 id="oauth-retry-title" className="text-xl font-heading font-bold text-foreground">
                Falha no login com {retryState.provider === "google" ? "Google" : "Apple"}
              </h2>
              <p className="text-sm text-muted-foreground">
                O servidor recusou o endereço de retorno. Podemos tentar novamente usando um endereço alternativo.
              </p>
            </div>

            <div className="space-y-2 text-xs bg-secondary/40 rounded-lg p-3 border border-border/30">
              <div>
                <p className="text-muted-foreground">Endereço que falhou</p>
                <p className="font-mono text-foreground break-all">{retryState.failedUri}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Será usado agora</p>
                <p className="font-mono text-primary break-all">{retryState.nextUri}</p>
              </div>
              {retryState.errorMessage && (
                <div>
                  <p className="text-muted-foreground">Erro original</p>
                  <p className="text-foreground/80 break-words">{retryState.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRetryWithFallback}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
                disabled={loading}
              >
                {loading ? "Tentando..." : "Tentar novamente"}
              </Button>
              <Button
                onClick={() => setRetryState(null)}
                variant="ghost"
                className="w-full h-10 rounded-xl text-muted-foreground"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
