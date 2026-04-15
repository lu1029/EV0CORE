// Mapping of exercise keys to demonstration GIF URLs
// Using high-quality exercise GIFs from a public dataset

const GIF_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos";

export const homeExerciseGifs: Record<string, string> = {
  // Push exercises
  flexao: `${GIF_BASE}/0662-qWvH8VX.gif`,
  flexao_diamante: `${GIF_BASE}/0279-FyuIqTy.gif`,
  flexao_declinada: `${GIF_BASE}/0663-oVQiZMm.gif`,
  flexao_inclinada: `${GIF_BASE}/0667-eNWy4Xn.gif`,
  pike_pushup: `${GIF_BASE}/0668-T1v6m3J.gif`,
  mergulho_cadeira: `${GIF_BASE}/0251-9WTm7dq.gif`,

  // Legs
  agachamento: `${GIF_BASE}/0029-qi996YS.gif`,
  agachamento_salto: `${GIF_BASE}/0584-rQY78g5.gif`,
  agachamento_sumo: `${GIF_BASE}/3216-IIfF0eo.gif`,
  afundo: `${GIF_BASE}/1429-iqTgkwV.gif`,
  afundo_bulgaro: `${GIF_BASE}/1429-iqTgkwV.gif`,
  step_up: `${GIF_BASE}/0794-yBZfWwV.gif`,
  wall_sit: `${GIF_BASE}/2614-UPQQIjZ.gif`,
  hip_thrust: `${GIF_BASE}/3214-oJwt1gF.gif`,
  kickback: `${GIF_BASE}/3231-T0kH1SN.gif`,

  // Core
  prancha: `${GIF_BASE}/0262-v0A7CQRM.gif`,
  prancha_lateral: `${GIF_BASE}/0266-0Y8Hfj5.gif`,
  abdominal: `${GIF_BASE}/0274-bpjOyfA.gif`,
  elevacao_pernas: `${GIF_BASE}/0276-u3l5kZr.gif`,
  bicicleta_ar: `${GIF_BASE}/0278-gA9kSAF.gif`,
  superman: `${GIF_BASE}/3303-0EzXP2b.gif`,

  // Cardio / HIIT
  mountain_climber: `${GIF_BASE}/0658-DhU7Djj.gif`,
  burpee: `${GIF_BASE}/1160-3Mhi2Ll.gif`,
  jumping_jack: `${GIF_BASE}/2612-HBVfmCX.gif`,
  corrida_lugar: `${GIF_BASE}/1160-3Mhi2Ll.gif`,
  polichinelo: `${GIF_BASE}/2612-HBVfmCX.gif`,

  // Back (home alternatives)
  remada_toalha: `${GIF_BASE}/0292-C0MA9bC.gif`,

  // Flexibility
  gato_vaca: `${GIF_BASE}/3183-vZf4Soy.gif`,
  alongamento_posterior: `${GIF_BASE}/1502-oaT3LDR.gif`,
  alongamento_quadriceps: `${GIF_BASE}/1476-6e4HCrZ.gif`,
};

export function getGifUrl(gifKey?: string): string | undefined {
  if (!gifKey) return undefined;
  return homeExerciseGifs[gifKey];
}
