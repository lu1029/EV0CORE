import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMoments } from "@/hooks/useMoments";
import MomentCreator from "./MomentCreator";
import MomentViewer from "./MomentViewer";

export default function Stories() {
  const { profile, user } = useApp();
  const { userMoments, loading } = useMoments();
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [viewerUserIndex, setViewerUserIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-[68px] h-[68px] rounded-full bg-secondary animate-pulse" />
            <div className="w-12 h-2 bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const myMoments = userMoments.find(u => u.user_id === user?.id);
  const otherMoments = userMoments.filter(u => u.user_id !== user?.id);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
        {/* Creator / Self Moment */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
          onClick={() => {
            if (myMoments) {
              setViewerUserIndex(userMoments.findIndex(u => u.user_id === user?.id));
            } else {
              setCreatorOpen(true);
            }
          }}
        >
          <div className={`relative w-[68px] h-[68px] rounded-full p-[2.5px] ${
            myMoments ? "bg-gradient-to-tr from-primary to-accent" : "bg-secondary"
          }`}>
            <div className="w-full h-full rounded-full bg-background p-[2px]">
              <div className="w-full h-full rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg">{profile?.name?.[0] || "?"}</span>
                )}
              </div>
            </div>
            {!myMoments && (
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary border-[3px] border-background flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-foreground max-w-[70px] truncate">
            {myMoments ? "Seu treino" : "Novo"}
          </span>
        </motion.div>

        {/* Other Users' Moments */}
        {otherMoments.map((um) => (
          <motion.div
            key={um.user_id}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
            onClick={() => setViewerUserIndex(userMoments.findIndex(u => u.user_id === um.user_id))}
          >
            <div className="relative w-[68px] h-[68px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
              <div className="w-full h-full rounded-full bg-background p-[2px]">
                <div className="w-full h-full rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                  {um.avatar_url ? (
                    <img src={um.avatar_url} alt={um.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-lg">{um.name[0]}</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground max-w-[70px] truncate">
              {um.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Creator Modal */}
      <MomentCreator
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
      />

      {/* Viewer Modal */}
      <AnimatePresence>
        {viewerUserIndex !== null && (
          <MomentViewer
            userMoments={userMoments[viewerUserIndex]}
            onClose={() => setViewerUserIndex(null)}
            onNextUser={() => {
              if (viewerUserIndex < userMoments.length - 1) {
                setViewerUserIndex(viewerUserIndex + 1);
              } else {
                setViewerUserIndex(null);
              }
            }}
            onPrevUser={() => {
              if (viewerUserIndex > 0) {
                setViewerUserIndex(viewerUserIndex - 1);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

