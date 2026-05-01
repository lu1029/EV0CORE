import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Dumbbell, 
  Footprints, 
  Apple, 
  CheckCircle2, 
  Circle, 
  X, 
  Clock, 
  Trash2,
  Inbox
} from "lucide-react";
import { useNotifications, InAppNotification } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ICON_MAP = {
  workout: { icon: Dumbbell, color: "text-primary", bg: "bg-primary/10" },
  running: { icon: Footprints, color: "text-blue-500", bg: "bg-blue-500/10" },
  nutrition: { icon: Apple, color: "text-orange-500", bg: "bg-orange-500/10" },
  system: { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" },
};

export const NotificationCenter = ({ onClose }: { onClose?: () => void }) => {
  const { 
    notifications, 
    loading, 
    toggleComplete, 
    deleteNotification,
    unreadCount 
  } = useNotifications();

  return (
    <div className="flex flex-col h-full bg-background max-w-lg mx-auto border-x border-border">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h2 className="text-xl font-bold font-heading">Notificações</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-primary font-medium">{unreadCount} novas mensagens</p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center">
              <Inbox className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-bold text-lg">Tudo limpo por aqui</p>
              <p className="text-sm text-muted-foreground">Você não tem nenhuma notificação no momento.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence initial={false}>
              {notifications.map((n) => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onToggle={() => toggleComplete(n.id, !n.completed)}
                  onDelete={() => deleteNotification(n.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationItem = ({ 
  notification: n, 
  onToggle,
  onDelete
}: { 
  notification: InAppNotification; 
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const meta = ICON_MAP[n.type] || ICON_MAP.system;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group flex items-start gap-4 px-6 py-5 transition-colors ${!n.is_read ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}
    >
      <div className={`shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${meta.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-[15px] font-bold truncate ${n.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {n.title}
          </h3>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
            {format(new Date(n.created_at), "HH:mm", { locale: ptBR })}
          </span>
        </div>
        <p className={`text-sm leading-relaxed mb-3 ${n.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
          {n.message}
        </p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              n.completed 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-primary text-primary-foreground shadow-sm active:scale-95'
            }`}
          >
            {n.completed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluído
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                Marcar como feito
              </>
            )}
          </button>
          
          <button 
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!n.is_read && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </motion.div>
  );
};
