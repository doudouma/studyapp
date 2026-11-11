---
slug: lemo-opuscar
name: Lemo-Opuscar
summary: Um Skill open source para o Claude Code que organiza os vídeos feitos com código do Opus 5.5 em 66 estilos prontos para uso — cada estilo é um prompt reutilizável mais um filme demo dirigido, desenhado e musicado inteiramente em código.
category: tools
tags: [Claude Code, Skill, Vídeo IA, Motion Design, Open Source, Opus 5.5]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Lemomo
externalUrl: https://github.com/lemomo-ai/lemo-opuscar
facts:
  - key: styles
    value: 66 estilos prontos · 11 categorias (59 na publicação do artigo)
    highlight: true
  - key: stars
    value: 14,5K (em 10-11-2026)
  - key: license
    value: MIT · grátis e open source
  - key: how it's made
    value: Imagem e trilha geradas pelo Opus 5.5 como código · voz TTS · sem modelos de vídeo
  - key: runtime
    value: Uns 30–60 minutos por filme · consumo de tokens nada pequeno
  - key: requires
    value: Node 20+ · ffmpeg · Python 3.11+
  - key: install
    value: Plugin do Claude Code (marketplace lemolab)
sources:
  - title: 这个Skill，让你轻松做59种视频风格，助你涨粉上万 (O Skill que facilita 59 estilos de vídeo)
    url: https://mp.weixin.qq.com/s/Yc129owSJnJkk7wvxNpNBw
    publisher: HalfAI
  - title: lemomo-ai/lemo-opuscar — repositório no GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
cover:
  src: /showcase/lemo-opuscar.jpg
---

## Ele transformou os vídeos feitos com o Opus 5.5 numa biblioteca de estilos

Todas as plataformas estão hoje impulsionando vídeos de código, e há contas que chegaram a dezenas de milhares de seguidores em um mês e milhões de visualizações com eles. O método não tem mistério: um Claude Opus 5.5 e um tema, e você já pode começar. O artigo da HalfAI que tomamos como referência compartilha o Skill que facilita isso — o Lemo-Opuscar.

O ponto mais forte dele não é "faz vídeos", mas ter organizado o conteúdo de vídeo que a gente vem fazendo com o Opus 5.5 em estilos prontos e com nome. Você deixa de desenhar um estilo do zero — instala o Skill, diz qual quer, entrega o tema e o material, e ele gera o vídeo nesse estilo.

Cada filme demo do repositório tem imagem e trilha escritas pelo Claude como código, com a voz sintetizada por TTS: sem modelos de geração de vídeo, sem banco de footage. Cada estilo é um prompt reutilizável mais um curta dirigido, desenhado e musicado inteiramente em código. Os GIFs abaixo foram capturados pela HalfAI depois de rodar o repositório de verdade.

![O pôster da galeria de estilos LEMO OPUSCAR: 59 estilos · 11 categorias · 56 minutos de filme](/showcase/lemo-style-guide.jpg)

## A galeria de estilos: 11 categorias, uma a uma

### Edição e documentário · 8 estilos

Você dá material real e ele corta o material em imagens de notícia. As notícias legendadas são usadas por muitas contas de notícia — dão para entender até no mudo; a tela dividida com contagem regressiva em tempo real serve para cobertura de lançamentos, com as células indo do 1 ao 9 até a ignição; o quadro tático esportivo congela o plano, desenha linhas e divide a tela, com a posição e a trajetória de cada jogador claras; e o pacote de notícias de TV é a vinheta completa de um canal, serve para diário ou jornal da manhã. Essa categoria ainda tem cinejornal dos anos 20, sinfonia time-lapse, investigação visual e montagem construtivista — a investigação visual disseca um objeto ou evento em detalhe, ótima para divulgação.

![Notícias legendadas — os EUA perderam 1,3 milhão de colmeias em um ano e mesmo assim o total subiu 6%](/showcase/lemo-captioned-news.gif)

![Tela dividida com contagem regressiva — o último minuto do lançamento da Artemis II](/showcase/lemo-countdown.gif)

![Quadro tático esportivo — congela o plano, desenha linhas, divide a tela](/showcase/lemo-tactics.gif)

![Pacote de notícias de TV — quatro notícias de IA por semana, o pacote completo de um canal](/showcase/lemo-tv-package.gif)

### Imagem empírica · 8 estilos

Usa mapas, imagens de satélite ou modelos 3D para apresentar lugares e desmontar produtos — e cada número tem fonte citada, o que separa essa categoria de um infográfico qualquer.

![Boletim por satélite — o satélite segue o mapa até o mar de Aral e encontra um deserto](/showcase/lemo-satellite.gif)

![Desmontagem de produto — metade de um teclado open source, camada por camada](/showcase/lemo-teardown.gif)

### Desenho e pintura · 7 estilos

Desenho à mão, aquarela, nanquim chinês, mais impasto a óleo e desenho de linha única — combina bem com vídeos explicativos.

![Nanquim chinês — um espadachim roça o rio e corta a correnteza](/showcase/lemo-ink.gif)

### Tradições orientais · 4 estilos

Teatro de sombras, ukiyo-e, picotado vermelho e sombras de lanterna entalhada — estilizados e bem asiáticos.

![Teatro de sombras — dez sóis abrasam a terra e Hou Yi arma o arco](/showcase/lemo-shadowplay.gif)

### Impressão e gravura · 5 estilos

Riso, gravura em madeira, água-forte — aquelas texturas de prensagem estilizadas.

![Gravura em madeira — um vilarejo passa o inverno inteiro fundindo um sino](/showcase/lemo-woodcut.gif)

### Gráfico e tipografia · 7 estilos

Propostas tipográficas com graça, como a tipografia cinética suíça: uma grade, um sinal de cor, cada movimento no compasso.

![Tipografia cinética suíça — cinco regras fazem um pôster](/showcase/lemo-swiss-type.gif)

### Informação e publicação · 5 estilos

Apresentações de produto, narrativa de dados, screencasts — pensado para lançamentos.

![Narrativa de dados — cem verões da temperatura global, desenhados a lápis](/showcase/lemo-data-story.gif)

### Cartoon e animação · 4 estilos

Cartoon de mangueira dos anos 30, animação de celuloide dos anos 80, mais cartoon de sitcom sci-fi.

![Cartoon de mangueira anos 30 — a aventura culinária de uma xícara de café](/showcase/lemo-rubberhose.gif)

### Jogos · 4 estilos

RPG de pixels 16 bits, microjogos relâmpago e ritmo plano de programa de auditório — cara de jogo, fofos e bem dinâmicos.

![RPG de pixels 16 bits — o último ponto de salvamento](/showcase/lemo-pixel-rpg.gif)

### Cinema e épocas · 2 estilos

Cinema mudo dos anos 1920, e o visual new-weird do Backrooms — dá para converter todo o seu material nesse estilo.

![Cinema mudo anos 1920 — um padeiro persegue um pão fugido](/showcase/lemo-silent.gif)

![Backrooms / new weird — uma fita VHS do turno da noite de 1996](/showcase/lemo-backrooms.gif)

### Materiais e 3D · 5 estilos

Brinquedos de blocos, livros pop-up, miniaturas tilt-shift — texturas com cara de 3D.

![Brinquedo de blocos — montando um foguete peça por peça](/showcase/lemo-bricks.gif)

## Por que vale a pena guardar

Palavra própria do autor do artigo: "Sinceramente, é a primeira vez que vejo um repositório assim". O valor não está nos prompts em si — ele resolve um problema concreto: há gente que sabe exatamente qual sensação quer, mas não tem na cabeça o nome nem o conceito desse estilo. Com uma biblioteca de estilos indexada por nome, você para de pedir à IA para inventar um estilo do zero.

## Transforme no seu próprio estilo

Um recurso recente do repositório: coloque suas cores de marca, logo, IP e tom de conta, e transforme um estilo pronto no seu. Por exemplo, o autor do repositório transformou a tipografia cinética suíça em "Grade de materiais" — mantém a grade, o compasso e as fontes, e troca por objetos reais de argila, plástico, veludo, vidro e cromo.

![O estilo retrabalhado: Grade de materiais (sobre tipografia cinética suíça)](/showcase/lemo-material-grid.gif)

O processo vai de pergunta em pergunta: ele pergunta uma coisa por vez, cada pergunta traz opções com a recomendada em primeiro; mostra primeiro uma imagem de estilo, depois corta um filme demo de 15 a 30 segundos, e só salva como seu estilo nomeado quando você aprova — depois é só chamá-lo pelo nome.

## Instalação e uso

Totalmente grátis e open source. Instala no Claude Code com dois comandos no terminal (a HalfAI testou a instalação):

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

![A instalação testada: marketplace add + plugin install, dois passos](/showcase/lemo-install.jpg)

Depois é só dizer qual filme você quer — os nomes de estilo funcionam em chinês. O exemplo do README:

```
Faça um filme de 30 segundos em estilo de impasto a óleo sobre meu gato laranja que espera no parapeito todos os dias eu voltar do trabalho.
```

Se você ainda não sabe o que fazer, rode `/lemo-opuscar:lemo-opuscar` e ele primeiro pergunta se você quer fazer um filme com um estilo da biblioteca, retrabalhar um estilo como seu ou usar um estilo que você já salvou.

## Antes de começar

Três precondições, ditas sem rodeio no artigo:

* **Os estilos estão presos ao Opus 5.5.** Todos foram afinados contra o Claude Opus 5.5; com outros modelos nada é garantido.
* **Tempo e tokens de verdade.** Um filme leva ao agente uns 30 a 60 minutos, e o consumo de tokens não é pequeno.
* **Requisitos de ambiente.** Você precisa de Node 20+, ffmpeg e Python 3.11+ na máquina.

## Veredicto

> **Use-o como índice de estilos, não como gerador de vídeos.**
> O produto real é "o nome de um estilo + um prompt reutilizável + um filme demo todo em código" — o vídeo é só a forma de apresentar a demo. O jeito certo de escolher estilo é assistir às demos primeiro; a diferença de sensação entre as categorias é muito maior do que os nomes sugerem. Antes de começar, três coisas: só Opus 5.5, 30–60 minutos por filme e um consumo de tokens nada trivial.

## Atribuição

Compilado do artigo da HalfAI (这个Skill，让你轻松做59种视频风格，助你涨粉上万) e do repositório lemomo-ai/lemo-opuscar (MIT). Os GIFs e capturas vêm das execuções do próprio autor do artigo; os direitos ficam com HalfAI e Lemomo. Dados de vigência (66 estilos, 14,5K estrelas) conferidos no repositório em 10-11-2026; na publicação, o artigo reportava 59 estilos e 6,3K estrelas.
