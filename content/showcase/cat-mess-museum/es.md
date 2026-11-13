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

## Qué es

《猫咪拆家：从出租屋拆到博物馆》 es un juego 3D para navegador en el que controlas a un gato naranja que se queda solo en casa. Cada partida dura 90 segundos: derribar muebles, romper objetos, conseguir latas de comida y gastarlas en mejoras que desbloquean escenarios cada vez más lujosos, desde un piso de alquiler hasta un museo.

Lo que lo convierte en un caso y no en una ficha de producto es cómo se hizo. El autor no escribió ni una línea de código. Todo salió de dos prompts contra Fusion Max 2.0, un modelo de la singapurense FUMO Lab, con 17 llamadas por un total de 5,77 $.

## Propuesta de valor

El protagonista del experimento es el coste de un intento, no el juego.

- Prompt primero el diseño, no el código: el primer prompt pide un documento de diseño completo en Markdown construido a partir de los criterios de evaluación de CrazyGames —partidas de al menos 10 minutos, retención del día 2 del 10–15 %, tiempo hasta jugar de 3 segundos— en lugar de «hazme un juego». Las métricas de la plataforma son la especificación.
- Una factura medible por intento: 5,77 $ en 17 llamadas, frente a unos 14,92 $ por el mismo volumen en Claude Fable 5.1 o GPT-6 Astra. En 100 prototipos la diferencia ronda los 900 $, que es justamente el argumento, porque la mayoría de los prototipos no genera nada.
- Un solo endpoint para todo el ciclo: documento de diseño, primera versión de 130 KB, cuatro rondas de revisión y el cambio de arte salieron del mismo modelo. Habla la API Chat Completions de OpenAI, así que Cursor o Codex pueden usarlo con una base URL y una clave.

## Qué puede sustituir

| Herramienta objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Ciclo de prototipado en Unity / Godot | Partial | Para un juego web de partidas de 90 segundos sin tecnología propia de motor, dos prompts y cuatro rondas cubrieron lo que normalmente cuesta la fase de prototipo en gris. No sustituye a la ingeniería de producción: sin física ajustada a mano, sin pipeline de compilación, sin trabajo de SDK de plataforma. |
| Modelos frontera de pago para programar | Moderate | Cuando el entregable es un único juego HTML/JS autocontenido, un endpoint más barato asumió diseño, código e iteración a la vez. El trabajo que exige contexto largo sobre un repositorio real sigue empujando hacia un modelo frontera. |
| Minijuego 3D por encargo | Low | Un encargo aporta dirección de arte, QA y publicación en tienda. Esto produjo una versión jugable, no un título publicado. |
| Constructores de juegos sin código | Moderate | Los constructores dan plantillas y alojamiento; esto da código propio, con un coste por intento menor una vez pasado el primer prototipo. |

## Realidades y límites actuales

- No está publicado. El juego sigue en la máquina del autor y no se ha enviado a CrazyGames ni a la plataforma de minijuegos de WeChat.
- Cuatro rondas no cerraron todo. De los 20 requisitos planteados, se confirmaron 16; los cuatro restantes necesitaban otra pasada.
- Los 5,77 $ son una factura medida de 17 llamadas, no un precio unitario. Repetirlo depende de los créditos de prueba para nuevos usuarios y del precio promocional actual del modelo.
- Lo difícil se movió de sitio, no desapareció. CrazyGames tiene tres líneas de revisión, los minijuegos de WeChat requieren trámites, y la conclusión del propio autor es que la mayoría de los juegos pequeños sigue sin funcionar.

## Veredicto

> **Recomendación principal**
>
> Tómalo como un modelo de costes para crear el hábito de prototipar, no como prueba de que el juego vaya a generar ingresos. Lo transferible es la estructura de los prompts —escribir el documento de diseño contra las métricas de la plataforma y acotar las correcciones a cuatro rondas— y el número que importa es 5,77 $ por intento, porque decide cuántos intentos puedes permitirte.

## Ciclo de desarrollo e iteración

1. **Documento de diseño.** Un prompt, unos 27.000 caracteres, derivado de los criterios de CrazyGames y no de teoría de diseño de juegos.
2. **Primera versión.** Cerca de 130 KB de código funcional, sin ediciones manuales.
3. **Cuatro rondas de revisión.** 20 requisitos planteados, 16 confirmados. El autor afirma que no se corrigió ni una línea a mano entre rondas.
4. **Pase de arte.** El gato primitivo por defecto se sustituyó por un gato naranja modelado en Blender con 24 capas de pelo.
5. **Pendiente.** Envío, QA de plataforma y el trámite de WeChat.

| Etapa | Modelo utilizado |
| --- | --- |
| Documento de diseño | Fusion Max 2.0 |
| Primera versión jugable | Fusion Max 2.0 |
| Cuatro rondas de revisión | Fusion Max 2.0 |
| Arte 3D del personaje | Blender (externo) |

> **Perfil de coste**
>
> 5,77 $ en 17 llamadas. Con tarifas de Claude Fable 5.1 o GPT-6 Astra, el mismo volumen sale por unos 14,92 $: 2,6 veces más.

## Métricas y monetización

Todavía no hay ingresos. El juego no tiene jugadores, ni impresiones publicitarias, ni propinas, porque no se ha enviado a ninguna plataforma.

La monetización es la vía por defecto de las plataformas, no una decisión de diseño: CrazyGames paga por impresiones publicitarias cuando un título supera sus líneas de revisión, y los minijuegos de WeChat reciben propinas a través de la plataforma abierta.

La referencia con la que abre el artículo es una variante tipo Suika del desarrollador en solitario anul agarwal, hecha con ChatGPT en 2023: más de 65 millones de jugadores y más de 25.000 $ de ingresos, con más de 120 prototipos de los que los primeros 100 apenas ganaron nada.

## Recepción y debates

La publicación reunió unos 300 «me gusta» y 16 republicaciones el primer día, así que la conversación es pequeña. Y no va principalmente sobre el juego.

- **Intentos baratos hacen viable el volumen.** Si un intento cuesta 5,77 $ en lugar de 15, el camino de los 120 prototipos deja de estar reservado a estudios con financiación.
- **El volumen no es el cuello de botella.** Los propios números de anul agarwal dicen que los primeros 100 prototipos no ganaron casi nada, así que un ciclo más barato acorta el proceso pero no indica qué idea funcionará.
- **La comparación tiene un interés comercial.** El artículo incluye un enlace de referido al proveedor del modelo, lo que conviene tener en cuenta al leer la cifra de 14,92 $: es una estimación próxima al vendedor, no un baremo neutral.

Los dos prompts se publican íntegros, y esa es la razón para incluir el caso en la biblioteca: el flujo de trabajo se puede contrastar con tu propio proyecto en lugar de aceptarlo por confianza.
