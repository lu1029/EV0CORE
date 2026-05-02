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

  const fetchConversations = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      // Busca as mensagens mais recentes de cada conversa
      // No Supabase/Postgres, poderíamos usar DISTINCT ON, mas para simplicidade aqui
      // Vamos buscar as mensagens e agrupar no JS ou via RPC
      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          id, sender_id, receiver_id, content, created_at, is_read,
          sender:profiles!direct_messages_sender_id_fkey(id, name, avatar_url),
          receiver:profiles!direct_messages_receiver_id_fkey(id, name, avatar_url)
        `)
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const convMap = new Map<string, Conversation>();

      data.forEach((msg: any) => {
        const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
        if (!otherUser) return;

        if (!convMap.has(otherUser.id)) {
          convMap.set(otherUser.id, {
            user_id: otherUser.id,
            name: otherUser.name,
            avatar_url: otherUser.avatar_url,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: (!msg.is_read && msg.receiver_id === profile.id) ? 1 : 0
          });
        } else if (!msg.is_read && msg.receiver_id === profile.id) {
          const existing = convMap.get(otherUser.id)!;
          existing.unread_count += 1;
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Realtime subscription
    const channel = supabase
      .channel("dm-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { conversations, loading, refresh: fetchConversations };
}

export function useChat(otherUserId: string | undefined) {
  const { profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!profile || !otherUserId) return;
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Marcar como lidas
      const unreadIds = data
        ?.filter(m => !m.is_read && m.receiver_id === profile.id)
        .map(m => m.id);

      if (unreadIds && unreadIds.length > 0) {
        await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .in("id", unreadIds);
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
      const { error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: profile.id,
          receiver_id: otherUserId,
          content,
          image_url: imageUrl || null
        });

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === profile?.id && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === profile?.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, otherUserId]);

  return { messages, loading, sendMessage };
}
