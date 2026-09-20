---
summary: "Um passeio noturno interativo de cinco capítulos por um templo de montanha de Quioto, renderizado ao vivo com Three.js e placas de cena geradas por IA."
tags: [Three.js, WebGL, Arte generativa, Narrativa interativa]
facts:
  - key: author
    value: Meng To
  - key: models
    value: GPT Image 2 · Claude
  - key: stack
    value: Three.js r149 · HTML · CSS · WebGL
  - key: stars
    value: 1600
    highlight: true
  - key: architecture
    value: Aplicação web estática de arquivo único (sem build)
---

## O que é

Kage é um passeio noturno interativo de cinco capítulos que roda no navegador e percorre um templo de montanha estilizado de Quioto. Concebido e dirigido artisticamente por Meng To ao lado de Claude, o projeto funde elementos 3D procedurais em Three.js com placas de fundo 2D geradas por IA e recortes em destaque no primeiro plano, proporcionando uma experiência narrativa atmosférica conduzida inteiramente pela rolagem da página.

## Proposta de valor

O projeto demonstra como recursos de imagem generativos e renderização WebGL procedural podem ser combinados sem exigir pipelines pesados de recursos 3D nem sistemas de build em tempo de execução.

- **Arquitetura estática sem build**: empacotada em um único arquivo `index.html` independente, com Three.js r149 embutido, sem pacotes npm, bundlers ou dependências remotas de runtime.
- **Camadas híbridas de profundidade 2D/3D**: combina geometria procedural em tempo de execução (terreno, estruturas do templo, portais torii, lanternas) com recortes WebP com alfa preservado e placas de fundo em alta resolução.
- **Coreografia sincronizada com a rolagem**: vincula a translação da câmera WebGL, efeitos climáticos dinâmicos (névoa, chuva, folhas ao vento) e iluminação diretamente ao progresso da rolagem.
- **Pós-processamento cinematográfico**: integra um pipeline contido de bloom, vinheta, desfoque dinâmico de profundidade de campo e tipografia responsiva pensada para telas móveis e de desktop.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Motores de jogo 3D tradicionais (exportações WebGL de Unity / Unreal) | Moderada | Prático para scrollytelling leve e portfólios, mas não substitui física de jogo interativa complexa nem lógica de jogo dinâmica. |
| Sites de scrollytelling baseados em vídeo | Alta | Muito superior em eficiência de banda e escala responsiva de resolução comparado ao scrubbing de vídeo em tela cheia pré-renderizado. |
| Boilerplates 3D pesados de Webpack/Vite | Alta | Demonstra que a programação criativa de nível comercial pode ser escrita e publicada como HTML/JS estático puro e sem dependências. |

## Realidades e limitações atuais

- **Estritamente narrativo e linear**: a interação está atrelada à posição da rolagem e aos rastros do ponteiro, sem controles de câmera de livre percurso nem caminhos narrativos ramificados.
- **Inconsistência na geração de recursos**: sobrepor placas generativas estáticas 2D a elementos 3D em tempo de execução exige direção de arte manual cuidadosa para evitar desencontros de perspectiva.
- **Licenciamento restrito**: embora a biblioteca Three.js subjacente continue MIT, o repositório não concede nenhuma licença pública de reutilização ou redistribuição do código e dos recursos visuais originais do Kage.
- **Escopo procedural fixo**: a geometria da cena e as variações arquitetônicas são geradas proceduralmente para este passeio específico, e não funcionam como um gerador de cenas de propósito geral.

## Veredito

> **Recomendação principal**
> Kage é um estudo de referência para designers web e tecnólogos criativos que buscam construir narrativa interativa de alta fidelidade. Prova que combinar síntese de imagens por IA com renderização WebGL procedural direcionada produz resultados cinematográficos, contornando pipelines gigantescos de recursos e ambientes de build complexos.

## Ciclo de vida e iteração

O código foi criado em colaboração humano-IA entre Meng To e Claude, apoiando-se em prompts explícitos documentados em `PROMPT.md` para definir regras de layout, linguagem de movimento e parâmetros da cena procedural.

| Etapa | Modelo usado |
| --- | --- |
| Geração de placas e recortes visuais | GPT Image 2 |
| Implementação de código e depuração de layout | Claude |
| Direção de arte e composição | Meng To |

## Métricas e monetização

- **Tração no GitHub**: 1,6k estrelas e quase 300 forks no primeiro mês após o lançamento.
- **Custo de distribuição**: zero custo de servidor em runtime; projetado para ser servido diretamente do GitHub Pages ou de qualquer hospedagem de arquivos estáticos, sem infraestrutura de backend.
- **Modelo comercial**: experimento web público e gratuito; serve como vitrine técnica aberta e estudo fundamental para habilidades modulares de agentes web.

## Repercussão da comunidade e debates-chave

O projeto atraiu rapidamente a atenção das comunidades de programação criativa e design com IA por sua estética refinada e leveza técnica. As discussões costumam girar em torno de sua filosofia de arquivo único sem build, com desenvolvedores elogiando a simplicidade de executar e ler o código diretamente com `python3 -m http.server`. Debates menores abordam a restrição de licença proprietária sobre o código-fonte, em contraste com o espírito aberto típico dos experimentos de programação criativa na web.
