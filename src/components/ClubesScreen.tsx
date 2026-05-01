import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, X, Trophy, Users, Image as ImageIcon, Type } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClubs, type Club } from "@/hooks/useClubs";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "running", label: "Corrida" },
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "weight_loss", label: "Emagrecimento" },
  { value: "consistency", label: "Consistência" },
  { value: "general", label: "Geral" },
];

export default function ClubesScreen() {
  const navigate = useNavigate();
  const { clubs, loading, join, leave, create } = useClubs();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("general");
  const [coverUrl, setCoverUrl] = useState("");
  const [font, setFont] = useState("font-sans");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Dê um nome ao clube");
    setSubmitting(true);
    try {
      await create({ 
        name: name.trim(), 
        description: desc.trim(), 
        category: cat,
        cover_url: coverUrl.trim() || null,
        font: font
      });
      toast.success("Clube criado!");
      setShowCreate(false); setName(""); setDesc(""); setCoverUrl(""); setFont("font-sans");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar clube");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-heading font-bold">Clubes</h1>
          <p className="text-sm text-muted-foreground">Treine junto, evolua junto</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-10 px-4 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Criar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="font-bold">Nenhum clube ainda</p>
          <p className="text-sm text-muted-foreground">Seja o primeiro a criar um clube!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {clubs.map(c => <ClubCard key={c.id} club={c} onJoin={join} onLeave={leave} />)}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-t-3xl md:rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-heading font-bold text-lg">Novo clube</h3>
              <button onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Nome</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Corredores 5K"
                  className="w-full mt-1 h-11 px-4 rounded-2xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Descrição</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Sobre o que é este clube?"
                  className="w-full mt-1 px-4 py-3 rounded-2xl bg-secondary/50 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Categoria</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setCat(c.value)}
                      className={`px-3 h-9 rounded-full text-sm font-medium border ${cat === c.value ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" /> Foto de Capa (URL)
                  </label>
                  <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..."
                    className="w-full mt-1 h-11 px-4 rounded-2xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Type className="w-3 h-3" /> Fonte
                  </label>
                  <select value={font} onChange={e => setFont(e.target.value)}
                    className="w-full mt-1 h-11 px-4 rounded-2xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none">
                    <option value="font-sans">Padrão (Sans)</option>
                    <option value="font-serif">Elegante (Serif)</option>
                    <option value="font-mono">Moderno (Mono)</option>
                    <option value="font-heading">Destaque (Heading)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCreate} disabled={submitting}
                className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar clube
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ClubCard({ club, onJoin, onLeave }: { club: Club; onJoin: (id: string) => void; onLeave: (id: string) => void }) {
  const fontClass = club.font || 'font-sans';
  
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-3xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow ${fontClass}`}>
      <div className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-purple-500/30 relative overflow-hidden">
        {club.cover_url ? (
          <img src={club.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={club.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Trophy className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider font-black text-white border border-white/10 z-10">
          {club.category}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold truncate leading-tight group-hover:text-primary transition-colors">{club.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{club.description || "Comunidade fitness"}</p>
          </div>
          <button
            onClick={() => club.is_member ? onLeave(club.id) : onJoin(club.id)}
            className={`shrink-0 h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              club.is_member
                ? "bg-secondary border border-border text-muted-foreground"
                : "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
            }`}
          >
            {club.is_member ? "Sair" : "Entrar"}
          </button>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center">
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
            {club.members_count} {club.members_count === 1 ? "membro" : "membros"} ativos
          </span>
        </div>
      </div>
    </motion.div>
  );
}
