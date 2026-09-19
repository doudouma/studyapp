---
summary: "Um protótipo de jogo de pesca 3D low-poly criado inteiramente com Claude Code, Godot e orquestração de Blender MCP."
tags: [Desenvolvimento de jogos, Claude Code, Motor Godot, Blender MCP, Low poly]
facts:
  - key: author
    value: u/RUSuper
  - key: platforms
    value: Windows · macOS
  - key: engine
    value: Godot 4.7.1
  - key: models
    value: Claude (Ultracode) · ChatGPT (OpenAI Playground) · Codex
  - key: token cost
    value: $200/mês plano Claude Max + $20/mês ChatGPT
    highlight: true
  - key: pipeline
    value: Blender MCP · Godot MCP · Orquestração multi-sessão
---

## O que é

AI Fishing Game é um experimento solo de desenvolvimento do desenvolvedor u/RUSuper, com o objetivo de construir um jogo completo de pesca e navegação low-poly no Godot inteiramente com auxílio de IA. Desenvolvido ao longo de várias semanas com Claude (principalmente no plano Max com Ultracode) e ChatGPT, o projeto demonstra um pipeline multiagente de ponta a ponta que abrange arte de referência 2D, modelagem 3D low-poly automatizada no Blender via Model Context Protocol (MCP) e shaders de água GLSL personalizados integrados ao Godot 4.7.1.

## Proposta de valor

O fluxo prova que um único criador atuando apenas como diretor de arte pode produzir um ambiente de jogo 3D coerente ao orquestrar sessões de IA modulares:

* **Modelagem 3D procedural por script**: substitui ferramentas de geração de malhas brutas por uma sessão dedicada do Claude conectada ao Blender via MCP, mantendo os modelos editáveis, low-poly e estilisticamente uniformes.
* **Rastreamento rigoroso de decisões**: impõe um registro de decisões que marca cada escolha como ditada pelo usuário ou sugerida pela IA, eliminando alucinações em que ideias sintéticas viram requisitos fantasma.
* **Avaliação visual às cegas**: avalia as reformulações visuais usando câmeras dentro do jogo, pontuadas segundo critérios preestabelecidos (limite 8/10) e comparações às cegas, para eliminar o viés da novidade.
* **Federação de agentes multi-sessão**: usa uma sessão mestre que distribui tarefas discretas a subsessões especializadas (modelagem, integração, shaders, UI) e gerencia as passagens entre elas.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Modelagem 3D low-poly manual | Moderada | O Claude via Blender MCP scripta bem props, docas e barcos simples; personagens com rigging complexo ainda exigem ferramentas dedicadas. |
| Autoria tradicional de shaders | Alta | O Claude cria de forma confiável shaders de água complexos, dinâmica de ondas e transições de cor diurnas diretamente no Godot. |
| Plataformas de malhas 3D generativas (ex.: Rodin) | Alta | Assets low-poly por script produzem topologia mais limpa e arquivos menores do que as saídas generativas diretas. |
| Fluxos humanos de mock-up de UI | Moderada | Esboça rapidamente inventários temáticos e guias de campo náuticos, embora o polimento espacial manual continue essencial. |

## Realidades e limitações atuais

* **Consumo pesado de tokens e limites de taxa**: iterações profundas atingem o teto do plano de $200/mês do Claude em dias, exigindo pontes de fallback para modelos secundários como o Codex.
* **Absurdos ambientais e clipping**: sem supervisão manual constante, os layouts generativos produzem geometria ilógica, como docas muradas inacessíveis, casas encravadas em penhascos e NPCs levitando.
* **Throttling térmico do motor**: passes complexos de shader e simulações do editor levam hardware móvel sem otimização (como MacBooks) a altas temperaturas e quedas de FPS.
* **Falta de profundidade de gameplay**: embora a navegação ambiente e os shaders de água procedurais pareçam polidos de longe, as mecânicas de missão e a progressão continuam sendo placeholders esqueléticos.

## Veredito

> **Recomendação principal**
> Este projeto é um estudo de caso de referência para orquestração multiagente em jogos. Ele prova que combinar ferramentas MCP por script com uma direção de arte rígida com o humano no loop supera a geração cega de ponta a ponta, oferecendo um blueprint viável para desenvolvedores indie solo dispostos a trocar código manual por moderação rigorosa do sistema.

## Ciclo de desenvolvimento e iteração

O fluxo evoluiu da digitação básica de prompts para um pipeline modular multi-sessão governado por uma sessão diretora geral.

| Etapa | Modelo / Ferramenta | Foco |
| --- | --- | --- |
| Referência 2D e mock-up de UI | ChatGPT / Playground | Geração de arte conceitual para estruturas portuárias, guias de peixes e telas de reforma |
| Geração de geometria 3D | Claude (Ultracode) + Blender MCP | Criação por script de barcos, prédios e props low-poly |
| Integração e shaders | Claude Code + Godot MCP | Renderização de água, ciclos dia/noite, ajuste de escala e posicionamento do litoral |
| Polimento e código de transbordo | OpenAI Codex | Correção de bugs e limpeza de scripts durante os resfriamentos semanais de limite do Claude |

## Métricas e monetização

* **Custo de tokens e assinaturas**: $200/mês no plano Claude Max, complementado por uma assinatura de $20/mês do ChatGPT para arte conceitual e fallback com Codex.
* **Distribuição atual**: projeto pessoal não comercial, ainda em fase de protótipo; demo pública planejada assim que o loop de missão inicial for finalizado.
* **Engajamento da comunidade**: mais de 2.700 upvotes e 240+ comentários na comunidade r/ClaudeAI.

## Recepção da comunidade e debates principais

A thread despertou grande interesse entre desenvolvedores indie e evidenciou tensões recorrentes do desenvolvimento de jogos com IA:

* **Elogio estético vs. colapso lógico**: os comentaristas elogiaram muito a apresentação atmosférica, no estilo *Dredge*, mas designers experientes logo apontaram inconsistências que quebram a imersão, como escadas bloqueadas e construções amontoadas.
* **A validação do "registro de decisões"**: colegas desenvolvedores elogiaram amplamente registrar se uma ideia veio do usuário ou do modelo como higiene essencial contra o avanço descontrolado de prompts de IA.
* **Criação como recreação**: membros da comunidade debateram se o desenvolvimento solo de jogos com IA é comercialmente viável ou principalmente um novo hobby criativo e envolvente, comparável a montar sets de Lego.
