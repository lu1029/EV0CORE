import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, X, Trophy, Users } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Dê um nome ao clube");
    setSubmitting(true);
    try {
      await create({ name: name.trim(), description: desc.trim(), category: cat });
      toast.success("Clube criado!");
      setShowCreate(false); setName(""); setDesc("");
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
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-purple-500/30 relative">
        {club.cover_url && <img src={club.cover_url} className="w-full h-full object-cover" alt="" />}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-[10px] uppercase tracking-wide font-bold text-white">
          {club.category}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-bold truncate">{club.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{club.description || "Comunidade fitness"}</p>
          </div>
          <button
            onClick={() => club.is_member ? onLeave(club.id) : onJoin(club.id)}
            className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold ${
              club.is_member
                ? "bg-secondary border border-border text-muted-foreground"
                : "gradient-primary text-primary-foreground"
            }`}
          >
            {club.is_member ? "Sair" : "Entrar"}
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" /> {club.members_count} {club.members_count === 1 ? "membro" : "membros"}
        </div>
      </div>
    </motion.div>
  );
}
