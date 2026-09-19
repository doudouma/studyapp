---
summary: "Un prototipo de juego de pesca 3D low-poly creado íntegramente con Claude Code, Godot y orquestación de Blender MCP."
tags: [Desarrollo de juegos, Claude Code, Motor Godot, Blender MCP, Low poly]
facts:
  - key: author
    value: u/RUSuper
  - key: platforms
    value: Windows · macOS
  - key: engine
    value: Godot 4.7.1
  - key: models
    value: Claude (Ultracode) · ChatGPT (OpenAI Playground) · Codex
  - key: token cost
    value: $200/mes plan Claude Max + $20/mes ChatGPT
    highlight: true
  - key: pipeline
    value: Blender MCP · Godot MCP · Orquestación multi-sesión
---

## Qué es

AI Fishing Game es un experimento de desarrollo en solitario del desarrollador u/RUSuper, cuyo objetivo es construir un juego completo de pesca y navegación low-poly en Godot enteramente con ayuda de IA. Desarrollado a lo largo de varias semanas con Claude (principalmente en el plan Max con Ultracode) junto a ChatGPT, el proyecto demuestra un pipeline multiagente de extremo a extremo que abarca arte de referencia 2D, modelado 3D low-poly automatizado en Blender vía Model Context Protocol (MCP) y shaders de agua GLSL personalizados integrados en Godot 4.7.1.

## Propuesta de valor

El flujo demuestra que un solo creador que actúa como director de arte puede producir un entorno de juego 3D coherente orquestando sesiones de IA modulares:

* **Modelado 3D procedural por script**: sustituye las herramientas de generación de mallas en bruto por una sesión dedicada de Claude conectada a Blender vía MCP, manteniendo los modelos editables, low-poly y estilísticamente uniformes.
* **Trazabilidad estricta de decisiones**: impone un registro de decisiones que etiqueta cada elección como dictada por el usuario o sugerida por la IA, eliminando alucinaciones en las que ideas sintéticas se convierten en requisitos fantasma.
* **Evaluación visual a ciegas**: evalúa las renovaciones visuales con perspectivas de cámara dentro del juego, puntuadas según criterios preestablecidos (umbral 8/10) y comparaciones a ciegas para eliminar el sesgo de novedad.
* **Federación de agentes multi-sesión**: usa una sesión maestra que reparte tareas discretas a subsesiones especializadas (modelado, integración, shaders, UI) y gestiona los relevos entre ellas.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Modelado 3D low-poly manual | Moderada | Claude vía Blender MCP scripta bien props, muelles y barcos simples; los personajes con rigging complejo aún requieren herramientas dedicadas. |
| Autoría tradicional de shaders | Alta | Claude crea de forma fiable shaders de agua complejos, dinámica de olas y transiciones de color diurnas directamente en Godot. |
| Plataformas de mallas 3D generativas (p. ej., Rodin) | Alta | Los assets low-poly por script producen topología más limpia y archivos más pequeños que las mallas generativas directas. |
| Flujos humanos de maquetación de UI | Moderada | Borra rápidamente inventarios temáticos y guías de campo náuticas, aunque el pulido espacial manual sigue siendo esencial. |

## Realidades y limitaciones actuales

* **Consumo intensivo de tokens y límites de tasa**: las iteraciones profundas agotan en días el plan de $200/mes de Claude, obligando a puentes de respaldo hacia modelos secundarios como Codex.
* **Absurdos ambientales y clipping**: sin supervisión manual constante, los layouts generativos producen geometría ilógica como muelles tapiados inaccesibles, casas incrustadas en acantilados y NPC que levitan.
* **Limitación térmica del motor**: los pases de shader complejos y las simulaciones del editor llevan al hardware móvil sin optimizar (como los MacBook) a temperaturas altas y caídas de FPS.
* **Falta de profundidad jugable**: aunque la navegación ambiental y los shaders de agua procedurales lucen pulidos de lejos, las mecánicas de misiones y la progresión siguen siendo marcadores de posición esqueléticos.

## Veredicto

> **Recomendación principal**
> Este proyecto es un caso de referencia para la orquestación multiagente de juegos. Demuestra que combinar herramientas MCP por script con una estricta dirección de arte con el humano en el bucle supera la generación ciega de extremo a extremo, ofreciendo un plano viable para desarrolladores indie en solitario dispuestos a cambiar código manual por una moderación rigurosa del sistema.

## Ciclo de desarrollo e iteración

El flujo evolucionó de la simple escritura de prompts a un pipeline modular multi-sesión gobernado por una sesión directora global.

| Etapa | Modelo / Herramienta | Enfoque |
| --- | --- | --- |
| Referencia 2D y maqueta de UI | ChatGPT / Playground | Generación de arte conceptual para estructuras portuarias, guías de peces y pantallas de mejora |
| Generación de geometría 3D | Claude (Ultracode) + Blender MCP | Creación por script de barcos, edificios y props low-poly |
| Integración y shaders | Claude Code + Godot MCP | Renderizado de agua, ciclos día/noche, ajuste de escala y colocación de costas |
| Pulido y código de desbordamiento | OpenAI Codex | Corrección de bugs y limpieza de scripts durante los enfriamientos semanales de límite de Claude |

## Métricas y monetización

* **Coste de tokens y suscripciones**: $200/mes en el plan Claude Max, complementado con una suscripción de $20/mes a ChatGPT para arte conceptual y respaldo con Codex.
* **Distribución actual**: proyecto pasional no comercial, aún en fase de prototipo; hay una demo pública prevista una vez finalizado el bucle de misión inicial.
* **Participación comunitaria**: más de 2700 upvotes y 240+ comentarios en la comunidad r/ClaudeAI.

## Recepción de la comunidad y debates clave

El hilo despertó un gran interés entre desarrolladores indie y puso de relieve tensiones recurrentes del desarrollo de juegos con IA:

* **Elogio estético vs. fallo lógico**: los comentaristas elogiaron mucho la presentación atmosférica, de estilo *Dredge*, pero los diseñadores veteranos señalaron enseguida inconsistencias que rompen la inmersión, como escaleras bloqueadas y colocaciones de edificios amontonadas.
* **La validación del "registro de decisiones"**: colegas desarrolladores elogiaron ampliamente registrar si una idea vino del usuario o del modelo como higiene esencial contra la deriva de prompts de IA.
* **La creación como recreación**: los miembros de la comunidad debatieron si el desarrollo de juegos con IA en solitario es comercialmente viable o, sobre todo, un nuevo pasatiempo creativo y absorbente comparable a montar sets de Lego.
