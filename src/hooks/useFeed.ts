import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { sanitizeText } from "@/lib/sanitize";

// Lightweight cross-instance event bus so every mounted useFeed() refreshes
// when a post is created/updated from anywhere in the app.
const FEED_EVENT = "evocore:feed:changed";
type FeedEventDetail = { post?: FeedPost };
function emitFeedChanged(detail: FeedEventDetail = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FEED_EVENT, { detail }));
  }
}

export type PostType = "workout" | "run" | "nutrition" | "progress" | "journal";

export interface FeedPost {
  id: string;
  user_id: string;
  post_type: string;
  caption: string | null;
  photo_url: string | null;
  activity_data: any;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: { name: string; avatar_url: string | null };
  liked_by_me?: boolean;
}

/** Global feed reader + writer */
export function useFeed() {
  const { user } = useApp();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rawPosts } = await supabase
      .from("feed_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);

    const list = (rawPosts as any[]) ?? [];
    if (list.length === 0) { setPosts([]); setLoading(false); return; }

    const userIds = Array.from(new Set(list.map(p => p.user_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", userIds);
    const profileMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p]));

    let likedSet = new Set<string>();
    if (user) {
      const { data: myLikes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", list.map(p => p.id));
      likedSet = new Set((myLikes ?? []).map((l: any) => l.post_id));
    }

    setPosts(list.map(p => ({
      ...p,
      author: profileMap.get(p.user_id) ? { name: (profileMap.get(p.user_id) as any).name || "Atleta", avatar_url: (profileMap.get(p.user_id) as any).avatar_url } : { name: "Atleta", avatar_url: null },
      liked_by_me: likedSet.has(p.id),
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createPost = useCallback(async (input: { post_type: PostType; caption?: string; photo_url?: string | null; activity_data?: any; submission_token?: string }) => {
    if (!user) throw new Error("not_authenticated");
    const safeCaption = sanitizeText(input.caption ?? "").slice(0, 2000);
    const { data, error } = await supabase
      .from("feed_posts")
      .insert({
        user_id: user.id,
        post_type: input.post_type,
        caption: safeCaption,
        photo_url: input.photo_url ?? null,
        activity_data: input.activity_data ?? {},
        submission_token: input.submission_token ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    await load();
    return data;
  }, [user, load]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.liked_by_me) {
      await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked_by_me: false, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked_by_me: true, likes_count: p.likes_count + 1 } : p));
    }
  }, [user, posts]);

  return { posts, loading, refetch: load, createPost, toggleLike };
}
