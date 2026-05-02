import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Image as ImageIcon, Loader2, Info, ShieldAlert, UserX, Flag, MoreVertical } from "lucide-react";
import { useChat } from "@/hooks/useMessages";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useModeration } from "@/hooks/useModeration";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: currentUser } = useApp();
  const { profile: otherUser, loading: userLoading } = usePublicProfile(userId);
  const { messages, loading: messagesLoading, hasMore, fetchMore, sendMessage } = useChat(userId);
  const { blockUser, unblockUser, checkIsBlocked, reportContent, loading: moderationLoading } = useModeration();
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  useEffect(() => {
    if (userId) {
      checkIsBlocked(userId).then(setIsBlocked);
    }
  }, [userId, checkIsBlocked]);

  const handleBlock = async () => {
    if (!userId) return;
    if (isBlocked) {
      const success = await unblockUser(userId);
      if (success) setIsBlocked(false);
    } else {
      const success = await blockUser(userId);
      if (success) setIsBlocked(true);
    }
  };

  const handleReport = async () => {
    if (!userId || !reportReason.trim()) return;
    
    const success = await reportContent({
      contentType: reportingMessageId ? 'message' : 'profile',
      contentId: reportingMessageId || userId,
      reason: reportReason,
    });

    if (success) {
      setReportDialogOpen(false);
      setReportReason("");
      setReportingMessageId(null);
    }
  };

  const scrollToBottom = () => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setShouldScroll(true);
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background max-w-lg mx-auto border-x border-border/50">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full active:bg-secondary transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div 
          onClick={() => navigate(`/u/${userId}`)}
          className="flex-1 flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
            {otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt={otherUser.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground uppercase">
                {otherUser?.name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate leading-none mb-1">{otherUser?.name}</p>
            <p className="text-[10px] text-primary font-medium">Online agora</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full active:bg-secondary">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => {
                setReportingMessageId(null);
                setReportDialogOpen(true);
              }}
              className="text-amber-500 focus:text-amber-500"
            >
              <Flag className="w-4 h-4 mr-2" />
              Denunciar Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleBlock}
              className={isBlocked ? "text-primary" : "text-destructive focus:text-destructive"}
            >
              <UserX className="w-4 h-4 mr-2" />
              {isBlocked ? "Desbloquear" : "Bloquear Usuário"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {hasMore && (
          <div className="flex justify-center py-2">
            <button 
              onClick={() => {
                setShouldScroll(false);
                fetchMore();
              }}
              disabled={messagesLoading}
              className="text-[10px] font-bold text-primary bg-primary/5 px-4 py-1.5 rounded-full active:bg-primary/10 transition-all"
            >
              {messagesLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Ver mensagens anteriores"
              )}
            </button>
          </div>
        )}

        {messagesLoading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-10 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Carregando histórico...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center space-y-2 flex-1 flex flex-col justify-center">
            <p className="text-sm font-medium">Nenhuma mensagem com {otherUser?.name}</p>
            <p className="text-xs text-muted-foreground px-10">
              Diga oi! Comece uma conversa amigável compartilhando sua rotina de treinos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === currentUser?.id;
              const showDate = i === 0 || 
                new Date(msg.created_at).toDateString() !== new Date(messages[i-1].created_at).toDateString();

              return (
                <div key={msg.id} className="space-y-4">
                  {showDate && (
                    <div className="flex justify-center py-2">
                      <span className="px-3 py-1 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {format(new Date(msg.created_at), "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 group`}>
                    {!isMine && (
                      <button 
                        onClick={() => {
                          setReportingMessageId(msg.id);
                          setReportDialogOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-secondary transition-all text-muted-foreground"
                        title="Denunciar mensagem"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine 
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/10" 
                        : "bg-secondary text-foreground rounded-tl-none"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[9px] mt-1 text-right opacity-60`}>
                        {format(new Date(msg.created_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40 bg-background shrink-0">
        <div className="flex items-end gap-2 bg-secondary/50 rounded-2xl p-2 border border-border/20 focus-within:border-primary/30 transition-all">
          <button className="p-2 rounded-xl text-muted-foreground active:text-primary transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Mensagem..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
            style={{ height: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2 rounded-xl transition-all ${
              input.trim() ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter opacity-50">
          Suas mensagens são criptografadas e seguras
        </p>
      </div>
    </div>
  );
}
