import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { UserMoments } from "@/hooks/useMoments";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  userMoments: UserMoments;
  onClose: () => void;
  onNextUser?: () => void;
  onPrevUser?: () => void;
}

export default function MomentViewer({ userMoments, onClose, onNextUser, onPrevUser }: Props) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentMoment = userMoments.moments[index];
  const progressTimer = useRef<number>();
  const DURATION = 5000; // 5 seconds per moment

  useEffect(() => {
    setLoading(true);
    setProgress(0);
  }, [index, userMoments.user_id]);

  useEffect(() => {
    if (loading) return;

    const start = Date.now();
    progressTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const p = (elapsed / DURATION) * 100;
      
      if (p >= 100) {
        handleNext();
      } else {
        setProgress(p);
      }
    }, 50);

    return () => clearInterval(progressTimer.current);
  }, [index, loading, userMoments.user_id]);

  const handleNext = () => {
    if (index < userMoments.moments.length - 1) {
      setIndex(i => i + 1);
    } else if (onNextUser) {
      onNextUser();
      setIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
    } else if (onPrevUser) {
      onPrevUser();
      setIndex(0); // This might need logic to set to last index of previous user
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
        onClick={handleTap}
      >
        {/* Progress bars */}
        <div className="safe-top absolute top-4 left-4 right-4 z-20 flex gap-1">
          {userMoments.moments.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-50"
                style={{ 
                  width: i < index ? '100%' : i === index ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="safe-top absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-white/5">
              {userMoments.avatar_url ? (
                <img src={userMoments.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white">
                  {userMoments.name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{userMoments.name}</p>
              <p className="text-white/60 text-[10px]">
                {formatDistanceToNow(new Date(currentMoment.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center relative bg-neutral-900">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-white animate-spin opacity-50" />
            </div>
          )}
          
          {currentMoment.media_type === "image" ? (
            <img 
              src={currentMoment.media_url} 
              onLoad={() => setLoading(false)}
              className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              alt="" 
            />
          ) : (
            <video 
              src={currentMoment.media_url}
              autoPlay
              muted
              playsInline
              onCanPlayThrough={() => setLoading(false)}
              className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
        </div>

        {/* Side hints */}
        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <ChevronLeft className="text-white w-8 h-8" />
        </div>
        <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <ChevronRight className="text-white w-8 h-8" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
