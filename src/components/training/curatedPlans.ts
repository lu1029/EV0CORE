import type { Exercise } from "./ExerciseCard";
import { getGifUrl } from "./homeExerciseGifs";

const IMG = (id: string) => `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${id}/0.jpg`;

export type Level = "iniciante" | "intermediario" | "avancado";
export type Mode = "gym" | "home";

export interface CuratedPlan {
  id: string;
  name: string;
  description: string;
  level: Level;
  mode: Mode;
  workouts: Record<string, Exercise[]>;
}

// Helper: build home exercise with gifKey
const homeEx = (
  name: string,
  muscle: string,
  emoji: string,
  sets: number,
  reps: string,
  rest: number,
  instruction: string,
  gifKey: string,
  weight = "Corpo",
): Exercise => ({
  name, muscle, emoji, sets, reps, weight, rest, instruction,
  gifUrl: getGifUrl(gifKey),
});

const gymEx = (
  name: string,
  muscle: string,
  emoji: string,
  sets: number,
  reps: string,
  weight: string,
  rest: number,
  instruction: string,
  imgId: string,
): Exercise => ({
  name, muscle, emoji, sets, reps, weight, rest, instruction,
  gifUrl: IMG(imgId),
});

// ============================================================
// ACADEMIA — 3 planos prontos por nível
// ============================================================
export const gymPlans: CuratedPlan[] = [
  // INICIANTE
  {
    id: "gym-full-iniciante",
    name: "Full Body Iniciante",
    description: "3 dias na semana. Foco em forma e adaptação.",
    level: "iniciante",
    mode: "gym",
    workouts: {
      "Treino A — Corpo todo": [
        gymEx("Agachamento livre", "Pernas", "🦵", 3, "10-12", "20kg", 90, "Pés na largura dos ombros, desça até paralelo. Joelhos seguem os pés.", "Barbell_Squat"),
        gymEx("Supino com halteres", "Peito", "🏋️", 3, "10-12", "12kg", 75, "Deite, desça os halteres até o peito, empurre com controle.", "Dumbbell_Bench_Press"),
        gymEx("Puxada frontal", "Costas", "🔻", 3, "10-12", "30kg", 75, "Puxe a barra até o queixo, squeeze nas costas.", "Wide-Grip_Lat_Pulldown"),
        gymEx("Desenvolvimento halteres", "Ombros", "🏋️", 3, "10-12", "8kg", 75, "Empurre acima da cabeça, desça até 90° nos cotovelos.", "Dumbbell_Shoulder_Press"),
        gymEx("Rosca direta halteres", "Bíceps", "💪", 3, "12", "8kg", 60, "Cotovelos fixos, suba com controle sem balançar.", "Dumbbell_Bicep_Curl"),
        gymEx("Tríceps corda", "Tríceps", "💪", 3, "12", "15kg", 60, "Empurre a corda para baixo, abra no final.", "Triceps_Pushdown_-_Rope_Attachment"),
        gymEx("Prancha", "Core", "💪", 3, "30s", "Corpo", 45, "Corpo reto como tábua, core contraído.", "Plank"),
      ],
    },
  },
  // INTERMEDIÁRIO
  {
    id: "gym-abc-intermediario",
    name: "ABC Intermediário",
    description: "3 divisões clássicas: Peito/Tríceps, Costas/Bíceps, Pernas/Ombros.",
    level: "intermediario",
    mode: "gym",
    workouts: {
      "A — Peito + Tríceps": [
        gymEx("Supino reto barra", "Peito", "🏋️", 4, "8-12", "60kg", 90, "Desça a barra até o peito e empurre com controle. Cotovelos a 45°.", "Barbell_Bench_Press_-_Medium_Grip"),
        gymEx("Supino inclinado halteres", "Peito", "🏋️", 4, "10-12", "24kg", 90, "Banco a 30-45°. Desça até alongar e empurre.", "Incline_Dumbbell_Press"),
        gymEx("Crossover", "Peito", "🔄", 3, "12-15", "20kg", 60, "Cruze à frente do corpo, squeeze no peito.", "Cable_Crossover"),
        gymEx("Tríceps corda", "Tríceps", "💪", 4, "12-15", "25kg", 60, "Empurre para baixo, abra no final.", "Triceps_Pushdown_-_Rope_Attachment"),
        gymEx("Tríceps testa", "Tríceps", "💪", 3, "10-12", "15kg", 60, "Desça até a testa, estenda sem mover cotovelos.", "EZ-Bar_Skullcrusher"),
        gymEx("Mergulho", "Tríceps", "⬇️", 3, "Falha", "Corpo", 90, "Desça até 90°, empurre com força.", "Dips_-_Triceps_Version"),
      ],
      "B — Costas + Bíceps": [
        gymEx("Puxada frontal", "Costas", "🔻", 4, "10-12", "55kg", 90, "Puxe até o queixo, squeeze nas costas.", "Wide-Grip_Lat_Pulldown"),
        gymEx("Remada curvada", "Costas", "🚣", 4, "8-10", "50kg", 90, "Tronco 45°, puxe até o abdômen. Costas retas.", "Bent_Over_Barbell_Row"),
        gymEx("Remada unilateral", "Costas", "🚣", 3, "10-12", "22kg", 60, "Joelho no banco, puxe o halter até o quadril.", "One-Arm_Dumbbell_Row"),
        gymEx("Rosca direta barra", "Bíceps", "💪", 4, "10-12", "25kg", 60, "Cotovelos fixos, suba com controle.", "Barbell_Curl"),
        gymEx("Rosca martelo", "Bíceps", "🔨", 3, "12", "14kg", 60, "Pegada neutra, alterne com controle.", "Hammer_Curls"),
        gymEx("Rosca concentrada", "Bíceps", "💪", 3, "12", "10kg", 60, "Apoie cotovelo na coxa, squeeze máximo.", "Concentration_Curls"),
      ],
      "C — Pernas + Ombros": [
        gymEx("Agachamento livre", "Pernas", "🦵", 4, "8-10", "80kg", 120, "Desça até paralelo. Joelhos seguem pés.", "Barbell_Squat"),
        gymEx("Leg press 45°", "Pernas", "🦵", 4, "10-12", "200kg", 90, "Pés largura ombros, desça até 90°.", "Leg_Press"),
        gymEx("Cadeira extensora", "Pernas", "🦵", 3, "12-15", "50kg", 60, "Estenda até o topo, segure 1s.", "Leg_Extensions"),
        gymEx("Mesa flexora", "Pernas", "🦵", 3, "12-15", "35kg", 60, "Flexione com controle, squeeze no posterior.", "Lying_Leg_Curls"),
        gymEx("Desenvolvimento halteres", "Ombros", "🏋️", 4, "10-12", "16kg", 90, "Empurre acima, desça até 90°.", "Dumbbell_Shoulder_Press"),
        gymEx("Elevação lateral", "Ombros", "↔️", 4, "12-15", "10kg", 60, "Suba até altura dos ombros, cotovelos levemente dobrados.", "Side_Lateral_Raise"),
      ],
    },
  },
  // AVANÇADO
  {
    id: "gym-ppl-avancado",
    name: "Push Pull Legs",
    description: "6 dias. Volume e intensidade altos para hipertrofia.",
    level: "avancado",
    mode: "gym",
    workouts: {
      "Push — Peito/Ombro/Tríceps": [
        gymEx("Supino reto barra", "Peito", "🏋️", 5, "5-8", "90kg", 120, "Pesado, técnica perfeita. Pause 1s no peito.", "Barbell_Bench_Press_-_Medium_Grip"),
        gymEx("Supino inclinado halteres", "Peito", "🏋️", 4, "8-10", "32kg", 90, "Inclinação 30°, amplitude máxima.", "Incline_Dumbbell_Press"),
        gymEx("Desenvolvimento militar", "Ombros", "🏋️", 4, "6-8", "50kg", 120, "Em pé, barra, core travado.", "Barbell_Shoulder_Press"),
        gymEx("Elevação lateral", "Ombros", "↔️", 4, "12-15", "12kg", 45, "Drop set na última série.", "Side_Lateral_Raise"),
        gymEx("Tríceps testa EZ", "Tríceps", "💪", 4, "8-12", "25kg", 75, "Cotovelos fixos, desça até a testa.", "EZ-Bar_Skullcrusher"),
        gymEx("Tríceps corda", "Tríceps", "💪", 3, "12-15", "30kg", 60, "Última série até a falha.", "Triceps_Pushdown_-_Rope_Attachment"),
      ],
      "Pull — Costas/Bíceps": [
        gymEx("Levantamento terra", "Costas", "🔻", 4, "5-6", "120kg", 180, "Postura impecável. Quadril e joelhos juntos.", "Barbell_Deadlift"),
        gymEx("Barra fixa", "Costas", "🔻", 4, "8-10", "Corpo+10kg", 90, "Amplitude completa, sem balanço.", "Wide-Grip_Pull-Up"),
        gymEx("Remada curvada", "Costas", "🚣", 4, "8-10", "70kg", 90, "Tronco 45°, puxe até o abdômen.", "Bent_Over_Barbell_Row"),
        gymEx("Remada baixa", "Costas", "🚣", 3, "10-12", "60kg", 75, "Squeeze na contração, abra escápulas.", "Seated_Cable_Rows"),
        gymEx("Rosca direta barra", "Bíceps", "💪", 4, "8-10", "35kg", 75, "Sem balançar, controle total.", "Barbell_Curl"),
        gymEx("Rosca martelo", "Bíceps", "🔨", 3, "10-12", "18kg", 60, "Alternada, foco no braquial.", "Hammer_Curls"),
      ],
      "Legs — Pernas/Glúteos": [
        gymEx("Agachamento livre", "Pernas", "🦵", 5, "5-8", "110kg", 180, "Profundo, técnica perfeita.", "Barbell_Squat"),
        gymEx("Leg press 45°", "Pernas", "🦵", 4, "10-12", "300kg", 120, "Pés altos para glúteo, baixos para quadríceps.", "Leg_Press"),
        gymEx("Stiff", "Posterior", "🦵", 4, "8-10", "70kg", 90, "Postura reta, alongue isquiotibiais.", "Stiff-Legged_Barbell_Deadlift"),
        gymEx("Cadeira extensora", "Quadríceps", "🦵", 3, "12-15", "60kg", 60, "Última série em drop set.", "Leg_Extensions"),
        gymEx("Mesa flexora", "Posterior", "🦵", 3, "12-15", "45kg", 60, "Squeeze máximo no topo.", "Lying_Leg_Curls"),
        gymEx("Panturrilha em pé", "Panturrilha", "🦶", 5, "15-20", "80kg", 45, "Amplitude máxima, segure 1s no topo.", "Standing_Calf_Raises"),
      ],
    },
  },
];

// ============================================================
// EM CASA — múltiplos planos por nível, com objetos do dia-a-dia
// ============================================================
export const homePlans: CuratedPlan[] = [
  // ============= INICIANTE =============
  {
    id: "home-fullbody-iniciante",
    name: "Full Body em Casa",
    description: "Sem equipamento. Foco em base, técnica e mobilidade. 3x na semana.",
    level: "iniciante",
    mode: "home",
    workouts: {
      "Full Body — Corpo todo": [
        homeEx("Agachamento livre", "Pernas", "🦵", 3, "12-15", 45, "Pés na largura dos ombros, desça até 90°. Joelhos seguem os pés.", "agachamento"),
        homeEx("Flexão de joelhos", "Peito", "💪", 3, "8-12", 45, "Joelhos no chão. Desça o peito até quase tocar o chão.", "flexao_joelho"),
        homeEx("Mergulho na cadeira", "Tríceps", "💪", 3, "8-10", 45, "Cadeira firme atrás. Mãos na borda, desça flexionando os cotovelos.", "mergulho_cadeira"),
        homeEx("Remada com toalha na porta", "Costas", "🚣", 3, "10-12", 45, "Toalha enrolada na maçaneta, ambos os lados. Puxe o corpo em direção à porta inclinando-se para trás.", "remada_porta_toalha"),
        homeEx("Glute bridge", "Glúteos", "🍑", 3, "15", 30, "Deitado, pés no chão. Eleve o quadril apertando os glúteos.", "glute_bridge"),
        homeEx("Prancha", "Core", "💪", 3, "20-30s", 30, "Apoiado nos antebraços, corpo reto.", "prancha"),
        homeEx("Gato-vaca", "Coluna", "🐱", 2, "10", 20, "Em 4 apoios, alterne arquear e arredondar a coluna.", "gato_vaca"),
      ],
    },
  },
  {
    id: "home-cardio-iniciante",
    name: "Cardio + Core em Casa",
    description: "Queima calorias e fortalece o core. Sem impacto, ideal para começar.",
    level: "iniciante",
    mode: "home",
    workouts: {
      "Cardio leve + Core": [
        homeEx("Polichinelo", "Cardio", "🤸", 3, "30s", 30, "Salte abrindo pernas e levantando os braços.", "polichinelo"),
        homeEx("Joelho alto no lugar", "Cardio", "🏃", 3, "30s", 30, "Corra no lugar levando os joelhos à altura do quadril.", "joelho_alto"),
        homeEx("Mountain climbers lentos", "Core/Cardio", "🏔️", 3, "20", 30, "Em prancha, alterne joelhos ao peito controlado.", "mountain_climber"),
        homeEx("Prancha", "Core", "💪", 3, "20s", 30, "Corpo reto, antebraços apoiados.", "prancha"),
        homeEx("Glute bridge", "Glúteos", "🍑", 3, "12", 30, "Eleve o quadril apertando os glúteos.", "glute_bridge"),
        homeEx("Abdominal", "Core", "💪", 3, "12", 30, "Suba o tronco contraindo o abdômen.", "abdominal"),
      ],
    },
  },
  {
    id: "home-mobilidade-iniciante",
    name: "Mobilidade + Força Suave",
    description: "Destrava o corpo. Ideal para sedentários ou recuperação.",
    level: "iniciante",
    mode: "home",
    workouts: {
      "Mobilidade global": [
        homeEx("Gato-vaca", "Coluna", "🐱", 3, "10", 20, "Alterne arquear e arredondar a coluna.", "gato_vaca"),
        homeEx("Cobra", "Lombar/Peito", "🐍", 3, "30s", 20, "Deite de bruços, eleve o tronco com os braços.", "cobra"),
        homeEx("Postura da criança", "Costas", "🧘", 3, "30s", 20, "Joelhos abertos, sente nos calcanhares.", "child_pose"),
        homeEx("Cachorro olhando para baixo", "Posterior", "🐕", 3, "30s", 20, "V invertido. Calcanhares descendo.", "downward_dog"),
        homeEx("Agachamento devagar", "Pernas", "🦵", 3, "10", 30, "Desça em 3s, suba em 2s.", "agachamento"),
        homeEx("Glute bridge", "Glúteos", "🍑", 3, "15", 30, "Eleve o quadril apertando os glúteos.", "glute_bridge"),
      ],
    },
  },
  // INTERMEDIÁRIO
  {
    id: "home-split-intermediario",
    name: "Push/Pull/Legs em Casa",
    description: "Com mochila, cadeira e garrafas. 4 dias na semana.",
    level: "intermediario",
    mode: "home",
    workouts: {
      "Push — Peito/Ombro/Tríceps": [
        homeEx("Flexão tradicional", "Peito", "💪", 4, "12-15", 45, "Mãos na largura dos ombros, corpo reto. Desça até quase tocar o chão.", "flexao"),
        homeEx("Flexão declinada (pés no sofá)", "Peito superior", "💪", 3, "10-12", 45, "Pés apoiados no sofá ou cama. Aumenta a carga no peito superior e ombros.", "flexao_declinada"),
        homeEx("Pike Push-up", "Ombros", "🏋️", 3, "8-12", 60, "Quadril alto formando V invertido. Desça a cabeça em direção ao chão.", "pike_pushup"),
        homeEx("Desenvolvimento com garrafas 2L", "Ombros", "🏋️", 3, "12", 45, "Use 2 garrafas PET 2L cheias (≈2kg cada). Empurre acima da cabeça e desça.", "desenvolvimento_garrafa"),
        homeEx("Mergulho na cadeira", "Tríceps", "💪", 3, "10-15", 45, "Cadeira firme. Mãos na borda, desça até 90° nos cotovelos.", "mergulho_cadeira"),
        homeEx("Tríceps francês com garrafa", "Tríceps", "💪", 3, "12", 45, "Garrafa 2L com as duas mãos, atrás da cabeça. Estenda os braços para cima.", "triceps_frances_garrafa"),
      ],
      "Pull — Costas/Bíceps": [
        homeEx("Remada invertida sob a mesa", "Costas", "🚣", 4, "8-12", 60, "Mesa robusta. Deite embaixo, segure a borda e puxe o peito até a mesa.", "remada_invertida_mesa"),
        homeEx("Remada com toalha na porta", "Costas", "🚣", 3, "12-15", 45, "Toalha presa na maçaneta. Puxe o corpo inclinando-se para trás.", "remada_porta_toalha"),
        homeEx("Remada curvada com mochila", "Costas", "🚣", 3, "12", 45, "Mochila com livros (≈10kg). Tronco 45°, puxe até o abdômen.", "remada_curvada_mochila"),
        homeEx("Superman", "Lombar", "🦸", 3, "15", 30, "Deitado de bruços, eleve braços e pernas simultaneamente. Segure 2s no topo.", "superman"),
        homeEx("Rosca com mochila", "Bíceps", "💪", 4, "12", 45, "Mochila pesada (≈10kg). Suba com controle, sem balançar.", "rosca_mochila"),
        homeEx("Rosca martelo com garrafas", "Bíceps", "🔨", 3, "12 cada", 45, "Garrafas 2L, pegada neutra. Alterne os braços.", "rosca_martelo_garrafa"),
      ],
      "Legs — Pernas/Glúteos": [
        homeEx("Agachamento goblet com mochila", "Quadríceps", "🦵", 4, "15", 60, "Mochila no peito, abrace-a. Desça profundo mantendo o tronco ereto.", "agachamento_goblet_mochila"),
        homeEx("Afundo búlgaro", "Quadríceps/Glúteos", "🦵", 3, "10 cada", 60, "Pé de trás na cadeira ou sofá. Desça até 90° no joelho da frente.", "afundo_bulgaro"),
        homeEx("Step-up na cadeira", "Pernas", "🦵", 3, "12 cada", 45, "Cadeira firme. Suba e desça com controle, sem impulso da perna de baixo.", "step_up_cadeira"),
        homeEx("Hip thrust no sofá", "Glúteos", "🍑", 4, "15", 45, "Costas apoiadas no sofá, pés no chão. Mochila no quadril. Suba apertando os glúteos.", "hip_thrust_sofa"),
        homeEx("Wall sit", "Quadríceps", "🦵", 3, "45s", 60, "Costas na parede, joelhos a 90°. Segure isométrico.", "wall_sit"),
        homeEx("Panturrilha em pé", "Panturrilha", "🦶", 3, "20", 30, "Em pé, suba na ponta dos pés. Use degrau ou livro grosso para amplitude.", "panturrilha_em_pe"),
      ],
      "Core + Cardio": [
        homeEx("Prancha", "Core", "💪", 3, "45s", 30, "Antebraços, corpo reto. Core contraído.", "prancha"),
        homeEx("Prancha lateral", "Oblíquos", "💪", 3, "30s cada", 30, "Apoiado em um antebraço, corpo alinhado lateralmente.", "prancha_lateral"),
        homeEx("Mountain climbers", "Core/Cardio", "🏔️", 3, "30s", 30, "Em prancha, alterne joelhos ao peito rapidamente.", "mountain_climber"),
        homeEx("Bicicleta no ar", "Oblíquos", "🚴", 3, "20", 30, "Alterne cotovelo-joelho oposto.", "bicicleta_ar"),
        homeEx("Burpees", "Full Body", "🔥", 3, "10", 45, "Desça ao chão, flexão, salte com mãos para cima.", "burpee"),
      ],
    },
  },
  {
    id: "home-hiit-intermediario",
    name: "HIIT Queima-gordura",
    description: "30 minutos intensos. Cardio + força em circuito. 3x na semana.",
    level: "intermediario",
    mode: "home",
    workouts: {
      "Circuito HIIT — 4 rounds": [
        homeEx("Burpees", "Full Body", "🔥", 4, "10", 30, "Desça ao chão, flexão, salte com mãos para cima.", "burpee"),
        homeEx("Agachamento com salto", "Pernas", "🦵", 4, "15", 30, "Explosivo. Aterrise suave.", "agachamento_salto"),
        homeEx("Mountain climbers", "Cardio/Core", "🏔️", 4, "30s", 30, "Velocidade alta.", "mountain_climber"),
        homeEx("Flexão", "Peito", "💪", 4, "12", 30, "Forma perfeita, controle.", "flexao"),
        homeEx("Skater jumps", "Cardio/Pernas", "⛸️", 4, "20", 30, "Salte lateralmente.", "skater"),
        homeEx("Prancha", "Core", "💪", 4, "30s", 30, "Antebraços, corpo reto.", "prancha"),
      ],
    },
  },
  {
    id: "home-upper-intermediario",
    name: "Upper Body com Mochila",
    description: "Foco em peito, costas, ombros e braços. 3x na semana.",
    level: "intermediario",
    mode: "home",
    workouts: {
      "Membros superiores": [
        homeEx("Flexão", "Peito", "💪", 4, "12-15", 45, "Mãos na largura dos ombros.", "flexao"),
        homeEx("Remada com mochila", "Costas", "🚣", 4, "12", 45, "Mochila pesada. Tronco 45°.", "remada_curvada_mochila"),
        homeEx("Pike push-up", "Ombros", "🏋️", 4, "10", 45, "V invertido, desça a cabeça ao chão.", "pike_pushup"),
        homeEx("Mergulho na cadeira", "Tríceps", "💪", 4, "12", 45, "Cadeira firme, desça até 90°.", "mergulho_cadeira"),
        homeEx("Rosca com mochila", "Bíceps", "💪", 4, "12", 45, "Mochila pesada, controle total.", "rosca_mochila"),
        homeEx("Elevação lateral garrafas", "Ombros", "↔️", 3, "15", 30, "Garrafas 2L, suba até altura dos ombros.", "elevacao_lateral_garrafa"),
      ],
    },
  },
  // AVANÇADO
  {
    id: "home-pro-avancado",
    name: "Calistenia Avançada",
    description: "Calistenia + mochila pesada. Volume e intensidade altos.",
    level: "avancado",
    mode: "home",
    workouts: {
      "Push pesado": [
        homeEx("Flexão diamante", "Tríceps", "💪", 4, "15-20", 60, "Mãos formando diamante sob o peito.", "flexao_diamante"),
        homeEx("Flexão archer", "Peito", "💪", 4, "8 cada", 60, "Braços bem abertos, peso para um lado de cada vez.", "flexao_aberta"),
        homeEx("Handstand na parede", "Ombros", "🏋️", 4, "5-8", 90, "Parada de mão encostada na parede. Desça a cabeça com controle.", "handstand_parede"),
        homeEx("Pike push-up elevado", "Ombros", "🏋️", 3, "10-12", 60, "Pés no sofá, V invertido bem fechado.", "pike_pushup"),
        homeEx("Mergulho cadeira com mochila", "Tríceps", "💪", 4, "12", 60, "Mochila pesada no colo. Desça até 90°.", "mergulho_cadeira"),
      ],
      "Pull pesado": [
        homeEx("Pull-up no batente", "Costas", "🔻", 5, "Falha", 90, "Use barra na porta ou batente robusto. Amplitude completa.", "remada_invertida_mesa"),
        homeEx("Remada invertida unilateral", "Costas", "🚣", 4, "8 cada", 75, "Sob a mesa, uma mão de cada vez.", "remada_invertida_mesa"),
        homeEx("Remada curvada mochila pesada", "Costas", "🚣", 4, "12", 60, "Mochila ≥15kg. Squeeze nas escápulas.", "remada_curvada_mochila"),
        homeEx("Rosca mochila pesada", "Bíceps", "💪", 4, "10-12", 60, "Mochila ≥12kg. Sem balançar.", "rosca_mochila"),
        homeEx("Superman segurado", "Lombar", "🦸", 3, "15s x 5", 30, "Eleve e segure 15s. 5 séries.", "superman"),
      ],
      "Legs pesado": [
        homeEx("Pistol squat assistido", "Quadríceps", "🦵", 4, "5-8 cada", 90, "Uma perna, segurando em algo se precisar. Desça lentamente.", "agachamento_pistola"),
        homeEx("Agachamento búlgaro com mochila", "Quadríceps/Glúteos", "🦵", 4, "10 cada", 90, "Mochila pesada. Desça profundo.", "afundo_bulgaro"),
        homeEx("Hip thrust mochila pesada", "Glúteos", "🍑", 4, "15", 60, "Mochila ≥15kg no quadril, costas no sofá.", "hip_thrust_sofa"),
        homeEx("Agachamento com salto", "Pernas/Cardio", "🦵", 4, "15", 45, "Explosivo. Aterrise suave e desça já no próximo agachamento.", "agachamento_salto"),
        homeEx("Wall sit prolongado", "Quadríceps", "🦵", 3, "90s", 60, "Isometria longa. Punho cerrado.", "wall_sit"),
        homeEx("Panturrilha unilateral", "Panturrilha", "🦶", 4, "15 cada", 30, "Um pé só. Use degrau para amplitude.", "panturrilha_unilateral"),
      ],
      "Core + HIIT": [
        homeEx("Hollow body hold", "Core", "💪", 4, "30s", 45, "Deitado, pernas e ombros levemente erguidos. Lombar colada no chão.", "hollow_body"),
        homeEx("Russian twist com mochila", "Oblíquos", "💪", 4, "20", 45, "Sentado, pés elevados, mochila nas mãos. Gire o tronco.", "russian_twist"),
        homeEx("Burpees com flexão", "Full Body", "🔥", 4, "12", 45, "Burpee completo com flexão no chão e salto explosivo.", "burpee"),
        homeEx("Mountain climbers rápidos", "Cardio/Core", "🏔️", 4, "40s", 30, "Velocidade máxima.", "mountain_climber"),
        homeEx("Skater jumps", "Cardio/Pernas", "⛸️", 4, "20", 30, "Salte lateralmente de um pé ao outro.", "skater"),
      ],
    },
  },
  {
    id: "home-metcon-avancado",
    name: "MetCon Brutal",
    description: "Condicionamento metabólico extremo. AMRAP em 25 minutos.",
    level: "avancado",
    mode: "home",
    workouts: {
      "AMRAP 25 min": [
        homeEx("Burpees com flexão", "Full Body", "🔥", 5, "15", 30, "Quantas rondas conseguir em 25min.", "burpee"),
        homeEx("Pistol squat", "Pernas", "🦵", 5, "8 cada", 30, "Profundo, controle total.", "agachamento_pistola"),
        homeEx("Pull-up no batente", "Costas", "🔻", 5, "10", 30, "Amplitude completa.", "remada_invertida_mesa"),
        homeEx("Handstand push-up parcial", "Ombros", "🏋️", 5, "8", 30, "Parede como apoio.", "handstand_parede"),
        homeEx("Mountain climbers", "Cardio", "🏔️", 5, "40s", 20, "Velocidade máxima.", "mountain_climber"),
      ],
    },
  },
  {
    id: "home-skill-avancado",
    name: "Skill + Força Estática",
    description: "Domínio corporal: handstand, hollow, isometrias avançadas.",
    level: "avancado",
    mode: "home",
    workouts: {
      "Skill work": [
        homeEx("Handstand parede (tempo)", "Ombros/Core", "🤸", 5, "30s", 90, "Segure parado encostado na parede.", "handstand_parede"),
        homeEx("Hollow body hold", "Core", "💪", 5, "45s", 60, "Lombar colada, ombros e pés elevados.", "hollow_body"),
        homeEx("Pistol squat", "Pernas", "🦵", 4, "5-8 cada", 90, "Sem apoio. Desça lentamente.", "agachamento_pistola"),
        homeEx("Flexão archer", "Peito", "💪", 4, "6 cada", 75, "Peso para um lado de cada vez.", "flexao_aberta"),
        homeEx("Superman segurado", "Lombar", "🦸", 4, "20s", 45, "Eleve e segure.", "superman"),
        homeEx("L-sit (cadeira)", "Core/Tríceps", "💪", 4, "15s", 60, "Mãos na cadeira, pernas estendidas à frente.", "hollow_body"),
      ],
    },
  },
];

export function getCuratedPlans(mode: Mode, level: Level): CuratedPlan[] {
  const all = mode === "gym" ? gymPlans : homePlans;
  return all.filter((p) => p.level === level);
}

export function getCuratedPlanById(id: string): CuratedPlan | undefined {
  return [...gymPlans, ...homePlans].find((p) => p.id === id);
}
