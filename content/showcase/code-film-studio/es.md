---
slug: code-film-studio
name: Code Film Studio
summary: Trece repositorios open source que encajan en un estudio de vídeo funcional — desmonta una película de referencia, elige un estilo, renderiza con código, compón los efectos y exporta con ffmpeg.
category: resource
tags: [Open Source, Video IA, Agent Skills, Motion Design, Recopilatorio, FFmpeg]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
facts:
  - key: repositories
    value: 13 · todos open source
  - key: stars
    value: 634K en conjunto (21-11-2026)
    highlight: true
  - key: styles
    value: 99 estilos de cine renderizados en código (Lemo-Opuscar)
  - key: effects
    value: 244 efectos pixel (PixelFX) · 308 efectos de composición (EffectCraft)
  - key: prompts
    value: 703 prompts · 418 con remezcla en vivo
  - key: price
    value: 0 $ para empezar · el coste real son tokens, GPUs y la licencia corporativa de Remotion
  - key: time
    value: Unas medio día para una pieza de 40 segundos con el stack instalado
  - key: requires
    value: Claude Code o Codex · Node 20+ · ffmpeg · Python 3.10+
sources:
  - title: JuneYaooo/rea-video — repositorio de GitHub
    url: https://github.com/JuneYaooo/rea-video
    publisher: GitHub
  - title: lemomo-ai/lemo-opuscar — repositorio de GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
  - title: heygen-com/hyperframes — repositorio de GitHub
    url: https://github.com/heygen-com/hyperframes
    publisher: GitHub
  - title: storytold/effectcraft — repositorio de GitHub
    url: https://github.com/storytold/effectcraft
    publisher: GitHub
  - title: Licencia y precios de Remotion
    url: https://www.remotion.dev/docs/license/pricing
    publisher: Remotion
  - title: GSAP ahora es gratis para todos
    url: https://gsap.com/pricing/
    publisher: GSAP
cover:
  src: /showcase/code-film-studio.png
---

## Trece repositorios, una cadena de producción

La lista circuló dos veces por X la semana pasada: trece repositorios de GitHub que, supuestamente, convierten a un agente de código en un estudio de cine. 99 estilos, 244 efectos, 703 prompts, cero dólares.

Leída como lista, es un montón de marcadores. Leída por lo que cada herramienta le hace a un fotograma, se vuelve una línea recta: algo que te dice cómo se rodó la referencia, algo que decide qué aspecto tiene tu película, algo que escribe los fotogramas, algo que añade las chispas y algo que exporta el archivo.

Ese es el orden de abajo. Todos los números se contrastaron con el repositorio, su README o los benchmarks del autor el 21 de noviembre de 2026, y cada afirmación sobre calidad viene de alguien que realmente publicó algo con ello.

![Cinco etapas, trece repositorios: desmontar, elegir estilo, renderizar, componer, exportar](/showcase/code-film-studio-pipeline.png)

*Las cinco etapas sobre las que se organiza este artículo. Cada repositorio pertenece a una sola.*

## Qué te da realmente el stack

- **Un mapa de la referencia, no una copia.** Rea-Video divide un vídeo terminado en planos y juzga cada uno: rodado, generado por IA, 3D, motion graphics por código o grabación de pantalla. Después escribe un plan de rodaje, prompts por plano y un `VIDEO.md` con el que tu agente puede seguir trabajando.
- **Un look que no tuviste que inventar.** Lemo-Opuscar trae 99 estilos con nombre en 15 categorías, cada uno con una película demo renderizada en código, así eliges con el ojo y no con adjetivos.
- **Fotogramas que se pueden diferenciar.** HyperFrames convierte HTML/CSS/JS en MP4 deterministas y Remotion hace lo mismo con componentes de React. Ambos dejan un proyecto que una persona puede editar: la diferencia entre un vídeo de IA y un vídeo de IA que se puede arreglar.
- **Primitivas de movimiento que ya funcionan.** GSAP para tipografía y DOM, three.js para 3D real, PixelFX para impactos pixel art, EffectCraft cuando hace falta un compositor y ffmpeg para todo al final.

## Qué sustituye

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Adobe After Effects | Partial | EffectCraft replica paneles, atajos y expresiones de AE y trae 308 efectos, pero su propio README lo llama alpha y "no recomendado todavía para trabajo profesional con clientes". Sirve para títulos, rótulos y transiciones. |
| Premiere Pro / DaVinci Resolve | Low | Aquí no hay ningún NLE de línea de tiempo. Remotion y HyperFrames son renderizadores y ffmpeg es una línea de comandos; el montaje sigue siendo tuyo. |
| Generadores de vídeo IA (Sora, Veo, Kling) | Low | Estos repos no generan metraje. Rea-Video te dice qué planos necesitan un generador y escribe los prompts: el modelo lo sigues pagando tú. |
| Blender a mano | Partial | Blender MCP maneja `bpy` desde un agente. Muy fuerte en colocación procedural y trabajo por lotes, flojo en dirección de arte. |
| Bancos de metraje y assets | Moderate | HyperFrames incluye imágenes, música, SFX y TTS de stock; el resto asume que traes tu propio material o lo generas. |
| Traspaso de Figma a movimiento | Moderate | Los estilos renderizados en código y GSAP eliminan mucha animación posterior al diseño, pero ningún repo importa un archivo de diseño limpiamente. |

## Dónde gana su sitio cada repositorio

| Repositorio | Capa | Úsalo cuando | No hará |
| --- | --- | --- | --- |
| Rea-Video | Desmontaje | Encuentras un vídeo del que quieres aprender | Rodar por ti los planos de imagen real |
| Awesome Opus 5.5 Videos | Referencia | Necesitas puntos de partida prompt-a-movimiento ya probados | Darte una historia o un guion |
| Lemo-Opuscar | Estilo | Quieres un look terminado sin diseñarlo | Funcionar igual de bien fuera de los modelos Claude |
| EffectCraft | Composición | Necesitas keyframes, expresiones y memoria muscular de AE | Sobrevivir a una entrega con cliente |
| PixelFX | Efectos | El plano es pixel art o un tráiler de juego | Ayudar en una placa de imagen real |
| ComfyUI | Assets | Necesitas stills, texturas o keyframes generados | Mantenerse estable entre actualizaciones de plugins |
| Remotion | Render | El vídeo es un componente React con datos detrás | Ser gratis para empresas de más de tres personas |
| Remotion Skills | Render | Tu agente escribe Remotion mal una y otra vez | Sustituir la lectura de la documentación |
| HyperFrames | Render | Tu agente escribe HTML más rápido que React | Producir una película de 90 puntos en una pasada |
| three.js | 3D | Necesitas partículas, volumetría, materiales reales | Diseñar la escena por ti |
| GSAP | Movimiento | El texto tiene que volar, rebotar o entrar deslizando | Animar una escena 3D |
| Blender MCP | 3D | El trabajo es modelado procedural o por lotes | Juzgar si un render se ve bien |
| FFmpeg | Exportación | Cualquier cosa tiene que convertirse en archivo | Ser opcional |

## Realidades y límites actuales

- **Cero dólares es un precio de salida, no el total.** Remotion es gratis para personas y empresas de hasta tres personas; por encima son 25 $ por asiento al mes o 0,01 $ por render con un mínimo de 100 $ mensuales. Lemo consume tokens durante 30–60 minutos por película. ComfyUI es software gratis que pide una GPU. La máxima precisión de Rea-Video necesita un modelo de visión que se paga aparte.
- **El compositor gratuito es honesto sobre estar inacabado.** El README de EffectCraft lo sitúa en el 91 % de paridad de funciones y en torno al 45 % del camino hacia producción profesional, con macOS como plataforma más probada. El benchmark de un usuario: una pieza vertical de 65 segundos exportada en unos 12 minutos desde una app de 150 MB, mientras After Effects se quedó sin memoria en la misma máquina de 64 GB.
- **El mito del clic único merece nombrarse.** La crítica con más apoyo a este stack dice claramente que no hay que creerse que HyperFrames o Remotion te van a montar un vídeo de alta calidad automáticamente. Lo que quitan es el software de edición, no la dirección.
- **La precisión se hunde con metraje recomprimido.** Las herramientas offline de Rea-Video aciertan un 88,6 % en clips recomprimidos por WeChat y un 99,6 % al añadir un modelo de visión; en un caso de unboxing, el pase offline dijo que era 35 % IA y resultó ser 97 % imagen real cuando un agente miró los fotogramas.
- **El contexto es el presupuesto real.** Instalar los trece a la vez inunda al agente con skills que no puede mantener ordenadas. Tres a la vez es el límite práctico.

## Veredicto

> **Recomendación principal:** empieza con tres — Rea-Video para aprender la estructura, HyperFrames para renderizarla, ffmpeg para terminarla. Añade el resto solo cuando un plano concreto lo exija.

La lista es real, pero es una cadena de producción, no un estudio en una caja. Lo que elimina es la factura de software y la curva de seis meses. Lo que no elimina es la parte que decide si alguien lo mira: una referencia que merezca la pena copiar, un estilo que encaje con la historia y las ganas de recortar la pieza cuatro veces.

## Una película de 40 segundos, etapa por etapa

| Etapa | Qué ocurre | Tiempo |
| --- | --- | --- |
| Desmontaje | Rea-Video divide la referencia en planos y devuelve ritmo, subtítulos y plan de rodaje | 15 min |
| Estilo | Eliges un estilo de Lemo o tomas un prompt de movimiento de la lista Awesome | 10 min |
| Construcción | HyperFrames monta la línea de tiempo HTML; tres rondas de correcciones | 30 min |
| 3D y tipografía | three.js para el plano héroe, GSAP para los títulos | 1 h |
| Composición | EffectCraft o PixelFX para transiciones e impactos | 20 min |
| Assets | ComfyUI para keyframes y texturas | 20 min |
| Exportación | ffmpeg para concatenar, loudness, subtítulos y máster final | 5 min |

Medio día, una vez. Lo lento es la primera instalación: un agente, Node, ffmpeg, Python y un plugin por herramienta.

## Métricas y coste

| Concepto | Cuánto cuesta |
| --- | --- |
| Los 13 repositorios | 0 $, mezcla de Apache-2.0, MIT y GPL-3.0 |
| Suscripción al agente | 20–200 $ al mes, según plan y uso |
| Una película de Lemo-Opuscar | 30–60 minutos de agente, mucho token |
| Remotion, licencia corporativa | 25 $ por asiento al mes, o 0,01 $ por render |
| ComfyUI | 0 $ de software, GPU y electricidad reales |
| Modelo de vídeo opcional | Por generación, según el proveedor que elijas |

Estrellas de GitHub sumadas: unas 634.000, lideradas por ComfyUI con 147,8K, three.js con 119K y HyperFrames con 87,5K. Seis de los trece se crearon en 2026: es un stack que no existía hace un año.

## Recepción de la comunidad y los debates que vale la pena leer

El elogio es concreto, y eso es buena señal. Un usuario japonés montó un vídeo musical con letra haciendo que Opus 5.5 controlara EffectCraft por MCP sin tocar la app, reportó un timing de letra casi perfecto y que toda la sesión gastó alrededor del 5 % de la cuota semanal de Claude. Otro comparó EffectCraft con After Effects en la misma máquina y aun así decidió no meterlo en trabajo con clientes: 150 MB frente a 5,4 GB, 12 minutos frente a un cuelgue por memoria, y un veredicto justo de que es "suficiente para casi todo, demasiado arriesgado para trabajar".

El escepticismo también es concreto. La contra más compartida sostiene que el vídeo IA de un clic es un mito y que quien obtiene buenos resultados es quien usa Claude con Remotion dentro de un flujo real de guion, storyboard y montaje. Encaja con lo que dicen los propios repositorios: Rea-Video insiste en material con derechos, EffectCraft se etiqueta como alpha y Remotion publica una página de licencias en vez de fingir que es gratis para todos.

Una advertencia debería acompañar cualquier lista así. En octubre apareció un repositorio que suplantaba Blender MCP, con el nombre del autor a una letra del real, issues copiados y un plugin que descargaba código de otro repo al activarse. El proyecto real es `ahujasid/mcp-for-blender`. Revisa el autor y el historial de commits antes de instalar lo que te recomiende un agente.

![Un mismo motivo, doce estilos: hasta dónde llega una biblioteca de estilos renderizada en código](/showcase/code-film-studio-styles.png)
