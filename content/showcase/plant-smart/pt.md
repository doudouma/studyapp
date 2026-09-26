---
summary: "Banco de dados gratuito e sem anúncios de plantas tóxicas para pets: gravidade, sintomas e busca reversa, com API aberta e dados de ASPCA e iNaturalist."
tags: [Segurança de pets, Banco de dados de plantas, API aberta, Dados abertos, Sem anúncios]
facts:
  - key: author
    value: u/WilhelmCodes
  - key: price
    value: Grátis · sem anúncios · sem conta
    highlight: true
  - key: lookup
    value: Pelo nome da planta ou pelos sintomas (busca reversa)
  - key: data sources
    value: ASPCA · iNaturalist · curado por humanos, sem IA
  - key: api
    value: API aberta · dados abertos com atribuições
  - key: age
    value: 3,5 anos de idade, redesenhado recentemente
---

## O que é

Plant Smart é um banco de dados gratuito de plantas tóxicas para pets criado por u/WilhelmCodes para acabar com o clássico pânico de quem tem plantas e animais: você vê uma planta bonita, tem pets em casa e, de repente, está a dez abas de profundidade em páginas contraditórias cheias de anúncios. Construído há 3,5 anos e recém-reformado com uma camada de tinta nova, mora em [plantsm.art](https://plantsm.art) e foi divulgado no r/InternetIsBeautiful para medir o interesse.

## Proposta de valor

* **Busca pelo nome da planta, comum ou científico**: gravidade, animais afetados e sintomas a observar numa única consulta, em vez de dez abas.
* **Busca reversa por sintomas**: se o seu pet já está apresentando sintomas, pesquise por eles e reduza os suspeitos até achar a planta culpada.
* **Grátis, sem anúncios e sem enrolação**: sem conta, sem anúncios, e cada verbete é curado de fontes verificadas com atribuições — dados explicitamente não gerados por IA.
* **API aberta**: o conjunto de dados é aberto e a API está lá para construir em cima; os dados sobrevivem ao site.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Dez abas pesquisando toxicidade vegetal | Alta | Um banco curado responde gravidade, animais afetados e sintomas numa única consulta. |
| Fazendas de conteúdo SEO sobre toxicidade | Alta | "Sem enrolação" por design: dados não-IA curados de fontes verificadas como ASPCA e iNaturalist. |
| Apps comerciais de identificação de plantas | Moderada | Feita para toxicidade de pets, não para identificação por foto; é preciso saber o nome da planta. |
| Controle veterinário de intoxicações | Baixa | É um guia, não uma ferramenta de diagnóstico — emergência vai sempre primeiro ao veterinário. |

## Realidade atual e limitações

* **Sem identificação por foto**: a busca funciona pelo nome (comum ou científico), então é preciso saber como a planta se chama antes de consultar.
* **Só inglês por enquanto**: a internacionalização com nomes comuns localizados está no roadmap, mas ainda não saiu.
* **Um guia, não um veterinário**: os dados de gravidade e sintomas informam decisões; não substituem orientação profissional quando um animal já comeu algo.
* **Dataset ainda em limpeza**: o autor está depurando verbetes para ganhar precisão e trazendo novas fontes abertas, então detalhes podem mudar.

## Veredito

> **Recomendação principal**
> Guarde nos favoritos se você divide a casa entre pets e plantas. A busca reversa por sintomas é a função matadora — exatamente o momento de pânico em que dez abas mais machucam — e a API aberta a torna uma base limpa para quem quiser construir ferramentas de segurança para pets. É um utilitário de referência bem feito: grátis, sem anúncios, com fontes e melhorando em público.

## Ciclo de desenvolvimento e iteração

Um projeto solo de longa vida que usou a estreia no Reddit como uma rodada concentrada de feedback:

| Etapa | Ferramentas | Foco |
| --- | --- | --- |
| Construção inicial | Desenvolvimento solo, há 3,5 anos | Banco central de plantas tóxicas, busca e dados de gravidade |
| Redesign | "Camada de tinta nova" | UI modernizada que motivou o lançamento público |
| Iteração comunitária | Feedback do Reddit, implementado em dias | Filtro por continente/país, índice de nomes comuns + científicos, galeria de plantas seguras com fotos do iNaturalist |
| Curadoria de dados | Fontes abertas verificadas (ASPCA, iNaturalist) | Dataset sem IA com página pública de atribuições; limpeza de precisão em andamento |

## Métricas e monetização

* **Monetização**: nenhuma visível — completamente grátis, sem anúncios, sem conta.
* **Abertura**: API aberta mais dados abertos com todas as fontes listadas na página de atribuições.
* **Tração**: divulgado no r/InternetIsBeautiful para medir interesse; o autor implementou a maioria das sugestões em duas rodadas de edição e segue enriquecendo o dataset com novas fontes.

## Recepção da comunidade e debates-chave

A thread caiu bem e, mais raro ainda, o loop de feedback se fechou quase de imediato:

* **Sugestões viraram funções**: o filtro por continente e país, o índice ampliado de nomes comuns + científicos e a galeria de plantas seguras com fotos de referência do iNaturalist entraram no ar após a thread de lançamento.
* **Procedência como confiança**: a confirmação do autor de que todos os dados são não-IA e curados de fontes verificadas (ASPCA, iNaturalist) resonou com uma comunidade desconfiada de respostas de fazendas de conteúdo.
* **Demanda por localização**: nomes comuns localizados foram apontados como a próxima necessidade — o roadmap já inclui suporte multi-idioma.
