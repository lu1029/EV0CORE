import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComments } from "@/hooks/useComments";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface Props {
  postId: string | null;
  onClose: () => void;
  onCountChange?: (delta: number) => void;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function CommentsSheet({ postId, onClose, onCountChange }: Props) {
  const { user } = useApp();
  const navigate = useNavigate();
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (!postId) return null;

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addComment(text);
      setText("");
      onCountChange?.(1);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao comentar");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      onCountChange?.(-1);
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const goToProfile = (uid: string) => {
    onClose();
    navigate(`/u/${uid}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card border border-border rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading font-bold text-lg">Comentários</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">Seja o primeiro a comentar</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <button onClick={() => goToProfile(c.user_id)} className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      {c.author?.avatar_url
                        ? <img src={c.author.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold">{c.author?.name?.[0]?.toUpperCase() ?? "A"}</span>}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="bg-secondary/40 rounded-2xl px-3 py-2">
                      <button onClick={() => goToProfile(c.user_id)} className="text-sm font-semibold hover:underline">
                        {c.author?.name ?? "Atleta"}
                      </button>
                      <p className="text-sm whitespace-pre-wrap break-words mt-0.5">{c.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <span className="text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                      {user?.id === c.user_id && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value.slice(0, 1000))}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Escreva um comentário…"
              className="flex-1 h-11 px-4 rounded-full bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={submit}
              disabled={sending || !text.trim()}
              className="w-11 h-11 rounded-full gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
