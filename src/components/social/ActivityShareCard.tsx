import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Loader2, Check } from "lucide-react";
import { useFeed, type PostType } from "@/hooks/useFeed";
import { toast } from "sonner";
import evocoreLogo from "@/assets/evocore-logo.png";

interface Metric { label: string; value: string; unit?: string }

interface Props {
  type: PostType;
  title: string;
  metrics: Metric[];
  defaultCaption?: string;
  activityData?: any;
  accent?: "primary" | "blue" | "orange" | "purple";
}

const ACCENTS: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/40 via-primary/20 to-accent/30",
  blue:    "from-blue-500/40 via-blue-400/20 to-cyan-500/30",
  orange:  "from-orange-500/40 via-amber-400/20 to-red-500/30",
  purple:  "from-purple-500/40 via-fuchsia-400/20 to-pink-500/30",
};

/** Premium share card shown at the end of an activity. Lets user post to feed in one tap. */
export default function ActivityShareCard({ type, title, metrics, defaultCaption = "", activityData = {}, accent = "primary" }: Props) {
  const { createPost } = useFeed();
  const [caption, setCaption] = useState(defaultCaption);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const share = async () => {
    setPosting(true);
    try {
      const data = { ...activityData, ...Object.fromEntries(metrics.map(m => [m.label.toLowerCase().replace(/\s/g, "_"), `${m.value}${m.unit ? " " + m.unit : ""}`])) };
      await createPost({ post_type: type, caption: caption.trim(), activity_data: data });
      setPosted(true);
      toast.success("Compartilhado no feed!");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao compartilhar");
    } finally { setPosting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-3">
      {/* Visual share card */}
      <div className={`relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br ${ACCENTS[accent]} p-6`}>
        <div className="absolute inset-0 bg-card/40" />
        <div className="absolute top-3 right-3 opacity-50">
          <img src={evocoreLogo} alt="EvoCore" className="h-5" />
        </div>
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Conquista</p>
          <h3 className="font-heading font-black text-2xl mb-5">{title}</h3>

          <div className="grid grid-cols-2 gap-3">
            {metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="bg-background/40 backdrop-blur-sm rounded-2xl p-3 border border-border/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{m.label}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading font-black text-2xl">{m.value}</span>
                  {m.unit && <span className="text-xs text-muted-foreground">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-4">{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Caption + share */}
      {!posted ? (
        <div className="space-y-3">
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Adicione uma legenda (opcional)..."
            rows={2}
            className="w-full bg-card border border-border rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={share} disabled={posting}
            className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Compartilhar no feed
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent font-bold">
          <Check className="w-5 h-5" /> Publicado!
        </div>
      )}
    </motion.div>
  );
}
