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

export const homeWorkouts: { name: string; duration: string; level: string; icon: string; exercises: Exercise[] }[] = [
  {
    name: "HIIT Express", duration: "20 min", level: "Intermediário", icon: "🔥",
    exercises: [
      { name: "Jumping Jacks", muscle: "Cardio", emoji: "⭐", sets: 3, reps: "30s", weight: "Corpo", rest: 20, instruction: "Salte abrindo braços e pernas simultaneamente. Mantenha ritmo constante.", gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX2rRe/giphy.gif" },
      { name: "Burpees", muscle: "Full Body", emoji: "🔥", sets: 3, reps: "10", weight: "Corpo", rest: 30, instruction: "Desça ao chão, faça uma flexão, salte e bata palma acima da cabeça.", gifUrl: `${GIF_BASE}/1160-3Mhi2Ll.gif` },
      { name: "Mountain Climbers", muscle: "Core", emoji: "🏔️", sets: 3, reps: "30s", weight: "Corpo", rest: 20, instruction: "Em posição de prancha, alterne os joelhos em direção ao peito rapidamente.", gifUrl: `${GIF_BASE}/0658-DhU7Djj.gif` },
      { name: "Agachamento com salto", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "12", weight: "Corpo", rest: 25, instruction: "Agache até 90° e salte explosivamente. Aterrisse suavemente.", gifUrl: `${GIF_BASE}/0584-rQY78g5.gif` },
      { name: "Prancha", muscle: "Core", emoji: "💪", sets: 3, reps: "40s", weight: "Corpo", rest: 20, instruction: "Mantenha o corpo reto como uma tábua. Core contraído o tempo todo.", gifUrl: `${GIF_BASE}/0262-v0A7CQRM.gif` },
    ],
  },
  {
    name: "Core Power", duration: "15 min", level: "Todos", icon: "💪",
    exercises: [
      { name: "Abdominal crunch", muscle: "Abdômen", emoji: "💪", sets: 3, reps: "15", weight: "Corpo", rest: 30, instruction: "Deite de costas, mãos atrás da cabeça, suba o tronco contraindo o abdômen.", gifUrl: `${GIF_BASE}/0274-bpjOyfA.gif` },
      { name: "Prancha", muscle: "Core", emoji: "💪", sets: 3, reps: "45s", weight: "Corpo", rest: 30, instruction: "Mantenha o corpo reto, core contraído. Não deixe o quadril cair.", gifUrl: `${GIF_BASE}/0262-v0A7CQRM.gif` },
      { name: "Elevação de pernas", muscle: "Abdômen inferior", emoji: "🦵", sets: 3, reps: "12", weight: "Corpo", rest: 30, instruction: "Deite e eleve as pernas estendidas até 90°. Desça devagar.", gifUrl: `${GIF_BASE}/0276-u3l5kZr.gif` },
      { name: "Bicicleta no ar", muscle: "Oblíquos", emoji: "🚴", sets: 3, reps: "20", weight: "Corpo", rest: 25, instruction: "Alterne cotovelo-joelho oposto em movimento de pedal.", gifUrl: `${GIF_BASE}/0278-gA9kSAF.gif` },
    ],
  },
  {
    name: "Alongamento", duration: "10 min", level: "Todos", icon: "🧘",
    exercises: [
      { name: "Alongamento de isquiotibiais", muscle: "Posterior", emoji: "🧘", sets: 2, reps: "30s cada", weight: "Corpo", rest: 10, instruction: "Em pé, toque os dedos dos pés mantendo as pernas esticadas.", gifUrl: `${GIF_BASE}/1502-oaT3LDR.gif` },
      { name: "Alongamento de quadríceps", muscle: "Anterior", emoji: "🧘", sets: 2, reps: "30s cada", weight: "Corpo", rest: 10, instruction: "Em pé, puxe o pé em direção ao glúteo segurando o tornozelo.", gifUrl: `${GIF_BASE}/1476-6e4HCrZ.gif` },
      { name: "Gato-vaca", muscle: "Coluna", emoji: "🐱", sets: 2, reps: "10", weight: "Corpo", rest: 10, instruction: "Em 4 apoios, alterne entre arredondar e estender a coluna.", gifUrl: `${GIF_BASE}/3183-vZf4Soy.gif` },
      { name: "Alongamento de peito", muscle: "Peito", emoji: "🤸", sets: 2, reps: "30s", weight: "Corpo", rest: 10, instruction: "Estenda os braços para trás entrelaçando os dedos. Abra o peito.", gifUrl: `${GIF_BASE}/3144-eRIkR7O.gif` },
    ],
  },
  {
    name: "Full Body", duration: "30 min", level: "Iniciante", icon: "⚡",
    exercises: [
      { name: "Agachamento livre", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "15", weight: "Corpo", rest: 45, instruction: "Pés na largura dos ombros, desça até 90° nos joelhos.", gifUrl: `${GIF_BASE}/0029-qi996YS.gif` },
      { name: "Flexão de braço", muscle: "Peito", emoji: "💪", sets: 3, reps: "10", weight: "Corpo", rest: 45, instruction: "Mãos na largura dos ombros, desça o peito até o chão.", gifUrl: `${GIF_BASE}/0662-qWvH8VX.gif` },
      { name: "Afundo", muscle: "Pernas", emoji: "🦵", sets: 3, reps: "10 cada", weight: "Corpo", rest: 40, instruction: "Dê um passo à frente, desça até 90° em ambos os joelhos.", gifUrl: `${GIF_BASE}/1429-iqTgkwV.gif` },
      { name: "Remada com toalha", muscle: "Costas", emoji: "🚣", sets: 3, reps: "12", weight: "Corpo", rest: 40, instruction: "Use uma toalha enrolada na porta. Puxe o corpo em direção à porta.", gifUrl: `${GIF_BASE}/0292-C0MA9bC.gif` },
      { name: "Prancha lateral", muscle: "Oblíquos", emoji: "💪", sets: 3, reps: "30s cada", weight: "Corpo", rest: 30, instruction: "Apoie-se no antebraço, mantenha o corpo alinhado lateralmente.", gifUrl: `${GIF_BASE}/0266-0Y8Hfj5.gif` },
    ],
  },
  {
    name: "Glúteos", duration: "25 min", level: "Intermediário", icon: "🍑",
    exercises: [
      { name: "Hip Thrust no chão", muscle: "Glúteos", emoji: "🍑", sets: 4, reps: "15", weight: "Corpo", rest: 40, instruction: "Deite com joelhos dobrados, eleve o quadril apertando os glúteos no topo.", gifUrl: `${GIF_BASE}/3214-oJwt1gF.gif` },
      { name: "Agachamento sumô", muscle: "Glúteos/Adutores", emoji: "🦵", sets: 3, reps: "15", weight: "Corpo", rest: 40, instruction: "Pés bem abertos, pontas para fora. Desça mantendo o tronco ereto.", gifUrl: `${GIF_BASE}/3216-IIfF0eo.gif` },
      { name: "Afundo búlgaro", muscle: "Glúteos/Quadríceps", emoji: "🦵", sets: 3, reps: "12 cada", weight: "Corpo", rest: 45, instruction: "Pé de trás elevado no sofá. Desça até 90° no joelho da frente.", gifUrl: `${GIF_BASE}/1429-iqTgkwV.gif` },
      { name: "Kickback", muscle: "Glúteos", emoji: "🍑", sets: 3, reps: "15 cada", weight: "Corpo", rest: 30, instruction: "Em 4 apoios, estenda a perna para trás apertando o glúteo.", gifUrl: `${GIF_BASE}/3231-T0kH1SN.gif` },
      { name: "Abdução deitado", muscle: "Glúteo médio", emoji: "🍑", sets: 3, reps: "15 cada", weight: "Corpo", rest: 30, instruction: "Deitado de lado, eleve a perna mantendo-a reta.", gifUrl: `${GIF_BASE}/3218-V1rEPAA.gif` },
    ],
  },
  {
    name: "Cardio em casa", duration: "20 min", level: "Todos", icon: "❤️",
    exercises: [
      { name: "Polichinelo", muscle: "Cardio", emoji: "⭐", sets: 3, reps: "40s", weight: "Corpo", rest: 20, instruction: "Salte abrindo braços e pernas. Ritmo acelerado.", gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX2rRe/giphy.gif" },
      { name: "Corrida no lugar", muscle: "Cardio", emoji: "🏃", sets: 3, reps: "40s", weight: "Corpo", rest: 20, instruction: "Corra no lugar elevando bem os joelhos.", gifUrl: `${GIF_BASE}/1160-3Mhi2Ll.gif` },
      { name: "Pular corda imaginária", muscle: "Cardio", emoji: "🪢", sets: 3, reps: "40s", weight: "Corpo", rest: 20, instruction: "Simule o movimento de pular corda com os punhos girando.", gifUrl: `${GIF_BASE}/2612-HBVfmCX.gif` },
      { name: "Agachamento com salto", muscle: "Pernas/Cardio", emoji: "🦵", sets: 3, reps: "12", weight: "Corpo", rest: 25, instruction: "Agache e salte explosivamente. Aterrisse suave.", gifUrl: `${GIF_BASE}/0584-rQY78g5.gif` },
      { name: "Mountain Climbers", muscle: "Core/Cardio", emoji: "🏔️", sets: 3, reps: "30s", weight: "Corpo", rest: 20, instruction: "Posição de prancha, alterne joelhos ao peito rapidamente.", gifUrl: `${GIF_BASE}/0658-DhU7Djj.gif` },
    ],
  },
];
