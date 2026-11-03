// AI 学习路径计算器：问题、估算参数、阶段书目与五语言文案。
// 阶段资源复用 free-path.ts 的 LEARNING_PATH；书目按 ASIN 从 data.ts 解析。

export type LpLocale = "en" | "zh" | "fr" | "es" | "pt";
export type GoalKey = "job" | "product" | "work" | "curious";
export type LevelKey = "beginner" | "some" | "dev";
export type HoursKey = "3" | "5" | "10" | "20";
export type FocusKey = "unsure" | "nlp" | "agents" | "cv" | "rl";
export type QuestionKey = "g" | "l" | "h" | "f";

export interface LpOption {
  value: string;
  label: string;
  sub: string;
}

export interface LpQuestion {
  key: QuestionKey;
  q: string;
  hint: string;
  options: LpOption[];
}

export const GOAL_HOURS: Record<GoalKey, number> = {
  job: 600,
  product: 400,
  work: 180,
  curious: 80,
};

export const LEVEL_MULT: Record<LevelKey, number> = {
  beginner: 1,
  some: 0.8,
  dev: 0.6,
};

export const FOCUS_HOURS: Record<FocusKey, number> = {
  unsure: 0,
  nlp: 60,
  cv: 80,
  rl: 100,
  agents: 40,
};

export const STAGE_WEIGHTS: Record<string, number> = {
  foundations: 0.18,
  build: 0.3,
  specialise: 0.32,
  community: 0.12,
  agents: 0.08,
};

export const STAGE_BOOKS: Record<string, { asins: string[]; byFocus?: Record<FocusKey, string[]> }> = {
  foundations: { asins: ["B08RWBSKQB", "B0GX1HSFF5"] },
  build: { asins: ["1098125975", "1801819319"] },
  specialise: {
    asins: ["1098166302", "1098107969"],
    byFocus: {
      nlp: ["B0FKZ3L1VX", "1098166302"],
      cv: ["B0F14NZLLJ", "B0FN37DV9N"],
      rl: ["B0H1VQLDTK", "1098107969"],
      agents: ["B0H1VQLDTK", "B0G1PPF5MC"],
      unsure: ["1098166302", "1098107969"],
    },
  },
  community: { asins: ["059371671X", "1250337747"] },
  agents: { asins: ["B0GPJM7CYK", "B0H1VQLDTK"] },
};

export interface LpCopy {
  kicker: string;
  h1: string;
  lede: string;
  facts: string[];
  start: string;
  back: string;
  resultJob: string;
  resultFinish: string;
  summaryJob: string;
  summaryFinish: string;
  levelChip: Record<LevelKey, string>;
  stageKicker: Record<string, string>;
  focusChip: Record<FocusKey, string>;
  totalHours: string;
  perWeek: string;
  doThis: string;
  readThis: string;
  stageMeta: string;
  firstWeeks: string;
  week: string;
  weekTask: string;
  copy: string;
  copied: string;
  copyFailed: string;
  print: string;
  restart: string;
  disclosure: string;
  freeLibrary: string;
  allBooks: string;
}

export const LP_COPY: Record<LpLocale, LpCopy> = {
  en: {
    kicker: "Free tool",
    h1: "How long until you're job-ready in AI?",
    lede: "Four questions. You get a realistic timeline, the free courses to take in order, and the two books per stage that are actually worth paying for.",
    facts: ["4 questions", "2 minutes", "No signup", "Built from 84 books + 60 free resources"],
    start: "Calculate my path →",
    back: "← Back",
    resultJob: "Projected job-ready",
    resultFinish: "Projected finish",
    summaryJob:
      "At {{hours}} hours a week you'll cover about {{total}} focused hours in {{weeks}} weeks. That is the point where you can show two real projects and start applying — not the point where you stop learning.",
    summaryFinish:
      "At {{hours}} hours a week you'll cover about {{total}} focused hours in {{weeks}} weeks. That assumes you ship something small at every stage instead of only watching videos.",
    levelChip: { beginner: "From zero", some: "Some Python", dev: "Developer" },
    stageKicker: { foundations: "Stage 1", build: "Stage 2", specialise: "Stage 3", community: "Ongoing", agents: "2026 add-on" },
    focusChip: {
      unsure: "Still exploring",
      nlp: "LLM & NLP",
      agents: "Agents",
      cv: "Computer vision",
      rl: "Reinforcement learning",
    },
    totalHours: "{{count}} hours",
    perWeek: "{{hours}}h / week",
    doThis: "Do this",
    readThis: "Read this",
    stageMeta: "~{{hours}}h · {{weeks}} weeks",
    firstWeeks: "Your first four weeks",
    week: "Week {{n}}",
    weekTask: "Finish the first module, then write down one thing you can build with it.",
    copy: "Copy link to my plan",
    copied: "Copied ✓",
    copyFailed: "Copy failed — select the URL",
    print: "Print / save PDF",
    restart: "Start over",
    disclosure:
      "How this is calculated. Timelines are estimates from total study hours (goal × starting level + specialisation), divided by your weekly hours, then shown as a range. They assume consistent weekly work and real projects, not video watching. Book links are Amazon affiliate links; free courses earn us nothing.",
    freeLibrary: "Free library",
    allBooks: "All books",
  },
  zh: {
    kicker: "免费工具",
    h1: "距离 AI 岗位就绪还有多久？",
    lede: "回答四个问题，得到一份现实的时间表、按顺序学习的免费课程，以及每个阶段真正值得花钱买的两本书。",
    facts: ["4 个问题", "2 分钟", "无需注册", "基于 84 本书 + 60 个免费资源"],
    start: "计算我的路径 →",
    back: "← 返回",
    resultJob: "预计达到岗位就绪",
    resultFinish: "预计完成时间",
    summaryJob:
      "每周投入 {{hours}} 小时，你大约会在 {{weeks}} 周内完成 {{total}} 个专注小时。这大约是你做出两个真实项目、可以开始投递的时间点，而不是停止学习的时间点。",
    summaryFinish:
      "每周投入 {{hours}} 小时，你大约会在 {{weeks}} 周内完成 {{total}} 个专注小时。前提是每个阶段都做出一个小东西，而不是只看视频。",
    levelChip: { beginner: "从零开始", some: "会一点 Python", dev: "开发者" },
    stageKicker: { foundations: "阶段 1", build: "阶段 2", specialise: "阶段 3", community: "长期", agents: "2026 加餐" },
    focusChip: {
      unsure: "还在探索",
      nlp: "LLM 与 NLP",
      agents: "智能体",
      cv: "计算机视觉",
      rl: "强化学习",
    },
    totalHours: "{{count}} 小时",
    perWeek: "每周 {{hours}} 小时",
    doThis: "做这些",
    readThis: "读这些",
    stageMeta: "约 {{hours}} 小时 · {{weeks}} 周",
    firstWeeks: "你的前四周",
    week: "第 {{n}} 周",
    weekTask: "完成第一个模块，然后写下你能用它做的一件事。",
    copy: "复制我的计划链接",
    copied: "已复制 ✓",
    copyFailed: "复制失败，请手动选择链接",
    print: "打印 / 保存 PDF",
    restart: "重新开始",
    disclosure:
      "计算方式：总学习时长由目标 × 起始水平 + 专精方向估算，再除以每周投入小时数，最后以区间展示。前提是持续投入并做真实项目，而不是只看视频。书籍链接为 Amazon 联盟链接；免费课程不带来收益。",
    freeLibrary: "免费资源库",
    allBooks: "全部书单",
  },
  fr: {
    kicker: "Outil gratuit",
    h1: "Combien de temps avant d'être prêt pour un poste en IA ?",
    lede: "Quatre questions. Vous obtenez un calendrier réaliste, les cours gratuits à suivre dans l'ordre et les deux livres par étape qui valent vraiment le prix.",
    facts: ["4 questions", "2 minutes", "Sans inscription", "Basé sur 84 livres + 60 ressources gratuites"],
    start: "Calculer mon parcours →",
    back: "← Retour",
    resultJob: "Prêt pour un poste (estimation)",
    resultFinish: "Fin estimée",
    summaryJob:
      "À {{hours}} heures par semaine, vous couvrirez environ {{total}} heures ciblées en {{weeks}} semaines. C'est le moment où vous pouvez montrer deux vrais projets et commencer à postuler, pas celui où vous arrêtez d'apprendre.",
    summaryFinish:
      "À {{hours}} heures par semaine, vous couvrirez environ {{total}} heures ciblées en {{weeks}} semaines. Cela suppose que vous livrez un petit projet à chaque étape au lieu de seulement regarder des vidéos.",
    levelChip: { beginner: "Depuis zéro", some: "Un peu de Python", dev: "Développeur" },
    stageKicker: { foundations: "Étape 1", build: "Étape 2", specialise: "Étape 3", community: "En continu", agents: "Bonus 2026" },
    focusChip: {
      unsure: "En exploration",
      nlp: "LLM et NLP",
      agents: "Agents",
      cv: "Vision par ordinateur",
      rl: "Apprentissage par renforcement",
    },
    totalHours: "{{count}} heures",
    perWeek: "{{hours}} h / semaine",
    doThis: "À faire",
    readThis: "À lire",
    stageMeta: "~{{hours}} h · {{weeks}} semaines",
    firstWeeks: "Vos quatre premières semaines",
    week: "Semaine {{n}}",
    weekTask: "Terminez le premier module, puis notez une chose que vous pouvez construire avec.",
    copy: "Copier le lien de mon plan",
    copied: "Copié ✓",
    copyFailed: "Copie impossible — sélectionnez l'URL",
    print: "Imprimer / enregistrer en PDF",
    restart: "Recommencer",
    disclosure:
      "Méthode de calcul : les durées sont estimées à partir du total d'heures d'étude (objectif × niveau de départ + spécialisation), divisé par vos heures hebdomadaires, puis affiché sous forme de fourchette. Elles supposent un travail régulier et de vrais projets, pas seulement des vidéos. Les liens livres sont des liens d'affiliation Amazon ; les cours gratuits ne nous rapportent rien.",
    freeLibrary: "Bibliothèque gratuite",
    allBooks: "Tous les livres",
  },
  es: {
    kicker: "Herramienta gratis",
    h1: "¿Cuánto falta para estar listo para un trabajo en IA?",
    lede: "Cuatro preguntas. Obtienes un calendario realista, los cursos gratis que hacer en orden y los dos libros por etapa que de verdad valen la pena.",
    facts: ["4 preguntas", "2 minutos", "Sin registro", "Basado en 84 libros + 60 recursos gratis"],
    start: "Calcular mi ruta →",
    back: "← Atrás",
    resultJob: "Listo para trabajar (estimado)",
    resultFinish: "Fin estimado",
    summaryJob:
      "Con {{hours}} horas a la semana cubrirás unas {{total}} horas enfocadas en {{weeks}} semanas. Ese es el punto en el que puedes mostrar dos proyectos reales y empezar a aplicar, no el punto en el que dejas de aprender.",
    summaryFinish:
      "Con {{hours}} horas a la semana cubrirás unas {{total}} horas enfocadas en {{weeks}} semanas. Eso supone que entregas algo pequeño en cada etapa en vez de solo ver vídeos.",
    levelChip: { beginner: "Desde cero", some: "Algo de Python", dev: "Desarrollador" },
    stageKicker: { foundations: "Etapa 1", build: "Etapa 2", specialise: "Etapa 3", community: "Continuo", agents: "Extra 2026" },
    focusChip: {
      unsure: "Explorando",
      nlp: "LLM y NLP",
      agents: "Agentes",
      cv: "Visión por computador",
      rl: "Aprendizaje por refuerzo",
    },
    totalHours: "{{count}} horas",
    perWeek: "{{hours}} h / semana",
    doThis: "Haz esto",
    readThis: "Lee esto",
    stageMeta: "~{{hours}} h · {{weeks}} semanas",
    firstWeeks: "Tus primeras cuatro semanas",
    week: "Semana {{n}}",
    weekTask: "Termina el primer módulo y luego escribe una cosa que puedas construir con él.",
    copy: "Copiar enlace de mi plan",
    copied: "Copiado ✓",
    copyFailed: "No se pudo copiar; selecciona la URL",
    print: "Imprimir / guardar PDF",
    restart: "Empezar de nuevo",
    disclosure:
      "Cómo se calcula: los plazos se estiman a partir del total de horas de estudio (objetivo × nivel inicial + especialización), dividido por tus horas semanales y mostrado como un rango. Asumen trabajo constante y proyectos reales, no solo vídeos. Los enlaces de libros son de afiliado de Amazon; los cursos gratis no nos reportan nada.",
    freeLibrary: "Biblioteca gratis",
    allBooks: "Todos los libros",
  },
  pt: {
    kicker: "Ferramenta grátis",
    h1: "Quanto tempo até estar pronto para uma vaga em IA?",
    lede: "Quatro perguntas. Você recebe um cronograma realista, os cursos grátis para fazer em ordem e os dois livros por etapa que realmente valem a pena.",
    facts: ["4 perguntas", "2 minutos", "Sem cadastro", "Baseado em 84 livros + 60 recursos grátis"],
    start: "Calcular minha trilha →",
    back: "← Voltar",
    resultJob: "Pronto para vaga (estimativa)",
    resultFinish: "Conclusão estimada",
    summaryJob:
      "Com {{hours}} horas por semana, você cobre cerca de {{total}} horas focadas em {{weeks}} semanas. Esse é o ponto em que você pode mostrar dois projetos reais e começar a aplicar, não o ponto em que para de aprender.",
    summaryFinish:
      "Com {{hours}} horas por semana, você cobre cerca de {{total}} horas focadas em {{weeks}} semanas. Isso supõe que você entrega algo pequeno em cada etapa em vez de apenas assistir vídeos.",
    levelChip: { beginner: "Do zero", some: "Um pouco de Python", dev: "Desenvolvedor" },
    stageKicker: { foundations: "Etapa 1", build: "Etapa 2", specialise: "Etapa 3", community: "Contínuo", agents: "Extra 2026" },
    focusChip: {
      unsure: "Explorando",
      nlp: "LLM e NLP",
      agents: "Agentes",
      cv: "Visão computacional",
      rl: "Aprendizado por reforço",
    },
    totalHours: "{{count}} horas",
    perWeek: "{{hours}}h / semana",
    doThis: "Faça isto",
    readThis: "Leia isto",
    stageMeta: "~{{hours}}h · {{weeks}} semanas",
    firstWeeks: "Suas primeiras quatro semanas",
    week: "Semana {{n}}",
    weekTask: "Termine o primeiro módulo e depois escreva uma coisa que você pode construir com ele.",
    copy: "Copiar link do meu plano",
    copied: "Copiado ✓",
    copyFailed: "Falha ao copiar — selecione a URL",
    print: "Imprimir / salvar PDF",
    restart: "Começar de novo",
    disclosure:
      "Como é calculado: os prazos são estimativas a partir do total de horas de estudo (objetivo × nível inicial + especialização), dividido pelas suas horas semanais e exibido como intervalo. Assumem trabalho consistente e projetos reais, não apenas vídeos. Os links de livros são de afiliado da Amazon; cursos grátis não nos rendem nada.",
    freeLibrary: "Biblioteca grátis",
    allBooks: "Todos os livros",
  },
};

const questionsEn: LpQuestion[] = [
  {
    key: "g",
    q: "What are you aiming at?",
    hint: "This sets the total study hours.",
    options: [
      { value: "job", label: "Get an AI / ML job", sub: "The longest path, ~600 focused hours" },
      { value: "product", label: "Build an AI product", sub: "~400 hours, project-first" },
      { value: "work", label: "Use AI better at work", sub: "~180 hours, no maths detour" },
      { value: "curious", label: "Just understand it", sub: "~80 hours, no pressure" },
    ],
  },
  {
    key: "l",
    q: "Where are you starting?",
    hint: "Be honest — it only changes the estimate.",
    options: [
      { value: "beginner", label: "Complete beginner", sub: "No coding yet" },
      { value: "some", label: "Some Python", sub: "Can write scripts, no ML" },
      { value: "dev", label: "Working developer", sub: "Comfortable with code and APIs" },
    ],
  },
  {
    key: "h",
    q: "How many hours a week, realistically?",
    hint: "Pick what you'll actually do, not the ideal.",
    options: [
      { value: "3", label: "3 hours", sub: "A few evenings" },
      { value: "5", label: "5 hours", sub: "Most weekdays, short sessions" },
      { value: "10", label: "10 hours", sub: "Serious side project pace" },
      { value: "20", label: "20 hours", sub: "Near full-time" },
    ],
  },
  {
    key: "f",
    q: "Any direction in mind?",
    hint: "You can change it later — the first three months are the same.",
    options: [
      { value: "unsure", label: "Not sure yet", sub: "Start general" },
      { value: "nlp", label: "LLM & NLP", sub: "Text, chat, retrieval" },
      { value: "agents", label: "Agents", sub: "Tools, workflows, automation" },
      { value: "cv", label: "Computer vision", sub: "Images, video, diffusion" },
      { value: "rl", label: "Reinforcement learning", sub: "Decisions, rewards, control" },
    ],
  },
];

const questionsZh: LpQuestion[] = [
  {
    key: "g",
    q: "你的目标是什么？",
    hint: "这决定总学习时长。",
    options: [
      { value: "job", label: "找一份 AI / ML 工作", sub: "最长路径，约 600 个专注小时" },
      { value: "product", label: "做一个 AI 产品", sub: "约 400 小时，项目优先" },
      { value: "work", label: "在工作中更好地用 AI", sub: "约 180 小时，不绕数学" },
      { value: "curious", label: "只是想搞懂", sub: "约 80 小时，没有压力" },
    ],
  },
  {
    key: "l",
    q: "你的起点在哪？",
    hint: "如实选择，这只影响估算。",
    options: [
      { value: "beginner", label: "完全新手", sub: "还不会写代码" },
      { value: "some", label: "会一点 Python", sub: "能写脚本，没学过 ML" },
      { value: "dev", label: "在职开发者", sub: "熟悉代码和 API" },
    ],
  },
  {
    key: "h",
    q: "每周实际能投入多少小时？",
    hint: "选你真的能做到的，而不是理想值。",
    options: [
      { value: "3", label: "3 小时", sub: "几个晚上" },
      { value: "5", label: "5 小时", sub: "多数工作日，短时间" },
      { value: "10", label: "10 小时", sub: "认真的副业节奏" },
      { value: "20", label: "20 小时", sub: "接近全职" },
    ],
  },
  {
    key: "f",
    q: "有想走的方向吗？",
    hint: "之后可以改——前三个月的路径是一样的。",
    options: [
      { value: "unsure", label: "还不确定", sub: "先打通用基础" },
      { value: "nlp", label: "LLM 与 NLP", sub: "文本、对话、检索" },
      { value: "agents", label: "智能体", sub: "工具、工作流、自动化" },
      { value: "cv", label: "计算机视觉", sub: "图像、视频、扩散模型" },
      { value: "rl", label: "强化学习", sub: "决策、奖励、控制" },
    ],
  },
];

const questionsFr: LpQuestion[] = [
  {
    key: "g",
    q: "Quel est votre objectif ?",
    hint: "Cela fixe le total d'heures d'étude.",
    options: [
      { value: "job", label: "Décrocher un poste en IA / ML", sub: "Le parcours le plus long, ~600 heures ciblées" },
      { value: "product", label: "Construire un produit IA", sub: "~400 heures, orienté projet" },
      { value: "work", label: "Mieux utiliser l'IA au travail", sub: "~180 heures, sans détour mathématique" },
      { value: "curious", label: "Juste comprendre", sub: "~80 heures, sans pression" },
    ],
  },
  {
    key: "l",
    q: "Où en êtes-vous ?",
    hint: "Soyez honnête — cela ne change que l'estimation.",
    options: [
      { value: "beginner", label: "Grand débutant", sub: "Pas encore de code" },
      { value: "some", label: "Un peu de Python", sub: "Peut écrire des scripts, pas de ML" },
      { value: "dev", label: "Développeur en poste", sub: "À l'aise avec le code et les API" },
    ],
  },
  {
    key: "h",
    q: "Combien d'heures par semaine, réellement ?",
    hint: "Choisissez ce que vous ferez vraiment, pas l'idéal.",
    options: [
      { value: "3", label: "3 heures", sub: "Quelques soirées" },
      { value: "5", label: "5 heures", sub: "La plupart des jours, sessions courtes" },
      { value: "10", label: "10 heures", sub: "Rythme sérieux de side project" },
      { value: "20", label: "20 heures", sub: "Presque à plein temps" },
    ],
  },
  {
    key: "f",
    q: "Une direction en tête ?",
    hint: "Vous pourrez changer — les trois premiers mois sont identiques.",
    options: [
      { value: "unsure", label: "Pas encore sûr", sub: "Commencer général" },
      { value: "nlp", label: "LLM et NLP", sub: "Texte, chat, retrieval" },
      { value: "agents", label: "Agents", sub: "Outils, workflows, automatisation" },
      { value: "cv", label: "Vision par ordinateur", sub: "Images, vidéo, diffusion" },
      { value: "rl", label: "Apprentissage par renforcement", sub: "Décisions, récompenses, contrôle" },
    ],
  },
];

const questionsEs: LpQuestion[] = [
  {
    key: "g",
    q: "¿Cuál es tu objetivo?",
    hint: "Esto fija el total de horas de estudio.",
    options: [
      { value: "job", label: "Conseguir un trabajo de IA / ML", sub: "La ruta más larga, ~600 horas enfocadas" },
      { value: "product", label: "Construir un producto de IA", sub: "~400 horas, proyecto primero" },
      { value: "work", label: "Usar mejor la IA en el trabajo", sub: "~180 horas, sin desvíos matemáticos" },
      { value: "curious", label: "Solo entenderlo", sub: "~80 horas, sin presión" },
    ],
  },
  {
    key: "l",
    q: "¿Desde dónde empiezas?",
    hint: "Sé honesto: solo cambia la estimación.",
    options: [
      { value: "beginner", label: "Principiante total", sub: "Aún sin código" },
      { value: "some", label: "Algo de Python", sub: "Puede escribir scripts, sin ML" },
      { value: "dev", label: "Desarrollador en activo", sub: "Cómodo con código y APIs" },
    ],
  },
  {
    key: "h",
    q: "¿Cuántas horas a la semana, de verdad?",
    hint: "Elige lo que harás de verdad, no lo ideal.",
    options: [
      { value: "3", label: "3 horas", sub: "Algunas noches" },
      { value: "5", label: "5 horas", sub: "Casi todos los días, sesiones cortas" },
      { value: "10", label: "10 horas", sub: "Ritmo serio de proyecto personal" },
      { value: "20", label: "20 horas", sub: "Casi a tiempo completo" },
    ],
  },
  {
    key: "f",
    q: "¿Alguna dirección en mente?",
    hint: "Puedes cambiarla después: los primeros tres meses son iguales.",
    options: [
      { value: "unsure", label: "Aún no lo sé", sub: "Empezar general" },
      { value: "nlp", label: "LLM y NLP", sub: "Texto, chat, retrieval" },
      { value: "agents", label: "Agentes", sub: "Herramientas, flujos, automatización" },
      { value: "cv", label: "Visión por computador", sub: "Imágenes, vídeo, difusión" },
      { value: "rl", label: "Aprendizaje por refuerzo", sub: "Decisiones, recompensas, control" },
    ],
  },
];

const questionsPt: LpQuestion[] = [
  {
    key: "g",
    q: "Qual é o seu objetivo?",
    hint: "Isso define o total de horas de estudo.",
    options: [
      { value: "job", label: "Conseguir uma vaga em IA / ML", sub: "A trilha mais longa, ~600 horas focadas" },
      { value: "product", label: "Construir um produto de IA", sub: "~400 horas, projeto primeiro" },
      { value: "work", label: "Usar melhor a IA no trabalho", sub: "~180 horas, sem desvios matemáticos" },
      { value: "curious", label: "Só entender", sub: "~80 horas, sem pressão" },
    ],
  },
  {
    key: "l",
    q: "De onde você parte?",
    hint: "Seja honesto: isso só muda a estimativa.",
    options: [
      { value: "beginner", label: "Iniciante total", sub: "Ainda sem código" },
      { value: "some", label: "Um pouco de Python", sub: "Escreve scripts, sem ML" },
      { value: "dev", label: "Desenvolvedor ativo", sub: "Confortável com código e APIs" },
    ],
  },
  {
    key: "h",
    q: "Quantas horas por semana, de verdade?",
    hint: "Escolha o que você realmente fará, não o ideal.",
    options: [
      { value: "3", label: "3 horas", sub: "Algumas noites" },
      { value: "5", label: "5 horas", sub: "Quase todos os dias, sessões curtas" },
      { value: "10", label: "10 horas", sub: "Ritmo sério de projeto pessoal" },
      { value: "20", label: "20 horas", sub: "Quase em tempo integral" },
    ],
  },
  {
    key: "f",
    q: "Alguma direção em mente?",
    hint: "Você pode mudar depois — os primeiros três meses são iguais.",
    options: [
      { value: "unsure", label: "Ainda não sei", sub: "Começar geral" },
      { value: "nlp", label: "LLM e NLP", sub: "Texto, chat, retrieval" },
      { value: "agents", label: "Agentes", sub: "Ferramentas, fluxos, automação" },
      { value: "cv", label: "Visão computacional", sub: "Imagens, vídeo, difusão" },
      { value: "rl", label: "Aprendizado por reforço", sub: "Decisões, recompensas, controle" },
    ],
  },
];

export const LP_QUESTIONS: Record<LpLocale, LpQuestion[]> = {
  en: questionsEn,
  zh: questionsZh,
  fr: questionsFr,
  es: questionsEs,
  pt: questionsPt,
};
