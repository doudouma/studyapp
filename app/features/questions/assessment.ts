// AI Readiness Self-Assessment：10 条陈述，0–3 分，映射到 9 个 100 Questions 指南。
// 文案按 5 种语言本地化；指南标题/摘要从 shared/questions 加载。

import type { QuestionLocale } from "@shared/types/questions";

type Localized = Record<QuestionLocale, string>;

export interface AssessmentQuestion {
  id: string;
  guideSlug: string;
  text: Localized;
  action: Localized;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "prompting",
    guideSlug: "ai-100-questions-2026-11-01",
    text: {
      en: "I can write a prompt with a clear role, context, constraints and output format.",
      zh: "我能写出包含明确角色、上下文、约束和输出格式的提示词。",
      fr: "Je sais écrire un prompt avec un rôle, un contexte, des contraintes et un format de sortie clairs.",
      es: "Sé escribir un prompt con rol, contexto, restricciones y formato de salida claros.",
      pt: "Consigo escrever um prompt com papel, contexto, restrições e formato de saída claros.",
    },
    action: {
      en: "Write one prompt with role + context + output format, run it, then tighten the constraints.",
      zh: "写一个包含角色、上下文、输出格式的提示词，运行后再收紧约束。",
      fr: "Écrivez un prompt avec rôle + contexte + format de sortie, testez-le, puis resserrez les contraintes.",
      es: "Escribe un prompt con rol + contexto + formato de salida, pruébalo y luego ajusta las restricciones.",
      pt: "Escreva um prompt com papel + contexto + formato de saída, teste e depois ajuste as restrições.",
    },
  },
  {
    id: "agents",
    guideSlug: "ai-100-questions-2026-11-01",
    text: {
      en: "I have built or debugged an AI agent that uses tools or multi-step workflows.",
      zh: "我构建或调试过使用工具或多步工作流的 AI 智能体。",
      fr: "J'ai construit ou débogué un agent IA qui utilise des outils ou des workflows multi-étapes.",
      es: "He construido o depurado un agente de IA que usa herramientas o flujos de varios pasos.",
      pt: "Já construí ou depurei um agente de IA que usa ferramentas ou fluxos de várias etapas.",
    },
    action: {
      en: "Build a two-step agent with one tool and a clear success check.",
      zh: "做一个两步智能体，接入一个工具，并定义清晰的成功标准。",
      fr: "Construisez un agent en deux étapes avec un outil et un critère de réussite clair.",
      es: "Construye un agente de dos pasos con una herramienta y un criterio de éxito claro.",
      pt: "Construa um agente de duas etapas com uma ferramenta e um critério de sucesso claro.",
    },
  },
  {
    id: "vibe-coding",
    guideSlug: "vibe-coding-100-questions",
    text: {
      en: "I have shipped a small app or prototype with AI coding tools.",
      zh: "我用 AI 编程工具发布过一个小应用或原型。",
      fr: "J'ai livré une petite app ou un prototype avec des outils de code IA.",
      es: "He lanzado una pequeña app o prototipo con herramientas de código con IA.",
      pt: "Já lancei um pequeno app ou protótipo com ferramentas de código com IA.",
    },
    action: {
      en: "Ship a one-page app and publish it with a live link.",
      zh: "做一个单页应用，并发布成可访问的链接。",
      fr: "Livrez une app d'une page et publiez-la avec un lien en ligne.",
      es: "Publica una app de una página con un enlace en vivo.",
      pt: "Lance um app de uma página com um link ao vivo.",
    },
  },
  {
    id: "codex",
    guideSlug: "codex-100-questions",
    text: {
      en: "I use a CLI coding agent (Codex or similar) on real tasks, not just demos.",
      zh: "我在真实任务中使用 CLI 编程智能体（Codex 等），而不只是做演示。",
      fr: "J'utilise un agent de code en CLI (Codex ou similaire) sur de vraies tâches, pas seulement des démos.",
      es: "Uso un agente de código por CLI (Codex o similar) en tareas reales, no solo demos.",
      pt: "Uso um agente de código via CLI (Codex ou similar) em tarefas reais, não apenas demos.",
    },
    action: {
      en: "Give Codex a small real task, review the diff, and run the tests.",
      zh: "给 Codex 一个真实的小任务，检查 diff，并运行测试。",
      fr: "Confiez à Codex une petite tâche réelle, relisez le diff et lancez les tests.",
      es: "Dale a Codex una tarea real pequeña, revisa el diff y ejecuta las pruebas.",
      pt: "Dê ao Codex uma tarefa real pequena, revise o diff e rode os testes.",
    },
  },
  {
    id: "rag",
    guideSlug: "rag-100-questions",
    text: {
      en: "I understand how chunking, embeddings and retrieval affect RAG answer quality.",
      zh: "我理解分块、向量化与检索如何影响 RAG 的回答质量。",
      fr: "Je comprends comment le chunking, les embeddings et la recherche affectent la qualité des réponses RAG.",
      es: "Entiendo cómo el chunking, los embeddings y la recuperación afectan la calidad de las respuestas RAG.",
      pt: "Entendo como chunking, embeddings e recuperação afetam a qualidade das respostas RAG.",
    },
    action: {
      en: "Build a RAG demo over 20 of your own documents and inspect the retrieved chunks.",
      zh: "用 20 份自己的文档做一个 RAG Demo，检查实际检索到的分块。",
      fr: "Construisez une démo RAG sur 20 de vos documents et inspectez les chunks récupérés.",
      es: "Crea una demo RAG con 20 de tus documentos e inspecciona los fragmentos recuperados.",
      pt: "Crie uma demo RAG com 20 documentos seus e inspecione os trechos recuperados.",
    },
  },
  {
    id: "context",
    guideSlug: "context-engineering-100-questions",
    text: {
      en: "I manage context windows, memory and instructions deliberately in long sessions.",
      zh: "在长会话中，我会主动管理上下文窗口、记忆与指令。",
      fr: "Je gère délibérément la fenêtre de contexte, la mémoire et les instructions dans les longues sessions.",
      es: "Gestiono de forma deliberada la ventana de contexto, la memoria y las instrucciones en sesiones largas.",
      pt: "Gerencio de forma deliberada a janela de contexto, a memória e as instruções em sessões longas.",
    },
    action: {
      en: "Rewrite one long prompt with explicit context, memory and stop conditions.",
      zh: "重写一个长提示词，明确上下文、记忆与停止条件。",
      fr: "Réécrivez un prompt long avec contexte, mémoire et conditions d'arrêt explicites.",
      es: "Reescribe un prompt largo con contexto, memoria y condiciones de parada explícitas.",
      pt: "Reescreva um prompt longo com contexto, memória e condições de parada explícitas.",
    },
  },
  {
    id: "github",
    guideSlug: "github-100-questions",
    text: {
      en: "I use Git and GitHub for version control and collaboration.",
      zh: "我使用 Git 与 GitHub 做版本控制和协作。",
      fr: "J'utilise Git et GitHub pour le contrôle de version et la collaboration.",
      es: "Uso Git y GitHub para control de versiones y colaboración.",
      pt: "Uso Git e GitHub para controle de versão e colaboração.",
    },
    action: {
      en: "Put one project under Git, write a clear README, and open a pull request.",
      zh: "把一个项目纳入 Git，写清 README，并提交一个 Pull Request。",
      fr: "Placez un projet sous Git, écrivez un README clair et ouvrez une pull request.",
      es: "Pon un proyecto bajo Git, escribe un README claro y abre un pull request.",
      pt: "Coloque um projeto no Git, escreva um README claro e abra um pull request.",
    },
  },
  {
    id: "obsidian",
    guideSlug: "obsidian-100-questions",
    text: {
      en: "I maintain a personal knowledge base (Obsidian or similar) linked to my work.",
      zh: "我维护一个与工作相连的个人知识库（Obsidian 等）。",
      fr: "Je maintiens une base de connaissances personnelle (Obsidian ou similaire) liée à mon travail.",
      es: "Mantengo una base de conocimiento personal (Obsidian o similar) vinculada a mi trabajo.",
      pt: "Mantenho uma base de conhecimento pessoal (Obsidian ou similar) ligada ao meu trabalho.",
    },
    action: {
      en: "Create a note for your current project and link it to three source notes.",
      zh: "为当前项目建一条笔记，并链接到三条来源笔记。",
      fr: "Créez une note pour votre projet actuel et reliez-la à trois notes sources.",
      es: "Crea una nota para tu proyecto actual y enlázala a tres notas fuente.",
      pt: "Crie uma nota para seu projeto atual e vincule-a a três notas de origem.",
    },
  },
  {
    id: "workbuddy",
    guideSlug: "workbuddy-100-questions",
    text: {
      en: "I use AI to improve office workflows (documents, spreadsheets, meetings).",
      zh: "我用 AI 改进办公流程（文档、表格、会议）。",
      fr: "J'utilise l'IA pour améliorer les workflows bureautiques (documents, tableurs, réunions).",
      es: "Uso IA para mejorar flujos de oficina (documentos, hojas de cálculo, reuniones).",
      pt: "Uso IA para melhorar fluxos de escritório (documentos, planilhas, reuniões).",
    },
    action: {
      en: "Automate one recurring office task and measure the time saved.",
      zh: "自动化一个重复办公任务，并测量节省的时间。",
      fr: "Automatisez une tâche bureautique récurrente et mesurez le temps gagné.",
      es: "Automatiza una tarea de oficina recurrente y mide el tiempo ahorrado.",
      pt: "Automatize uma tarefa de escritório recorrente e meça o tempo economizado.",
    },
  },
  {
    id: "jev",
    guideSlug: "jev-100-questions",
    text: {
      en: "I have a deliberate framework for judging AI output and deciding when not to trust it.",
      zh: "我有一套明确的方法来判断 AI 输出，并决定什么时候不能信它。",
      fr: "J'ai un cadre explicite pour juger les sorties IA et décider quand ne pas leur faire confiance.",
      es: "Tengo un marco explícito para juzgar la salida de la IA y decidir cuándo no confiar en ella.",
      pt: "Tenho um framework explícito para julgar a saída da IA e decidir quando não confiar nela.",
    },
    action: {
      en: "Write a short checklist for verifying one AI-generated decision.",
      zh: "为验证一个 AI 生成的决策，写一份简短检查清单。",
      fr: "Écrivez une courte checklist pour vérifier une décision générée par l'IA.",
      es: "Escribe una lista breve para verificar una decisión generada por IA.",
      pt: "Escreva um checklist curto para verificar uma decisão gerada por IA.",
    },
  },
];

export const ASSESSMENT_LABELS: Record<string, Localized> = {
  prompting: { en: "Prompting", zh: "提示词", fr: "Prompting", es: "Prompting", pt: "Prompting" },
  agents: { en: "Agents", zh: "智能体", fr: "Agents", es: "Agentes", pt: "Agentes" },
  "vibe-coding": { en: "Vibe coding", zh: "Vibe Coding", fr: "Vibe coding", es: "Vibe coding", pt: "Vibe coding" },
  codex: { en: "Codex / CLI", zh: "Codex / CLI", fr: "Codex / CLI", es: "Codex / CLI", pt: "Codex / CLI" },
  rag: { en: "RAG", zh: "RAG", fr: "RAG", es: "RAG", pt: "RAG" },
  context: { en: "Context", zh: "上下文", fr: "Contexte", es: "Contexto", pt: "Contexto" },
  github: { en: "GitHub", zh: "GitHub", fr: "GitHub", es: "GitHub", pt: "GitHub" },
  obsidian: { en: "Knowledge base", zh: "知识库", fr: "Base de connaissances", es: "Base de conocimiento", pt: "Base de conhecimento" },
  workbuddy: { en: "Office workflows", zh: "办公流程", fr: "Workflows bureautiques", es: "Flujos de oficina", pt: "Fluxos de escritório" },
  jev: { en: "Judgment", zh: "判断力", fr: "Jugement", es: "Criterio", pt: "Julgamento" },
};

export const ASSESSMENT_SCALE: Localized[] = [
  { en: "Never", zh: "从未", fr: "Jamais", es: "Nunca", pt: "Nunca" },
  { en: "Sometimes", zh: "偶尔", fr: "Parfois", es: "A veces", pt: "Às vezes" },
  { en: "Often", zh: "经常", fr: "Souvent", es: "A menudo", pt: "Frequentemente" },
  { en: "Always", zh: "总是", fr: "Toujours", es: "Siempre", pt: "Sempre" },
];

export interface AssessmentLevel {
  min: number;
  name: Localized;
  desc: Localized;
}

export const ASSESSMENT_LEVELS: AssessmentLevel[] = [
  {
    min: 0,
    name: { en: "Explorer", zh: "探索者", fr: "Explorateur", es: "Explorador", pt: "Explorador" },
    desc: {
      en: "You have curiosity but little hands-on practice. Start with one guide and one small project.",
      zh: "你有好奇心，但动手还不多。先读一个指南，再做一个很小的项目。",
      fr: "Vous êtes curieux mais encore peu pratique. Commencez par un guide et un petit projet.",
      es: "Tienes curiosidad pero poca práctica. Empieza con una guía y un proyecto pequeño.",
      pt: "Você tem curiosidade, mas ainda pouca prática. Comece com um guia e um projeto pequeno.",
    },
  },
  {
    min: 40,
    name: { en: "Practitioner", zh: "实践者", fr: "Praticien", es: "Practicante", pt: "Praticante" },
    desc: {
      en: "You can use AI for real work. The next step is depth in one or two areas.",
      zh: "你已经能把 AI 用在真实工作中。下一步是在一两个方向上深入。",
      fr: "Vous utilisez l'IA pour du vrai travail. L'étape suivante : approfondir un ou deux domaines.",
      es: "Ya usas IA para trabajo real. El siguiente paso es profundizar en una o dos áreas.",
      pt: "Você já usa IA em trabalho real. O próximo passo é aprofundar em uma ou duas áreas.",
    },
  },
  {
    min: 70,
    name: { en: "Builder", zh: "构建者", fr: "Builder", es: "Constructor", pt: "Construtor" },
    desc: {
      en: "You build and evaluate AI systems. Focus on gaps, not more introductions.",
      zh: "你能构建并评估 AI 系统。接下来关注具体短板，而不是更多入门内容。",
      fr: "Vous construisez et évaluez des systèmes IA. Concentrez-vous sur les lacunes, pas sur d'autres introductions.",
      es: "Construyes y evalúas sistemas de IA. Céntrate en los huecos, no en más introducciones.",
      pt: "Você constrói e avalia sistemas de IA. Foque nas lacunas, não em mais introduções.",
    },
  },
];

export interface AssessmentCopy {
  kicker: string;
  h1: string;
  lede: string;
  start: string;
  back: string;
  progress: string;
  result: string;
  scoreLabel: string;
  levelLabel: string;
  breakdown: string;
  nextTitle: string;
  nextDesc: string;
  actionLabel: string;
  readGuide: string;
  copy: string;
  copied: string;
  print: string;
  restart: string;
  publishCta: string;
  questionsCta: string;
  howTitle: string;
  howText: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  disclaimer: string;
}

export const ASSESSMENT_COPY: Record<QuestionLocale, AssessmentCopy> = {
  en: {
    kicker: "Free self-assessment",
    h1: "How AI-ready are you?",
    lede: "Ten statements, two minutes. Get a readiness score, see your weakest areas, and the three 100 Questions guides to read next.",
    start: "Start the assessment →",
    back: "← Back",
    progress: "{{current}} / {{total}}",
    result: "Your AI readiness",
    scoreLabel: "Readiness score",
    levelLabel: "Level",
    breakdown: "Domain breakdown",
    nextTitle: "Read these next",
    nextDesc: "Your three lowest-scoring areas, mapped to the most relevant guides.",
    actionLabel: "Next action",
    readGuide: "Read the guide",
    copy: "Copy link to my result",
    copied: "Copied ✓",
    print: "Print / save PDF",
    restart: "Start over",
    publishCta: "Built something? Publish it with 100mini →",
    questionsCta: "Browse all 100 Questions guides",
    howTitle: "How scoring works",
    howText: "Ten statements, each scored 0–3. The total is normalized to 100. A low score in an area is not a failure; it tells you what to read or build next.",
    faqTitle: "FAQ",
    faq: [
      { q: "Is this an official certification?", a: "No. It is a self-assessment based on the skills covered by the 100 Questions guides." },
      { q: "How long does it take?", a: "About two minutes. There is no signup and no email required." },
      { q: "How are the guides chosen?", a: "We rank your lowest-scoring areas and map each one to the guide that covers that skill." },
      { q: "Does a low score mean I am bad at AI?", a: "No. It only reflects these ten statements. Use it to choose what to learn next." },
    ],
    disclaimer: "This is a self-assessment, not a certification.",
  },
  zh: {
    kicker: "免费自测",
    h1: "你的 AI 准备度有多高？",
    lede: "10 条陈述，约 2 分钟。得到准备度分数、最薄弱的领域，以及接下来该读的 3 个 100 Questions 指南。",
    start: "开始自测 →",
    back: "← 返回",
    progress: "{{current}} / {{total}}",
    result: "你的 AI 准备度",
    scoreLabel: "准备度分数",
    levelLabel: "等级",
    breakdown: "各领域得分",
    nextTitle: "接下来读这些",
    nextDesc: "得分最低的三个领域，分别对应最相关的指南。",
    actionLabel: "下一步行动",
    readGuide: "阅读指南",
    copy: "复制我的结果链接",
    copied: "已复制 ✓",
    print: "打印 / 保存 PDF",
    restart: "重新开始",
    publishCta: "做出了东西？用 100mini 发布上线 →",
    questionsCta: "浏览全部 100 Questions 指南",
    howTitle: "评分方式",
    howText: "10 条陈述，每条 0–3 分，总分换算为 100 分制。某个领域分数低不代表失败，它只告诉你接下来该读什么、做什么。",
    faqTitle: "常见问题",
    faq: [
      { q: "这是官方认证吗？", a: "不是。这是基于 100 Questions 指南覆盖技能的自测。" },
      { q: "需要多长时间？", a: "约 2 分钟。无需注册，也不需要邮箱。" },
      { q: "指南是怎么选出来的？", a: "我们按得分从低到高排序，把每个薄弱领域映射到覆盖该技能的指南。" },
      { q: "分数低是不是说明我不擅长 AI？", a: "不是。它只反映这 10 条陈述，用来帮你决定下一步学什么。" },
    ],
    disclaimer: "这是自测，不是认证。",
  },
  fr: {
    kicker: "Auto-évaluation gratuite",
    h1: "Quel est votre niveau de préparation à l'IA ?",
    lede: "Dix affirmations, deux minutes. Obtenez un score, repérez vos points faibles et les trois guides 100 Questions à lire ensuite.",
    start: "Commencer l'évaluation →",
    back: "← Retour",
    progress: "{{current}} / {{total}}",
    result: "Votre préparation à l'IA",
    scoreLabel: "Score de préparation",
    levelLabel: "Niveau",
    breakdown: "Détail par domaine",
    nextTitle: "À lire ensuite",
    nextDesc: "Vos trois domaines les plus faibles, associés aux guides les plus pertinents.",
    actionLabel: "Prochaine action",
    readGuide: "Lire le guide",
    copy: "Copier le lien de mon résultat",
    copied: "Copié ✓",
    print: "Imprimer / enregistrer en PDF",
    restart: "Recommencer",
    publishCta: "Vous avez construit quelque chose ? Publiez-le avec 100mini →",
    questionsCta: "Parcourir les guides 100 Questions",
    howTitle: "Comment le score est calculé",
    howText: "Dix affirmations notées de 0 à 3. Le total est ramené sur 100. Un score faible dans un domaine n'est pas un échec : il indique quoi lire ou construire ensuite.",
    faqTitle: "FAQ",
    faq: [
      { q: "Est-ce une certification officielle ?", a: "Non. C'est une auto-évaluation basée sur les compétences couvertes par les guides 100 Questions." },
      { q: "Combien de temps cela prend-il ?", a: "Environ deux minutes. Sans inscription ni e-mail." },
      { q: "Comment les guides sont-ils choisis ?", a: "Nous classons vos domaines les plus faibles et les associons au guide qui couvre cette compétence." },
      { q: "Un score faible signifie-t-il que je suis mauvais en IA ?", a: "Non. Il reflète seulement ces dix affirmations. Utilisez-le pour choisir quoi apprendre ensuite." },
    ],
    disclaimer: "Ceci est une auto-évaluation, pas une certification.",
  },
  es: {
    kicker: "Autoevaluación gratis",
    h1: "¿Qué tan preparado estás para la IA?",
    lede: "Diez afirmaciones, dos minutos. Obtén una puntuación, tus áreas más débiles y las tres guías 100 Questions que leer después.",
    start: "Empezar la evaluación →",
    back: "← Atrás",
    progress: "{{current}} / {{total}}",
    result: "Tu preparación en IA",
    scoreLabel: "Puntuación de preparación",
    levelLabel: "Nivel",
    breakdown: "Desglose por dominio",
    nextTitle: "Lee esto después",
    nextDesc: "Tus tres áreas con menor puntuación, asociadas a las guías más relevantes.",
    actionLabel: "Siguiente acción",
    readGuide: "Leer la guía",
    copy: "Copiar enlace de mi resultado",
    copied: "Copiado ✓",
    print: "Imprimir / guardar PDF",
    restart: "Empezar de nuevo",
    publishCta: "¿Has construido algo? Publícalo con 100mini →",
    questionsCta: "Explorar todas las guías 100 Questions",
    howTitle: "Cómo se calcula",
    howText: "Diez afirmaciones puntuadas de 0 a 3. El total se normaliza a 100. Una puntuación baja en un área no es un fracaso: indica qué leer o construir después.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Es una certificación oficial?", a: "No. Es una autoevaluación basada en las habilidades cubiertas por las guías 100 Questions." },
      { q: "¿Cuánto tarda?", a: "Unos dos minutos. Sin registro ni correo." },
      { q: "¿Cómo se eligen las guías?", a: "Ordenamos tus áreas con menor puntuación y las asociamos a la guía que cubre esa habilidad." },
      { q: "¿Una puntuación baja significa que soy malo en IA?", a: "No. Solo refleja estas diez afirmaciones. Úsala para elegir qué aprender después." },
    ],
    disclaimer: "Esto es una autoevaluación, no una certificación.",
  },
  pt: {
    kicker: "Autoavaliação grátis",
    h1: "Quão pronto para IA você está?",
    lede: "Dez afirmações, dois minutos. Receba uma pontuação, veja suas áreas mais fracas e os três guias 100 Questions para ler em seguida.",
    start: "Começar a avaliação →",
    back: "← Voltar",
    progress: "{{current}} / {{total}}",
    result: "Sua preparação em IA",
    scoreLabel: "Pontuação de preparação",
    levelLabel: "Nível",
    breakdown: "Detalhe por domínio",
    nextTitle: "Leia estes a seguir",
    nextDesc: "Suas três áreas com menor pontuação, mapeadas para os guias mais relevantes.",
    actionLabel: "Próxima ação",
    readGuide: "Ler o guia",
    copy: "Copiar link do meu resultado",
    copied: "Copiado ✓",
    print: "Imprimir / salvar PDF",
    restart: "Começar de novo",
    publishCta: "Construiu algo? Publique com a 100mini →",
    questionsCta: "Explorar todos os guias 100 Questions",
    howTitle: "Como a pontuação funciona",
    howText: "Dez afirmações pontuadas de 0 a 3. O total é normalizado para 100. Uma pontuação baixa em uma área não é fracasso: indica o que ler ou construir em seguida.",
    faqTitle: "Perguntas frequentes",
    faq: [
      { q: "Isto é uma certificação oficial?", a: "Não. É uma autoavaliação baseada nas habilidades cobertas pelos guias 100 Questions." },
      { q: "Quanto tempo leva?", a: "Cerca de dois minutos. Sem cadastro e sem e-mail." },
      { q: "Como os guias são escolhidos?", a: "Classificamos suas áreas com menor pontuação e mapeamos cada uma para o guia que cobre aquela habilidade." },
      { q: "Pontuação baixa significa que sou ruim em IA?", a: "Não. Ela reflete apenas estas dez afirmações. Use para escolher o que aprender em seguida." },
    ],
    disclaimer: "Isto é uma autoavaliação, não uma certificação.",
  },
};
