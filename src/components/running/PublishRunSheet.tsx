import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Map as MapIcon, ImageOff, Loader2, Check, Send } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFeed } from "@/hooks/useFeed";

type MediaChoice = "map" | "photo" | "none";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Ref to a hidden, rendered ShareCard element used for the "map" snapshot. */
  shareCardRef: React.RefObject<HTMLDivElement>;
  runId: string;
  activityLabel: string;
  distanceKm: number;
  durationFormatted: string;
  paceFormatted: string;
  caloriesKcal: number;
  elevationGainM: number;
  /** Optional pre-existing photo (signed URL) the user already attached to the run */
  existingPhotoUrl: string | null;
}

export const PublishRunSheet = ({
  open,
  onClose,
  shareCardRef,
  runId,
  activityLabel,
  distanceKm,
  durationFormatted,
  paceFormatted,
  caloriesKcal,
  elevationGainM,
  existingPhotoUrl,
}: Props) => {
  const { createPost } = useFeed();
  const fileRef = useRef<HTMLInputElement>(null);
  const [choice, setChoice] = useState<MediaChoice>("map");
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);

  // Reset when re-opening
  useEffect(() => {
    if (open) {
      setChoice(existingPhotoUrl ? "photo" : "map");
      setCaption("");
      setPhotoFile(null);
      setPhotoPreview(existingPhotoUrl);
      setDone(false);
    }
  }, [open, existingPhotoUrl]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 8MB)");
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    setChoice("photo");
  };

  const captureMapSnapshot = async (): Promise<Blob> => {
    if (!shareCardRef.current) throw new Error("Card não disponível");
    const canvas = await html2canvas(shareCardRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: 1.2,
    });
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/jpeg", 0.92)
    );
  };

  const uploadToFeedBucket = async (userId: string, blob: Blob, ext: string): Promise<string> => {
    const path = `${userId}/${runId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("feed-photos")
      .upload(path, blob, { upsert: false, contentType: blob.type });
    if (error) throw error;
    const { data } = supabase.storage.from("feed-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const publish = async () => {
    if (posting) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let photo_url: string | null = null;

      if (choice === "map") {
        const blob = await captureMapSnapshot();
        photo_url = await uploadToFeedBucket(user.id, blob, "jpg");
      } else if (choice === "photo") {
        if (photoFile) {
          // Newly picked file → upload to feed-photos
          const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
          photo_url = await uploadToFeedBucket(user.id, photoFile, ext);
        } else if (existingPhotoUrl) {
          // Re-use the photo already attached to the run (signed URL)
          // Re-fetch as blob and re-upload to public feed-photos so the post stays visible
          const res = await fetch(existingPhotoUrl);
          const blob = await res.blob();
          photo_url = await uploadToFeedBucket(user.id, blob, "jpg");
        }
      }

      await createPost({
        post_type: "run",
        caption: caption.trim(),
        photo_url,
        activity_data: {
          run_id: runId,
          activity_label: activityLabel,
          distance_km: distanceKm,
          duration: durationFormatted,
          pace: paceFormatted,
          calories: caloriesKcal,
          elevation_m: Math.round(elevationGainM),
        },
      });

      setDone(true);
      toast.success("Publicado no feed!");
      setTimeout(() => onClose(), 900);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao publicar");
    } finally {
      setPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h3 className="font-heading font-bold text-lg text-foreground">Publicar no feed</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary active:scale-95 transition-all"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-4">
              {/* Media choice */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                  Mídia
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setChoice("map")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      choice === "map"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    <MapIcon className="w-5 h-5 text-foreground" />
                    <span className="text-[11px] font-semibold">Foto do mapa</span>
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      choice === "photo"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    <Camera className="w-5 h-5 text-foreground" />
                    <span className="text-[11px] font-semibold">Foto do celular</span>
                  </button>
                  <button
                    onClick={() => {
                      setChoice("none");
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      choice === "none"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    <ImageOff className="w-5 h-5 text-foreground" />
                    <span className="text-[11px] font-semibold">Sem foto</span>
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={pickPhoto}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              {choice !== "none" && (
                <div className="rounded-2xl overflow-hidden bg-secondary/40 border border-border aspect-[9/16] max-h-72 mx-auto w-fit">
                  {choice === "map" ? (
                    <div className="w-full h-full flex items-center justify-center px-6 text-center">
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
                          <MapIcon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          A imagem do seu mapa + estatísticas será gerada
                          automaticamente no momento de publicar.
                        </p>
                      </div>
                    </div>
                  ) : photoPreview ? (
                    <img src={photoPreview} alt="Pré-visualização" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      Toque em "Foto do celular" para escolher
                    </div>
                  )}
                </div>
              )}

              {/* Caption */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                  Legenda
                </p>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder={`Conta como foi a sua ${activityLabel.toLowerCase()}...`}
                  className="w-full bg-secondary/40 border border-border rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Activity stats summary chip */}
              <div className="flex flex-wrap gap-1.5">
                <Chip>{distanceKm.toFixed(2)} km</Chip>
                <Chip>{durationFormatted}</Chip>
                {paceFormatted !== "--:--" && <Chip>{paceFormatted} /km</Chip>}
                {caloriesKcal > 0 && <Chip>{caloriesKcal} kcal</Chip>}
                {elevationGainM > 0 && <Chip>{Math.round(elevationGainM)} m ↑</Chip>}
              </div>

              {/* Publish button */}
              <button
                onClick={publish}
                disabled={posting || done}
                className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
              >
                {done ? (
                  <>
                    <Check className="w-4 h-4" /> Publicado
                  </>
                ) : posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Publicar no feed
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full bg-secondary/60 border border-border text-[11px] font-semibold text-foreground">
    {children}
  </span>
);
