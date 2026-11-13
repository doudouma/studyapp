---
summary: "Um jogo web 3D jogável criado com dois prompts e zero linhas de código escritas à mão — US$ 5,77 em chamadas ao modelo, quatro rodadas de revisão e nenhuma engine."
tags: [Gerado por IA, Jogo web, 3D, Apenas prompts, Detalhamento de custos]
facts:
  - key: author
    value: AYi (@AYi_AInotes)
  - key: platforms
    value: Web (meta CrazyGames) · minijogo do WeChat
  - key: models
    value: Fusion Max 2.0 (FUMO Lab)
  - key: cost
    value: US$ 5,77 · 17 chamadas
    highlight: true
  - key: same volume elsewhere
    value: ~US$ 14,92 com Claude Fable 5.1 / GPT-6 Astra
  - key: codebase
    value: 130 KB na primeira versão · 0 linhas editadas à mão
  - key: revisions
    value: 4 rodadas · 16 de 20 requisitos aceitos
  - key: status
    value: Jogável localmente · ainda não publicado
---

## Um gato, dois prompts, uma fatura

Um gato laranja fica sozinho em um apartamento com 90 segundos para destruí-lo: derrubar os móveis, quebrar a louça, juntar latas de ração e gastá-las em melhorias que liberam cômodos cada vez melhores. A primeira fase é um aluguel barato. A última é um museu.

O jogo é a demonstração. O número que vale ler é a fatura: dois prompts, 17 chamadas ao modelo, US$ 5,77 e nenhuma linha de código digitada à mão. O modelo foi o Fusion Max 2.0, da singapurense FUMO Lab, alcançado por um endpoint compatível com a OpenAI, então o mesmo ciclo roda no Cursor ou no Codex assim que você preenche uma base URL e uma chave.

## O primeiro prompt é uma especificação, não um pedido

Quase todo prompt de "faça um jogo para mim" falha porque não existe nada contra o que falhar. Este começa pedindo um documento de design, e o documento é julgado pelos critérios de avaliação do próprio CrazyGames: sessões de pelo menos 10 minutos, retenção no segundo dia entre 10% e 15%, jogável em três segundos, tudo gerado em código para não haver nenhum arquivo para baixar.

Essa mudança de enquadramento faz mais trabalho do que a escolha do modelo. As métricas de revisão de uma plataforma são uma especificação gratuita, e elas obrigam a montar o ciclo de que o jogo precisa — partidas curtas, melhorias, tarefas diárias, um motivo para voltar — antes de existir uma única linha de código. O documento saiu com cerca de 27 mil caracteres; a versão seguinte tinha uns 130 KB e funcionou de primeira.

## Quatro rodadas, dezesseis de vinte

Vieram quatro rodadas de revisão. Nelas foram levantados vinte requisitos e 16 confirmados; segundo o autor, os outros quatro precisavam de mais uma passada. Nenhuma correção foi escrita à mão, e é isso que vale registrar: cada rodada foi um prompt novo sobre a versão anterior, não uma sessão de depuração.

A última passada foi de arte, e é o único passo que sai do modelo. O gato provisório virou um modelo no Blender: um laranja malhado com 24 camadas de pelo.

## O que a comparação de custos mede de fato

US$ 5,77 por 17 chamadas. Com as tarifas do Claude Fable 5.1 ou do GPT-6 Astra, esse mesmo volume sai por cerca de US$ 14,92, uma razão de 2,6×. Ao longo de 100 protótipos a diferença fica perto de US$ 900.

O valor é real: é uma fatura medida, não uma estimativa. Por baixo dele há duas coisas. A primeira é que depende dos créditos de teste para contas novas e do preço promocional que o fornecedor pratica no momento, então é o custo desta tentativa hoje, não um preço unitário estável. A segunda é que o artigo traz um link de indicação para o fornecedor do modelo, o que transforma a comparação de US$ 14,92 em um cálculo do lado do vendedor, não em um parâmetro neutro.

Ainda assim, o argumento não depende da razão exata. O desenvolvedor solo anul agarwal fez em 2023 uma variação estilo Suika com ChatGPT que chegou a mais de 65 milhões de jogadores e rendeu mais de US$ 25 mil, e ele mesmo diz que foram mais de 120 protótipos e que os 100 primeiros quase não faturaram. Se uma tentativa custa US$ 5,77 em vez de US$ 15, esse caminho deixa de ser reservado a quem tem orçamento. Se custa US$ 5,77 e os 100 primeiros continuam sem faturar, o ciclo barato compra mais tentativas, não melhor pontaria.

## Nada disso foi publicado

O jogo continua na máquina do autor. Não foi enviado ao CrazyGames nem à plataforma de minijogos do WeChat, então não tem jogadores, nem impressões de anúncio, nem receita.

O que sobra é exatamente o que um modelo não resolve por você: o CrazyGames tem três linhas de revisão, os minijogos do WeChat vêm com exigências de registro, e nenhuma das duas é um problema de design. A conclusão do próprio autor é que a maioria dos jogos pequenos continua sem emplacar, por mais barato que tenha sido construí-los.

## O que se aproveita

> O ativo reutilizável aqui não é o jogo nem o modelo: é a ordem dos prompts. Escreva primeiro a especificação contra as métricas da plataforma e depois limite a iteração a um número fixo de rodadas, para que o custo por tentativa continue conhecido.

O resto é condicional. A vantagem de custo pressupõe um endpoint barato e uma construção pequena e autocontida. A arte continua precisando de uma pessoa e de uma ferramenta que não é um modelo de linguagem. E os dois prompts estão publicados na íntegra, que é a razão de o caso entrar na biblioteca: dá para rodar o fluxo na sua própria ideia em vez de aceitar a conclusão por confiança.
