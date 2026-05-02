import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export interface PublicProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export interface PublicProfileStats {
  followers: number;
  following: number;
  posts: number;
  is_following: boolean;
  is_self: boolean;
}

export function usePublicProfile(userId: string | undefined) {
  const { user } = useApp();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicProfileStats>({
    followers: 0, following: 0, posts: 0, is_following: false, is_self: false,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: rpcData, error: profileError } = await supabase
        .rpc("get_public_profile", { _user_id: userId });

      const profileData = Array.isArray(rpcData) ? rpcData[0] : rpcData;

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile({
        user_id: profileData.user_id,
        name: profileData.name || "Atleta",
        avatar_url: profileData.avatar_url,
      });

      const [{ count: followers }, { count: following }, { count: postsCount }, postsRes, followCheck] = await Promise.all([
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("feed_posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("feed_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
        user
          ? supabase.from("user_follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setStats({
        followers: followers || 0,
        following: following || 0,
        posts: postsCount || 0,
        is_following: !!(followCheck as any).data,
        is_self: user?.id === userId,
      });
      setPosts((postsRes.data as any[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = useCallback(async () => {
    if (!user || !userId || user.id === userId) return;
    if (stats.is_following) {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setStats(s => ({ ...s, is_following: false, followers: Math.max(0, s.followers - 1) }));
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: userId });
      setStats(s => ({ ...s, is_following: true, followers: s.followers + 1 }));
    }
  }, [user, userId, stats.is_following]);

  return { profile, stats, posts, loading, toggleFollow, refetch: load };
}
