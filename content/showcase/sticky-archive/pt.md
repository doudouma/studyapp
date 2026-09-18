---
summary: "Um arquivo digital permanente e mural comunitário de post-its, criado com vibe coding."
tags: [Gerado por IA, App web, Grátis, Cloudflare, Vibe coding]
facts:
  - key: author
    value: alvinunreal
  - key: platforms
    value: Web (todos os navegadores modernos)
  - key: version
    value: v0.1.0 · protótipo ao vivo
  - key: tech stack
    value: Nuxt · Hono · Cloudflare D1 · Workers AI
  - key: hosting cost
    value: $0 (plano gratuito)
    highlight: true
  - key: price
    value: Grátis · acesso comunitário
  - key: offline
    value: Não
---

## O que é

[StickyArchive](https://stickyarchive.com/) é um mural digital de post-its baseado na web que dá às notas da comunidade um quadro público, pesquisável e preservado permanentemente. Construído como a 69ª edição de uma série de desenvolvimento rápido assistido por IA ("vibe coding"), funciona ao mesmo tempo como tela pública e microdiário interativo.

Os usuários podem navegar e publicar de graça no navegador sem se cadastrar: as contribuições passam por um mecanismo de moderação automática embutido, que mantém baixa a barreira de participação e, ao mesmo tempo, evita que spam inunde o mural.

## Proposta de valor

O projeto preenche a lacuna entre as notas adesivas locais e temporárias do desktop e os espaços públicos de microblogging.

- **Permanência controlada**: as contribuições são arquivadas após revisão automática, evitando spam desordenado e formando uma linha do tempo de ideias da comunidade a longo prazo.
- **Infraestrutura sem manutenção**: construído inteiramente sobre o ecossistema serverless de borda da Cloudflare, mantém latência muito baixa com gasto zero de hospedagem de servidor.
- **Isolamento de privacidade em vários níveis**: suporta murais temáticos públicos visíveis a todos e, a partir do feedback inicial, foi rapidamente ampliado com Boards dedicados a rascunhos pessoais e à organização de prompts.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Microsoft Sticky Notes | Moderada | Indicado para quem quer sincronização web entre dispositivos e exibição pública na comunidade, mas sem widgets nativos fixados ou acoplados ao desktop. |
| Padlet | Moderada | Alternativa leve para quadros públicos sem uma assinatura complexa, embora sem gestão granular de permissões de nível educacional ou corporativo. |
| Twitter / X (micro-ideias iniciais) | Parcial | Traz de volta a experiência de um feed inicial sem algoritmo, para registrar sem fricção humores breves e ideias instantâneas. |

## Realidades e limitações atuais

- **Sem conexão push instantânea e persistente**: o mural hoje depende de atualizações manuais da página para buscar dados novos; ainda não há entrega em tempo real via WebSocket ou SSE.
- **Navegação em páginas longas a melhorar**: ao voltar por grandes volumes de notas de datas passadas, a interface não tem barra de navegação flutuante fixa nem atalho de "voltar ao topo".
- **Pouca liberdade de texto rico e layout**: em comparação com ferramentas de quadro completas, as notas são quase sempre texto puro, sem layout avançado ou anexos multimídia.

## Veredito

> **Recomendação principal**
>
> Um depósito de ideias sem fricção e uma cápsula do tempo digital pública para criadores, engenheiros de prompt e quem faz anotações no dia a dia.

## Ciclo de desenvolvimento e stack de tecnologia

Todo o aplicativo é construído sobre o stack de computação de borda da Cloudflare, voltado a minimizar o custo operacional e a manter alta elasticidade.

| Etapa / Componente | Tecnologia utilizada |
| --- | --- |
| Framework frontend | Nuxt (Vue) |
| API backend | Hono |
| Banco de dados | Cloudflare D1 (SQL serverless) |
| Moderação de conteúdo | Cloudflare Workers AI |
| Hospedagem de borda | Cloudflare Pages / Workers |

> **Perfil de custo**
>
> Custo total de infraestrutura em operação: **$0.00** (totalmente dentro do plano gratuito da Cloudflare).

## Métricas e monetização

O projeto é hoje completamente gratuito, sem paywall nem assinatura.

- **Feedback e iteração da comunidade**: após o lançamento, chamou atenção e recebeu votos rapidamente no [r/vibecoding](https://www.reddit.com/r/vibecoding/comments/1wh39qz/vibe_coding_random_websites_part_69_permanent/) e, em menos de 24 horas, o autor lançou o recurso Personal Boards em resposta aos pedidos da comunidade para guardar prompts e pensamentos privados.
- **Valor do caso**: como app nativo de borda, demonstra como um desenvolvedor solo, com ferramentas de programação com IA, consegue lançar em dias e sustentar tráfego público com custo operacional zero.
