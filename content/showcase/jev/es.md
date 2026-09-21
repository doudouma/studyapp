---
summary: "El modelo no generativo System One de TypeSafe AI, Jev, devuelve decisiones tipadas y calibradas en 70–500 ms en lugar de texto; ahora está abierto a todos con 5 USD de crédito."
tags: [Modelos de decisión, IA no generativa, Salida estructurada, Enrutado de modelos, TypeSafe]
facts:
  - key: maker
    value: TypeSafe AI
  - key: founder
    value: Diogo Almeida (ex-OpenAI)
  - key: latency
    value: 70–500 ms
    highlight: true
  - key: price
    value: 0,042 USD / 1M tokens de entrada (salida gratis)
  - key: free credit
    value: 5 USD ≈ 120M tokens
  - key: funding
    value: Ronda semilla de 40M USD (DCVC)
---

## Qué es

Jev es un modelo no generativo de TypeSafe AI que se niega a escribir prosa. No es un LLM conversacional: recibe un estado de programa y una o varias preguntas predefinidas, y devuelve una respuesta tipada —una opción de una lista, una puntuación o una probabilidad entre 0 y 1— junto con una valoración de confianza. TypeSafe llama a estas salidas «decisiones calibradas».

La empresa fue cofundada por Diogo Almeida, ex investigador de OpenAI que trabajó en ChatGPT y ayudó a desarrollar el aprendizaje por refuerzo con retroalimentación humana (RLHF). Tras dos años en modo sigiloso, TypeSafe debutó el 15 de septiembre con una ronda semilla de 40 millones de dólares liderada por DCVC y Jev como primer modelo. Después de una lista de espera, Jev ya está abierto a todos, con 5 USD de crédito (unos 120 millones de tokens) para cada cuenta registrada.

## Propuesta de valor

Jev cambia la generación libre por decisiones fuertemente tipadas y en paralelo:

- **Salidas tipadas, no texto**: cada respuesta es una Choice (hasta 255 opciones), un Score en una escala definida o un Noul (una afirmación booleana expresada como probabilidad), con distribuciones de probabilidad completas y puntuaciones de confianza. Sin prompts JSON ni parsers de salida.
- **Evaluación en paralelo**: todas las preguntas de una misma petición comparten la misma entrada, pero se evalúan de forma independiente y concurrente.
- **Velocidad y coste**: TypeSafe reporta una latencia de extremo a extremo de 70–500 ms —de 20 a 200 veces más rápido que LLM comparables— a 42 USD por mil millones de tokens de entrada (0,042 USD por millón), con la salida a coste cero.
- **Sin alucinación tradicional**: como el espacio de respuestas se define de antemano, el modelo no puede inventar detalles fuera de las opciones predefinidas, aunque sí puede elegir la opción equivocada.
- **Capa de decisión en tiempo real**: en un benchmark público de Ably Pong, Jev tomó 47 decisiones de juego en 12 segundos, mientras que Gemini, Claude y GPT solo lograron de dos a tres en el mismo intervalo.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Prompts de clasificación y enrutado con LLM | Alta | Sustituye los prompts con esquema JSON por salida tipada con una fracción de la latencia y el coste; Vercel reportó una mejora de 5–18x frente al clasificador de seguridad ChatGPT Luna 5.6, con mayor precisión. |
| Clasificadores dedicados con fine-tuning | Moderada | Competitivo en muchas tareas de enrutado y puntuación, pero los equipos pierden control sobre la arquitectura y los datos de entrenamiento exactos. |
| Diálogo, resumen o generación abierta | Baja | Jev no produce texto; la entrada de texto en flujos de agentes sigue necesitando un modelo generativo pequeño detrás. |

## Realidades y limitaciones actuales

- **Solo decide, no razona**: Jev responde a preguntas predefinidas; no se explica ni aborda tareas abiertas.
- **Sigue siendo posible equivocarse**: limitar el espacio de salida evita detalles inventados, pero elegir una opción incorrecta dentro del conjunto sigue siendo un riesgo real.
- **El desarrollador asume la incertidumbre**: como señaló el CTO de Earendil, Armin Ronacher, los equipos deben decidir qué hacer con una probabilidad del 50% frente a una del 95%, lo que traslada la gestión de alucinaciones al código de la aplicación.
- **Arquitectura no divulgada**: TypeSafe no ha publicado la arquitectura exacta de Jev, y se especula que adapta un modelo base de código abierto.
- **Presión de capacidad**: la demanda tras el lanzamiento público superó brevemente la capacidad y provocó ralentizaciones de la API.

## Veredicto

> **Recomendación principal**
> Trata Jev como una primitiva de decisión rápida y barata, no como un chatbot. Para enrutado, puntuación, moderación y selección de acciones de agentes puede reducir el coste y la latencia en un orden de magnitud, siempre que el desarrollador orqueste preguntas explícitas en el código y defina umbrales claros para actuar según una probabilidad.

Una inferencia más barata cambia la frecuencia con la que vale la pena llamar a un modelo. El nombre de Jev viene de la paradoja de Jevons —cuando un recurso se abarata, su consumo total aumenta— y la apuesta es que una inferencia casi gratuita lleve la inteligencia a innumerables microdecisiones que antes no merecían una llamada a un LLM.

## Ciclo de vida y bucle de iteración

Jev se despliega descomponiendo una decisión de negocio en preguntas explícitas y orquestándolas en el código, en lugar de esperar que un solo prompt lo resuelva todo.

| Etapa | Modelo / herramienta usada |
| --- | --- |
| Diseño del espacio de decisión (esquemas Choice / Score / Noul) | Conjuntos de preguntas y opciones definidos por el desarrollador |
| Inferencia de decisión en tiempo real | TypeSafe Jev |
| Orquestación, umbrales y alternativas | Código de aplicación (runners en TypeScript / Python) |
| Pasos de texto libre (p. ej. escribir una ciudad) | Modelo generativo pequeño, invocado solo cuando hace falta |

## Métricas y monetización

- **Financiación y lanzamiento**: ronda semilla de 40M USD liderada por DCVC, debut público el 15 de septiembre.
- **Precio**: 0,042 USD por millón de tokens de entrada, salida gratis; las cuentas nuevas reciben 5 USD de crédito, equivalentes a unos 120 millones de tokens.
- **Resultados reportados**: Vercel reportó una mejora de 5–18x frente a ChatGPT Luna 5.6 en clasificación de seguridad; Bryo AI encontró que Jev era 10–20x más barato que Gemini para clasificar correos de empresa, con una precisión ligeramente menor.
- **Primeros usos**: un equipo filtró un feed de contenido de nicho evaluando ocho criterios sobre tres días de publicaciones en dos segundos por 0,007 USD; equipos de analítica de marketing conectaron Jev a la Meta Ad Library para seguir el ciclo de vida de los anuncios y puntuar guiones creativos, con un flujo de trabajo 30x más rápido por menos de 3 USD.
- **Monetización**: precios por uso según tokens; TypeSafe dice que planea modelos especializados para distintos dominios.

## Recepción de la comunidad y debates clave

El lanzamiento generó mucho debate en las comunidades de desarrollo y diseño de IA:

- **El enrutado de modelos como killer app**: Ronacher sostuvo que predecir si una consulta necesita un modelo de frontera es valioso, pero resultaba prohibitivo con un LLM; Jev hace económicamente viable el enrutado inteligente en tiempo real.
- **No generativo frente a generativo**: los desarrolladores elogiaron el determinismo y la velocidad en paralelo, enmarcando Jev como una capa de seguridad para arquitecturas agénticas más que como un reemplazo de los LLM.
- **Quién gestiona la incertidumbre**: el compromiso más citado es que limitar las salidas devuelve los umbrales de probabilidad al desarrollador.
- **Posicionamiento y hype**: Almeida dijo que no considera a TypeSafe un laboratorio de frontera —«los principales productos de los laboratorios de frontera son el miedo o el hype. Yo quiero que nuestro principal producto sea inteligencia».
