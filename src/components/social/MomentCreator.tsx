import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useMoments } from "@/hooks/useMoments";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

export default function MomentCreator({ open, onClose }: Props) {
  const { user } = useApp();
  const { createMoment } = useMoments();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<"image" | "video">("image");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WEBP ou MP4.");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo 20MB.");
      return;
    }

    setFile(f);
    setType(f.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!user || !file) return;
    setSubmitting(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from("moments")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("moments").getPublicUrl(path);
      
      await createMoment(pub.publicUrl, type);
      
      toast.success("Momento compartilhado!");
      onClose();
      reset();
    } catch (e: any) {
      toast.error(e.message || "Erro ao compartilhar momento");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Header */}
        <div className="safe-top p-4 flex items-center justify-between z-10">
          <button
            onClick={() => { onClose(); reset(); }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-white font-bold">Novo Momento</h3>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center relative p-4">
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-sm aspect-[9/16] rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Camera className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold">Capturar momento</p>
                <p className="text-white/50 text-sm">Toque para selecionar foto ou vídeo</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-neutral-900">
              {type === "image" ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <video src={preview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              )}
              
              <button
                onClick={reset}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 safe-bottom">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFile}
          />
          
          <button
            onClick={submit}
            disabled={!preview || submitting}
            className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Compartilhar agora
              </>
            )}
          </button>
          <p className="text-center text-white/40 text-xs mt-4">
            Este momento ficará disponível por 24 horas.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
