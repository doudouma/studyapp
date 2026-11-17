---
summary: Un caza pixel art de 32 KB sin motor 3D ni polígonos: sprites apilados, tres cámaras y un botón Remix.
tags: [Sprite stacking, Pixel art, Fable 5.2, Forge, Juego de navegador, Remezclable]
facts:
  - key: code
    value: 32 KB
    highlight: true
  - key: rendering
    value: Sprite stacking · canvas 2D, sin polígonos
  - key: model
    value: Fable 5.2 (según @Gorden_Sun)
  - key: assets
    value: 32 archivos · 3,18 MB de arte y audio
  - key: cameras
    value: Cenital · persecución · cabina (Espacio)
  - key: weapons
    value: Cañón (clic derecho) · misiles (M) · cazas enemigos
  - key: made with
    value: Forge de UI8 · público y remezclable
  - key: reception
    value: 1,9 M de vistas · 26 K me gusta · 553 respuestas
  - key: author
    value: Dash — builder y diseñador en UI8
---

## Todo el pitch es una frase

El lanzamiento de Dash es un enlace y una línea: «No 3D engine, no polygons, 32 KB of code». Sin hilo, sin build log, sin benchmark. El enlace abre un caza pixel art que roza una cadena de islas, y en un día y medio la publicación pasó de 1,9 millones de vistas y 26.000 me gusta. Las 553 respuestas parecen una sala discutiendo si el vídeo es real.

Lo es, y se puede jugar. La página de Forge ejecuta la demo en el navegador, junto a un panel con diez grupos de ajustes. La descripción del autor es breve: «Caza pixel art construido con sprite stacking, sobre islas apiladas. Espacio alterna las vistas cenital, de persecución y de cabina; clic para hacer un tonel, mantén para encender los propulsores; vuela desde la cresta de las olas hasta gran altitud».

## Qué pilotas en realidad

El puntero dirige. El clic hace girar el avión, mantener pulsado enciende los propulsores y Espacio salta entre cenital, persecución y cabina. El clic derecho dispara el cañón, la M lanza misiles y los cazas enemigos se quedan en el encuadre para que los fijes. Si te lanzas contra el suelo, el avión se estrella y la cámara sigue al piloto eyectado en lugar de fundirse a un menú.

Ese detalle hace que la demo se lea como un pequeño juego y no como una prueba de shader. El panel expone el resto: choques sí o no, tiempos de recarga del cañón y los misiles, hasta cinco cazas enemigos, cámara lenta al esquivar, compañeros de ala, semilla del mundo, hora del día, densidad de nubes, cobertura de islas, sombra del avión, estela y espuma al volar bajo, estelas en las puntas, estilo de llama del motor, sacudida de las explosiones, grano de película y colores de fuselaje, detalle y cúpula. La intro «stack-up» monta el avión rebanada a rebanada antes del primer despegue. Treinta archivos de sonido cubren motor, viento, cañón, misiles, eyección, salpicaduras y radio.

## Profundidad sin polígonos

El sprite stacking es viejo y tercamente eficaz. En vez de una malla, el avión es una pila de rebanadas planas de pixel art, cada una un fotograma de una hoja de cuatro vistas. Giras la pila y el objeto gira; mueves la cámara y las rebanadas se deslizan lo justo para vender el volumen. No hay polígono que transformar ni motor 3D que cargar. La escena principal se dibuja en un canvas 2D.

Las islas y las nubes también son pilas, y ahí empieza la discusión. Pavian, el investigador coreano cuya publicación llevó la demo a mucha más gente, habló de «esa sensación de Super Famicom de principios de los 90, construida punto por punto», y dijo que la IA había elevado el oficio a un nivel que «el trabajo manual era demasiado pesado para que alguien lo intentara». Otros miraron las nubes y desmontaron la frase por el otro lado: una pila de rebanadas son vóxeles, diga lo que diga el tuit.

## Lo que dijo la gente

Las respuestas son más útiles que el número de me gusta.

- **@bdvd_25** (219 me gusta): «Necesita controles móviles, ¡no puedo cambiar la vista!». La respuesta más votada es un informe de error, y tiene razón. El panel incluye botones táctiles, pero cambiar de vista sigue asumiendo un teclado.
- **@PKekbar** (77 me gusta) no esperó una actualización. Pasó la demo por Grok, añadió armas, un árbol de habilidades, recogidas de armas con puertas de luz y un bucle roguelite entre niveles, y publicó un enlace jugable. El caza se convirtió en un género en una tarde.
- **@ayzekdiolar** (turco, 70 me gusta): «¿Publicaste el código abierto? Ha quedado muy bien». La versión educada de la pregunta que hacía media sección de citas.
- **@mimicry_ryu** (chino): «¿No es obviamente 3D? Mira las nubes y el terreno: todo son vóxeles». Acierta con los píxeles y falla con el motor, que es la forma más interesante de acertar.
- **@Gorden_Sun** (chino): «Fable 5.2 lo hizo casi de una sola vez; el resultado es demasiado bueno. Colegas, pensad algo y alcanzadlo». De ahí sale la atribución del modelo: un observador externo de demos, no Dash.
- **@meta_pavy** (coreano, 2200 me gusta): «No es 3D, no hay polígonos: un simulador de vuelo de 32 KB apilado solo con franjas... la IA puede elevar esto a un trabajo que nadie haría a mano». Tuvo que poner el enlace jugable debajo porque los lectores asumían que era un render. Esa suposición es la reseña.

## Donde se acaba la frase

- **32 KB es el código, no la descarga.** El registro público de Forge lista 32 recursos que suman 3,18 MB, incluidas dos hojas de sprites grandes y treinta archivos de audio. La escena carga rápido; no es una página de 32 KB.
- **Es público, no es código abierto.** La vista previa sirve los módulos de la app y Remix copia el fragmento a un espacio de Forge, pero no hay repositorio ni licencia. La pregunta de Ayzek sigue sin respuesta en el hilo.
- **El móvil es el punto débil.** Los botones táctiles son un ajuste, pero la respuesta más votada es de un usuario de teléfono que no podía cambiar de vista. La demo se construyó pensando en teclado y se nota.
- **«Sin 3D» habla del motor, no de lo que ves.** Las pilas son vóxeles con otro nombre; la demo gana la discusión técnica y pierde la percepción.

## Diez minutos y Remix

> **Merece diez minutos**
> Ábrela en un portátil, cambia a la vista de cabina y roza el agua hasta que aparezca la estela. El truco tiene décadas; lo que cambió es el acabado. Luego pulsa Remix —el fragmento es público y el plan gratuito de Forge cubre tres proyectos— si quieres ver cuánto sobrevive del relato del «una sola instrucción» al llegar al panel de control.

El avión no es realmente la historia. La historia es que una demo de 32 KB está ahora tan terminada, hasta el primer plano de la eyección y la radio, que 26.000 personas dieron me gusta antes de preguntar qué motor usa.
