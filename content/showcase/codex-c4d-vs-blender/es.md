---
slug: codex-c4d-vs-blender
name: Codex: C4D vs Blender
summary: El mismo prompt y la misma foto de referencia enviados por Codex a Blender y a Cinema 4D: 21:09 frente a 22:44 para modelar, y un renderizador que nunca terminó.
category: experiment
tags: [Blender, Cinema 4D, Codex, MCP, Modelado 3D, Hard Surface]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: 老鹰 (老鹰aic4d)
externalUrl: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
facts:
  - key: model
    value: GPT-6.2 Astra · Codex · razonamiento en Ultra
  - key: setup
    value: MCP hacia Blender 5.2.3 y Cinema 4D 2027.0.0
  - key: input
    value: El mismo prompt · la misma referencia de 600×600
  - key: build time
    value: Blender 21 min 09 s · C4D 22 min 44 s
    highlight: true
  - key: render
    value: Cycles en Blender, gratis · animación de 15 s ≈ 40 minutos
  - key: c4d render
    value: Ninguno terminado — no había un renderizador configurado para la prueba
  - key: verdict
    value: Modelado empatado · Blender gana en el acabado
  - key: sample
    value: Un producto, una ejecución, una máquina
sources:
  - title: Codex控制C4D和Blender到底哪个好？渲染品质如何？
    url: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
    publisher: 老鹰aic4d
  - title: Blender — suite de creación 3D libre
    url: https://www.blender.org/
    publisher: Blender Foundation
  - title: Maxon Cinema 4D
    url: https://www.maxon.net/en/cinema-4d
    publisher: Maxon
cover:
  src: /showcase/codex-c4d-blender-cover.png
---

## Hice el mismo trabajo dos veces, una por aplicación

Esto empezó como una grabación de tutorial. Quería enseñar qué hace el nuevo modelo de Codex dentro de un visor 3D, y la forma honesta era darle a dos aplicaciones el mismo encargo y sentarme a mirar.

El mismo prompt. La misma foto de referencia, 600 × 600, un Hublot Big Bang con movimiento esqueletado. Codex conectado por MCP a Blender 5.2.3 y a Cinema 4D 2027.0.0. GPT-6.2 Astra en ambos, razonamiento en Ultra: la opción cara, porque las piezas mecánicas son justo donde un modelo pierde la paciencia.

Ese detalle importa más de lo que parece. El agente no estaba generando una imagen. Estaba escribiendo Python, llamando a `bpy` y a la API de C4D, revisando el visor y añadiendo piezas de una en una mientras yo miraba. Veía aparecer el bisel, luego los tornillos, luego los puentes.

![La referencia: una foto de producto de 600×600, enviada a ambas aplicaciones sin cambios](/showcase/codex-c4d-blender-reference.jpg)

*La única entrada además del prompt. Las dos aplicaciones vieron exactamente este archivo.*

## 21:09 contra 22:44

| | Blender 5.2.3 | Cinema 4D 2027.0.0 |
| --- | --- | --- |
| Tiempo de modelado | 21 min 09 s | 22 min 44 s |
| Caja, agujas y movimiento | Sí | Sí |
| Revisión del visor | 08:16 | 08:07 |
| Renderizador | Cycles, gratis | Ninguno adecuado |
| Imagen final | Sí | Render de prueba abandonado |

Un minuto y medio de diferencia, que a esta escala no es nada. La brecha no es la historia. Las dos aplicaciones entregaron un reloj reconocible con un movimiento funcional y, a primera vista, costaría decir cuál salió de cuál.

![Izquierda: visor de Blender 5.2.3. Derecha: Cinema 4D 2027.0.0 con la cámara liberada y acercada](/showcase/codex-c4d-blender-viewport.jpg)

*Los dos visores cuando el agente entregó la escena. El lado de C4D está acercado al movimiento; el de Blender sigue encuadrado en el reloj completo.*

## Qué acertó cada uno

Cinema 4D me sorprendió por dentro. Al liberar la cámara y acercarme, los engranajes, las agujas esqueletadas y el tourbillon de las seis estaban ahí, separados y legibles. Nada era una textura fingiendo ser geometría.

Blender fue más fuerte por fuera. Las marcas del bisel estaban más limpias, los tornillos se sentaban bien en sus avellanados, y el caucho con patrón de hexágonos y las piezas rojas mantenían los bordes en un primer plano.

Si solo se comparan los modelos, esta ronda es casi un empate, y esa es la parte que la gente va a citar. La diferencia interesante llegó un paso después.

## El renderizador decidió el resto

Cinema 4D no tenía un renderizador adecuado configurado para esta prueba. Lancé un render de prueba, esperé y lo cerré. Es un hueco de preparación mía, no un veredicto sobre los renderizadores de C4D —Redshift y Octane están ahí—, pero es lo que pasó esa noche, y por eso no hay una imagen final de C4D en este artículo.

Blender tenía Cycles, gratis y ya instalado. Los bordes metálicos, las superficies cepilladas y la estructura pequeña dentro del movimiento solo se volvieron legibles después de esa pasada. El modelo nunca fue el cuello de botella. El acabado sí.

![Dos fotogramas de Cycles: el movimiento de frente y un macro del tourbillon](/showcase/codex-c4d-blender-cycles.jpg)

*La misma escena renderizada dos veces en Cycles. El macro es donde el modelo se sostiene o se rompe, y se sostuvo.*

## La animación es donde la IA todavía se nota

Pedí un clip de 15 segundos: engranajes girando, varias posiciones de cámara, todo montado. Cycles tardó cerca de 40 minutos en esos 15 segundos.

La rotación de los engranajes se leía bien. Los fallos fueron de dirección. Al pasar de la corona al primer plano del movimiento, el ease-in y el ease-out de la cámara estaban mal: demasiado brusco al entrar, demasiado blando al salir. De esas cosas que un animador arregla en diez segundos y un modelo no percibe en absoluto.

Ese plano único resume el reparto actual: el modelo construye el objeto y lo ilumina, y todavía no siente un corte.

## El mismo Blender, un modelo de diferencia

Esa mañana había hecho una versión de este reloj con Sol, también en Blender. Por sí sola me gustaba; el brillo metálico del bisel era precioso. Al poner las dos lado a lado, la diferencia no es sutil.

![Izquierda: la versión de la mañana hecha con Sol. Derecha: GPT-6.2 Astra en Ultra, misma app, mismo encargo](/showcase/codex-c4d-blender-models.jpg)

*La misma aplicación, la misma referencia. La diferencia es el modelo y el presupuesto de razonamiento, no el software.*

La ejecución nueva tiene más piezas separadas, transiciones de material más limpias y tornillos que se leen como tornillos en vez de bultos. Qué cambió entre los modelos no lo sé, pero se manifiesta como paciencia.

## Veredicto

> **Recomendación principal:** si el trabajo es un producto de superficie dura como este, pon Codex sobre Blender y guarda Cinema 4D para los planos donde ya tengas un pipeline de Redshift u Octane funcionando.

La pregunta del modelado ya está lo bastante resuelta para dejar de discutirla: en productos mecánicos, Codex es usable, no una demo. La iluminación y el render llegaron a lo que yo llamaría un nivel humano medio-alto, copiando. Dale una referencia y la calcará de maravilla. Pídele dirección de arte sin referencia y no esperaría el mismo resultado.

La pregunta del renderizador es la que decidió mi noche. Blender terminó porque Cycles ya estaba ahí. C4D probablemente también habría terminado, con un renderizador configurado y media hora extra de preparación. No es un defecto del software: es lo que vale "gratis y ya instalado" a las once de la noche.

## Lo que esta prueba no demuestra

- **Un producto, una ejecución.** Un reloj es el caso más amable posible: superficie dura, piezas repetidas, un objeto protagonista y una referencia que muestra cada detalle. Modelado orgánico, tela, personajes y entornos son otras peleas.
- **Sin topología medida.** Juzgué por ojo y por render, no inspeccionando la malla. Un modelo puede verse bien y ser una pesadilla de editar.
- **C4D no tuvo un render justo.** Sin Redshift u Octane configurados, la comparación se detiene en el visor, y no voy a fingir lo contrario.
- **Los tiempos son de esta máquina y esta red.** 21 minutos es esta máquina, este MCP, este modelo en Ultra. Tu cola, tu GPU y la carga del proveedor mueven ese número.
- **El modelo cambiará debajo de ti.** Dos ejecuciones con una semana de diferencia ya se veían distintas. Cualquier benchmark es una foto de un blanco móvil.
- **El coste no es cero.** Blender es gratis; Cinema 4D es una suscripción; el razonamiento Ultra en una sesión larga de agente tampoco es gratis.

## Lo que costó

| Línea | Realidad |
| --- | --- |
| Blender | 0 $, Cycles incluido |
| Cinema 4D | Suscripción, y el renderizador se paga aparte en la práctica |
| Agente | Sesión de Codex en Ultra, muchos tokens para más de 20 minutos de llamadas |
| Tiempo de máquina | Unos 40 minutos de Cycles por 15 segundos de animación |

La factura que decide esta comparación no es la licencia. Es la hora que gastas conectando MCP a una segunda aplicación solo para descubrir que el renderizador nunca estuvo instalado.
