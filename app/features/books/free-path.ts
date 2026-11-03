// 学习路径资源清单（文案在 i18n 的 freeLib.path.* 中）。
// 所有链接均可免费访问；Coursera 课程为免费旁听。

export interface PathResource {
  name: string;
  by: string;
  tag: string;
  url: string;
}

export interface PathStage {
  id: "foundations" | "build" | "specialise" | "community" | "agents";
  resources: PathResource[];
}

export const LEARNING_PATH: PathStage[] = [
  {
    id: "foundations",
    resources: [
      {
        name: "Machine Learning Specialization",
        by: "Andrew Ng · Coursera",
        tag: "Audit free",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
      },
      {
        name: "Machine Learning Crash Course",
        by: "Google",
        tag: "Free",
        url: "https://developers.google.com/machine-learning/crash-course",
      },
      {
        name: "Neural Networks series",
        by: "3Blue1Brown",
        tag: "Video",
        url: "https://www.3blue1brown.com/",
      },
      {
        name: "Intro to Machine Learning",
        by: "Kaggle Learn",
        tag: "Free",
        url: "https://www.kaggle.com/learn",
      },
      {
        name: "Titanic + House Prices",
        by: "Kaggle competitions",
        tag: "Practice",
        url: "https://www.kaggle.com/competitions",
      },
    ],
  },
  {
    id: "build",
    resources: [
      {
        name: "Practical Deep Learning for Coders",
        by: "fast.ai",
        tag: "Free",
        url: "https://www.fast.ai/",
      },
      {
        name: "Dive into Deep Learning",
        by: "D2L.ai",
        tag: "Book",
        url: "https://d2l.ai/",
      },
      {
        name: "PyTorch tutorials",
        by: "PyTorch",
        tag: "Docs",
        url: "https://pytorch.org/tutorials/",
      },
      {
        name: "TensorFlow tutorials",
        by: "TensorFlow",
        tag: "Docs",
        url: "https://www.tensorflow.org/tutorials",
      },
      {
        name: "More competitions",
        by: "Kaggle",
        tag: "Practice",
        url: "https://www.kaggle.com/competitions",
      },
    ],
  },
  {
    id: "specialise",
    resources: [
      {
        name: "LLM / NLP course",
        by: "Hugging Face",
        tag: "NLP",
        url: "https://huggingface.co/learn/llm-course",
      },
      {
        name: "CS231n: Deep Learning for CV",
        by: "Stanford",
        tag: "CV",
        url: "https://cs231n.stanford.edu/",
      },
      {
        name: "Reinforcement Learning: An Introduction",
        by: "Sutton & Barto",
        tag: "RL · PDF",
        url: "https://incompleteideas.net/book/the-book-2nd.html",
      },
      {
        name: "Recent papers",
        by: "arXiv cs.LG",
        tag: "Papers",
        url: "https://arxiv.org/list/cs.LG/recent",
      },
      {
        name: "Papers with Code",
        by: "paperswithcode.com",
        tag: "Reproduce",
        url: "https://paperswithcode.com/",
      },
    ],
  },
  {
    id: "community",
    resources: [
      {
        name: "r/MachineLearning",
        by: "Reddit",
        tag: "Community",
        url: "https://www.reddit.com/r/MachineLearning/",
      },
      {
        name: "Hugging Face",
        by: "Models & datasets",
        tag: "Community",
        url: "https://huggingface.co/",
      },
      {
        name: "Kaggle",
        by: "Competitions & notebooks",
        tag: "Community",
        url: "https://www.kaggle.com/",
      },
      {
        name: "Neural Networks: Zero to Hero",
        by: "Andrej Karpathy",
        tag: "Video",
        url: "https://karpathy.ai/zero-to-hero.html",
      },
    ],
  },
  {
    id: "agents",
    resources: [
      {
        name: "LLMs from Scratch",
        by: "Sebastian Raschka",
        tag: "GitHub",
        url: "https://github.com/rasbt/LLMs-from-scratch",
      },
      {
        name: "LLM course",
        by: "Hugging Face",
        tag: "Free",
        url: "https://huggingface.co/learn/llm-course",
      },
      {
        name: "awesome-llm-apps",
        by: "Shubham Saboo",
        tag: "GitHub",
        url: "https://github.com/Shubhamsaboo/awesome-llm-apps",
      },
      {
        name: "Agent skills & subagents",
        by: "Anthropic Academy",
        tag: "Free",
        url: "https://academy.claude.com/",
      },
    ],
  },
];
