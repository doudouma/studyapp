// 免费资源补充清单：参考 Reddit / X 社区共识整理。
// 名称与提供方保留英文；介绍按语言本地化，缺失时回退英文。

export type FreeResourceGroup = "start" | "books" | "repos" | "videos";
export type FreeResourceTag =
  | "hub"
  | "course"
  | "github"
  | "pdf"
  | "online"
  | "guide"
  | "video";
export type ResourceLocale = "en" | "zh" | "fr" | "es" | "pt";

export interface FreeResource {
  id: string;
  group: FreeResourceGroup;
  name: string;
  by: string;
  url: string;
  tag: FreeResourceTag;
  desc: Record<ResourceLocale, string>;
}

export const FREE_RESOURCE_GROUPS: FreeResourceGroup[] = [
  "start",
  "books",
  "repos",
  "videos",
];

export const FREE_RESOURCES: FreeResource[] = [
  {
    id: "virelity-ai-ml",
    group: "start",
    name: "Virelity · AI & ML resource tree",
    by: "Curated from Reddit + GitHub",
    url: "https://virelity.com/resources/ai-ml",
    tag: "hub",
    desc: {
      en: "A curated tree of 60 free AI and ML links, split into core courses and LLM / generative AI paths, with Stanford, fast.ai and D2L included.",
      zh: "60 个精选免费 AI/ML 链接的资源树，分成核心课程与 LLM / 生成式 AI 两条路径，涵盖 Stanford、fast.ai、D2L。",
      fr: "Un arbre de 60 liens IA/ML gratuits, divisé en parcours « cours fondamentaux » et « LLM / IA générative », avec Stanford, fast.ai et D2L.",
      es: "Un árbol de 60 enlaces gratis de IA/ML, dividido en cursos base y rutas de LLM / IA generativa, con Stanford, fast.ai y D2L.",
      pt: "Uma árvore de 60 links grátis de IA/ML, dividida em cursos base e trilhas de LLM / IA generativa, com Stanford, fast.ai e D2L.",
    },
  },
  {
    id: "hf-llm-course",
    group: "start",
    name: "Hugging Face LLM Course",
    by: "Hugging Face",
    url: "https://huggingface.co/learn/llm-course",
    tag: "course",
    desc: {
      en: "A free 12-chapter course that goes from transformers and fine-tuning to building and reasoning with LLMs.",
      zh: "免费 12 章课程，从 Transformer、微调一路讲到 LLM 应用构建与推理。",
      fr: "Un cours gratuit en 12 chapitres, des transformers et du fine-tuning à la construction et au raisonnement avec des LLM.",
      es: "Un curso gratis de 12 capítulos, desde transformers y fine-tuning hasta construir y razonar con LLM.",
      pt: "Um curso grátis de 12 capítulos, de transformers e fine-tuning à construção e raciocínio com LLMs.",
    },
  },
  {
    id: "ms-genai-beginners",
    group: "start",
    name: "Microsoft · Generative AI for Beginners",
    by: "Microsoft",
    url: "https://github.com/microsoft/generative-ai-for-beginners",
    tag: "github",
    desc: {
      en: "21 hands-on lessons on LLM basics, prompting, RAG and agents, with runnable notebooks and code samples.",
      zh: "21 节动手课，覆盖 LLM 基础、提示词、RAG 与智能体，附可直接运行的 Notebook 和代码。",
      fr: "21 leçons pratiques sur les bases des LLM, le prompting, le RAG et les agents, avec notebooks et exemples de code exécutables.",
      es: "21 lecciones prácticas sobre fundamentos de LLM, prompting, RAG y agentes, con notebooks y código ejecutables.",
      pt: "21 lições práticas sobre fundamentos de LLM, prompting, RAG e agentes, com notebooks e códigos executáveis.",
    },
  },
  {
    id: "deeplearning-ai-short-courses",
    group: "start",
    name: "DeepLearning.AI · Short Courses",
    by: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/short-courses/",
    tag: "course",
    desc: {
      en: "Short, practical courses on prompt engineering, RAG, agents and fine-tuning, most taking one to two hours.",
      zh: "短小实用的课程，覆盖提示词、RAG、智能体与微调，多数 1–2 小时可完成。",
      fr: "Des cours courts et pratiques sur le prompting, le RAG, les agents et le fine-tuning, souvent en une à deux heures.",
      es: "Cursos cortos y prácticos sobre prompting, RAG, agentes y fine-tuning, la mayoría de una a dos horas.",
      pt: "Cursos curtos e práticos sobre prompting, RAG, agentes e fine-tuning, a maioria de uma a duas horas.",
    },
  },
  {
    id: "google-ml-crash-course",
    group: "start",
    name: "Google · Machine Learning Crash Course",
    by: "Google",
    url: "https://developers.google.com/machine-learning/crash-course",
    tag: "course",
    desc: {
      en: "Google's fast, practical introduction to machine learning, with interactive lessons and TensorFlow exercises.",
      zh: "Google 出品的机器学习快速入门，交互式课程配 TensorFlow 练习。",
      fr: "L'introduction rapide et pratique de Google au machine learning, avec leçons interactives et exercices TensorFlow.",
      es: "La introducción rápida y práctica de Google al machine learning, con lecciones interactivas y ejercicios de TensorFlow.",
      pt: "A introdução rápida e prática do Google ao machine learning, com lições interativas e exercícios de TensorFlow.",
    },
  },
  {
    id: "islp",
    group: "books",
    name: "An Introduction to Statistical Learning",
    by: "James, Witten, Hastie, Tibshirani",
    url: "https://www.statlearning.com/",
    tag: "pdf",
    desc: {
      en: "The standard modern introduction to statistical learning: free PDF, Python and R labs, and a gentle path from regression to deep learning.",
      zh: "统计学习经典入门：官方免费 PDF、Python/R 实验，从回归平滑过渡到深度学习。",
      fr: "L'introduction moderne de référence au statistical learning : PDF gratuit, labs Python et R, et un parcours progressif de la régression au deep learning.",
      es: "La introducción moderna de referencia al statistical learning: PDF gratis, laboratorios en Python y R, y un camino suave de la regresión al deep learning.",
      pt: "A introdução moderna de referência ao statistical learning: PDF grátis, labs em Python e R, e um caminho suave da regressão ao deep learning.",
    },
  },
  {
    id: "d2l",
    group: "books",
    name: "Dive into Deep Learning",
    by: "D2L.ai",
    url: "https://d2l.ai/",
    tag: "online",
    desc: {
      en: "An open, interactive deep learning textbook with math, runnable PyTorch/JAX code and notebooks kept current by the community.",
      zh: "开源交互式深度学习教材，讲解、数学与可运行的 PyTorch/JAX 代码齐全，社区持续更新。",
      fr: "Un manuel de deep learning ouvert et interactif, avec les maths, du code PyTorch/JAX exécutable et des notebooks maintenus par la communauté.",
      es: "Un libro abierto e interactivo de deep learning, con matemáticas, código PyTorch/JAX ejecutable y notebooks mantenidos por la comunidad.",
      pt: "Um livro aberto e interativo de deep learning, com matemática, código PyTorch/JAX executável e notebooks mantidos pela comunidade.",
    },
  },
  {
    id: "deep-learning-book",
    group: "books",
    name: "Deep Learning",
    by: "Goodfellow, Bengio, Courville",
    url: "https://www.deeplearningbook.org/",
    tag: "online",
    desc: {
      en: "The theory-heavy reference for deep learning. Read it after a practical book, when you want the foundations in depth.",
      zh: "深度学习理论参考书。先读完一本实战书，再回来补理论最合适。",
      fr: "La référence théorique du deep learning. À lire après un livre pratique, quand vous voulez approfondir les fondations.",
      es: "La referencia teórica del deep learning. Léelo después de un libro práctico, cuando quieras profundizar en los fundamentos.",
      pt: "A referência teórica de deep learning. Leia depois de um livro prático, quando quiser aprofundar os fundamentos.",
    },
  },
  {
    id: "understanding-deep-learning",
    group: "books",
    name: "Understanding Deep Learning",
    by: "Simon J. D. Prince",
    url: "https://udlbook.github.io/udlbook/",
    tag: "pdf",
    desc: {
      en: "A modern 2024 textbook that balances intuition and rigor, with a free PDF and exercises for every chapter.",
      zh: "2024 年现代教材，在直觉与严谨之间平衡，免费 PDF，每章配练习。",
      fr: "Un manuel moderne de 2024 qui équilibre intuition et rigueur, avec PDF gratuit et exercices par chapitre.",
      es: "Un libro moderno de 2024 que equilibra intuición y rigor, con PDF gratis y ejercicios por capítulo.",
      pt: "Um livro moderno de 2024 que equilibra intuição e rigor, com PDF grátis e exercícios por capítulo.",
    },
  },
  {
    id: "ml-yearning",
    group: "books",
    name: "Machine Learning Yearning",
    by: "Andrew Ng",
    url: "https://www.mlyearning.org/",
    tag: "pdf",
    desc: {
      en: "A short, free book about organizing ML projects: metrics, train/test splits, error analysis and what to fix next.",
      zh: "一本讲如何组织 ML 项目的免费小书：指标、训练/测试集划分、错误分析与下一步该修什么。",
      fr: "Un court livre gratuit sur l'organisation de projets ML : métriques, découpage train/test, analyse d'erreurs et prochaines corrections.",
      es: "Un libro corto y gratis sobre cómo organizar proyectos de ML: métricas, división train/test, análisis de errores y qué corregir después.",
      pt: "Um livro curto e grátis sobre como organizar projetos de ML: métricas, divisão treino/teste, análise de erros e o que corrigir em seguida.",
    },
  },
  {
    id: "math-for-ml",
    group: "books",
    name: "Mathematics for Machine Learning",
    by: "Deisenroth, Faisal, Ong",
    url: "https://mml-book.github.io/",
    tag: "pdf",
    desc: {
      en: "A free textbook that fills the linear algebra, probability and calculus gaps you need before serious ML work.",
      zh: "免费教材，补齐认真做 ML 之前需要的线性代数、概率与微积分基础。",
      fr: "Un manuel gratuit qui comble les lacunes en algèbre linéaire, probabilités et calcul nécessaires avant un vrai travail en ML.",
      es: "Un libro gratis que cubre los huecos de álgebra lineal, probabilidad y cálculo que necesitas antes de trabajar en serio con ML.",
      pt: "Um livro grátis que preenche as lacunas de álgebra linear, probabilidade e cálculo necessárias antes de trabalhar a sério com ML.",
    },
  },
  {
    id: "llms-from-scratch",
    group: "repos",
    name: "LLMs-from-scratch",
    by: "Sebastian Raschka",
    url: "https://github.com/rasbt/LLMs-from-scratch",
    tag: "github",
    desc: {
      en: "Build a GPT step by step in PyTorch, from tokenization and attention to training and fine-tuning. The code is the lesson.",
      zh: "用 PyTorch 一步步搭建 GPT：分词、注意力、训练到微调，代码本身就是课程。",
      fr: "Construisez un GPT pas à pas en PyTorch, de la tokenisation et l'attention à l'entraînement et au fine-tuning. Le code est la leçon.",
      es: "Construye un GPT paso a paso en PyTorch, desde tokenización y atención hasta entrenamiento y fine-tuning. El código es la lección.",
      pt: "Construa um GPT passo a passo em PyTorch, da tokenização e atenção ao treino e fine-tuning. O código é a lição.",
    },
  },
  {
    id: "awesome-llm-apps",
    group: "repos",
    name: "awesome-llm-apps",
    by: "Shubham Saboo",
    url: "https://github.com/Shubhamsaboo/awesome-llm-apps",
    tag: "github",
    desc: {
      en: "A large collection of runnable LLM apps: RAG, agents, multimodal demos and production patterns you can clone and adapt.",
      zh: "大量可运行的 LLM 应用合集：RAG、智能体、多模态 Demo 与生产级模式，可直接克隆改造。",
      fr: "Une grande collection d'applications LLM exécutables : RAG, agents, démos multimodales et patterns de production à cloner et adapter.",
      es: "Una gran colección de apps LLM ejecutables: RAG, agentes, demos multimodales y patrones de producción que puedes clonar y adaptar.",
      pt: "Uma grande coleção de apps LLM executáveis: RAG, agentes, demos multimodais e padrões de produção que você pode clonar e adaptar.",
    },
  },
  {
    id: "llm-course",
    group: "repos",
    name: "mlabonne/llm-course",
    by: "Maxime Labonne",
    url: "https://github.com/mlabonne/llm-course",
    tag: "github",
    desc: {
      en: "A roadmap plus Colab notebooks for learning LLMs, from fundamentals and fine-tuning to deployment.",
      zh: "LLM 学习路线图 + Colab Notebook，从基础、微调到部署一应俱全。",
      fr: "Une feuille de route et des notebooks Colab pour apprendre les LLM, des fondamentaux et du fine-tuning au déploiement.",
      es: "Una hoja de ruta y notebooks de Colab para aprender LLM, desde fundamentos y fine-tuning hasta despliegue.",
      pt: "Um roteiro e notebooks Colab para aprender LLMs, dos fundamentos e fine-tuning à implantação.",
    },
  },
  {
    id: "prompt-engineering-guide",
    group: "repos",
    name: "Prompt Engineering Guide",
    by: "DAIR.AI",
    url: "https://www.promptingguide.ai/",
    tag: "guide",
    desc: {
      en: "A practical, example-driven guide to prompting techniques, from zero-shot basics to chain-of-thought and agents.",
      zh: "以示例驱动的提示词实用指南，从零样本基础到思维链与智能体。",
      fr: "Un guide pratique et concret du prompting, des bases zero-shot au chain-of-thought et aux agents.",
      es: "Una guía práctica y con ejemplos sobre prompting, desde lo básico zero-shot hasta chain-of-thought y agentes.",
      pt: "Um guia prático e com exemplos sobre prompting, do básico zero-shot ao chain-of-thought e agentes.",
    },
  },
  {
    id: "nanogpt",
    group: "repos",
    name: "nanoGPT",
    by: "Andrej Karpathy",
    url: "https://github.com/karpathy/nanoGPT",
    tag: "github",
    desc: {
      en: "Karpathy's minimal GPT training repo: small enough to read end to end, real enough to train on your own text.",
      zh: "Karpathy 的最小 GPT 训练仓库：小到能从头读完，又真到能用自己的文本训练。",
      fr: "Le dépôt minimal d'entraînement GPT de Karpathy : assez petit pour être lu en entier, assez réel pour entraîner sur vos textes.",
      es: "El repositorio mínimo de entrenamiento GPT de Karpathy: lo bastante pequeño para leerlo entero y lo bastante real para entrenar con tus textos.",
      pt: "O repositório mínimo de treino GPT do Karpathy: pequeno o bastante para ler inteiro e real o bastante para treinar com seus textos.",
    },
  },
  {
    id: "3blue1brown",
    group: "videos",
    name: "3Blue1Brown",
    by: "Grant Sanderson",
    url: "https://www.3blue1brown.com/",
    tag: "video",
    desc: {
      en: "Visual explanations of linear algebra, calculus and neural networks. Watch Essence of Linear Algebra before any ML course.",
      zh: "线性代数、微积分与神经网络的可视化讲解。上任何 ML 课之前，先看《线性代数的本质》。",
      fr: "Des explications visuelles de l'algèbre linéaire, du calcul et des réseaux de neurones. Regardez « Essence of Linear Algebra » avant tout cours de ML.",
      es: "Explicaciones visuales de álgebra lineal, cálculo y redes neuronales. Mira «Essence of Linear Algebra» antes de cualquier curso de ML.",
      pt: "Explicações visuais de álgebra linear, cálculo e redes neurais. Assista a «Essence of Linear Algebra» antes de qualquer curso de ML.",
    },
  },
  {
    id: "statquest",
    group: "videos",
    name: "StatQuest",
    by: "Josh Starmer",
    url: "https://www.youtube.com/@statquest",
    tag: "video",
    desc: {
      en: "Statistics and machine learning concepts explained one small step at a time, with clear visuals and no hand-waving.",
      zh: "把统计与机器学习概念拆成小步骤讲清楚，图示清晰，不跳步。",
      fr: "Les concepts de statistiques et de machine learning expliqués pas à pas, avec des visuels clairs et sans approximation.",
      es: "Conceptos de estadística y machine learning explicados paso a paso, con visuales claros y sin atajos.",
      pt: "Conceitos de estatística e machine learning explicados passo a passo, com visuais claros e sem atalhos.",
    },
  },
  {
    id: "karpathy",
    group: "videos",
    name: "Andrej Karpathy · Zero to Hero",
    by: "Andrej Karpathy",
    url: "https://www.youtube.com/@AndrejKarpathy",
    tag: "video",
    desc: {
      en: "Zero to Hero builds neural networks and GPT from scratch on camera. The closest thing to a free top-tier AI course.",
      zh: "Zero to Hero 在镜头前从零构建神经网络与 GPT，接近一门免费顶级 AI 课。",
      fr: "Zero to Hero construit des réseaux de neurones et un GPT de zéro à l'écran. Ce qui ressemble le plus à un cours d'IA gratuit de haut niveau.",
      es: "Zero to Hero construye redes neuronales y un GPT desde cero en pantalla. Lo más parecido a un curso de IA gratis de primer nivel.",
      pt: "Zero to Hero constrói redes neurais e um GPT do zero na tela. O mais próximo de um curso de IA grátis de alto nível.",
    },
  },
  {
    id: "yannic-kilcher",
    group: "videos",
    name: "Yannic Kilcher",
    by: "Yannic Kilcher",
    url: "https://www.youtube.com/@YannicKilcher",
    tag: "video",
    desc: {
      en: "Paper walkthroughs and research commentary. Good once you can read a model architecture and want to go deeper.",
      zh: "论文逐篇精讲与研究评论。能读懂模型结构之后，想深入时再看。",
      fr: "Des lectures détaillées d'articles et des commentaires de recherche. Utile quand vous savez lire une architecture et voulez aller plus loin.",
      es: "Análisis de artículos y comentarios de investigación. Útil cuando ya sabes leer una arquitectura y quieres profundizar.",
      pt: "Análises de artigos e comentários de pesquisa. Útil quando você já consegue ler uma arquitetura e quer se aprofundar.",
    },
  },
  {
    id: "two-minute-papers",
    group: "videos",
    name: "Two Minute Papers",
    by: "Károly Zsolnai-Fehér",
    url: "https://www.youtube.com/@TwoMinutePapers",
    tag: "video",
    desc: {
      en: "Short, enthusiastic summaries of new AI research. Useful for keeping up without reading every paper.",
      zh: "用几分钟热情讲解最新 AI 研究，适合不读完整论文也想跟上进展的人。",
      fr: "Des résumés courts et enthousiastes des nouvelles recherches en IA. Pratique pour suivre sans lire chaque article.",
      es: "Resúmenes cortos y entusiastas de nuevas investigaciones en IA. Útil para seguir el ritmo sin leer cada artículo.",
      pt: "Resumos curtos e entusiasmados de novas pesquisas em IA. Útil para acompanhar sem ler cada artigo.",
    },
  },
];

export const FREE_RESOURCE_COUNT = FREE_RESOURCES.length;
