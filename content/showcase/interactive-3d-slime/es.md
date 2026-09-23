---
summary: Un tutorial de Codex + GPT-6 para crear un slime de gel translúcido y apretable con WebGPU en Three.js, con el conjunto completo de prompts incluido.
tags: [Three.js, WebGPU, Tutorial, Generado por IA, Interactivo]
---

## Qué es

Este es un tutorial capítulo a capítulo que te guía para construir un slime de gel 3D apretable como un juguete real de navegador usando Codex + GPT-6, Three.js y WebGPU nativo. Es una escena 3D auténtica —mallas, iluminación, materiales físicos y cámara— y no una imagen pegada sobre un canvas: los dos ojos negros y la pequeña boca están anclados a la cara frontal de la misma malla y se deforman con el cuerpo al presionar, arrastrar hacia arriba y soltar.

La página final combina un escenario blanco cálido con un panel de control que ofrece cinco esquemas de color, rigidez, amortiguación, escala (65 %–115 %) y un botón "Poke". Al final se incluye un conjunto completo de prompts, un bloque por capítulo.

## Propuesta de valor central

El atractivo del tutorial es que el apretado es real: un modelo ligero de resortes impulsa una única malla continua, así que la cara y los reflejos se mueven con la superficie en lugar de deslizarse por encima.

- **Una malla de gel continua**: un primitivo de cúpula se fusiona con varios elipsoides inferiores mediante Marching Cubes, lo que da una base suave y extendida con volumen y curvatura reales.
- **Rasgos faciales que se ajustan**: los ojos y la boca se proyectan desde la cara frontal y comparten exactamente la misma pasada `deform()` y las mismas actualizaciones de normales que el cuerpo.
- **Translucidez solo con WebGPU**: `MeshPhysicalNodeMaterial` junto con nodos TSL combinan tinte de absorción, grosor, baja rugosidad y reflejos de estudio, con 640 microburbujas instanciadas para dar profundidad interior.
- **Prompts reutilizables**: cinco prompts de capítulo —objetivo y maqueta, página y entrada de render, malla y translucidez, interacción y física, empaquetado— que se pueden dar a Codex uno a uno.

## A qué puede reemplazar

| Enfoque objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Clips de producto 3D prerrenderizados | Alta | Sustituye los bucles mp4 pregrabados de las visuals principales por un canvas en tiempo real que responde al puntero. |
| Pegar una imagen de mascota 2D en el canvas | Alta | Sustituye el atajo del falso 3D por una malla cuya cara y reflejos especulares se deforman juntos bajo presión. |
| Prototipos con motor de juego (Unity/Godot) | Parcial | Cubre un juguete interactivo de un solo objeto en el navegador sin motor ni build; no sustituye a un juego completo. |
| Sandboxes de física (matter.js/rapier) | Moderada | Resuelve de forma económica un cuerpo blando estilizado de resortes y gravedad; no es una simulación precisa de cuerpos rígidos o telas. |
| Mercados de recursos 3D de stock | Baja | El slime es totalmente procedural y no compra modelos, pero los personajes a medida siguen necesitando herramientas de modelado. |

## Realidades y limitaciones actuales

- **WebGPU es un requisito estricto**: no hay respaldo WebGL y la degradación automática de Three.js se desactiva a propósito, así que los navegadores no compatibles ven un error y los controles quedan deshabilitados.
- **Versión fijada**: el build fija Three.js 0.180.0 / r180 y usa propiedades internas (`_getFallback`, `backend.isWebGPUBackend`), así que subir de versión puede romper la comprobación del backend.
- **Pensado para escritorio**: los benchmarks se tomaron en un M4 Pro con un canvas de 990×720; los móviles y las GPU de gama baja no se evalúan.

## Veredicto

> **Recomendación principal**
>
> Una buena plantilla para desarrolladores que quieren un juguete 3D que se deforma de verdad en el navegador, y una referencia limpia para fijar WebGPU nativo en lugar de caer en silencio a WebGL.

## Ciclo de vida del desarrollo y bucle de iteración

El build sigue el mismo bucle que enseña el artículo: elegir una maqueta de referencia, entregar a Codex un capítulo cada vez, comparar el resultado con la maqueta e iterar. Primero la forma, después el material: la malla y sus rasgos faciales se fijan antes, y luego el sombreado de transmisión y las burbujas.

| Etapa | Modelo usado |
| --- | --- |
| Maqueta conceptual y base visual | Generación de imágenes de GPT-6 |
| Diseño y inicialización de WebGPU nativo | Codex · GPT-6 |
| Malla, rasgos ajustados y translucidez | Codex · GPT-6 |
| Interacción y ajuste de la física | Codex · GPT-6 |
| Reproducción y empaquetado | Codex · GPT-6 |

## Métricas y monetización

Los benchmarks de la v0.8 se registraron en un M4 Pro / 48 GB, Headless Chrome 152 / Metal 3, viewport de 1440×1000, canvas de 990×720, DPR 1: 59,40 FPS en reposo durante 10,02 s, 59,26 FPS en interacción continua durante 13,50 s y un P95 de tiempo de fotograma de 16,8 ms.

No hay monetización: el tutorial se distribuye gratis, con el conjunto completo de prompts incluido para reutilizarlo.

## Debates clave y reproducibilidad

La postura deliberadamente intransigente es usar solo WebGPU. El `WebGPURenderer` estándar de Three.js puede caer en silencio a WebGL 2, así que el tutorial comprueba el nombre de la clase y afirma `renderer.backend.isWebGPUBackend`; si un dispositivo no está disponible, muestra una explicación en lugar de degradarse. Es un compromiso claro: renderizado nativo real y código de shader más limpio a cambio de un alcance de dispositivos más estrecho.

La reproducibilidad es la razón de ser de este formato: los cinco prompts están ordenados para poder repetir el build capítulo a capítulo, y la maqueta de referencia da a cada paso un objetivo visual fijo con el que comparar.

## El conjunto completo de prompts

Introduce estos prompts en Codex en orden, un capítulo a la vez. La maqueta del Prompt 01 es la referencia de calibración para todos los capítulos siguientes.

### Prompt 01 · Objetivo y maqueta visual

```text
Crea en el proyecto actual una página web interactiva con un slime 3D usando Three.js y WebGPU nativo. Quedan estrictamente prohibidos los respaldos a WebGL o las degradaciones automáticas.

Primero, genera una imagen de maqueta conceptual de página completa, guardando tanto la imagen como el prompt de generación, y espera mi confirmación antes de implementar. (Si no hay herramienta de imagen disponible, usa la imagen de referencia objetivo proporcionada.)
El diseño de la página requiere un fondo blanco cálido y limpio, un titular chino en negrita "捏捏，放轻松。" ("Aprieta, relájate.") y el subtítulo "一团软乎乎，接住你的无聊。" ("Un compañero blandito para tu aburrimiento.").
A la izquierda: un slime de gel verde menta semitransparente con cúpula, base carnosa y extendida, burbujas internas finas, tiras de luz de estudio y sombras de contacto sutiles. Dos pequeños ojos negros y una boca se ajustan firmemente a la cara frontal.
A la derecha: un panel de control redondeado con opciones de color, rigidez, amortiguación, escala y un botón "Poke". Amplio espacio negativo, sin desorden.

El personaje final debe soportar apretado localizado, arrastre hacia arriba, rebote elástico al soltar y aterrizaje suave en el suelo, con los rasgos faciales deformándose sin costuras con la superficie. Objetivo 60 FPS y verificación en hardware real al terminar.
```

### Prompt 02 · Página y entrada de render

```text
Crea una página web ejecutable basada en la maqueta elegida. Usa fondo blanco cálido #F8F6F3, tipografía en negrita, un escenario de canvas 3D a la izquierda y un panel de control a la derecha (reubicado abajo en móvil/pantallas estrechas).
Organiza el proyecto limpiamente en archivos separados: diseño de página, generación de malla, física de cuerpo blando e inicialización de WebGPU. Conserva el diseño de referencia sin falsear el 3D pegando la imagen en el canvas.

Fija y empaqueta localmente Three.js 0.180.0 / r180. Solicita un dispositivo WebGPU nativo, desactiva los mecanismos de respaldo automático a WebGL de esta versión y verifica el backend activo tras inicializar el renderizador.
Si usas propiedades internas, documenta explícitamente las restricciones de versión.
Muestra una explicación al usuario, deshabilita los controles y detén los bucles de ejecución si WebGPU no está disponible, falla al inicializar o pierde el contexto.

Levanta un servidor local, proporciona la URL local y confirma en un navegador real que la escena carga limpiamente sin crear un contexto WebGL.
```

### Prompt 03 · Malla, rasgos faciales y translucidez

```text
Construye una malla de gel 3D suave y continua siguiendo la referencia objetivo, asegurando una cúpula redondeada, una base blanda y carnosa y suficiente profundidad de volumen. No la sustituyas por una esfera rígida estándar.
Genera ojos y boca anclados a las coordenadas de la cara frontal, compartiendo exactamente la misma lógica de deformación y actualizaciones de normales que el cuerpo para mantener reflejos continuos y suaves en toda la cara.

Implementa materiales de transmisión física compatibles con WebGPU que combinen tinte de absorción, mapas de grosor, baja rugosidad y reflejos de entorno suaves para lograr un gel turquesa luminoso. Controla el coste usando mallas instanciadas para las microburbujas internas.
Mantén la base más clara y ligera usando coordenadas de reposo locales, para que las regiones permanezcan estables durante el estiramiento y el arrastre.

Fija cámara, viewport, color base y escala, captura una captura de pantalla real del navegador, compara contornos, volumen y translucidez con la referencia y pule los detalles sutiles.
```

### Prompt 04 · Interacción y ajuste de la física

```text
Implementa compresión localizada, arrastre, rebote elástico y una sutil colisión con el suelo. Asegura que cuerpo, rasgos faciales y reflejos especulares compartan el mismo pipeline de deformación, actualizando un sistema ligero de resorte-amortiguador-gravedad con un paso de tiempo fijo.
Implementa 5 colores predefinidos, rigidez, amortiguación, escala del 65 %–115 % y una acción "Poke". Las operaciones de escala deben actualizar de forma sincronizada el mapeo de coordenadas para los impactos del raycast.
Gestiona con elegancia la cancelación del puntero, la pérdida de foco y las entradas rápidas para evitar estados de arrastre bloqueados o elementos que salgan volando de la vista.

Incluye un cargador de gel que respira suavemente durante la preparación inicial de recursos, con una transición fluida una vez que la GPU completa su coste de primer fotograma antes de habilitar los controles de usuario. Respeta los ajustes de 'prefers-reduced-motion'.

Prueba a fondo las interacciones, las variaciones de color, los valores límite de escala, las vistas móviles y los estados de error. Perfila y reporta los FPS sostenidos (tanto en reposo como activos), registrando especificaciones del dispositivo, versión del navegador, tamaño del viewport, DPR, duración de la muestra y cualquier caída de fotograma del percentil 95.
```

### Prompt 05 · Reproducción y empaquetado

```text
Organiza y valida este proyecto de slime 3D para que pueda reproducirse de forma fiable en otros entornos.

Empaqueta index.html, estilos, archivos fuente de src/, dependencias locales de vendor y licencias en un ZIP completo junto con un README sin rutas absolutas.
Documenta los requisitos previos, los comandos de inicio local, las URL, las soluciones para colisiones de puertos y los procedimientos de salida limpia, enfatizando los requisitos estrictos de WebGPU.
Realiza una ejecución en entorno limpio directamente desde el archivo descomprimido para verificar que no falta ninguna dependencia.

Graba una breve captura de pantalla del navegador que demuestre las interacciones de presionar, arrastrar, soltar, recolorear y pinchar.
Incluye una comparación lado a lado entre la imagen de referencia inicial y el render actual con WebGPU, señalando las discrepancias visuales y los criterios de rendimiento medidos.
Proporciona URL de demo en vivo, enlaces de descarga e inserta los prompts de capítulo reutilizables de forma secuencial en la documentación.
```
