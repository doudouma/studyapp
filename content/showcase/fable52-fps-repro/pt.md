---
slug: fable52-fps-repro
name: Reprodução FPS do Fable 5.2
summary: Um único prompt e o Fable 5.2 escreve em 40 minutos um shooter 3D de 131 KB num arquivo só; depois o fluxo é dividido em experimentos de áudio, materiais e modelagem, cada um com a própria conta. Tudo sem intervenção: a IA tira capturas no navegador, renderiza o próprio áudio offline para checar clipping, e os quatro experimentos somam cerca de US$ 39,6.
category: experiment
tags: [Fable 5.2, Claude Code, Three.js, WebAudio, Desenvolvimento de jogos, Engenharia de prompts]
publishedAt: 2026-11-12
updatedAt: 2026-11-12
author: WquGuru
externalUrl: https://github.com/wquguru/fable52-fps-repro
facts:
  - key: one prompt
    value: Um prompt → um FPS de 131 KB em arquivo único (três ondas de drones, 18 sons sintetizados)
    highlight: true
  - key: experiments
    value: 4 experimentos independentes · 5 execuções · tudo HTML de arquivo único
  - key: time
    value: 16,6 / 23,9 / 28,7 / 40,8 minutos
  - key: cost
    value: Cerca de US$ 39,6 pelos quatro · a execução 04 custa US$ 15,96 (US$ 60,57 sem cache)
  - key: stack
    value: Claude Code headless · Fable 5.2 · agent-browser · OfflineAudioContext
  - key: license
    value: MIT · 55 estrelas
sources:
  - title: Fable 5.2 da modelagem ao jogo FPS completo (republicado pelo WaytoAGI)
    url: https://waytoagi.feishu.cn/wiki/WhlCwkIkpi0Y3ik2NHXcB46enUc
    publisher: WaytoAGI / WquGuru
  - title: wquguru/fable52-fps-repro — GitHub (MIT)
    url: https://github.com/wquguru/fable52-fps-repro
    publisher: GitHub
  - title: Jogar online
    url: https://wquguru.github.io/fable52-fps-repro/
    publisher: GitHub Pages
  - title: Post original (X)
    url: https://x.com/wquguru/status/2120382704
    publisher: WquGuru
cover:
  src: /showcase/fable52-cover.jpg
---

## Um prompt, quarenta minutos, um shooter

Em 9 de novembro de 2026, Felix Rieseberg, da Anthropic, mostrou no X um shooter de navegador chamado Saltline, gerado com um único prompt do Fable 5.2: 8 horas de execução, 445 milhões de tokens de entrada e cerca de US$ 550. Dois dias depois, WquGuru reproduziu com o prompt que Felix publicou — **40,8 minutos, 73 rodadas, 6,61 milhões de tokens de entrada, cerca de US$ 15,96** — e o modelo criou um jogo próprio chamado SUBLEVEL 07: um corredor subterrâneo de subestação úmido, reflexos em tempo real no chão, uma carabina com mira de ponto vermelho e três ondas de drones flutuantes.

Ele não parou numa execução. O tutorial divide o fluxo em quatro experimentos que podem ser cobrados separadamente: primeiro áudio, depois materiais, depois modelagem, e só no fim o prompt original solto numa pasta vazia. Cada experimento é **código puro, sem carregar imagens, modelos ou áudio externos**.

![SUBLEVEL 07 em jogo: corredor subterrâneo de subestação, a carabina e a primeira de três ondas de drones](/showcase/fable52-cover.jpg)

## O elenco: quatro ferramentas e um comando

O kit é pequeno:

* **Claude Code** — roda tudo em modo headless pela linha de comando, cuidando de leitura e escrita de arquivos, cache e limite de orçamento
* **Fable 5.2** — escreve o código de síntese WebAudio, os shaders do Three.js, os modelos por vértices e a lógica do jogo
* **agent-browser** — permite que a IA abra a própria página no seu Chrome local, tire capturas, leia erros do console e confirme que o WebGL está numa GPU real
* **OfflineAudioContext** — o renderizador de áudio offline do navegador, para que uma IA que não ouve consiga renderizar o áudio e checar picos, clipping e trechos silenciosos

Em uma frase: inicie o Claude Code pela linha de comando com o Fable 5.2, passe um pedido único mais um prompt de sistema com autoverificação, e deixe que ele escreva código, tire capturas no navegador e renderize áudio offline, sem interrupção até entregar um HTML de arquivo único.

Na prática são dois arquivos: `builder_system.md` com o prompt de sistema extra (permite o agent-browser, exige autoverificação, restringe a saída à pasta indicada) e `prompt.md` com o pedido desta execução. Depois:

```
claude -p "$(cat prompt.md)" \
  --model claude-fable-5-2 \
  --permission-mode auto \
  --append-system-prompt "$(cat builder_system.md)" \
  --max-budget-usd 12
```

## Primeiro, 16,6 minutos para provar o ciclo

Não comece pelo FPS completo. Comece pelo menor console de áudio possível para provar que o ciclo desassistido funciona; essa execução custou US$ 4,66. Três passos:

1. **Preparar o ambiente (2 minutos)** — Claude Code 2.1.242 ou superior (o autor usou 2.1.322), Chrome e agent-browser instalados
2. **Criar dois arquivos (2 minutos)** — `builder_system.md` e `prompt.md` numa pasta vazia
3. **Escrever o prompt de sistema (1 minuto)** — pedir que a IA tire capturas e revise o áudio, e rodar o comando

O que voltou foi mais do que o pedido: um console com forma de onda, espectrograma e espectro, com pico / RMS / número de vozes ao vivo, e 14 botões de som que cobrem tiro de rifle em ambiente aberto e fechado, as três etapas do recarregamento, cápsula caindo, três passos (concreto, metal, poça), bala passando, ricochete, chuva, trovão distante e cerca de 30 segundos de trilha. Ele ainda adicionou um botão «demonstração de tiroteio» que encadeia todos os sons, e cada disparo usa uma semente aleatória nova — então apertar duas vezes o mesmo botão não soa igual.

![O console de áudio SALTLINE: forma de onda, espectrograma, espectro e 14 sons de jogo sintetizados em código](/showcase/fable52-audio.jpg)

## Experimento 01: sintetizar áudio de jogo em código puro

Por que testar áudio primeiro? Porque é onde o «a IA não ouve» aparece mais nitidamente: uma captura verifica uma imagem, não um som.

Esta execução levou 16,6 minutos em 16 rodadas: 1,17 milhão de tokens de entrada, 88,6% de acerto de cache, 78 mil tokens de saída — US$ 4,66 contra US$ 12,47 sem cache. O HTML de arquivo único tem 56 KB.

Seguindo o prompt de sistema, renderizou o áudio offline com OfflineAudioContext para checar clipping e silêncio, e o próprio relatório diz «não ouvido por um ouvido humano». Essa frase importa: **a autoverificação valida propriedades técnicas, não se soa bem**.

## Experimento 02: materiais procedurais para um cais chuvoso

Sem nenhuma textura de imagem e com só uma biblioteca via CDN (Three.js); o resto é gerado em código: concreto molhado com reflexos reais nas poças, contêineres pintados enferrujando nas bordas (até os números de caixa são desenhados), armários de aço galvanizado, pneus de borracha preta, paletes de madeira e uma placa de latão envelhecida.

23,9 minutos, 25 rodadas, 2,46 milhões de tokens de entrada, 83,8% de cache, US$ 8,56 e 55 KB de saída. Usou o agent-browser para capturar a própria página e confirmou que o WebGL rodava na GPU real de um Apple M2 Pro, não em software. Os defeitos que ele mesmo relata: alguns buracos rasos são lidos como poças e as pilhas de contêineres ao fundo são blocos de cor chapada.

![O estudo de materiais do cais chuvoso: chão molhado refletivo, contêineres enferrujados e números pintados por código](/showcase/fable52-materials.jpg)

## Experimento 03: um guindaste, um navio e um rifle feitos com código

O terceiro teste é modelagem de superfície dura sem arquivos de modelo: só geometria, montada no Three.js:

1. **Um guindaste portuário** — treliças, casa de máquinas, cabine, oito cabos de elevação, spreader de 40 pés e animação de carga
2. **Um navio porta-contêineres de 215 metros** — bulbo de proa, doze baias de contêineres, ponte de comando
3. **Um rifle de assalto em primeira pessoa** — trilho, freio de boca, janela de ejeção, carregador, mira de ponto vermelho

28,7 minutos, 19 rodadas, 2,05 milhões de tokens de entrada, 76,1% de cache, US$ 10,38 e 69 KB de saída. Ele ainda adicionou uma aba de «panorama do cais» que ninguém pediu, unindo as três cenas: cerca de 1,85 milhão de triângulos, a uns 120 fps no M2 Pro. O defeito autodeclarado é igualmente honesto: a visão em primeira pessoa não tem braços.

![O visualizador de modelos: guindaste, navio, rifle e panorama do cais, montados com geometria pura](/showcase/fable52-models.jpg)

## Experimento 04: um prompt, um FPS completo

Com os três módulos validados, o autor mudou para uma pasta limpa e vazia e usou o prompt original do Felix — sem o «You know, you should also» inicial, com uma linha sobre HTML de arquivo único, só CDN e sem arquivos externos — para ver o que uma única execução produzia.

Esta usou cache de 1 hora: 40,8 minutos, 73 rodadas, 6,61 milhões de tokens de entrada, 90,9% de acerto, 193 mil tokens de saída. A preço de tabela seriam US$ 60,57; com cache saiu por US$ 15,96. Esse 90,9% cai justamente na faixa de 90–95% que ele havia estimado a partir dos números do post original.

O que ele construiu foi SUBLEVEL 07, 131 KB em um arquivo:

* **Cena e renderização** — um corredor subterrâneo de subestação úmido com números pintados nos pilares, materiais procedurais, reflexos em tempo real no chão, AO, bloom e etalonagem cinematográfica, com três níveis de qualidade
* **Armas e combate** — carabina com mira de ponto vermelho, recarga, recuo, clarão e ejeção de cápsulas; três ondas de drones flutuantes (a segunda numa área de luzes vermelhas); 18 sons sintetizados em código
* **Teste automatizado** — antes de entregar, escreveu o próprio script que venceu as três ondas, verificou as telas de vitória e morte e confirmou console sem erros

Os defeitos que ele mesmo lista: antebraços e luvas toscos e só o chão reflete.

![SUBLEVEL 07: clarão do disparo, cápsulas ejetadas e tiroteio na área de luzes de advertência](/showcase/fable52-fps.jpg)

## A conta: o cache transforma 60 dólares em 16

Todos os dados foram medidos em 2026-11-10 com Claude Code 2.1.322 e o modelo `claude-fable-5-2`. O autor usou a cota da assinatura, então os valores são a estimativa do Claude Code a preços oficiais de API, que ele recalculou linha por linha com um script; cada experimento rodou uma vez.

| Experimento | Tempo | Rodadas | Tokens de entrada | Acerto de cache | Custo | Sem cache |
| --- | --- | --- | --- | --- | --- | --- |
| 01 console de áudio (cache 5 min) | 16,6 min | 16 | 1,17 M | 88,6% | $4,66 | $12,47 |
| 01 console de áudio (cache 1 h) | 18,8 min | 16 | 1,29 M | 78,6% | $6,97 | $13,98 |
| 02 materiais | 23,9 min | 25 | 2,46 M | 83,8% | $8,56 | $24,24 |
| 03 modelagem | 28,7 min | 19 | 2,05 M | 76,1% | $10,38 | $21,96 |
| 04 FPS de um prompt | 40,8 min | 73 | 6,61 M | 90,9% | $15,96 | $60,57 |

Os quatro experimentos somam cerca de US$ 39,6, ou uns US$ 47 com a execução de controle e os testes rápidos. A chave é que o modelo não emite o jogo de uma vez: ele relê o projeto e edita ao longo de dezenas de rodadas. A leitura de cache custa 0,025× o preço base de entrada, e enquanto o intervalo entre rodadas for de segundos o cache se renova — é assim que a execução 04 caiu de US$ 60,57 para US$ 15,96.

## Um acidente: por que os três primeiros dizem SALTLINE

É um tropeço do próprio autor, e a lição mais memorável de todo o artigo.

Os experimentos 01–03 rodaram numa pasta da biblioteca criativa dele **cujo nome continha `saltline`**, e esse diretório também tinha um `AGENTS.md` de normas de escrita sem relação com o jogo, carregado automaticamente. Então o Fable 5.2 pegou `SALTLINE` do nome da pasta e colocou na interface: por isso o console de áudio, a página de materiais e o visualizador de modelos trazem essa palavra.

No experimento 04 ele mudou para uma pasta vazia, sem nenhum `CLAUDE.md` ou `AGENTS.md`, e o modelo deu o próprio nome à obra: **SUBLEVEL 07**.

## Rode você mesmo

O repositório tem licença MIT e traz as quatro demos, os prompts originais, os scripts e os dados de faturamento de cada execução; as quatro demos de código puro podem ser jogadas na página do projeto:

* Repositório: `https://github.com/wquguru/fable52-fps-repro`
* Jogar online: `https://wquguru.github.io/fable52-fps-repro/`
* Como rodar: `scripts/run.sh 01-audio prompts/01-audio.md 5m 12` (o último argumento é o limite de orçamento por execução, em dólares)

## Atribuição

Compilado de «Fable 5.2 da modelagem ao jogo FPS completo», republicado na base de conhecimento do WaytoAGI; o autor original é WquGuru (X [@wquguru](https://x.com/wquguru)) e o post é de 2026-11-11. O repositório wquguru/fable52-fps-repro tem licença MIT. A inspiração veio do Saltline, o jogo que Felix Rieseberg (Anthropic) fez com o Fable 5.2; estas demos não são o Saltline e não contêm o código dele. As capturas vêm do tutorial original e do repositório e seguem sendo do autor; todos os números vêm da fatura medidida por ele.
