import { Heart, MessageCircle, Share2, Bookmark, Dumbbell, Footprints, Apple, TrendingUp, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { FeedPost } from "@/hooks/useFeed";

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  workout:   { label: "Treino",    icon: Dumbbell,   color: "text-accent" },
  run:       { label: "Corrida",   icon: Footprints, color: "text-blue-400" },
  nutrition: { label: "Refeição",  icon: Apple,      color: "text-orange-400" },
  progress:  { label: "Progresso", icon: TrendingUp, color: "text-purple-400" },
  journal:   { label: "Jornada",   icon: FileText,   color: "text-primary" },
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function FeedPostCard({ post, onLike, onSave }: { post: FeedPost; onLike: (id: string) => void; onSave: (id: string) => void }) {
  const meta = TYPE_META[post.post_type] ?? TYPE_META.journal;
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-[0_4px_20px_-8px_hsl(0_0%_0%/0.4)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
          {post.author?.avatar_url
            ? <img src={post.author.avatar_url} alt={post.author.name} className="w-full h-full object-cover" />
            : <span className="text-sm font-bold">{post.author?.name?.[0]?.toUpperCase() ?? "A"}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{post.author?.name ?? "Atleta"}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className={`w-3 h-3 ${meta.color}`} />
            <span>{meta.label}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      {post.caption && (
        <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
      )}

      {post.photo_url && (
        <div className="bg-secondary/30">
          <img src={post.photo_url} alt="" className="w-full max-h-[480px] object-cover" loading="lazy" />
        </div>
      )}

      {/* Activity metrics chip row */}
      {post.activity_data && Object.keys(post.activity_data).length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {Object.entries(post.activity_data).slice(0, 4).map(([k, v]) => (
            <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border">
              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}: </span>
              <span className="font-semibold">{String(v)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2 mt-1">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1.5 px-3 h-10 rounded-full active:scale-95 transition"
        >
          <Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          <span className="text-sm font-medium">{post.likes_count}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 h-10 rounded-full active:scale-95 transition">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">{post.comments_count}</span>
        </button>
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Post de ${post.author?.name}`,
                text: post.caption,
                url: window.location.href
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copiado!");
            }
          }}
          className="ml-auto w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
        >
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
        <button 
          onClick={() => onSave(post.id)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
        >
          <Bookmark className={`w-5 h-5 ${post.saved_by_me ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
    </motion.article>
  );
}
