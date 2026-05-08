import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EditableMeal {
  name: string;
  time: string;
  calories: number;
  foods: string[];
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  meal: EditableMeal;
  onSave: (meal: EditableMeal) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const MealEditor: React.FC<Props> = ({ meal, onSave, onClose, onDelete }) => {
  const [draft, setDraft] = useState<EditableMeal>({ ...meal, foods: [...meal.foods] });
  const [newFood, setNewFood] = useState("");

  const addFood = () => {
    if (!newFood.trim()) return;
    setDraft({ ...draft, foods: [...draft.foods, newFood.trim()] });
    setNewFood("");
  };

  const removeFood = (idx: number) => {
    setDraft({ ...draft, foods: draft.foods.filter((_, i) => i !== idx) });
  };

  const updateFood = (idx: number, value: string) => {
    setDraft({ ...draft, foods: draft.foods.map((f, i) => (i === idx ? value : f)) });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card flex items-center justify-between p-5 border-b border-border z-10">
          <h3 className="text-[18px] font-bold text-foreground">Editar refeição</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:opacity-60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Nome</label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1.5 h-11" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Horário</label>
              <Input value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} placeholder="07:00" className="mt-1.5 h-11" />
            </div>
            <div>
              <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Calorias</label>
              <Input
                type="number"
                value={draft.calories}
                onChange={(e) => setDraft({ ...draft, calories: Number(e.target.value) || 0 })}
                className="mt-1.5 h-11 tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              ["Prot. (g)", "protein"],
              ["Carb. (g)", "carbs"],
              ["Gord. (g)", "fat"],
            ] as const).map(([label, key]) => (
              <div key={key}>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
                <Input
                  type="number"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 tabular"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Alimentos</label>
            <div className="mt-1.5 space-y-2">
              {draft.foods.map((f, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={f} onChange={(e) => updateFood(idx, e.target.value)} className="h-11 flex-1" />
                  <button onClick={() => removeFood(idx)} className="w-11 h-11 rounded-md bg-secondary flex items-center justify-center active:opacity-60">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFood()}
                  placeholder="Ex: 100g aveia"
                  className="h-11 flex-1"
                />
                <button onClick={addFood} className="w-11 h-11 rounded-md bg-primary flex items-center justify-center active:opacity-60">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} className="h-12 rounded-xl px-5">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => onSave(draft)} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealEditor;
