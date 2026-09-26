---
summary: "Uma execução totalmente autônoma do Claude Code que escreveu, ilustrou, dublou, animou e renderizou um vídeo explicativo de produto de 30–60 s por cerca de US$ 4."
tags: [Gerado com IA, Produção de vídeo, Claude Code, Animação Canvas, Agentes autônomos, Voz sintética]
facts:
  - key: models
    value: Claude Code (Opus 5.5) · TTS do OpenRouter · modelo externo de revisão
  - key: token cost
    value: ~US$ 4 no OpenRouter · ~30% da cota de sessão do Claude Pro
    highlight: true
  - key: runtime
    value: 1,5–2 horas, totalmente autônomo
  - key: output
    value: Roteiro · Storyboard · Recortes em colagem · Locução · Animação Canvas · MP4
  - key: spend cap
    value: Orçamento OpenRouter de US$ 10
  - key: style
    value: Colagem desenhada à mão, 30–60 s
---

## O que é

Dio-V pegou um prompt popular do r/ClaudeAI, adaptou-o e apontou o Claude Code (Opus 5.5) para o Friendr.nl — um pequeno projeto pessoal — com um orçamento de US$ 10 no OpenRouter e uma única instrução: produzir o melhor vídeo explicativo possível de 30–60 segundos em estilo colagem desenhada à mão, trabalhando de forma totalmente autônoma. Cerca de 1,5–2 horas depois, a sessão entregou um MP4 finalizado: roteiro, arte, voz, música e animação incluídos.

## Proposta de valor

* **Autonomia real de ponta a ponta**: um único prompt produziu o roteiro, o conceito de storyboard, os recortes em estilo colagem, a locução, a música de fundo, os efeitos sonoros, o código de animação e a renderização final — enquanto o autor estava longe do computador.
* **Design de movimento baseado em código**: a animação é código JavaScript puro em Canvas, então cada quadro é determinístico, editável e comparável com diff, em vez de ficar preso à linha do tempo de um editor de vídeo.
* **Sincronia áudio-quadro precisa**: o agente alinhou os quadros ao ritmo da locução gerada — justamente a etapa em que editores humanos mais gastam tempo.
* **Autorrevisão integrada**: a execução chamou modelos externos para criticar o próprio primeiro corte e aplicou correções com base nesse feedback antes de renderizar.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Agências de vídeo explicativo | Moderada | Cobre conceito, voz, música e movimento para uma história de produto simples; direção de arte em nível de marca ainda precisa de humanos. |
| Fluxos de After Effects / motion design | Parcial | Código Canvas automatiza animação de colagem simples, mas easings complexos, 3D e composição seguem fora de alcance. |
| Criadores de vídeo baseados em modelo | Alta | Supera templates de banco de imagens em originalidade com custo parecido; cada asset é gerado para o produto específico. |
| Locução freelancer + música licenciada | Alta | TTS e áudio gerado cobrem a narração e a trilha de um explicativo curto com custo marginal quase zero. |

## Realidade atual e limitações

* **A voz é TTS**: entonação, ênfase e emoção ficam limitadas pelo modelo de síntese de voz; um narrador humano ainda convence mais.
* **Sem diretor criativo no loop**: o autor se ausentou de propósito, então tom, humor e ritmo do roteiro são o que o modelo decidiu — um vídeo de marca de verdade pediria uma passada humana no roteiro antes de animar.
* **O estilo colagem é virtude e limite**: a estética de colagem desenhada à mão disfarça bem artefatos de movimento da IA, mas demos nítidas de interface de produto ainda exigem gravação de tela ou motion design profissional.
* **Risco de orçamento numa tacada só**: uma execução autônoma compromete o orçamento todo numa única direção criativa; não há como gerar dois conceitos concorrentes e escolher o melhor sem custo.

## Veredito

> **Recomendação principal**
> Um vídeo explicativo de produto finalizado e assistível por cerca de US$ 4 e zero horas de trabalho manual é um patamar de preço genuinamente novo. Use esse padrão como gerador de primeiro rascunho para narrativa de produto: rode de forma autônoma e depois invista esforço humano onde ele realmente se multiplica — revisão de roteiro, voz de marca e polimento final. Ainda não substitui um vídeo de marca desenhado sob medida, mas é imbatível em custo por iteração.

## Ciclo de desenvolvimento e iteração

Tudo foi uma única sessão autônoma do Claude Code com uma chave do OpenRouter para os modelos auxiliares, executada em cerca de 1,5–2 horas:

| Etapa | Modelo / ferramenta usados | Foco |
| --- | --- | --- |
| Planejamento | Claude Code (Opus 5.5) | Leu as FAQ do produto, escreveu roteiro e conceito de storyboard |
| Produção de assets | Claude Code + TTS do OpenRouter | Recortes em colagem, locução, música de fundo, efeitos sonoros |
| Animação | Claude Code | Animação Canvas em JavaScript puro, quadros alinhados ao ritmo da locução |
| Revisão | Modelo externo via OpenRouter | Criticou o primeiro rascunho; o agente corrigiu sozinho os problemas apontados |
| Render | Claude Code | Exportou o MP4 final |

## O prompt por trás da execução

O prompt completo como publicado (troque Friendr.nl pelo seu próprio produto):

```text
Create a pure javascript animation. 30s-60s whimsical hand drawn collage style with appropriate audio on Friendr.nl.

Entire video should be as high of a production value as possible. Please spend your time on this, it's very important. People should understand what Friendr.nl is for and after seeing the video will want to create an event to try it out. Read the FAQ first.

Use high quality text-to-speech model for generation. You can find open router API key in .env file

You can use any tools you can find access to and resources on the internet. You create the script, the assets, the animation, concept, everything.

I have to go away from my computer so please work autonomously until done. Quality is paramount. Production value should be on professional level.

One more thing: max OpenRouter spend is $10
```

## Métricas e monetização

* **Custo**: ~US$ 4 de gasto na API do OpenRouter contra o teto de US$ 10, mais ~30% de uma cota de sessão do Claude Code Pro.
* **Tempo**: 1,5–2 horas de trabalho totalmente autônomo, sem intervenção humana.
* **Distribuição**: divulgado no r/ClaudeAI como vitrine comunitária; o Friendr.nl é o projeto pessoal do autor.
