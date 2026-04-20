import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildPolyline, type LatLng } from "@/lib/routePolyline";

interface Props {
  runId: string;
  photoUrl: string | null;
  points: LatLng[];
  onPhotoChange: (url: string | null) => void;
}

export const ActivityPhotoMode = ({ runId, photoUrl, points, onPhotoChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const miniPoly = points.length > 1 ? buildPolyline(points, { padding: 6, targetSize: 100 }) : null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 8MB)");
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${runId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("activity-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("activity-photos")
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
      if (signErr) throw signErr;

      const { error: updErr } = await supabase
        .from("runs")
        .update({ photo_url: path }) // store path; sign on read
        .eq("id", runId);
      if (updErr) throw updErr;

      onPhotoChange(signed.signedUrl);
      toast.success("Foto adicionada!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!confirm("Remover a foto desta atividade?")) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Try removing both common extensions
      await supabase.storage
        .from("activity-photos")
        .remove([`${user.id}/${runId}.jpg`, `${user.id}/${runId}.jpeg`, `${user.id}/${runId}.png`, `${user.id}/${runId}.webp`]);

      await supabase.from("runs").update({ photo_url: null }).eq("id", runId);
      onPhotoChange(null);
      toast.success("Foto removida");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao remover");
    } finally {
      setUploading(false);
    }
  };

  if (!photoUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-secondary/60 to-background flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
          <Camera className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-foreground font-heading font-bold text-base">Adicionar foto da atividade</p>
          <p className="text-muted-foreground text-xs mt-1 max-w-xs">
            Capture o momento e transforme seu resumo em algo único
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? "Enviando..." : "Tirar / escolher foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Background photo */}
      <img src={photoUrl} alt="Atividade" className="absolute inset-0 w-full h-full object-cover" />
      {/* Dark gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

      {/* Mini route map */}
      {miniPoly && (
        <div className="absolute top-3 right-3 w-20 h-20 rounded-2xl glass-card p-2 backdrop-blur-md">
          <svg viewBox={`0 0 ${miniPoly.width} ${miniPoly.height}`} className="w-full h-full">
            <path
              d={miniPoly.d}
              stroke="hsl(142, 71%, 55%)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 4px hsl(142, 71%, 50%))" }}
            />
          </svg>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-3 left-3 flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-9 h-9 rounded-full glass-card backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Trocar foto"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 text-foreground" />}
        </button>
        <button
          onClick={removePhoto}
          disabled={uploading}
          className="w-9 h-9 rounded-full glass-card backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Remover foto"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </motion.div>
  );
};
