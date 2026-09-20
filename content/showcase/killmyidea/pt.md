---
summary: "Uma ferramenta rápida de validação de ideias de startup que avalia pitches segundo 10 critérios em paralelo usando o modelo determinístico Jev, da TypeSafe."
tags: [Validação de ideias, Classificação, Código aberto, IA em paralelo, Prova de conceito]
facts:
  - key: models
    value: TypeSafe Jev
  - key: author
    value: stemonte
  - key: platforms
    value: Web
  - key: price
    value: Grátis (código aberto)
  - key: latency
    value: ~539 ms
    highlight: true
  - key: output
    value: Pontuação quantitativa de 0–100 (não generativa)
---

## O que é

KillMyIdea é uma prova de conceito de código aberto criada para testar ao limite o modelo não generativo Jev, da TypeSafe. Em vez de depender de um LLM conversacional tradicional que produz raciocínio em linguagem natural, ele recebe um pitch de ideia e executa em paralelo cerca de 10 perguntas de avaliação específicas. Em uma fração de segundo, o sistema devolve uma pontuação numérica composta de 0 a 100, além de classificações de diagnóstico detalhadas (como «SHIP IT» ou «FIX IT»).

## Proposta de valor

- **Zero conversa generativa**: elimina o excesso de texto conversacional e a deriva de prompts ao usar um modelo determinístico que emite apenas probabilidades quantitativas, e não texto.
- **Avaliação paralela em menos de um segundo**: executa todas as consultas de avaliação de forma concorrente e entrega feedback abrangente em vários eixos em cerca de 500 milissegundos, em vez de 30 a 60 segundos.
- **Rubricas multifatoriais com pesos**: pontua eixos independentes como Demanda, Clareza do cliente e Capacidade de construção em escalas fixas de 0–4, aplicando pesos maiores a fatores críticos como necessidade de mercado e problemas reais.
- **Calibração conforme o objetivo**: aceita objetivos do projeto (como Código aberto ou Só por diversão) para não penalizar ideias que evitam a monetização de propósito.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Prompts de validação com LLM padrão (ChatGPT / Claude) | Parcial | Substitui respostas generativas lentas de 30–60 segundos por classificação determinística instantânea, mas sem explicações qualitativas. |
| Planilhas manuais de pontuação de ideias | Alta | Substitui a pontuação manual de rubricas para checagens rápidas durante hackathons ou sessões iniciais de brainstorming. |
| Revisão de pitch por um mentor humano | Baixa | Não substitui pesquisa de mercado aprofundada, expertise regulatória do setor nem nuances contextuais. |

## Realidades e limitações atuais

- **Avalia o pitch, não o mercado**: o modelo subjacente avalia a redação descritiva do pitch contra rubricas linguísticas calibradas; ele não consulta dados de mercado ao vivo nem verifica a realidade externa.
- **Cego a regulações do setor**: barreiras específicas como conformidade regional, licenciamento ou obstáculos legais complexos não são consideradas automaticamente, a menos que sejam detalhadas explicitamente no prompt.
- **Falta de narrativa qualitativa**: como o modelo devolve apenas números e níveis discretos, o usuário não recebe explicações escritas sobre por que determinada métrica obteve pontuação baixa.
- **Ponderação heurística**: a pontuação composta vem de uma média ponderada definida pelo autor, não de um benchmark consolidado de capital de risco.

## Veredito

> **Recomendação principal**
> Use o KillMyIdea como uma verificação de sanidade ultrarrápida e objetiva para detectar redação frágil ou público-alvo mal definido antes de redigir propostas completas.

KillMyIdea prova que modelos de avaliação não generativos como o Jev podem reduzir drasticamente a latência e eliminar a variância não determinística em fluxos automatizados. Ainda que não deva ser tratado como um veredito autoritativo de mercado, ele serve como filtro eficaz de primeira triagem para desenvolvedores, fundadores e pipelines de agentes.

## Ciclo de vida e iteração

O projeto foi implementado como uma aplicação web de código aberto ([código-fonte do killmyidea](https://github.com/monteduro/killmyidea?utm_source=gemini)) para experimentar o acesso direto ao modelo Jev, da TypeSafe. As iterações a partir do feedback da comunidade incluíram um fluxo «Refine Idea» e parâmetros opcionais de objetivo para ajustar a lógica de pontuação em projetos não comerciais.

| Etapa | Modelo usado |
| --- | --- |
| Formulação da rubrica e design das perguntas | LLM geral (GPT) com refinamento do autor |
| Classificação paralela em tempo real | TypeSafe Jev |
| Agregação final da pontuação e definição de limiares | Ponderação algorítmica cliente/servidor (TypeScript) |

## Métricas e monetização

- **Preço**: totalmente gratuito.
- **Licença**: código aberto em um repositório público acessível.
- **Desempenho**: capaz de avaliar 10 rubricas distintas simultaneamente em cerca de 539 milissegundos.
- **Monetização**: nenhuma direta; criado como demonstração técnica e POC para feedback de desenvolvedores.

## Repercussão da comunidade e debates-chave

- **Previsibilidade determinística**: desenvolvedores elogiaram a velocidade paralela e a natureza não generativa do Jev, apontando seu potencial como barreira determinística para arquiteturas agênticas.
- **Ceticismo quanto à pontuação**: comentaristas questionaram no início se as pontuações diferiam de forma relevante de números pseudoaleatórios, o que levou o autor a esclarecer a mecânica da rubrica calibrada de 0–4.
- **Preocupação com coleta de dados**: alguns usuários hesitaram em enviar ideias de startup proprietárias, o que levou o autor a destacar um botão explícito de recusa que impede o armazenamento do pitch.
