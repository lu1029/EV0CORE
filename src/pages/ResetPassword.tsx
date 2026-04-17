import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { validatePassword } from "@/lib/sanitize";
import { logSecurityEvent } from "@/lib/auditLog";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash and creates a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(password);
    if (err) { toast.error(err); return; }
    if (password !== confirm) { toast.error("As senhas não coincidem"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      logSecurityEvent("password_changed", {});
      toast.success("Senha atualizada com sucesso!");
      await supabase.auth.signOut();
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar senha");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={submit} className="glass-card max-w-sm w-full p-6 rounded-2xl space-y-4">
        <h1 className="text-xl font-heading font-bold text-foreground">Redefinir senha</h1>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
        ) : (
          <>
            <Input type="password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input type="password" placeholder="Confirmar nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar nova senha"}</Button>
          </>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
