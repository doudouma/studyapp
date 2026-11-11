---
slug: motion-prompt
name: Motion Prompt
summary: Una biblioteca de nombres para trabajar con IA — 192 nombres de movimiento, cámara, componentes de UI, efectos de landing page y estilos fotográficos. Cada uno trae una muestra en movimiento, una frase de significado, un ejemplo de petición y una especificación precisa al milisegundo. MIT, cinco idiomas, instalable como skill para agentes.
category: resource
tags: [Diseño de movimiento, Biblioteca de prompts, Canvas, Sistema de diseño, Open Source, Multilingüe]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Shohei Ohtaki
externalUrl: https://showheyohtaki.github.io/motion-prompt/
facts:
  - key: names
    value: 192 nombres · 8 packs
    highlight: true
  - key: languages
    value: Inglés / japonés / español / chino simplificado y tradicional
  - key: each name
    value: Muestra en movimiento + significado en una frase + petición de ejemplo + motion spec
  - key: license
    value: MIT · 1,9K estrellas · 187 forks
  - key: install
    value: npx skills add showheyohtaki/motion-prompt
  - key: author
    value: Shohei Ohtaki (Daytra Inc.)
sources:
  - title: Motion Prompt — galería
    url: https://showheyohtaki.github.io/motion-prompt/
    publisher: Shohei Ohtaki
  - title: showheyohtaki/motion-prompt — GitHub (MIT)
    url: https://github.com/showheyohtaki/motion-prompt
    publisher: GitHub
cover:
  src: /showcase/motion-prompt-cover.jpg
---

## Lo que bloquea no es la imaginación, es el nombre

Shohei Ohtaki empezó publicando unos vídeos cortos en X que ponían nombre a movimientos de motion graphics y de cámara. En pocos días llegaron los comentarios. Uno decía, en esencia: **lo que me frenaba no era falta de imaginación. Era no saber cómo se llama este tipo de movimiento.**

Ese comentario se convirtió en el punto de partida del proyecto. Si la gente que domina su campo, en muchos idiomas, pusiera por escrito el lenguaje común que hace falta para trabajar bien con la IA, en forma de biblioteca consultable, sería realmente útil; así que construyó Motion Prompt: no un estilo que copiar, sino una biblioteca de nombres.

El titular lo dice sin rodeos: **For the creative directors who direct AI.**

## Cómo es un nombre por dentro

Abre cualquier número y aparece una ficha completa:

- una **muestra en movimiento** de 4,7 segundos en bucle: no es un vídeo, se dibuja en vivo sobre un canvas
- un **significado** de una frase («Una forma se transforma suavemente en otra»)
- **How to ask an AI**: una petición de ejemplo que puedes pegar tal cual en un modelo
- un **Motion spec**: el efecto desglosado en pasos que se pueden seguir — duraciones, curvas de easing, distancias, condiciones de borde, con precisión de milisegundos y píxeles
- **Copy prompt / Copy code**: la petición y la implementación de referencia, a un clic

Con #012 «Shape morph», la spec cuenta: cuatro formas, 1,175 s cada una; cada tramo primero se detiene y luego transforma en la siguiente forma en 0,58 s; cada contorno se guarda como 240 puntos y los puntos con el mismo índice se interpolan linealmente; el progreso usa backOut (s = 1,6), así que se pasa un poco; los colores se mezclan azul → coral → amarillo → menta con una easing cuadrática. Una IA que lea eso puede reproducirlo casi exacto, y una persona que lo lea puede decidir si lo quiere.

![La ficha de #012 Shape morph: muestra, significado, petición de ejemplo, motion spec y botones de copiar](/showcase/motion-prompt-detail.jpg)

## Ocho packs, 192 nombres

Ocho packs de 24 nombres cada uno, numerados de corrido:

* **001–024 motion**: motion graphics — Pop-in, Stagger, Burst, Line draw, Mask reveal, Typewriter, Count-up, Kinetic typography, Easing, Overshoot, Squash & stretch, Shape morph, Particles, Parallax… agrupados en entradas y texto, acabado del movimiento, transiciones y realces
* **025–048 camera**: movimientos de cámara — Pan, Tilt, Dolly in, Zoom in, Tracking shot, Orbit, Crane up, Dolly zoom (Vertigo), Rack focus…
* **049–072 ui**: nombres de componentes — Modal dialog, Drawer, Bottom sheet, Accordion, Dropdown, Tooltip, Popover, Toast notification, Tabs… cada uno demostrado por un cursor que lo activa
* **073–096 lp**: landing pages y efectos web — Parallax scrolling, Fade-in on scroll, Sticky header, Pinning, Horizontal scroll, Scroll snap, Scroll progress bar, Hover lift…
* **097–120 photo**: iluminación y estilos fotográficos — Backlighting, Rim light, Silhouette, Split lighting, Rembrandt lighting, Butterfly lighting…
* **121–144 motion2 / 145–168 lp2 / 169–192 camera2**: la segunda tanda de esos tres packs

Merece la pena fijarse en cómo se presentan los packs ui y lp. Cada uno se dibuja como una pequeña página de wireframe: ui en un blanco cálido y tranquilo con líneas finas y un puntero; lp como una ventana de navegador sobre un escritorio, donde el scroll, el snap y las cabeceras fijas ocurren de verdad dentro de la ventana. No estás viendo un diagrama; estás viendo el efecto.

![El pack motion: azul oscuro, cuatro colores, una animación en vivo por nombre](/showcase/motion-prompt-motion.jpg)

![El pack camera: gris claro, un solo azul, con una figura y edificios que muestran hacia dónde va la cámara](/showcase/motion-prompt-camera.jpg)

![El pack ui: wireframes en blanco cálido y un cursor que muestra cómo se activa cada componente](/showcase/motion-prompt-ui.jpg)

![El pack lp: scroll, snap y hover dentro de una ventana de navegador](/showcase/motion-prompt-lp.jpg)

## Elegir y enviarlo a tu IA

Hay tres formas de usar la biblioteca. La primera viene empaquetada como skill para agentes:

Ejecuta `npx skills add showheyohtaki/motion-prompt` en una terminal y dile a tu IA «abre la biblioteca motion-prompt»; la galería se abre en el navegador. Pulsa **Pick** en lo que quieras; cuando tengas suficiente, escribe una nota breve abajo (por ejemplo, «para el título de apertura») y pulsa **Copy picks** o **Send to AI**: los números, nombres, specs y tu nota viajan juntos al modelo.

La segunda forma no necesita instalación: busca el nombre de lo que tienes en mente y pon el nombre en tu prompt. «Haz entrar el título con un mask reveal desde abajo, 0,6 s, cada línea un poco después de la anterior»: esa frase funciona en una IA de código, en un modelo de generación de vídeo o con una persona diseñadora.

La tercera es crear otra biblioteca para tu propio campo: el repositorio trae tres prompts listos para copiar (traducir, tu propio campo, una hoja de referencia de una página) y un script que renderiza los vídeos; ya hay dos ejemplos completos.

![Después de elegir unos cuantos: la bandeja, el campo de nota y Copy picks](/showcase/motion-prompt-pick.jpg)

## Detrás de cada nombre hay una implementación que funciona

Esto es lo que lo separa de un tablero de inspiración: cada muestra es una implementación real y ejecutable, y está pensada para poder llevársela.

La convención del código es: **un elemento es una función**, `cells[i](ctx, w, h, u)` — `ctx` es un contexto de canvas 2D, `w`/`h` el tamaño de la tarjeta, `u` el tiempo en segundos dentro del ciclo. La imagen depende solo de `u`; la función no lee el reloj ni usa números aleatorios, así que la reproducción en vivo y el renderizado fotograma a fotograma dan los mismos cuadros. Colores, tamaños, duración del ciclo y funciones compartidas viven en el kit de cada pack; los elementos dependen solo del kit de su pack y no hay librerías externas.

La misma convención se ve en la interfaz pública: `api/v1/` son archivos estáticos — `catalog.json` (metadatos de los 192), `{ja,en}/catalog.tsv` (índice), `e/{id}.txt` (la spec y el código completo de una entrada), `p/{id}.txt` (un prompt listo para pegar), `kit/{pack}.js` (código compartido del pack). La CLI del skill solo hace peticiones GET, no lee nada de tu proyecto ni sube nada; `pick` abre un escucha temporal en `127.0.0.1` que recibe únicamente los números y la nota que elegiste en la galería.

## Un look por pack, a propósito

motion es azul oscuro con cuatro colores; camera es gris claro con un azul; ui es blanco cálido, negro y un azul; lp es una ventana de navegador sobre un escritorio gris pálido con bermellón como acento; photo no tiene paleta común: cada tarjeta se pinta con los colores de su propia escena y el efecto entra y sale con un fundido para poder comparar.

El README lo dice claro: lo que un pack tiene que clavar son los **nombres**, no un estilo de la casa. Por eso, dentro de una misma biblioteca, cinco packs parecen cinco productos pequeños distintos; solo se mantiene igual la manera de escribir nombres y specs.

![El pack photo: una escena por tarjeta, cada una con su paleta, con fundido de entrada y salida para comparar](/showcase/motion-prompt-photo.jpg)

## Cinco idiomas, y algo de cuidado con las personas

Cada nombre, significado y petición de ejemplo existe en inglés, japonés, español, chino simplificado y chino tradicional (las traducciones al español, tradicional y simplificado las iniciaron colaboradores de la comunidad). La interfaz de la galería está en inglés y japonés, y tiene modo oscuro y un botón **Pause**: una pulsación y todas las animaciones de la página se detienen, algo importante para quien es sensible al movimiento.

En el móvil la rejilla pasa a una sola columna y muestra uno o dos nombres a la vez: para «buscar una palabra» funciona incluso mejor que la rejilla de escritorio.

![La disposición en una columna en el móvil](/showcase/motion-prompt-mobile.jpg)

## Veredicto

> **Traduce el gusto en vocabulario.**
> Donde la mayoría se atasca al trabajar con IA no es en la descripción: es en no saber que la cosa tiene un nombre. Esta biblioteca pone 192 nombres, cómo son, cómo pedirlos y cómo reproducirlos con precisión en una sola página, y hace que todo se pueda mover bajo MIT: a tu prompt, a tu proyecto de vídeo, a tu propio campo.

## Atribución

Motion Prompt es de Shohei Ohtaki (Daytra Inc., X [@showheyohtaki](https://x.com/showheyohtaki)); la galería está en showheyohtaki.github.io/motion-prompt y el código tiene licencia MIT en GitHub (conserva la primera línea del código de un elemento cuando lo reutilices). Las traducciones al español, chino tradicional y chino simplificado comenzaron con @herberthcr, @daddydanielt y @xhonye; el formato de galería más skill se inspira en Lucian UX/UI Prompt. Las capturas de este artículo las tomamos nosotros de la galería en vivo (escritorio 1280×900, móvil 390×844); las muestras y la gráfica pertenecen al autor.
