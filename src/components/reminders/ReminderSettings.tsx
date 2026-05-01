import React, { useState, useEffect, useCallback } from "react";
import { Bell, Dumbbell, Footprints, Apple, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Reminder {
  type: string;
  time: string;
  enabled: boolean;
}

const REMINDER_TYPES = [
  { id: 'workout', label: 'Musculação', icon: Dumbbell, color: 'text-primary' },
  { id: 'run', label: 'Corrida', icon: Footprints, color: 'text-blue-500' },
  { id: 'nutrition', label: 'Nutrição', icon: Apple, color: 'text-orange-500' },
];

export const ReminderSettings = () => {
  const { user } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadReminders = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id);
      
      const existing = data || [];
      const merged = REMINDER_TYPES.map(type => {
        const found = existing.find(r => r.type === type.id);
        return {
          type: type.id,
          time: found?.time || '08:00:00',
          enabled: found?.enabled ?? false
        };
      });
      setReminders(merged);
      setLoading(false);
    };
    loadReminders();
  }, [user]);

  const handleToggle = (type: string, enabled: boolean) => {
    setReminders(prev => prev.map(r => r.type === type ? { ...r, enabled } : r));
  };

  const handleTimeChange = (type: string, time: string) => {
    setReminders(prev => prev.map(r => r.type === type ? { ...r, time: `${time}:00` } : r));
  };

  const saveReminders = async () => {
    if (!user) return;
    setSaving(true);
    try {
      for (const r of reminders) {
        const { error } = await supabase
          .from('reminders')
          .upsert({
            user_id: user.id,
            type: r.type,
            time: r.time,
            enabled: r.enabled
          }, { onConflict: 'user_id,type' });
        
        if (error) throw error;
      }
      toast.success("Lembretes salvos!");

      // If enabled, insert an initial notification for demonstration/test
      for (const r of reminders) {
        if (r.enabled) {
          const typeLabel = REMINDER_TYPES.find(t => t.id === r.type)?.label;
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: `Lembrete de ${typeLabel}`,
            message: `Hora do seu compromisso com a ${typeLabel.toLowerCase()}!`,
            type: r.type
          });
        }
      }
      
      // Request notification permission
      if ("Notification" in window && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    } catch (e: any) {
      console.error("Save reminders error:", e);
      toast.error("Erro ao salvar lembretes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl divide-y divide-border border border-border overflow-hidden">
        {REMINDER_TYPES.map(type => {
          const reminder = reminders.find(r => r.type === type.id)!;
          const Icon = type.icon;
          return (
            <div key={type.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${type.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{type.label}</p>
                    <p className="text-[11px] text-muted-foreground">Receber notificação diária</p>
                  </div>
                </div>
                <Switch 
                  checked={reminder.enabled} 
                  onCheckedChange={(val) => handleToggle(type.id, val)} 
                />
              </div>
              
              {reminder.enabled && (
                <div className="flex items-center justify-between pl-11">
                  <span className="text-xs text-muted-foreground">Horário:</span>
                  <input 
                    type="time" 
                    value={reminder.time.slice(0, 5)}
                    onChange={(e) => handleTimeChange(type.id, e.target.value)}
                    className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={saveReminders}
        disabled={saving}
        className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar Configurações
      </button>
    </div>
  );
};
