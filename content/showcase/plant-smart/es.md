---
summary: "Base de datos gratuita y sin anuncios de plantas tóxicas para mascotas: gravedad, síntomas y búsqueda inversa, con API abierta y datos de ASPCA e iNaturalist."
tags: [Seguridad de mascotas, Base de datos de plantas, API abierta, Datos abiertos, Sin anuncios]
facts:
  - key: author
    value: u/WilhelmCodes
  - key: price
    value: Gratis · sin anuncios · sin cuenta
    highlight: true
  - key: lookup
    value: Por nombre de planta o por síntomas (búsqueda inversa)
  - key: data sources
    value: ASPCA · iNaturalist · curado por humanos, sin IA
  - key: api
    value: API abierta · datos abiertos con atribuciones
  - key: age
    value: 3,5 años de antigüedad, rediseñado recientemente
---

## Qué es

Plant Smart es una base de datos gratuita de plantas tóxicas para mascotas creada por u/WilhelmCodes para acabar con la clásica angustia del dueño de plantas y mascotas: ves una planta bonita, tienes animales en casa y, de repente, estás diez pestañas dentro de páginas contradictorias llenas de anuncios. Construida hace 3,5 años y recién retocada con una capa de pintura nueva, vive en [plantsm.art](https://plantsm.art) y se compartió en r/InternetIsBeautiful para calentar el interés.

## Propuesta de valor

* **Búsqueda por nombre de planta, común o científico**: gravedad, animales afectados y síntomas a vigilar en una sola consulta, en lugar de diez pestañas.
* **Búsqueda inversa por síntomas**: si tu mascota ya presenta síntomas, busca por ellos y reduce los sospechosos hasta dar con la planta culpable.
* **Gratis, sin anuncios y sin bazofia**: sin cuenta, sin anuncios, y cada entrada está curada de fuentes verificadas con atribuciones — datos explícitamente no generados por IA.
* **API abierta**: el conjunto de datos es abierto y la API está ahí para construir sobre ella; los datos sobreviven al sitio.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Diez pestañas googlando toxicidad vegetal | Alta | Una base curada responde gravedad, animales afectados y síntomas en una sola consulta. |
| Granjas de contenido SEO sobre toxicidad | Alta | "Sin bazofia" por diseño: datos no generados por IA, curados de fuentes verificadas como ASPCA e iNaturalist. |
| Apps comerciales de identificación de plantas | Moderada | Pensada para toxicidad en mascotas, no para identificar por foto; hay que saber el nombre de la planta. |
| Control veterinario de intoxicaciones | Baja | Es una guía, no una herramienta de diagnóstico — una emergencia siempre va primero al veterinario. |

## Realidad actual y limitaciones

* **Sin identificación por foto**: la búsqueda funciona por nombre (común o científico), así que hay que saber cómo se llama la planta antes de consultarla.
* **Solo inglés por ahora**: la internacionalización con nombres comunes localizados está en la hoja de ruta pero no se ha publicado.
* **Una guía, no un veterinario**: los datos de gravedad y síntomas informan decisiones; no sustituyen el consejo profesional cuando un animal ya ha comido algo.
* **Dataset aún en limpieza**: el autor está depurando entradas para mayor precisión e incorporando nuevas fuentes abiertas, así que los detalles pueden cambiar.

## Veredicto

> **Recomendación principal**
> Guárdala en marcadores si convives con mascotas y plantas. La búsqueda inversa por síntomas es la función estrella — justo el momento de pánico donde googlear en diez pestañas más duele — y la API abierta la convierte en una base limpia para cualquiera que construya herramientas de seguridad para mascotas. Es una utilidad de referencia bien hecha: gratis, sin anuncios, con fuentes y mejorando en público.

## Ciclo de desarrollo e iteración

Un proyecto en solitario de larga vida que usó su debut en Reddit como ronda concentrada de feedback:

| Etapa | Herramientas | Foco |
| --- | --- | --- |
| Construcción inicial | Desarrollo en solitario, hace 3,5 años | Base de datos central, búsqueda y datos de gravedad |
| Rediseño | "Capa de pintura nueva" | UI modernizada que motivó el lanzamiento público |
| Iteración comunitaria | Feedback de Reddit, implementado en días | Filtrado por continente/país, índice de nombres comunes + científicos, galería de plantas seguras con fotos de iNaturalist |
| Curación de datos | Fuentes abiertas verificadas (ASPCA, iNaturalist) | Dataset sin IA con página pública de atribuciones; limpieza de precisión en curso |

## Métricas y monetización

* **Monetización**: ninguna visible — completamente gratis, sin anuncios, sin cuenta.
* **Apertura**: API abierta más datos abiertos con todas las fuentes listadas en la página de atribuciones.
* **Tracción**: compartida en r/InternetIsBeautiful para medir interés; el autor implementó la mayoría de sugerencias en dos rondas de edición y sigue enriqueciendo el dataset con nuevas fuentes.

## Recepción de la comunidad y debates clave

El hilo cayó bien y, lo más inusual, el bucle de feedback se cerró casi de inmediato:

* **Las sugerencias se volvieron funciones**: el filtrado por continente y país, el índice ampliado de nombres comunes + científicos y la galería de plantas seguras con fotos de iNaturalist se publicaron tras el hilo de lanzamiento.
* **La procedencia como confianza**: la confirmación del autor de que todos los datos son no-IA y curados de fuentes verificadas (ASPCA, iNaturalist) conectó con una comunidad desconfiada de las respuestas de granjas de contenido.
* **Demanda de localización**: los nombres comunes localizados se identificaron como la siguiente necesidad — la hoja de ruta ya incluye soporte multilingüe.
