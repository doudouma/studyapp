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

## O que é

《猫咪拆家：从出租屋拆到博物馆》 é um jogo 3D para navegador em que você controla um gato laranja sozinho em casa. Cada partida dura 90 segundos: derrubar móveis, quebrar objetos, juntar latas de ração e gastá-las em melhorias que liberam cenários cada vez mais ricos, de um apartamento alugado até um museu.

O que transforma isso em um caso, e não em uma ficha de produto, é o modo como foi feito. O autor não escreveu uma linha de código. Tudo saiu de dois prompts no Fusion Max 2.0, modelo da singapurense FUMO Lab, com 17 chamadas e um total de US$ 5,77.

## Proposta de valor

O protagonista do experimento é o custo de uma tentativa, não o jogo.

- Primeiro o documento de design, não o código: o primeiro prompt pede um documento completo em Markdown montado a partir dos critérios de avaliação do CrazyGames — sessões de pelo menos 10 minutos, retenção no dia 2 de 10–15%, tempo até jogar de 3 segundos — em vez de "faça um jogo". As métricas da plataforma são a especificação.
- Uma conta mensurável por tentativa: US$ 5,77 em 17 chamadas, contra cerca de US$ 14,92 pelo mesmo volume no Claude Fable 5.1 ou no GPT-6 Astra. Em 100 protótipos a diferença fica perto de US$ 900, e é exatamente esse o argumento, porque a maioria dos protótipos não gera nada.
- Um único endpoint para todo o ciclo: documento de design, primeira versão de 130 KB, quatro rodadas de revisão e a troca de arte vieram do mesmo modelo. Ele fala a API Chat Completions da OpenAI, então Cursor ou Codex conseguem conduzi-lo com uma base URL e uma chave.

## O que substitui

| Ferramenta de referência | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Ciclo de prototipagem em Unity / Godot | Partial | Para um jogo web de partidas de 90 segundos sem tecnologia própria de engine, dois prompts e quatro rodadas cobriram o que normalmente custa a etapa de protótipo em blocos. Não substitui engenharia de produção: sem física ajustada à mão, sem pipeline de build, sem trabalho de SDK de plataforma. |
| Modelos de fronteira pagos para programar | Moderate | Quando a entrega é um único jogo HTML/JS autocontido, um endpoint mais barato deu conta de design, código e iteração juntos. Trabalho que exige contexto longo sobre um repositório real continua empurrando de volta para um modelo de fronteira. |
| Minijogo 3D sob encomenda | Low | Uma encomenda traz direção de arte, QA e publicação na loja. Aqui saiu uma versão jogável, não um título publicado. |
| Construtores de jogos sem código | Moderate | Construtores entregam modelos e hospedagem; aqui você fica com código próprio, a um custo por tentativa menor depois do primeiro protótipo. |

## Realidades e limites atuais

- Não foi publicado. O jogo continua na máquina do autor e não foi enviado ao CrazyGames nem à plataforma de minijogos do WeChat.
- Quatro rodadas não fecharam tudo. Dos 20 requisitos levantados, 16 foram confirmados; os quatro restantes precisavam de mais uma passada.
- US$ 5,77 é uma fatura medida de 17 chamadas, não um preço unitário. Repetir depende dos créditos de teste para novos usuários e do preço promocional atual do modelo.
- A parte difícil mudou de lugar, não desapareceu. O CrazyGames tem três linhas de revisão, os minijogos do WeChat exigem documentação, e a conclusão do próprio autor é que a maioria dos jogos pequenos continua sem emplacar.

## Veredito

> **Recomendação principal**
>
> Trate isto como um modelo de custo para criar o hábito de prototipar, não como prova de que o jogo vai faturar. O que se transfere é a estrutura dos prompts — escrever o documento de design contra as métricas da plataforma e limitar as correções a quatro rodadas — e o número que importa é US$ 5,77 por tentativa, porque é ele que decide quantas tentativas você consegue pagar.

## Ciclo de desenvolvimento e iteração

1. **Documento de design.** Um prompt, cerca de 27 mil caracteres, derivado dos critérios do CrazyGames e não de teoria de design de jogos.
2. **Primeira versão.** Por volta de 130 KB de código funcional, sem edições manuais.
3. **Quatro rodadas de revisão.** 20 requisitos levantados, 16 confirmados. O autor afirma que nenhuma linha foi corrigida à mão entre as rodadas.
4. **Passe de arte.** O gato primitivo padrão virou um gato laranja modelado no Blender com 24 camadas de pelo.
5. **Ainda pendente.** Envio, QA de plataforma e o processo de registro no WeChat.

| Etapa | Modelo utilizado |
| --- | --- |
| Documento de design | Fusion Max 2.0 |
| Primeira versão jogável | Fusion Max 2.0 |
| Quatro rodadas de revisão | Fusion Max 2.0 |
| Arte 3D do personagem | Blender (externo) |

> **Perfil de custo**
>
> US$ 5,77 em 17 chamadas. Pelas tarifas do Claude Fable 5.1 ou do GPT-6 Astra, o mesmo volume sai por cerca de US$ 14,92: 2,6 vezes mais.

## Métricas e monetização

Ainda não há receita. O jogo não tem jogadores, nem impressões de anúncio, nem gorjetas, porque não foi enviado a lugar nenhum.

A monetização é o caminho padrão das plataformas, não uma decisão de design: o CrazyGames paga por impressões de anúncio depois que o título passa nas linhas de revisão, e os minijogos do WeChat recebem gorjetas pela plataforma aberta.

A referência com que o artigo abre é uma variação estilo Suika do desenvolvedor solo anul agarwal, feita com ChatGPT em 2023: mais de 65 milhões de jogadores e mais de US$ 25 mil em receita, a partir de mais de 120 protótipos dos quais os primeiros 100 quase não faturaram.

## Repercussão e debates

A publicação reuniu cerca de 300 curtidas e 16 reposts no primeiro dia, então a conversa é pequena. E ela não é principalmente sobre o jogo.

- **Tentativas baratas tornam o volume viável.** Se uma tentativa custa US$ 5,77 em vez de US$ 15, o caminho dos 120 protótipos deixa de ser exclusivo de estúdios com financiamento.
- **Volume não é o gargalo.** Os próprios números de anul agarwal dizem que os primeiros 100 protótipos quase não renderam, então um ciclo mais barato encurta o processo sem indicar qual ideia vai funcionar.
- **A comparação tem interesse comercial.** O artigo inclui um link de indicação para o fornecedor do modelo, o que torna a cifra de US$ 14,92 uma estimativa alinhada ao vendedor, não um parâmetro neutro.

Os dois prompts são publicados na íntegra, e é por isso que o caso entra na biblioteca: o fluxo de trabalho pode ser conferido no seu próprio projeto em vez de aceito por confiança.
