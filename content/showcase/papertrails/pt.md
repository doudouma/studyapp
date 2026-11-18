---
summary: Um prompt, críticos cegos e uma referência dourada: como Shikhar construiu um mundo de papel infinito em three.js.
tags: [Three.js, Papercraft, Fable 5.2, Opus 5.5, Críticos cegos, Jogo de navegador]
facts:
  - key: method
    value: Um subagente por peça · críticos A/B cegos
    highlight: true
  - key: models
    value: Fable 5.2 + Opus 5.5
  - key: stack
    value: three.js · Vite · MIT
  - key: source
    value: ~900 KB de JS · mais de 50 módulos
  - key: assets
    value: 19 MB de modelos, texturas e áudio
  - key: biomes
    value: 5 publicados · 15 explorados · dia e noite
  - key: target
    value: 60 fps num notebook intermediário
  - key: author
    value: Shikhar — fazendo coisas legais com IA
  - key: reception
    value: 51 mil visualizações · 1,4 mil curtidas · 85 respostas
---

## O brief antes do jogo

A coisa mais útil que Shikhar publicou não é o jogo. É o prompt. O nome final é Papertrails; quase todo o resto do documento sobreviveu. Ele está reproduzido inteiro abaixo, palavra por palavra a partir da imagem que ele publicou, porque o resto deste texto é sobre o que ele fez com isso.

## O prompt original

Reproduzido exatamente da imagem do prompt na thread:

> **Build "Pop-up Atlas", a browser 3D walking toy, in Three.js.**
>
> **Reference**
> none yet. First generate 4-6 concept frames with imagegen (tilt-shift papercraft diorama, tiny paper traveller, terrain folding up out of an open book, warm lantern light). Collect photos of real pop-up books and papercraft dioramas. These become the target. Match their look and tactile paper feel exactly.
>
> **Details**
> small paper traveller walks across an endless open pop-up book. Terrain ahead folds up out of the flat page: hinged paper tiles (hills, trees, houses, bridges, rivers) rise on springs, overshoot and settle with a slight wobble. Wave function collapse picks tiles so neighbours always connect. Tiles behind fold back flat. Look: matte cardstock, limited warm palette, visible paper edges and fibre, layered cut-paper silhouettes, soft shadows between layers, high-angle tilt-shift camera with strong DOF blur, warm key light + cool fill. Every fold gets a soft paper "flap" sound with varied pitch. Controls: WASD or click to walk, smooth camera follow. No physical-looking UI, no external brand assets.
>
> **Tools**
> Blender (tile models with hinge pivots, traveller, fold animations, baked paper materials → glTF). Codex CLI imagegen (concept frames, paper textures, printed details). Web Audio procedural paper sounds (or samples if better).
>
> **How to work**
> autonomous, no questions; log assumptions. Study reference → checklist of components with measurable targets. One sub-agent per component, each owns its files, project stays running. Loop on every component: separate harsh blind critic, A/B side by side vs reference in random order, says which is better + fixes. Continue until critics can't reliably pick the original and are wowed. Also judge fold motion/spring feel, walking feel, sound, performance (steady 60 fps mid-range laptop). Revert anything that makes it worse. Append-only log. User's explicit instructions override critics.
>
> **Deliver**
> playable Vite build + run instructions, 30-second gameplay capture, final side-by-sides and scores.

Não é «faça um jogo de papel». É uma lista de coisas que dá para verificar. Essa diferença é o projeto inteiro.

## O agente teve de fabricar a própria referência

Ele não começou pelo código. O agente gerou quadros conceituais com GPT Image e coletou fotografias reais de pop-up, depois mediu cores, bordas e iluminação. A referência virou um conjunto de números antes de virar estilo.

Aí veio a decisão que o agente não podia tomar: Shikhar escolheu uma imagem como referência de estilo concreta. O agente tirou capturas do jogo e gerou um alvo dourado para cada bioma; os animais foram desenhados do mesmo jeito. A partir daí, todo render tinha algo específico contra o que falhar.

## Um subagente por peça e um crítico que não sabe qual é qual

As regras de trabalho do prompt são a parte mais pessoal do projeto. Parecem um protocolo de revisão, não um desejo: o agente trabalha sozinho, não faz perguntas e registra suposições. Transforma a referência em checklist com metas mensuráveis, dá a cada componente um subagente e seus próprios arquivos, e mantém o projeto rodando. Cada build vai para um crítico cego e duro separado, A/B lado a lado contra a referência em ordem aleatória. O loop só para quando os críticos «não conseguem distinguir o original e ficam impressionados». Movimento da dobra, sensação de caminhar, som e 60 fps num notebook intermediário também são julgados; tudo que piora é revertido; o registro é só de acréscimos; as instruções explícitas dele mandam mais que os críticos.

O repositório guarda as fronteiras. Os arquivos começam com `OWNER: render agent`, `OWNER: fold agent`, `OWNER: wfc agent`; cada agente manteve sua configuração e suas notas de ajuste. Os críticos ficavam separados dos construtores e viam as duas versões em ordem aleatória, então não podiam premiar a que acabaram de fazer.

Isso já não é escrever prompt. Ele desenhou um processo de revisão e deixou rodar sem fazer perguntas.

## Alvo dourado, cinco quadros

Ele publicou o mesmo enquadramento em cada passagem: primeira build, passagem de arte, passagem de biomas, passagem dourada, agora, alvo dourado. A primeira build é clara e vazia. A de arte troca as árvores provisórias por recortes de papel impressos. A de biomas enche o chão de objetos. A dourada acrescenta a vila e a luz dos lampiões. O último quadro é o alvo, não o jogo; a distância entre «agora» e «alvo dourado» é para isso que o loop servia.

Depois, os números. A inclinação da câmera foi de 46° para 42° para igualar o três quartos mais baixo da referência. A distância de acompanhamento foi de 14,8 para 12,6 e depois 10,8, porque o enquadramento dourado era cerca de 1,5 vez mais fechado. A saturação caiu de 1,04 para 0,92; o raio de desfoque de 19 para 12,5; a densidade de animais subiu de 1 para 1,5 porque a imagem dourada tinha cerca de dez animais no quadro. Não são adjetivos de moodboard. São medidas com direção.

Ele também anulou o agente, e o código guarda o recibo. Um gato que teria adotado o viajante está desligado com `/* user 2026-11-17: no companion */`; um comportamento de seguir está zerado com `/* user 2026-11-17: animals never follow the traveller */`. Os críticos podiam comparar renders. Não podiam decidir se um gato deveria te seguir. Isso era chamada dele.

## O mapa que sobrou

Os guias de estilo exploraram quinze tipos de bioma. O mapa publica cinco: heartland na origem, deserto a leste, neve a oeste, florada ao sul e pinheiral ao norte, cada um com dia e noite. A origem é sempre a fazenda de outono quente, e os quatro vizinhos são fixos para que cada bioma fique a cerca de doze casas do início.

O mundo é gerado com wave function collapse, as peças sobem em molas e se dobram planas atrás do viajante, os animais pastam, ciscam, se dispersam e pousam, e Tab ou E abre um atlas que se desenha sozinho enquanto você explora. O mapa continua crescendo em todas as direções.

## O que existe de fato no repositório

Não é uma montagem de 54 segundos. O repositório público tem cerca de 900 KB de JavaScript em mais de cinquenta módulos, além de modelos GLB de peças e viajante e 19 MB de modelos, texturas e áudio. three.js é a única dependência de runtime. A licença é MIT. A versão jogável está no GitHub Pages, com parâmetros de URL para seed, qualidade, mudo, noite, vida e animais. O vídeo é uma captura dessa versão.

## A parte que é dele

Os modelos escreveram o código. O padrão é dele. «Continue até que os críticos não consigam distinguir o original e fiquem impressionados» não é truque de prompt; é um limite de gosto, e ele foi apertando com números. Os artefatos mais pessoais do repositório são os comentários que registram seus vetos e as notas «fixer» que moveram um valor de uma medida para outra.

Se for para levar uma coisa da build dele, leve a ordem: referência primeiro, critérios depois, código no fim, e um crítico que não sabe qual versão está olhando. O mundo de papel é o resultado. O loop é o método.
