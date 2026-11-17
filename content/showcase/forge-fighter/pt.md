---
summary: Um caça em pixel art de 32 KB sem motor 3D nem polígonos: sprites empilhados, três câmeras e um botão Remix.
tags: [Sprite stacking, Pixel art, Fable 5.2, Forge, Jogo de navegador, Remixável]
facts:
  - key: code
    value: 32 KB
    highlight: true
  - key: rendering
    value: Sprite stacking · canvas 2D, sem polígonos
  - key: model
    value: Fable 5.2 (segundo @Gorden_Sun)
  - key: assets
    value: 32 arquivos · 3,18 MB de arte e áudio
  - key: cameras
    value: Superior · perseguição · cabine (Espaço)
  - key: weapons
    value: Canhão (clique direito) · mísseis (M) · caças inimigos
  - key: made with
    value: Forge da UI8 · público e remixável
  - key: reception
    value: 1,9 mi de visualizações · 26 mil curtidas · 553 respostas
  - key: author
    value: Dash — builder e designer na UI8
---

## Todo o pitch é uma frase

O lançamento de Dash é um link e uma linha: “No 3D engine, no polygons, 32 KB of code.” Sem thread, sem build log, sem benchmark. O link abre um caça em pixel art rasando uma cadeia de ilhas, e em um dia e meio o post passou de 1,9 milhão de visualizações e 26 mil curtidas. As 553 respostas parecem uma sala discutindo se o vídeo é real.

É real, e dá para jogar. A página do Forge roda a demo no navegador, ao lado de um painel com dez grupos de ajustes. A descrição do autor é curta: “Caça em pixel art construído com sprite stacking, sobre ilhas empilhadas. Espaço alterna as vistas superior, de perseguição e de cabine; clique para rolar, segure para acender os propulsores; voe da crista das ondas até alta altitude.”

## O que você pilota de verdade

O ponteiro comanda a direção. O clique rola o avião, segurar o botão acende os propulsores e Espaço salta entre superior, perseguição e cabine. O clique direito dispara o canhão, o M lança mísseis e os caças inimigos ficam no enquadramento para você travar. Se mergulhar no chão, o avião cai e a câmera acompanha o piloto ejetado em vez de escurecer para um menu.

Esse detalhe faz a demo parecer um jogo pequeno, não um teste de shader. O painel expõe o resto: colisão ligada ou desligada, tempos de recarga do canhão e dos mísseis, até cinco caças inimigos, câmera lenta ao desviar, companheiros de ala, semente do mundo, hora do dia, densidade de nuvens, cobertura de ilhas, sombra do avião, esteira e respingo rente ao mar, rastros nas pontas das asas, estilo da chama do motor, tremor das explosões, granulação de filme e cores do corpo, do detalhe e da cabine. A intro “stack-up” monta o avião fatia por fatia antes da primeira decolagem. Trinta arquivos de som cobrem motor, vento, canhão, mísseis, ejeção, respingo e rádio.

## Profundidade sem polígonos

O sprite stacking é velho e teimosamente eficaz. Em vez de uma malha, o avião é uma pilha de fatias planas de pixel art, cada uma um quadro de uma folha de quatro vistas. Gire a pilha e o objeto gira; mova a câmera e as fatias deslizam o suficiente para vender o volume. Não há polígono para transformar nem motor 3D para carregar. A cena principal é desenhada em um canvas 2D.

As ilhas e as nuvens também são pilhas, e é aí que a discussão começa. Pavian, o pesquisador coreano cujo post levou a demo a muito mais gente, falou daquela “sensação de Super Famicom do começo dos anos 90, construída ponto por ponto”, e disse que a IA elevou o ofício a um nível que “o trabalho manual era pesado demais para alguém tentar”. Outros olharam para as nuvens e desmontaram a frase pelo outro lado: pilha de fatias é voxel, diga o que disser o tweet.

## O que as pessoas disseram

As respostas são mais úteis que o número de curtidas.

- **@bdvd_25** (219 curtidas): “Precisa de controles móveis, não consigo mudar a vista!” A resposta mais curtida é um relato de bug, e justo. O painel tem botões de toque, mas trocar de vista ainda pressupõe um teclado.
- **@PKekbar** (77 curtidas) não esperou atualização. Passou a demo pelo Grok, adicionou armas, árvore de habilidades, coletas com portões de luz e um ciclo roguelite entre fases, e publicou um link jogável. O caça virou um gênero em uma tarde.
- **@ayzekdiolar** (turco, 70 curtidas): “Você publicou o código aberto? Ficou muito bom.” A versão educada da pergunta que metade das citações fazia.
- **@mimicry_ryu** (chinês): “Isso não é obviamente 3D? Olhe as nuvens e o terreno: tudo é voxel.” Ele acerta nos pixels e erra no motor, que é o jeito mais interessante de acertar.
- **@Gorden_Sun** (chinês): “O Fable 5.2 fez quase de primeira; o resultado ficou bom demais. Colegas, pensem em algo e alcancem.” É daí que vem a atribuição do modelo: um observador externo de demos, não o Dash.
- **@meta_pavy** (coreano, 2,2 mil curtidas): “Não é 3D, não tem polígono: um simulador de voo de 32 KB empilhado só com faixas... a IA consegue elevar isso a um trabalho que ninguém faria à mão.” Ele precisou postar o link jogável embaixo porque os leitores assumiram que era um render. Essa suposição é a crítica.

## Onde a frase para

- **32 KB é o código, não o download.** O registro público do Forge lista 32 arquivos que somam 3,18 MB, incluindo duas folhas de sprites grandes e trinta arquivos de áudio. A cena carrega rápido; não é uma página de 32 KB.
- **É público, não é open source.** A prévia entrega os módulos do app e o Remix copia o fragmento para um workspace do Forge, mas não há repositório nem licença. A pergunta de Ayzek continua sem resposta na thread.
- **O celular é o ponto fraco.** Os botões de toque são um ajuste, mas a resposta mais curtida é de quem estava no telefone e não conseguia mudar a vista. A demo foi feita para teclado e isso aparece.
- **“Sem 3D” fala do motor, não do que você vê.** As pilhas são voxels com outro nome; a demo ganha a discussão técnica e perde a da percepção.

## Dez minutos e Remix

> **Vale dez minutos**
> Abra no notebook, troque para a vista de cabine e voe rasante à água até a esteira aparecer. O truque tem décadas; o que mudou foi o acabamento. Depois aperte Remix — o fragmento é público e o plano gratuito do Forge cobre três projetos — se quiser ver quanto do discurso de “um único prompt” sobrevive ao painel de controle.

O avião não é realmente a história. A história é que uma demo de 32 KB agora está acabada o bastante, até o close da ejeção e o chiado do rádio, que 26 mil pessoas curtiram antes de perguntar qual motor ela usa.
