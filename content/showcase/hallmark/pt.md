---
summary: "Um skill de design anti-AI-slop para Claude Code, Codex, Cursor e OpenCode que distribui 50 temas, renderiza páginas num navegador real e detecta os sinais que as fazem parecer feitas por máquina."
tags: [Skill para agentes, Design, Claude Code, Codex, Cursor, Anti-AI-Slop, Código aberto]
facts:
  - key: Autor
    value: Together AI
  - key: Stars
    value: 47,3K
    highlight: true
  - key: Temas
    value: "50"
  - key: Fotos
    value: 755 (Wikimedia Commons)
  - key: Agentes
    value: Claude Code, Codex, Cursor, OpenCode
  - key: Licença
    value: MIT
---

## O que é

Hallmark é um skill de design que se conecta a agentes de programação e se recusa a produzir páginas com cara de geradas por IA. Ele é distribuído como Skill para Claude Code, Codex CLI, Cursor e OpenCode, e é feito pela Together AI. Em vez de pedir a um modelo que «deixe bonito», ele distribui três temas de um catálogo de 50, monta a página em torno do que o visitante veio fazer, renderiza num navegador real e revisa o resultado contra os sinais conhecidos de IA.

## O problema que ele ataca

Os modelos convergem nos mesmos hábitos visuais: um eyebrow acima de cada título, rótulos em maiúsculas com tracking, uma palavra colorida no título, grades de molduras vazias ou só fotos, um hero que não cabe na primeira tela, um formulário de e-mail no fim de cada página e um formulário que agradece sem enviar nada. Hallmark trata isso como defeito e bloqueia os piores.

## Como uma construção roda

1. O preflight lê o projeto (fontes, paleta, framework, um `design.md` travado) e pede uma vez o material: fotos, capturas, números reais. Nada é inventado.
2. `scripts/theme.mjs deal` oferece três temas que combinam com o prompt e passam no log; `draw` distribui a anatomia da página a partir da tarefa.
3. O hero é construído sozinho, renderizado e revisado a frio antes de o resto da página existir.
4. `scripts/sloplint.mjs --render` verifica a página em oito larguras, e então um subagente revisa com olhos novos.

Cada página é HTML e CSS autocontidos, marcada no primeiro comentário CSS com as decisões tomadas.

## Novidades da v2

- **50 temas.** Cada um é um material (papel, tipografia, cor, superfícies, componentes e textura) com uma imagem de uma página pronta; uma construção lê exatamente um.
- **Construído a partir da tarefa.** Uma página de reservas reserva, uma loja vende, uma newsletter inscreve: a ação fica onde a categoria coloca e a página termina nela.
- **Custom.** Diga «custom» e o Hallmark desenha só a partir do seu prompt, sob as mesmas regras e checagens.
- **Seu produto real.** Aponte para uma URL, servidor de desenvolvimento ou app e ele captura as telas sozinho.
- **Fotografias reais.** 755 fotos de licença aberta, escolhidas por assunto e creditadas na página.
- **Redesign e auditoria.** `/hallmark redesign <path>` reconstrói uma página mantendo conteúdo e conexões; `/hallmark audit <path>` apenas relata.

## Os portões

As checagens vêm em níveis:

- **Floor** nunca vai ao ar: contraste, foco, movimento reduzido, fatos inventados, layout mobile quebrado.
- **Reflex** são os padrões em que um modelo cai; uma construção com motivo pode anular um, registrando a decisão.
- **Finish** são detalhes de ofício que nunca bloqueiam o envio.

## Limitações atuais

- É um Skill, não um gerador de páginas: você precisa de um ambiente de agente compatível e Node 18 ou superior.
- As checagens de navegador (`sloplint --render`, capturas) também exigem `puppeteer-core` e Chrome; sem eles só rodam as estáticas.
- Temas são materiais, não planos, então dois prompts no mesmo tema geram duas páginas diferentes; a consistência vem do material, não de um template fixo.
- O catálogo de 50 temas e a biblioteca de fotos são opiniões curadas, não um sistema de design universal.
- Estrelas e recursos são um instantâneo; o repositório avança rápido.

## Veredito

> **Recomendação principal**
> Use o Hallmark quando um agente continuar produzindo a mesma landing genérica. A parte útil são os portões em níveis e o lint de navegador: eles transformam «parece feito por IA» numa checklist que o modelo pode reprovar.

O Hallmark combina com desenvolvedores que já usam Claude Code, Codex, Cursor ou OpenCode e querem uma camada de gosto repetível sem adotar um sistema de design completo. Serve menos se você precisa de uma biblioteca de componentes completa ou de um editor visual.

## Atribuição

Feito pela Together AI. Código e instruções de instalação em [github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark); galeria de temas em [usehallmark.com](https://www.usehallmark.com/). Licença MIT.
