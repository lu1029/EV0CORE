import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, UserPlus, UserCheck, Image as ImageIcon, UserX, Flag, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useModeration } from "@/hooks/useModeration";
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

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, stats, posts, loading, toggleFollow } = usePublicProfile(userId);
  const { blockUser, unblockUser, checkBlockStatus, reportContent, loading: moderationLoading } = useModeration();
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (userId) {
      checkBlockStatus(userId).then(status => setIsBlocked(status.blocked));
    }
  }, [userId, checkBlockStatus]);

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
      contentType: 'profile',
      contentId: userId,
      reason: reportReason,
    });
    if (success) {
      setReportDialogOpen(false);
      setReportReason("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6 pb-32">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <p className="text-center text-muted-foreground mt-12">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-32 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary active:opacity-60">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        {!stats.is_self && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full active:bg-secondary">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setReportDialogOpen(true)}
                className="text-amber-500 focus:text-amber-500"
              >
                <Flag className="w-4 h-4 mr-2" />
                Denunciar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleBlock}
                className={isBlocked ? "text-primary" : "text-destructive focus:text-destructive"}
              >
                <UserX className="w-4 h-4 mr-2" />
                {isBlocked ? "Desbloquear" : "Bloquear"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-5">
        <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden flex items-center justify-center ring-2 ring-primary/30">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            : <span className="text-2xl font-bold">{profile.name[0]?.toUpperCase()}</span>}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-heading font-bold tabular">{stats.posts}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Posts</p>
          </div>
          <div>
            <p className="text-lg font-heading font-bold tabular">{stats.followers}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Seguidores</p>
          </div>
          <div>
            <p className="text-lg font-heading font-bold tabular">{stats.following}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Seguindo</p>
          </div>
        </div>
      </motion.div>

      <h1 className="text-xl font-heading font-bold mb-3">{profile.name}</h1>

      {!stats.is_self && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={toggleFollow}
            className={`flex-1 h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 ${
              stats.is_following
                ? "bg-secondary border border-border text-foreground"
                : "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
            }`}
          >
            {stats.is_following ? <><UserCheck className="w-4 h-4" /> Seguindo</> : <><UserPlus className="w-4 h-4" /> Seguir</>}
          </button>
          
          <button
            onClick={() => navigate(`/chat/${userId}`)}
            className="flex-1 h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-secondary border border-border text-foreground transition active:scale-95"
          >
            Mensagem
          </button>
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhuma publicação ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map(p => (
            <div key={p.id} className="aspect-square bg-secondary rounded-md overflow-hidden">
              {p.photo_url ? (
                <img src={p.photo_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full p-2 flex items-center justify-center text-[11px] text-center text-muted-foreground line-clamp-6">
                  {p.caption || "Post"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
