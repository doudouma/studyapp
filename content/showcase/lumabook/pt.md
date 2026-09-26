---
summary: "Um app de leitura onde as cenas do livro ganham vida em movimento enquanto você lê — começando por Sherlock Holmes, com 816 upvotes no r/SideProject."
tags: [Leitura, Gerado por IA, Ilustrações animadas, Afantasia, Educação, Estética lofi]
facts:
  - key: author
    value: u/yahska111
  - key: traction
    value: 816 upvotes · 173 comentários no r/SideProject
    highlight: true
  - key: first book
    value: As aventuras de Sherlock Holmes · domínio público
  - key: approach
    value: Cenas em movimento enquanto você lê · não ilustrações estáticas
  - key: known issue
    value: Deriva de consistência da IA (rostos, roupas, cenários)
  - key: roadmap
    value: Rolagem inline já publicada · modo narração sugerido
---

## O que é

Lumabook é um app de leitura com uma premissa simples: você lê o livro normalmente, no seu ritmo, mas cenas da história ganham vida ao lado do texto — não ilustrações estáticas de IA, movimento de verdade. Criado por u/yahska111 como projeto paralelo, estreou no r/SideProject com *As aventuras de Sherlock Holmes* como primeiro título, escolhido por ser de domínio público e ter uma atmosfera instantaneamente reconhecível. O app está no ar em [lumabook.ai](https://lumabook.ai/), e o autor é incomumente franco sobre a questão em aberto no coração do produto: visuais assim deixam a leitura mais imersiva ou viram só distração?

## Proposta de valor

* **Movimento, não imagens fixas**: o diferencial diante da enxurrada de livros ilustrados por IA são cenas animadas que vivem ao lado do texto enquanto você mantém seu próprio ritmo.
* **Consistência como a briga central de engenharia**: o autor trata abertamente a deriva de personagens, roupas e cenários — a falha mais constrangedora da IA generativa — como o problema central a resolver.
* **Conteúdo em domínio público primeiro**: Sherlock Holmes traz uma atmosfera reconhecível com zero risco de licenciamento.
* **Uma pergunta de design genuinamente aberta**: o lançamento convida ao debate em vez de fingir que a resposta está decidida — e as respostas da comunidade moldaram o roadmap em dias.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Ebooks com ilustrações estáticas de IA | Alta | O movimento é todo o pitch; imagens fixas são o piso que ele tenta superar. |
| Apps de fundos visuais ambientes/lofi | Moderada | Vários leitores compararam as cenas sóbrias em preto e branco a loops lofi relaxantes. |
| Edições ilustradas tradicionais | Moderada | As cenas se animam, mas não há mão de artista coerente — a consistência ainda deriva. |
| Apps de audiolivro com leitura acompanhada | Baixa | A narração emparelhada foi sugerida pela comunidade, ainda não construída. |

## Realidade atual e limitações

* **A pergunta central segue aberta**: a própria pergunta do autor — imersiva ou distrativa? — teve resposta dividida, com leitores notando que visuais em movimento roubam foco como legendas de filme, que não dá para ver e ler ao mesmo tempo.
* **Deriva de consistência da IA**: rostos mudam, roupas mudam, cenários contradizem o texto; o conserto (fichas persistentes de personagens, vetores em camadas) é discutido mas não provado.
* **Um livro só**: só existe Sherlock Holmes por enquanto; a pergunta do catálogo ("qual livro depois?") é literalmente o chamado do post.
* **Vento contra na marca**: entre os conselhos da comunidade estava abandonar o domínio `.ai` para evitar resistência de leitores tradicionais e comunidades literárias.

## Veredito

> **Recomendação principal**
> Experimente o capítulo de Sherlock e observe seus próprios olhos: se eles seguem derivando para a cena em movimento em vez das palavras, o conceito ainda não é para você. O sinal mais forte do lançamento é o público que ele encontrou: leitores com afantasia e jovens leitores relutantes, para quem "as imagens já vêm prontas" não é distração, é salva-vidas. Esse é um mercado real escondido dentro de uma demo novidade.

## Ciclo de desenvolvimento e iteração

Um projeto paralelo solo que usou a thread de lançamento como grupo focal:

| Etapa | Ferramentas | Foco |
| --- | --- | --- |
| Conteúdo | Catálogo em domínio público | Sherlock Holmes primeiro: atmosfera reconhecível, sem licenciamento |
| Pipeline visual | Movimento generativo, consistência em primeiro lugar | Combater a deriva de rosto/roupa/cenário; fichas de personagem e vetores em camadas em discussão |
| Iteração de UX | Feedback do Reddit, rápido | A rolagem inline junto ao texto já existe; tela cheia, toggles estáticos e revelação por capítulo na fila |
| Posicionamento | Pergunta aberta aos leitores | Imersão vs. distração como o debate definidor do produto |

## Métricas e monetização

* **Tração**: 816 upvotes e 173 comentários no r/SideProject.
* **Monetização**: não mencionada — o projeto está em fase de busca de feedback.
* **Qualidade do sinal**: a thread produziu um backlog de UX concreto (rolagem inline publicada; tela cheia, toggles e modo narração pedidos) em vez de elogios vazios.

## Recepção da comunidade e debates-chave

A thread de lançamento virou a revisão de design do produto:

* **O problema da legenda**: a crítica mais afiada comparou ler e assistir ao mesmo tempo a ler legendas de filme — você foca numa de cada vez; o contraponto foi a arte sóbria, quase lofi, que repousa quieta no fundo.
* **Afantasia e jovens leitores**: o consenso mais duradouro — pessoas que não visualizam enquanto leem encontraram valor genuíno, e educação e livros infantis emergiram como o caso de uso mais forte.
* **Engenharia da consistência**: fichas persistentes de personagens e animação vetorial em camadas foram propostas como caminho para vencer a deriva generativa.
* **Debate de marca**: uma minoria vocal aconselhou largar o domínio `.ai` antes de cortejar comunidades literárias que chegam desconfiadas.
