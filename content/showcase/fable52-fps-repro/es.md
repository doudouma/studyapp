---
slug: fable52-fps-repro
name: Reproducción FPS de Fable 5.2
summary: Un solo prompt y Fable 5.2 escribe en 40 minutos un shooter 3D de 131 KB en un único archivo; después el flujo se divide en experimentos de audio, materiales y modelado, cada uno con su propia factura. Todo sin intervención: la IA se hace capturas en el navegador, renderiza su propio audio en modo offline para detectar clipping, y los cuatro experimentos suman unos 39,6 dólares.
category: experiment
tags: [Fable 5.2, Claude Code, Three.js, WebAudio, Desarrollo de juegos, Ingeniería de prompts]
publishedAt: 2026-11-12
updatedAt: 2026-11-12
author: WquGuru
externalUrl: https://github.com/wquguru/fable52-fps-repro
facts:
  - key: one prompt
    value: Un prompt → un FPS de 131 KB en un archivo (tres oleadas de drones, 18 sonidos sintetizados)
    highlight: true
  - key: experiments
    value: 4 experimentos independientes · 5 ejecuciones · todo HTML de un archivo
  - key: time
    value: 16,6 / 23,9 / 28,7 / 40,8 minutos
  - key: cost
    value: Unos $39,6 los cuatro · la ejecución 04 cuesta $15,96 ($60,57 sin caché)
  - key: stack
    value: Claude Code headless · Fable 5.2 · agent-browser · OfflineAudioContext
  - key: license
    value: MIT · 55 estrellas
sources:
  - title: Fable 5.2 de modelado a juego FPS completo (republicado por WaytoAGI)
    url: https://waytoagi.feishu.cn/wiki/WhlCwkIkpi0Y3ik2NHXcB46enUc
    publisher: WaytoAGI / WquGuru
  - title: wquguru/fable52-fps-repro — GitHub (MIT)
    url: https://github.com/wquguru/fable52-fps-repro
    publisher: GitHub
  - title: Jugar en línea
    url: https://wquguru.github.io/fable52-fps-repro/
    publisher: GitHub Pages
  - title: Publicación original (X)
    url: https://x.com/wquguru/status/2120382704
    publisher: WquGuru
cover:
  src: /showcase/fable52-cover.jpg
---

## Un prompt, cuarenta minutos, un shooter

El 9 de noviembre de 2026, Felix Rieseberg, de Anthropic, mostró en X un shooter de navegador llamado Saltline, generado con un solo prompt de Fable 5.2: 8 horas de ejecución, 445 millones de tokens de entrada y unos 550 dólares. Dos días después, WquGuru lo reprodujo con el prompt que Felix publicó — **40,8 minutos, 73 rondas, 6,61 millones de tokens de entrada, unos 15,96 dólares** — y el modelo creó un juego propio llamado SUBLEVEL 07: un pasillo subterráneo de subestación húmedo, reflejos en tiempo real en el suelo, una carabina con mira de punto rojo y tres oleadas de drones flotantes.

No se quedó en una sola prueba. El tutorial divide el flujo en cuatro experimentos que se pueden facturar por separado: primero audio, luego materiales, luego modelado, y solo al final el prompt original suelto en una carpeta vacía. Cada experimento es **código puro, sin cargar imágenes, modelos ni audio externos**.

![SUBLEVEL 07 en juego: un pasillo subterráneo de subestación, la carabina y la primera de tres oleadas de drones](/showcase/fable52-cover.jpg)

## El reparto: cuatro herramientas y un comando

El equipo es pequeño:

* **Claude Code** — ejecuta todo en modo headless desde la línea de comandos, gestionando lectura y escritura de archivos, caché y límite de presupuesto
* **Fable 5.2** — escribe el código de síntesis WebAudio, los shaders de Three.js, los modelos por vértices y la lógica del juego
* **agent-browser** — permite que la IA abra su propia página en tu Chrome local, haga capturas, lea errores de consola y confirme que WebGL corre en una GPU real
* **OfflineAudioContext** — el renderizador de audio offline del navegador, para que una IA que no puede oír renderice el audio y compruebe picos, clipping y tramos silenciosos

En una frase: lanza Claude Code desde la terminal con Fable 5.2, pásale un encargo único y un prompt de sistema con autocomprobación, y deja que escriba código, se haga capturas en el navegador y renderice audio offline, sin interrupciones hasta entregar un HTML de un solo archivo.

En la práctica son dos archivos: `builder_system.md` con el prompt de sistema adicional (permite agent-browser, exige autocomprobación, restringe la salida al directorio indicado) y `prompt.md` con el encargo de esta ejecución. Después:

```
claude -p "$(cat prompt.md)" \
  --model claude-fable-5-2 \
  --permission-mode auto \
  --append-system-prompt "$(cat builder_system.md)" \
  --max-budget-usd 12
```

## Primero, 16,6 minutos para probar el bucle

No empieces por el FPS completo. Empieza por la consola de audio más pequeña posible para comprobar que el bucle desatendido funciona; esta prueba costó 4,66 dólares. Tres pasos:

1. **Preparar el entorno (2 minutos)** — Claude Code 2.1.242 o superior (el autor usó 2.1.322), Chrome y agent-browser instalados
2. **Crear dos archivos (2 minutos)** — `builder_system.md` y `prompt.md` en una carpeta vacía
3. **Escribir el prompt de sistema (1 minuto)** — pedirle a la IA que se haga capturas y revise el audio, y lanzar el comando

Lo que devolvió fue más de lo pedido: una consola con forma de onda, espectrograma y espectro, con pico / RMS / número de voces en vivo, y 14 botones de sonido que cubren disparo de rifle en interior y exterior, las tres fases de la recarga, casquillo al caer, tres pasos (hormigón, metal, charco), bala que pasa, rebote, lluvia, trueno lejano y unos 30 segundos de música. Además añadió un botón «demostración de tiroteo» que encadena todos los sonidos, y cada disparo usa una semilla aleatoria nueva, así que pulsar dos veces el mismo botón no suena idéntico.

![La consola de audio SALTLINE: forma de onda, espectrograma, espectro y 14 sonidos de juego sintetizados por código](/showcase/fable52-audio.jpg)

## Experimento 01: sintetizar audio de juego en código puro

¿Por qué probar el audio primero? Porque es donde más se nota que «la IA no oye»: una captura puede verificar una imagen, pero no un sonido.

Esta ejecución tardó 16,6 minutos en 16 rondas: 1,17 millones de tokens de entrada, 88,6% de acierto de caché, 78 mil tokens de salida — 4,66 dólares frente a 12,47 sin caché. El HTML de un archivo pesa 56 KB.

Siguiendo el prompt de sistema, renderizó el audio offline con OfflineAudioContext para comprobar clipping y silencios, y su propio informe dice «no escuchado por un oído humano». Esa frase importa: **la autocomprobación valida propiedades técnicas, no si suena bien**.

## Experimento 02: materiales procedurales para un muelle lluvioso

Sin ninguna textura de imagen y con una sola biblioteca desde CDN (Three.js); todo lo demás se genera en código: hormigón mojado con reflejos reales en los charcos, contenedores pintados que se oxidan en los bordes (incluso los números de caja están dibujados), armarios de acero galvanizado, neumáticos de goma negra, palés de madera y una placa de latón envejecida.

23,9 minutos, 25 rondas, 2,46 millones de tokens de entrada, 83,8% de caché, 8,56 dólares y 55 KB de salida. Usó agent-browser para capturar su propia página y confirmó que WebGL corría en la GPU real de un Apple M2 Pro, no en software. Los defectos que él mismo reporta: algunos baches poco profundos se leen como charcos y las pilas de contenedores del fondo son bloques de color plano.

![El estudio de materiales del muelle lluvioso: suelo mojado reflectante, contenedores oxidados y números pintados por código](/showcase/fable52-materials.jpg)

## Experimento 03: una grúa, un barco y un rifle hechos con código

La tercera prueba es modelado de superficie dura sin archivos de modelo: solo geometría, montada en Three.js:

1. **Una grúa pórtico** — cerchas, caseta de maquinaria, cabina, ocho cables de elevación, spreader de 40 pies y animación de carga
2. **Un portacontenedores de 215 metros** — bulbo de proa, doce bahías de contenedores, puente de mando
3. **Un rifle de asalto en primera persona** — riel, freno de boca, ventana de eyección, cargador, mira de punto rojo

28,7 minutos, 19 rondas, 2,05 millones de tokens de entrada, 76,1% de caché, 10,38 dólares y 69 KB de salida. Añadió además una pestaña de «panorama del muelle» que nadie pidió, uniendo las tres escenas: unos 1,85 millones de triángulos, a unos 120 fps en el M2 Pro. Su defecto autodeclarado es igual de honesto: la vista en primera persona no tiene brazos.

![El visor de modelos: grúa, barco, rifle y panorama del muelle, montados con geometría pura](/showcase/fable52-models.jpg)

## Experimento 04: un prompt, un FPS completo

Con los tres módulos validados, el autor pasó a una carpeta limpia y vacía y usó el prompt original de Felix — sin el «You know, you should also» inicial, con una línea sobre HTML de un archivo, solo CDN y sin archivos externos — para ver qué producía una sola ejecución.

Esta usó caché de 1 hora: 40,8 minutos, 73 rondas, 6,61 millones de tokens de entrada, 90,9% de acierto, 193 mil tokens de salida. A precio de lista serían 60,57 dólares; con caché salió 15,96. Ese 90,9% cae justo en la banda del 90–95% que había estimado a partir de los números de la publicación original.

Lo que construyó fue SUBLEVEL 07, 131 KB en un archivo:

* **Escena y render** — un pasillo subterráneo de subestación húmedo con números pintados en los pilares, materiales procedurales, reflejos en tiempo real en el suelo, AO, bloom y etalonaje cinematográfico, con tres niveles de calidad
* **Armas y combate** — carabina con mira de punto rojo, recarga, retroceso, fogonazo y eyección de casquillos; tres oleadas de drones flotantes (la segunda en una zona de luces rojas); 18 sonidos sintetizados en código
* **Prueba automática** — antes de entregar, escribió su propio script que superó las tres oleadas, verificó las pantallas de victoria y muerte y confirmó una consola sin errores

Sus defectos autodeclarados: los antebrazos y guantes son toscos y solo el suelo refleja.

![SUBLEVEL 07: fogonazo, casquillos expulsados y tiroteo en la zona de luces de advertencia](/showcase/fable52-fps.jpg)

## La factura: la caché convierte 60 dólares en 16

Todos los datos se midieron el 2026-11-10 con Claude Code 2.1.322 y el modelo `claude-fable-5-2`. El autor usó su cuota de suscripción, así que los importes son la estimación de Claude Code a precios oficiales de API, que él recalculó línea por línea con un script; cada experimento se ejecutó una vez.

| Experimento | Tiempo | Rondas | Tokens de entrada | Acierto de caché | Coste | Sin caché |
| --- | --- | --- | --- | --- | --- | --- |
| 01 consola de audio (caché 5 min) | 16,6 min | 16 | 1,17 M | 88,6% | $4,66 | $12,47 |
| 01 consola de audio (caché 1 h) | 18,8 min | 16 | 1,29 M | 78,6% | $6,97 | $13,98 |
| 02 materiales | 23,9 min | 25 | 2,46 M | 83,8% | $8,56 | $24,24 |
| 03 modelado | 28,7 min | 19 | 2,05 M | 76,1% | $10,38 | $21,96 |
| 04 FPS de un prompt | 40,8 min | 73 | 6,61 M | 90,9% | $15,96 | $60,57 |

Los cuatro experimentos suman unos 39,6 dólares, o unos 47 con la ejecución de control y las pruebas rápidas. La clave es que el modelo no emite el juego de una vez: relee el proyecto y lo edita durante decenas de rondas. La lectura de caché cuesta 0,025× el precio base de entrada, y mientras la pausa entre rondas sea de segundos la caché se renueva — así bajó la ejecución 04 de 60,57 a 15,96.

## Un accidente: por qué los tres primeros dicen SALTLINE

Es un tropiezo del propio autor, y la lección más memorable de todo el artículo.

Los experimentos 01–03 se ejecutaron en una carpeta de su biblioteca creativa **cuyo nombre contenía `saltline`**, y ese directorio tenía además un `AGENTS.md` de normas de escritura sin relación con el juego que se carga automáticamente. Así que Fable 5.2 tomó `SALTLINE` del nombre de la carpeta y lo puso en la interfaz: por eso la consola de audio, la página de materiales y el visor de modelos llevan esa palabra.

Para el experimento 04 se mudó a una carpeta vacía sin ningún `CLAUDE.md` ni `AGENTS.md`, y el modelo nombró su obra por sí mismo: **SUBLEVEL 07**.

## Pruébalo tú

El repositorio tiene licencia MIT y contiene las cuatro demos, los prompts originales, los scripts y los datos de facturación de cada ejecución; las cuatro demos de código puro se pueden jugar desde la página del proyecto:

* Repositorio: `https://github.com/wquguru/fable52-fps-repro`
* Jugar en línea: `https://wquguru.github.io/fable52-fps-repro/`
* Cómo ejecutarlo: `scripts/run.sh 01-audio prompts/01-audio.md 5m 12` (el último argumento es el límite de presupuesto por ejecución, en dólares)

## Atribución

Compilado de «Fable 5.2 de modelado a juego FPS completo», republicado en la base de conocimiento de WaytoAGI; el autor original es WquGuru (X [@wquguru](https://x.com/wquguru)) y la publicación es del 2026-11-11. El repositorio wquguru/fable52-fps-repro tiene licencia MIT. La inspiración vino de Saltline, el juego que Felix Rieseberg (Anthropic) hizo con Fable 5.2; estas demos no son Saltline y no contienen su código. Las capturas provienen del tutorial original y del repositorio y siguen siendo propiedad del autor; todas las cifras proceden de su facturación medida.
