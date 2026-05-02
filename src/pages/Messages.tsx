import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle, Search, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function Messages() {
  const navigate = useNavigate();
  const { conversations, loading } = useMessages();

  return (
    <div className="pb-32 max-w-lg mx-auto min-h-screen bg-background">
      <div className="px-5 pt-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-secondary transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Mensagens</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      <div className="px-5 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-secondary border-none text-sm focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="mt-8 px-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando conversas...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold">Nenhuma mensagem ainda</p>
              <p className="text-sm text-muted-foreground mt-1 px-10">
                Inicie uma conversa através do perfil de outro atleta.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/chat/${conv.user_id}`)}
                className="flex items-center gap-4 p-3 -mx-3 rounded-2xl active:bg-secondary transition-colors cursor-pointer relative"
              >
                <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden shrink-0 border border-border/50">
                  {conv.avatar_url ? (
                    <img src={conv.avatar_url} alt={conv.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground uppercase">
                      {conv.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm truncate">{conv.name}</p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false, locale: ptBR })}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                    {conv.last_message}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {conv.unread_count}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
