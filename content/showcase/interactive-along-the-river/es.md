---
summary: "Una experiencia web interactiva de desplazamiento horizontal 2D que devuelve a la vida el paisaje urbano de la dinastía Song de «A lo largo del río durante el Festival Qingming»."
tags: [Canvas-2d, Asistido por IA, Arte interactivo, Patrimonio cultural]
facts:
  - key: author
    value: Xian | 弦 (@Xian0063)
  - key: platforms
    value: Web (navegador)
  - key: tech stack
    value: Canvas 2D · HTML · CSS · JavaScript
  - key: models
    value: Codex
  - key: characters
    value: 141
    highlight: true
  - key: world width
    value: 6.516 unidades en 3 distritos
  - key: tests
    value: 48 pruebas automatizadas
  - key: backend
    value: Ninguno (100 % en el cliente)
---

## Qué es

Interactive Along the River During the Qingming Festival es una experiencia web horizontal totalmente del lado del cliente desarrollada por Xian | 弦. En lugar de trocear o desplazar la pintura histórica estática, el proyecto reconstruye todo un paisaje urbano transitable de la dinastía Song mediante recursos generados por IA, renderizado dinámico por capas y Canvas 2D nativo del navegador. El usuario maneja a un avatar central por tres bulliciosos distritos urbanos, donde se cruza con ciudadanos autónomos, eventos narrativos activados, cambios de clima y maniobras de barcos por el río.

## Propuesta de valor

El proyecto convierte un rollo panorámico pasivo visto a vista de pájaro en un mundo vivo e interactivo a ras de suelo:

- **Mundo 2D multicapa recorrible**: renderiza 141 personajes dinámicos en la orilla, interiores de tiendas por capas, puentes y vías fluviales a lo largo de 6.516 unidades de mundo sin depender de pesados motores 3D.
- **Física ambiental contextual**: la colocación del calzado se calcula según la altura de los puentes y los contornos transparentes de los sprites, evitando que los personajes floten o atraviesen el suelo al moverse.
- **Secuenciación de eventos narrativos**: los intercambios entre NPC —como entregar té, pasar tela o regatear en el mercado— comparten el renderizado de un único objeto para evitar errores visuales por props duplicados.
- **Maniobra interactiva de barcos («Pasar el Puente Arcoíris»)**: el usuario arrastra cables de remolque con retroalimentación de tensión variable para que las barcazas crucen el arco del puente, desbloqueando bocetos de ilustración coleccionables.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Visores estáticos de museo digital con zoom/desplazamiento | Alta | Sustituye los visores pasivos de zoom y desplazamiento por una inmersión histórica interactiva y jugable para exposiciones culturales. |
| Recreaciones 3D pesadas con WebGL / Three.js | Moderada | Reemplaza flujos complejos de modelado 3D cuando la fidelidad visual depende de auténticas líneas de tinta 2D y de un renderizado ligero por capas. |
| Juegos educativos históricos narrativos | Baja | No puede sustituir del todo a los juegos narrativos completos por la ausencia de persistencia en backend, inventario o diálogos ramificados. |

## Realidades y limitaciones actuales

- **Estado puramente en el cliente**: construido sin servicio de backend, por lo que el progreso del usuario, las ilustraciones obtenidas y los estados de interacción personalizados no se sincronizan entre dispositivos ni sesiones.
- **Caídas de rendimiento antes de optimizar**: la alta densidad de personajes sin descarte en pantalla hacía que la tasa de fotogramas cayera a 25 FPS antes de introducir el descarte por viewport y la limitación de la frecuencia de actualización.
- **Casos límite ocasionales de ordenación de sprites**: el estricto orden por capas 2D exigió correcciones manuales puntuales para evitar que los personajes se metieran en los muebles o se desprendieran de las barandillas del puente.
- **Sin profundidad 3D completa**: como la cámara usa proyección ortográfica 2D, el usuario no puede girar hacia callejones laterales ni explorar el fondo tras las fachadas que dan a la calle.

## Veredicto

> **Recomendación principal**
> Un referente inspirador para la preservación del patrimonio digital y el vibe coding. Demuestra que combinar la síntesis visual con IA y el renderizado por capas con Canvas 2D puede convertir el arte clásico en entornos interactivos y responsivos sin la carga de motores 3D pesados.

## Ciclo de vida y bucle de iteración

El autor partió de objetivos de experiencia funcional en lugar de una biblia de arte cerrada, y planteó a Codex reglas básicas: formato de desplazamiento horizontal, paisajes urbanos transitables, comportamientos de NPC independientes y temáticas de la era Song. Tras generar Codex una plantilla artística base coherente, con aguadas de tinta sobrias y tonos tierra de baja saturación, el resto del entorno se expandió a lo largo de tres zonas continuas.

| Etapa | Modelo / herramienta usada | Enfoque y resultado |
| --- | --- | --- |
| Definición de reglas visuales y base conceptual | IA generativa y Codex | Estableció el cambio de perspectiva de vista aérea a fachadas ortogonales; produjo los mosaicos arquitectónicos base. |
| Motor central y arquitectura de capas | Codex (Canvas 2D / JS) | Separó el mundo en 7 planos de renderizado independientes (fondo, interiores de tienda, props en primer plano, viandantes, agua, clima, UI). |
| Ajuste de colisiones y locomoción | Codex | Añadió detección de altura de puente para ambos pies y cálculo de colocación del pie con máscara alfa. |
| Refactorización de rendimiento y pruebas | Codex | Implementó descarte de frustum por viewport, preescalado de sprites y construyó 48 suites de pruebas automatizadas para la lógica de puentes y clima. |

## Métricas y monetización

- **Alcance de usuarios**: superó las 3.400 visualizaciones y docenas de reposts/guardados en pocas horas tras publicarse en X.
- **Monetización**: experimento web gratuito sin monetización, muros de pago ni dependencias de backend.
- **Escala**: abarca 3 grandes distritos urbanos (6.516 unidades de coordenadas), con 141 NPC individuales y 7 encuentros comerciales y cotidianos guionizados.
- **Rendimiento de renderizado**: optimizado desde un cuello de botella inicial de 25 FPS hasta unos suaves ~55 FPS en navegadores estándar.

## Recepción de la comunidad y debates clave

Las primeras reacciones en redes sociales elogiaron el paso de los archivos estáticos de museos digitales a una gamificación viva y explorable. El debate entre desarrolladores web se centró en la elección de Canvas 2D frente a Three.js, y muchos elogiaron su arquitectura ligera y la rápida carga en móvil. Otros destacaron el hábil equilibrio en la coherencia de los recursos asistidos por IA, señalando que el arte generado conservaba la sobriedad atmosférica de las pinturas de la dinastía Song del Norte sin parecer un collage genérico de IA.
