---
summary: Uma galeria open source e filtrável de fluxos de criação com imagens de IA cujos casos remetem a fontes nomeadas — um tutorial da Datawhale, o guia oficial de prompts da OpenAI, 24 threads no X e um relato do Reddit, cada um com o prompt de referência anexado.
tags: [Imagem IA, Biblioteca de Prompts, Open Source, GPT Image 2.6, Fluxo de Design, Galeria Curada]
facts:
  - key: cases
    value: 49 casos · 7 categorias de fluxo
    highlight: true
  - key: author
    value: li-xiu-qi (GitHub)
  - key: license
    value: MIT (código) · a mídia pertence aos autores originais
  - key: model focus
    value: GPT Image 2.6 (em expansão)
  - key: platform
    value: Site estático · GitHub Pages
  - key: ui languages
    value: Chinês · Inglês
  - key: references
    value: 24 threads do X · guia da OpenAI · 2 artigos · Reddit
---

## A galeria

[Awesome AI Creative Gallery](https://li-xiu-qi.github.io/awesome-ai-creative-gallery/) é uma coleção open source com licença MIT de fluxos de criação de imagens com IA, curada pelo usuário do GitHub li-xiu-qi e publicada como um site estático sem dependências (clone o repositório, abra o `index.html`, pronto). Hoje reúne 49 casos em sete categorias — 动态与表情 / 游戏与互动 / 图标与 SVG / 知识与表达 / 商业与设计 / 图片编辑 / 角色与故事 — com filtros por cenário, fluxo e versão do modelo, interface bilíngue chinês-inglês e busca por palavra-chave.

O próprio README estabelece a regra de leitura: veja o efeito primeiro, depois encontre o método. Cada caso aponta para a fonte original e vem com o prompt de referência.

## De onde vêm os casos

A galeria não é um despejo de prompts; o arquivo de dados dela cita fontes nomeadas para cada caso:

* **24 threads originais no X** — os criadores por trás das demos (MrLarus, umesh_ai, chetaslua, LinusEkenstam, gabrielchua e outros). As folhas de personagem, as edições com círculos marcados e os loops de adesivos remetem a um post específico.
* **Um tutorial de lançamento** — o artigo da Datawhale [整理了最新GPT-Images-2.6的全网10个爆火用法！](https://mp.weixin.qq.com/s/jdxCmAGWznmZukPuhQUpzA), que destila o material em dez jogadas de partida, cada uma com um prompt pronto para copiar — abertas uma a uma na seção seguinte.
* **Um relato de campo no Reddit** — um teste prático do novo recurso de GIF, direto de um usuário e não do marketing.
* **Uma coleção irmã** — [ZeroLu/awesome-gpt-image](https://github.com/ZeroLu/awesome-gpt-image), o repositório vizinho que ela cita.

## As dez jogadas de partida

O tutorial reparte suas dez jogadas em cinco famílias de cenário. Cada uma vem com uma nota de "como começar" e um prompt de referência; os prompts são traduções para o português dos originais em chinês do tutorial.

### Personagens e assets dinâmicos

**1. Personagem estático → adesivo animado em loop.** Reduz o que antes exigia rigging por camadas no AE/Live2D a uma única instrução. Comece com um sujeito e uma ação, câmera fixa, terminando de volta na pose inicial — depois confira a emenda do loop e se o rosto se desvia.

![Adesivo animado em loop: o personagem pisca e acena, terminando de volta na pose inicial](/showcase/aacg-play1-nod.gif)

```
Com base na referência do personagem enviada, mantenha inalterados o penteado, a roupa e o cenário. Faça o personagem piscar os olhos uma vez e acenar com delicadeza, com movimento estável e natural, voltando por completo à pose inicial no final, gerando um GIF em loop perfeitamente contínuo.
```

**2. Sprites de ações para personagens de jogo.** Uma folha de personagem gera sequências de espera e caminhada para validar estilo e ritmo antes de desenhar frames à mão por dias; o tutorial adverte que os frames ainda exigem alinhamento manual de pivôs e canal alfa antes do motor.

![Sprites em estilo pixel: espera e caminhada](/showcase/aacg-play2-pixel.jpg)

```
Usando a arte do personagem enviada como referência, crie uma sequência de frames de um personagem em estilo pixel de plataforma lateral, mostrando os estados de espera e caminhada para a direita; mantenha rigorosamente as cores da roupa, as proporções e a densidade de pixels, com fundo transparente.
```

**3. Folha de personagem multiângulo a partir de uma referência.** Corrige o problema de "vira a cabeça, cara nova". Liste antes os traços que não podem mudar e depois compare acessórios e roupas entre as vistas.

![Folha de personagem multiângulo: frontal, lateral, costas e close-ups](/showcase/aacg-play3-sheet.jpg)

```
Usando a ilustração do personagem enviada como referência, monte uma folha horizontal do personagem com vistas de corpo inteiro frontal, lateral e de costas, mais dois close-ups faciais com emoções diferentes à direita; mantenha rigorosamente o penteado, o corte da roupa, os traços e a paleta, sobre um fundo liso e limpo.
```

### Pôsteres de e-commerce e vitrines dinâmicas

**4. Pôsteres sazonais e anúncios dinâmicos a partir de uma foto de produto.** Duas camadas: troque o fundo travando embalagem, rótulos e texto para o material estático; depois adicione micro-movimento — tampa abrindo, produto flutuando, giro suave — para páginas de detalhe e feeds.

![Pôster sazonal de produto — fundo de outono com a embalagem travada](/showcase/aacg-play4-seasonal.jpg)

```
Mantenha exatamente inalterados a embalagem, o formato da garrafa, o layout do rótulo e os textos da imagem enviada; substitua o fundo por uma mesa de madeira de outono, com luz lateral quente e suave, pontuada por algumas folhas de bordo e flores secas, deixando o produto como foco visual absoluto.
```

```
Partindo da foto do produto, preserve por completo sua forma e marcas de superfície; faça a tampa da caixa abrir suavemente, o produto subir devagar e flutuar levemente, e então voltar e fechar, gerando um GIF de vitrine em loop estável sobre um fundo liso minimalista.
```

### SVG vetorial nativo e design de ícones

**5. Conjuntos de ícones SVG editáveis em lote.** Gera código vetorial limpo em vez de bitmaps. Unifique espessura de traço, raio de canto e cor de destaque, e teste primeiro um lote pequeno — pela documentação oficial, o SVG nativo sai por um endpoint à parte, então painéis multi-ícone precisam ser divididos em componentes antes da produção.

![Conjunto de ícones de clima lineares, saída em SVG](/showcase/aacg-play5-weather-icons.png)

```
Projete um conjunto de ícones lineares para um app de tempo com seis elementos: sol, nublado, chuva fraca, neve forte, tempestade e vento; unifique traço de 2px, cantos arredondados e estilo moderno minimalista, uma cor de destaque comum, e entregue como código SVG limpo.
```

### Edições com círculos e render de esboços

**6. Edições locais com círculos vermelhos.** Marque o alvo, diga o que muda dentro do círculo e o que fica fora, e peça para remover a marca; depois confira as emendas.

![Edição com círculo vermelho: casaco recolorido, todo o resto travado](/showcase/aacg-play6-revision.jpg)

```
Mude o casaco dentro do círculo vermelho para uma textura de lã azul-escura; fora da área marcada, bloqueie rigorosamente o rosto, o penteado, a pose e o cenário; remova o círculo vermelho no resultado, com a emenda dos bordos fundida naturalmente.
```

**7. Esboço → render fotorrealista.** Traços rudes bastam se a posição do sujeito e a perspectiva estiverem claras; o modelo preenche materiais, luz e vegetação para comunicar o conceito.

![O esboço à mão do vale usado como entrada](/showcase/aacg-play7-sketch.webp)

![O esboço renderizado como um vale realista pela manhã](/showcase/aacg-play7-valley.webp)

```
Usando o desenho à mão enviado como referência, preserve rigorosamente a composição, a perspectiva e a posição do sujeito originais; renderize o esboço como um vale natural realista sob luz lateral suave da manhã, acrescentando textura de rocha convincente, vegetação e reflexos na água calma.
```

### Mockups de UI, diagramas e storyboards

**8. Mockups de apps e sites.** O resultado é uma referência visual, não código — na comunidade, o mockup é entregue a agentes de código como o Codex para fechar o ciclo da ideia visual ao front-end.

![Mockup da tela inicial de um app de feira](/showcase/aacg-play8-ui.webp)

```
Projete a tela inicial de um app móvel para uma feira local, com seções de lista de expositores, ofertas do dia e horário de funcionamento; use um fundo branco minimalista com destaque verde natural, hierarquia de informação clara, exibida dentro da moldura da tela de um celular.
```

**9. Diagramas com tradução dentro da imagem.** Gera diagramas rotulados, ou troca o texto de um diagrama existente preservando layout, setas e ilustrações — a aposta do tutorial para localizar diagramas técnicos; verifique a terminologia à mão em áreas sérias.

![Diagrama da respiração celular](/showcase/aacg-play9-respiration.webp)

```
Traduza o texto em inglês da imagem para o chinês, substituindo os textos no lugar; mantenha exatamente as cores do fundo, a estrutura da ilustração, as setas e o layout, com o tamanho da fonte se adaptando ao espaço original.
```

**10. HQ de história em quatro quadros.** Resuma a história em uma linha, divida-a em quatro momentos com mudança, fixe o visual e o estilo do personagem, e depois leia os quadros em ordem para conferir se a história se entende sozinha.

![HQ de pet em quatro quadros: o gato espera na entrada](/showcase/aacg-play10-comic.webp)

```
Crie uma HQ de história em quatro quadros estrelada por um gato laranja tigrado. Quadro 1: o dono se despede acenando e sai; quadro 2: o gato espia pela janela; quadro 3: o gato dorme enrolado no sofá; quadro 4: o dono abre a porta e volta, com o gato sentado esperando na entrada. Mantenha o visual do personagem uniforme, com traço simples e acolhedor.
```

## O guia oficial por trás dos casos

Uma espinha dorsal discreta: quase todo fluxo marcante da galeria corresponde a uma seção nomeada do [guia oficial de prompts do gpt-image-2.6 da OpenAI](https://developers.openai.com/api/docs/guides/image-prompting?model=gpt-image-2.6) — gere um GIF em loop, guie uma edição com marcas, traduza preservando o layout, transforme um desenho em imagem realista, transforme uma história em tirinha, mantenha um personagem consistente, crie uma prévia de interface.

Ou seja, a galeria se lê como uma camada comprovada pela comunidade sobre o cookbook oficial: o guia nomeia a capacidade, a galeria mostra quem já a levou ao limite e com qual prompt.

## Como a comunidade avalia o modelo por trás disso

Por que se concentrar no GPT Image 2.6? O [confronto da 卡尔的AI沃茨](https://mp.weixin.qq.com/s/ASxig6mFVYxrIE8-8Fthew) contra o Nano Banana 2 em cinco cenários reais dá o contexto:

* **Texto e tipografia chinesa** — os pôsteres do GPT parecem uma marca de verdade (serifas delicadas, páginas de produto verossímeis); os do Banana carregam mais "cara de IA". É aí que vivem os casos de pôster e infográfico da galeria.
* **Réplica de interfaces** — o GPT produziu um player de música e uma home de e-commerce convincentes; é daí que vem o fluxo de mockups de UI da galeria.
* **Fotografia do mundo real** — praticamente empate, chegando a adivinhar a época dos dados de treino por uma bicicleta ofo no quadro.
* **Consistência e edição por referência** — empate em linhas gerais, embora a edição por clique do GPT e a estabilidade de texto ao traduzir HQs tenham se destacado.

A galeria fica exatamente do lado vencedor dessa comparação — e a comparação em si vale a leitura pelos prompts.

## O que ter em mente

* **Prompts não garantem o mesmo resultado.** O README diz diretamente: prompts públicos não prometem saída idêntica.
* **GPT Image 2.6 primeiro.** Outros modelos são anunciados mas escassos; casos cuja fonte não cita o modelo ficam como "modelo a confirmar".
* **Algumas demos são provas de conceito.** O próprio tutorial da Datawhale adverte: folhas de sprites exigem alinhamento manual antes do motor do jogo, e painéis multi-ícone precisam ser divididos antes da produção.
* **A mídia não é MIT.** Apenas o código é; imagens e vídeos de terceiros pertencem aos seus donos.

## Veredicto

> **Recomendação principal**
```
Use-a como o tecido conjuntivo entre três camadas: o guia oficial da OpenAI para capacidades, o tutorial da Datawhale para as dez jogadas de partida, e as 24 threads fonte para o detalhe no nível do prompt. Quando uma tarefa tiver forma de imagem, encontre o caso correspondente aqui e siga o link para o post original antes de escrever seu próprio prompt.
```

## Atribuição

Montado a partir do README e dos dados de casos do próprio projeto (que citam cada fonte), do tutorial da Datawhale, da comparação da 卡尔的AI沃茨, do guia oficial da OpenAI e das threads de comunidade linkadas. A galeria é mantida por li-xiu-qi sob licença MIT para o código; a mídia destacada permanece com os criadores originais.
