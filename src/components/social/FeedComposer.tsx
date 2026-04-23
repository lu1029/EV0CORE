import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Camera, Loader2, Dumbbell, Footprints, Apple, TrendingUp, FileText } from "lucide-react";
import { useFeed, type PostType } from "@/hooks/useFeed";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const MAX_FEED_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

interface Props { open: boolean; onClose: () => void; defaultType?: PostType; defaultActivity?: any; }

const TYPE_OPTIONS: { value: PostType; label: string; icon: any; color: string }[] = [
  { value: "journal",   label: "Jornada",   icon: FileText,   color: "text-primary" },
  { value: "workout",   label: "Treino",    icon: Dumbbell,   color: "text-accent" },
  { value: "run",       label: "Corrida",   icon: Footprints, color: "text-blue-400" },
  { value: "nutrition", label: "Refeição",  icon: Apple,      color: "text-orange-400" },
  { value: "progress",  label: "Progresso", icon: TrendingUp, color: "text-purple-400" },
];

export default function FeedComposer({ open, onClose, defaultType = "journal", defaultActivity }: Props) {
  const { user } = useApp();
  const { createPost } = useFeed();
  const [type, setType] = useState<PostType>(defaultType);
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submissionTokenRef = useRef<string>(crypto.randomUUID());

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WEBP ou GIF.");
      return;
    }
    if (f.size > MAX_FEED_PHOTO_SIZE) {
      toast.error("Foto muito grande. Máximo 10MB.");
      return;
    }
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!user) return;
    if (submitting) return;
    if (!caption.trim() && !photoFile) {
      toast.error("Adicione uma foto ou escreva algo");
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = MIME_TO_EXT[photoFile.type] || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("feed-photos").upload(path, photoFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("feed-photos").getPublicUrl(path);
        photo_url = pub.publicUrl;
      }
      await createPost({
        post_type: type,
        caption: caption.trim(),
        photo_url,
        activity_data: defaultActivity ?? {},
        submission_token: submissionTokenRef.current,
      });
      toast.success("Publicado no feed!");
      setCaption(""); setPhotoFile(null); setPreview(null);
      submissionTokenRef.current = crypto.randomUUID();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao publicar");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6">
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-lg bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading font-bold text-lg">Compartilhar</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Type selector */}
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 scrollbar-hide">
            {TYPE_OPTIONS.map(opt => {
              const active = type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full border text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  <opt.icon className={`w-3.5 h-3.5 ${active ? "" : opt.color}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, 2000))}
              maxLength={2000}
              placeholder="O que você conquistou hoje?"
              rows={5}
              className="w-full bg-secondary/50 border border-border rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[11px] text-muted-foreground text-right">{caption.length}/2000</p>
          </div>

          {preview && (
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img src={preview} alt="preview" className="w-full max-h-72 object-cover" />
              <button
                onClick={() => { setPhotoFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-border cursor-pointer active:opacity-70 text-sm text-muted-foreground">
            <Camera className="w-4 h-4" />
            {photoFile ? "Trocar foto" : "Adicionar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        <div className="p-5 border-t border-border">
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Publicar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
