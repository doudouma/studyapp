---
summary: "Uma demo de ação fantástica 3D em terceira pessoa, feita com vibe coding em dois dias usando o modelo muranyi-3 da Tesana e 39 prompts."
tags: [Vibe Coding, Desenvolvimento de jogos, Protótipo com IA, RPG]
facts:
  - key: models
    value: muranyi-3
  - key: token cost
    value: $90
    highlight: true
  - key: prompts
    value: 39
  - key: development time
    value: 2 dias
  - key: engine
    value: Tesana (wrapper baseado em Godot)
  - key: genre
    value: Fantasia 3D em terceira pessoa / MOBA
---

## O que é

Tesana Muranyi-3 RPG Prototype é um projeto experimental de fantasia 3D em terceira pessoa gerado por prompting iterativo em linguagem natural. Construído com o modelo [muranyi-3](https://tesana.ai/en/blog/introducing-muranyi-3) na plataforma Tesana, a build mostra um mago encapuzado percorrendo um ambiente montanhoso aberto, com controles básicos de movimento, barras de habilidades na interface e efeitos provisórios de lançamento de feitiços.

## Proposta de valor central

O projeto demonstra a capacidade de ir rapidamente do conceito ao render para cenas 3D interativas, sem scripting manual nem edição direta da árvore de cena:

- **Controlador de personagem guiado por prompt**: estabelece o rastreamento desacoplado de câmera em terceira pessoa e o movimento omnidirecional a partir de descrições simples em inglês.
- **Geração de cena em linguagem natural**: converte conceitos de ambiente de alto nível em terrenos texturizados e cenários com pontos de referência.
- **Configuração de interface dentro do modelo**: gera barras de ação e ícones básicos de feitiço diretamente por instruções de prompt.
- **Geração integrada de efeitos visuais**: produz feixes mágicos direcionais, impactos de gelo e trajetórias de projéteis compatíveis com os estados de conjuração do personagem.

## O que pode substituir

| Software-alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Templates iniciais da Unreal Engine 5 | parcial | Serve para mockups visuais instantâneos, mas carece da física, da rede e do ferramental de produção robustos da UE5. |
| Assets de terceira pessoa da Unity | parcial | Substitui montagens rápidas de controlador em whitebox, embora a manutenibilidade do código siga não verificada. |
| Game Jams tradicionais (48 h) | moderada | Viável para montar protótipos estéticos não jogáveis, mas fica aquém em profundidade de mecânicas. |

## Realidades atuais e limitações

- **Sem loop de jogo jogável**: a demo consiste apenas em mobilidade do personagem e animações acionáveis; mecânicas centrais de combate, IA de inimigos, inventário e progressão estão ausentes.
- **Relação custo-produto alta**: chegar a uma cena interativa básica consumiu US$ 90 em 39 iterações, muito mais caro do que usar pacotes gratuitos de assets iniciais.
- **Arquitetura de engine opaca**: comentaristas notaram que o sistema parece funcionar como um fino wrapper generativo sobre o Godot, levantando preocupações sobre portabilidade do projeto e manutenibilidade do código a longo prazo.
- **Gargalos de escalabilidade e correção de bugs**: a falta de acesso estrutural detalhado torna impraticável depurar mecânicas complexas como dessincronização, registro de acertos e gestão de estado quando o projeto cresce.

## Veredito

> **Recomendação principal**
>
> Útil somente como prova de conceito visual para testar modelos generativos de texto para mundo, mas inadequado para engenharia de jogos voltada à produção.

## Ciclo de desenvolvimento e iteração

O projeto foi construído em um período de 2 dias com uma estrutura sequencial de prompts:

| Etapa | Modelo usado | Resultado |
| --- | --- | --- |
| Planejamento e base | muranyi-3 | Estabeleceu a geometria do mundo, o terreno aberto montanhoso e os pontos de referência distantes em 3–4 prompts de planejamento. |
| Personagem e câmera | muranyi-3 | Configurou o modelo do mago em terceira pessoa, a câmera orbital desacoplada e a locomoção direcional. |
| Barra de ação e UI | muranyi-3 | Adicionou uma barra de habilidades estilo MOBA com 4 slots e estados de conjuração com uma e duas mãos. |
| VFX de feitiços e impactos | muranyi-3 | Sobrepondo feixes arcanos, projéteis de fogo e efeitos de partículas de impacto de gelo. |

## Métricas e monetização

- **Gasto em tokens**: US$ 90 em 39 prompts.
- **Tempo de produção**: 2 dias de iteração.
- **Monetização**: nenhuma; a build é um protótipo interno não lançado, sem demo pública nem repositório de código no momento.

## Reação da comunidade e principais debates

A comunidade do r/vibecoding reagiu com forte ceticismo quanto a valor, autenticidade e substância técnica:

- **Polêmica de custo**: usuários apontaram que gastar US$ 90 para montar movimento padrão de personagem e malhas de ambiente prontas sai pior do que gastar zero usando templates de engines consolidadas em Unity, Unreal ou Godot.
- **Acusações de astroturfing**: vários membros sinalizaram o post como promoção não declarada da [plataforma Tesana](https://tesana.ai/en/blog/introducing-muranyi-3), notando posts promocionais repetidos e respostas evasivas sobre a engine por baixo.
- **A divisão «protótipo vs. jogo»**: comentaristas enfatizaram que caminhar sobre um asset de terreno não constitui um jogo, ressaltando o enorme abismo entre montagem de assets generativos e sistemas funcionais como fidelidade de colisão, cálculos de dano e replicação em rede.
