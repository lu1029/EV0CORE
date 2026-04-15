// Mapping of exercise keys to demonstration image URLs
// Using wger.de open-source exercise database (reliable, Creative Commons)

const W = "https://wger.de/media/exercise-images";

export const homeExerciseGifs: Record<string, string> = {
  // Push exercises
  flexao: `${W}/192/Bench-press-1.png`,
  flexao_diamante: `${W}/61/Close-grip-bench-press-1.png`,
  flexao_declinada: `${W}/100/Decline-bench-press-1.png`,
  flexao_inclinada: `${W}/41/Incline-bench-press-1.png`,
  pike_pushup: `${W}/119/seated-barbell-shoulder-press-large-1.png`,
  mergulho_cadeira: `${W}/83/Bench-dips-1.png`,

  // Legs
  agachamento: `${W}/191/Front-squat-1-857x1024.png`,
  agachamento_salto: `${W}/191/Front-squat-1-857x1024.png`,
  agachamento_sumo: `${W}/130/Narrow-stance-hack-squats-1-1024x721.png`,
  afundo: `${W}/113/Walking-lunges-1.png`,
  afundo_bulgaro: `${W}/113/Walking-lunges-1.png`,
  step_up: `${W}/113/Walking-lunges-1.png`,
  wall_sit: `${W}/130/Narrow-stance-hack-squats-1-1024x721.png`,
  hip_thrust: `${W}/116/Good-mornings-2.png`,
  kickback: `${W}/116/Good-mornings-2.png`,

  // Core
  prancha: `${W}/206/Front-plank-1.png`,
  prancha_lateral: `${W}/206/Front-plank-1.png`,
  abdominal: `${W}/91/Crunches-1.png`,
  elevacao_pernas: `${W}/125/Leg-raises-2.png`,
  bicicleta_ar: `${W}/176/Cross-body-crunch-1.png`,
  superman: `${W}/128/Hyperextensions-1.png`,

  // Cardio / HIIT
  mountain_climber: `${W}/91/Crunches-1.png`,
  burpee: `${W}/191/Front-squat-1-857x1024.png`,
  jumping_jack: `${W}/191/Front-squat-1-857x1024.png`,
  corrida_lugar: `${W}/191/Front-squat-1-857x1024.png`,
  polichinelo: `${W}/191/Front-squat-1-857x1024.png`,

  // Back (home alternatives)
  remada_toalha: `${W}/109/Barbell-rear-delt-row-1.png`,

  // Flexibility
  gato_vaca: `${W}/128/Hyperextensions-1.png`,
  alongamento_posterior: `${W}/116/Good-mornings-2.png`,
  alongamento_quadriceps: `${W}/113/Walking-lunges-1.png`,
};

export const availableGifKeys = Object.keys(homeExerciseGifs);

export function getGifUrl(gifKey?: string): string | undefined {
  if (!gifKey) return undefined;
  return homeExerciseGifs[gifKey];
}
