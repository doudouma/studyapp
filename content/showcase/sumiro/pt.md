---
summary: Um jogo de samurai 3D jogável entregue em 24 horas por um único desenvolvedor com seis ferramentas de IA — o artigo divide as 24 horas em seis passos, duas condições prévias e dois pontos onde copiá-lo trava.
tags: [Jogo IA, Three.js, Blender, Claude Code, Protótipo de Jogo, Fluxo de Trabalho]
facts:
  - key: build time
    value: 24 horas (afirmação do autor)
    highlight: true
  - key: tools
    value: 6 — Opus 5.5 · Flux 3 Max · GPT Image · Tripo · Blender · Three.js
  - key: author
    value: Shikhar (@xikhar) · terceiro jogo feito com IA
  - key: platform
    value: Navegador · gratuito
  - key: playtime
    value: 30–40 minutos
  - key: launch
    value: 2,6 mi de visualizações em dois dias
  - key: inspiration
    value: Video2Game, de OdinLovis
---

## O jogo

Em 4 de novembro de 2026, o desenvolvedor Shikhar lançou Sumiro — uma aventura de samurai em estilo tinta que roda de graça no navegador. Um andarilho de chapéu de palha atravessa penhascos enevoados, toriis e escadarias de pedra; escalando, usando elevadores e avançando por capítulos, com 30 a 40 minutos de duração. A thread de lançamento passou de 2,6 milhões de visualizações em dois dias.

![A tela de título de Sumiro: estilo tinta, o samurai de pé sobre a água](/showcase/sumiro-title.jpg)

![Trecho da demo em jogo (do original de 97 segundos), a parte mais bonita do projeto](/showcase/sumiro-demo.gif)

A frase dele: "Agora qualquer um pode fazer jogos." O texto chinês em que nos baseamos gasta a extensão toda no que a frase deixa de fora — as 24 horas reais e as condições por trás delas.

## Como as 24 horas foram distribuídas

Seis passos, seis ferramentas prontas (Opus 5.5, Flux 3 Max, GPT Image, Tripo, Blender, Three.js). Cada passo alimenta o seguinte:

1. **Começar com um vídeo, não com código.** O Flux 3 Max gera um clipe de referência curto — esse vídeo é a bíblia visual do projeto. Mundo, personagem, paleta e câmera derivam todos dele, seguindo a abordagem Video2Game do OdinLovis.
   ![O produto do passo 1: o clipe de referência de onde vêm todas as cenas](/showcase/sumiro-step1-reference.jpg)
2. **Quebrar o vídeo em cenas.** Capturas de tela viram assets reconstruídos no Blender e posicionados no Three.js. O detalhe fácil de perder: fluxos dinâmicos dentro do Claude Code, com vários agentes construindo e verificando uns aos outros em paralelo — "um bando de agentes trabalhando separado e se conferindo", não um único agente do começo ao fim.
   ![O resultado do passo 2: cachoeira, toriis e escadarias, tudo reconstruído de capturas do vídeo](/showcase/sumiro-step2-scenes.jpg)
3. **Construir o personagem.** Quatro vistas laterais geradas com GPT Image a partir de uma captura, o Tripo transforma em modelo 3D e o Opus adiciona física de tecido e animação.
   ![Como quatro vistas laterais viram um personagem 3D animado (acelerado)](/showcase/sumiro-step3-character.gif)
4. **Jogar antes.** O passo inteiro é uma frase: jogue o protótipo antes de acumular mais coisa, confirme que ele roda de verdade. O único movimento do pipeline que contraria o instinto da IA.
5. **Deixar os agentes lotarem os níveis.** O GPT Image gera arte conceitual para cada nível no estilo já travado, até oito imagens por nível; cada conceito se torna um nível 3D jogável.
   ![Passo 5: arte conceitual de níveis gerada pelo GPT Image em um só estilo — uma imagem por nível](/showcase/sumiro-step5-concepts.jpg)
6. **Iterar.** Jogar, reportar bugs, deixar os agentes corrigirem, jogar de novo.
   ![Da imagem conceitual a um nível jogável (acelerado)](/showcase/sumiro-step6-level.gif)

## O que a frase de efeito deixa de fora

O artigo impõe duas condições antes de repetir "qualquer um pode fazer jogos":

**24 horas é número de terceiro jogo, não de primeiro jogo.** Antes de Sumiro, Shikhar já tinha lançado Spiderbench (um jogo do Homem-Aranha no navegador — esse levou três dias mais uma assinatura Claude 5x) e Walden, um duelo de katanas que ele chama de primeiro protótipo. As lições caras — alinhar assets do Blender com o Three.js, impedir agentes paralelos de atrapalhar uns aos outros, evitar que o tecido atravesse o corpo — foram todas pagas antes deste relógio de 24 horas começar.

**Duas partes que o fluxo não cobre.**

> A música é a parte não resolvida: os modelos não ouvem, então é preciso uma cadeia de ferramentas separada para geração musical — o sétimo passo, fora dos seis.

A outra lacuna são os controles: o vídeo de demo parece travado porque foi operado pelo agente com gravação por script. Uma pessoa jogando sai bem mais solta — mas isso não é a parte que as 24 horas produziram.

## Os dois pontos onde copiar de verdade trava

* **Julgar o vídeo de referência.** Abrir as ferramentas qualquer um faz. O difícil é saber se o vídeo serve — se o estilo aguenta um nível, se a silhueta do personagem é legível, se a paleta fica suja no 3D. Errar aqui joga fora os outros cinco passos.
* **O passo 4 é só humano.** A IA nunca se cansa de adicionar — assets, arte conceitual, níveis. Mas jogar o protótipo antes de continuar é um juízo que só uma pessoa pode fazer; o autor o transformou em passo próprio porque já pagou por pulá-lo.

## Veredicto

> **Leia como uma história de compressão, não de democratização.**
> O número assusta — 24 horas, seis ferramentas, um jogo jogável — mas pertence a alguém que já tinha feito dois jogos e pisou em cada buraco antes. As ferramentas elevam o piso muito alto; o teto fica com quem continua treinando. Dos seis passos, o julgamento do passo 1 é o único que não se copia; o resto se segue como está escrito.

## Atribuição

Caso montado a partir do texto chinês de 挥码天涯（大黑猫） "用 AI 做游戏的完整流程", da própria thread de lançamento de Shikhar e de cobertura de terceiros. A cifra de 24 horas é afirmação do desenvolvedor, repetida (não verificada de forma independente) por AIGamer e outros veículos.

As imagens deste caso vêm do artigo de análise e da thread de lançamento de Shikhar; os direitos ficam com os publicadores originais.
