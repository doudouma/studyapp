---
summary: "Un paseo nocturno interactivo de cinco capítulos por un templo de montaña de Kioto, renderizado en vivo con Three.js y placas de escena generadas por IA."
tags: [Three.js, WebGL, Arte generativo, Narrativa interactiva]
facts:
  - key: author
    value: Meng To
  - key: models
    value: GPT Image 2 · Claude
  - key: stack
    value: Three.js r149 · HTML · CSS · WebGL
  - key: stars
    value: 1600
    highlight: true
  - key: architecture
    value: Aplicación web estática de un solo archivo (sin build)
---

## Qué es

Kage es un paseo nocturno interactivo de cinco capítulos que se ejecuta en el navegador y recorre un estilizado templo de montaña de Kioto. Concebido y dirigido artísticamente por Meng To junto a Claude, el proyecto fusiona elementos 3D procedurales en Three.js con placas de fondo 2D generadas por IA y recortes superpuestos en primer plano, ofreciendo una experiencia narrativa atmosférica impulsada por completo por el desplazamiento de la página.

## Propuesta de valor

El proyecto demuestra cómo se pueden combinar recursos de imagen generativos y renderizado WebGL procedural sin necesidad de pesados pipelines de recursos 3D ni sistemas de build en tiempo de ejecución.

- **Arquitectura estática sin build**: empaquetado en un único archivo `index.html` independiente con Three.js r149 incluido, sin paquetes npm, bundlers ni dependencias de runtime remotas.
- **Capas de profundidad híbridas 2D/3D**: combina geometría procedural en tiempo de ejecución (terreno, estructuras del templo, puertas torii, faroles) con recortes WebP de alfa preservado y placas de fondo de alta resolución.
- **Coreografía sincronizada con el scroll**: vincula la traslación de la cámara WebGL, los efectos meteorológicos dinámicos (niebla, lluvia, hojas a la deriva) y la iluminación directamente al progreso del scroll.
- **Post-procesado cinematográfico**: integra un contenido pipeline de bloom, viñeta, desenfoque de profundidad de campo dinámico y tipografía adaptable para pantallas móviles y de escritorio.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Motores de juego 3D tradicionales (exportaciones WebGL de Unity / Unreal) | Moderada | Práctico para scrollytelling ligero y portafolios, pero no puede reemplazar física de juego interactiva compleja ni lógica de juego dinámica. |
| Sitios de scrollytelling basados en vídeo | Alta | Muy superior en eficiencia de ancho de banda y escalado de resolución responsivo frente al scrubbing de vídeo a pantalla completa pre-renderizado. |
| Plantillas 3D pesadas de Webpack/Vite | Alta | Demuestra que la programación creativa de nivel comercial puede escribirse y publicarse como HTML/JS estático puro y sin dependencias. |

## Realidades y limitaciones actuales

- **Estrictamente narrativo y lineal**: la interacción está atada a la posición del scroll y a los rastros del puntero, sin controles de cámara de libre recorrido ni rutas narrativas ramificadas.
- **Inconsistencia en la generación de recursos**: superponer placas generativas estáticas 2D con elementos 3D en tiempo de ejecución exige una cuidadosa dirección artística manual para evitar desajustes de perspectiva.
- **Licencia restringida**: aunque la biblioteca subyacente Three.js sigue siendo MIT, el repositorio no concede ninguna licencia pública de reutilización o redistribución del código y los recursos visuales originales de Kage.
- **Alcance procedural fijo**: la geometría de la escena y las variaciones arquitectónicas se generan proceduralmente para este paseo concreto, no funcionan como un generador de escenas de propósito general.

## Veredicto

> **Recomendación principal**
> Kage es un estudio de referencia para diseñadores web y tecnólogos creativos que buscan construir narrativa interactiva de alta fidelidad. Demuestra que combinar síntesis de imágenes por IA con renderizado WebGL procedural específico produce resultados cinematográficos sin pasar por enormes pipelines de recursos ni entornos de build complejos.

## Ciclo de vida y bucle de iteración

El código se creó mediante colaboración hombre-IA entre Meng To y Claude, apoyándose en prompts explícitos documentados en `PROMPT.md` para definir reglas de composición, lenguaje de movimiento y parámetros de la escena procedural.

| Etapa | Modelo usado |
| --- | --- |
| Generación de placas y recortes visuales | GPT Image 2 |
| Implementación de código y depuración de composición | Claude |
| Dirección artística y composición | Meng To |

## Métricas y monetización

- **Tracción en GitHub**: 1,6k estrellas y casi 300 forks en su primer mes desde el lanzamiento.
- **Coste de distribución**: cero costes de servidor en runtime; diseñado para servirse directamente desde GitHub Pages o cualquier hosting de archivos estáticos sin infraestructura de backend.
- **Modelo comercial**: experimento web público y gratuito; sirve como escaparate técnico abierto y estudio fundacional para habilidades modulares de agentes web.

## Recepción de la comunidad y debates clave

El proyecto atrajo rápidamente la atención de las comunidades de programación creativa y diseño con IA por su estética cuidada y su ligera huella técnica. Las discusiones suelen girar en torno a su filosofía de archivo único sin build, y los desarrolladores elogian la sencillez de ejecutar y leer el código directamente con `python3 -m http.server`. Debates menores abordan la restricción de licencia propietaria sobre el código fuente, en contraste con el espíritu abierto típico de los experimentos de programación creativa web.
