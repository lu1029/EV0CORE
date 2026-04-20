import React from "react";
import { useExerciseGif } from "@/hooks/useExerciseGif";

interface ExerciseThumbProps {
  name: string;
  muscle: string;
  emoji: string;
  fallbackGifUrl?: string;
  className?: string;
}

/** Thumbnail compacto que resolve a mídia do exercício (gif/imagem) e mostra o emoji enquanto carrega ou se falhar. */
const ExerciseThumb = ({ name, muscle, emoji, fallbackGifUrl, className = "" }: ExerciseThumbProps) => {
  const { gifUrl } = useExerciseGif(name, fallbackGifUrl, muscle);

  if (gifUrl) {
    return (
      <img
        src={gifUrl}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return <span className={`text-base ${className}`}>{emoji}</span>;
};

export default ExerciseThumb;
