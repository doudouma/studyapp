---
summary: "Un skill de diseño anti-AI-slop para Claude Code, Codex, Cursor y OpenCode que reparte 50 temas, renderiza páginas en un navegador real y detecta los indicios que las hacen parecer hechas por una máquina."
tags: [Skill para agentes, Diseño, Claude Code, Codex, Cursor, Anti-AI-Slop, Código abierto]
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
  - key: Licencia
    value: MIT
---

## Qué es

Hallmark es un skill de diseño que se conecta a agentes de programación y se niega a producir páginas que parezcan generadas por IA. Se distribuye como Skill para Claude Code, Codex CLI, Cursor y OpenCode, y lo hace Together AI. En lugar de pedirle a un modelo que «lo haga bonito», reparte tres temas de un catálogo de 50, construye la página alrededor de lo que el visitante vino a hacer, la renderiza en un navegador real y la revisa contra los indicios conocidos de IA.

## El problema que ataca

Los modelos convergen en los mismos hábitos visuales: un eyebrow encima de cada titular, etiquetas en mayúsculas con tracking, una palabra de color en el titular, rejillas de marcos vacíos o solo fotos, un hero que no cabe en la primera pantalla, un formulario de suscripción al final de cada página y un formulario que da las gracias sin enviar nada. Hallmark los trata como defectos y bloquea los peores.

## Cómo corre una construcción

1. El preflight lee el proyecto (fuentes, paleta, framework, un `design.md` bloqueado) y pide una vez el material: fotos, capturas, números reales. No se inventa nada.
2. `scripts/theme.mjs deal` ofrece tres temas que encajan con el prompt y pasan el registro; `draw` reparte la anatomía de la página según su tarea.
3. El hero se construye solo, se renderiza y se revisa en frío antes de que exista el resto de la página.
4. `scripts/sloplint.mjs --render` revisa la página en ocho anchos y luego un subagente la revisa con ojos nuevos.

Cada página es HTML y CSS autocontenidos, marcada en su primer comentario CSS con las decisiones que tomó.

## Novedades de la v2

- **50 temas.** Cada uno es un material (papel, tipografía, color, superficies, componentes y textura) con una imagen de una página terminada; una construcción lee exactamente uno.
- **Construido desde la tarea.** Una página de reservas reserva, una tienda vende, un boletín suscribe: la acción está donde la categoría la pone y la página termina en ella.
- **Custom.** Di «custom» y Hallmark diseña solo desde tu prompt, bajo las mismas reglas y comprobaciones.
- **Tu producto real.** Apúntalo a una URL, un servidor de desarrollo o una app y captura las pantallas él mismo.
- **Fotografías reales.** 755 fotos con licencia abierta, elegidas por tema y acreditadas en la página.
- **Rediseño y auditoría.** `/hallmark redesign <path>` reconstruye una página manteniendo contenido y conexiones; `/hallmark audit <path>` solo informa.

## Las compuertas

Las comprobaciones van por niveles:

- **Floor** nunca se publica: contraste, foco, movimiento reducido, hechos inventados, diseño móvil roto.
- **Reflex** son los valores por defecto en los que cae un modelo; una construcción con motivo puede anular uno dejando constancia.
- **Finish** son detalles de oficio que nunca bloquean la publicación.

## Limitaciones actuales

- Es un Skill, no un generador de páginas: necesitas un entorno de agente compatible y Node 18 o superior.
- Las comprobaciones de navegador (`sloplint --render`, capturas) también necesitan `puppeteer-core` y Chrome; sin ellos solo corren las estáticas.
- Los temas son materiales, no planes, así que dos prompts en un mismo tema producen dos páginas distintas; la consistencia viene del material, no de una plantilla fija.
- El catálogo de 50 temas y la biblioteca de fotos son opiniones curadas, no un sistema de diseño universal.
- El número de estrellas y las funciones son una instantánea; el repositorio avanza rápido.

## Veredicto

> **Recomendación principal**
> Usa Hallmark cuando un agente siga produciendo la misma landing genérica. Lo útil son las compuertas por niveles y el lint de navegador: convierten «parece hecho por IA» en una lista que el modelo puede suspender.

Hallmark encaja con desarrolladores que ya usan Claude Code, Codex, Cursor u OpenCode y quieren una capa de gusto repetible sin adoptar un sistema de diseño completo. Sirve menos si necesitas una biblioteca de componentes completa o un editor visual.

## Atribución

Hecho por Together AI. Código e instrucciones de instalación en [github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark); galería de temas en [usehallmark.com](https://www.usehallmark.com/). Licencia MIT.
