---
summary: "Una alternativa ligera a Photoshop creada con vibe coding y orquestada por LLM: gratis, capaz de funcionar sin conexión y multiplataforma."
tags: [Generado por IA, App de escritorio, Gratis, Sin conexión, Vibe coding]
facts:
  - key: author
    value: AsejereDaDeje
  - key: platforms
    value: macOS · Windows 11 · Linux (Flatpak)
  - key: version
    value: v0.1.8 · versión temprana
  - key: models
    value: gpt astra 6 extra high
  - key: users
    value: 170
    highlight: true
  - key: token cost
    value: ~$2.000
  - key: price
    value: Gratis · sin muro de pago
  - key: offline
    value: Sí
---

## Qué es

Photon es un editor de imágenes ligero construido por completo mediante orquestación de LLM; el autor describe el proceso como "vibe coding". No busca igualar todas las funciones profesionales de Photoshop, sino cubrir la mayoría de los flujos de trabajo cotidianos, y se distribuye de forma nativa para macOS, Windows 11 y Ubuntu.

Es de uso gratuito, sin planes premium, sin muro de pago y sin necesidad de cuenta, y sigue funcionando sin conexión.

## Propuesta de valor

Photon Studio se posiciona como un editor raster de escritorio ligero y sin nube. A diferencia de los editores web o de las herramientas que dependen de la nube, ejecuta todas sus operaciones —incluidas funciones de machine learning como la detección de sujetos y la eliminación de fondos— enteramente en tu hardware local.

- Compatibilidad nativa con PSD: abre y guarda documentos `.psd` de Photoshop conservando estructuras clave como jerarquías de capas, grupos, máscaras y objetos inteligentes.
- Aislamiento estricto de datos: cero dependencias de red, cero registro, sin subidas a la nube.
- Multiplataforma y accesible: macOS (Apple Silicon e Intel), Windows 11 y Linux mediante Flatpak.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Photopea | alta | Reemplaza a Photopea para quienes buscan una herramienta nativa de escritorio, sin anuncios del navegador, latencia de red ni rastreadores web de terceros. |
| Adobe Photoshop | parcial | Puede cubrir tareas básicas de PS —cortar recursos, inspeccionar interfaces, retoques rápidos, recortes de fondo— pero no flujos complejos como Actions, preimpresión CMYK avanzada, plugins complejos o GenFill. |
| GIMP | moderada | Atractivo para quienes encuentran poco intuitiva la interfaz de GIMP y quieren atajos estándar de Photoshop y paradigmas nativos de efectos de capa desde el primer momento. |
| Affinity Photo | baja | Affinity sigue siendo muy superior en procesamiento RAW, flujos híbridos vectorial/raster no destructivos y aceleración por GPU. |

## Realidades actuales y limitaciones

- Cuellos de botella de rendimiento en fase temprana: en la v0.1.8, operaciones intensivas como el pincel corrector o las mallas de licuado complejas muestran una latencia notable e incluso congelaciones de la interfaz frente a motores C++ maduros.
- Soporte tipográfico e i18n limitado: el renderizado de texto internacional y la entrada de caracteres no latinos pueden ser inconsistentes o no estar soportados en esta compilación.
- Fricción en la distribución: las descargas exigen dejar un correo para recibir el enlace del instalador, en lugar de ofrecer un repositorio o una descarga directa.

## Veredicto

> **Recomendación principal**
>
> Hoy se usa mejor como visor de PSD seguro y sin conexión y como utilidad gráfica ligera —para desarrolladores y diseñadores que necesitan ediciones rápidas sin cargar una suite creativa pesada.

## Ciclo de vida de desarrollo e iteración

Primero llegó la investigación profunda: un desglose inicial y exhaustivo de las funciones y flujos centrales de Photoshop, procesado con gpt. Después, esos requisitos se llevaron a gpt astra 6 extra high para redactar la estructura del sistema y las etapas de ejecución.

Siguió una revisión con humano en el bucle: el autor inspeccionó la hoja de ruta generada, aportó comentarios críticos y ajustó los límites técnicos antes de que existiera código.

La generación del MVP produjo una primera versión funcional pero inestable. A partir de ahí se impuso un ciclo de retroalimentación rápido: uso manual, detección de errores o solicitudes de cambio, generación de parches y nueva verificación. Los parches salieron de fable y gpt6.

Tras el lanzamiento, los usuarios se toparon con bloqueos de inicio de sesión provocados por una IP de proxy compartida que limitaba a todos a 20 correos por hora. Codex produjo el arreglo de limitación por visitante y se volvió a desplegar en menos de 5 minutos.

Qué modelo hizo cada tarea es la parte más digna de copiar de este caso: el modelo caro de contexto largo planifica una sola vez, mientras que los modelos baratos y rápidos sostienen el bucle ajustado de parches.

| Etapa | Modelo utilizado |
| --- | --- |
| Investigación y procesamiento | gpt |
| Arquitectura y planificación | gpt astra 6 extra high |
| Corrección de errores y generación de parches | fable · gpt6 |
| Corrección urgente del despliegue | Codex |

> **Perfil de costo**
>
> Gasto total en tokens de todo el desarrollo: unos 2.000 dólares —se planificó una vez con el modelo más caro y luego se iteró con modelos más baratos.

## Métricas y monetización

El proyecto alcanzó 170 usuarios activos el día del lanzamiento.

La monetización está deliberadamente ausente: es totalmente gratis, sin planes premium ni muros de pago. El creador declaró que el dinero no es un motivador tras una salida anterior de siete cifras.

La hoja de ruta se centra en mejoras de comodidad impulsadas por los usuarios —lienzo que se ajusta al portapapeles, ajustes preestablecidos de zoom y empaquetado Linux no basado en distro, como Flatpak y AppImage— antes de experimentar posiblemente con clones independientes de herramientas complejas como After Effects.

## Recepción de la comunidad y debates clave

La viabilidad generó un escepticismo considerable: ¿puede una herramienta así sustituir de verdad a Photoshop o es solo un editor básico de gráficos y texto artístico? El debate pone de relieve la regla 80/20 del software creativo, donde las funciones de cola larga varían enormemente entre flujos profesionales.

Las comparaciones con herramientas gratuitas consolidadas dominaron el hilo —Photopea, GIMP, Krita y Affinity— y el consenso de la comunidad es que herramientas web hechas por un solo desarrollador como Photopea siguen siendo la cota más alta para flujos ajenos a Adobe.

En términos generales, el proyecto sirve como un caso de prueba muy visible de cómo la IA conversacional comprime el prototipado de un MVP de software de meses a días con un capital mínimo.
