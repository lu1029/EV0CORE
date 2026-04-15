import React, { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const presets = ["Senti forte 💪", "Carga leve", "Carga pesada", "Dor articular ⚠️", "Ótimo treino 🔥"];

interface WorkoutNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const WorkoutNotes = ({ notes, onNotesChange }: WorkoutNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Observações</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => onNotesChange(notes ? `${notes}\n${p}` : p)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Como você se sentiu? Ajustes de carga..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="bg-secondary/60 border-border/30 rounded-xl text-sm min-h-[60px] resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default WorkoutNotes;
