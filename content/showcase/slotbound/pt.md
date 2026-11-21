---
slug: slotbound
name: Slotbound
summary: Um jogo indie feito com Codex por um desenvolvedor que diz não saber programar: 50 mil cópias em 48 horas e os doze meses de demo que os posts virais deixaram de fora.
category: ai
tags: [Jogo com IA, Steam, Indie Dev, Codex, Love2D, Estudo de caso]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: KLeo (KKLeoAI)
externalUrl: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
facts:
  - key: sales
    value: 50.000 cópias nas primeiras 48 horas (dado do desenvolvedor)
    highlight: true
  - key: gross
    value: US$ 356 mil brutos, antes da comissão da Steam, impostos e reembolsos
  - key: wishlists
    value: Mais de 100 mil antes do lançamento · 50 mil no fim de julho
  - key: peak
    value: Mais de 15 mil jogadores simultâneos em 15 de novembro (SteamDB)
  - key: stack
    value: Love2D · VS Code + Codex · Claude / Gemini · Nano Banana / PixelLab
  - key: art
    value: Parte gerada, parte de pacotes comprados, parte desenhada à mão para o lançamento
  - key: timeline
    value: Produção desde 2025-10 · demo 2026-07-10 · lançamento 2026-11-13 UTC
  - key: caveat
    value: Vendas e receita autodeclaradas, sem auditoria
sources:
  - title: 一个不会写代码的人，48小时卖出5万份游戏：AI造富故事，最容易被看漏的真相
    url: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
    publisher: KLeo / KKLeoAI
cover:
  src: /showcase/slotbound-cover.png
---

## A primeira coisa que fiz foi procurar a aritmética que falta

Quando isso apareceu no meu feed, a reação foi a mesma que a sua: alguém arredondou a conta.

Um desenvolvedor coreano que diz não saber programar. Um jogo feito com IA. 50 mil cópias em 48 horas na Steam, US$ 356 mil brutos, que nos reposts viraram 470 milhões de wons. A versão arrumada acrescenta duas assinaturas de IA de 30 mil wons por mês, nenhum outro custo, nenhum marketing, e arte e código inteiramente por IA.

Então voltei aos posts públicos do desenvolvedor e aos anúncios da Steam. O número de vendas se sustenta. A aritmética em volta dele, não.

![A cápsula de Slotbound na Steam](/showcase/slotbound-capsule.jpg)

*Desenvolvedor e publicadora: Optima Arch. Lançado na Steam em 13 de novembro de 2026 (UTC).*

O que está de fato registrado: as 50 mil cópias e os US$ 356 mil vêm de uma mensagem do próprio desenvolvedor em 15 de novembro — receita bruta, antes da comissão da Steam, impostos, reembolsos e custos de desenvolvimento. As 100 mil listas de desejos foram anunciadas no fim de setembro, antes do lançamento. O SteamDB registrou mais de 15 mil jogadores simultâneos em 15 de novembro, que é a parte que o marketing não consegue falsificar: as pessoas estavam jogando, não apenas comprando.

O que não está registrado é a afirmação sobre custos. "Duas assinaturas de 30 dólares, sem tokens extras, sem outros gastos" não tem fonte de primeira mão que eu tenha encontrado. Contar uma boa história não exige inventar a contabilidade.

## O jogo é um caça-níquel que monta um exército

Antes do ângulo da IA, o design merece atenção, porque as vendas estão a jusante dele.

O pitch cabe numa frase, o que é mais raro do que parece: e se um caça-níquel recrutasse o seu exército? Você gira um carretel 3 × 3 e saem guerreiros, magos e outras unidades. Funde as fracas para cima, encaixa itens e modificadores e observa se a formação aguenta a próxima onda.

Dois prazeres conhecidos estão ligados juntos. O giro é recompensa aleatória: cada puxada é uma pequena espera por uma surpresa. A fusão é crescimento controlado: até uma rodada ruim se salva com escolhas. Perde e culpa a configuração que montou duas rodadas atrás. Ganha e quer ver se uma combinação mais absurda também funciona. É o mesmo motor por baixo de Vampire Survivors e de meio gênero.

O importante para esta história: nada disso precisava de IA. O loop funcionaria se um humano tivesse digitado cada linha.

## O que a IA escreveu de verdade

Num post de maio o desenvolvedor disse que o código da demo era inteiramente gerado por IA e que ele não conseguia escrever uma linha de código. Essa frase é muito citada. A parte seguinte, muito menos.

![Quatro caixas: engenharia, pensamento, arte e as decisões que continuaram humanas](/showcase/slotbound-split.png)

| Caixa | Quem | O que cobriu |
| --- | --- | --- |
| Engenharia | Codex no VS Code | A demo e a maior parte do código final, sobre Love2D |
| Pensamento | Claude, Gemini | Design de sistemas, pontos travados, segundas opiniões |
| Arte | Nano Banana, PixelLab | Algumas cenas e sprites, junto a pacotes comprados |
| Decisões | O desenvolvedor | Dificuldade, legibilidade, sensação de recompensa, o que cortar |

Então "toda a arte é IA" é falso como está. Ele já disse publicamente que algumas unidades vieram de pacotes comprados e que a versão final ganhou bastante arte desenhada à mão. O motor é Love2D, não uma ferramenta sem código. E a divisão acima é a descrição dele do próprio fluxo, não uma planilha de custos completa.

O hábito que ele descreveu quando perguntaram sobre prompts é a coisa mais transferível de toda a entrevista: não entregue ao modelo uma tarefa enorme e vaga. Faça uma funcionalidade por vez, diga as restrições e os arquivos relevantes, teste a saída na hora e, quando ela desviar, conte exatamente o que quebrou e o que não pode mudar.

Isso não é truque de prompt. É como um engenheiro cuidadoso fala com um júnior.

## O trabalho que a IA não tirou

Peça a qualquer modelo um caça-níquel e ele devolve um caça-níquel funcionando. O que ele não vai dizer é que a fase três está difícil demais, que o botão de fundir está escondido atrás do tooltip, que a recompensa chega meio segundo tarde para ser gostosa, ou que um mecanismo do qual você se orgulha deveria ser apagado inteiro.

O desenvolvedor disse algo parecido quando a demo saiu: a IA o deixou fazer o jogo, mas se é divertido, equilibrado e legível continua sendo decisão dele.

Essa frase é o caso inteiro, honestamente. O código foi terceirizado. O critério, não.

## "Sem marketing" é a frase que mais engana

A versão viral diz que ele não fez marketing além de um post em rede social. Ele de fato disse que pulou o marketing tradicional. Aí você olha as datas.

![Linha do tempo do primeiro build ao lançamento](/showcase/slotbound-timeline.png)

Começou em outubro de 2025. Uma versão jogável foi para o itch.io no fim de junho de 2026. A demo da Steam abriu em 10 de julho. Depois vieram correções, passadas de interface, ajustes de dificuldade e atualizações de jogabilidade. As listas de desejos chegaram a 50 mil no fim de julho e a 100 mil no fim de setembro. O lançamento atrasou por causa da revisão de build da Steam, e ele escreveu um post longo sobre a exposição que temia perder.

Nada disso é um único post. Uma demo não é enfeite da página da loja para um jogo de sistemas: é o anúncio mais honesto que o gênero tem. Ver um clipe diz que parece legal. Jogar meia hora diz se você vai sentir falta.

Não comprar tráfego não é o mesmo que não fazer aquisição de usuários.

## O que eu copiaria, em ordem

**Um: um loop que se explica em uma frase.** "Um caça-níquel que monta seu exército" não precisa de tutorial. Se a sua ideia exige três minutos de preparação antes da diversão, o problema é a ideia, não o marketing.

**Dois: use a IA para baratear a validação, não para aumentar o jogo.** Construa o menor loop completo — dá para ganhar, dá para perder, algo reage — e depois estenda. Não peça 300 fases no primeiro dia.

**Três: coloque na frente de estranhos cedo.** O seu próprio gosto é ponto de partida, não prova. Alguém abrir, alguém jogar uma segunda partida, alguém compartilhar sem você pedir: esses são os sinais que valem mais um mês.

## Veredito

> **Recomendação principal:** trate Slotbound como prova de que alguém sem formação em programação já consegue chegar ao mercado, não como prova de que o mercado ficou fácil. Copie a ordem — loop, protótipo barato, demo pública — e ignore o conto de fadas dos custos.

A conquista é real e maior que os memes: alguém sem background de programação lançou um jogo comercialmente viável em cerca de treze meses. A correção é menor, mas importa: ele não pulou o ano, a demo, os patches nem o critério. Pulou a sintaxe.

Essa distinção é a diferença entre "qualquer um faz isso até sexta" e "qualquer um pode começar agora".

## O que esta história não prova

- **Um jogo, um gênero, um lançamento.** Um roguelite de caça-níquel é um gênero comprovado, legível e barato de prototipar. Um jogo narrativo ou de ação 3D não caberia nessa linha do tempo.
- **Os números são autodeclarados.** US$ 356 mil brutos não é líquido, e nada é auditado. Comissão da Steam, preços regionais, reembolsos e impostos saem daí.
- **O viés de sobrevivência trabalha muito.** Para cada Slotbound existem centenas de jogos assistidos por IA que lançaram em silêncio. Você está lendo o que funcionou.
- **"Não saber programar" não é "não saber pensar tecnicamente".** Ele dirigiu uma engine, uma arquitetura e uma cadeia de ferramentas. Isso é habilidade, só não é de sintaxe.
- **A lista de ferramentas não é receita.** Codex mais Claude mais Nano Banana produziram este jogo por causa do que ele pediu. O mesmo stack com um briefing vago produz um protótipo que ninguém joga.
- **A IA não resolve descoberta.** A demo, as atualizações e o funil de listas de desejos fizeram o marketing. Esse trabalho continua sendo seu.
