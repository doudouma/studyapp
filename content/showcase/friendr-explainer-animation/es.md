---
summary: "Una ejecución totalmente autónoma de Claude Code que escribió, ilustró, dobló, animó y renderizó un vídeo explicativo de producto de 30–60 s por unos 4 $."
tags: [Generado con IA, Producción de vídeo, Claude Code, Animación Canvas, Agentes autónomos, Voz sintética]
facts:
  - key: models
    value: Claude Code (Opus 5.5) · TTS de OpenRouter · modelo externo de revisión
  - key: token cost
    value: ~4 $ en OpenRouter · ~30 % de la cuota de sesión de Claude Pro
    highlight: true
  - key: runtime
    value: 1,5–2 horas, totalmente autónomo
  - key: output
    value: Guion · Storyboard · Recortes collage · Locución · Animación Canvas · MP4
  - key: spend cap
    value: Presupuesto OpenRouter de 10 $
  - key: style
    value: Collage dibujado a mano, 30–60 s
---

## Qué es

Dio-V tomó un prompt popular de r/ClaudeAI, lo adaptó y lo apuntó a Friendr.nl — un pequeño proyecto personal — con Claude Code (Opus 5.5), un presupuesto de 10 $ en OpenRouter y una única instrucción: producir el mejor vídeo explicativo posible de 30–60 segundos en estilo collage dibujado a mano, trabajando de forma totalmente autónoma. Unas 1,5–2 horas después, la sesión entregó un MP4 terminado: guion, arte, voz, música y animación incluidos.

## Propuesta de valor

* **Autonomía real de extremo a extremo**: un solo prompt produjo el guion, el concepto de storyboard, los recortes estilo collage, la locución, la música de fondo, los efectos de sonido, el código de animación y el render final — mientras el autor estaba lejos del ordenador.
* **Diseño de movimiento basado en código**: la animación es código JavaScript puro sobre Canvas, así que cada fotograma es determinista, editable y comparable con diff, en lugar de quedar encerrado en la línea de tiempo de un editor de vídeo.
* **Sincronía audio-fotograma precisa**: el agente alineó los fotogramas con el ritmo de la locución generada — justo el paso en el que los editores humanos invierten más tiempo.
* **Autorrevisión integrada**: la ejecución llamó a modelos externos para criticar su propio primer corte y aplicó correcciones basadas en ese feedback antes de renderizar.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Agencias de vídeos explicativos | Moderada | Cubre concepto, voz, música y movimiento para una historia de producto sencilla; la dirección de arte de nivel de marca sigue necesitando humanos. |
| Flujos de After Effects / diseño de movimiento | Parcial | El código Canvas automatiza la animación de collage simple, pero las curvas complejas, el 3D y la composición siguen fuera de alcance. |
| Creadores de vídeo con plantillas | Alta | Supera a las plantillas de stock en originalidad a coste similar; cada asset se genera para el producto concreto. |
| Locución freelance + música licenciada | Alta | El TTS y el audio generado cubren la narración y la banda sonora de un explicativo corto con coste marginal casi nulo. |

## Realidad actual y limitaciones

* **La voz es TTS**: entonación, énfasis y emoción están limitados por el modelo de síntesis de voz; un narrador humano sigue teniendo más fuerza.
* **Sin director creativo en el bucle**: el autor se ausentó deliberadamente, así que el tono del guion, el humor y el ritmo son lo que el modelo decidió — un vídeo de marca real querría una pasada humana al guion antes de animar.
* **El estilo collage es virtud y límite**: la estética de collage dibujado a mano disimula bien los artefactos de movimiento de la IA, pero las demos nítidas de interfaz de producto siguen necesitando grabaciones de pantalla o motion design profesional.
* **Riesgo de presupuesto a una sola carta**: una ejecución autónoma compromete todo el presupuesto en una sola dirección creativa; no hay forma barata de generar dos conceptos rivales y elegir el mejor.

## Veredicto

> **Recomendación principal**
> Un vídeo explicativo de producto terminado y digno de verse por unos 4 $ y cero horas de trabajo manual es un punto de precio genuinamente nuevo. Usa este patrón como generador de primeros borradores para narrativa de producto: ejecútalo de forma autónoma y luego invierte esfuerzo humano donde de verdad compensa — revisión del guion, voz de marca y pulido final. Todavía no sustituye a un vídeo de marca diseñado a medida, pero es imbatible en coste por iteración.

## Ciclo de desarrollo e iteración

Todo fue una única sesión autónoma de Claude Code con una clave de OpenRouter para los modelos auxiliares, ejecutada en unas 1,5–2 horas:

| Etapa | Modelo / herramienta usados | Foco |
| --- | --- | --- |
| Planificación | Claude Code (Opus 5.5) | Leyó las FAQ del producto y escribió guion y concepto de storyboard |
| Producción de assets | Claude Code + TTS de OpenRouter | Recortes estilo collage, locución, música de fondo, efectos de sonido |
| Animación | Claude Code | Animación Canvas en JavaScript puro, fotogramas alineados al ritmo de la locución |
| Revisión | Modelo externo vía OpenRouter | Criticó el primer borrador; el agente corrigió él mismo los problemas señalados |
| Render | Claude Code | Exportó el MP4 final |

## El prompt detrás de la ejecución

El prompt completo tal como se publicó (sustituye Friendr.nl por tu propio producto):

```text
Create a pure javascript animation. 30s-60s whimsical hand drawn collage style with appropriate audio on Friendr.nl.

Entire video should be as high of a production value as possible. Please spend your time on this, it's very important. People should understand what Friendr.nl is for and after seeing the video will want to create an event to try it out. Read the FAQ first.

Use high quality text-to-speech model for generation. You can find open router API key in .env file

You can use any tools you can find access to and resources on the internet. You create the script, the assets, the animation, concept, everything.

I have to go away from my computer so please work autonomously until done. Quality is paramount. Production value should be on professional level.

One more thing: max OpenRouter spend is $10
```

## Métricas y monetización

* **Coste**: ~4 $ de gasto en la API de OpenRouter frente al límite de 10 $, más ~30 % de una cuota de sesión de Claude Code Pro.
* **Tiempo**: 1,5–2 horas de trabajo totalmente autónomo sin intervención humana.
* **Distribución**: compartido en r/ClaudeAI como escaparate comunitario; Friendr.nl es el proyecto personal del autor.
