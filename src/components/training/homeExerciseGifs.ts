// Mapping of exercise keys to demonstration images.
// Source: yuhonas/free-exercise-db (CC0) via jsDelivr CDN — reliable, real
// demonstration photos for each exercise.
const IMG = (id: string) => `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${id}/0.jpg`;

export const homeExerciseGifs: Record<string, string> = {
  // ===== Push (peito/tríceps/ombro) =====
  flexao: IMG("Pushups"),
  flexao_diamante: IMG("Close-Grip_Push-Up_off_of_a_Dumbbell"),
  flexao_declinada: IMG("Decline_Push-Up"),
  flexao_inclinada: IMG("Incline_Push-Up"),
  flexao_aberta: IMG("Wide_Grip_Push-Up"),
  flexao_joelho: IMG("Pushups_-_Close_Triceps_Position"),
  pike_pushup: IMG("Pike_Pushups"),
  handstand_parede: IMG("Handstand_Push-Ups"),
  mergulho_cadeira: IMG("Bench_Dips"),
  triceps_frances_garrafa: IMG("Seated_Triceps_Press"),
  desenvolvimento_garrafa: IMG("Dumbbell_Shoulder_Press"),
  elevacao_lateral_garrafa: IMG("Side_Lateral_Raise"),

  // ===== Pernas =====
  agachamento: IMG("Bodyweight_Squat"),
  agachamento_salto: IMG("Box_Squat"),
  agachamento_sumo: IMG("Plie_Dumbbell_Squat"),
  agachamento_pistola: IMG("Single-Leg_High_Box_Squat"),
  agachamento_goblet_mochila: IMG("Goblet_Squat"),
  afundo: IMG("Bodyweight_Walking_Lunge"),
  afundo_bulgaro: IMG("Dumbbell_Lunges"),
  afundo_reverso: IMG("Reverse_Crunch"),
  step_up: IMG("Dumbbell_Step_Ups"),
  step_up_cadeira: IMG("Dumbbell_Step_Ups"),
  wall_sit: IMG("Wall_Sit"),
  hip_thrust: IMG("Single_Leg_Glute_Bridge"),
  hip_thrust_sofa: IMG("Hip_Thrust_With_Bands"),
  glute_bridge: IMG("Single_Leg_Glute_Bridge"),
  kickback: IMG("Rear_Leg_Raises"),
  panturrilha_em_pe: IMG("Standing_Calf_Raises"),
  panturrilha_unilateral: IMG("Calf_Stretch_Hands_Against_Wall"),

  // ===== Costas (com objetos) =====
  remada_toalha: IMG("Reverse_Grip_Bent-Over_Rows"),
  remada_porta_toalha: IMG("Reverse_Grip_Bent-Over_Rows"),
  remada_curvada_mochila: IMG("Bent_Over_Barbell_Row"),
  remada_invertida_mesa: IMG("Inverted_Row"),
  superman: IMG("Superman"),

  // ===== Bíceps (com objetos) =====
  rosca_mochila: IMG("Barbell_Curl"),
  rosca_garrafa: IMG("Dumbbell_Bicep_Curl"),
  rosca_martelo_garrafa: IMG("Hammer_Curls"),

  // ===== Core =====
  prancha: IMG("Plank"),
  prancha_lateral: IMG("Side_Bridge"),
  prancha_toque_ombro: IMG("Plank_with_Diagonal_Arm_Lift"),
  abdominal: IMG("Crunches"),
  abdominal_canivete: IMG("Jackknife_Sit-Up"),
  elevacao_pernas: IMG("Flat_Bench_Lying_Leg_Raise"),
  bicicleta_ar: IMG("Air_Bike"),
  russian_twist: IMG("Spell_Caster"),
  hollow_body: IMG("Plank"),
  dead_bug: IMG("Lying_Leg_Raise"),
  bird_dog: IMG("Cat_Stretch"),

  // ===== Cardio / HIIT =====
  mountain_climber: IMG("Mountain_Climbers"),
  burpee: IMG("Body-Up"),
  jumping_jack: IMG("Jumping_Jack"),
  polichinelo: IMG("Jumping_Jack"),
  corrida_lugar: IMG("Knee_Tuck_Jump"),
  joelho_alto: IMG("Knee_Tuck_Jump"),
  pular_corda: IMG("Rope_Jumping"),
  skater: IMG("Lateral_Bound"),
  box_step_livros: IMG("Dumbbell_Step_Ups"),

  // ===== Flexibilidade =====
  gato_vaca: IMG("Cat_Stretch"),
  alongamento_posterior: IMG("Standing_Toe_Touches"),
  alongamento_quadriceps: IMG("Quad_Stretch"),
  alongamento_peito: IMG("Behind_Head_Chest_Stretch"),
  cobra: IMG("Cobra_Stretch"),
  child_pose: IMG("Childs_Pose"),
  downward_dog: IMG("Downward_Facing_Dog"),
};

export const availableGifKeys = Object.keys(homeExerciseGifs);

export function getGifUrl(gifKey?: string): string | undefined {
  if (!gifKey) return undefined;
  return homeExerciseGifs[gifKey];
}
