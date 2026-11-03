// 程序化 SEO 页面注册表：/ai-books/{slug}
// 单一事实来源，前端路由与服务端 sitemap 共用。
// 每个页面必须有独立的 h1 / topic / intro，避免只替换变量的 doorway 页。

export type AiBookPageLocale = "en" | "zh" | "fr" | "es" | "pt";
export type AiBookPageKind = "category" | "audience";

export interface AiBookPageCopy {
  h1: string;
  topic: string;
  intro: string;
}

export interface AiBookPageConfig {
  slug: string;
  kind: AiBookPageKind;
  /** category 页使用：BOOKS 的 category key */
  category?: string;
  /** audience 页使用：精选 ASIN 列表 */
  asins?: string[];
  copy: Record<AiBookPageLocale, AiBookPageCopy>;
}

export const AI_BOOK_PAGES: AiBookPageConfig[] = [
  {
    slug: "best-ai-business-books",
    kind: "category",
    category: "ai-business",
    copy: {
      en: {
        h1: "Best AI Business Books (2026)",
        topic: "AI Business Books",
        intro:
          "Books for leaders who need to decide where AI fits, build a roadmap and get a team to adopt it. This list favors practical frameworks over coding tutorials.",
      },
      zh: {
        h1: "2026 最佳 AI 商业书籍",
        topic: "AI 商业书籍",
        intro:
          "写给需要判断 AI 该用在哪、制定路线图并推动团队落地的管理者。这份书单偏重实用框架，而不是编程教程。",
      },
      fr: {
        h1: "Meilleurs livres IA pour les entreprises (2026)",
        topic: "Livres IA pour les entreprises",
        intro:
          "Des livres pour les dirigeants qui doivent décider où l'IA a sa place, construire une feuille de route et embarquer une équipe. La sélection privilégie les cadres pratiques aux tutoriels de code.",
      },
      es: {
        h1: "Mejores libros de IA para empresas (2026)",
        topic: "Libros de IA para empresas",
        intro:
          "Libros para directivos que deben decidir dónde encaja la IA, construir una hoja de ruta y lograr adopción del equipo. La lista prioriza marcos prácticos sobre tutoriales de código.",
      },
      pt: {
        h1: "Melhores livros de IA para negócios (2026)",
        topic: "Livros de IA para negócios",
        intro:
          "Livros para líderes que precisam decidir onde a IA se encaixa, montar um roteiro e engajar o time. A seleção prioriza frameworks práticos em vez de tutoriais de código.",
      },
    },
  },
  {
    slug: "best-ai-tools-books",
    kind: "category",
    category: "ai-tools",
    copy: {
      en: {
        h1: "Best AI Tools Books (2026)",
        topic: "AI Tools Books",
        intro:
          "Books about choosing, evaluating and actually using AI tools. Start here if you want product-level understanding without building models from scratch.",
      },
      zh: {
        h1: "2026 最佳 AI 工具书籍",
        topic: "AI 工具书籍",
        intro:
          "关于如何选择、评估和真正使用 AI 工具的书。想理解产品层而不从头训练模型，可以从这里开始。",
      },
      fr: {
        h1: "Meilleurs livres sur les outils IA (2026)",
        topic: "Livres sur les outils IA",
        intro:
          "Des livres pour choisir, évaluer et vraiment utiliser les outils IA. À commencer ici si vous voulez comprendre le niveau produit sans entraîner de modèles.",
      },
      es: {
        h1: "Mejores libros sobre herramientas de IA (2026)",
        topic: "Libros sobre herramientas de IA",
        intro:
          "Libros para elegir, evaluar y usar de verdad herramientas de IA. Empieza aquí si quieres entender el nivel de producto sin entrenar modelos.",
      },
      pt: {
        h1: "Melhores livros sobre ferramentas de IA (2026)",
        topic: "Livros sobre ferramentas de IA",
        intro:
          "Livros para escolher, avaliar e realmente usar ferramentas de IA. Comece aqui se quiser entender o nível de produto sem treinar modelos.",
      },
    },
  },
  {
    slug: "best-ai-design-books",
    kind: "category",
    category: "ai-design",
    copy: {
      en: {
        h1: "Best AI Design Books (2026)",
        topic: "AI Design Books",
        intro:
          "UX and product-design books for AI features: trust, feedback, failure states and human-centered workflows.",
      },
      zh: {
        h1: "2026 最佳 AI 设计书籍",
        topic: "AI 设计书籍",
        intro: "面向 AI 功能的 UX 与产品设计书：信任、反馈、失败状态与以人为本的工作流。",
      },
      fr: {
        h1: "Meilleurs livres de design IA (2026)",
        topic: "Livres de design IA",
        intro:
          "Des livres d'UX et de design produit pour les fonctionnalités IA : confiance, feedback, états d'échec et workflows centrés sur l'humain.",
      },
      es: {
        h1: "Mejores libros de diseño de IA (2026)",
        topic: "Libros de diseño de IA",
        intro:
          "Libros de UX y diseño de producto para funciones de IA: confianza, feedback, estados de fallo y flujos centrados en las personas.",
      },
      pt: {
        h1: "Melhores livros de design de IA (2026)",
        topic: "Livros de design de IA",
        intro:
          "Livros de UX e design de produto para recursos de IA: confiança, feedback, estados de falha e fluxos centrados nas pessoas.",
      },
    },
  },
  {
    slug: "best-ai-writing-books",
    kind: "category",
    category: "ai-writing",
    copy: {
      en: {
        h1: "Best AI Writing Books (2026)",
        topic: "AI Writing Books",
        intro:
          "Books for writers and editors working with AI, from prompt craft to keeping voice and judgment.",
      },
      zh: {
        h1: "2026 最佳 AI 写作书籍",
        topic: "AI 写作书籍",
        intro: "写给与 AI 合作的作者和编辑：从提示词技巧到如何保住自己的声音与判断。",
      },
      fr: {
        h1: "Meilleurs livres sur l'écriture avec l'IA (2026)",
        topic: "Livres sur l'écriture avec l'IA",
        intro:
          "Des livres pour les auteurs et éditeurs qui travaillent avec l'IA, du prompt à la préservation de la voix et du jugement.",
      },
      es: {
        h1: "Mejores libros sobre escritura con IA (2026)",
        topic: "Libros sobre escritura con IA",
        intro:
          "Libros para autores y editores que trabajan con IA, desde el prompting hasta conservar voz y criterio.",
      },
      pt: {
        h1: "Melhores livros sobre escrita com IA (2026)",
        topic: "Livros sobre escrita com IA",
        intro:
          "Livros para autores e editores que trabalham com IA, do prompting à preservação da voz e do julgamento.",
      },
    },
  },
  {
    slug: "best-ai-productivity-books",
    kind: "category",
    category: "ai-productivity",
    copy: {
      en: {
        h1: "Best AI Productivity Books (2026)",
        topic: "AI Productivity Books",
        intro:
          "Practical books on automating work, building AI workflows and saving time without adding tool sprawl.",
      },
      zh: {
        h1: "2026 最佳 AI 效率书籍",
        topic: "AI 效率书籍",
        intro: "关于工作自动化、搭建 AI 工作流、在不增加工具负担的前提下省时间的实用书。",
      },
      fr: {
        h1: "Meilleurs livres sur la productivité IA (2026)",
        topic: "Livres sur la productivité IA",
        intro:
          "Des livres pratiques sur l'automatisation du travail, les workflows IA et le gain de temps sans multiplier les outils.",
      },
      es: {
        h1: "Mejores libros de productividad con IA (2026)",
        topic: "Libros de productividad con IA",
        intro:
          "Libros prácticos sobre automatizar el trabajo, crear flujos con IA y ahorrar tiempo sin acumular herramientas.",
      },
      pt: {
        h1: "Melhores livros de produtividade com IA (2026)",
        topic: "Livros de produtividade com IA",
        intro:
          "Livros práticos sobre automatizar o trabalho, criar fluxos com IA e ganhar tempo sem acumular ferramentas.",
      },
    },
  },
  {
    slug: "best-ai-money-books",
    kind: "category",
    category: "ai-money",
    copy: {
      en: {
        h1: "Best AI Money Books (2026)",
        topic: "AI Money Books",
        intro:
          "Books on AI-enabled businesses, freelancing and income streams. Useful for operators, less so for pure researchers.",
      },
      zh: {
        h1: "2026 最佳 AI 变现书籍",
        topic: "AI 变现书籍",
        intro: "关于 AI 创业、自由职业与收入来源的书。适合实操者，不太适合纯研究者。",
      },
      fr: {
        h1: "Meilleurs livres pour gagner de l'argent avec l'IA (2026)",
        topic: "Livres pour gagner de l'argent avec l'IA",
        intro:
          "Des livres sur les entreprises, le freelancing et les revenus liés à l'IA. Utile aux opérateurs, moins aux chercheurs.",
      },
      es: {
        h1: "Mejores libros para ganar dinero con IA (2026)",
        topic: "Libros para ganar dinero con IA",
        intro:
          "Libros sobre negocios, freelancing e ingresos con IA. Útil para operadores, menos para investigadores.",
      },
      pt: {
        h1: "Melhores livros para ganhar dinheiro com IA (2026)",
        topic: "Livros para ganhar dinheiro com IA",
        intro:
          "Livros sobre negócios, freelancing e renda com IA. Útil para operadores, menos para pesquisadores.",
      },
    },
  },
  {
    slug: "best-ai-technical-books",
    kind: "category",
    category: "ai-technical",
    copy: {
      en: {
        h1: "Best AI Technical Books (2026)",
        topic: "AI Technical Books",
        intro:
          "Engineering books for building, evaluating and deploying AI systems, from ML fundamentals to LLM applications.",
      },
      zh: {
        h1: "2026 最佳 AI 技术书籍",
        topic: "AI 技术书籍",
        intro: "关于构建、评估与部署 AI 系统的工程书，从 ML 基础到 LLM 应用。",
      },
      fr: {
        h1: "Meilleurs livres techniques sur l'IA (2026)",
        topic: "Livres techniques sur l'IA",
        intro:
          "Des livres d'ingénierie pour construire, évaluer et déployer des systèmes IA, des fondamentaux du ML aux applications LLM.",
      },
      es: {
        h1: "Mejores libros técnicos de IA (2026)",
        topic: "Libros técnicos de IA",
        intro:
          "Libros de ingeniería para construir, evaluar y desplegar sistemas de IA, desde fundamentos de ML hasta aplicaciones LLM.",
      },
      pt: {
        h1: "Melhores livros técnicos de IA (2026)",
        topic: "Livros técnicos de IA",
        intro:
          "Livros de engenharia para construir, avaliar e implantar sistemas de IA, dos fundamentos de ML a aplicações LLM.",
      },
    },
  },
  {
    slug: "best-ai-books-for-beginners",
    kind: "audience",
    asins: [
      "059371671X",
      "B0GX1HSFF5",
      "B0FBNH2D35",
      "B0GGJ6BS6Q",
      "B0GCNNT1GJ",
      "1394314450",
      "B0DMTGB4MT",
      "B0F59SQ3R8",
      "1967210020",
      "1394270747",
    ],
    copy: {
      en: {
        h1: "Best AI Books for Beginners (2026)",
        topic: "AI Books for Beginners",
        intro:
          "Start with one clear overview, then add a hands-on project. These books assume no ML background and avoid math-heavy detours.",
      },
      zh: {
        h1: "2026 最佳 AI 入门书籍",
        topic: "AI 入门书籍",
        intro: "先读一本清晰的概览，再加一个动手项目。这些书不要求 ML 基础，也尽量避开沉重的数学。",
      },
      fr: {
        h1: "Meilleurs livres IA pour débutants (2026)",
        topic: "Livres IA pour débutants",
        intro:
          "Commencez par une vue d'ensemble claire, puis ajoutez un projet pratique. Ces livres ne supposent aucun bagage en ML et évitent les détours mathématiques.",
      },
      es: {
        h1: "Mejores libros de IA para principiantes (2026)",
        topic: "Libros de IA para principiantes",
        intro:
          "Empieza con una visión general clara y luego añade un proyecto práctico. Estos libros no suponen base de ML y evitan desvíos matemáticos.",
      },
      pt: {
        h1: "Melhores livros de IA para iniciantes (2026)",
        topic: "Livros de IA para iniciantes",
        intro:
          "Comece com uma visão geral clara e depois adicione um projeto prático. Estes livros não exigem base de ML e evitam desvios matemáticos.",
      },
    },
  },
  {
    slug: "best-ai-books-for-engineers",
    kind: "audience",
    asins: [
      "1098166302",
      "1098107969",
      "1098125975",
      "B0G1PPF5MC",
      "B0G2BCQQJY",
      "180602957X",
      "0135489687",
      "B0FN37DV9N",
      "B0GPJM7CYK",
      "B0H1VQLDTK",
      "1801819319",
    ],
    copy: {
      en: {
        h1: "Best AI Books for Engineers (2026)",
        topic: "AI Books for Engineers",
        intro:
          "For developers moving from APIs to production systems: evaluation, retrieval, agents, deployment and cost control.",
      },
      zh: {
        h1: "2026 最佳 AI 工程师书籍",
        topic: "AI 工程师书籍",
        intro: "写给从调用 API 走向生产系统的开发者：评估、检索、智能体、部署与成本控制。",
      },
      fr: {
        h1: "Meilleurs livres IA pour ingénieurs (2026)",
        topic: "Livres IA pour ingénieurs",
        intro:
          "Pour les développeurs qui passent des API aux systèmes en production : évaluation, retrieval, agents, déploiement et coûts.",
      },
      es: {
        h1: "Mejores libros de IA para ingenieros (2026)",
        topic: "Libros de IA para ingenieros",
        intro:
          "Para desarrolladores que pasan de las APIs a sistemas en producción: evaluación, retrieval, agentes, despliegue y costes.",
      },
      pt: {
        h1: "Melhores livros de IA para engenheiros (2026)",
        topic: "Livros de IA para engenheiros",
        intro:
          "Para desenvolvedores que passam de APIs a sistemas em produção: avaliação, retrieval, agentes, deploy e custos.",
      },
    },
  },
  {
    slug: "best-ai-books-for-managers",
    kind: "audience",
    asins: [
      "B0GZ8F4C8Z",
      "B0F2GVNFTJ",
      "B0HJ9CRH5S",
      "B0FR1HKP34",
      "B0GP2JDJTQ",
      "1507222912",
      "B0B4Y16B5R",
      "1394467230",
      "B0GX31SFJJ",
      "1098152700",
    ],
    copy: {
      en: {
        h1: "Best AI Books for Managers (2026)",
        topic: "AI Books for Managers",
        intro:
          "For team leads and executives who need to prioritize AI work, manage risk and explain trade-offs without writing code.",
      },
      zh: {
        h1: "2026 最佳 AI 管理者书籍",
        topic: "AI 管理者书籍",
        intro: "写给需要排优先级、管理风险、解释取舍但不写代码的团队负责人和高管。",
      },
      fr: {
        h1: "Meilleurs livres IA pour managers (2026)",
        topic: "Livres IA pour managers",
        intro:
          "Pour les responsables d'équipe et dirigeants qui doivent prioriser les projets IA, gérer le risque et expliquer les compromis sans coder.",
      },
      es: {
        h1: "Mejores libros de IA para managers (2026)",
        topic: "Libros de IA para managers",
        intro:
          "Para líderes de equipo y directivos que deben priorizar el trabajo de IA, gestionar riesgos y explicar trade-offs sin escribir código.",
      },
      pt: {
        h1: "Melhores livros de IA para gestores (2026)",
        topic: "Livros de IA para gestores",
        intro:
          "Para líderes de time e executivos que precisam priorizar o trabalho de IA, gerenciar risco e explicar trade-offs sem escrever código.",
      },
    },
  },
  {
    slug: "best-ai-books-for-designers",
    kind: "audience",
    asins: [
      "1394345925",
      "1484280873",
      "B0H6QW2F1Y",
      "B0D91XBNHT",
      "B0DNBDDTC8",
      "B0GKPYCFHP",
      "1616899158",
      "B0FN37DV9N",
      "1098152700",
    ],
    copy: {
      en: {
        h1: "Best AI Books for Designers (2026)",
        topic: "AI Books for Designers",
        intro:
          "For UX and product designers shaping AI features: interaction patterns, trust, feedback and research methods.",
      },
      zh: {
        h1: "2026 最佳 AI 设计师书籍",
        topic: "AI 设计师书籍",
        intro: "写给塑造 AI 功能的 UX 与产品设计师：交互模式、信任、反馈与研究方法。",
      },
      fr: {
        h1: "Meilleurs livres IA pour designers (2026)",
        topic: "Livres IA pour designers",
        intro:
          "Pour les designers UX et produit qui façonnent des fonctionnalités IA : patterns d'interaction, confiance, feedback et méthodes de recherche.",
      },
      es: {
        h1: "Mejores libros de IA para diseñadores (2026)",
        topic: "Libros de IA para diseñadores",
        intro:
          "Para diseñadores UX y de producto que dan forma a funciones de IA: patrones de interacción, confianza, feedback y métodos de investigación.",
      },
      pt: {
        h1: "Melhores livros de IA para designers (2026)",
        topic: "Livros de IA para designers",
        intro:
          "Para designers UX e de produto que moldam recursos de IA: padrões de interação, confiança, feedback e métodos de pesquisa.",
      },
    },
  },
  {
    slug: "best-ai-books-for-writers",
    kind: "audience",
    asins: [
      "1541605527",
      "B0BRMLVT1H",
      "B0C3VZBN63",
      "B0CRQ8FDKT",
      "1394244665",
      "B0DL4L79PQ",
      "162385038X",
      "B0BTTN24DN",
      "B0C7L31ZBC",
      "B0G21QHSMZ",
    ],
    copy: {
      en: {
        h1: "Best AI Books for Writers (2026)",
        topic: "AI Books for Writers",
        intro:
          "For authors and content teams using AI without flattening their voice, judgment or editorial standards.",
      },
      zh: {
        h1: "2026 最佳 AI 写作者书籍",
        topic: "AI 写作者书籍",
        intro: "写给使用 AI 但不希望丢掉声音、判断与编辑标准的作者和内容团队。",
      },
      fr: {
        h1: "Meilleurs livres IA pour auteurs (2026)",
        topic: "Livres IA pour auteurs",
        intro:
          "Pour les auteurs et équipes éditoriales qui utilisent l'IA sans aplatir leur voix, leur jugement ou leurs standards.",
      },
      es: {
        h1: "Mejores libros de IA para escritores (2026)",
        topic: "Libros de IA para escritores",
        intro:
          "Para autores y equipos de contenido que usan IA sin aplanar su voz, criterio o estándares editoriales.",
      },
      pt: {
        h1: "Melhores livros de IA para escritores (2026)",
        topic: "Livros de IA para escritores",
        intro:
          "Para autores e equipes de conteúdo que usam IA sem achatar sua voz, julgamento ou padrões editoriais.",
      },
    },
  },
];

export function getAiBookPage(slug: string): AiBookPageConfig | undefined {
  return AI_BOOK_PAGES.find((page) => page.slug === slug);
}

export function listAiBookPages(kind?: AiBookPageKind): AiBookPageConfig[] {
  return kind ? AI_BOOK_PAGES.filter((page) => page.kind === kind) : AI_BOOK_PAGES;
}
