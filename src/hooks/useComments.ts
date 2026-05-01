import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { sanitizeText } from "@/lib/sanitize";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: { name: string; avatar_url: string | null };
}

export function useComments(postId: string | null) {
  const { user } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      const list = (data as any[]) ?? [];
      if (list.length === 0) { setComments([]); return; }

      const userIds = Array.from(new Set(list.map(c => c.user_id)));
      const { data: profilesData } = await supabase
        .rpc("get_public_profiles", { _user_ids: userIds });
      const profileMap = new Map((profilesData as any[] ?? []).map(p => [p.user_id, p]));

      setComments(list.map(c => ({
        ...c,
        author: profileMap.get(c.user_id)
          ? { name: (profileMap.get(c.user_id) as any).name || "Atleta", avatar_url: (profileMap.get(c.user_id) as any).avatar_url }
          : { name: "Atleta", avatar_url: null },
      })));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !postId) return;
    const safe = sanitizeText(content).slice(0, 1000).trim();
    if (!safe) return;
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, user_id: user.id, content: safe })
      .select()
      .single();
    if (error) throw error;

    const { data: profileData } = await supabase
      .rpc("get_public_profile", { _user_id: user.id });
    const p = (profileData as any[])?.[0];
    setComments(prev => [...prev, {
      ...(data as any),
      author: { name: p?.name || "Atleta", avatar_url: p?.avatar_url || null },
    }]);
  }, [user, postId]);

  const deleteComment = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("post_comments").delete().eq("id", id).eq("user_id", user.id);
    setComments(prev => prev.filter(c => c.id !== id));
  }, [user]);

  return { comments, loading, addComment, deleteComment, refetch: load };
}
