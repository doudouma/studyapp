---
summary: "Un juego web 3D jugable creado con dos prompts y cero código escrito a mano: 5,77 $ en llamadas al modelo, cuatro rondas de revisión y ningún motor de juego."
tags: [Generado por IA, Juego web, 3D, Solo prompts, Desglose de costes]
facts:
  - key: author
    value: AYi (@AYi_AInotes)
  - key: platforms
    value: Web (objetivo CrazyGames) · minijuego de WeChat
  - key: models
    value: Fusion Max 2.0 (FUMO Lab)
  - key: cost
    value: 5,77 $ · 17 llamadas
    highlight: true
  - key: same volume elsewhere
    value: ~14,92 $ con Claude Fable 5.1 / GPT-6 Astra
  - key: codebase
    value: 130 KB en la primera versión · 0 líneas editadas a mano
  - key: revisions
    value: 4 rondas · 16 de 20 requisitos aceptados
  - key: status
    value: Jugable en local · aún sin publicar
---

## Un gato, dos prompts, una factura

Un gato naranja se queda solo en un piso con 90 segundos para destrozarlo: tirar los muebles, romper la vajilla, juntar latas de comida y gastarlas en mejoras que abren habitaciones cada vez mejores. El primer nivel es un alquiler barato. El último es un museo.

El juego es la demo. El número que merece atención es la factura: dos prompts, 17 llamadas al modelo, 5,77 $ y ni una línea de código escrita a mano. El modelo fue Fusion Max 2.0, de la singapurense FUMO Lab, al que se llega por un endpoint compatible con OpenAI, así que el mismo ciclo funciona desde Cursor o Codex en cuanto rellenas una base URL y una clave.

## El primer prompt es una especificación, no un deseo

Casi todos los prompts de "hazme un juego" fallan porque no hay nada contra lo que fallar. Este empieza pidiendo un documento de diseño, y el documento se juzga con los criterios de evaluación del propio CrazyGames: partidas de al menos 10 minutos, retención al segundo día entre el 10 % y el 15 %, jugable en tres segundos, todo generado por código para que no haya ningún recurso que descargar.

Ese cambio de encuadre hace más trabajo que la elección del modelo. Las métricas de revisión de una plataforma son una especificación gratis, y obligan a construir el bucle que el juego necesita —partidas cortas, mejoras, tareas diarias, un motivo para volver— antes de que exista una sola línea de código. El documento salió con unos 27.000 caracteres; la versión que vino después ocupaba unos 130 KB y funcionó a la primera.

## Cuatro rondas, dieciséis de veinte

Siguieron cuatro rondas de revisión. En ellas se plantearon veinte requisitos y se confirmaron 16; según el autor, los otros cuatro necesitaban otra pasada. Ninguna corrección se escribió a mano, y eso es lo que conviene retener: cada ronda fue un prompt nuevo sobre la versión anterior, no una sesión de depuración.

La última pasada fue de arte, y es el único paso que se sale del modelo. El gato provisional se convirtió en un modelo de Blender: un atigrado naranja con 24 capas de pelo.

## Qué mide realmente la comparación de costes

5,77 $ por 17 llamadas. Con tarifas de Claude Fable 5.1 o GPT-6 Astra, ese mismo volumen sale por unos 14,92 $, una ratio de 2,6×. A lo largo de 100 prototipos la diferencia ronda los 900 $.

La cifra es real: es una factura medida, no una estimación. Debajo hay dos cosas. La primera, que depende de los créditos de prueba para cuentas nuevas y del precio promocional que el proveedor tenga en ese momento, así que es el coste de este intento hoy y no un precio unitario estable. La segunda, que el artículo incluye un enlace de referido al proveedor del modelo, lo que convierte la comparación de 14,92 $ en un cálculo del lado del vendedor y no en un baremo neutral.

Aun así, el argumento no depende de la ratio exacta. El desarrollador en solitario anul agarwal hizo en 2023 una variación tipo Suika con ChatGPT que llegó a más de 65 millones de jugadores y ganó más de 25.000 $, y él mismo dice que hicieron falta más de 120 prototipos y que los 100 primeros apenas ganaron nada. Si un intento cuesta 5,77 $ en lugar de 15, ese camino deja de estar reservado a quien tiene presupuesto. Si cuesta 5,77 $ y los 100 primeros siguen sin ganar nada, el ciclo barato te compra más intentos, no mejor puntería.

## Nada de esto se ha publicado

El juego sigue en la máquina del autor. No se ha enviado a CrazyGames ni a la plataforma de minijuegos de WeChat, así que no tiene jugadores, ni impresiones publicitarias, ni ingresos.

Lo que queda es justo lo que un modelo no resuelve por ti: CrazyGames tiene tres líneas de revisión, los minijuegos de WeChat llegan con trámites, y ninguna de las dos cosas es un problema de diseño. La conclusión del propio autor es que la mayoría de los juegos pequeños sigue sin funcionar, por barato que haya salido construirlo.

## Qué se puede trasladar

> Lo reutilizable aquí no es el juego ni el modelo: es el orden de los prompts. Escribe primero la especificación contra las métricas de la plataforma y luego acota la iteración a un número fijo de rondas, para que el coste por intento siga siendo conocido.

El resto es condicional. La ventaja de coste supone un endpoint barato y una construcción pequeña y autocontenida. El arte sigue necesitando una persona y una herramienta que no es un modelo de lenguaje. Y los dos prompts están publicados íntegros, que es la razón para incluir el caso en la biblioteca: puedes ejecutar el flujo sobre tu propia idea en vez de aceptar la conclusión por confianza.
