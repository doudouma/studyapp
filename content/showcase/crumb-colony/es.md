---
name: Crumb Colony
summary: Una persona, 30 ¥ y Claude Code: un minijuego de WeChat que pasó de 3,65 ¥ a 2002 ¥ al día en tres semanas.
tags: [Minijuego de WeChat, Claude Code, Desarrollador solo, Pixel art, Puzle, Ingresos por anuncios]
facts:
  - key: ad revenue
    value: 2002 ¥ en un día · 2730 ¥ en 7 días
    highlight: true
  - key: first ad day
    value: 3,65 ¥, 2002 ¥ tres semanas después
  - key: team
    value: 1 persona · cuenta individual, sin empresa
  - key: startup cost
    value: Certificación WeChat 30 ¥/año · sin ISBN · sin registro de software
  - key: models
    value: Claude Code — código, pruebas con bots, subida de builds
  - key: port to WeChat
    value: Versión web portada en una semana
  - key: review
    value: 2 rechazos, ambos de texto
  - key: discovery
    value: 57% de los ingresos semanales vino de la búsqueda de WeChat
---

## Una persona, tres semanas: de 3,65 ¥ a 2002 ¥

Hace tres semanas, el primer día de anuncios de Crumb Colony dejó 3,65 ¥. El 13 de noviembre de 2026 el juego ingresó 2002,04 ¥ en un solo día; 2730,44 ¥ en los últimos siete.

Lo hizo una sola persona: cuenta individual de WeChat, sin empresa, sin compra de tráfico y con todo el código escrito por Claude Code. El juego es un puzle de ordenar colores: cada nivel es una ilustración en pixel art, tocas una caja de color, sueltas una colonia de hormigas del mismo color y ellas comen el dibujo desde el borde hacia dentro y lo llevan al nido. Funciona como minijuego de WeChat y en el navegador. El autor, 本山德彪, escribía código en Tencent y Meituan; ahora construye productos por su cuenta. Contó todo el recorrido en siete pasos: requisitos, registro, desarrollo, revisión, apertura del programa de anuncios, colocación y tráfico.

Lo que hace valioso el texto no es «la IA puede hacer juegos», sino cómo una persona concreta llevó una cosa pequeña hasta el final: en qué se gastó el dinero, en qué paso se atascó y qué decisiones tuvo que tomar él mismo.

## Primero las cuentas: empresa, ISBN, trámites

Es la parte que más le preguntan, y sus respuestas son concretas:

* **Cualquiera puede hacerlo**: se registró como persona individual. No hace falta empresa.
* **Sin ISBN**: mientras el juego solo muestre anuncios y no tenga compras integradas.
* **Trámites sí, y son dos**: primero el registro del minijuego, después el del mini programa, ambos con reconocimiento facial. La versión para un jugador puede salir antes de terminar el trámite; así publicó él.
* **Sin registro de derechos de software**: ni la revisión, ni la publicación, ni el programa de anuncios se lo pidieron.
* **El único coste real es la certificación**: 30 ¥/año para una persona, 300 ¥/año para una empresa. La plataforma retiene los impuestos al pagar.
* **Primero un jugador**: las clasificaciones y los duelos con amigos obligarían a pasar a online, y eso exige terminar antes el registro del mini programa.

Dos decisiones dicen mucho. Quería llamarlo 蚂蚁搬家 («hormigas que mudan de casa»), el nombre estaba ocupado y terminó en 蚂蚁搬画 («hormigas que mueven cuadros»): el nombre también es lo que buscarán los jugadores, así que tiene que ser corto y fácil de encontrar. Y eligió un jugador primero en vez de dejar que una clasificación arrastrara el lanzamiento a una cola de trámites. La certificación de 30 ¥ se pagó sola en la primera semana de anuncios.

## La IA escribe el código; la persona se queda con la diversión

Su versión web pasó a WeChat en aproximadamente una semana. La lista de tareas de la IA es muy concreta:

* escribir código y corregir errores;
* escribir unos cuantos «jugadores bot» que juegan cada nivel dentro del juego real, estiman qué porcentaje de personas puede ganarlo, reajustan cuando la dificultad falla y vuelven a probar;
* recorrer todo el flujo tras cada cambio —inicio, nivel superado, fallo, vídeo recompensado, compartir— con más de cien comprobaciones que deben pasar;
* empaquetar y subir con la línea de comandos de WeChat DevTools, para que la build de desarrollo aparezca sola en la consola.

La persona sigue pulsando «enviar a revisión» y «publicar». Es la división que repite: la IA produce un resultado verificable; la persona decide.

La diversión es donde más tiempo puso. Una mecánica se gasta a los pocos niveles, así que cada capítulo cambia de escenario cotidiano y añade una mecánica que solo existe ahí: en el capítulo de invierno cae nieve y tapa el tablero, en el de Año Nuevo cuelgan petardos en la imagen. Sus reglas de diseño se leen como reglas de producto, no de funcionalidad: alternar ayudar y complicar; atar la mecánica al escenario; explicarla con una tarjeta la primera vez; si el jugador pierde, mostrarle cómo; que las explosiones se sientan y que el cierre no se alargue.

## La dificultad es una frase, no un número

Cada nivel lleva una frase de «revelación»: lo que dirá el jugador cuando lo entienda. Si no puede escribirla, el nivel depende de la suerte o de apilar dificultad, y se rehace.

La dificultad va en olas: un nivel duro cada pocos, seguido de uno fácil. El primero es corto; el segundo ya pide pensar. Los bots prueban antes de publicar y los jugadores reales después: el panel mostró que mucha gente nueva abandonaba antes del nivel cinco, así que acortó el primer nivel. La dificultad de los bots y la humana a menudo no coinciden, y los datos reales son los que deciden.

Todo eso vive en un documento de «estándares de nivel». La IA revisa cada capítulo nuevo contra él antes de publicarlo, y una regla fallida significa que el capítulo no sale. El juego tiene ahora 440 niveles en 22 capítulos; ese documento es lo único que evita que los últimos se conviertan en relleno.

## Dos rechazos, ninguno por el código

El formulario de revisión pide más material que el código: informe de autoevaluación, descripción de escenas principales, explicación de la jugabilidad, diseño de sistemas, trasfondo y tema, y al menos tres capturas tomadas dentro de WeChat, con el botón cápsula y el nombre del juego visibles.

Le devolvieron el juego dos veces:

1. Texto en inglés en la interfaz —el nombre inglés de la portada, subtítulos en inglés en las ventanas— todo pasado a chino.
2. Un título de portada poco cuidado: lo dejó exactamente en 蚂蚁搬画, carácter por carácter el nombre registrado.

Su conclusión es una frase: donde aparezca el nombre en el juego, pon el nombre registrado, sin inglés y sin subtítulo. Los dos arreglos eran triviales; lo que costaron fue tiempo de lanzamiento, no ingeniería.

## Anuncios solo donde el jugador se atasca

El 13 de noviembre, el vídeo recompensado produjo el 90,6% de los ingresos y los intersticiales el 1,9%. El jugador medio eligió ver unos siete vídeos recompensados ese día. Los intersticiales recibieron más o menos las mismas impresiones que los banners y ganaron lo mínimo: la mayoría cierra el juego cuando aparece uno.

Sus tres reglas:

* **Poner el vídeo recompensado donde hace falta**: atascado, sin objetos, queriendo una pista. No al entrar al nivel, antes de que haya pasado nada.
* **No regalar objetos**: cuanto más regalas, menos vídeos ve la gente. Cada objeto empieza con uno y no se rellena solo.
* **Apretar los intersticiales**: solo cuando el jugador se ha detenido, como al volver al menú; nunca en los primeros 15 niveles; nunca en «siguiente» o «reintentar». Los banners viven al pie de la pantalla de resultado y en ningún otro sitio del nivel.

El diseño publicitario moldea el juego a cambio. Vivir solo de anuncios significa que el vídeo recompensado es el negocio, así que hay que dejar huecos donde el jugador se atasque y se le pueda ofrecer una salida: rebobinar el tablero o probar otro rescate.

## Tráfico: un empujón de juego nuevo y un nombre que se busca

No gastó nada en adquisición. Lo que usó:

* **El empujón a juegos nuevos**: WeChat da una ventana de recomendación dentro de los 90 días posteriores al primer lanzamiento. La abrió y los usuarios crecieron 10 veces. Solo hay una, así que recomienda guardarla hasta que el juego esté pulido.
* **Añadir a Mis Mini Programas**: quien llega desde una recomendación te olvida al salir. Hizo una tarjeta con una flecha hacia el «···» de la esquina superior derecha.
* **Tarjetas para compartir**: compartir un nivel deja al amigo directamente en ese nivel, no en el primero.
* **Un nombre buscable**: el panel desglosa los ingresos por origen; el 57% de la última semana vino de la búsqueda. Un buen nombre es cómo te encuentran.
* **Un diario público**: publica cada día «día N de anuncios en mi minijuego» en X, convierte las preguntas de las respuestas en artículos para cuentas oficiales de WeChat, Zhihu y Juejin, y luego los graba con su voz para canales, Bilibili y Douyin.

Lo último es el volante: los ingresos públicos traen preguntas, las preguntas se vuelven artículos, los artículos traen tráfico de búsqueda y jugadores nuevos.

## Para quién es este camino

> **Recomendación principal**
> Copia el proceso, no el golpe de suerte. Entre 3,65 ¥ y 2002 ¥ hay tres semanas, 440 niveles, dos trámites, dos rechazos y un documento de estándares. Encaja con alguien que construirá en público, aguantará el papeleo y tratará a la IA como un equipo de ingeniería, no como una máquina de deseos; no encaja con quien busca renta pasiva ni con quien no está dispuesto a repetir niveles en el móvil hasta que la dificultad se sienta bien. Si empiezas, sigue sus siete pasos, pero haz dos cosas antes: comprueba que el nombre esté libre y publica la versión de un jugador.

La misma captura se puede leer de dos maneras. Una es un estímulo: una persona puede hacerlo y cuesta 30 ¥ empezar. La otra es sesgo de supervivencia: nadie compartió el día de 3,65 ¥. Sobre la IA, ninguno de los dos rechazos mencionó la cadena de herramientas, pero los criterios de revisión y los umbrales del programa de anuncios se mueven (cuando él abrió, el umbral era de 500 visitantes; ahora es de 100), así que un camino que funciona hoy no tiene por qué funcionar igual mañana. Él no lo esquiva: los ingresos son públicos, los números son públicos, y hasta el error —un primer nivel demasiado largo— entró en el artículo.
