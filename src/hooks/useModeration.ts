import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export function useModeration() {
  const { profile } = useApp();
  const [loading, setLoading] = useState(false);

  const blockUser = useCallback(async (blockedId: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_blocks")
        .insert({
          blocker_id: profile.id,
          blocked_id: blockedId
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Usuário já está bloqueado");
          return true;
        }
        throw error;
      }
      toast.success("Usuário bloqueado com sucesso");
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Erro ao bloquear usuário");
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const unblockUser = useCallback(async (blockedId: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .match({ blocker_id: profile.id, blocked_id: blockedId });

      if (error) throw error;
      toast.success("Usuário desbloqueado");
      return true;
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Erro ao desbloquear usuário");
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const checkIsBlocked = useCallback(async (userId: string) => {
    if (!profile) return false;
    try {
      const { data, error } = await supabase
        .from("user_blocks")
        .select("id")
        .match({ blocker_id: profile.id, blocked_id: userId })
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking block status:", error);
      return false;
    }
  }, [profile]);

  const reportContent = useCallback(async (params: {
    contentType: 'message' | 'post' | 'comment' | 'moment' | 'profile';
    contentId: string;
    reason: string;
    details?: string;
  }) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("content_reports")
        .insert({
          reporter_id: profile.id,
          content_type: params.contentType,
          content_id: params.contentId,
          reason: params.reason,
          details: params.details
        });

      if (error) throw error;
      toast.success("Denúncia enviada para análise");
      return true;
    } catch (error) {
      console.error("Error reporting content:", error);
      toast.error("Erro ao enviar denúncia");
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return {
    loading,
    blockUser,
    unblockUser,
    checkIsBlocked,
    reportContent
  };
}
