---
summary: Un juego de samuráis 3D jugable entregado en 24 horas por un solo desarrollador con seis herramientas de IA — el artículo lo descompone en seis pasos, dos condiciones previas y dos puntos donde copiarlo se atasca.
tags: [Juego IA, Three.js, Blender, Claude Code, Prototipo de Juego, Flujo de Trabajo]
facts:
  - key: build time
    value: 24 horas (afirmación del autor)
    highlight: true
  - key: tools
    value: 6 — Opus 5.5 · Flux 3 Max · GPT Image · Tripo · Blender · Three.js
  - key: author
    value: Shikhar (@xikhar) · tercer juego hecho con IA
  - key: platform
    value: Navegador · gratis
  - key: playtime
    value: 30–40 minutos
  - key: launch
    value: 2,6 M de vistas en dos días
  - key: inspiration
    value: Video2Game de OdinLovis
---

## El juego

El 4 de noviembre de 2026, el desarrollador Shikhar lanzó Sumiro — una aventura de samuráis en estilo tinta que corre gratis en el navegador. Un viajero con sombrero de paja cruza acantilados brumosos, toriis y escaleras de piedra; trepa, usa ascensores y avanza por capítulos, con una duración de 30–40 minutos. El hilo de lanzamiento superó los 2,6 millones de vistas en dos días.

![La pantalla de título de Sumiro: estilo tinta, el samurái de pie sobre el agua](/showcase/sumiro-title.jpg)

![Extracto de la demo en juego (del original de 97 segundos), la parte más vistosa del proyecto](/showcase/sumiro-demo.gif)

Su frase fue: "Ahora cualquiera puede hacer juegos". La nota china en la que nos basamos dedica su extensión a lo que esa frase omite — las 24 horas reales y las condiciones detrás.

## Cómo se repartieron las 24 horas

Seis pasos, seis herramientas de sobra (Opus 5.5, Flux 3 Max, GPT Image, Tripo, Blender, Three.js). Cada paso alimenta el siguiente:

1. **Empezar con un video, no con código.** Flux 3 Max genera un clip de referencia corto — ese video es la biblia visual del proyecto. Mundo, personaje, paleta y cámara derivan todos de él, siguiendo el enfoque Video2Game de OdinLovis.
   ![El producto del paso 1: el clip de referencia del que salen todas las escenas](/showcase/sumiro-step1-reference.jpg)
2. **Trocear el video en escenas.** Las capturas se convierten en assets reconstruidos en Blender y colocados en Three.js. El detalle fácil de pasar por alto: flujos dinámicos dentro de Claude Code, con varios agentes construyendo y verificándose entre sí en paralelo — "un grupo de agentes que trabaja por separado y se valida", no un solo agente de punta a punta.
   ![El resultado del paso 2: cascada, toriis y escaleras, todo reconstruido de capturas del video](/showcase/sumiro-step2-scenes.jpg)
3. **Construir el personaje.** Cuatro vistas laterales generadas con GPT Image desde una captura, Tripo las convierte en modelo 3D y Opus añade física de tela y animación.
   ![Cómo cuatro vistas laterales se convierten en un personaje 3D animado (acelerado)](/showcase/sumiro-step3-character.gif)
4. **Jugarlo primero.** Todo el paso es una frase: juega el prototipo antes de añadir más, confirma que de verdad corre. El único movimiento del pipeline que va contra el instinto de la IA.
5. **Dejar que los agentes llenen los niveles.** GPT Image genera arte conceptual por nivel con el estilo ya fijado, hasta ocho imágenes por nivel; cada concepto se convierte en un nivel 3D jugable.
   ![Paso 5: arte conceptual de niveles generado con GPT Image en un solo estilo — una imagen por nivel](/showcase/sumiro-step5-concepts.jpg)
6. **Iterar.** Jugar, reportar bugs, dejar que los agentes arreglen, volver a jugar.
   ![De la imagen conceptual a un nivel jugable (acelerado)](/showcase/sumiro-step6-level.gif)

## Lo que la frase de moda omite

El artículo exige dos condiciones antes de repetir "ahora cualquiera puede hacer juegos":

**Las 24 horas son una cifra de tercer juego, no de primer juego.** Antes de Sumiro, Shikhar ya había lanzado Spiderbench (un juego de Spider-Man en navegador — ese tomó tres días más una suscripción Claude 5x) y Walden, un duelo de katanas que llama su primer prototipo. Las lecciones caras — alinear assets de Blender con Three.js, evitar que los agentes paralelos se estorben, que la tela no atraviese el cuerpo — se pagaron antes de que este reloj de 24 horas arrancara.

**Dos partes que el flujo no cubre.**

> La música es la parte sin resolver: los modelos no oyen, así que hace falta una cadena de herramientas aparte de generación musical — el séptimo paso fuera de los seis.

El otro hueco son los controles: el video de demo se ve rígido porque lo operó el agente con grabación por script. Una persona jugándolo se mueve mucho mejor — pero eso no es lo que produjeron las 24 horas.

## Los dos puntos donde copiarlo de verdad se rompe

* **Juzgar el video de referencia.** Abrir las herramientas lo puede hacer cualquiera. Lo difícil es saber si el video basta — si el estilo aguanta un nivel, si la silueta del personaje se lee bien, si la paleta se ensucia en 3D. Elegir mal aquí tira a perder los otros cinco pasos.
* **El paso 4 es solo humano.** La IA nunca se cansa de añadir — assets, arte conceptual, niveles. Pero jugar el prototipo antes de continuar es un juicio que solo una persona puede hacer; el autor lo convirtió en paso propio porque ya pagó por saltárselo.

## Veredicto

> **Léelo como una historia de compresión, no de democratización.**
> La cifra asusta — 24 horas, seis herramientas, un juego jugable — pero pertenece a alguien que ya había hecho dos juegos y pisó antes cada hoyo. Las herramientas suben mucho el suelo; el techo se lo queda quien sigue practicando. De los seis pasos, el juicio del paso 1 es el único que no se puede copiar; el resto se sigue tal cual está escrito.

## Atribución

Caso armado a partir de la nota china de 挥码天涯（大黑猫） "用 AI 做游戏的完整流程", el hilo de lanzamiento del propio Shikhar y cobertura de terceros. La cifra de 24 horas es afirmación del desarrollador, repetida (no verificada de forma independiente) por AIGamer y otros medios.

Las imágenes de este caso provienen del artículo de análisis y del hilo de Shikhar; el copyright sigue siendo de sus publicadores originales.
