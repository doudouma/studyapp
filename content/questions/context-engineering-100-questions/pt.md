---
title: 100 perguntas sobre Context Engineering
summary: Do context rot e do orçamento de atenção à montagem da janela, compactação e cache, design de instruções, custo e avaliação de qualidade — 100 perguntas para aplicar engenharia de contexto na prática.
tags: [Context Engineering, Engenharia de contexto, Agentes de IA, LLM, Guia temático]
author: 100mini Editorial
publishedAt: 2026-11-02
updatedAt: 2026-11-02
questionCount: 100
chapterCount: 6
facts:
  - key: Autor
    value: 100mini Editorial
  - key: Perguntas
    value: 100
    highlight: true
  - key: Capítulos
    value: 6
  - key: Tema
    value: Context Engineering / janela de contexto
  - key: Para quem
    value: Engenheiros de IA / desenvolvedores de agentes / produto e dados
  - key: Atualizado
    value: 2026-11-02
---

## Prefácio

Este é um guia de «100 perguntas»: uma forma de dividir um tema grande em perguntas e lê-lo uma por uma.

Engenharia de contexto não é escrever uma frase de prompt melhor. É decidir, antes de cada inferência, qual pequeno conjunto de tokens montar a partir de documentos, ferramentas, memória e histórico para maximizar a chance de sucesso. Também é uma disciplina de custo: cada token na janela dilui a atenção e entra na conta.

O guia segue seis etapas: por que uma janela mais cheia fica mais burra, o que merece entrar, como evitar que sessões longas terminem mal, como as instruções sobrevivem, onde o dinheiro vai e como verificar a qualidade.

**Respostas rápidas**

- A janela é uma bancada, não um armazém: acertar importa mais do que acumular.
- Primeiro correção e completude; informação errada é pior que ausente.
- Melhor limitar do que reescrever, e limpar antes de forçar compactação; o cache odeia mudanças de prefixo.
- Restrições críticas vão em arquivos do projeto, não só na conversa.
- Nenhuma técnica tem valor universal: só «subiu minha avaliação?».

> Compilado a partir de material sobre Context Engineering e fontes públicas, reestruturado e editado para este site.

> Esta é uma edição editada: alguns trechos originais estavam truncados por OCR, então o corpo prioriza uma lista de perguntas acionável com respostas concisas.

## 1. Por que uma janela maior fica mais burra

### 1. Por que encher a janela deixa o modelo mais burro?

É o context rot: quanto mais tokens na janela, pior o modelo recupera informação com precisão. Um estudo controlado com 18 modelos encontrou a mesma direção: nenhum manteve a pontuação com a entrada crescendo.

A causa é o orçamento de atenção. O transformer relaciona cada par de tokens, então n tokens criam n² relações; uma janela mais cheia espalha pior o orçamento. A degradação é gradual, não um penhasco, mas a precisão de recuperação e o raciocínio longo caem.

### 2. O teste da agulha é perfeito, por que tarefas reais falham?

Porque «agulha no palheiro» mede correspondência lexical, não compreensão semântica. Em tarefas reais, pergunta e resposta muitas vezes não compartilham palavras-chave, e o modelo precisa separar material relacionado que não responde.

Teste três coisas: achar o fato, achar com a pergunta reformulada e achar com distratores. Testar só a primeira superestima o modelo.

### 3. Por que a informação no meio é a mais esquecida?

A atenção tem forma de U: forte no início (primazia), forte no fim (recência), fraca no centro. Em experimentos com vários documentos, um fato no meio de 20–30 documentos ficou abaixo do baseline sem documento nenhum.

Então documentos longos no topo e a pergunta no fim; além de uns 20 documentos, adicionar mais rende muito pouco.

### 4. Por que a colocação importa mais do que apenas estar na janela?

Informação presente mas enterrada não é muito melhor que ausente. Com a mesma agulha e o mesmo comprimento, mudar similaridade semântica, distratores e estrutura do palheiro move bastante a pontuação.

Faça três coisas: separe com títulos ou tags XML; dê seções distintas a instruções, contexto e documentação de ferramentas; use exemplos representativos, não listas de casos extremos.

### 5. Por que um chat longo fica caótico e quase nunca se recupera?

O modelo tira conclusões cedo e depois gira em torno de uma conclusão possivelmente errada. Em testes multi-turno, dividir uma tarefa derrubou o desempenho em 39% na média, inclusive em modelos fortes.

Se vir duas de três sinais —contradiz a si mesmo, repete uma ação falha, ignora novas instruções—, pare de remendar. Escreva as conclusões confirmadas em arquivo e reinicie numa janela limpa.

### 6. Por que contexto embaralhado pode superar contexto coerente?

É contraintuitivo, mas reproduzível: embaralhar o palheiro melhorou a recuperação em 18 modelos e muitas faixas de comprimento. A prosa coerente tem seu próprio fluxo e a agulha inserida parece fora de lugar; o texto embaralhado não tem fluxo a quebrar.

Não envie prompts embaralhados, mas aproveite as três alavancas positivas: reduzir volume, aumentar similaridade agulha-pergunta e cortar distratores.

### 7. Como distingo os quatro modos de falha: envenenamento, distração, confusão e choque?

Envenenamento é uma alucinação que entra na janela e passa a ser citada. Distração é uma janela longa fazendo o modelo repetir histórico em vez de agir. Confusão é material extra desviando a resposta. Choque é informação velha e nova se contradizendo.

Triagem do mais confirmável: procure envenenamento, depois choques, remova material para ver se a confusão passa e só então culpe o tamanho.

### 8. Por que a atenção é um orçamento que encolhe a cada token?

Cada token adicionado dilui as relações de atenção entre todos os tokens. Dobrar a entrada quadruplica os pares: essa é a forma matemática do retorno decrescente.

Gerencie com duas regras: adicione algo apagando outra coisa; e ponha limite fixo em itens residentes, como system prompt e definições de ferramentas.

### 9. Como sei se o agente ficou burro pelo modelo ou pelo contexto?

Na prática, a maioria das falhas é de contexto. Faça três verificações: reordene o contexto à mão e veja se o desempenho volta; confirme se as instruções foram carregadas; compare com os sintomas clássicos de falha de contexto.

Só se as três estiverem limpas suspeite do modelo. Trocar antes só dá outro modelo que o mesmo contexto pode derrubar.

### 10. Como o modelo informa quanto espaço resta na janela?

APIs recentes do Claude injetam orçamento e lembrete de espaço restante: context awareness. Assim o modelo planeja com o espaço real em vez de adivinhar quando parar.

Para dados quantitativos, leia os campos de usage, não analise essas tags. Se seu harness compacta automaticamente, avise o modelo para não parar antes.

### 11. Como meço à mão a janela utilizável do meu modelo?

Use pelo menos cinco níveis de comprimento, de alguns milhares de tokens até perto do limite anunciado, mudando só o comprimento e mantendo a dificuldade. Use agulhas semânticas, não literais, e teste uma e várias agulhas.

Meça o ponto de entrada que você realmente usa: camada de API ou assinatura pode diferir da página de marketing.

### 12. Por que o mesmo modelo se comporta diferente em outro host?

O modelo é fixo, mas o host decide o que é montado antes de cada inferência, como o histórico é truncado e quais ferramentas são anexadas. O mesmo modelo pode render muito diferente no Cursor e no Claude Code.

Antes de culpar o modelo, revise o ensamblaje do host: tamanho do system prompt, número de ferramentas, truncamento do histórico e se as regras do projeto são carregadas.

### 13. Qual a diferença entre uma janela de 1M anunciada e uma utilizável?

Quatro camadas: nominal, capacidade, recuperabilidade e alcance de raciocínio. Comprar a janela só dá a primeira; o sucesso geralmente depende das duas últimas.

Cada camada é menor que a anterior. Capacidade se consulta em documentação e contagem de tokens; recuperabilidade e raciocínio se medem com seus documentos.

### 14. Engenharia de prompt morreu ou é marketing de ansiedade?

Não morreu: foi absorvida. Continua sendo um subconjunto da engenharia de contexto. Escrever bem uma instrução de um turno sempre serve, mas não basta para sessões longas com muitas ferramentas.

A narrativa de «morta» é sobretudo marketing de conflito. Não escolha lado: corrija a camada para onde seus erros apontam.

### 15. Por que engenharia de contexto é engenharia e não rebranding?

Porque tem modos de falha do mundo real para combater. Falhas de LLM se parecem mais com engenharia física do que com software: tolerâncias, incerteza e materiais cuja resistência não se conhece por completo.

Você pode chamar de engenharia quando sabe dizer sua taxa de falha atual, os números antes e depois de uma mudança e por que funciona. Até lá, ainda está lançando feitiços.

### 16. Como um tuíte fez a engenharia de contexto viralizar?

O caminho foi curto: Tobi Lütke disse preferir o termo, Karpathy ampliou e listou descrição de tarefa, exemplos, RAG, ferramentas, estado, histórico e compactação; depois Hacker News e Simon Willison deram uma definição pública grudenta.

O termo é um contêiner; a carga real é aquela lista de sete itens, que corresponde aos seis capítulos deste guia.

## 2. O que merece entrar na janela

### 17. Por que «o menor conjunto de tokens de alto sinal» é o único princípio universal?

As outras técnicas têm limites: recuperação serve quando o conhecimento está fora, memória quando cruza sessões, compactação quando a sessão é longa demais. Só «pouco e de alto sinal» vale em todo lugar.

Os dois qualificadores importam: alto sinal significa que cada token contribui para o raciocínio; mínimo significa que contribuir não basta, precisa valer o espaço. Uma janela de 200K cheia de 190K irrelevantes perde para 20K relevantes.

### 18. Por que recuperar antes de responder vence a enfiar tudo?

Enfiar tudo incentiva a preguiça: com a pilha dentro, o modelo para de procurar. A recuperação just-in-time deixa só identificadores leves —caminhos, consultas, links— e lê o conteúdo quando necessário.

O padrão prático é híbrido: pré-carregar conhecimento estático estável e deixar o agente buscar detalhes dinâmicos.

### 19. Por que o RAG não morreu, só o RAG preguiçoso?

O que morreu foi a implementação superficial: chunks aleatórios, top-5 vetorial, enfiar no prompt, rezar. O núcleo da recuperação —dar a informação certa na hora certa— continua necessário.

Contexto longo não o encerrou. Conhecimento empresarial é disperso, vencido, com permissões, versões e contradições; uma janela maior só dá mais espaço, não responde o que deve entrar. Arrume o chunking, mantenha BM25, adicione reranking e crie um conjunto de avaliação.

### 20. Qual o nível de detalhe certo para um system prompt?

A escala é «right altitude»: baixo demais e a lógica rígida quebra em casos extremos; alto demais e o modelo não recebe sinal concreto e adivinha. O ponto certo guia o comportamento sem fechar a porta a heurísticas.

Uma estrutura útil é Identity, Instructions, Examples, Context. Comece com o prompt mínimo e acrescente uma regra por falha observada.

### 21. Como dar exemplos few-shot sem desperdiçar a janela?

Comece com 3–5, relevantes, diversos e representativos de casos padrão, envoltos em `<example>` e separados das instruções. Exemplos são âncoras de comportamento, não documentação.

São conteúdo estável: coloque no prefixo cacheado e o custo marginal cai muito. Se espalhar e mudar a cada turno, paga preço cheio sempre.

### 22. Em que ordem vários documentos devem entrar na janela?

Documentos longos no topo, pergunta no fim. Em tarefas complexas com vários documentos, mover a consulta para o fim pode melhorar a qualidade em até 30% —um teto, não garantia—.

Envolva cada documento em `<document>` com metadados de origem; em tarefas longas, faça o modelo citar primeiro os trechos relevantes e responder a partir das citações.

### 23. O que deve ficar na janela e o que deve ir para arquivos?

O que o raciocínio deste turno precisa fica; o «talvez sirva depois» vai para disco. Arquivos são a persistência, a janela é a bancada.

Escreva notas de pesquisa, planos e progresso em arquivos; antes de encerrar uma sessão, coloque as decisões-chave em arquivos do projeto para a próxima continuar dali.

### 24. Como escolho entre tantos sistemas de memória?

Não há ranking, só encaixe por cenário. Grafos temporais servem para fatos que mudam e precisam de rastreabilidade; o modelo tipo SO para agentes com estado de longa duração; perfis SQL são baratos e auditáveis; armazenamento literal com filtros de metadados costuma empatar ou superar a extração.

A virada clara de 2026 é a anti-extração: nem toda escrita de memória merece uma chamada ao modelo.

### 25. Quando instalar um sistema de memória é desperdício de dinheiro?

Três sinais: a tarefa nunca cruza sessões; o que precisa lembrar cabe em uma página; e as regras de projeto e a memória automática integradas nem sequer são usadas.

Muitas vezes basta algo leve, como um NOTES.md mantido pelo agente ou uma linha nas regras do projeto para reler o plano após compactar.

### 26. Por que CLAUDE.md e memória automática são canais separados?

A fronteira é a autoria: CLAUDE.md é o que você escreve para o modelo; a memória automática é o que o modelo escreve para si. A primeira guarda instruções e regras revisadas; a segunda, lições e preferências aprendidas com correções.

Separar mantém ambos auditáveis: suas regras não são reescritas em silêncio e as suposições do modelo não se passam pelas suas decisões.

### 27. Como escrever definições de ferramentas sem estourar a janela?

As definições ocupam a janela em todo turno e não somem ao compactar o histórico. Primeiro funda ferramentas sobrepostas e mantenha saídas intermediárias fora da janela.

Depois adicione formatos de resposta, paginação, escopo, filtros e truncamento. Nunca deixe uma única resposta de ferramenta despejar saída sem limite.

### 28. Ferramentas MCP demais estouram a janela: como tirá-las da conversa principal?

Três caminhos: dar a um subagente sua própria lista de ferramentas permitidas para o trabalho sujo ficar na janela dele; transformar definições em arquivos carregados sob demanda; e consolidar antes de mover.

A questão não é «usar menos servidores MCP», mas não manter dezenas de definições residentes na conversa principal. Muitos times carecem de consolidação, não de ferramentas.

### 29. A busca devolve coisas que não respondem: como tratar «no tema mas sem resposta»?

São distratores: relacionados ao tema, mas sem responder. Não são ruído neutro; interferem ativamente, e o dano cresce com o comprimento da entrada.

Corrija em três passos: veja se o chunking separou a resposta; adicione recuperação híbrida e mantenha BM25; adicione reranking para ir de top-30 aos top-5 que realmente respondem.

### 30. Como definir um orçamento de janela para cada coisa entrar por cota?

Quatro níveis: fixo (restrições do sistema e objetivo atual), recortável (contexto recuperado e resultados antigos de ferramentas), dobrável (histórico inicial) e por fase (ferramentas, esquemas e exemplos só desta fase).

A cada turno execute uma montagem: carregar restrições, extrair objetivo, recuperar evidência, recordar memória, escolher ferramentas, comprimir histórico, ordenar por relevância e truncar ao orçamento.

### 31. Com o contexto certo, um modelo comum pode vencer?

O contexto certo é o que permite um modelo comum competir, mas não garante vitória. Contexto resolve «saber»; não resolve «verificar».

Com pedido, garantia, ticket e ferramentas completos, um modelo médio pode produzir um plano de troca. Mas respostas bonitas com erros fundamentais ainda aparecem, então a camada de avaliação e verificação é obrigatória.

### 32. Por que quem diz «RAG is dead» se entrega?

Porque costuma assumir que o conhecimento empresarial é um documento limpo que cabe inteiro na janela. Quem já rodou produção sabe que é disperso, vencido, com permissões, versões e contradições; a solução é selecionar, não ampliar.

RAG ruim é pior que nenhum porque cria ilusão de fundamento. O que deve morrer é a implementação superficial, não a recuperação.

### 33. Uma biblioteca inteira ou 2.000 tokens precisos?

A parte da janela que participa da inferência atual é o working set. Tenha o modelo 200K ou 1M, o working set enche de resultados antigos no mesmo ritmo; uma janela maior só afasta a parede.

A biblioteca fica fora da janela; dentro, só a fatia da tarefa atual. O teste continua: remova este token e o raciocínio deste turno sofre?

### 34. Por que contexto errado assusta mais que nenhum?

Porque informação errada supera a ausente, e a ausente supera o ruído. O modelo consegue escrever prosa fluente e confiante a partir de contexto ruim; fluência e fundamento factual são mecanismos diferentes.

O pior é a pseudoconclusão: resposta fluente, pertinente e educada que ignora em silêncio uma restrição definida dez turnos antes. O último passo da montagem sempre pergunta quanto custaria colocar algo errado.

## 3. Como evitar que sessões longas terminem mal

### 35. Quando a compactação dispara e quem decide?

Claude Code compacta por padrão no limite do modelo: na janela de 1M do Sonnet 5, por volta de 967K tokens. Você pode antecipar, entre 100K e 1M, com `/autocompact` ou variável de ambiente.

A via API é outra: compactação no servidor usa parâmetro beta, padrão de cerca de 150K tokens, configurável até 50K. Não misture as duas cifras.

### 36. Por que a compactação é inerentemente lossy e descarta o mais importante?

Resumidores guardam a ideia principal e descartam o resto. Num experimento, 3/3 fatos principais sobreviveram e 0/3 números obscuros do apêndice sumiram. Uma regra como «chame sempre a API ao vivo, nunca leia o cache» soa como conversa fiada para um resumidor.

A disciplina é simples: o que você não pode perder não deve esperar na conversa pelo resumo. Coloque em arquivo do projeto ou nomeie explicitamente na instrução de compactação.

### 37. Por que mais compactações deixam a sessão mais doente?

Cada passada manda toda a conversa por um tubo com perdas; detalhes do resumo anterior se perdem de novo. A perda multiplica em vez de somar, e uma janela pior produz o próximo resumo pior.

Em testes, um preset de compactação marcou 38% nas sondas de memória contra 92% sem fazer nada. Compactação é primeiros socorros, não cura: se após duas rodadas a sessão continua confusa, reinicie.

### 38. Quando é verdade que «não fazer nada» supera compactar?

Quando o preço do cache é baixo e a sessão ainda é gerenciável, manter o histórico completo pode ser mais barato que qualquer reescrita, porque reescrever o prefixo invalida o desconto.

Não é universal: suba o preço do cache ou alongue a sessão e a conclusão inverte. Veja seu preço e número de turnos antes de decidir.

### 39. Como evitar que uma sessão longa chegue a uma compactação catastrófica?

Não espere 95% de uso. Quanto mais cheia a janela, mais apertada a chamada de resumo, mais curto e quebrado o resultado, e pode surgir «ansiedade de contexto» perto do limite.

As linhas práticas ficam entre 40% e 75%: compacte antes, com foco, ou use `/autocompact 500k` para baixar a linha automática.

### 40. /compact, /clear ou janela nova: qual usar?

`/compact` para continuidade, `/clear` para começar do zero e «arquivo de handoff + janela nova» para trocar de tarefa. Uma sessão contaminada por suposições erradas é mais barata de limpar que de resgatar.

Linha vermelha: `/clear` apaga o histórico para sempre. Antes de apertar, garanta que tudo que vale a pena saiu da janela.

### 41. Como escrever uma instrução de compactação direcionada que mantenha o que quero?

Depois de `/compact`, diga em linguagem simples o que manter e o que descartar, nomeando substantivos concretos. «Mantenha os passos e a conclusão do conserto do erro 401» supera «mantenha o processo de conserto».

Não deixe a instrução fina demais: convenções de formato, restrições-chave e próximos passos precisam ser nomeados. A compactação automática adivinha a importância geral; você não pode se dar ao luxo de adivinhar.

### 42. Depois da compactação o nome do plano fica, mas o conteúdo some: como evitar?

Ferida comum: o nome do arquivo do plano continua no contexto, o conteúdo não, e o modelo não pensa em ler. Metadados presentes, corpo perdido: a forma clássica de uma lesão de compactação.

Três defesas: ponha restrições críticas no CLAUDE.md raiz do projeto; faça a primeira instrução pós-compactação reler o plano; ou use um hook SessionStart que injete o conteúdo automaticamente.

### 43. Como escrever um documento de handoff para continuar sem atrito?

Cinco seções, nenhuma vazia: intenção da sessão, arquivos alterados, decisões-chave, objetivos ativos e próximo passo. Um modelo estruturado funciona como checklist obrigatória e deixa menos espaço para perda silenciosa que a narrativa livre.

O único teste de aceitação: alguém que não estava na sessão —incluindo a próxima instância do modelo— consegue começar a trabalhar sem pedir contexto.

### 44. Compactação, limpeza e memória podem rodar juntas?

Sim; dividem o trabalho como um sistema operacional. A limpeza cuida de resultados antigos de ferramentas dentro da janela, a compactação da janela inteira e a memória do estado entre sessões. Cada uma trata um crescimento diferente.

Adicione a ferramenta de memória à lista de exclusão da limpeza, ou memórias recém-escritas podem ser apagadas. Separe os limites de disparo para não atirarem juntos.

### 45. A saída de ferramentas inunda a janela: como limitar sem quebrar o cache?

Distinga limitar de resumir. Um teto encurta o prefixo sem mudar bytes, então o cache continua acertando; um resumo reescreve o prefixo, invalida o cache e faz você pagar preço cheio pelos tokens economizados.

Então encolha o contexto, não o reescreva. Ao limpar resultados antigos, limpe o suficiente de uma vez para a reconstrução do cache valer a pena.

### 46. A sessão está lenta e cara: como verificar se o contexto apodreceu?

Primeiro olhe a conta. `/context` mostra o que há na janela, `/usage` mostra para onde vão dinheiro e limites, `/cost` mostra o total da sessão.

Se os números parecem normais mas o comportamento começa a repetir, se contradizer ou ignorar instruções, o contexto apodreceu. Use a pergunta 48 para escolher resgate ou reinício.

### 47. A compactação travou num erro: qual o primeiro socorro?

Não lute contra. Pressione Ctrl+C, reinicie o processo, faça `/resume` da sessão e depois `/compact`. A sequência funciona porque descarta o estado ruim que cresce no cliente.

Se uma versão nova ainda falhar, abra um issue com o número da versão. A causa costuma ser a própria requisição de compactação já não caber na sessão.

### 48. Como decidir entre resgatar a sessão ou reiniciar?

Três perguntas: o erro é transitório —sair e voltar resolve, resgate?; veio um resumo mas `/context` não caiu —falso sucesso, sem resgate?; as decisões pendentes foram escritas em arquivo? —então reiniciar não custa nada.

Uma sessão contaminada por suposições erradas reinicia mais barato do que se resgata. Sessões são consumíveis; não se apegue.

### 49. Como implementar memória externa: arquivos SQLite ou banco vetorial?

A maioria não precisa de banco vetorial. Comece com a ferramenta de memória integrada: o modelo chama view, create, replace, insert, delete e rename num backend de arquivos que você controla, legível, diffável e versionável.

Se realmente houver histórico massivo entre sessões, adicione SQLite e recuperação vetorial. Trate a janela como memória e os arquivos como disco, paginando só o necessário.

### 50. Com agentes concorrentes, como isolar o contexto para não se contaminarem?

Coloque o trabalho em janelas de subagentes: contexto independente, system prompt independente, lista de ferramentas independente. Leituras grandes ficam no subagente e só conclusões voltam.

Isolar janelas não basta; isole também as descrições de tarefa. Cada subagente precisa de objetivo, formato de saída, ferramentas disponíveis e limites, ou duplicará trabalho ou irá na direção errada.

### 51. Um bug de compactação levou oito meses para ser corrigido: o que aconteceu?

O erro era um loop: o aviso dizia «contexto baixo, rode /compact», mas a compactação respondia «conversa longa demais». Usuários se auto-resgatavam saindo, entrando, retomando e compactando. A correção foi anunciada mais de uma vez, regrediu, e só a v2.1.85 tratou de verdade requisições de compactação grandes demais.

Lição: a primeira cena do crime é o issue tracker, o auto-resgate precede a correção e «corrigido» deve ser ancorado a uma versão, não a uma linha do changelog.

### 52. Por que falso sucesso de compactação é pior que um crash?

Uma falha dura mostra erro e você sabe voltar. O falso sucesso devolve um «resumo mínimo de handoff» sem erro enquanto a janela não encolhe e a sessão continua travada no limite.

A única defesa é inspecionar a mercadoria: após compactar, olhe `/context`. Se o número não caiu, trate como falso sucesso e reinicie a partir de um handoff escrito.

### 53. Como um erro de compactação fez contas reais errarem 12 vezes?

A regra estava escrita: posições devem vir da API ao vivo, nunca do cache. Após compactar, o modelo esqueceu, pegou um atalho por um arquivo de cache de três dias atrás e reportou posições de BTC com erro de 12x.

O ponto não é o 12x, mas que «o arquivo existe» não significa «a regra está na janela». Ponha restrições de dinheiro e dados no arquivo raiz e faça o modelo repeti-las após compactar.

### 54. Que ferramentas externas cresceram em torno de sessões que a compactação não salva?

Três padrões: limpar antes de compactar, cortando leituras duplicadas e saídas enormes; interceptar aos 65% de uso e forçar um handoff estruturado para outra janela; e mover o contexto para uma camada proxy com SQLite e vetores.

Nenhuma é certificada, mas três ideias são grátis: linha de aviso de uso, arquivo de handoff estruturado e trocar de janela em vez de apostar na compactação.

## 4. Como escrever instruções que não são ignoradas

### 55. Quantas linhas deve ter o CLAUDE.md e o que acontece se passar?

Mantenha um único arquivo abaixo de 200 linhas. Passar não dá erro, mas consome mais contexto e reduz a adesão; acima de 4 MiB, o Claude Code ignora o arquivo por completo.

Dividir com `@import` não ajuda: arquivos importados entram inteiros na janela. Mova regras de escopo para `.claude/rules/` com cabeçalho `paths`, ou apague o que o modelo infere do código.

### 56. Por que regras escritas no CLAUDE.md são frequentemente ignoradas?

Duas causas: o CLAUDE.md é injetado como mensagem de usuário depois do system prompt, não dentro dele, então adesão estrita não é garantida; e regras antigas e novas em conflito deixam o modelo escolher uma ao acaso.

Rode `/context` para confirmar que o arquivo aparece em Memory files e transforme regras vagas em ações verificáveis. Regras que devem disparar em momentos fixos vão em hooks ou permissões, não em prosa.

### 57. CLAUDE.md, rules, AGENTS.md: quem manda?

Não há hierarquia dura automática. Todos são contexto: o CLAUDE.md raiz tem a influência mais ampla, rules com `paths` carregam só para arquivos correspondentes e AGENTS.md é convenção entre ferramentas cuja leitura depende do host.

Em conflito, o escopo mais específico e a instrução mais explícita costumam vencer, mas o conflito em si reduz a adesão. Mantenha uma fonte única de verdade e ponha restrições duras em hooks ou permissões.

### 58. Onde colocar instruções-chave num contexto longo para não diluírem?

Documentos longos no topo, pergunta no fim. A atenção é máxima no início e no fim e fraca no centro; quanto mais material, mais uma instrução central se dilui.

Divida a entrada multi-documento com tags e fontes, e faça o modelo citar antes de responder. Racione também o material: além de uns vinte documentos, adicionar rende pouco.

### 59. Que palavras de um system prompt são desperdício e quais são ouro?

Dois extremos desperdiçam espaço: dezenas de linhas de if-else que quebram em casos não vistos, e um vago «você é um assistente útil» que não dá nada para decidir.

Ouro são registros de armadilhas, justificativa de design e qualquer convenção diferente do comportamento padrão. Estruturas de diretórios e listas de dependências que o modelo infere do código são ruído.

### 60. Por que subtrair dos prompts antigos após atualizar o modelo?

Modelos novos seguem melhor instruções, então truques antigos passam de seguro a ruído: prefill, maiúsculas ameaçadoras, passos detalhados demais e autoverificações repetidas consomem atenção e podem fazer o modelo agir quando deveria perguntar.

Apague em vez de reescrever: remova ameaças e autoverificações ineficazes, mantenha restrições de domínio, critérios de aceitação e exemplos realmente úteis.

### 61. O prefill foi proibido: o que usar agora para controlar formato?

Use Structured Outputs para restringir o esquema, ou defina uma ferramenta com campos enum para que «saída» seja uma chamada de ferramenta. Para remover preâmbulos, diga isso no system prompt.

Para continuar uma resposta truncada, ponha o texto na mensagem do usuário e indique onde parou. Para evitar recusas, formule bem o pedido em vez de depender de um início prefabricado.

### 62. Onde colocar o ponto de cache para economizar em todo turno?

No último bloco que permanece idêntico entre requisições. Se qualquer bloco anterior mudar, o hash do prefixo muda e o próximo turno recalcula tudo.

O antipadrão clássico é um timestamp: coloque uma hora com segundos no início do system prompt e ela muda a cada segundo, então você paga preço cheio sempre.

### 63. Por que mudar uma definição de ferramenta invalida todo o cache?

Caches são julgados por prefixos em camadas: tools → system → messages. Uma mudança invalida essa camada e todas as seguintes. Ferramentas vêm primeiro, então uma palavra alterada explode as três.

Trate definições como artefatos de compilação: congele durante a sessão. Se precisar mudar, aceite «mudar uma vez, explodir uma vez, recarregar uma vez», preferencialmente entre sessões.

### 64. Como ordenar prompts multi-turno para aproveitar o cache ao máximo?

Ponha conteúdo estático primeiro na ordem tools → system → messages. Valores por requisição —timestamps, IDs aleatórios, a data— vão no fim do fluxo de mensagens.

Mantenha o histórico só-acrescentar: não edite mensagens antigas e adicione instruções no meio da conversa como mensagem system, não alterando o campo system superior. Revise os campos de cache no usage a cada turno.

### 65. Como escolher exemplos que devolvem seu custo em tokens?

Três critérios: relevantes para casos reais, diversos para cobrir limites sem ensinar padrões falsos e estruturados com `<example>`, separados das instruções.

Se estiver em dúvida, peça ao modelo para pontuar candidatos por relevância e diversidade e depois decida à mão. Exemplos são conteúdo estável: coloque no prefixo cacheado.

### 66. Como montar um fluxo multi-janela e por que é melhor que forçar uma só?

Divida o trabalho: a primeira janela constrói andaime, testes e scripts de inicialização; as seguintes seguem a lista. Quando o contexto limpar, prefira uma janela nova a forçar compactação.

A versão madura tem três fases: research produz um documento, plan produz um plano de implementação e implement segue o plano. Humanos revisam só os dois documentos nos portões.

### 67. Por que «mostrar o prompt a um colega» é o melhor teste?

Porque, ao escrever e ler seu próprio prompt, seu cérebro preenche o contexto faltante. Um colega não tem esse cache; onde ele travar é onde falta algo.

Antes de entregar, verifique três coisas: formato e restrições estão concretos; passos dependentes estão numerados; e, ao pedir uma ação extra, o motivo está explicado.

### 68. Por que dizer ao modelo o que não fazer costuma falhar?

Uma proibição diz onde não ir, mas não onde ir, então o modelo adivinha ao redor da zona proibida. Para formato estável, declare o alvo positivo: em vez de «não use markdown», diga «responda em parágrafos de prosa fluida».

Outro truque é igualar o estilo: um prompt cheio de listas markdown tende a produzir markdown. Escreva o prompt no estilo que quer receber.

### 69. Por que um contexto cuidadosamente ajustado pode perder para não ajustar nada?

Porque várias camadas de middleware «obviamente razoáveis» podem se anular. Num teste, um preset de três camadas de limpeza e resumo marcou 58% em memória, depois 38% ao repetir, com o dobro do custo de não fazer nada.

Não confie no tato; rode avaliações. Use as mesmas tarefas e dados, compare seu preset com o histórico completo, pontue só as sondas plantadas e depois olhe a curva de custo.

### 70. Por que uma instrução de uma frase costuma superar um regulamento longo?

Quanto mais grosso o regulamento, menos atenção cada regra recebe. Se uma frase basta, não escreva um parágrafo; específico e conciso não são opostos: a verbosidade é o inimigo.

O esqueleto: papel, ação concreta, entregável, critério verificável e uma linha de motivo. Fluxos complexos podem ser longos, mas cada linha deve trabalhar.

### 71. É correta a frase «o contexto é a memória do modelo»?

Não exatamente. A metáfora original completa é working memory, memória de trabalho. O contexto é imediato, limitado e se perde ao desligar; a memória é armazenamento externo compilado para o contexto a cada requisição.

Os dois canais do Claude Code e os memory blocks do Letta mostram que memória e contexto são camadas distintas e não devem ser confundidas.

### 72. Por que Tobi colocou «saber carregar contexto» na avaliação de desempenho?

Porque carregar contexto é o passo mais pulado no trabalho: tenta duas vezes, não funciona e volta ao método antigo, sem perguntar se o prompt falhou, faltou contexto ou nunca houve segunda tentativa.

Colocar uso de IA e habilidade de contexto em desempenho e revisão por pares transforma isso em requisito organizacional, não artesanato pessoal. Mas é narrativa de gestão, não dado medido: cite como tal.

## 5. Onde o contexto queima dinheiro

### 73. Por que o cache muda o preço mas não a ocupação da janela?

O cache é como uma linha de cache de CPU: acelera a recuperação mas não economiza um byte de memória. O prefixo cacheado continua ocupando a janela, a atenção continua dividida e a compactação continua disparando perto do limite.

Leve dois livros: ocupação em `/context`, gasto em `/usage`. O desconto está na conta, não na janela.

### 74. Por que cada turno de um chat multi-turno paga o histórico inteiro de novo?

Modelos não têm memória, então cada requisição reenvia a sessão completa. Você envia duas palavras —«continue»— e o turno é cobrado sobre todo o histórico.

Na 50ª chamada de ferramenta, só o histórico pode passar de 150K tokens; 50 turnos equivalem a pagar 1.275 entradas de um turno. O cache baixa o preço unitário mas não muda essa forma composta.

### 75. Como estimo o gasto mensal de contexto?

Três âncoras: implantação empresarial ronda 13 dólares por dia ativo e 150–250 por mês; com Sonnet a 3 dólares por milhão de tokens, um contexto de 150K custa cerca de 0,45 por turno e 30K cerca de 0,09; encher uma janela de 1M uma vez vai de 0,14 a 10 dólares.

Conta mensal ≈ turnos ativos por dia × tokens de entrada por turno × preço de entrada × desconto de cache. Com boa taxa de acerto, leitura custa um décimo; se instável, deixe margem de 30–50%.

### 76. Como calcular e controlar a conta de contexto multi-agente?

Chat é 1x, um agente cerca de 4x, multi-agente cerca de 15x; equipes de agentes em modo plan vão por 7x. Cada teammate leva sua própria janela e queima seus próprios tokens.

Alavancas: escalone esforço por complexidade; limite tokens de pensamento; mantenha equipes pequenas e desligue cada teammate assim que terminar.

### 77. Onde consulto a taxa de acerto do KV-cache e como melhorá-la?

A linha de estatísticas do Claude Code informa requisições, proporção de entrada cacheada, falhas e calor do cache. Na API, leia `cache_read_input_tokens`, `cache_creation_input_tokens` e `input_tokens` no usage.

A taxa é leituras de cache divididas pela soma dos três. Melhore estabilizando o prefixo —congelar ferramentas, mover timestamps para o fim, histórico só-acrescentar—, não cortando tokens.

### 78. Quando vale dar ao cache um TTL de uma hora?

Se cinco minutos bastam, não atualize. Um TTL de uma hora começa a render quando o intervalo passa de cinco minutos mas a próxima requisição chega com segurança dentro de uma hora.

Preços: escrever cache de cinco minutos custa 1,25x a entrada, o de uma hora 2x, e ler 0,1x. Ao misturar, coloque o segmento de uma hora antes do de cinco minutos.

### 79. Como pré-aquecer o cache na inicialização para melhorar a primeira resposta?

Envie uma requisição com `max_tokens: 0`, para a API ler o prompt e escrever o cache no ponto de corte, e retornar imediatamente sem gerar saída.

Ponha o corte no último bloco compartilhado com as requisições reais; iguale thinking e effort; use corte explícito, não cache automático. O pré-aquecimento pode gerar cobrança de escrita.

### 80. Quando uma janela de um milhão é acessível e quando é armadilha?

Alimentar documentos grandes de uma vez vale a pena: enche, pergunta, vai embora e paga só aquele enchimento. Mas a latência do primeiro token aparece: cerca de 22 segundos a 100K e 76 segundos acima de 800K.

Não faça de 1M o padrão para sessões frequentes: carregar o histórico completo a cada turno compõe latência e custo, e ao passar da metade da ocupação só resta recuperar ou compactar.

### 81. Como a execução de código transforma um trabalho de 150K tokens em 2K?

Definições de ferramentas viram arquivos; o agente lista o diretório e lê só o necessário. Dados fluem de script a script dentro de um sandbox, então resultados intermediários não entram no modelo.

Duas economias: manuais de ferramentas não são mais carregados inteiros e saídas intermediárias não passam pelo modelo. O custo é isolamento, limites de recursos e monitoramento do sandbox.

### 82. Por que a execução mais barata pode ser a que mais envia tokens?

Por causa do cache. Enviar quase 300K tokens por turno com 97% de acerto pode custar 0,0063 dólares por turno; cortar agressivamente parece menor mas quebra o desconto e custa mais.

Depende de preço de cache baixo e de uma carga específica: não é lei universal. Se o preço do cache subir, a conclusão inverte. A economia robusta é limitar, não reescrever.

### 83. Por que resumir o histórico custa 50% mais que não resumir?

Os tokens economizados não cobrem o desconto de cache destruído. O histórico completo custa 0,11 por turno contra 0,24 do preset com resumo, enquanto as sondas de memória dão 92% contra 38%: mais caro e mais esquecido.

O cache exige reenviar o contexto anterior sem mudanças. Resumir reescreve o prefixo, então tudo que estava descontado é pago a preço cheio.

### 84. Encher uma janela de um milhão: qual a diferença entre o mais caro e o mais barato?

Com dados de junho de 2026, 71 vezes: cerca de 0,14 dólares no extremo barato e 10 no caro. A diferença vem sobretudo da estrutura de preços, não do nível de capacidade.

A tabela precifica um enchimento, não um mês. O custo mensal ainda multiplica por taxa de acerto e número de turnos.

### 85. Por que apertar compactar queima milhares de tokens e mais de dez segundos?

Porque compactar é em si uma requisição de inferência completa: lê toda a sessão e gera um resumo. Uma janela de 150K produz 3.000–5.000 tokens de saída e 5–15 segundos de latência real.

A saída é cobrada a preço de saída, muitas vezes várias vezes o de entrada, e a compactação reescreve o prefixo, forçando reconstruir todo o cache. Se não precisa de continuidade, `/clear` é mais barato.

### 86. Por que o dobro de trabalho custa sete vezes mais e vale a pena?

Multi-agente compra computação em troca de taxa de sucesso; o uso de tokens explica cerca de 80% da variância de resultados. As equipes de agentes do Claude Code em modo plan custam cerca de 7x tokens.

Julgue com duas perguntas: a saída pode ser aceita de forma independente? As ramificações paralelas precisam compartilhar decisões? Se precisam, um único fio com bom contexto é mais seguro; só trabalho independente e realmente paralelo justifica 15x.

### 87. Por que minha janela encolheu em silêncio após atualizar o modelo?

Porque o tokenizer mudou. A partir do Opus 4.7, o mesmo texto pode contar até 35% mais tokens; o tamanho da janela não mudou, o contador sim.

Rode `/context` no dia da atualização, conte o mesmo histórico no modelo antigo e no novo e redefina orçamento e limites com os números novos.

### 88. Para economizar, corto contexto primeiro ou troco de modelo?

Em ordem: verifique a taxa de acerto de cache e arrume posicionamento e cortes, que é grátis; se a taxa é saudável e o preço de cache está abaixo de cerca de 0,55 dólares por milhão, corte contexto; se o preço unitário é alto demais, troque de modelo; se o modelo não pode mudar, adicione memória externa ou execução de código.

Mude uma variável por vez e meça após cada mudança.

## 6. Como saber se o contexto é bom

### 89. Por que ainda não há um benchmark aceito de qualidade de contexto?

Porque «bom» não está definido para este ofício. As falhas são silenciosas: a compactação descarta detalhes cuja importância só aparece depois, então nada parece errado no momento.

Sondas medem retenção mas não utilização, e benchmarks existentes não capturam a degradação encadeada de dezenas de compactações com perda em produção. Sem resposta pública, seu próprio padrão é obrigatório.

### 90. Como planto sondas para detectar quando um agente começa a esquecer?

Cinco passos: plante um fato verificável no turno zero; empurre a conversa além do ponto de compactação com perguntas reais; faça uma pergunta que exija esse fato; descarte a execução se a compactação não disparou; e faça um juiz pontuar cego à configuração.

Plante coisas concretas como «300 milissegundos», não preferências vagas como «o usuário gosta de brevidade». Em testes, zero compactações acertavam tudo; após cinco ou seis, só sobreviviam três de dez sondas.

### 91. Que métricas revelam se a compactação é boa ou só parece?

A taxa de compressão engana: três sistemas ficaram em 98–99% enquanto a qualidade ia de 3,35 a 3,70, e o mais agressivo ficou por último.

Olhe seis dimensões: precisão, consciência de contexto, pegada, completude, continuidade e seguimento de instruções. A pegada —lembrar quais arquivos foram lidos ou alterados— é a mais fraca e o melhor alarme.

### 92. Como monto monitoramento de contexto para minha própria carga?

Três peças: registre o total de tokens de contexto por turno, somando sem cache, leitura de cache e escrita de cache em vez de confiar só em `input_tokens`; registre compactações e limpezas com limites e comprimento do resumo; e mantenha uma linha de estatísticas de cache e custo.

Com isso você responde «em que turno começou a ficar burro» e «para onde foi o dinheiro».

### 93. Vinte ou trinta trajetórias reais: como começo uma avaliação mínima?

Comece com 20–50 tarefas reais; mudanças iniciais têm efeito grande e poucos casos bastam. O ciclo: coletar trajetórias, definir pontuação verificável, guardar uma base, mudar uma variável e reservar um conjunto de retenção.

Não escreva você as respostas de referência; extraia pontos atômicos de registros humanos reais para o juiz pontuar de forma confiável.

### 94. Como pontuar rápido uma montagem de contexto?

Quatro perguntas: há uma versão errada (correção)? Todos os pré-requisitos estão presentes (completude)? Quanto é ruído (tamanho)? Dá para continuar no meio da tarefa (trajetória)?

A ordem importa mais que a lista: correção domina, errado supera ausente, ausente supera ruído. Nunca corte correção primeiro só para economizar tokens.

### 95. Por que 97% dizem que importa e só 4% fazem?

A lacuna é de infraestrutura, não de concordância. 97% dizem que contexto importa, mas só 4% alcançam a maturidade em que o conhecimento compõe; só 42% dizem medir com precisão a prontidão para produção.

Avaliação, monitoramento e governança são onde os 97% viram 4%. Quem constrói essa camada primeiro leva a vantagem.

### 96. A qualidade geral é 97, por que ainda esquece em silêncio?

Porque a qualidade geral mede se a resposta parece boa: prosa, pertinência e formato estão lá, mas o fato esquecido não está na rubrica. Em testes, a qualidade cega era 97–99% enquanto as sondas de memória eram 58%.

A aceitação deve pontuar só as sondas. Qualidade geral é painel, não portão. A pergunta é: o fato plantado no turno zero ainda está disponível no turno onze?

### 97. Por que a observabilidade é o maior ponto fraco da engenharia de contexto?

Porque fornecedores dizem que contexto importa mas raramente dão uma janela para olhar dentro da janela. `/context` mostra ocupação estática, não a área dinâmica de mensagens, que é a que mais importa.

Pior, a instrumentação pode mentir: um issue relatou `/context` mostrando 1.553,9% de ocupação. A solução é exportar traços para OpenTelemetry e fazer o agente emitir hipóteses e evidências em formato estruturado.

### 98. É crível «menos de 5% dos times têm avaliações»?

O número não é crível, mas o fenômeno provavelmente é. Vem do relato de um profissional anônimo, sem tamanho de amostra nem método auditável.

Use o teste de três passos: quem disse, o que corrobora e qual o escopo. Os 42% de prontidão medida do relatório setorial apontam na mesma direção. Trate como testemunho, não estatística.

### 99. Aprendi muitas técnicas: como sei qual funciona no meu cenário?

Técnicas não têm verdade universal, só «subiu minha avaliação?». Não ajuste por intuição; deixe a avaliação decidir.

Crie um conjunto de avaliação com incidentes passados e testes existentes, rode uma matriz sobre montagens candidatas, mude uma variável por vez e mantenha só o que melhora.

### 100. A engenharia de contexto vai sair de moda como a de prompts?

Metade sim. Técnicas concretas caducam: onde pôr o corte de cache, que limites usar e quais instruções destacar se depreciam a cada atualização do modelo.

A outra metade não: avaliação não caduca —quanto mais forte o modelo, mais escasso o bom julgamento sobre qualidade—; e problemas difíceis também não: modelos entendem bem contextos complexos mas ainda geram mal saídas longas igualmente complexas.
