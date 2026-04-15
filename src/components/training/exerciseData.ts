import type { Exercise } from "./ExerciseCard";

const GIF_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos";

export const exerciseDB: Record<string, Exercise[]> = {
  "Peito + Tríceps": [
    { name: "Supino reto com barra", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "8-12", weight: "60kg", rest: 90, instruction: "Deite no banco, desça a barra até o peito e empurre com controle. Cotovelos a 45°.", gifUrl: `${GIF_BASE}/0025-EIeI8Vf.gif` },
    { name: "Supino inclinado halteres", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "10-12", weight: "24kg", rest: 90, instruction: "Banco a 30-45°. Desça os halteres até sentir alongamento e empurre até o topo.", gifUrl: `${GIF_BASE}/0314-ns0SIbU.gif` },
    { name: "Crossover", muscle: "Peito", emoji: "🔄", sets: 3, reps: "12-15", weight: "20kg", rest: 60, instruction: "Cruze os cabos à frente do corpo, squeeze no peito. Controle a volta.", gifUrl: `${GIF_BASE}/1269-UKWTJWR.gif` },
    { name: "Fly máquina", muscle: "Peito", emoji: "🦋", sets: 3, reps: "12-15", weight: "40kg", rest: 60, instruction: "Aperte no centro com controle, sinta o alongamento na volta.", gifUrl: `${GIF_BASE}/0596-v3xmPAR.gif` },
    { name: "Tríceps corda", muscle: "Tríceps", emoji: "💪", sets: 4, reps: "12-15", weight: "25kg", rest: 60, instruction: "Empurre a corda para baixo, abra no final. Cotovelos fixos ao lado do corpo.", gifUrl: `${GIF_BASE}/0201-3ZflifB.gif` },
    { name: "Tríceps testa", muscle: "Tríceps", emoji: "💪", sets: 3, reps: "10-12", weight: "15kg", rest: 60, instruction: "Desça a barra até a testa, estenda os braços sem mover os cotovelos.", gifUrl: `${GIF_BASE}/0060-h8LFzo9.gif` },
    { name: "Mergulho", muscle: "Tríceps", emoji: "⬇️", sets: 3, reps: "Falha", weight: "Corpo", rest: 90, instruction: "Desça até 90° nos cotovelos, empurre com força. Corpo levemente inclinado.", gifUrl: `${GIF_BASE}/0251-9WTm7dq.gif` },
  ],
  "Costas + Bíceps": [
    { name: "Puxada frontal", muscle: "Costas", emoji: "🔻", sets: 4, reps: "10-12", weight: "55kg", rest: 90, instruction: "Puxe a barra até o queixo, squeeze nas costas. Controle a subida.", gifUrl: `${GIF_BASE}/2330-LEprlgG.gif` },
    { name: "Remada curvada", muscle: "Costas", emoji: "🚣", sets: 4, reps: "8-10", weight: "50kg", rest: 90, instruction: "Tronco a 45°, puxe a barra até o abdômen. Costas retas.", gifUrl: `${GIF_BASE}/0027-eZyBC3j.gif` },
    { name: "Remada unilateral", muscle: "Costas", emoji: "🚣", sets: 3, reps: "10-12", weight: "22kg", rest: 60, instruction: "Apoie um joelho no banco, puxe o halter até o quadril.", gifUrl: `${GIF_BASE}/0292-C0MA9bC.gif` },
    { name: "Pulldown corda", muscle: "Costas", emoji: "🔻", sets: 3, reps: "12-15", weight: "30kg", rest: 60, instruction: "Puxe a corda até o peito, abra no final e aperte as costas.", gifUrl: `${GIF_BASE}/0238-x69MAlq.gif` },
    { name: "Rosca direta barra", muscle: "Bíceps", emoji: "💪", sets: 4, reps: "10-12", weight: "25kg", rest: 60, instruction: "Cotovelos fixos, suba a barra com controle. Sem balançar o corpo.", gifUrl: `${GIF_BASE}/0031-25GPyDY.gif` },
    { name: "Rosca martelo", muscle: "Bíceps", emoji: "🔨", sets: 3, reps: "12", weight: "14kg", rest: 60, instruction: "Pegada neutra, suba os halteres alternados com controle.", gifUrl: `${GIF_BASE}/0313-slDvUAU.gif` },
    { name: "Rosca concentrada", muscle: "Bíceps", emoji: "💪", sets: 3, reps: "12", weight: "10kg", rest: 60, instruction: "Apoie o cotovelo na coxa, suba com squeeze máximo no bíceps.", gifUrl: `${GIF_BASE}/0297-gvsWLQw.gif` },
  ],
  "Pernas + Ombros": [
    { name: "Agachamento livre", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "8-10", weight: "80kg", rest: 120, instruction: "Desça até paralelo ou abaixo. Joelhos acompanham os pés. Core firme.", gifUrl: `${GIF_BASE}/0029-qi996YS.gif` },
    { name: "Leg press 45°", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "10-12", weight: "200kg", rest: 90, instruction: "Pés na largura dos ombros, desça até 90° nos joelhos.", gifUrl: `${GIF_BASE}/0739-10Z2DXU.gif` },
    { name: "Cadeira extensora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "50kg", rest: 60, instruction: "Estenda as pernas até o topo, segure 1s. Desça devagar.", gifUrl: `${GIF_BASE}/0585-my33uHU.gif` },
    { name: "Mesa flexora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "35kg", rest: 60, instruction: "Flexione os joelhos com controle, squeeze no posterior.", gifUrl: `${GIF_BASE}/0586-17lJ1kr.gif` },
    { name: "Desenvolvimento halteres", muscle: "Ombros", emoji: "🏋️", sets: 4, reps: "10-12", weight: "16kg", rest: 90, instruction: "Empurre os halteres acima da cabeça, desça até 90° nos cotovelos.", gifUrl: `${GIF_BASE}/0361-84RyJf8.gif` },
    { name: "Elevação lateral", muscle: "Ombros", emoji: "↔️", sets: 4, reps: "12-15", weight: "10kg", rest: 60, instruction: "Suba os halteres até a altura dos ombros, cotovelos levemente dobrados.", gifUrl: `${GIF_BASE}/0334-DsgkuIt.gif` },
    { name: "Encolhimento", muscle: "Trapézio", emoji: "⬆️", sets: 3, reps: "12-15", weight: "24kg", rest: 60, instruction: "Suba os ombros até as orelhas, segure 2s no topo.", gifUrl: `${GIF_BASE}/0406-NJzBsGJ.gif` },
  ],
};

export const workoutPlans = [
  { id: "abc", name: "ABC", desc: "3 divisões clássicas", days: 3, level: "Iniciante", premium: false },
  { id: "abcd", name: "ABCD", desc: "4 divisões otimizadas", days: 4, level: "Intermediário", premium: true },
  { id: "ppl", name: "Push Pull Legs", desc: "Empurrar/Puxar/Pernas", days: 6, level: "Avançado", premium: true },
  { id: "full", name: "Full Body", desc: "Corpo inteiro", days: 3, level: "Todos", premium: false },
];

export const homeWorkouts = [
  { name: "HIIT Express", duration: "20 min", level: "Intermediário", icon: "🔥" },
  { name: "Core Power", duration: "15 min", level: "Todos", icon: "💪" },
  { name: "Alongamento", duration: "10 min", level: "Todos", icon: "🧘" },
  { name: "Full Body", duration: "30 min", level: "Iniciante", icon: "⚡" },
  { name: "Glúteos", duration: "25 min", level: "Intermediário", icon: "🍑" },
  { name: "Cardio em casa", duration: "20 min", level: "Todos", icon: "❤️" },
];
