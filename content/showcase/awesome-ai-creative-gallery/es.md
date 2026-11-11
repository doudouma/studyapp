---
summary: Una galería open source y filtrable de flujos de creación con imágenes AI cuyos casos se remontan a fuentes concretas: un tutorial de Datawhale, la guía oficial de prompts de OpenAI, 24 hilos de X y un reporte de Reddit, cada uno con su prompt de referencia.
tags: [Imagen AI, Biblioteca de Prompts, Open Source, GPT Image 2.6, Flujo de Diseño, Galería Curada]
facts:
  - key: cases
    value: 49 casos · 7 categorías de flujo
    highlight: true
  - key: author
    value: li-xiu-qi (GitHub)
  - key: license
    value: MIT (código) · los medios siguen siendo de sus autores
  - key: model focus
    value: GPT Image 2.6 (en expansión)
  - key: platform
    value: Sitio estático · GitHub Pages
  - key: ui languages
    value: Chino · Inglés
  - key: references
    value: 24 hilos de X · guía de OpenAI · 2 artículos · Reddit
---

## La galería

[Awesome AI Creative Gallery](https://li-xiu-qi.github.io/awesome-ai-creative-gallery/) es una colección open source con licencia MIT de flujos de trabajo para creación de imágenes con IA, curada por el usuario de GitHub li-xiu-qi y publicada como un sitio estático sin dependencias (clona el repo, abre `index.html`, listo). Hoy reúne 49 casos en siete categorías — 动态与表情 / 游戏与互动 / 图标与 SVG / 知识与表达 / 商业与设计 / 图片编辑 / 角色与故事 — con filtros por escenario, flujo y versión del modelo, interfaz bilingüe chino-inglés y búsqueda por palabra clave.

Su propio README fija la regla de lectura: primero mira el efecto, luego encuentra el método. Cada caso enlaza a su fuente original y trae el prompt de referencia.

## De dónde salen sus casos

La galería no es un volcado de prompts; su archivo de datos cita fuentes con nombre para cada caso:

* **24 hilos originales de X** — los creadores detrás de las demos (MrLarus, umesh_ai, chetaslua, LinusEkenstam, gabrielchua y otros). Las planchas de personaje, las ediciones con círculos marcados y los bucles de stickers se remontan a un post concreto.
* **Un tutorial de lanzamiento** — el artículo de Datawhale [整理了最新GPT-Images-2.6的全网10个爆火用法！](https://mp.weixin.qq.com/s/jdxCmAGWznmZukPuhQUpzA), que destila el material en diez jugadas de arranque, cada una con un prompt listo para copiar — desglosadas una por una en la sección siguiente.
* **Un reporte de campo en Reddit** — una prueba directa de la nueva función de GIF, desde un usuario y no desde marketing.
* **Una colección hermana** — [ZeroLu/awesome-gpt-image](https://github.com/ZeroLu/awesome-gpt-image), el repo vecino que referencia.

## Las diez jugadas de arranque

El tutorial reparte sus diez jugadas en cinco familias de escenarios. Cada una viene con su "cómo empezar" y un prompt de referencia; los prompts son traducciones al español de los originales en chino del tutorial.

### Personajes y assets dinámicos

**1. Personaje estático → sticker animado en bucle.** Reduce lo que antes exigía rigging por capas en AE/Live2D a una sola instrucción. Empieza con un sujeto y una acción, cámara fija, y vuelve a la pose inicial al final — luego revisa la costura del bucle y si la cara se desvía.

![Sticker animado en bucle: el personaje parpadea y saluda hasta volver a la pose inicial](/showcase/aacg-play1-nod.gif)

```
Basándote en la referencia del personaje subida, mantén sin cambios el peinado, la ropa y el fondo. Haz que el personaje parpadee una vez y salude con suavidad, con un movimiento estable y natural, y que vuelva por completo a la pose inicial al final, generando un GIF en bucle perfectamente continuo.
```

**2. Sprites de acciones para personajes de juego.** Una hoja de personaje produce secuencias de reposo y caminata para validar estilo y ritmo antes de dibujar frames a mano durante días; el tutorial avisa que los frames aún exigen alineación manual de pivotes y canal alfa antes del motor.

![Sprites en estilo píxel: reposo y caminata](/showcase/aacg-play2-pixel.jpg)

```
Tomando como referencia el arte del personaje subido, diseña una serie de frames de un personaje en estilo píxel de scroll lateral, mostrando los estados de reposo y caminata hacia la derecha; mantén estrictamente la paleta de ropa, las proporciones y la densidad de píxeles, con fondo transparente.
```

**3. Hoja de personaje multiángulo desde una referencia.** Corrige el problema de "girar la cabeza, cara nueva". Enumera primero los rasgos que no pueden cambiar y luego compara accesorios y ropa entre vistas.

![Plancha de personaje multiángulo: frontal, lateral, trasera y close-ups](/showcase/aacg-play3-sheet.jpg)

```
Tomando como referencia la ilustración del personaje subida, crea una plancha horizontal del personaje con vistas de cuerpo entero frontal, lateral y trasera, más dos close-ups faciales con emociones distintas a la derecha; mantén estrictamente el peinado, el corte de ropa, los rasgos y la paleta, sobre un fondo liso y limpio.
```

### Pósters de e-commerce y escaparates dinámicos

**4. Pósters estacionales y anuncios dinámicos desde una foto de producto.** Dos capas: cambia el fondo bloqueando envase, etiquetas y texto para el material estático; luego añade micro-movimiento — tapa que se abre, producto flotando, giro suave — para fichas y feeds.

![Póster de producto estacional — fondo otoñal con el envase bloqueado](/showcase/aacg-play4-seasonal.jpg)

```
Mantén exactamente sin cambios el envase, la forma de la botella, el diseño de la etiqueta y los textos de la imagen subida; sustituye el fondo por una mesa de madera otoñal, con luz lateral cálida y suave, y unas hojas de arce y flores secas de acento, dejando el producto como foco visual absoluto.
```

```
Partiendo de la foto del producto, conserva por completo su forma y marcas superficiales; haz que la tapa de la caja se abra con suavidad, que el producto se eleve despacio y flote levemente, y que vuelva y cierre, generando un GIF de exhibición en bucle estable sobre un fondo liso minimalista.
```

### SVG vectorial nativo y diseño de iconos

**5. Sets de iconos SVG editables por lotes.** Genera código vectorial limpio en vez de mapas de bits. Unifica grosor de trazo, radio de esquina y color de acento, y prueba primero un lote pequeño — según la documentación oficial, el SVG nativo sale por un endpoint aparte, así que los tableros multi-icono deben dividirse en componentes antes de producción.

![Set de iconos de clima en línea, salida en SVG](/showcase/aacg-play5-weather-icons.png)

```
Diseña un set de iconos lineales para una app de tiempo con seis elementos: sol, nublado, lluvia ligera, nevada intensa, tormenta eléctrica y viento; unifica un trazo de 2px, esquinas redondeadas y un estilo minimalista moderno, un color de acento común, y entrega el resultado como código SVG limpio.
```

### Ediciones con círculos y render de bocetos

**6. Ediciones locales con círculos rojos.** Marca el objetivo, indica qué cambia dentro del círculo y qué queda fuera, y pide retirar la marca; después revisa las costuras.

![Edición con círculo rojo: americana recoloreada, todo lo de fuera intacto](/showcase/aacg-play6-revision.jpg)

```
Cambia la americana dentro del círculo rojo a una textura de lana azul oscuro; fuera del área marcada, bloquea estrictamente el rostro, el peinado, la pose y el fondo; retira el círculo rojo en el resultado, con una transición natural en los bordes.
```

**7. Boceto → render fotorrealista.** Trazos toscos bastan si la posición del sujeto y la perspectiva están claras; el modelo rellena materiales, luz y vegetación para comunicar el concepto.

![El boceto a mano del valle usado como entrada](/showcase/aacg-play7-sketch.webp)

![El boceto renderizado como un valle realista al amanecer](/showcase/aacg-play7-valley.webp)

```
Tomando como referencia el dibujo lineal a mano subido, conserva estrictamente la composición, la perspectiva y la posición del sujeto originales; renderiza el boceto como un valle natural realista con luz lateral suave de la mañana, añadiendo textura de roca creíble, vegetación y reflejos en el agua en calma.
```

### Mockups de UI, diagramas y storyboards

**8. Mockups de apps y webs.** El resultado es una referencia visual, no código — en la comunidad se entrega el mockup a agentes de código como Codex para cerrar el ciclo de la idea visual al front-end.

![Mockup de la pantalla de inicio de una app de mercado](/showcase/aacg-play8-ui.webp)

```
Diseña la pantalla de inicio de una app móvil para un mercado local de productores, con secciones de vendedores, ofertas del día y horario; usa un fondo blanco minimalista con acento verde natural, jerarquía de información clara, mostrada dentro del marco de la pantalla de un teléfono.
```

**9. Diagramas con traducción dentro de la imagen.** Genera diagramas etiquetados, o cambia el texto de un diagrama existente conservando diseño, flechas e ilustraciones — la apuesta del tutorial para localizar diagramas técnicos; verifica la terminología a mano en campos serios.

![Diagrama de la respiración celular](/showcase/aacg-play9-respiration.webp)

```
Traduce el texto en inglés de la imagen al chino, sustituyendo los textos en su lugar; mantén exactamente los colores del fondo, la estructura de la ilustración, las flechas y la maquetación, con tamaños de fuente que se adapten al espacio original.
```

**10. Cómic de historia en cuatro viñetas.** Resume la historia en una línea, divídela en cuatro momentos con cambio, fija el aspecto y el estilo del personaje, y luego lee las viñetas en orden para comprobar que la historia se entiende sola.

![Cómic de mascota en cuatro viñetas: el gato espera en la entrada](/showcase/aacg-play10-comic.webp)

```
Crea un cómic de historia en cuatro viñetas protagonizado por un gato naranja atigrado. Viñeta 1: el dueño se despide con la mano y sale; viñeta 2: el gato se asoma por la ventana; viñeta 3: el gato se duerme hecho un ovillo en el sofá; viñeta 4: el dueño abre la puerta y vuelve, con el gato sentado esperando en la entrada. Mantén el diseño del personaje uniforme, con un trazo sencillo y cálido.
```

## La guía oficial detrás de los casos

Un esqueleto poco visible: casi cada flujo distintivo de la galería corresponde a una sección con nombre de la [guía oficial de prompts de gpt-image-2.6 de OpenAI](https://developers.openai.com/api/docs/guides/image-prompting?model=gpt-image-2.6) — genera un GIF en bucle, guía una edición con marcas, traduce conservando el diseño, convierte un dibujo en imagen realista, convierte una historia en tira cómica, mantiene un personaje consistente, crea una vista previa de interfaz.

Así, la galería se lee como una capa validada por la comunidad sobre el cookbook oficial: la guía nombra la capacidad, la galería muestra quién ya la llevó al límite y con qué prompt.

## Cómo valora la comunidad al modelo detrás de esto

¿Por qué concentrarse en GPT Image 2.6? El [duelo de 卡尔的AI沃茨](https://mp.weixin.qq.com/s/ASxig6mFVYxrIE8-8Fthew) contra Nano Banana 2 en cinco escenarios reales da el contexto:

* **Texto y tipografía china** — los pósters de GPT se leen como una marca real (serif delicadas, páginas de producto verosímiles); los de Banana cargan más "sensación de IA". Ahí viven los casos de pósters e infografías de la galería.
* **Réplica de interfaces** — GPT produjo un reproductor de música y una home de e-commerce convincentes; eso alimenta el flujo de mockups UI de la galería.
* **Fotografía del mundo real** — casi empatados, hasta adivinar la época de los datos de entrenamiento por una bici ofo en cuadro.
* **Consistencia y edición con referencias** — empate a grandes rasgos, aunque destacó la edición por clic de GPT y la estabilidad del texto al traducir cómics.

La galería se queda del lado ganador de esa comparación — y la comparación en sí merece leerse por sus prompts.

## Qué tener presente

* **Los prompts no garantizan el mismo resultado.** Lo dice el README: los prompts públicos no prometen una salida idéntica.
* **GPT Image 2.6 primero.** Otros modelos están anunciados pero raquíticos; los casos cuya fuente no nombra modelo quedan como "modelo por confirmar".
* **Algunas demos son pruebas de concepto.** El propio tutorial de Datawhale avisa: las hojas de sprites exigen alineación manual antes del motor de juego, y los tableros multi-icono hay que dividirlos antes de producción.
* **Los medios no son MIT.** Solo el código lo es; las imágenes y videos de terceros pertenecen a sus dueños.

## Veredicto

> **Recomendación principal**
```
Úsala como tejido conectivo entre tres capas: la guía oficial de OpenAI para capacidades, el tutorial de Datawhale para las diez jugadas de arranque, y los 24 hilos fuente para el detalle a nivel de prompt. Cuando una tarea tenga forma de imagen, busca el caso correspondiente aquí y sigue su enlace al post original antes de escribir tu propio prompt.
```

## Atribución

Armado a partir del README y los datos de casos del propio proyecto (que citan cada fuente), el tutorial de Datawhale, la comparación de 卡尔的AI沃茨, la guía oficial de OpenAI y los hilos de comunidad enlazados. La galería la mantiene li-xiu-qi con licencia MIT para el código; los medios destacados siguen en manos de sus creadores originales.
