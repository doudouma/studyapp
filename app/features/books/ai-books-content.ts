// AI 书单的编辑内容：快速回答、按目标选书表、评分方法与 FAQ。
// 注意：文案里的 84 本 / 26,414 条评分 / 2026-11-01 是数据快照，更新 data.ts 时需同步修改。
// 文案按语言本地化；书名/作者保留英文原名。

import type { ResourceLocale } from "~/features/books/free-resources";

type Localized = Record<ResourceLocale, string>;

export const AI_BOOKS_UPDATED = "2026-11-13";

export const QUICK_ANSWER: Localized = {
  en: "For most readers, start with Co-Intelligence by Ethan Mollick. Builders should read AI Engineering by Chip Huyen, and managers will get the most from The AI-Driven Leader by Geoff Woods. This shelf ranks 84 AI books using 26,414 Amazon ratings.",
  zh: "多数读者可以从 Ethan Mollick 的《Co-Intelligence》开始；想动手构建的人读 Chip Huyen 的《AI Engineering》；管理者最适合 Geoff Woods 的《The AI-Driven Leader》。本书单用 26,414 条 Amazon 评分对 84 本 AI 书进行排序。",
  fr: "Pour la plupart des lecteurs, commencez par Co-Intelligence d'Ethan Mollick. Les builders liront AI Engineering de Chip Huyen, et les managers tireront le plus de The AI-Driven Leader de Geoff Woods. Ce rayon classe 84 livres IA à partir de 26 414 notes Amazon.",
  es: "Para la mayoría de lectores, empieza por Co-Intelligence de Ethan Mollick. Quienes construyen productos deberían leer AI Engineering de Chip Huyen, y los directivos sacarán más de The AI-Driven Leader de Geoff Woods. Este estante ordena 84 libros de IA con 26.414 valoraciones de Amazon.",
  pt: "Para a maioria dos leitores, comece por Co-Intelligence, de Ethan Mollick. Quem constrói produtos deve ler AI Engineering, de Chip Huyen, e gestores aproveitarão mais The AI-Driven Leader, de Geoff Woods. Esta estante classifica 84 livros de IA com 26.414 avaliações da Amazon.",
};

export interface TopPick {
  asin: string;
  goal: Localized;
  book: string;
  author: string;
  why: Localized;
  fitFor: Localized;
  notFor: Localized;
}

export const TOP_PICKS: TopPick[] = [
  {
    asin: "059371671X",
    goal: { en: "Complete beginner", zh: "完全新手", fr: "Grand débutant", es: "Principiante total", pt: "Iniciante total" },
    book: "Co-Intelligence: Living and Working with AI",
    author: "Ethan Mollick",
    why: {
      en: "A short, practical introduction to working with AI, written for non-specialists.",
      zh: "短小实用，写给非技术读者的 AI 入门书。",
      fr: "Une introduction courte et pratique à l'IA, écrite pour les non-spécialistes.",
      es: "Una introducción breve y práctica a la IA, escrita para no especialistas.",
      pt: "Uma introdução curta e prática à IA, escrita para não especialistas.",
    },
    fitFor: {
      en: "Non-technical readers who want a practical, low-jargon starting point and habits for using AI at work.",
      zh: "想要实用、少术语的入门起点，并希望建立日常 AI 使用习惯的非技术读者。",
      fr: "Les lecteurs non techniques qui veulent un point de départ pratique et sans jargon, et des habitudes d'usage de l'IA au travail.",
      es: "Lectores no técnicos que buscan un punto de partida práctico y sin jerga, y hábitos para usar IA en el trabajo.",
      pt: "Leitores não técnicos que querem um ponto de partida prático e sem jargão, e hábitos para usar IA no trabalho.",
    },
    notFor: {
      en: "Readers looking for implementation details, deep prompt engineering or how to build AI products.",
      zh: "想深入了解实现细节、提示词工程，或想动手构建 AI 产品的读者。",
      fr: "Les lecteurs qui cherchent des détails d'implémentation, du prompt engineering avancé ou comment construire des produits IA.",
      es: "Lectores que buscan detalles de implementación, prompt engineering avanzado o cómo construir productos de IA.",
      pt: "Leitores que buscam detalhes de implementação, prompt engineering avançado ou como construir produtos de IA.",
    },
  },
  {
    asin: "1098166302",
    goal: { en: "Builder / engineer", zh: "开发者 / 工程师", fr: "Builder / ingénieur", es: "Builder / ingeniero", pt: "Builder / engenheiro" },
    book: "AI Engineering: Building Applications with Foundation Models",
    author: "Chip Huyen",
    why: {
      en: "The clearest guide to building products with foundation models, from evaluation to deployment.",
      zh: "用基础模型构建产品最清晰的一本，从评估到部署都有覆盖。",
      fr: "Le guide le plus clair pour construire des produits avec des modèles de fondation, de l'évaluation au déploiement.",
      es: "La guía más clara para construir productos con modelos fundacionales, de la evaluación al despliegue.",
      pt: "O guia mais claro para construir produtos com modelos de fundação, da avaliação ao deploy.",
    },
    fitFor: {
      en: "Engineers and technical PMs building LLM products who need evaluation, RAG, deployment and cost trade-offs.",
      zh: "正在构建 LLM 产品的工程师和技术型产品经理，需要评估、RAG、部署与成本权衡的实操指导。",
      fr: "Les ingénieurs et PM techniques qui construisent des produits LLM et ont besoin d'évaluation, de RAG, de déploiement et d'arbitrages de coûts.",
      es: "Ingenieros y PM técnicos que construyen productos LLM y necesitan evaluación, RAG, despliegue y decisiones de coste.",
      pt: "Engenheiros e PMs técnicos que constroem produtos LLM e precisam de avaliação, RAG, deploy e decisões de custo.",
    },
    notFor: {
      en: "Complete beginners or non-technical managers who want strategy without code.",
      zh: "完全新手，或只想要战略、不想碰代码的非技术管理者。",
      fr: "Les grands débutants ou les managers non techniques qui veulent de la stratégie sans code.",
      es: "Principiantes absolutos o directivos no técnicos que buscan estrategia sin código.",
      pt: "Iniciantes absolutos ou gestores não técnicos que querem estratégia sem código.",
    },
  },
  {
    asin: "B0GZ8F4C8Z",
    goal: { en: "Business leader", zh: "管理者", fr: "Dirigeant", es: "Directivo", pt: "Gestor" },
    book: "The AI-Driven Leader",
    author: "Geoff Woods",
    why: {
      en: "Frameworks for deciding where AI fits, without turning the book into a coding manual.",
      zh: "帮你判断 AI 该用在哪，而不是一本编程手册。",
      fr: "Des cadres pour décider où l'IA a sa place, sans transformer le livre en manuel de code.",
      es: "Marcos para decidir dónde encaja la IA, sin convertir el libro en un manual de programación.",
      pt: "Frameworks para decidir onde a IA se encaixa, sem transformar o livro em um manual de programação.",
    },
    fitFor: {
      en: "Managers and executives deciding where AI fits in workflows, teams and decisions.",
      zh: "想判断 AI 该用在哪些流程、团队和决策上的管理者与高管。",
      fr: "Les managers et dirigeants qui décident où l'IA a sa place dans les processus, les équipes et les décisions.",
      es: "Directivos y ejecutivos que deciden dónde encaja la IA en procesos, equipos y decisiones.",
      pt: "Gestores e executivos que decidem onde a IA se encaixa em processos, equipes e decisões.",
    },
    notFor: {
      en: "Readers who want hands-on model building or deep technical implementation.",
      zh: "想亲手搭建模型或深入技术实现的读者。",
      fr: "Les lecteurs qui veulent construire des modèles ou approfondir l'implémentation technique.",
      es: "Lectores que quieren construir modelos o profundizar en la implementación técnica.",
      pt: "Leitores que querem construir modelos ou aprofundar a implementação técnica.",
    },
  },
  {
    asin: "1394345925",
    goal: { en: "Designer / UX", zh: "设计师 / UX", fr: "Designer / UX", es: "Diseñador / UX", pt: "Designer / UX" },
    book: "UX for AI: A Framework for Designing AI-Driven Products",
    author: "Greg Nudelman, Daria Kempka",
    why: {
      en: "A design framework for AI products, including trust, feedback and failure states.",
      zh: "面向 AI 产品的设计框架，覆盖信任、反馈与失败状态。",
      fr: "Un cadre de design pour les produits IA, incluant confiance, feedback et états d'échec.",
      es: "Un marco de diseño para productos de IA, incluidos confianza, feedback y estados de fallo.",
      pt: "Um framework de design para produtos de IA, incluindo confiança, feedback e estados de falha.",
    },
    fitFor: {
      en: "Product designers and UX leads shaping AI features, including trust, feedback and failure states.",
      zh: "负责 AI 功能的产品设计师和 UX 负责人，尤其是要处理信任、反馈与失败状态的人。",
      fr: "Les designers produit et UX leads qui conçoivent des fonctionnalités IA, notamment confiance, feedback et états d'échec.",
      es: "Diseñadores de producto y responsables de UX que dan forma a funciones de IA, incluidos confianza, feedback y estados de fallo.",
      pt: "Designers de produto e líderes de UX que moldam recursos de IA, incluindo confiança, feedback e estados de falha.",
    },
    notFor: {
      en: "Engineers looking for model or backend architecture guidance.",
      zh: "想找模型或后端架构指导的工程师。",
      fr: "Les ingénieurs qui cherchent des conseils sur l'architecture des modèles ou du backend.",
      es: "Ingenieros que buscan guía sobre arquitectura de modelos o backend.",
      pt: "Engenheiros que buscam orientação sobre arquitetura de modelos ou backend.",
    },
  },
  {
    asin: "1541605527",
    goal: { en: "Writer", zh: "写作者", fr: "Auteur", es: "Escritor", pt: "Escritor" },
    book: "More Than Words: How to Think About Writing in the Age of AI",
    author: "John Warner",
    why: {
      en: "A thoughtful look at writing with AI without losing voice, judgment or craft.",
      zh: "认真讨论如何与 AI 一起写作，而不丢掉自己的声音、判断与手艺。",
      fr: "Un regard réfléchi sur l'écriture avec l'IA sans perdre sa voix, son jugement ou son métier.",
      es: "Una mirada reflexiva a escribir con IA sin perder voz, criterio ni oficio.",
      pt: "Um olhar ponderado sobre escrever com IA sem perder voz, julgamento ou ofício.",
    },
    fitFor: {
      en: "Writers and editors who want to keep their voice and judgment while using AI in the writing process.",
      zh: "希望在写作流程中使用 AI，同时保住自己声音与判断力的写作者和编辑。",
      fr: "Les auteurs et éditeurs qui veulent garder leur voix et leur jugement en utilisant l'IA dans leur processus d'écriture.",
      es: "Escritores y editores que quieren mantener su voz y criterio al usar IA en el proceso de escritura.",
      pt: "Escritores e editores que querem manter voz e julgamento ao usar IA no processo de escrita.",
    },
    notFor: {
      en: "Readers seeking prompt templates or a tactical AI writing toolkit.",
      zh: "想找提示词模板或可落地 AI 写作工具箱的读者。",
      fr: "Les lecteurs qui cherchent des modèles de prompts ou une boîte à outils tactique d'écriture IA.",
      es: "Lectores que buscan plantillas de prompts o un kit táctico de escritura con IA.",
      pt: "Leitores que buscam modelos de prompts ou um kit tático de escrita com IA.",
    },
  },
];

export interface MethodRow {
  id: "volume" | "quality" | "clarity";
  weight: string;
  text: Localized;
}

export const METHOD_INTRO: Localized = {
  en: "We score every book on three signals, then remove sponsored placements before ranking. No publisher can pay for a position.",
  zh: "每本书按三个信号打分，排序前剔除付费推广位。没有出版社可以付费购买排名。",
  fr: "Chaque livre est noté sur trois signaux, puis les placements sponsorisés sont retirés avant le classement. Aucun éditeur ne peut payer pour une position.",
  es: "Puntuamos cada libro con tres señales y eliminamos las colocaciones patrocinadas antes de ordenar. Ninguna editorial puede pagar por una posición.",
  pt: "Pontuamos cada livro com três sinais e removemos colocações patrocinadas antes de classificar. Nenhuma editora pode pagar por posição.",
};

export const METHOD_ROWS: MethodRow[] = [
  {
    id: "volume",
    weight: "50%",
    text: {
      en: "Review count, log-scaled. A book with 1,000 ratings is a stronger signal than one with 20.",
      zh: "评论数量，取对数缩放。1,000 条评分比 20 条更能说明问题。",
      fr: "Nombre d'avis, échelle logarithmique. 1 000 notes sont un signal plus fort que 20.",
      es: "Número de reseñas, en escala logarítmica. 1.000 valoraciones son una señal más fuerte que 20.",
      pt: "Número de avaliações, em escala logarítmica. 1.000 avaliações são um sinal mais forte que 20.",
    },
  },
  {
    id: "quality",
    weight: "30%",
    text: {
      en: "A Bayesian-adjusted rating, so a 5.0 with 3 reviews does not outrank a 4.6 with 1,000.",
      zh: "贝叶斯修正后的评分，避免 3 条评论的 5.0 压过 1,000 条评论的 4.6。",
      fr: "Une note ajustée par Bayes : un 5,0 avec 3 avis ne dépasse pas un 4,6 avec 1 000 avis.",
      es: "Una valoración ajustada por Bayes: un 5,0 con 3 reseñas no supera a un 4,6 con 1.000.",
      pt: "Uma nota ajustada por Bayes: um 5,0 com 3 avaliações não supera um 4,6 com 1.000.",
    },
  },
  {
    id: "clarity",
    weight: "20%",
    text: {
      en: "Title quality: penalizes keyword-stuffed and all-caps titles.",
      zh: "书名清晰度：对堆砌关键词和全大写的书名扣分。",
      fr: "Qualité du titre : pénalise les titres bourrés de mots-clés et tout en majuscules.",
      es: "Calidad del título: penaliza títulos cargados de palabras clave y todo en mayúsculas.",
      pt: "Qualidade do título: penaliza títulos cheios de palavras-chave e todo em maiúsculas.",
    },
  },
];

export const METHOD_SOURCE: Localized = {
  en: "Ratings and review counts come from Amazon product pages and were captured on 2026-11-01.",
  zh: "评分与评论数来自 Amazon 商品页，抓取于 2026-11-01。",
  fr: "Les notes et nombres d'avis viennent des pages produit Amazon et ont été capturés le 2026-11-01.",
  es: "Las valoraciones y el número de reseñas provienen de las páginas de producto de Amazon y se capturaron el 2026-11-01.",
  pt: "Avaliações e contagens de comentários vêm das páginas de produto da Amazon e foram capturadas em 2026-11-01.",
};

export const METHOD_AUTHOR: Localized = {
  en: "Curated by the 100mini editorial team. Last updated November 2026.",
  zh: "由 100mini 编辑团队整理。最后更新：2026 年 11 月。",
  fr: "Sélection réalisée par l'équipe éditoriale de 100mini. Dernière mise à jour : novembre 2026.",
  es: "Seleccionado por el equipo editorial de 100mini. Última actualización: noviembre de 2026.",
  pt: "Selecionado pela equipe editorial da 100mini. Última atualização: novembro de 2026.",
};

export interface FaqItem {
  id: string;
  q: Localized;
  a: Localized;
}

export const FAQ: FaqItem[] = [
  {
    id: "beginners",
    q: {
      en: "What is the best AI book for beginners?",
      zh: "AI 入门最好的书是哪一本？",
      fr: "Quel est le meilleur livre sur l'IA pour débuter ?",
      es: "¿Cuál es el mejor libro de IA para principiantes?",
      pt: "Qual é o melhor livro de IA para iniciantes?",
    },
    a: {
      en: "Co-Intelligence by Ethan Mollick is the safest first read: short, practical and written for non-specialists. If you want a hands-on path, pair it with AI for Absolute Beginners or the free Google Machine Learning Crash Course.",
      zh: "Ethan Mollick 的《Co-Intelligence》是最稳妥的第一本：短小、实用，写给非技术读者。想要动手实践，可以搭配《AI for Absolute Beginners》或免费的 Google 机器学习速成课。",
      fr: "Co-Intelligence d'Ethan Mollick est la première lecture la plus sûre : court, pratique et écrit pour les non-spécialistes. Pour une approche pratique, associez-le à AI for Absolute Beginners ou au cours gratuit Google Machine Learning Crash Course.",
      es: "Co-Intelligence de Ethan Mollick es la primera lectura más segura: breve, práctica y escrita para no especialistas. Para una ruta práctica, combínalo con AI for Absolute Beginners o el curso gratis Google Machine Learning Crash Course.",
      pt: "Co-Intelligence, de Ethan Mollick, é a primeira leitura mais segura: curto, prático e escrito para não especialistas. Para uma trilha prática, combine com AI for Absolute Beginners ou o curso grátis Google Machine Learning Crash Course.",
    },
  },
  {
    id: "engineers",
    q: {
      en: "What is the best AI book for engineers?",
      zh: "工程师最该读哪本 AI 书？",
      fr: "Quel est le meilleur livre sur l'IA pour les ingénieurs ?",
      es: "¿Cuál es el mejor libro de IA para ingenieros?",
      pt: "Qual é o melhor livro de IA para engenheiros?",
    },
    a: {
      en: "AI Engineering by Chip Huyen is the best all-round pick for building with foundation models. Go deeper with Designing Machine Learning Systems for production ML, or Hands-On Machine Learning for classical ML and deep learning.",
      zh: "Chip Huyen 的《AI Engineering》是用基础模型做产品的最佳综合选择。想深入生产环境 ML，读《Designing Machine Learning Systems》；想补经典 ML 与深度学习，读《Hands-On Machine Learning》。",
      fr: "AI Engineering de Chip Huyen est le meilleur choix global pour construire avec des modèles de fondation. Approfondissez avec Designing Machine Learning Systems pour le ML en production, ou Hands-On Machine Learning pour le ML classique et le deep learning.",
      es: "AI Engineering de Chip Huyen es la mejor opción global para construir con modelos fundacionales. Profundiza con Designing Machine Learning Systems para ML en producción, o Hands-On Machine Learning para ML clásico y deep learning.",
      pt: "AI Engineering, de Chip Huyen, é a melhor escolha geral para construir com modelos de fundação. Aprofunde com Designing Machine Learning Systems para ML em produção, ou Hands-On Machine Learning para ML clássico e deep learning.",
    },
  },
  {
    id: "ranking",
    q: {
      en: "How are these 84 AI books ranked?",
      zh: "这 84 本 AI 书是怎么排序的？",
      fr: "Comment ces 84 livres IA sont-ils classés ?",
      es: "¿Cómo se ordenan estos 84 libros de IA?",
      pt: "Como estes 84 livros de IA são classificados?",
    },
    a: {
      en: "The score is 50% review volume, 30% Bayesian-adjusted rating and 20% title clarity. We remove sponsored placements before ranking. The current snapshot uses 26,414 Amazon ratings captured in November 2026.",
      zh: "评分由 50% 评论数量、30% 贝叶斯修正评分和 20% 书名清晰度组成。排序前会剔除付费推广位。当前快照使用 2026 年 11 月抓取的 26,414 条 Amazon 评分。",
      fr: "Le score est composé de 50 % de volume d'avis, 30 % de note ajustée par Bayes et 20 % de clarté du titre. Les placements sponsorisés sont retirés avant le classement. Le snapshot actuel utilise 26 414 notes Amazon capturées en novembre 2026.",
      es: "La puntuación es 50% volumen de reseñas, 30% valoración ajustada por Bayes y 20% claridad del título. Eliminamos las colocaciones patrocinadas antes de ordenar. La instantánea actual usa 26.414 valoraciones de Amazon capturadas en noviembre de 2026.",
      pt: "A pontuação é 50% volume de avaliações, 30% nota ajustada por Bayes e 20% clareza do título. Removemos colocações patrocinadas antes de classificar. O snapshot atual usa 26.414 avaliações da Amazon capturadas em novembro de 2026.",
    },
  },
  {
    id: "free",
    q: {
      en: "Are these AI books free?",
      zh: "这些 AI 书是免费的吗？",
      fr: "Ces livres IA sont-ils gratuits ?",
      es: "¿Estos libros de IA son gratis?",
      pt: "Estes livros de IA são grátis?",
    },
    a: {
      en: "No. The shelf links to Amazon, where prices and availability change. If you want free material, the companion Free AI Library lists 30 free courses and 30 permanently free Kindle ebooks.",
      zh: "不是。书单链接到 Amazon，价格与库存会变化。想要免费内容，可以看配套的免费 AI 资源库：30 门免费课程和 30 本永久免费 Kindle 电子书。",
      fr: "Non. Le rayon renvoie vers Amazon, où les prix et la disponibilité changent. Pour du gratuit, la bibliothèque IA gratuite associée liste 30 cours gratuits et 30 ebooks Kindle gratuits en permanence.",
      es: "No. El estante enlaza a Amazon, donde cambian precios y disponibilidad. Si quieres material gratis, la Biblioteca IA gratis incluye 30 cursos gratis y 30 ebooks Kindle gratis para siempre.",
      pt: "Não. A estante leva à Amazon, onde preços e disponibilidade mudam. Para material grátis, a Biblioteca de IA grátis lista 30 cursos grátis e 30 ebooks Kindle gratuitos para sempre.",
    },
  },
  {
    id: "who",
    q: {
      en: "Who curates this list?",
      zh: "这份书单是谁整理的？",
      fr: "Qui sélectionne cette liste ?",
      es: "¿Quién selecciona esta lista?",
      pt: "Quem seleciona esta lista?",
    },
    a: {
      en: "The 100mini editorial team. We use Amazon reader signals and manually review titles, authors and categories. We do not accept payment for placement or rankings.",
      zh: "100mini 编辑团队。我们使用 Amazon 读者信号，并人工检查书名、作者与分类。我们不接受付费排名或付费收录。",
      fr: "L'équipe éditoriale de 100mini. Nous utilisons les signaux des lecteurs Amazon et vérifions manuellement les titres, auteurs et catégories. Nous n'acceptons aucun paiement pour le placement ou le classement.",
      es: "El equipo editorial de 100mini. Usamos señales de lectores de Amazon y revisamos manualmente títulos, autores y categorías. No aceptamos pagos por colocación ni clasificación.",
      pt: "A equipe editorial da 100mini. Usamos sinais de leitores da Amazon e revisamos manualmente títulos, autores e categorias. Não aceitamos pagamento por posicionamento ou classificação.",
    },
  },
];
