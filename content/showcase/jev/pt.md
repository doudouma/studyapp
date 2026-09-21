---
summary: "O modelo não generativo System One da TypeSafe AI, Jev, devolve decisões tipadas e calibradas em 70–500 ms em vez de texto; agora aberto a todos, com 5 USD de crédito."
tags: [Modelos de decisão, IA não generativa, Saída estruturada, Roteamento de modelos, TypeSafe]
facts:
  - key: maker
    value: TypeSafe AI
  - key: founder
    value: Diogo Almeida (ex-OpenAI)
  - key: latency
    value: 70–500 ms
    highlight: true
  - key: price
    value: 0,042 USD / 1M tokens de entrada (saída grátis)
  - key: free credit
    value: 5 USD ≈ 120M tokens
  - key: funding
    value: Rodada seed de 40M USD (DCVC)
---

## O que é

Jev é um modelo não generativo da TypeSafe AI que se recusa a escrever prosa. Não é um LLM conversacional: você fornece um estado de programa e uma ou mais perguntas predefinidas, e ele devolve uma resposta tipada — uma opção de uma lista, uma pontuação ou uma probabilidade entre 0 e 1 — junto com uma avaliação de confiança. A TypeSafe chama essas saídas de «decisões calibradas».

A empresa foi cofundada por Diogo Almeida, ex-pesquisador da OpenAI que trabalhou no ChatGPT e ajudou a desenvolver o aprendizado por reforço com feedback humano (RLHF). Depois de dois anos em modo sigiloso, a TypeSafe estreou em 15 de setembro com uma rodada seed de 40 milhões de dólares liderada pela DCVC e o Jev como primeiro modelo. Após uma lista de espera, o Jev agora está aberto a todos, com 5 USD de crédito (cerca de 120 milhões de tokens) para cada conta registrada.

## Proposta de valor

O Jev troca a geração livre por decisões fortemente tipadas e paralelas:

- **Saídas tipadas, não texto**: cada resposta é uma Choice (até 255 opções), um Score numa escala definida ou um Noul (uma afirmação booleana expressa como probabilidade), com distribuições de probabilidade completas e pontuações de confiança. Sem prompts JSON e sem parser de saída.
- **Avaliação paralela**: todas as perguntas de uma mesma requisição compartilham a mesma entrada, mas são avaliadas de forma independente e concorrente.
- **Velocidade e custo**: a TypeSafe reporta latência ponta a ponta de 70–500 ms — de 20 a 200 vezes mais rápido que LLMs comparáveis — a 42 USD por bilhão de tokens de entrada (0,042 USD por milhão), com a saída sem custo.
- **Sem alucinação tradicional**: como o espaço de respostas é definido de antemão, o modelo não pode inventar detalhes fora das opções predefinidas, embora ainda possa escolher a opção errada.
- **Camada de decisão em tempo real**: num benchmark público de Ably Pong, o Jev tomou 47 decisões de jogo em 12 segundos, enquanto Gemini, Claude e GPT conseguiram apenas de duas a três no mesmo intervalo.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Prompts de classificação e roteamento com LLM | Alta | Substitui prompts com esquema JSON por saída tipada com uma fração da latência e do custo; a Vercel relatou ganho de 5–18x sobre o classificador de segurança ChatGPT Luna 5.6, com maior precisão. |
| Classificadores dedicados com fine-tuning | Moderada | Competitivo em muitas tarefas de roteamento e pontuação, mas as equipes perdem controle sobre a arquitetura e os dados de treino exatos. |
| Diálogo, resumo ou geração aberta | Baixa | O Jev não produz texto; a entrada de texto em fluxos de agentes ainda exige um pequeno modelo generativo por trás. |

## Realidades e limitações atuais

- **Só decide, não raciocina**: o Jev responde a perguntas predefinidas; não se explica nem lida com tarefas abertas.
- **Ainda é possível errar**: limitar o espaço de saída evita detalhes inventados, mas escolher a opção errada dentro do conjunto continua sendo um risco real.
- **O desenvolvedor assume a incerteza**: como observou o CTO da Earendil, Armin Ronacher, as equipes precisam decidir o que fazer com uma probabilidade de 50% versus 95%, o que transfere a gestão de alucinações para o código da aplicação.
- **Arquitetura não divulgada**: a TypeSafe não publicou a arquitetura exata do Jev, e especula-se que ele adapte um modelo-base de código aberto.
- **Pressão de capacidade**: a demanda após o lançamento público chegou a superar a capacidade e causou breves lentidões na API.

## Veredito

> **Recomendação principal**
> Trate o Jev como uma primitiva de decisão rápida e barata, não como um chatbot. Para roteamento, pontuação, moderação e seleção de ações de agentes, ele pode reduzir custo e latência em uma ordem de magnitude — desde que o desenvolvedor orquestre perguntas explícitas no código e defina limites claros para agir com base numa probabilidade.

Inferência mais barata muda a frequência com que vale a pena chamar um modelo. O nome Jev vem do paradoxo de Jevons — quando um recurso fica mais barato, seu consumo total cresce — e a aposta é que inferência quase gratuita leve inteligência a inúmeras microdecisões que antes não justificavam uma chamada a um LLM.

## Ciclo de vida e iteração

O Jev é implantado decompondo uma decisão de negócio em perguntas explícitas e orquestrando-as no código, em vez de esperar que um único prompt resolva tudo.

| Etapa | Modelo / ferramenta usada |
| --- | --- |
| Design do espaço de decisão (esquemas Choice / Score / Noul) | Conjuntos de perguntas e opções definidos pelo desenvolvedor |
| Inferência de decisão em tempo real | TypeSafe Jev |
| Orquestração, limites e alternativas | Código de aplicação (runners em TypeScript / Python) |
| Passos de texto livre (p. ex. digitar uma cidade) | Modelo generativo pequeno, chamado só quando necessário |

## Métricas e monetização

- **Financiamento e lançamento**: rodada seed de 40M USD liderada pela DCVC, estreia pública em 15 de setembro.
- **Preço**: 0,042 USD por milhão de tokens de entrada, saída grátis; contas novas recebem 5 USD de crédito, equivalentes a cerca de 120 milhões de tokens.
- **Resultados relatados**: a Vercel relatou ganho de 5–18x sobre o ChatGPT Luna 5.6 em classificação de segurança; a Bryo AI descobriu que o Jev era 10–20x mais barato que o Gemini para classificar e-mails corporativos, com precisão ligeiramente menor.
- **Primeiros usos**: uma equipe filtrou um feed de conteúdo de nicho avaliando oito critérios em três dias de posts em dois segundos por 0,007 USD; equipes de análise de marketing conectaram o Jev à Meta Ad Library para acompanhar o ciclo de vida de anúncios e pontuar roteiros criativos, com fluxo 30x mais rápido por menos de 3 USD.
- **Monetização**: preço por uso conforme tokens; a TypeSafe afirma que planeja modelos especializados para diferentes domínios.

## Repercussão da comunidade e debates-chave

O lançamento gerou bastante discussão nas comunidades de desenvolvimento e design de IA:

- **Roteamento de modelos como killer app**: Ronacher argumentou que prever se uma consulta precisa de um modelo de fronteira é valioso, mas era proibitivo com um LLM; o Jev torna o roteamento inteligente em tempo real economicamente viável.
- **Não generativo versus generativo**: desenvolvedores elogiaram o determinismo e a velocidade paralela, enquadrando o Jev como uma camada de proteção para arquiteturas agênticas, e não como substituto dos LLMs.
- **Quem gerencia a incerteza**: o trade-off mais citado é que restringir as saídas devolve os limites de probabilidade ao desenvolvedor.
- **Posicionamento e hype**: Almeida disse que não considera a TypeSafe um laboratório de fronteira — «os principais produtos dos laboratórios de fronteira são o medo ou o hype. Quero que o nosso principal produto seja inteligência».
