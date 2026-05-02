import { Plus, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Stories() {
  const { profile } = useApp();
  const navigate = useNavigate();

  // Mock stories for now, will connect to DB later
  const stories = [
    { id: 1, name: "Sua história", avatar: profile?.avatar_url, isSelf: true },
    { id: 2, name: "Marco_fit", avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop" },
    { id: 3, name: "Julia_training", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
    { id: 4, name: "Lucas_gym", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" },
    { id: 5, name: "Ana_yoga", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
      {stories.map((story) => (
        <motion.div
          key={story.id}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className={`relative w-[68px] h-[68px] rounded-full p-[2.5px] ${
            story.isSelf ? "bg-secondary" : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
          }`}>
            <div className="w-full h-full rounded-full bg-background p-[2px]">
              <div className="w-full h-full rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                {story.avatar ? (
                  <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg">{story.name[0]}</span>
                )}
              </div>
            </div>
            {story.isSelf && (
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary border-[3px] border-background flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-foreground max-w-[70px] truncate">
            {story.isSelf ? "Seu treino" : story.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
