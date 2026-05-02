import { useState, useRef, useEffect } from "react";
import { 
  Heart, MessageCircle, Share2, Music, 
  ChevronLeft, Play, Pause, Volume2, VolumeX, Bookmark 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Clip {
  id: string;
  video_url: string;
  user_name: string;
  user_avatar: string | null;
  caption: string;
  likes: number;
  comments: number;
  music: string;
}

const MOCK_CLIPS: Clip[] = [
  {
    id: "1",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-dumbbells-in-a-gym-4841-large.mp4",
    user_name: "marcos_atleta",
    user_avatar: null,
    caption: "Foco total no treino de hoje! 🚀 #fit #gym",
    likes: 1240,
    comments: 45,
    music: "Phonk Music - Ultra Gym"
  },
  {
    id: "2",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-mountain-climbers-on-the-floor-34440-large.mp4",
    user_name: "ana_fitness",
    user_avatar: null,
    caption: "Cardio de respeito para começar bem a semana.",
    likes: 850,
    comments: 20,
    music: "Motivation - Summer Vibes"
  }
];

export default function Clips() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  return (
    <div className="h-screen bg-black flex flex-col max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-5 z-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">Clipes</h1>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <ClipItem 
            key={MOCK_CLIPS[index].id} 
            clip={MOCK_CLIPS[index]} 
            muted={muted}
            onToggleMute={() => setMuted(!muted)}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-6 items-center">
        <ActionButton icon={Heart} label="1.2k" color="text-red-500" />
        <ActionButton icon={MessageCircle} label="45" />
        <ActionButton icon={Bookmark} label="Salvar" />
        <ActionButton icon={Share2} label="Enviar" />
      </div>

      <div className="absolute bottom-24 left-5 right-16 z-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-secondary border border-white/20" />
          <p className="font-bold text-white text-sm">@{MOCK_CLIPS[index].user_name}</p>
          <button className="px-3 py-1 rounded-full border border-white/40 text-[10px] font-bold text-white uppercase">
            Seguir
          </button>
        </div>
        <p className="text-white text-sm leading-relaxed mb-3 line-clamp-2">
          {MOCK_CLIPS[index].caption}
        </p>
        <div className="flex items-center gap-2 text-white/80">
          <Music className="w-3.5 h-3.5" />
          <p className="text-[11px] truncate w-40">{MOCK_CLIPS[index].music}</p>
        </div>
      </div>
    </div>
  );
}

function ClipItem({ clip, muted, onToggleMute }: { clip: Clip; muted: boolean; onToggleMute: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(!playing);
    }
  };

  return (
    <div className="h-full w-full relative" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={clip.video_url}
        className="h-full w-full object-cover"
        loop
        autoPlay
        playsInline
        muted={muted}
      />
      
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Pause className="w-16 h-16 text-white/50" />
        </div>
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
        className="absolute bottom-40 right-4 p-2 rounded-full bg-black/40 text-white z-30"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color = "text-white" }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{label}</span>
    </div>
  );
}
