---
summary: "Un mapa curado de 369 proyectos de código abierto de vídeo y edición automática creados para Claude Code, Codex y otros agentes de programación, filtrados por salida, preparación para agentes y documentación."
tags: [Vídeo con IA, Código abierto, Claude Code, Codex, Skills para agentes, Remotion]
facts:
  - key: projects
    value: "369"
    highlight: true
  - key: author
    value: "@leo_xiaolei"
  - key: platform
    value: X / Feishu
  - key: language
    value: Chino
  - key: focus
    value: Vídeo con IA y edición automática
  - key: data
    value: Instantánea de la API de GitHub 2026-10-27
---

## Qué es

Un análisis en chino de 369 repositorios de código abierto que permiten a agentes de programación como Claude Code y Codex generar vídeo, editar metraje automáticamente o renderizar motion graphics desde código. El autor ignora deliberadamente el habitual «filtro de estrellas de GitHub», porque las estrellas no miden el valor real de producción: algunos repositorios con apenas un puñado de estrellas resuelven un problema muy concreto mejor que otros con muchas más.

La lista es un mapa, no un benchmark. Cada entrada apunta a un repositorio, una Skill, un plugin o un servidor MCP, y el artículo los agrupa por flujo de trabajo para que puedas elegir un punto de partida en lugar de clonar 369 repos.

## Cómo se filtra la lista

Tres reglas deciden qué entra:

1. **Debe producir vídeo o movimiento.** Se excluyen las escenas 3D puramente web; la salida debe ser una película, un clip o un conjunto de prompts renderizados por código que un agente pueda reproducir.
2. **Debe estar pensado para agentes.** Skills, plugins, servidores MCP o toolkits diseñados explícitamente para Claude Code, Codex y agentes similares.
3. **Debe tener un README completo.** Sin documentación no se puede verificar el valor práctico.

Todas las cifras de estrellas y datos de repositorios son una instantánea de la API de GitHub del 2026-10-27, así que trátalas como una señal puntual y no como un ranking actual.

## Los cuatro frameworks destacados

| Proyecto | Estrellas | Qué hace |
| --- | --- | --- |
| lemo-opuscar | 8.322 | Un motor de estilos visuales con 59 estilos de vídeo renderizados por código ajustados para Claude Opus 5.5. La muestra «OPUSCAR 98» dura 6m31s y muestra 98 estilos sin llamar a un modelo de generación de vídeo. |
| huashu-art-motion | 5.418 | Una Skill de animación artística que combina 36 estilos artísticos, 9 gramáticas de narración y 8 clips parametrizados. Fuerte para explicativos de marca sin presentador. |
| huashu-motion | 1.766 | Automatiza películas comerciales de lanzamiento de producto: lee la información del producto, propone tres direcciones, escribe la película y luego compone la música con notación ABC. Su edición visual en el navegador permite hacer clic en un fotograma y describir el cambio. |
| sweety-handdraw-video | 903 | Un pipeline de explicativos dibujados a mano compatible con Codex: entra un tema o artículo, salen guion, storyboard e ilustraciones, y luego el renderizado local alinea a nivel de fotograma con síntesis de voz VoxCPM 2. |

## Otros grupos que conviene conocer

- **Edición automática y human-in-the-loop:** browser-use/video-use corta metraje desde transcripciones a nivel de palabra y gestiona subtítulos y color con FFmpeg. OpenChatCut y BaoCut añaden ajustes manuales de timeline tras la pasada automática.
- **Experimentos frontera con pocas estrellas:** fragua (11 estrellas) se ejecuta en local con FFmpeg y sin API key para quitar silencios en vertical y quemar subtítulos. cutloupe (0 estrellas) expone un MCP y una timeline visual, y devuelve fotogramas renderizados reales al modelo mediante un comando `look`.
- **Prompts y fichas de plano de código a vídeo:** awesome-opus5-5-videos reúne 703 prompts de Opus 5.5. video-shotcraft incluye 152 recetas de plano estructuradas y 209 previsualizaciones de movimiento para trabajos comerciales con Remotion.
- **Ingeniería inversa de movimiento:** lovisdotio/motion2code reconstruye un vídeo de movimiento existente como SVG inline y timelines GSAP, para comparar fotograma a fotograma con el original.
- **Explicativos, presentadores y videoclips:** Raven lee el historial de Git de un repositorio y genera un explicativo dibujado a mano de dos minutos; stickman-video-director apunta a canales de divulgación con monigotes sin rostro; lanshu-create-ai-presenter-video se mantiene neutral respecto al proveedor para imágenes de presentador autorizadas; digital-human-koubo convierte una imagen y texto en vídeo con sincronización labial mediante Renoise MCP y Grok Video; PDoomVideo publica una base completa de código fuente para videoclips.

## Limitaciones actuales

- **Es un estudio, no una prueba.** El autor leyó repositorios y READMEs; no hay un benchmark de calidad de salida cara a cara.
- **Las estrellas caducan por diseño.** La instantánea es de un solo día, y los proyectos de agentes se mueven rápido y pueden cambiar cada semana.
- **Primero en chino.** El análisis y los comentarios de selección están en chino, aunque la mayoría de los repositorios enlazados están en inglés.
- **Riesgo de enlaces muertos y mantenimiento.** Una lista curada de 369 repos incluirá inevitablemente proyectos abandonados o renombrados; revisa el README, la licencia y el último commit antes de adoptar uno.
- **Sesgo de alcance.** La lista se centra en vídeo y movimiento para agentes de programación, así que los editores de vídeo generales, el trabajo 3D puramente web y las herramientas no orientadas a agentes quedan fuera a propósito.

## Veredicto

> **Recomendación principal**
> Úsalo como generador de listas cortas, no como clasificación. Empieza por los cuatro frameworks destacados si necesitas un flujo probado, y luego explora la sección de pocas estrellas para cubrir una carencia concreta de tu pipeline.

La parte más útil es el propio filtro: la salida debe ser vídeo, la herramienta debe poder ser llamada por un agente y el README debe estar completo. Es una heurística de selección mejor que el número de estrellas para quien construye un pipeline de vídeo con IA usando Claude Code o Codex. Verifica el estado actual de cada repositorio antes de comprometerte.

## Atribución

Este caso enlaza una reproducción en Feishu de WaytoAGI. El hilo original fue publicado por 刘老板 (@leo_xiaolei) en X el 2026-10-27; los derechos siguen siendo del autor original y el enlace original es la fuente autoritativa.
