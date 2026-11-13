---
name: LDtk
summary: "O editor de níveis 2D que o lead designer de Dead Cells criou ao deixar o estúdio: grátis, licença MIT e deliberadamente limitado."
tags: [Código aberto, Desenvolvimento de jogos, Editor de níveis, App de desktop, Grátis]
facts:
  - key: author
    value: Sébastien Benard (deepnight)
  - key: license
    value: MIT · todos os recursos liberados
  - key: platforms
    value: Windows · macOS · Linux
  - key: downloads
    value: mais de 670 mil downloads
    highlight: true
  - key: github
    value: 4,9 mil estrelas · 323 forks
  - key: version
    value: v1.5.3 · último commit nov. 2026
  - key: built with
    value: Haxe + Electron
  - key: price
    value: Grátis · cópia paga opcional no itch.io / Steam
---

## Um editor grátis de um designer

Sébastien Benard foi lead designer de Dead Cells na Motion Twin por anos. A primeira coisa grande que publicou ao sair do estúdio não foi um jogo, mas um editor de níveis, aberto sob licença MIT: LDtk, de Level Designer Toolkit.

A frase no site oficial é mais direta do que o normal para uma página de ferramenta — "um editor de níveis 2D do lead designer de Dead Cells, rápido, grátis e de código aberto" — e logo abaixo vem uma linha que parece escrita para outros desenvolvedores, não para compradores: feito por um desenvolvedor de jogos, para desenvolvedores de jogos.

Seis anos depois, os números não são de projeto de fim de semana: cerca de 4.900 estrelas, mais de 670 mil downloads em todas as versões, e estúdios indies usando em produção.

## Fazer menos, mas fazer bem

Toda ferramenta desse tipo morre do mesmo jeito: acumula recursos até ninguém achar o que precisa. O Tiled, veterano do setor, continua sendo o exemplo lembrado quando o assunto é interface carregada.

O LDtk vai no sentido oposto e trata isso como princípio de design: fazer menos, mas fazer bem. Só 2D. Só plataforma e visão de cima, com um "desculpe" explícito para quem pede isométrico ou pseudo-3D. A lista de recursos não é curta, mas cada item é algo que um designer de níveis usa todo dia; nada está ali para exibir tecnologia.

Essa contenção vem de ter entregado jogos de verdade. Nuclear Blaze, o título do próprio Benard, foi feito inteiro no LDtk: o editor veio primeiro, e um jogo comercial provou se ele aguentava.

## Três decisões para quem é solo

Quem usa LDtk não costuma ser estúdio, e sim uma ou três pessoas sem programador de ferramentas, sem orçamento e sem tempo. Três recursos existem exatamente por isso.

**Exportar tão simples que dá vergonha.** Todo editor novo cria o mesmo momento constrangedor: agora você precisa escrever um importador para a sua própria engine. O LDtk gera alguns PNGs por fase mais um JSON pequeno, com documentação que se lê numa tarde.

![A visão de mundo: fases organizadas como salas, conectadas do mesmo jeito que no jogo final](/showcase/ldtk-1.jpg)

**Regras de auto-render para a parte chata.** Montar tiles à mão significa escolher a variante de borda certa em cada canto de grama. O LDtk deixa você definir as regras visualmente e gera as emendas sozinho. A ideia do autor: deixe o LDtk fazer o trabalho chato.

**Modo mundo.** As fases deixam de ser imagens soltas e viram salas dentro de um mundo, com layout grid-vania, linear ou livre. Arraste para reorganizar o mapa e use a roda para alternar entre mundo e fase. Se a estrutura parece familiar, é o mesmo problema que Dead Cells precisou resolver.

## Grátis, cópia paga opcional

O LDtk é grátis sem portões: sem versão Pro, sem marca d'água na exportação, sem limite de fases por projeto.

E ainda assim dá para pagar: está no itch.io e na Steam, e o site pede para comprar uma cópia ou virar patrocinador se você quiser apoiar. O que se recebe é byte por byte o mesmo programa. É o modelo "pague se quiser", e ele só funciona quando a ferramenta é boa o bastante para dar vontade.

![Definição de entidades: campos, enums, padrões e como cada entidade aparece no editor](/showcase/ldtk-2.jpg)

## Uma pessoa, milhares de commits

O histórico mostra o formato do projeto: mais de cinco anos, milhares de commits, dezenas de versões, e um código que continua andando — o último push foi em novembro de 2026.

É Haxe rodando no Electron, a mesma família de linguagem de Dead Cells. Menos coincidência e mais a constatação de que cada um constrói ferramentas com o que já domina.

A parte que mais vale ler é a seção de backup na home: diz, em resumo, que eles sabem que coisas ruins acontecem, que o LDtk mantém backups fortes e recupera alterações não salvas depois de um crash — não deveria crashar, mas o mundo não é perfeito. É uma atitude concreta em relação ao trabalho dos outros, do tipo que só escreve quem já perdeu trabalho.

![Tela inicial do LDtk 1.5 — a versão que estreou o logo atual e as ferramentas de layout de mundo](/showcase/ldtk-3.jpg)

## Por que está aqui

O LDtk não é um produto de IA, e esta biblioteca não reúne apenas produtos de IA. Ele está aqui porque é a outra metade da mesma pergunta: o que uma pessoa experiente, com boas ferramentas e nenhuma empresa atrás, publica hoje?

A resposta é uma ferramenta que remove um custo para todo mundo. Um editor de níveis decente são meses de trabalho que um desenvolvedor solo não pode pagar para construir nem pode deixar de ter. O LDtk zera esse custo, e continua publicando.
