// Mapping of exercise keys to demonstration images.
// Source: yuhonas/free-exercise-db (CC0) via jsDelivr CDN — reliable, real
// demonstration photos for each exercise.
const IMG = (id: string) => `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${id}/0.jpg`;

export const homeExerciseGifs: Record<string, string> = {
  // Push exercises
  flexao: IMG("Pushups"),
  flexao_diamante: IMG("Close-Grip_Push-Up_off_of_a_Dumbbell"),
  flexao_declinada: IMG("Decline_Push-Up"),
  flexao_inclinada: IMG("Incline_Push-Up"),
  pike_pushup: IMG("Pushups_-_Close_Triceps_Position"),
  mergulho_cadeira: IMG("Bench_Dips"),

  // Legs
  agachamento: IMG("Bodyweight_Squat"),
  agachamento_salto: IMG("Box_Squat"),
  agachamento_sumo: IMG("Plie_Dumbbell_Squat"),
  afundo: IMG("Bodyweight_Walking_Lunge"),
  afundo_bulgaro: IMG("Dumbbell_Lunges"),
  step_up: IMG("Dumbbell_Step_Ups"),
  wall_sit: IMG("Wall_Squat"),
  hip_thrust: IMG("Single_Leg_Glute_Bridge"),
  kickback: IMG("Rear_Leg_Raises"),

  // Core
  prancha: IMG("Plank"),
  prancha_lateral: IMG("Side_Bridge"),
  abdominal: IMG("Crunches"),
  elevacao_pernas: IMG("Flat_Bench_Lying_Leg_Raise"),
  bicicleta_ar: IMG("Air_Bike"),
  superman: IMG("Superman"),

  // Cardio / HIIT
  mountain_climber: IMG("Mountain_Climbers"),
  burpee: IMG("Body-Up"),
  jumping_jack: IMG("Bodyweight_Squat"),
  corrida_lugar: IMG("Knee_Tuck_Jump"),
  polichinelo: IMG("Bodyweight_Squat"),

  // Back (home alternatives)
  remada_toalha: IMG("Reverse_Grip_Bent-Over_Rows"),

  // Flexibility
  gato_vaca: IMG("Cat_Stretch"),
  alongamento_posterior: IMG("Standing_Toe_Touches"),
  alongamento_quadriceps: IMG("Quad_Stretch"),
};

export const availableGifKeys = Object.keys(homeExerciseGifs);

export function getGifUrl(gifKey?: string): string | undefined {
  if (!gifKey) return undefined;
  return homeExerciseGifs[gifKey];
}
