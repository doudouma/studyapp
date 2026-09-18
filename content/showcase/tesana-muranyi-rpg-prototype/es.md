---
summary: "Una demo de acción fantástica 3D en tercera persona creada con vibe coding en dos días usando el modelo muranyi-3 de Tesana y 39 prompts."
tags: [Vibe Coding, Desarrollo de juegos, Prototipo con IA, RPG]
facts:
  - key: models
    value: muranyi-3
  - key: token cost
    value: $90
    highlight: true
  - key: prompts
    value: 39
  - key: development time
    value: 2 días
  - key: engine
    value: Tesana (wrapper basado en Godot)
  - key: genre
    value: Fantasía 3D en tercera persona / MOBA
---

## Qué es

Tesana Muranyi-3 RPG Prototype es un proyecto experimental de fantasía 3D en tercera persona generado mediante prompting iterativo en lenguaje natural. Construido con el modelo [muranyi-3](https://tesana.ai/en/blog/introducing-muranyi-3) en la plataforma Tesana, la demo muestra a un mago encapuchado recorriendo un entorno montañoso abierto con controles básicos de movimiento, barras de habilidades en la interfaz y efectos provisionales de lanzamiento de hechizos.

## Propuesta de valor

El proyecto demuestra la capacidad de pasar rápido de concepto a render para escenas 3D interactivas sin scripting manual ni edición directa del árbol de escena:

- **Controlador de personaje guiado por prompts**: establece el seguimiento desacoplado de cámara en tercera persona y el movimiento omnidireccional a partir de simples descripciones en inglés.
- **Generación de escenas en lenguaje natural**: traduce conceptos de entorno de alto nivel en terrenos texturizados y fondos con hitos.
- **Configuración de interfaz dentro del modelo**: genera barras de acción e iconos básicos de hechizos directamente con instrucciones de prompt.
- **Generación integrada de efectos visuales**: produce haces mágicos direccionales, impactos de escarcha y trayectorias de proyectiles acordes a los estados de lanzamiento del personaje.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Plantillas iniciales de Unreal Engine 5 | parcial | Sirve para maquetas visuales instantáneas, pero carece de la física, las redes y las herramientas de producción robustas de UE5. |
| Assets iniciales de tercera persona de Unity | parcial | Reemplaza montajes rápidos de controladores en whitebox, aunque la mantenibilidad del código sigue sin verificarse. |
| Game Jams tradicionales (48 h) | moderada | Viable para armar prototipos estéticos no jugables, pero se queda corto en profundidad de mecánicas. |

## Realidades actuales y limitaciones

- **Sin bucle de juego jugable**: la demo se compone solo de movilidad del personaje y animaciones activables; faltan mecánicas centrales de combate, IA de enemigos, sistemas de inventario y progresión.
- **Relación costo-producto alta**: llegar a una escena interactiva básica consumió 90 dólares en 39 iteraciones, mucho más caro que usar paquetes de assets iniciales gratuitos.
- **Arquitectura de motor opaca**: los comentaristas señalaron que el sistema parece funcionar como un envoltorio generativo fino sobre Godot, lo que genera dudas sobre la portabilidad del proyecto y la mantenibilidad del código a largo plazo.
- **Cuellos de botella de escalabilidad y depuración**: la falta de acceso estructural detallado hace impracticable depurar mecánicas complejas como desincronización, registro de impactos y gestión de estados cuando el proyecto crece.

## Veredicto

> **Recomendación principal**
>
> Útil únicamente como prueba de concepto visual para testear modelos generativos de texto a mundo, pero inadecuado para ingeniería de juegos orientada a producción.

## Ciclo de desarrollo e iteración

El proyecto se construyó en un periodo de 2 días con una estructura secuencial de prompts:

| Etapa | Modelo utilizado | Resultado |
| --- | --- | --- |
| Planificación y base | muranyi-3 | Estableció la geometría del mundo, el terreno abierto montañoso y los hitos lejanos en 3–4 prompts de planificación. |
| Personaje y cámara | muranyi-3 | Configuró el modelo del mago en tercera persona, la cámara orbital desacoplada y la locomoción direccional. |
| Barra de acción e interfaz | muranyi-3 | Añadió una barra de habilidades estilo MOBA de 4 ranuras con estados de lanzamiento a una y dos manos. |
| VFX de hechizos e impactos | muranyi-3 | Superpuso haces arcanos, proyectiles de fuego y efectos de partículas de impacto de escarcha. |

## Métricas y monetización

- **Gasto en tokens**: 90 dólares en 39 prompts.
- **Tiempo de producción**: 2 días de iteración.
- **Monetización**: ninguna; la demo es un prototipo interno no publicado, sin demo pública ni repositorio de código por ahora.

## Recepción de la comunidad y debates clave

La comunidad de r/vibecoding reaccionó con fuerte escepticismo sobre el valor, la autenticidad y la sustancia técnica:

- **Polémica de costos**: los usuarios señalaron que gastar 90 dólares para armar movimiento estándar de personaje y mallas de entorno prefabricadas sale mal parado frente a gastar cero dólares usando plantillas de motores consolidados en Unity, Unreal o Godot.
- **Acusaciones de astroturfing**: varios miembros marcaron la publicación como promoción no declarada de la [plataforma Tesana](https://tesana.ai/en/blog/introducing-muranyi-3), notando publicaciones promocionales repetidas y respuestas evasivas sobre el motor subyacente.
- **La división «prototipo vs. juego»**: los comentaristas subrayaron que caminar sobre un asset de terreno no constituye un juego, recalcando la enorme brecha entre el ensamblaje de assets generativos y sistemas funcionales como fidelidad de colisiones, cálculos de daño y replicación en red.
