---
summary: "Un archivo digital permanente y tablón comunitario de notas adhesivas, creado con vibe coding."
tags: [Generado por IA, App web, Gratis, Cloudflare, Vibe coding]
facts:
  - key: author
    value: alvinunreal
  - key: platforms
    value: Web (todos los navegadores modernos)
  - key: version
    value: v0.1.0 · prototipo en vivo
  - key: tech stack
    value: Nuxt · Hono · Cloudflare D1 · Workers AI
  - key: hosting cost
    value: $0 (plan gratuito)
    highlight: true
  - key: price
    value: Gratis · acceso comunitario
  - key: offline
    value: No
---

## Qué es

[StickyArchive](https://stickyarchive.com/) es un muro digital de notas adhesivas basado en web que ofrece a las notas de la comunidad un tablón público, buscable y conservado de forma permanente. Construido como la entrega número 69 de una serie de desarrollo rápido asistido por IA ("vibe coding"), funciona a la vez como lienzo público y como microdiario interactivo.

Los usuarios pueden explorar y publicar gratis en el navegador sin registrarse: las aportaciones pasan por un mecanismo de moderación automática integrado, que mantiene baja la barrera de participación y a la vez evita que el spam inunde el muro.

## Propuesta de valor

El proyecto cubre el hueco entre las notas adhesivas locales y temporales del escritorio y los espacios públicos de microblogueo.

- **Permanencia controlada**: las aportaciones se archivan tras una revisión automática, evitando el spam desordenado y formando una línea temporal de ideas de la comunidad a largo plazo.
- **Infraestructura sin mantenimiento**: construido por completo sobre el ecosistema serverless de borde de Cloudflare, mantiene una latencia muy baja con un gasto de hospedaje de servidor nulo.
- **Aislamiento de privacidad multinivel**: admite muros temáticos públicos visibles para todos y, a raíz del feedback inicial, se amplió rápidamente con Boards dedicados para borradores personales y para organizar prompts.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Microsoft Sticky Notes | Moderada | Adecuado para quienes quieren sincronización web entre dispositivos y exhibición pública en comunidad, pero carece de widgets nativos fijados o acoplados al escritorio. |
| Padlet | Moderada | Alternativa ligera para tableros públicos sin una suscripción compleja, aunque sin gestión granular de permisos de nivel educativo o empresarial. |
| Twitter / X (micro-ideas tempranas) | Parcial | Recupera la experiencia de un feed temprano sin algoritmo para registrar sin fricción estados de ánimo breves e ideas instantáneas. |

## Realidades y limitaciones actuales

- **Sin conexión push instantánea y persistente**: el muro depende hoy de refrescos manuales de la página para obtener datos nuevos; aún no hay entrega en tiempo real por WebSocket o SSE.
- **Navegación de páginas largas por mejorar**: al retroceder por grandes volúmenes de notas de fechas pasadas, la interfaz carece de una barra de navegación flotante fija y de un atajo "volver arriba".
- **Poco margen para texto enriquecido y maquetación**: frente a herramientas de pizarra completas, las notas son casi siempre texto plano, sin maquetación profunda ni archivos multimedia adjuntos.

## Veredicto

> **Recomendación principal**
>
> Un alijo de ideas sin fricción y una cápsula del tiempo digital pública para creadores, ingenieros de prompts y quienes toman notas a diario.

## Ciclo de desarrollo y stack tecnológico

Toda la aplicación se apoya en el stack de computación de borde de Cloudflare, orientado a minimizar el coste operativo y a una alta elasticidad.

| Etapa / Componente | Tecnología utilizada |
| --- | --- |
| Framework frontend | Nuxt (Vue) |
| API backend | Hono |
| Base de datos | Cloudflare D1 (SQL serverless) |
| Moderación de contenido | Cloudflare Workers AI |
| Hospedaje de borde | Cloudflare Pages / Workers |

> **Perfil de coste**
>
> Coste total de infraestructura en funcionamiento: **$0.00** (todo dentro del plan gratuito de Cloudflare).

## Métricas y monetización

El proyecto es hoy completamente gratuito, sin muro de pago ni suscripción.

- **Feedback e iteración de la comunidad**: tras el lanzamiento llamó rápido la atención y recibió votos en [r/vibecoding](https://www.reddit.com/r/vibecoding/comments/1wh39qz/vibe_coding_random_websites_part_69_permanent/), y en menos de 24 horas el autor lanzó una función de Personal Boards en respuesta a las peticiones de la comunidad para guardar prompts y pensamientos privados.
- **Valor del caso**: como app nativa de borde, demuestra cómo un desarrollador en solitario, con herramientas de programación con IA, puede lanzar en días y sostener tráfico público con coste operativo cero.
