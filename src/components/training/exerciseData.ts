import type { Exercise } from "./ExerciseCard";

export const exerciseDB: Record<string, Exercise[]> = {
  "Peito + Tríceps": [
    { name: "Supino reto com barra", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "8-12", weight: "60kg", rest: 90, instruction: "Deite no banco, desça a barra até o peito e empurre com controle. Cotovelos a 45°." },
    { name: "Supino inclinado halteres", muscle: "Peito", emoji: "🏋️", sets: 4, reps: "10-12", weight: "24kg", rest: 90, instruction: "Banco a 30-45°. Desça os halteres até sentir alongamento e empurre até o topo." },
    { name: "Crossover", muscle: "Peito", emoji: "🔄", sets: 3, reps: "12-15", weight: "20kg", rest: 60, instruction: "Cruze os cabos à frente do corpo, squeeze no peito. Controle a volta." },
    { name: "Fly máquina", muscle: "Peito", emoji: "🦋", sets: 3, reps: "12-15", weight: "40kg", rest: 60, instruction: "Aperte no centro com controle, sinta o alongamento na volta." },
    { name: "Tríceps corda", muscle: "Tríceps", emoji: "💪", sets: 4, reps: "12-15", weight: "25kg", rest: 60, instruction: "Empurre a corda para baixo, abra no final. Cotovelos fixos ao lado do corpo." },
    { name: "Tríceps testa", muscle: "Tríceps", emoji: "💪", sets: 3, reps: "10-12", weight: "15kg", rest: 60, instruction: "Desça a barra até a testa, estenda os braços sem mover os cotovelos." },
    { name: "Mergulho", muscle: "Tríceps", emoji: "⬇️", sets: 3, reps: "Falha", weight: "Corpo", rest: 90, instruction: "Desça até 90° nos cotovelos, empurre com força. Corpo levemente inclinado." },
  ],
  "Costas + Bíceps": [
    { name: "Puxada frontal", muscle: "Costas", emoji: "🔻", sets: 4, reps: "10-12", weight: "55kg", rest: 90, instruction: "Puxe a barra até o queixo, squeeze nas costas. Controle a subida." },
    { name: "Remada curvada", muscle: "Costas", emoji: "🚣", sets: 4, reps: "8-10", weight: "50kg", rest: 90, instruction: "Tronco a 45°, puxe a barra até o abdômen. Costas retas." },
    { name: "Remada unilateral", muscle: "Costas", emoji: "🚣", sets: 3, reps: "10-12", weight: "22kg", rest: 60, instruction: "Apoie um joelho no banco, puxe o halter até o quadril." },
    { name: "Pulldown corda", muscle: "Costas", emoji: "🔻", sets: 3, reps: "12-15", weight: "30kg", rest: 60, instruction: "Puxe a corda até o peito, abra no final e aperte as costas." },
    { name: "Rosca direta barra", muscle: "Bíceps", emoji: "💪", sets: 4, reps: "10-12", weight: "25kg", rest: 60, instruction: "Cotovelos fixos, suba a barra com controle. Sem balançar o corpo." },
    { name: "Rosca martelo", muscle: "Bíceps", emoji: "🔨", sets: 3, reps: "12", weight: "14kg", rest: 60, instruction: "Pegada neutra, suba os halteres alternados com controle." },
    { name: "Rosca concentrada", muscle: "Bíceps", emoji: "💪", sets: 3, reps: "12", weight: "10kg", rest: 60, instruction: "Apoie o cotovelo na coxa, suba com squeeze máximo no bíceps." },
  ],
  "Pernas + Ombros": [
    { name: "Agachamento livre", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "8-10", weight: "80kg", rest: 120, instruction: "Desça até paralelo ou abaixo. Joelhos acompanham os pés. Core firme." },
    { name: "Leg press 45°", muscle: "Pernas", emoji: "🦵", sets: 4, reps: "10-12", weight: "200kg", rest: 90, instruction: "Pés na largura dos ombros, desça até 90° nos joelhos." },
    { name: "Cadeira extensora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "50kg", rest: 60, instruction: "Estenda as pernas até o topo, segure 1s. Desça devagar." },
    { name: "Mesa flexora", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12-15", weight: "35kg", rest: 60, instruction: "Flexione os joelhos com controle, squeeze no posterior." },
    { name: "Desenvolvimento halteres", muscle: "Ombros", emoji: "🏋️", sets: 4, reps: "10-12", weight: "16kg", rest: 90, instruction: "Empurre os halteres acima da cabeça, desça até 90° nos cotovelos." },
    { name: "Elevação lateral", muscle: "Ombros", emoji: "↔️", sets: 4, reps: "12-15", weight: "10kg", rest: 60, instruction: "Suba os halteres até a altura dos ombros, cotovelos levemente dobrados." },
    { name: "Encolhimento", muscle: "Trapézio", emoji: "⬆️", sets: 3, reps: "12-15", weight: "24kg", rest: 60, instruction: "Suba os ombros até as orelhas, segure 2s no topo." },
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
