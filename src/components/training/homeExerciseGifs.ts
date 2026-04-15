// Mapping of exercise keys to demonstration image/GIF URLs
// Using wger.de open-source exercise database (reliable, always online)

const WGER = "https://wger.de/media/exercise-images";

export const homeExerciseGifs: Record<string, string> = {
  // Push exercises
  flexao: `${WGER}/197/Push-ups-1.png`,
  flexao_diamante: `${WGER}/197/Push-ups-1.png`,
  flexao_declinada: `${WGER}/197/Push-ups-1.png`,
  flexao_inclinada: `${WGER}/197/Push-ups-1.png`,
  pike_pushup: `${WGER}/197/Push-ups-1.png`,
  mergulho_cadeira: `${WGER}/83/Tricep-dips-1.png`,

  // Legs
  agachamento: `${WGER}/111/Squats-1.png`,
  agachamento_salto: `${WGER}/111/Squats-1.png`,
  agachamento_sumo: `${WGER}/111/Squats-1.png`,
  afundo: `${WGER}/112/Lunges-1.png`,
  afundo_bulgaro: `${WGER}/112/Lunges-1.png`,
  step_up: `${WGER}/112/Lunges-1.png`,
  wall_sit: `${WGER}/111/Squats-1.png`,
  hip_thrust: `${WGER}/171/Glute-bridge-1.png`,
  kickback: `${WGER}/171/Glute-bridge-1.png`,

  // Core
  prancha: `${WGER}/206/Front-plank-1.png`,
  prancha_lateral: `${WGER}/206/Front-plank-1.png`,
  abdominal: `${WGER}/91/Crunches-1.png`,
  elevacao_pernas: `${WGER}/91/Crunches-1.png`,
  bicicleta_ar: `${WGER}/91/Crunches-1.png`,
  superman: `${WGER}/128/Hyperextensions-1.png`,

  // Cardio / HIIT
  mountain_climber: `${WGER}/206/Front-plank-1.png`,
  burpee: `${WGER}/111/Squats-1.png`,
  jumping_jack: `${WGER}/111/Squats-1.png`,
  corrida_lugar: `${WGER}/111/Squats-1.png`,
  polichinelo: `${WGER}/111/Squats-1.png`,

  // Back (home alternatives)
  remada_toalha: `${WGER}/109/Bent-over-rowing-1.png`,

  // Flexibility
  gato_vaca: `${WGER}/128/Hyperextensions-1.png`,
  alongamento_posterior: `${WGER}/128/Hyperextensions-1.png`,
  alongamento_quadriceps: `${WGER}/112/Lunges-1.png`,
};

// Available gifKeys for AI prompt reference
export const availableGifKeys = Object.keys(homeExerciseGifs);

export function getGifUrl(gifKey?: string): string | undefined {
  if (!gifKey) return undefined;
  return homeExerciseGifs[gifKey];
}
