---
summary: Un prompt, críticos ciegos y una referencia dorada: cómo Shikhar construyó un mundo de papel infinito en three.js.
tags: [Three.js, Papercraft, Fable 5.2, Opus 5.5, Críticos ciegos, Juego de navegador]
facts:
  - key: method
    value: Un subagente por pieza · críticos A/B ciegos
    highlight: true
  - key: models
    value: Fable 5.2 + Opus 5.5
  - key: stack
    value: three.js · Vite · MIT
  - key: source
    value: ~900 KB de JS · más de 50 módulos
  - key: assets
    value: 19 MB de modelos, texturas y audio
  - key: biomes
    value: 5 publicados · 15 explorados · día y noche
  - key: target
    value: 60 fps en un portátil de gama media
  - key: author
    value: Shikhar — haciendo cosas chulas con IA
  - key: reception
    value: 51 K visitas · 1,4 K me gusta · 85 respuestas
---

## El brief antes del juego

Lo más útil que publicó Shikhar no es el juego. Es el prompt. El nombre final es Papertrails; casi todo lo demás del documento sobrevivió. Lo reproduzco entero abajo, palabra por palabra desde la imagen que publicó, porque el resto del texto trata de lo que hizo con él.

## El prompt original

Reproducido tal cual desde la imagen del prompt en su hilo:

> **Build "Pop-up Atlas", a browser 3D walking toy, in Three.js.**
>
> **Reference**
> none yet. First generate 4-6 concept frames with imagegen (tilt-shift papercraft diorama, tiny paper traveller, terrain folding up out of an open book, warm lantern light). Collect photos of real pop-up books and papercraft dioramas. These become the target. Match their look and tactile paper feel exactly.
>
> **Details**
> small paper traveller walks across an endless open pop-up book. Terrain ahead folds up out of the flat page: hinged paper tiles (hills, trees, houses, bridges, rivers) rise on springs, overshoot and settle with a slight wobble. Wave function collapse picks tiles so neighbours always connect. Tiles behind fold back flat. Look: matte cardstock, limited warm palette, visible paper edges and fibre, layered cut-paper silhouettes, soft shadows between layers, high-angle tilt-shift camera with strong DOF blur, warm key light + cool fill. Every fold gets a soft paper "flap" sound with varied pitch. Controls: WASD or click to walk, smooth camera follow. No physical-looking UI, no external brand assets.
>
> **Tools**
> Blender (tile models with hinge pivots, traveller, fold animations, baked paper materials → glTF). Codex CLI imagegen (concept frames, paper textures, printed details). Web Audio procedural paper sounds (or samples if better).
>
> **How to work**
> autonomous, no questions; log assumptions. Study reference → checklist of components with measurable targets. One sub-agent per component, each owns its files, project stays running. Loop on every component: separate harsh blind critic, A/B side by side vs reference in random order, says which is better + fixes. Continue until critics can't reliably pick the original and are wowed. Also judge fold motion/spring feel, walking feel, sound, performance (steady 60 fps mid-range laptop). Revert anything that makes it worse. Append-only log. User's explicit instructions override critics.
>
> **Deliver**
> playable Vite build + run instructions, 30-second gameplay capture, final side-by-sides and scores.

No es «haz un juego de papel». Es una lista de cosas que se pueden comprobar. Esa diferencia es todo el proyecto.

## El agente tuvo que fabricar su propia referencia

No empezó con código. El agente generó fotogramas conceptuales con GPT Image y recogió fotografías reales de pop-up, y después midió sus colores, bordes e iluminación. La referencia se convirtió en un conjunto de números antes de ser un estilo.

Luego vino la decisión que el agente no podía tomar: Shikhar eligió una imagen como referencia de estilo concreta. El agente hizo capturas del juego y generó un objetivo de estilo dorado para cada bioma; los animales se diseñaron igual. A partir de ahí, cada render tenía algo concreto contra lo que fallar.

## Un subagente por pieza y un crítico que no sabe cuál es cuál

Las reglas de trabajo de su prompt son la parte más personal del proyecto. Se leen como un protocolo de revisión, no como un deseo: el agente trabaja solo, no hace preguntas y registra sus suposiciones. Convierte la referencia en una lista de componentes con objetivos medibles, da a cada componente su propio subagente y sus archivos, y mantiene el proyecto funcionando. Cada build pasa por un crítico ciego y duro aparte, A/B lado a lado contra la referencia en orden aleatorio. El bucle solo termina cuando los críticos «no pueden distinguir el original y se quedan boquiabiertos». También se juzgan el movimiento del pliegue, la sensación de caminar, el sonido y los 60 fps en un portátil de gama media; todo lo que empeora se revierte; el registro es solo de añadidos; sus instrucciones explícitas mandan sobre los críticos.

El repo conserva las fronteras. Los archivos empiezan con `OWNER: render agent`, `OWNER: fold agent`, `OWNER: wfc agent`; cada agente mantuvo su configuración y sus notas de ajuste. Los críticos estaban separados de los constructores y veían las dos versiones en orden aleatorio, así que no podían premiar la que acababan de hacer.

Eso ya no es escribir prompts. Diseñó un proceso de revisión y lo dejó correr sin hacer preguntas.

## Objetivo dorado, cinco fotogramas

Publicó el mismo plano en cada pasada: primera build, pasada de arte, pasada de biomas, pasada dorada, ahora, objetivo dorado. La primera build es luminosa y vacía. La de arte sustituye los árboles provisionales por recortes de papel impresos. La de biomas llena el suelo de objetos. La dorada añade el pueblo y la luz de los faroles. El último fotograma es el objetivo, no el juego; la distancia entre «ahora» y «objetivo» es para lo que servía el bucle.

Después, los números. La inclinación de cámara pasó de 46° a 42° para igualar el tres cuartos más bajo de la referencia. La distancia de seguimiento fue de 14,8 a 12,6 y luego a 10,8, porque el encuadre dorado era unas 1,5 veces más cerrado. La saturación bajó de 1,04 a 0,92; el radio de desenfoque de 19 a 12,5; la densidad de animales subió de 1 a 1,5 porque la imagen dorada tenía unos diez animales en el encuadre. No son adjetivos de moodboard. Son medidas con una dirección.

También anuló al agente, y el código guarda el recibo. Un gato que habría adoptado al viajero está desactivado con `/* user 2026-11-17: no companion */`; una conducta de seguimiento está a cero con `/* user 2026-11-17: animals never follow the traveller */`. Los críticos podían comparar renders. No podían decidir si un gato debía seguirte. Eso era cosa suya.

## El mapa que quedó

Las guías de estilo exploraron quince tipos de bioma. El mapa publica cinco: heartland en el origen, desierto al este, nieve al oeste, floración al sur y pinar al norte, cada uno con día y noche. El origen siempre es la granja otoñal cálida, y los cuatro vecinos están fijados para que cada bioma quede a unas doce casillas del inicio.

El mundo se genera con wave function collapse, las piezas suben sobre muelles y se pliegan planas detrás del viajero, los animales pastan, picotean, se dispersan y se posan, y Tab o E abre un atlas que se dibuja solo mientras exploras. El mapa sigue creciendo en todas direcciones.

## Lo que hay de verdad en el repo

No es un montaje de 54 segundos. El repositorio público tiene unos 900 KB de JavaScript en más de cincuenta módulos, además de modelos GLB de piezas y viajero y 19 MB de modelos, texturas y audio. three.js es la única dependencia en tiempo de ejecución. La licencia es MIT. La versión jugable está en GitHub Pages, con parámetros de URL para semilla, calidad, silencio, noche, vida y animales. El vídeo es una captura de esa versión.

## La parte que es suya

Los modelos escribieron el código. El estándar es suyo. «Continúa hasta que los críticos no puedan distinguir el original y se queden boquiabiertos» no es un truco de prompt; es un umbral de gusto, y lo fue apretando con números. Los artefactos más personales del repo son los comentarios que registran sus vetos y las notas «fixer» que movieron un valor de una medida a otra.

Si hay que llevarse una cosa de su build, que sea el orden: referencia primero, criterios después, código al final, y un crítico que no sabe qué versión está mirando. El mundo de papel es el resultado. El bucle es el método.
