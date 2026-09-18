---
summary: "Un mod de Minecraft Fabric creado de forma autónoma por Fable 5.1 a partir de vídeos de YouTube, con modelos 3D de Blender y efectos de partículas."
tags: [Generado por IA, Minecraft, Mod de juego, Anthropic, Blender]
facts:
  - key: models
    value: Anthropic Fable 5.1
  - key: token cost
    value: $20.54
    highlight: true
  - key: version
    value: Fabric 1.21.1
  - key: platforms
    value: Minecraft (Java Edition)
  - key: price
    value: Gratis (open source en GitHub)
  - key: tools used
    value: atomic.chat · Blender MCP Bridge
---

## Qué es

El proyecto es un mod de Minecraft Fabric creado casi en su totalidad por un agente de IA autónomo que ejecuta Fable 5.1 de Anthropic. A partir de dos enlaces de YouTube —un clip de anime del dragón de rayos Kirin de Sasuke, de *Naruto*, y metraje de juego de un mod de cañón de riel orbital—, la IA sintetizó ambos conceptos en un arma de cañón de riel jugable que invoca un enorme ataque de dragón de rayos al impactar.

## Propuesta de valor

- **Análisis de fotogramas multimodal**: el agente extrajo referencias visuales directamente de los vídeos de YouTube ingiriendo flujos de capturas fotograma a fotograma.
- **Control de herramientas entre aplicaciones**: se integró mediante un puente MCP de Blender (Model Context Protocol) para modelar y texturizar tanto el arma como la entidad del dragón sin esculpido 3D manual.
- **Iteración por retroalimentación visual**: los errores se corrigieron únicamente devolviendo al agente clips de gameplay con los fallos, en lugar de escribir revisiones de código a mano.
- **Andamiaje de mod de extremo a extremo**: generó código Java estándar de Fabric 1.21.1, estructuras de recursos, lógica de entidades y efectos de impacto en el terreno en aproximadamente una hora.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Modelado manual en Blockbench / Blender | Moderada | Gran capacidad para prototipar entidades rápido y hacer rigging básico, aunque la optimización fina de polígonos sigue favoreciendo a los humanos. |
| Andamiaje tradicional de mods Fabric | Alta | Sustituye el código Java repetitivo, el registro y la configuración inicial de mecánicas de entidad para mods de objetos independientes. |
| Scripting dedicado de VFX / partículas | Parcial | Adecuado para destrucción estándar en área y ráfagas de partículas; los pipelines de shaders personalizados complejos aún requieren ajuste manual. |

## Realidades y limitaciones actuales

- **Salida de código desestructurada**: las revisiones de la comunidad señalaron convenciones de nombres caóticas y una estructura difícil de mantener, pese a que el gameplay funciona.
- **Sobrecoste de tokens por entrada de vídeo**: analizar fotogramas en bruto consumió unos 383,6k tokens de salida y costó más de $20 de API para un solo mod pequeño.
- **Dependencia de plataforma**: depende en gran medida de integraciones MCP personalizadas como el puente de Blender y un orquestador externo (`atomic.chat`) para coordinar la ejecución multiherramienta.
- **Debates sobre originalidad**: varias mecánicas guardan gran parecido con mods de cañón de riel y rayos ya existentes de código abierto, lo que plantea dudas sobre memorización de datos de entrenamiento.

## Veredicto

> **Recomendación principal**
>
> Una muestra pionera de flujos de trabajo agénticos multimodales en los que los clips de vídeo sirven directamente como especificaciones de diseño visual, reduciendo drásticamente la barrera para crear mods pese al alto coste en tokens y a un código fuente poco pulido.

## Ciclo de desarrollo e iteración

El autor aportó dos URLs de YouTube y un prompt de alto nivel para que el agente combinara la mecánica del arma con la estética del dragón de rayos. La ejecución se gestionó con Fable 5.1 en modo agente dentro de `atomic.chat`.

En la primera pasada, Fable analizó los fotogramas, generó mallas 3D en Blender vía MCP, escribió la lógica del mod y compiló el paquete. Cuando las pruebas revelaron que el dragón aparecía boca abajo y sin impacto, el autor simplemente devolvió grabaciones de pantalla. Fable corrigió la orientación, duplicó el tamaño de la entidad y generó cráteres de terreno, escombros y efectos de fuego personalizados en un solo ciclo de revisión.

| Etapa | Modelo / Herramienta | Resultado |
| --- | --- | --- |
| Extracción de vídeo | Extensión de capturas del navegador | Referencias visuales fotograma a fotograma |
| Modelado y texturizado 3D | Fable 5.1 + Blender MCP Bridge | Activos 3D del dragón y del cañón de riel |
| Lógica y compilación del mod | Fable 5.1 | Base de código Java de Fabric 1.21.1 |
| QA y refinamiento visual | Fable 5.1 (crítica por visión) | Corrección de orientación, física de cráteres, FX de escombros |

## Métricas y monetización

- **Uso de tokens**: ~383,6k tokens de salida entre la construcción inicial y los bucles de refinamiento.
- **Coste de API**: $20.54 de gasto total en la API de Anthropic.
- **Tiempo invertido**: ~1 hora desde el prompt inicial hasta una build probada en juego.
- **Modelo de monetización**: publicado 100% gratis y open source en GitHub, aunque miembros de la comunidad señalaron los ingresos por anuncios en vídeos cortos como vía viable para recuperar el coste.

## Recepción de la comunidad y debates clave

El hilo generó gran atención en r/ClaudeAI, con miles de votos por demostrar ejecución agéntica multimodal de extremo a extremo. Aunque a algunos usuarios les escandalizó gastar $20 en tokens de API para un mod efímero, los modders señalaron que producir modelos con rigging, texturas y código Java personalizados suele requerir días de trabajo manual.

Los debates se centraron en el bucle de iteración visual —en concreto, cómo el modelo interpretó grabaciones de gameplay para corregir la orientación 3D sin instrucciones a nivel de código—, junto con la duda de si las mecánicas de fondo se sintetizaron de verdad o se regurgitaron en gran medida de mods de código abierto preexistentes.
