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

  const checkBlockStatus = useCallback(async (userId: string) => {
    if (!profile) return { blocked: false, blockedBy: false };
    try {
      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocker_id, blocked_id")
        .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${profile.id})`);

      if (error) throw error;
      
      return {
        blocked: data.some(b => b.blocker_id === profile.id),
        blockedBy: data.some(b => b.blocker_id === userId)
      };
    } catch (error) {
      console.error("Error checking block status:", error);
      return { blocked: false, blockedBy: false };
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
