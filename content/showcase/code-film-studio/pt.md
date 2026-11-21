---
slug: code-film-studio
name: Code Film Studio
summary: Treze repositórios open source que se encaixam num estúdio de vídeo funcional — desmonte uma referência, escolha um estilo, renderize em código, componha os efeitos e exporte com ffmpeg.
category: resource
tags: [Open Source, Vídeo com IA, Agent Skills, Motion Design, Lista, FFmpeg]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
facts:
  - key: repositories
    value: 13 · todos open source
  - key: stars
    value: 634 mil somadas (21-11-2026)
    highlight: true
  - key: styles
    value: 99 estilos de cinema renderizados em código (Lemo-Opuscar)
  - key: effects
    value: 244 efeitos pixel (PixelFX) · 308 efeitos de composição (EffectCraft)
  - key: prompts
    value: 703 prompts · 418 com remontagem ao vivo
  - key: price
    value: US$ 0 para começar · o custo real são tokens, GPUs e a licença corporativa do Remotion
  - key: time
    value: Cerca de meio dia para um filme de 40 segundos com a stack instalada
  - key: requires
    value: Claude Code ou Codex · Node 20+ · ffmpeg · Python 3.10+
sources:
  - title: JuneYaooo/rea-video — repositório no GitHub
    url: https://github.com/JuneYaooo/rea-video
    publisher: GitHub
  - title: lemomo-ai/lemo-opuscar — repositório no GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
  - title: heygen-com/hyperframes — repositório no GitHub
    url: https://github.com/heygen-com/hyperframes
    publisher: GitHub
  - title: storytold/effectcraft — repositório no GitHub
    url: https://github.com/storytold/effectcraft
    publisher: GitHub
  - title: Licença e preços do Remotion
    url: https://www.remotion.dev/docs/license/pricing
    publisher: Remotion
  - title: GSAP agora é gratuito para todos
    url: https://gsap.com/pricing/
    publisher: GSAP
cover:
  src: /showcase/code-film-studio.png
---

## Treze repositórios, uma linha de produção

A lista circulou duas vezes no X na semana passada: treze repositórios do GitHub que, supostamente, transformam um agente de código num estúdio de cinema. 99 estilos, 244 efeitos, 703 prompts, zero dólar.

Lida como lista, é um monte de favoritos. Lida pelo que cada ferramenta faz com um quadro, vira uma linha reta: algo que diz como a referência foi feita, algo que decide a cara do seu filme, algo que escreve os quadros, algo que adiciona as faíscas e algo que exporta o arquivo.

É essa a ordem abaixo. Todo número foi conferido no repositório, no README ou nos benchmarks do autor em 21 de novembro de 2026, e toda afirmação sobre qualidade vem de alguém que realmente publicou algo com a ferramenta.

![Cinco etapas, treze repositórios: desmontar, escolher estilo, renderizar, compor, exportar](/showcase/code-film-studio-pipeline.png)

*As cinco etapas em torno das quais este texto se organiza. Cada repositório pertence a uma só.*

## O que a stack realmente entrega

- **Um mapa da referência, não uma cópia.** O Rea-Video divide um vídeo pronto em planos e julga cada um: filmado, gerado por IA, 3D, motion graphics em código ou gravação de tela. Depois escreve um plano de filmagem, prompts por plano e um `VIDEO.md` com o qual o agente continua trabalhando.
- **Um visual que você não precisou inventar.** O Lemo-Opuscar traz 99 estilos nomeados em 15 categorias, cada um com um filme-demo renderizado em código, então você escolhe no olho em vez de por adjetivo.
- **Quadros que dá para versionar.** O HyperFrames transforma HTML/CSS/JS em MP4 determinístico, e o Remotion faz o mesmo com componentes React. Os dois deixam um projeto que uma pessoa consegue editar: a diferença entre um vídeo de IA e um vídeo de IA que dá para consertar.
- **Primitivas de movimento que já funcionam.** GSAP para tipografia e DOM, three.js para 3D de verdade, PixelFX para impactos em pixel art, EffectCraft quando é preciso um compositor e ffmpeg para tudo no final.

## O que ele substitui

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Adobe After Effects | Partial | O EffectCraft replica painéis, atalhos e expressões do AE e traz 308 efeitos, mas o próprio README o chama de alpha e "ainda não recomendado para trabalho profissional com clientes". Serve para títulos, películas e transições. |
| Premiere Pro / DaVinci Resolve | Low | Não há nenhum NLE de linha de tempo aqui. Remotion e HyperFrames são renderizadores e o ffmpeg é linha de comando; a montagem continua sua. |
| Geradores de vídeo por IA (Sora, Veo, Kling) | Low | Esses repositórios não geram imagem. O Rea-Video diz quais planos precisam de um gerador e escreve os prompts — o modelo você continua pagando. |
| Blender na mão | Partial | O Blender MCP controla o `bpy` a partir de um agente. Forte em posicionamento procedural e trabalho em lote, fraco em direção de arte. |
| Bancos de imagem e assets | Moderate | O HyperFrames inclui imagens, músicas, SFX e TTS de stock; o resto assume que você traz o material ou gera. |
| Passagem do Figma para movimento | Moderate | Os estilos renderizados em código e o GSAP eliminam muita animação pós-design, mas nenhum repositório importa um arquivo de design de forma limpa. |

## Onde cada repositório ganha seu lugar

| Repositório | Camada | Use quando | Ele não vai |
| --- | --- | --- | --- |
| Rea-Video | Desmontagem | Você achou um vídeo para estudar | Filmar por você os planos de imagem real |
| Awesome Opus 5.5 Videos | Referência | Precisa de pontos de partida prompt-a-movimento já testados | Dar história ou roteiro |
| Lemo-Opuscar | Estilo | Quer um visual pronto sem desenhar um | Funcionar bem fora dos modelos Claude |
| EffectCraft | Composição | Precisa de keyframes, expressões e memória muscular do AE | Sobreviver a um prazo com cliente |
| PixelFX | Efeitos | O plano é pixel art ou trailer de jogo | Ajudar numa tomada de imagem real |
| ComfyUI | Assets | Precisa de stills, texturas ou keyframes gerados | Ficar estável entre atualizações de plugins |
| Remotion | Render | O vídeo é um componente React com dados por trás | Ser gratuito para empresas com mais de três pessoas |
| Remotion Skills | Render | O agente escreve Remotion errado toda vez | Substituir a leitura da documentação |
| HyperFrames | Render | O agente escreve HTML mais rápido que React | Entregar um filme de 90 pontos numa passada |
| three.js | 3D | Precisa de partículas, volumetria, materiais reais | Desenhar a cena por você |
| GSAP | Movimento | O texto tem que voar, quicar ou entrar deslizando | Animar uma cena 3D |
| Blender MCP | 3D | O trabalho é modelagem procedural ou em lote | Julgar se o render ficou bonito |
| FFmpeg | Exportação | Qualquer coisa precisa virar arquivo | Ser opcional |

## Realidades e limites atuais

- **Zero dólar é preço de entrada, não total.** O Remotion é gratuito para pessoas e empresas de até três pessoas; acima disso são US$ 25 por assento ao mês ou US$ 0,01 por render, com mínimo de US$ 100 mensais. O Lemo consome tokens por 30–60 minutos a cada filme. O ComfyUI é software gratuito que pede uma GPU. A precisão máxima do Rea-Video exige um modelo de visão pago.
- **O compositor gratuito é honesto sobre estar inacabado.** O README do EffectCraft o coloca em 91% de paridade de recursos e cerca de 45% do caminho até produção profissional, com o macOS como plataforma mais testada. O benchmark de um usuário: um filme vertical de 65 segundos exportado em cerca de 12 minutos a partir de um app de 150 MB, enquanto o After Effects ficou sem memória na mesma máquina de 64 GB.
- **O mito do clique único merece ser nomeado.** A crítica mais apoiada a essa stack diz claramente para não acreditar que HyperFrames ou Remotion vão montar um vídeo de alta qualidade sozinhos. O que eles tiram é o software de edição, não a direção.
- **A precisão desaba com material recomprimido.** As ferramentas offline do Rea-Video acertam 88,6% em clipes recomprimidos pelo WeChat e 99,6% ao adicionar um modelo de visão; num caso de unboxing, a passada offline disse 35% IA e o resultado foi 97% imagem real quando um agente olhou os quadros.
- **Contexto é o orçamento real.** Instalar os treze de uma vez inunda o agente com skills que ele não consegue manter organizadas. Três por vez é o limite prático.

## Veredito

> **Recomendação principal:** comece com três — Rea-Video para aprender a estrutura, HyperFrames para renderizar, ffmpeg para finalizar. Adicione o resto só quando um plano específico exigir.

A lista é real, mas é uma linha de produção, não um estúdio numa caixa. O que ela elimina é a conta de software e a curva de seis meses. O que não elimina é a parte que decide se alguém assiste: uma referência que valha a pena copiar, um estilo que caiba na história e vontade de recortar tudo quatro vezes.

## Um filme de 40 segundos, etapa por etapa

| Etapa | O que acontece | Tempo |
| --- | --- | --- |
| Desmontagem | O Rea-Video divide a referência em planos e devolve ritmo, legendas e plano de filmagem | 15 min |
| Estilo | Escolha um estilo do Lemo ou pegue um prompt de movimento da lista Awesome | 10 min |
| Construção | O HyperFrames monta a linha de tempo em HTML; três rodadas de ajuste | 30 min |
| 3D e tipografia | three.js no plano principal, GSAP nos títulos | 1 h |
| Composição | EffectCraft ou PixelFX para transições e impactos | 20 min |
| Assets | ComfyUI para keyframes e texturas | 20 min |
| Exportação | ffmpeg para concatenar, loudness, legendas e master final | 5 min |

Meio dia, uma vez. O lento é a primeira instalação: um agente, Node, ffmpeg, Python e um plugin por ferramenta.

## Métricas e custo

| Item | Quanto custa |
| --- | --- |
| Os 13 repositórios | US$ 0, mistura de Apache-2.0, MIT e GPL-3.0 |
| Assinatura do agente | US$ 20–200 por mês, conforme plano e uso |
| Um filme do Lemo-Opuscar | 30–60 minutos de agente, muito token |
| Remotion, licença corporativa | US$ 25 por assento ao mês, ou US$ 0,01 por render |
| ComfyUI | US$ 0 de software, GPU e eletricidade reais |
| Modelo de vídeo opcional | Por geração, conforme o provedor escolhido |

Estrelas somadas no GitHub: cerca de 634 mil, lideradas por ComfyUI com 147,8K, three.js com 119K e HyperFrames com 87,5K. Seis dos treze foram criados em 2026 — é uma stack que não existia um ano atrás.

## Reação da comunidade e os debates que valem a leitura

O elogio é específico, e isso é bom sinal. Um usuário japonês montou um clipe musical com letra fazendo o Opus 5.5 controlar o EffectCraft via MCP sem tocar no app, relatou timing de letra quase perfeito e que a sessão inteira gastou cerca de 5% da cota semanal do Claude. Outro comparou o EffectCraft com o After Effects na mesma máquina e ainda assim decidiu não colocá-lo em trabalho com clientes: 150 MB contra 5,4 GB, 12 minutos contra um travamento por memória, e um veredito justo de que é "suficiente para quase tudo, arriscado demais para trabalho".

O ceticismo também é específico. A contra mais compartilhada sustenta que vídeo de IA em um clique é mito e que quem consegue bons resultados usa Claude com Remotion dentro de um fluxo real de roteiro, storyboard e montagem. Combina com o que os próprios repositórios dizem: o Rea-Video insiste em material com direitos, o EffectCraft se rotula alpha e o Remotion publica uma página de licenças em vez de fingir que é grátis para todos.

Um aviso deveria acompanhar qualquer lista assim. Em outubro apareceu um repositório se passando pelo Blender MCP, com o nome do autor a uma letra do real, issues copiadas e um plugin que baixava código de outro repositório ao ser ativado. O projeto real é `ahujasid/mcp-for-blender`. Confira o autor e o histórico de commits antes de instalar o que um agente recomendar.

![Um mesmo motivo, doze estilos: até onde vai uma biblioteca de estilos renderizada em código](/showcase/code-film-studio-styles.png)
