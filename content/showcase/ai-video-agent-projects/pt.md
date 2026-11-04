---
summary: "Um mapa curado de 369 projetos open source de vídeo e edição automática criados para Claude Code, Codex e outros agentes de programação, filtrados por saída, prontidão para agentes e documentação."
tags: [Vídeo com IA, Código aberto, Claude Code, Codex, Skills para agentes, Remotion]
facts:
  - key: projects
    value: "369"
    highlight: true
  - key: author
    value: "@leo_xiaolei"
  - key: platform
    value: X / Feishu
  - key: language
    value: Chinês
  - key: focus
    value: Vídeo com IA e edição automática
  - key: data
    value: Instantâneo da API do GitHub 2026-10-27
---

## O que é

Um levantamento em chinês de 369 repositórios open source que permitem a agentes de programação como Claude Code e Codex gerar vídeo, editar footage automaticamente ou renderizar motion graphics a partir de código. O autor ignora deliberadamente o habitual «filtro de estrelas do GitHub», porque estrelas não medem valor real de produção: alguns repositórios com apenas um punhado de estrelas resolvem uma dor muito específica melhor do que outros com muitas mais.

A lista é um mapa, não um benchmark. Cada entrada aponta para um repositório, uma Skill, um plugin ou um servidor MCP, e o artigo os agrupa por fluxo de trabalho para você escolher um ponto de partida em vez de clonar 369 repos.

## Como a lista é filtrada

Três regras decidem o que entra:

1. **Precisa produzir vídeo ou movimento.** Cenas 3D puramente web são excluídas; a saída deve ser um filme, clipe ou conjunto de prompts renderizados por código que um agente possa reproduzir.
2. **Precisa ser feito para agentes.** Skills, plugins, servidores MCP ou toolkits explicitamente desenhados para Claude Code, Codex e agentes similares.
3. **Precisa ter um README completo.** Sem documentação, o valor prático não pode ser verificado.

Todas as contagens de estrelas e dados de repositórios são um instantâneo da API do GitHub de 2026-10-27, então trate-os como um sinal pontual, não como um ranking atual.

## Os quatro frameworks de destaque

| Projeto | Estrelas | O que faz |
| --- | --- | --- |
| lemo-opuscar | 8.322 | Um motor de estilos visuais com 59 estilos de vídeo renderizados por código ajustados para Claude Opus 5.5. A amostra «OPUSCAR 98» dura 6m31s e mostra 98 estilos sem chamar um modelo de geração de vídeo. |
| huashu-art-motion | 5.418 | Uma Skill de animação artística que combina 36 estilos artísticos, 9 gramáticas de narração e 8 clipes parametrizados. Forte para explicativos de marca sem apresentador. |
| huashu-motion | 1.766 | Automatiza filmes comerciais de lançamento de produto: lê as informações do produto, propõe três direções, escreve o filme e então compõe a música com notação ABC. Sua edição visual no navegador permite clicar em um quadro e descrever o ajuste. |
| sweety-handdraw-video | 903 | Um pipeline de explicativos desenhados à mão compatível com Codex: entra um tema ou artigo, saem roteiro, storyboard e ilustrações, e então a renderização local alinha no nível do quadro com síntese de voz VoxCPM 2. |

## Outros grupos que vale conhecer

- **Edição automática e human-in-the-loop:** browser-use/video-use corta footage a partir de transcrições palavra a palavra e cuida de legendas e cor com FFmpeg. OpenChatCut e BaoCut adicionam ajustes manuais de timeline após a passada automática.
- **Experimentos de fronteira com poucas estrelas:** fragua (11 estrelas) roda localmente com FFmpeg e sem API key para remover silêncio em vertical e gravar legendas. cutloupe (0 estrelas) expõe um MCP e uma timeline visual, e devolve quadros renderizados reais ao modelo por um comando `look`.
- **Prompts e cartões de plano de código para vídeo:** awesome-opus5-5-videos reúne 703 prompts do Opus 5.5. video-shotcraft inclui 152 receitas de plano estruturadas e 209 prévias de movimento para trabalhos comerciais com Remotion.
- **Engenharia reversa de movimento:** lovisdotio/motion2code reconstrói um vídeo de movimento existente como SVG inline e timelines GSAP, para comparar quadro a quadro com o original.
- **Explicativos, apresentadores e videoclipes:** Raven lê o histórico de Git de um repositório e gera um explicativo desenhado à mão de dois minutos; stickman-video-director mira canais de divulgação com bonecos sem rosto; lanshu-create-ai-presenter-video se mantém neutro em relação ao fornecedor para imagens de apresentador autorizadas; digital-human-koubo transforma uma imagem e texto em vídeo com sincronia labial via Renoise MCP e Grok Video; PDoomVideo publica uma base completa de código-fonte para videoclipes.

## Limitações atuais

- **É um levantamento, não um teste.** O autor leu repositórios e READMEs; não há um benchmark de qualidade de saída frente a frente.
- **As estrelas envelhecem por design.** O instantâneo é de um único dia, e projetos de agentes mudam rápido, às vezes semanalmente.
- **Chinês primeiro.** A análise e os comentários de seleção estão em chinês, embora a maioria dos repositórios linkados esteja em inglês.
- **Risco de links quebrados e manutenção.** Uma lista curada de 369 repos inevitavelmente incluirá projetos abandonados ou renomeados; verifique o README, a licença e o último commit antes de adotar um.
- **Viés de escopo.** A lista foca em vídeo e movimento para agentes de programação, então editores de vídeo gerais, trabalho 3D puramente web e ferramentas não orientadas a agentes ficam de fora de propósito.

## Veredito

> **Recomendação principal**
> Use como gerador de shortlist, não como ranking. Comece pelos quatro frameworks de destaque se precisar de um fluxo comprovado, depois explore a seção de poucas estrelas para cobrir uma lacuna específica do seu pipeline.

A parte mais útil é o próprio filtro: a saída precisa ser vídeo, a ferramenta precisa ser chamável por um agente e o README precisa estar completo. É uma heurística de seleção melhor que o número de estrelas para quem constrói um pipeline de vídeo com IA usando Claude Code ou Codex. Verifique o estado atual de cada repositório antes de se comprometer.

## Atribuição

Este caso linka uma reprodução no Feishu do WaytoAGI. A thread original foi publicada por 刘老板 (@leo_xiaolei) no X em 2026-10-27; os direitos continuam com o autor original e o link original é a fonte autoritativa.
