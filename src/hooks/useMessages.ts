import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  user_id: string;
  name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useMessages() {
  const { profile } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchConversations = async (reset = false) => {
    if (!profile) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }
      
      const currentPage = reset ? 0 : page;
      
      const { data, error } = await supabase.rpc("get_conversations", {
        limit_val: PAGE_SIZE,
        offset_val: currentPage * PAGE_SIZE
      });

      if (error) throw error;

      const formattedData: Conversation[] = (data || []).map((conv: any) => ({
        user_id: conv.peer_id,
        name: conv.peer_name,
        avatar_url: conv.peer_avatar_url,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: Number(conv.unread_count)
      }));

      if (reset) {
        setConversations(formattedData);
      } else {
        // Evitar duplicatas se o realtime disparar um refresh enquanto paginamos
        setConversations(prev => {
          const combined = reset ? formattedData : [...prev, ...formattedData];
          const unique = Array.from(new Map(combined.map(c => [c.user_id, c])).values());
          return unique.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        });
      }
      
      setHasMore(formattedData.length === PAGE_SIZE);
      if (!reset) setPage(prev => prev + 1);
      
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(true);

    const channel = supabase
      .channel("dm-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => fetchConversations(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { 
    conversations, 
    loading, 
    hasMore, 
    fetchMore: () => fetchConversations(false), 
    refresh: () => fetchConversations(true) 
  };
}

export function useChat(otherUserId: string | undefined) {
  const { profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const fetchMessages = async (reset = false) => {
    if (!profile || !otherUserId) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const newMessages = data || [];
      // Invertemos apenas para o estado interno, mas no banco buscamos DESC para paginação
      const reversed = [...newMessages].reverse();

      if (reset) {
        setMessages(reversed);
      } else {
        setMessages(prev => [...reversed, ...prev]);
      }

      setHasMore(newMessages.length === PAGE_SIZE);
      if (!reset) setPage(prev => prev + 1);

      // Marcar como lidas
      if (reset || currentPage === 0) {
        const unreadIds = newMessages
          ?.filter(m => !m.is_read && m.receiver_id === profile.id)
          .map(m => m.id);

        if (unreadIds && unreadIds.length > 0) {
          await supabase
            .from("direct_messages")
            .update({ is_read: true })
            .in("id", unreadIds);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!profile || !otherUserId || (!content && !imageUrl)) return;
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: profile.id,
          receiver_id: otherUserId,
          content,
          image_url: imageUrl || null
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMessages(prev => [...prev, data as Message]);
      }
    } catch (error: any) {
      if (error.message?.includes('Ação bloqueada')) {
        toast.error("Você não pode enviar mensagens para este usuário.");
      } else {
        toast.error("Erro ao enviar mensagem");
      }
    }
  };

  useEffect(() => {
    fetchMessages(true);

    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === profile?.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
            supabase.from("direct_messages").update({ is_read: true }).eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, otherUserId]);

  return { messages, loading, hasMore, fetchMore: () => fetchMessages(false), sendMessage };
}
