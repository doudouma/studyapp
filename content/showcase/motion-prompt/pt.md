---
slug: motion-prompt
name: Motion Prompt
summary: Uma biblioteca de nomes para trabalhar com IA — 192 nomes de movimento, câmera, componentes de UI, efeitos de landing page e estilos fotográficos. Cada um traz uma amostra em movimento, um significado de uma linha, um exemplo de pedido e uma especificação precisa ao milissegundo. MIT, cinco idiomas, instalável como skill para agentes.
category: resource
tags: [Design de movimento, Biblioteca de prompts, Canvas, Sistema de design, Open Source, Multilíngue]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Shohei Ohtaki
externalUrl: https://showheyohtaki.github.io/motion-prompt/
facts:
  - key: names
    value: 192 nomes · 8 packs
    highlight: true
  - key: languages
    value: Inglês / japonês / espanhol / chinês simplificado e tradicional
  - key: each name
    value: Amostra em movimento + significado em uma linha + pedido de exemplo + motion spec
  - key: license
    value: MIT · 1,9K estrelas · 187 forks
  - key: install
    value: npx skills add showheyohtaki/motion-prompt
  - key: author
    value: Shohei Ohtaki (Daytra Inc.)
sources:
  - title: Motion Prompt — galeria
    url: https://showheyohtaki.github.io/motion-prompt/
    publisher: Shohei Ohtaki
  - title: showheyohtaki/motion-prompt — GitHub (MIT)
    url: https://github.com/showheyohtaki/motion-prompt
    publisher: GitHub
cover:
  src: /showcase/motion-prompt-cover.jpg
---

## O que trava as pessoas não é a imaginação, é o nome

Shohei Ohtaki começou publicando alguns vídeos curtos no X que davam nome a movimentos de motion graphics e de câmera. Em poucos dias os comentários chegaram. Um deles dizia, em essência: **o que me travava não era falta de imaginação. Era não saber como esse tipo de movimento se chama.**

Esse comentário virou o ponto de partida do projeto. Se as pessoas que dominam seu campo, em muitos idiomas, colocassem no papel a linguagem comum necessária para trabalhar bem com IA, na forma de uma biblioteca consultável, isso seria realmente útil — então ele construiu o Motion Prompt: não um estilo para copiar, mas uma biblioteca de nomes.

A manchete diz sem rodeios: **For the creative directors who direct AI.**

## Como é um nome por dentro

Abra qualquer número e aparece uma ficha completa:

- uma **amostra em movimento** de 4,7 segundos em loop — não é um arquivo de vídeo, é desenhada ao vivo num canvas
- um **significado** de uma linha («Uma forma se transforma suavemente em outra»)
- **How to ask an AI**: um pedido de exemplo que pode ser colado direto num modelo
- um **Motion spec**: o efeito decomposto em passos que dá para seguir — durações, curvas de easing, deslocamentos, condições de borda, com precisão de milissegundos e pixels
- **Copy prompt / Copy code**: o prompt e a implementação de referência, a um clique

No #012 «Shape morph», a spec conta: quatro formas, 1,175 s cada; cada trecho primeiro segura, depois transforma na forma seguinte em 0,58 s; cada contorno é guardado como 240 pontos e pontos de mesmo índice são interpolados linearmente; o progresso usa backOut (s = 1,6), então passa um pouco do alvo; as cores se misturam azul → coral → amarelo → menta com easing quadrática. Uma IA que leia isso consegue reproduzir quase exato, e uma pessoa que leia consegue decidir se quer aquilo.

![A ficha do #012 Shape morph: amostra, significado, pedido de exemplo, motion spec e botões de copiar](/showcase/motion-prompt-detail.jpg)

## Oito packs, 192 nomes

Oito packs de 24 nomes cada, numerados em sequência:

* **001–024 motion**: motion graphics — Pop-in, Stagger, Burst, Line draw, Mask reveal, Typewriter, Count-up, Kinetic typography, Easing, Overshoot, Squash & stretch, Shape morph, Particles, Parallax… agrupados em entradas e texto, acabamento do movimento, transições e destaques
* **025–048 camera**: movimentos de câmera — Pan, Tilt, Dolly in, Zoom in, Tracking shot, Orbit, Crane up, Dolly zoom (Vertigo), Rack focus…
* **049–072 ui**: nomes de componentes — Modal dialog, Drawer, Bottom sheet, Accordion, Dropdown, Tooltip, Popover, Toast notification, Tabs… cada um demonstrado por um cursor que o aciona
* **073–096 lp**: landing pages e efeitos web — Parallax scrolling, Fade-in on scroll, Sticky header, Pinning, Horizontal scroll, Scroll snap, Scroll progress bar, Hover lift…
* **097–120 photo**: iluminação e estilos fotográficos — Backlighting, Rim light, Silhouette, Split lighting, Rembrandt lighting, Butterfly lighting…
* **121–144 motion2 / 145–168 lp2 / 169–192 camera2**: a segunda leva desses três packs

Vale reparar em como os packs ui e lp são apresentados. Cada um é desenhado como uma pequena página de wireframe — ui num branco quente e calmo com linhas finas e um ponteiro; lp como uma janela de navegador sobre uma mesa, onde rolagem, snap e cabeçalhos fixos acontecem de verdade dentro da janela. Você não está vendo um diagrama; está vendo o efeito.

![O pack motion: azul-escuro, quatro cores, uma animação ao vivo por nome](/showcase/motion-prompt-motion.jpg)

![O pack camera: cinza-claro, um único azul, com uma figura e prédios mostrando para onde a câmera vai](/showcase/motion-prompt-camera.jpg)

![O pack ui: wireframes em branco quente e um cursor mostrando como cada componente é acionado](/showcase/motion-prompt-ui.jpg)

![O pack lp: rolagem, snap e hover dentro de uma janela de navegador](/showcase/motion-prompt-lp.jpg)

## Escolher e mandar para a sua IA

Há três formas de usar a biblioteca. A primeira vem empacotada como skill para agentes:

Rode `npx skills add showheyohtaki/motion-prompt` num terminal e diga à sua IA «abra a biblioteca motion-prompt»; a galeria abre no navegador. Clique em **Pick** no que quiser; quando tiver o suficiente, escreva uma nota curta embaixo (por exemplo, «para o título de abertura») e clique em **Copy picks** ou **Send to AI** — números, nomes, specs e sua nota viajam juntos para o modelo.

A segunda forma não precisa de instalação: descubra o nome do que você tem em mente e coloque o nome no prompt. «Traga o título com um mask reveal de baixo para cima, 0,6 s, cada linha um pouco depois da anterior» — essa frase funciona numa IA de código, num modelo de geração de vídeo ou com uma pessoa designer.

A terceira é criar outra biblioteca para o seu próprio campo: o repositório traz três prompts prontos para copiar (traduzir, seu próprio campo, uma folha de referência de uma página) e um script que renderiza os vídeos; já existem dois exemplos completos.

![Depois de escolher alguns: a bandeja, o campo de nota e Copy picks](/showcase/motion-prompt-pick.jpg)

## Atrás de cada nome há uma implementação que funciona

É isso que separa esta biblioteca de um mural de inspiração: cada amostra é uma implementação real e executável, e foi feita para poder ser levada.

A convenção no código é: **um elemento é uma função**, `cells[i](ctx, w, h, u)` — `ctx` é um contexto de canvas 2D, `w`/`h` o tamanho do cartão, `u` o tempo em segundos dentro do ciclo. A imagem depende só de `u`; a função não lê o relógio nem usa números aleatórios, então a reprodução ao vivo e a renderização quadro a quadro dão os mesmos quadros. Cores, tamanhos, duração do ciclo e funções compartilhadas ficam no kit de cada pack; os elementos dependem só do kit do próprio pack, e não há bibliotecas externas.

A mesma convenção aparece na interface pública: `api/v1/` são arquivos estáticos — `catalog.json` (metadados dos 192), `{ja,en}/catalog.tsv` (índice), `e/{id}.txt` (a spec e o código completo de uma entrada), `p/{id}.txt` (um prompt pronto para colar), `kit/{pack}.js` (código compartilhado do pack). A CLI da skill só faz requisições GET, não lê nada do seu projeto e não envia nada; `pick` abre um listener temporário em `127.0.0.1` que recebe apenas os números e a nota escolhidos na galeria.

## Um visual por pack, de propósito

motion é azul-escuro com quatro cores; camera é cinza-claro com um azul; ui é branco quente, preto e um azul; lp é uma janela de navegador sobre uma mesa cinza-clara com vermelhão como destaque; photo não tem paleta comum — cada cartão é pintado com as cores da própria cena, e o efeito entra e sai com fade para dar para comparar.

O README diz claramente: o que um pack precisa acertar são os **nomes**, não um estilo da casa. Por isso, dentro de uma mesma biblioteca, cinco packs parecem cinco pequenos produtos diferentes; só o jeito de escrever nomes e specs se mantém igual.

![O pack photo: uma cena por cartão, cada uma com sua paleta, com fade de entrada e saída para comparar](/showcase/motion-prompt-photo.jpg)

## Cinco idiomas, e algum cuidado com as pessoas

Cada nome, significado e pedido de exemplo existe em inglês, japonês, espanhol, chinês simplificado e chinês tradicional (as traduções para espanhol, tradicional e simplificado começaram com colaboradores da comunidade). A interface da galeria é em inglês e japonês, tem modo escuro e um botão **Pause**: um toque e todas as animações da página param, o que importa para quem tem sensibilidade a movimento.

No celular a grade vira uma coluna e mostra um ou dois nomes por vez — para «procurar uma palavra», funciona até melhor que a grade de desktop.

![O layout em uma coluna no celular](/showcase/motion-prompt-mobile.jpg)

## Veredicto

> **Ele traduz gosto em vocabulário.**
> Onde a maioria trava ao trabalhar com IA não é na descrição: é em não saber que a coisa tem nome. Esta biblioteca coloca 192 nomes, como eles são, como pedi-los e como reproduzi-los com precisão numa única página, e faz tudo isso ser levado embora sob MIT: para o seu prompt, o seu projeto de vídeo, o seu próprio campo.

## Atribuição

Motion Prompt é de Shohei Ohtaki (Daytra Inc., X [@showheyohtaki](https://x.com/showheyohtaki)); a galeria está em showheyohtaki.github.io/motion-prompt e o código tem licença MIT no GitHub (mantenha a primeira linha do código de um elemento quando reutilizá-lo). As traduções para espanhol, chinês tradicional e chinês simplificado começaram com @herberthcr, @daddydanielt e @xhonye; o formato galeria mais skill se inspira no Lucian UX/UI Prompt. As capturas deste artigo foram feitas por nós na galeria ao vivo (desktop 1280×900, celular 390×844); as amostras e a arte pertencem ao autor.
