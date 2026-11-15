---
name: Crumb Colony
summary: Uma pessoa, 30 ¥ e o Claude Code: um minijogo de WeChat que foi de 3,65 ¥ a 2002 ¥ por dia em três semanas.
tags: [Minijogo de WeChat, Claude Code, Desenvolvedor solo, Pixel art, Quebra-cabeça, Receita de anúncios]
facts:
  - key: ad revenue
    value: 2002 ¥ num dia · 2730 ¥ em 7 dias
    highlight: true
  - key: first ad day
    value: 3,65 ¥, 2002 ¥ três semanas depois
  - key: team
    value: 1 pessoa · conta individual, sem empresa
  - key: startup cost
    value: Certificação WeChat 30 ¥/ano · sem ISBN · sem registro de software
  - key: models
    value: Claude Code — código, testes com bots, envio de builds
  - key: port to WeChat
    value: Versão web portada em uma semana
  - key: review
    value: 2 rejeições, ambas de texto
  - key: discovery
    value: 57% da receita semanal veio da busca do WeChat
---

## Uma pessoa, três semanas: de 3,65 ¥ a 2002 ¥

Três semanas atrás, o primeiro dia de anúncios do Crumb Colony rendeu 3,65 ¥. Em 13 de novembro de 2026, o jogo faturou 2002,04 ¥ num único dia; 2730,44 ¥ nos últimos sete.

Foi feito por uma pessoa: conta individual no WeChat, sem empresa, sem compra de tráfego e com todo o código escrito pelo Claude Code. O jogo é um quebra-cabeça de ordenar cores: cada nível é uma ilustração em pixel art, você toca numa caixa de cor, solta uma colônia de formigas da mesma cor, e elas comem o quadro de fora para dentro e o levam para o formigueiro. Roda como minijogo de WeChat e no navegador. O autor, 本山德彪, escrevia código no Tencent e no Meituan; hoje constrói produtos por conta própria. Ele contou o caminho inteiro em sete passos: elegibilidade, cadastro, desenvolvimento, revisão, abertura do programa de anúncios, posicionamento e tráfego.

O que torna o texto útil não é «a IA consegue fazer jogos», mas como uma pessoa concreta levou uma coisa pequena até o fim: onde o dinheiro foi gasto, em que passo travou e quais decisões precisou tomar sozinho.

## Primeiro as contas: empresa, ISBN, processos

É a parte que mais lhe perguntam, e as respostas são concretas:

* **Qualquer pessoa consegue**: ele se registrou como pessoa física. Não precisa de empresa.
* **Sem ISBN**: enquanto o jogo só exibe anúncios e não tem compras dentro do app.
* **Processos, sim — dois**: primeiro o registro do minijogo, depois o do mini programa, ambos com reconhecimento facial. A versão para um jogador pode ir ao ar antes de concluir o processo; foi assim que ele publicou.
* **Sem registro de software**: nem a revisão, nem a publicação, nem o programa de anúncios pediram.
* **O único custo real é a certificação**: 30 ¥/ano para pessoa física, 300 ¥/ano para empresa. A plataforma retém os impostos no pagamento.
* **Um jogador primeiro**: rankings e duelos com amigos exigiriam passar para online, e isso obriga a concluir antes o registro do mini programa.

Duas decisões dizem muito. Ele queria chamar o jogo de 蚂蚁搬家 («formigas que mudam de casa»), o nome estava ocupado, e ficou 蚂蚁搬画 («formigas que carregam quadros»): o nome também é o termo que os jogadores vão buscar, então precisa ser curto e fácil de achar. E escolheu um jogador primeiro em vez de deixar um ranking arrastar o lançamento para uma fila de processos. A certificação de 30 ¥ se pagou na primeira semana de anúncios.

## A IA escreve o código; a pessoa fica com a diversão

A versão web dele passou para o WeChat em cerca de uma semana. A lista de tarefas da IA é bem específica:

* escrever código e corrigir bugs;
* escrever alguns «jogadores bot» que jogam cada nível dentro do jogo real, estimam que porcentagem de pessoas consegue vencer, reajustam quando a dificuldade falha e testam de novo;
* percorrer todo o fluxo após cada mudança — início, fase concluída, derrota, vídeo recompensado, compartilhamento — com mais de cem verificações que precisam passar;
* empacotar e enviar pela linha de comando do WeChat DevTools, para a build de desenvolvimento aparecer sozinha no painel.

A pessoa continua clicando em «enviar para revisão» e «publicar». É a divisão que ele repete: a IA entrega um resultado verificável; a pessoa decide.

A diversão é onde ele mais investiu tempo. Uma mecânica cansa depois de algumas dezenas de níveis, então cada capítulo troca o cenário cotidiano e adiciona uma mecânica que só existe ali: no capítulo de inverno a neve cai e cobre o tabuleiro, no de Ano-Novo há fogos pendurados na imagem. As regras de design soam como regras de produto, não de funcionalidade: alternar ajuda e obstáculo; amarrar a mecânica ao cenário; explicar com um cartão na primeira aparição; se o jogador perde, mostrar como; fazer a explosão valer a pena e não arrastar o final.

## Dificuldade é uma frase, não um número

Cada nível ganha uma frase de «sacada»: o que o jogador vai dizer quando entender. Se não consegue escrever essa frase, o nível depende de sorte ou de empilhar dificuldade, e é refeito.

A dificuldade vai em ondas: um nível difícil a cada poucos, seguido de um fácil. O primeiro é curto; o segundo já pede raciocínio. Os bots testam antes do lançamento e os jogadores reais depois — o painel mostrou que muita gente nova desistia antes do nível cinco, então ele encurtou o primeiro nível. A dificuldade dos bots e a humana muitas vezes não batem, e os dados reais decidem.

Tudo isso vive num documento de «padrões de nível». A IA revisa cada capítulo novo contra ele antes de publicar, e uma regra falha significa que o capítulo não sai. O jogo tem hoje 440 níveis em 22 capítulos; esse documento é a única coisa que impede os últimos de virarem recheio.

## Duas rejeições, nenhuma por código

O formulário de revisão pede mais material do que o código: relatório de autoavaliação, descrição das cenas principais, explicação da jogabilidade, design de sistemas, contexto e tema, e pelo menos três capturas tiradas dentro do WeChat, com o botão cápsula e o nome do jogo visíveis.

O jogo voltou duas vezes:

1. Texto em inglês na interface — o nome em inglês na capa, legendas em inglês nas janelas — tudo trocado para chinês.
2. Um título de capa pouco caprichado: ficou exatamente 蚂蚁搬画, caractere por caractere o nome registrado.

A conclusão dele é uma frase: onde o nome aparecer no jogo, use o nome registrado, sem inglês e sem subtítulo. As duas correções eram triviais; o que custaram foi tempo de lançamento, não engenharia.

## Anúncios só onde o jogador trava

Em 13 de novembro, o vídeo recompensado gerou 90,6% da receita e os intersticiais 1,9%. O jogador médio escolheu ver cerca de sete vídeos recompensados naquele dia. Os intersticiais tiveram mais ou menos as mesmas impressões que os banners e renderam o mínimo: a maioria fecha o jogo quando um aparece.

As três regras dele:

* **Colocar o vídeo recompensado onde faz falta**: travado, sem itens, querendo uma dica. Não na entrada da fase, antes de qualquer coisa dar errado.
* **Não dar itens de graça**: quanto mais você dá, menos vídeos a pessoa assiste. Cada item começa com um e nunca é reposto sozinho.
* **Apertar os intersticiais**: só quando o jogador parou, como ao voltar ao menu; nunca nos primeiros 15 níveis; nunca em «próximo» ou «tentar de novo». Banners ficam no rodapé da tela de resultado e em nenhum outro lugar da fase.

O design de anúncios molda o jogo de volta. Viver só de anúncios significa que o vídeo recompensado é o negócio, então o design precisa deixar espaço para momentos em que o jogador trava e pode receber uma saída: voltar o tabuleiro ou tentar outro resgate.

## Tráfego: um empurrão de jogo novo e um nome que se busca

Ele não gastou nada em aquisição. O que usou:

* **O empurrão para jogos novos**: o WeChat dá uma janela de recomendação nos 90 dias após o primeiro lançamento. Ele abriu e os usuários cresceram 10 vezes. Só existe uma, então recomenda guardá-la até o jogo estar polido.
* **Adicionar aos Meus Mini Programas**: quem chega por recomendação esquece você ao sair. Ele fez um cartão com uma seta para o «···» no canto superior direito.
* **Cartões de compartilhamento**: compartilhar uma fase coloca o amigo direto nela, não na primeira.
* **Um nome buscável**: o painel separa a receita por origem; 57% da última semana veio da busca. Um bom nome é como as pessoas encontram você.
* **Um diário público**: ele posta todo dia «dia N de anúncios no meu minijogo» no X, transforma as perguntas das respostas em artigos para contas oficiais do WeChat, Zhihu e Juejin, e depois grava com a própria voz para canais, Bilibili e Douyin.

O último item é o volante: receita pública traz perguntas, perguntas viram artigos, artigos trazem tráfego de busca e jogadores novos.

## Para quem é esse caminho

> **Recomendação principal**
> Copie o processo, não o golpe de sorte. Entre 3,65 ¥ e 2002 ¥ há três semanas, 440 níveis, dois processos, duas rejeições e um documento de padrões. Serve para quem vai construir em público, aguentar a papelada e tratar a IA como equipe de engenharia, não como máquina de desejos; não serve para quem busca renda passiva nem para quem não quer repetir fases no celular até a dificuldade ficar boa. Se começar, siga os sete passos dele — mas faça duas coisas antes: confira se o nome está livre e publique a versão de um jogador.

O mesmo print pode ser lido de duas maneiras. Uma é incentivo: uma pessoa consegue e custa 30 ¥ para começar. A outra é viés de sobrevivência: ninguém compartilhou o dia de 3,65 ¥. Sobre a IA, nenhuma das duas rejeições mencionou a cadeia de ferramentas, mas critérios de revisão e limites do programa de anúncios mudam (quando ele abriu, o limite era 500 visitantes; hoje é 100), então um caminho que funciona hoje não necessariamente funciona igual amanhã. Ele não foge disso: a receita é pública, os números são públicos, e até o erro — uma primeira fase longa demais — entrou no artigo.
