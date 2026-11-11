---
slug: lemo-opuscar
name: Lemo-Opuscar
summary: Un Skill open source para Claude Code que organiza los videos hechos con código de Opus 5.5 en 66 estilos listos para usar — cada estilo es un prompt reutilizable más una película demo dirigida, dibujada y musicalizada enteramente en código.
category: tools
tags: [Claude Code, Skill, Video IA, Motion Design, Open Source, Opus 5.5]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Lemomo
externalUrl: https://github.com/lemomo-ai/lemo-opuscar
facts:
  - key: styles
    value: 66 estilos listos para usar · 11 categorías (59 al publicarse el artículo)
    highlight: true
  - key: stars
    value: 14,5K (a 10-11-2026)
  - key: license
    value: MIT · gratis y open source
  - key: how it's made
    value: Imagen y música generadas por Opus 5.5 como código · voz TTS · sin modelos de video
  - key: runtime
    value: Unos 30–60 minutos por película · mucho consumo de tokens
  - key: requires
    value: Node 20+ · ffmpeg · Python 3.11+
  - key: install
    value: Plugin de Claude Code (marketplace lemolab)
sources:
  - title: 这个Skill，让你轻松做59种视频风格，助你涨粉上万 (El Skill que facilita 59 estilos de video)
    url: https://mp.weixin.qq.com/s/Yc129owSJnJkk7wvxNpNBw
    publisher: HalfAI
  - title: lemomo-ai/lemo-opuscar — repositorio de GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
cover:
  src: /showcase/lemo-opuscar.jpg
---

## Convirtió los videos hechos con Opus 5.5 en una biblioteca de estilos

Todas las plataformas están empujando ahora los videos de código, y hay cuentas que llegaron a decenas de miles de seguidores en un mes y millones de reproducciones con ellos. El método no tiene misterio: un Claude Opus 5.5 y un tema, y puedes empezar. El artículo de HalfAI que tomamos como referencia comparte el Skill que lo facilita — Lemo-Opuscar.

Su punto más fuerte no es "hace videos", sino que organizó el contenido de video que la gente ha hecho con Opus 5.5 en estilos listos y con nombre. Ya no diseñes un estilo desde cero — instala el Skill, di cuál quieres, entrégale tu tema y tu material, y genera el video en ese estilo.

Cada película demo del repositorio tiene imagen y música escritas por Claude como código, con la voz sintetizada por TTS: sin modelos de generación de video, sin footage de banco. Cada estilo es un prompt reutilizable más una película corta dirigida, dibujada y musicalizada enteramente en código. Los GIF de abajo los capturó HalfAI después de correr el repositorio de verdad.

![El póster de la guía de estilos LEMO OPUSCAR: 59 estilos · 11 categorías · 56 minutos de película](/showcase/lemo-style-guide.jpg)

## La galería de estilos: 11 categorías, una por una

### Montaje y documental · 8 estilos

Le das material real y lo corta en imágenes de noticia. Las noticias subtituladas las usan muchas cuentas de noticias — se entienden incluso en silencio; la pantalla dividida con cuenta atrás en tiempo real sirve para cobertura de lanzamientos, con casillas que van del 1 al 9 hasta el encendido; la pizarra táctica deportiva congela el plano, dibuja líneas y parte la pantalla, con la posición y trayectoria de cada jugador claras; y el empaquetado de noticias de TV es la cabecera completa de un canal, útil para diarios o matinales. Esta categoría incluye también noticiarios de los años 20, sinfonía time-lapse, investigación visual y montaje constructivista — la investigación visual disecciona un objeto o un evento en detalle, ideal para divulgación.

![Noticias subtituladas — EE. UU. perdió 1,3 millones de colmenas en un año y aun así el total subió un 6%](/showcase/lemo-captioned-news.gif)

![Pantalla dividida con cuenta atrás — el último minuto del lanzamiento de Artemis II](/showcase/lemo-countdown.gif)

![Pizarra táctica deportiva — congela el plano, dibuja líneas, parte la pantalla](/showcase/lemo-tactics.gif)

![Empaquetado de noticias de TV — cuatro noticias de IA por semana, el paquete completo de un canal](/showcase/lemo-tv-package.gif)

### Imagen empírica · 8 estilos

Usa mapas, imágenes satelitales o modelos 3D para presentar lugares y desmontar productos — y cada número tiene fuente citada, que es lo que lo separa de una infografía cualquiera.

![Informe por satélite — el satélite sigue el mapa hasta el mar de Aral y encuentra un desierto](/showcase/lemo-satellite.gif)

![Desmontaje de producto — la mitad de un teclado open source, capa a capa](/showcase/lemo-teardown.gif)

### Dibujo y pintura · 7 estilos

Dibujo a mano, acuarela, tinta china, más empaste al óleo y dibujo de una sola línea — buen encaje para videos explicativos.

![Tinta china — un espadachín roza el río y corta la corriente](/showcase/lemo-ink.gif)

### Tradiciones orientales · 4 estilos

Teatro de sombras, ukiyo-e, papel picado rojo y sombras de linterna tallada — estilizados y claramente asiáticos.

![Teatro de sombras — diez soles abrasan la tierra y Hou Yi tensa su arco](/showcase/lemo-shadowplay.gif)

### Impresión y grabado · 5 estilos

Riso, xilografía, grabado al cobre — esas texturas de imprenta estilizadas.

![Xilografía — un pueblo pasa un invierno entero fundiendo una campana](/showcase/lemo-woodcut.gif)

### Gráfico y tipografía · 7 estilos

Propuestas tipográficas con gracia, como la tipografía cinética suiza: una retícula, un color señal, cada movimiento en el compás.

![Tipografía cinética suiza — cinco reglas hacen un póster](/showcase/lemo-swiss-type.gif)

### Información y publicación · 5 estilos

Presentaciones de producto, narrativa de datos, screencasts — pensado para lanzamientos.

![Narrativa de datos — cien veranos de temperatura global, dibujados a lápiz](/showcase/lemo-data-story.gif)

### Caricatura y animación · 4 estilos

Caricatura de manguita de los años 30, animación de celuloide de los 80, más caricatura de sitcom sci-fi.

![Caricatura de manguita años 30 — la aventura de una taza de café en la cocina](/showcase/lemo-rubberhose.gif)

### Videojuegos · 4 estilos

RPG de píxeles 16 bits, microjuegos exprés y ritmo plano de variedades — tonos de juego, adorables y muy dinámicos.

![RPG de píxeles 16 bits — el último punto de guardado](/showcase/lemo-pixel-rpg.gif)

### Cine y épocas · 2 estilos

Cine mudo de los años 20, y el look new-weird de Backrooms — puedes convertir todo tu material a ese estilo.

![Cine mudo años 20 — un panadero persigue una hogaza fugada](/showcase/lemo-silent.gif)

![Backrooms / new weird — una cinta de VHS de turno de noche de 1996](/showcase/lemo-backrooms.gif)

### Materiales y 3D · 5 estilos

Juguetes de bloques, libros pop-up, miniaturas tilt-shift — texturas con sabor 3D.

![Juguete de bloques — ensambla un cohete con piezas](/showcase/lemo-bricks.gif)

## Por qué vale la pena guardarlo

Palabras propias del autor del artículo: "De verdad, es la primera vez que veo un repositorio así". Su valor no está en los prompts en sí — resuelve un problema concreto: hay gente que sabe exactamente qué sensación busca pero no tiene el nombre ni el concepto de ese estilo en la cabeza. Con una biblioteca de estilos indexada por nombre, dejas de pedirle a la IA que invente un estilo desde cero.

## Conviértelo en tu propio estilo

Una función añadida hace poco al repositorio: mete tus colores de marca, logo, IP y tono de cuenta, y convierte un estilo incluido en el tuyo. Por ejemplo, el autor del repositorio convirtió la tipografía cinética suiza en "Rejilla de materiales" — conserva la retícula, el compás y las fuentes, y cambia a objetos reales de arcilla, plástico, felpa, vidrio y cromo.

![El estilo rehecho: Rejilla de materiales (sobre tipografía cinética suiza)](/showcase/lemo-material-grid.gif)

El proceso va a base de preguntas: te pregunta una cosa a la vez, cada pregunta trae opciones con la recomendada primero; muestra primero una imagen de estilo, luego corta una película demo de 15 a 30 segundos, y solo la guarda con tu nombre cuando estás satisfecho — después la invocas por su nombre.

## Instalación y uso

Gratis y open source por completo. Se instala en Claude Code con dos comandos de terminal (HalfAI probó la instalación):

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

![La instalación probada: marketplace add + plugin install, dos pasos](/showcase/lemo-install.jpg)

Después dices directamente qué película quieres — los nombres de estilo funcionan en chino. El ejemplo del README:

```
Haz una película de 30 segundos en estilo de empaste al óleo sobre mi gato naranja que espera en el alféizar cada día a que vuelva del trabajo.
```

Si aún no sabes qué hacer, ejecuta `/lemo-opuscar:lemo-opuscar` y preguntará primero si quieres hacer una película con un estilo de la biblioteca, rehechar un estilo como tuyo o usar un estilo que ya guardaste.

## Antes de empezar

Tres condiciones previas, dichas sin rodeos en el artículo:

* **Los estilos están atados a Opus 5.5.** Todos se ajustaron contra Claude Opus 5.5; con otros modelos nada garantizado.
* **Tiempo y tokens reales.** Una película toma al agente unos 30 a 60 minutos, y el consumo de tokens no es poco.
* **Requisitos de entorno.** Necesitas Node 20+, ffmpeg y Python 3.11+ en la máquina.

## Veredicto

> **Úsalo como índice de estilos, no como generador de videos.**
> El producto real es "el nombre de un estilo + un prompt reutilizable + una película demo toda en código" — el video es solo la forma en que se presenta la demo. La forma correcta de elegir estilo es ver las demos primero; la diferencia de sensación entre categorías es mucho mayor de lo que sugieren los nombres. Antes de empezar, tres cosas: solo Opus 5.5, 30–60 minutos por película, y un consumo de tokens nada trivial.

## Atribución

Compilado del artículo de HalfAI (这个Skill，让你轻松做59种视频风格，助你涨粉上万) y del repositorio lemomo-ai/lemo-opuscar (MIT). Los GIF y capturas provienen de las corridas del propio autor del artículo; el copyright sigue siendo de HalfAI y Lemomo. Datos de vigencia (66 estilos, 14,5K estrellas) verificados contra el repositorio a 10-11-2026; al publicarse, el artículo reportaba 59 estilos y 6,3K estrellas.
