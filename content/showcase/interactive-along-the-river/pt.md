---
summary: "Uma experiência web interativa de rolagem horizontal 2D que traz de volta à vida o cenário urbano da dinastia Song de «Ao Longo do Rio Durante o Festival Qingming»."
tags: [Canvas-2d, Assistido por IA, Arte interativa, Patrimônio cultural]
facts:
  - key: author
    value: Xian | 弦 (@Xian0063)
  - key: platforms
    value: Web (navegador)
  - key: tech stack
    value: Canvas 2D · HTML · CSS · JavaScript
  - key: models
    value: Codex
  - key: characters
    value: 141
    highlight: true
  - key: world width
    value: 6.516 unidades em 3 distritos
  - key: tests
    value: 48 testes automatizados
  - key: backend
    value: Nenhum (100 % no cliente)
---

## O que é

Interactive Along the River During the Qingming Festival é uma experiência web horizontal totalmente do lado do cliente, desenvolvida por Xian | 弦. Em vez de fatiar ou deslocar a pintura histórica estática, o projeto reconstrói todo um cenário urbano percorrível da dinastia Song usando recursos gerados por IA, renderização dinâmica em camadas e Canvas 2D nativo do navegador. O usuário conduz um avatar central por três distritos urbanos movimentados, encontrando cidadãos autônomos, eventos narrativos acionados, mudanças de clima e manobras de barcos pelo rio.

## Proposta de valor

O projeto converte um pergaminho panorâmico passivo, visto de cima, em um mundo vivo e interativo ao nível do chão:

- **Mundo 2D em várias camadas e percorrível**: renderiza 141 personagens dinâmicos na margem, interiores de lojas em camadas, pontes e cursos d'água ao longo de 6.516 unidades de mundo, sem depender de motores 3D pesados.
- **Física ambiental contextual**: o posicionamento dos pés é calculado com base na altura das pontes e nos contornos transparentes dos sprites, evitando que os personagens flutuem ou atravessem o chão ao se mover.
- **Sequenciamento de eventos narrativos**: as trocas entre NPCs — como entregar chá, passar tecido ou pechinchar no mercado — compartilham a renderização de um único item para evitar bugs visuais de objetos duplicados.
- **Manobra interativa de barcos («Passar a Ponte Arco-Íris»)**: o usuário arrasta cabos de reboque com retorno de tensão variável para ajudar as barcaças a cruzar o arco da ponte, desbloqueando esboços de ilustração colecionáveis.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Visualizadores estáticos de museu digital com zoom/deslocamento | Alta | Substitui visualizadores passivos de zoom e deslocamento por uma imersão histórica interativa e jogável para exposições culturais. |
| Recriações 3D pesadas com WebGL / Three.js | Moderada | Substitui fluxos complexos de modelagem 3D quando a fidelidade visual depende de traços de tinta 2D autênticos e de renderização leve em camadas. |
| Jogos educativos históricos narrativos | Baixa | Não substitui totalmente jogos narrativos completos pela ausência de persistência em backend, inventário ou diálogos ramificados. |

## Realidades e limitações atuais

- **Estado puramente no cliente**: construído sem serviço de backend, o que significa que o progresso do usuário, as ilustrações conquistadas e os estados de interação personalizados não sincronizam entre dispositivos ou sessões.
- **Quedas de desempenho antes da otimização**: a alta densidade de personagens sem descarte em tela fazia a taxa de quadros despencar para 25 FPS antes da introdução do descarte por viewport e da limitação da frequência de atualização.
- **Casos-limite ocasionais de ordenação de sprites**: a rígida ordenação de camadas 2D exigiu correções manuais pontuais para evitar que personagens entrassem nos móveis ou se soltassem das grades da ponte.
- **Sem profundidade 3D completa**: como a câmera usa projeção ortográfica 2D, o usuário não pode virar para becos laterais nem explorar a profundidade atrás das fachadas voltadas para a rua.

## Veredito

> **Recomendação principal**
> Um referencial inspirador para a preservação do patrimônio digital e o vibe coding. Prova que combinar síntese visual com IA e renderização em camadas com Canvas 2D pode transformar arte clássica em ambientes interativos e responsivos sem o peso de motores 3D pesados.

## Ciclo de vida e iteração

O autor partiu de metas de experiência funcional, e não de uma bíblia de arte finalizada, e instruiu o Codex com regras centrais: formato de rolagem horizontal, cenários urbanos navegáveis, comportamentos independentes de NPCs e temas da era Song. Depois que o Codex gerou um modelo de arte-base coeso, com aguadas de tinta sóbrias e tons terrosos de baixa saturação, o restante do ambiente se expandiu por três zonas contínuas.

| Etapa | Modelo / ferramenta usada | Foco e resultado |
| --- | --- | --- |
| Definição de regras visuais e base conceitual | IA generativa e Codex | Estabeleceu a mudança de perspectiva de vista aérea para fachadas ortogonais; produziu os blocos arquitetônicos de base. |
| Motor central e arquitetura de camadas | Codex (Canvas 2D / JS) | Separou o mundo em 7 planos de renderização distintos (fundo, interiores de loja, objetos em primeiro plano, transeuntes, água, clima, UI). |
| Ajuste de colisão e locomoção | Codex | Adicionou detecção de altura da ponte para os dois pés e cálculo de posicionamento do pé com máscara alfa. |
| Refatoração de desempenho e testes | Codex | Implementou descarte de frustum por viewport, pré-escalonamento de sprites e criou 48 suítes de testes automatizados para a lógica de pontes e clima. |

## Métricas e monetização

- **Alcance de usuários**: ultrapassou 3.400 visualizações e dezenas de reposts/salvamentos poucas horas após a publicação no X.
- **Monetização**: experimento web gratuito, sem monetização, paywalls ou dependências de backend.
- **Escala**: abrange 3 grandes distritos urbanos (6.516 unidades de coordenada), com 141 NPCs individuais e 7 encontros comerciais e cotidianos roteirizados.
- **Desempenho de renderização**: otimizado de um gargalo inicial de 25 FPS para cerca de 55 FPS fluidos em navegadores padrão.

## Repercussão da comunidade e debates-chave

As primeiras reações nas redes sociais elogiaram a mudança dos arquivos estáticos de museus digitais para uma gamificação viva e explorável. A discussão entre desenvolvedores web girou em torno da escolha do Canvas 2D em vez do Three.js, com muitos elogiando a arquitetura leve e o rápido carregamento no celular. Outros notaram o equilíbrio inteligente na consistência dos recursos assistidos por IA, observando que a arte gerada mantinha a sobriedade atmosférica das pinturas da dinastia Song do Norte sem parecer uma colagem genérica de IA.
