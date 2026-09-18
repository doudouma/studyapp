---
summary: "Um mod de Minecraft Fabric criado de forma autônoma pelo Fable 5.1 a partir de vídeos do YouTube, com modelos 3D no Blender e efeitos de partículas."
tags: [Gerado por IA, Minecraft, Mod de jogo, Anthropic, Blender]
facts:
  - key: models
    value: Anthropic Fable 5.1
  - key: token cost
    value: $20.54
    highlight: true
  - key: version
    value: Fabric 1.21.1
  - key: platforms
    value: Minecraft (Java Edition)
  - key: price
    value: Grátis (open source no GitHub)
  - key: tools used
    value: atomic.chat · Blender MCP Bridge
---

## O que é

O projeto é um mod de Minecraft Fabric criado quase inteiramente por um agente de IA autônomo rodando o Fable 5.1 da Anthropic. A partir de dois links do YouTube — um clipe de anime do dragão de raios Kirin do Sasuke, de *Naruto*, e uma gravação de gameplay de um mod de canhão de trilho orbital —, a IA sintetizou os dois conceitos em uma arma de canhão de trilho jogável que invoca um enorme ataque de dragão de raios no impacto.

## Proposta de valor

- **Análise de quadros multimodal**: o agente extraiu referências visuais diretamente dos vídeos do YouTube, ingerindo fluxos de capturas quadro a quadro.
- **Controle de ferramentas entre softwares**: integrou-se por uma ponte MCP (Model Context Protocol) do Blender para modelar e texturizar tanto a arma quanto a entidade do dragão sem escultura 3D manual.
- **Iteração por feedback visual**: os bugs foram corrigidos apenas devolvendo ao agente clipes de gameplay com os erros, em vez de escrever revisões de código à mão.
- **Andaime de mod de ponta a ponta**: gerou código Java padrão do Fabric 1.21.1, estruturas de assets, lógica de entidades e efeitos de impacto no terreno em cerca de uma hora.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Modelagem manual no Blockbench / Blender | Moderada | Grande capacidade para prototipar entidades rápido e fazer rigging básico, embora a otimização fina de polígonos ainda favoreça humanos. |
| Andaime tradicional de mods Fabric | Alta | Substitui o código Java repetitivo, o registro e a configuração inicial de mecânicas de entidade para mods de itens avulsos. |
| Scripting dedicado de VFX / partículas | Parcial | Adequado para destruição padrão em área e rajadas de partículas; pipelines de shaders personalizados complexos ainda exigem ajuste manual. |

## Realidades e limitações atuais

- **Saída de código desestruturada**: revisões da comunidade apontaram convenções de nomes caóticas e estrutura difícil de manter, apesar de a jogabilidade funcionar.
- **Custo extra de tokens com vídeo**: analisar quadros brutos consumiu cerca de 383,6 mil tokens de saída e custou mais de $20 de API para um único mod pequeno.
- **Dependência de plataforma**: depende fortemente de integrações MCP personalizadas, como a ponte do Blender, e de um orquestrador externo (`atomic.chat`) para coordenar a execução com várias ferramentas.
- **Debates sobre originalidade**: várias mecânicas têm forte semelhança com mods de canhão de trilho e raios já existentes em código aberto, levantando dúvidas sobre memorização de dados de treino.

## Veredito

> **Recomendação principal**
>
> Uma demonstração pioneira de fluxos agênticos multimodais em que clipes de vídeo servem diretamente como especificações de design visual, reduzindo drasticamente a barreira para criar mods, apesar do alto custo em tokens e do código-fonte pouco refinado.

## Ciclo de desenvolvimento e iteração

O autor forneceu duas URLs do YouTube e um prompt de alto nível pedindo ao agente que combinasse a mecânica da arma com a estética do dragão de raios. A execução foi conduzida com o Fable 5.1 em modo agente dentro do `atomic.chat`.

Na primeira passada, o Fable analisou os quadros, gerou malhas 3D no Blender via MCP, escreveu a lógica do mod e compilou o pacote. Quando os testes revelaram que o dragão surgia de cabeça para baixo e sem impacto, o autor apenas enviou gravações de tela de volta. O Fable corrigiu a orientação, dobrou o tamanho da entidade e gerou crateras de terreno, destroços e efeitos de fogo personalizados em um único ciclo de revisão.

| Etapa | Modelo / Ferramenta | Resultado |
| --- | --- | --- |
| Extração de vídeo | Extensão de capturas do navegador | Referências visuais quadro a quadro |
| Modelagem e texturização 3D | Fable 5.1 + Blender MCP Bridge | Assets 3D do dragão e do canhão de trilho |
| Lógica e compilação do mod | Fable 5.1 | Base de código Java do Fabric 1.21.1 |
| QA e refinamento visual | Fable 5.1 (crítica por visão) | Correção de orientação, física de crateras, FX de destroços |

## Métricas e monetização

- **Uso de tokens**: ~383,6 mil tokens de saída entre a construção inicial e os ciclos de refinamento.
- **Custo de API**: $20.54 de gasto total na API da Anthropic.
- **Tempo investido**: ~1 hora do prompt inicial até uma build testada em jogo.
- **Modelo de monetização**: lançado 100% grátis e open source no GitHub, embora membros da comunidade tenham apontado a receita de anúncios em vídeos curtos como caminho viável para recuperar o custo.

## Recepção da comunidade e debates principais

A thread chamou bastante atenção no r/ClaudeAI, com milhares de votos por demonstrar execução agêntica multimodal de ponta a ponta. Embora alguns usuários tenham estranhado gastar $20 em tokens de API por um mod efêmero, modders observaram que produzir modelos com rigging, texturas e código Java personalizados normalmente exige dias de trabalho manual.

As discussões giraram em torno do ciclo de iteração visual — especificamente como o modelo interpretou gravações de gameplay para corrigir a orientação 3D sem instruções em nível de código —, além do debate sobre se as mecânicas de base foram realmente sintetizadas ou em grande parte regurgitadas de mods de código aberto preexistentes.
