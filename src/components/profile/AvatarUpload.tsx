import React, { useRef, useState } from "react";
import { Camera, ImageIcon, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  currentUrl: string | null;
  fallbackInitial: string;
  onUploaded: (url: string | null) => void;
  size?: number;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const AvatarUpload: React.FC<Props> = ({ userId, currentUrl, fallbackInitial, onUploaded, size = 96 }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type) && !file.type.startsWith("image/")) {
      toast.error("Formato não suportado. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande. Máximo 5 MB.");
      return;
    }

    setBusy(true);
    try {
      // Path MUST start with userId for RLS policy
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);
      if (dbErr) throw dbErr;

      onUploaded(publicUrl);
      toast.success("Foto atualizada");
      setOpen(false);
    } catch (e) {
      console.error("[AvatarUpload]", e);
      toast.error("Não foi possível enviar a foto");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
      if (error) throw error;
      onUploaded(null);
      toast.success("Foto removida");
      setOpen(false);
    } catch (e) {
      console.error("[AvatarUpload]", e);
      toast.error("Erro ao remover");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative group active:scale-[0.97] transition-transform"
        style={{ width: size, height: size }}
        aria-label="Alterar foto de perfil"
      >
        <div
          className="w-full h-full rounded-full overflow-hidden bg-secondary flex items-center justify-center ring-2 ring-border"
        >
          {currentUrl ? (
            <img src={currentUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <span className="font-semibold text-foreground" style={{ fontSize: size * 0.34 }}>
              {fallbackInitial}
            </span>
          )}
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-md">
          <Camera className="w-4 h-4 text-primary-foreground" />
        </div>
      </button>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Action sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="bg-card w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-2 m-0 sm:m-4 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-[16px] font-semibold text-foreground">Foto de perfil</h3>
              <button
                onClick={() => !busy && setOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:opacity-60"
                disabled={busy}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => cameraRef.current?.click()}
                disabled={busy}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[15px] font-medium text-foreground">Tirar foto</p>
                  <p className="text-[12px] text-muted-foreground">Usar câmera</p>
                </div>
              </button>

              <button
                onClick={() => galleryRef.current?.click()}
                disabled={busy}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[15px] font-medium text-foreground">Escolher da galeria</p>
                  <p className="text-[12px] text-muted-foreground">JPG, PNG ou WEBP até 5MB</p>
                </div>
              </button>

              {currentUrl && (
                <button
                  onClick={handleRemove}
                  disabled={busy}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl active:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <p className="text-[15px] font-medium text-destructive flex-1 text-left">Remover foto atual</p>
                </button>
              )}
            </div>

            {busy && (
              <div className="flex items-center justify-center gap-2 py-3 text-[13px] text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
              </div>
            )}

            <div className="h-2" />
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarUpload;
