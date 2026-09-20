---
summary: "Una herramienta rápida de validación de ideas de startup que evalúa los pitches según 10 criterios en paralelo usando el modelo determinista Jev de TypeSafe."
tags: [Validación de ideas, Clasificación, Código abierto, IA en paralelo, Prueba de concepto]
facts:
  - key: models
    value: TypeSafe Jev
  - key: author
    value: stemonte
  - key: platforms
    value: Web
  - key: price
    value: Gratis (código abierto)
  - key: latency
    value: ~539 ms
    highlight: true
  - key: output
    value: Puntuación cuantitativa 0–100 (no generativa)
---

## Qué es

KillMyIdea es una prueba de concepto de código abierto diseñada para poner a prueba el modelo no generativo Jev de TypeSafe. En lugar de apoyarse en un LLM conversacional tradicional que produce razonamientos en lenguaje natural, recibe un pitch de idea y ejecuta en paralelo unas 10 preguntas de evaluación específicas. En una fracción de segundo, el sistema devuelve una puntuación numérica compuesta de 0 a 100 junto con clasificaciones de diagnóstico granulares (como «SHIP IT» o «FIX IT»).

## Propuesta de valor

- **Cero charla generativa**: elimina la palabrería conversacional y la deriva de prompts mediante un modelo determinista que solo emite probabilidades cuantitativas, no texto.
- **Evaluación paralela en menos de un segundo**: ejecuta todas las consultas de evaluación de forma concurrente y entrega feedback exhaustivo en varios ejes en unos 500 milisegundos en lugar de 30 a 60 segundos.
- **Rúbricas multifactor con pesos**: puntúa ejes independientes como Demanda, Claridad del cliente y Capacidad de construcción en escalas fijas de 0–4, aplicando mayor peso a factores críticos como la necesidad de mercado y los problemas reales.
- **Calibración según el objetivo**: admite objetivos del proyecto (como Código abierto o Solo por diversión) para no penalizar ideas que evitan deliberadamente la monetización.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Prompts de validación con LLM estándar (ChatGPT / Claude) | Parcial | Sustituye las lentas respuestas generativas de 30–60 segundos por una clasificación determinista instantánea, aunque sin explicaciones cualitativas. |
| Hojas de cálculo manuales para puntuar ideas | Alta | Reemplaza la puntuación manual de rúbricas para comprobaciones rápidas durante hackathons o sesiones iniciales de brainstorming. |
| Revisión de pitch por un mentor humano | Baja | No puede reemplazar la investigación de mercado profunda, la experiencia regulatoria del dominio ni los matices contextuales. |

## Realidades y limitaciones actuales

- **Evalúa el pitch, no el mercado**: el modelo subyacente evalúa la redacción descriptiva del pitch frente a rúbricas lingüísticas calibradas; no consulta datos de mercado en vivo ni verifica la realidad externa.
- **Ciego a las regulaciones del sector**: barreras específicas como el cumplimiento regional, las licencias o los obstáculos legales complejos no se tienen en cuenta salvo que se detallen explícitamente en el prompt.
- **Falta de narrativa cualitativa**: como el modelo solo devuelve números y niveles discretos, el usuario no recibe explicaciones escritas sobre por qué una métrica concreta obtuvo una puntuación baja.
- **Ponderación heurística**: la puntuación compuesta procede de un promedio ponderado definido por el autor, no de un referente consolidado de capital riesgo.

## Veredicto

> **Recomendación principal**
> Usa KillMyIdea como una comprobación de cordura ultrarrápida y objetiva para detectar una redacción débil o un público objetivo mal definido antes de redactar propuestas completas.

KillMyIdea demuestra que los modelos de evaluación no generativos como Jev pueden reducir drásticamente la latencia y eliminar la varianza no determinista en flujos automatizados. Aunque no debe tomarse como un veredicto autorizado de mercado, sirve como filtro eficaz de primera pasada para desarrolladores, fundadores y pipelines de agentes.

## Ciclo de vida y bucle de iteración

El proyecto se implementó como una aplicación web de código abierto ([código fuente de killmyidea](https://github.com/monteduro/killmyidea?utm_source=gemini)) para experimentar con el acceso directo al modelo Jev de TypeSafe. Las iteraciones a partir del feedback de la comunidad incluyeron un flujo «Refine Idea» y parámetros opcionales de objetivo para ajustar la lógica de puntuación en proyectos no comerciales.

| Etapa | Modelo usado |
| --- | --- |
| Formulación de la rúbrica y diseño de preguntas | LLM general (GPT) con refinamiento del autor |
| Clasificación paralela en tiempo real | TypeSafe Jev |
| Agregación final de la puntuación y umbralización | Ponderación algorítmica cliente/servidor (TypeScript) |

## Métricas y monetización

- **Precio**: totalmente gratuito.
- **Licencia**: código abierto en un repositorio público accesible.
- **Rendimiento**: capaz de evaluar 10 rúbricas distintas de forma concurrente en unos 539 milisegundos.
- **Monetización**: ninguna directa; creado como demostración técnica y POC para el feedback de desarrolladores.

## Recepción de la comunidad y debates clave

- **Predictibilidad determinista**: los desarrolladores elogiaron la velocidad paralela y la naturaleza no generativa de Jev, señalando su potencial como barrera determinista para arquitecturas agénticas.
- **Escepticismo sobre la puntuación**: los comentaristas cuestionaron al principio si las puntuaciones diferían de forma significativa de números pseudoaleatorios, lo que llevó al autor a aclarar la mecánica de la rúbrica calibrada de 0–4.
- **Preocupación por la recolección de datos**: algunos usuarios dudaban en enviar ideas de startup propietarias, por lo que el autor destacó un interruptor explícito de exclusión que impide almacenar el pitch.
