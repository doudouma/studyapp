---
slug: slotbound
name: Slotbound
summary: Un juego indie hecho con Codex por un desarrollador que dice no saber programar: 50.000 copias en 48 horas y los doce meses de demo que los posts virales omitieron.
category: ai
tags: [Juego con IA, Steam, Indie Dev, Codex, Love2D, Caso de estudio]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: KLeo (KKLeoAI)
externalUrl: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
facts:
  - key: sales
    value: 50.000 copias en las primeras 48 horas (dato del desarrollador)
    highlight: true
  - key: gross
    value: 356.000 $ brutos, antes de la comisión de Steam, impuestos y reembolsos
  - key: wishlists
    value: Más de 100.000 antes del lanzamiento · 50.000 a finales de julio
  - key: peak
    value: Más de 15.000 jugadores simultáneos el 15 de noviembre (SteamDB)
  - key: stack
    value: Love2D · VS Code + Codex · Claude / Gemini · Nano Banana / PixelLab
  - key: art
    value: Parte generada, parte de packs comprados, parte dibujada a mano para el lanzamiento
  - key: timeline
    value: Desarrollo desde 2025-10 · demo 2026-07-10 · lanzamiento 2026-11-13 UTC
  - key: caveat
    value: Ventas e ingresos autodeclarados, sin auditar
sources:
  - title: 一个不会写代码的人，48小时卖出5万份游戏：AI造富故事，最容易被看漏的真相
    url: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
    publisher: KLeo / KKLeoAI
cover:
  src: /showcase/slotbound-cover.png
---

## Lo primero que hice fue buscar la aritmética que falta

La primera vez que esto apareció en mi feed, mi reacción fue la misma que la tuya: alguien ha redondeado la cifra.

Un desarrollador coreano que dice no saber programar. Un juego hecho con IA. 50.000 copias en 48 horas en Steam, 356.000 $ brutos, que en los reposts se convirtieron en 470 millones de wones. La versión limpia añade dos suscripciones de IA de 30.000 wones al mes, ningún otro coste, nada de marketing y arte y código enteramente por IA.

Así que volví sobre los posts públicos del desarrollador y los anuncios de Steam. La cifra de ventas se sostiene. La aritmética que la rodea, no.

![La cápsula de Slotbound en Steam](/showcase/slotbound-capsule.jpg)

*Desarrollador y editor: Optima Arch. Lanzado en Steam el 13 de noviembre de 2026 (UTC).*

Esto es lo que está realmente registrado. Las 50.000 copias y los 356.000 $ vienen de un mensaje del propio desarrollador el 15 de noviembre: ingresos brutos, antes de la comisión de Steam, impuestos, reembolsos y costes de desarrollo. Las 100.000 listas de deseos se anunciaron a finales de septiembre, antes del lanzamiento. SteamDB registró más de 15.000 jugadores simultáneos el 15 de noviembre, que es la parte que el marketing no puede falsificar: la gente estaba jugando, no solo comprando.

Lo que no está registrado es la afirmación sobre los costes. «Dos suscripciones de 30 $, sin tokens extra, sin otros gastos» no tiene una fuente de primera mano que yo haya encontrado. Contar una buena historia no exige inventarse la contabilidad.

## El juego es una tragaperras que construye un ejército

Antes del ángulo de la IA, el diseño merece atención, porque las ventas son aguas abajo de él.

El pitch cabe en una frase, lo que es más raro de lo que parece: ¿y si una tragaperras reclutara tu ejército? Giras un carrete de 3 × 3 y salen guerreros, magos y otras unidades. Fusionas las débiles hacia arriba, añades objetos y modificadores y observas si la formación sobrevive a la siguiente oleada.

Dos placeres conocidos están cableados juntos. El giro es recompensa aleatoria: cada tirada es una pequeña espera de una sorpresa. La fusión es crecimiento controlado: incluso una tirada mala se rescata con decisiones. Pierdes y culpas a la configuración que montaste dos rondas antes. Ganas y quieres ver si una combinación más absurda también funciona. Es el mismo motor que hay debajo de Vampire Survivors y de medio género.

Lo importante para esta historia: nada de eso necesitaba IA. El bucle funcionaría si un humano hubiera escrito cada línea.

## Lo que la IA escribió de verdad

En un post de mayo el desarrollador dijo que el código de la demo era enteramente generado por IA y que él no podía escribir una línea de código. Esa frase se cita mucho. La parte siguiente se cita mucho menos.

![Cuatro cubos: ingeniería, pensamiento, arte y las decisiones que siguieron siendo humanas](/showcase/slotbound-split.png)

| Cubo | Quién | Qué cubrió |
| --- | --- | --- |
| Ingeniería | Codex en VS Code | La demo y la mayor parte del código final, sobre Love2D |
| Pensamiento | Claude, Gemini | Diseño de sistemas, puntos muertos, segundas opiniones |
| Arte | Nano Banana, PixelLab | Algunas escenas y sprites, junto a packs comprados |
| Decisiones | El desarrollador | Dificultad, legibilidad, sensación de recompensa, qué cortar |

Así que «todo el arte es IA» es falso tal como se dice. Ha contado públicamente que algunas unidades salieron de packs comprados y que la versión final añadió bastante arte dibujado a mano. El motor es Love2D, no una herramienta sin código. Y el reparto de arriba es su propia descripción de su flujo, no una hoja de costes completa.

El hábito que describió cuando le preguntaron por los prompts es lo más transferible de toda la entrevista: no le entregues al modelo una tarea enorme y vaga. Haz una función a la vez, di las restricciones y los archivos relevantes, prueba la salida de inmediato y, cuando se desvíe, cuéntale exactamente qué se rompió y qué no debe tocarse.

Eso no es un truco de prompting. Es como un ingeniero cuidadoso le habla a un junior.

## El trabajo que la IA no pudo quitar

Pídele a cualquier modelo una tragaperras y te devolverá una tragaperras que funciona. Lo que no te dirá es que el nivel tres es demasiado difícil, que el botón de fusionar está escondido tras el tooltip, que la recompensa llega medio segundo tarde para sentirse bien, o que un mecanismo del que estás orgulloso debería borrarse entero.

El desarrollador dijo algo parecido cuando salió la demo: la IA le dejó hacer el juego, pero si es divertido, está equilibrado y se entiende sigue siendo decisión suya.

Esa frase es todo el caso, sinceramente. El código se externalizó. El criterio, no.

## «Sin marketing» es la frase que más engaña

La versión viral dice que no hizo marketing más allá de un post en redes. Sí dijo que se saltó el marketing tradicional. Luego miras las fechas.

![Cronología desde el primer build hasta el lanzamiento](/showcase/slotbound-timeline.png)

Empezó en octubre de 2025. Una versión jugable llegó a itch.io a finales de junio de 2026. La demo de Steam abrió el 10 de julio. Después vinieron correcciones, pasadas de interfaz, ajustes de dificultad y actualizaciones de jugabilidad. Las listas de deseos llegaron a 50.000 a finales de julio y a 100.000 a finales de septiembre. El lanzamiento se retrasó por la revisión de build de Steam, y escribió un post largo sobre la exposición que temía perder.

Nada de eso es un solo post. Una demo no es un adorno de la ficha de tienda para un juego de sistemas: es el anuncio más honesto que tiene el género. Ver un clip te dice que pinta bien. Jugar media hora te dice si lo vas a echar de menos.

No comprar tráfico no es lo mismo que no hacer adquisición de usuarios.

## Lo que yo copiaría, en orden

**Uno: un bucle que se explique en una frase.** «Una tragaperras que construye tu ejército» no necesita tutorial. Si tu idea requiere tres minutos de preparación antes de la diversión, el problema es la idea, no el marketing.

**Dos: usa la IA para abaratar la validación, no para agrandar el juego.** Construye el bucle completo más pequeño —puedes ganar, puedes perder, algo reacciona— y extiéndelo después. No pidas 300 niveles el primer día.

**Tres: ponlo delante de desconocidos pronto.** Que tú lo disfrutes es un punto de partida, no una prueba. Que alguien lo abra, que alguien juegue una segunda partida, que alguien lo comparta sin que se lo pidas: esas son las señales que merecen otro mes.

## Veredicto

> **Recomendación principal:** trata Slotbound como prueba de que alguien sin formación en programación ya puede llegar al mercado, no como prueba de que el mercado sea fácil. Copia el orden —bucle, prototipo barato, demo pública— e ignora el cuento de los costes.

El logro es real y más grande que los memes: alguien sin background de programación publicó un juego comercialmente viable en unos trece meses. La corrección es más pequeña pero importa: no se saltó el año, la demo, los parches ni el criterio. Se saltó la sintaxis.

Esa distinción es la diferencia entre «cualquiera puede hacerlo para el viernes» y «cualquiera puede empezar ya».

## Lo que esta historia no demuestra

- **Un juego, un género, un lanzamiento.** Un roguelite de tragaperras es un género probado, legible y barato de prototipar. Un juego narrativo o de acción 3D no encajaría en esta cronología.
- **Las cifras son autodeclaradas.** 356.000 $ brutos no es neto, y nada está auditado. La comisión de Steam, los precios regionales, los reembolsos y los impuestos salen de ahí.
- **El sesgo de supervivencia hace mucho trabajo.** Por cada Slotbound hay cientos de juegos asistidos por IA que se lanzaron al silencio. Estás leyendo el que funcionó.
- **«No saber programar» no es «no saber pensar técnicamente».** Dirigió un motor, una arquitectura y un conjunto de herramientas. Eso es una habilidad, solo que no es de sintaxis.
- **La lista de herramientas no es una receta.** Codex más Claude más Nano Banana produjeron este juego por lo que él les pidió. El mismo stack con un brief vago produce un prototipo que nadie juega.
- **La IA no resuelve el descubrimiento.** La demo, las actualizaciones y el embudo de listas de deseos hicieron el marketing. Ese trabajo sigue siendo tuyo.
