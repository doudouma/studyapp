---
title: 100 preguntas sobre Context Engineering
summary: Del context rot y el presupuesto de atención al montaje de la ventana, la compactación y la caché, el diseño de instrucciones, el coste y la evaluación de calidad — 100 preguntas para aplicar la ingeniería de contexto en la práctica.
tags: [Context Engineering, Ingeniería de contexto, Agentes de IA, LLM, Guía temática]
author: 100mini Editorial
publishedAt: 2026-11-02
updatedAt: 2026-11-02
questionCount: 100
chapterCount: 6
facts:
  - key: Autor
    value: 100mini Editorial
  - key: Preguntas
    value: 100
    highlight: true
  - key: Capítulos
    value: 6
  - key: Tema
    value: Context Engineering / ventana de contexto
  - key: Para quién
    value: Ingenieros de IA / desarrolladores de agentes / producto y datos
  - key: Actualizado
    value: 2026-11-02
---

## Prefacio

Esta es una guía de «100 preguntas»: una forma de dividir un tema grande en preguntas y leerlo una por una.

La ingeniería de contexto no trata de escribir una frase de prompt mejor. Trata de decidir, antes de cada inferencia, qué pequeño conjunto de tokens ensamblar a partir de documentos, herramientas, memoria e historial para maximizar la probabilidad de éxito. También es una disciplina de coste: cada token en la ventana diluye la atención y suma a la factura.

La guía sigue seis etapas: por qué una ventana más llena se vuelve más torpe, qué merece entrar, cómo evitar que una sesión larga termine mal, cómo sobreviven las instrucciones, dónde se va el dinero y cómo verificar la calidad.

**Respuestas rápidas**

- La ventana es un banco de trabajo, no un almacén: importa más acertar que acumular.
- Primero corrección y completitud; la información errónea es peor que la ausente.
- Mejor poner un tope que reescribir, y limpiar antes que forzar la compactación; la caché odia los cambios de prefijo.
- Las restricciones críticas van en archivos del proyecto, no solo en la conversación.
- Ninguna técnica tiene valor universal: solo «¿subió mi evaluación?».

> Compilado a partir de material sobre Context Engineering y fuentes públicas, reestructurado y editado para este sitio.

> Esta es una edición editada: algunos pasajes originales estaban truncados por OCR, así que el cuerpo prioriza una lista de preguntas accionable con respuestas concisas.

## 1. Por qué una ventana más grande se vuelve más torpe

### 1. ¿Por qué llenar la ventana hace que el modelo sea más torpe?

Es el context rot: cuantos más tokens hay en la ventana, peor recupera información con precisión. Un estudio controlado con 18 modelos encontró la misma dirección: ninguno mantuvo su puntuación al crecer la entrada.

La causa es el presupuesto de atención. El transformer relaciona cada par de tokens, así que n tokens crean n² relaciones; una ventana más llena reparte peor el presupuesto. La degradación es gradual, no un acantilado, pero la precisión de recuperación y el razonamiento largo se resienten.

### 2. La prueba de la aguja es perfecta, ¿por qué fallan las tareas reales?

Porque «aguja en el pajar» mide coincidencia léxica, no comprensión semántica. En tareas reales la pregunta y la respuesta a menudo no comparten palabras clave, y el modelo debe distinguir material relacionado que no responde.

Prueba tres cosas: encontrar el dato, encontrarlo con la pregunta parafraseada y encontrarlo con distractores. Probar solo lo primero sobreestima al modelo.

### 3. ¿Por qué se olvida más lo que está en el medio?

La atención tiene forma de U: fuerte al inicio (primacía), fuerte al final (recencia), débil en el centro. En experimentos con múltiples documentos, un dato clave en medio de 20–30 documentos puntuó por debajo del baseline sin documentos.

Por eso los documentos largos van al principio y la pregunta al final; más allá de unos 20 documentos, añadir más aporta muy poco.

### 4. ¿Por qué importa más la colocación que estar dentro de la ventana?

La información presente pero enterrada no es mucho mejor que la ausente. Con la misma aguja y longitud, cambiar similitud semántica, distractores y estructura del pajar mueve bastante la puntuación.

Haz tres cosas: segmenta con títulos o etiquetas XML; separa instrucciones, contexto y documentación de herramientas; usa ejemplos representativos, no listas de casos límite.

### 5. ¿Por qué un chat largo se vuelve caótico y casi nunca se recupera?

El modelo saca conclusiones pronto y luego gira alrededor de una conclusión posiblemente errónea. En pruebas multi-turno, dividir una tarea bajó el rendimiento un 39% de media, incluso en modelos fuertes.

Si ves dos de tres señales —se contradice, repite una acción fallida, ignora instrucciones nuevas—, deja de parchear. Escribe las conclusiones confirmadas en un archivo y reinicia en una ventana limpia.

### 6. ¿Por qué un contexto desordenado puede superar a uno coherente?

Es contraintuitivo pero reproducible: barajar el pajar mejoró la recuperación en 18 modelos y muchas longitudes. La prosa coherente tiene su propio flujo y la aguja insertada parece fuera de lugar; el texto barajado no tiene flujo que romper.

No envíes prompts barajados, pero aprovecha las tres palancas positivas: reducir volumen, aumentar similitud aguja-pregunta y eliminar distractores.

### 7. ¿Cómo distingo los cuatro fallos: envenenamiento, distracción, confusión y choque?

Envenenamiento es una alucinación que entra en la ventana y se cita repetidamente. Distracción es una ventana larga que hace al modelo repetir historial en vez de actuar. Confusión es material extra que desvía la respuesta. Choque es información vieja y nueva que se contradicen.

Triaja desde lo más comprobable: busca envenenamiento, luego choques, después quita material para ver si se aclara la confusión y solo entonces culpa a la longitud.

### 8. ¿Por qué la atención es un presupuesto que mengua con cada token?

Cada token añadido diluye las relaciones de atención entre todos los tokens. Duplicar la entrada cuadruplica las relaciones por pares: esa es la forma matemática del rendimiento decreciente.

Gestiónalo con dos reglas: añade algo borrando otra cosa; y pon un límite fijo a los elementos residentes, como el system prompt y las definiciones de herramientas.

### 9. ¿Cómo sé si el agente se volvió torpe por el modelo o por el contexto?

En la práctica, la mayoría de fallos son de contexto. Haz tres comprobaciones: reordena manualmente el contexto y mira si vuelve el rendimiento; verifica que las instrucciones se cargaron; compara con los síntomas típicos de fallo de contexto.

Solo si las tres están limpias sospecha del modelo. Cambiarlo antes solo te da otro modelo que el mismo contexto puede arrastrar.

### 10. ¿Cómo puede el modelo informar cuánta ventana queda?

Las APIs recientes de Claude inyectan un presupuesto y un recordatorio de espacio restante: context awareness. Así el modelo planifica con el espacio real en vez de adivinar cuándo parar.

Para datos cuantitativos lee los campos de usage, no analices esas etiquetas. Si tu harness compacta automáticamente, díselo para que no termine antes.

### 11. ¿Cómo mido a mano la ventana usable de mi modelo?

Usa al menos cinco niveles de longitud, desde unos miles de tokens hasta cerca del límite anunciado, cambiando solo la longitud y manteniendo la dificultad. Haz agujas semánticas, no literales, y prueba una y varias agujas.

Mide el punto de entrada que usas de verdad: la capa de API o suscripción puede diferir de la página de marketing.

### 12. ¿Por qué el mismo modelo se comporta distinto en otro host?

El modelo es fijo, pero el host decide qué se ensambla antes de cada inferencia, cómo se recorta el historial y qué herramientas se conectan. El mismo modelo puede rendir muy distinto en Cursor y en Claude Code.

Antes de culpar al modelo, revisa el ensamblaje del host: tamaño del system prompt, número de herramientas, recorte del historial y si se cargan las reglas del proyecto.

### 13. ¿Qué diferencia hay entre una ventana de 1M anunciada y una usable?

Cuatro capas: ventana nominal, capacidad, recuperabilidad y rango de razonamiento. Comprar la ventana solo te da la primera; el éxito suele depender de las dos últimas.

Cada capa es menor que la anterior. La capacidad se consulta en la documentación y con conteo de tokens; la recuperabilidad y el razonamiento se miden con tus documentos.

### 14. ¿La ingeniería de prompts está muerta o es marketing de ansiedad?

No está muerta: fue absorbida. Sigue siendo un subconjunto de la ingeniería de contexto. Escribir bien una instrucción de un turno siempre sirve, pero no basta para sesiones largas con muchas herramientas.

La narrativa de «muerta» es sobre todo marketing de conflicto. No elijas bando: corrige la capa a la que apunten tus fallos.

### 15. ¿Por qué la ingeniería de contexto es ingeniería y no un rebranding?

Porque tiene modos de fallo del mundo real que combatir. Los fallos de los LLM se parecen más a la ingeniería física que al software: tolerancias, incertidumbre y materiales cuya resistencia no se conoce del todo.

Puedes llamarlo ingeniería cuando sabes decir tu tasa de fallo actual, los números antes y después de un cambio y por qué funciona. Hasta entonces, sigues lanzando hechizos.

### 16. ¿Cómo hizo un tuit que la ingeniería de contexto se volviera viral?

El camino fue corto: Tobi Lütke dijo que prefería el término, Karpathy lo amplificó y enumeró descripción de tarea, ejemplos, RAG, herramientas, estado, historial y compactación; luego Hacker News y Simon Willison le dieron una definición pública pegadiza.

El término es un contenedor; la carga real es esa lista de siete puntos, que se corresponde con los seis capítulos de esta guía.

## 2. Qué merece entrar en la ventana

### 17. ¿Por qué «el conjunto más pequeño de tokens de alta señal» es el único principio universal?

Las demás técnicas tienen límites: la recuperación encaja cuando el conocimiento está fuera, la memoria cuando cruza sesiones, la compactación cuando la sesión es demasiado larga. Solo «poco y de alta señal» vale en todas partes.

Importan los dos calificativos: alta señal significa que cada token contribuye al razonamiento; mínimo significa que contribuir no basta, debe merecer el espacio. Una ventana de 200K llena de 190K tokens irrelevantes pierde frente a 20K relevantes.

### 18. ¿Por qué recuperar antes de responder supera a meterlo todo?

Meterlo todo fomenta la pereza: cuando el montón está dentro, el modelo deja de buscar. La recuperación just-in-time deja solo identificadores ligeros —rutas, consultas, enlaces— y lee el contenido cuando hace falta.

El patrón práctico es híbrido: precarga conocimiento estático estable y deja que el agente busque los detalles dinámicos.

### 19. ¿Por qué el RAG no está muerto, solo el RAG perezoso?

Lo que murió es la implementación superficial: trocear al azar, top-5 vectorial, meter en el prompt y rezar. El núcleo de la recuperación —dar la información correcta en el momento correcto— sigue siendo necesario.

El contexto largo no lo terminó. El conocimiento empresarial está disperso, caducado, con permisos, versiones y contradicciones; una ventana mayor solo da más sitio, no responde qué debe ir dentro. Arregla el troceado, conserva BM25, añade reranking y crea un conjunto de evaluación.

### 20. ¿Qué nivel de detalle debe tener un system prompt?

La escala es «right altitude»: demasiado bajo y la lógica rígida se rompe con casos límite; demasiado alto y el modelo no recibe señales concretas y adivina. El punto justo guía el comportamiento sin cerrar la puerta a heurísticas.

Una estructura útil es Identity, Instructions, Examples, Context. Empieza con el prompt mínimo y añade una regla por cada fallo observado.

### 21. ¿Cómo dar ejemplos few-shot sin desperdiciar la ventana?

Empieza con 3–5, relevantes, diversos y representativos de casos estándar, envueltos en `<example>` y separados de las instrucciones. Los ejemplos son anclas de comportamiento, no documentación.

Son contenido estable: ponlos en el prefijo cacheado y el coste marginal baja mucho. Si los dispersas y los cambias cada turno, pagas precio completo siempre.

### 22. ¿En qué orden deben entrar varios documentos en la ventana?

Documentos largos arriba, pregunta al final. En tareas complejas con varios documentos, mover la consulta al final puede mejorar la calidad hasta un 30% —un techo, no una garantía—.

Envuelve cada documento en `<document>` con metadatos de origen; en tareas largas, haz que el modelo cite primero los pasajes relevantes y responda a partir de ellos.

### 23. ¿Qué debe quedarse en la ventana y qué debe ir a archivos?

Lo que necesita el razonamiento de este turno se queda; lo de «quizá sirva luego» va a disco. Los archivos son la persistencia, la ventana es el banco de trabajo.

Escribe notas de investigación, planes y progreso en archivos; antes de cerrar una sesión, guarda las decisiones clave en archivos del proyecto para que la siguiente continúe desde ahí.

### 24. ¿Cómo elijo entre tantos sistemas de memoria?

No hay ranking, solo encaje por escenario. Los grafos temporales sirven para hechos que cambian y necesitan trazabilidad; el enfoque tipo SO para agentes con estado de larga duración; los perfiles SQL son baratos y auditables; el almacenamiento literal con filtros de metadatos suele empatar o superar a la extracción.

El giro claro de 2026 es la anti-extracción: no toda escritura de memoria merece una llamada al modelo.

### 25. ¿Cuándo es tirar el dinero instalar un sistema de memoria?

Tres señales: la tarea nunca cruza sesiones; lo que hay que recordar cabe en una página; y las reglas de proyecto y la memoria automática integradas ni siquiera se usan.

A menudo basta algo ligero, como un NOTES.md que mantiene el agente o una línea en las reglas del proyecto para releer el plan tras compactar.

### 26. ¿Por qué CLAUDE.md y la memoria automática son canales separados?

La frontera es la autoría: CLAUDE.md lo escribes tú para el modelo; la memoria automática la escribe el modelo para sí mismo. La primera contiene instrucciones y reglas revisadas; la segunda, lecciones y preferencias aprendidas de correcciones.

Separarlas mantiene ambas auditables: tus reglas no se reescriben en silencio y las conjeturas del modelo no se hacen pasar por tus decisiones.

### 27. ¿Cómo escribir definiciones de herramientas sin reventar la ventana?

Las definiciones ocupan la ventana en cada turno y no desaparecen al compactar el historial. Primero fusiona herramientas solapadas y mantén las salidas intermedias fuera de la ventana.

Luego añade formatos de respuesta, paginación, alcance, filtros y truncado. Nunca dejes que una sola respuesta de herramienta vuelque salida sin límite.

### 28. Las herramientas MCP desbordan la ventana: ¿cómo las saco de la conversación principal?

Tres caminos: dar a un subagente su propia lista de herramientas permitidas para que el trabajo sucio quede en su ventana; convertir definiciones en archivos que se cargan bajo demanda; y consolidar antes de mover.

La clave no es «usar menos servidores MCP», sino no mantener docenas de definiciones residentes en la conversación principal. A muchos equipos les falta consolidación, no herramientas.

### 29. La búsqueda devuelve cosas que no responden: ¿cómo arreglo «sobre el tema pero sin respuesta»?

Son distractores: relacionados con el tema pero sin responder. No son ruido neutro; interfieren activamente, y el daño crece con la longitud de la entrada.

Corrige en tres pasos: comprueba si el troceado separó la respuesta; añade recuperación híbrida y conserva BM25; añade reranking para pasar de top-30 a los top-5 que de verdad responden.

### 30. ¿Cómo fijo un presupuesto de ventana para que cada cosa entre por cupo?

Cuatro niveles: fijo (restricciones del sistema y objetivo actual), recortable (contexto recuperado y resultados viejos de herramientas), plegable (historial temprano) y por fases (herramientas, esquemas y ejemplos solo de esta fase).

En cada turno ejecuta un ensamblaje: cargar restricciones, extraer objetivo, recuperar evidencia, recordar memoria, elegir herramientas, comprimir historial, ordenar por relevancia y truncar al presupuesto.

### 31. Con el contexto correcto, ¿un modelo normal puede ganar?

El contexto correcto es lo que permite competir a un modelo normal, pero no garantiza la victoria. El contexto resuelve «saber»; no resuelve «verificar».

Con pedido, garantía, ticket y herramientas completos, un modelo medio puede producir un plan de reemplazo. Pero siguen apareciendo respuestas pulidas con errores de fondo, así que la capa de evaluación y verificación es obligatoria.

### 32. ¿Por qué quien dice «RAG is dead» se delata?

Porque suele asumir que el conocimiento empresarial es un documento limpio que cabe entero en la ventana. Quien ha estado en producción sabe que está disperso, caducado, con permisos, versiones y contradicciones; la solución es seleccionar, no ampliar.

Un RAG malo es peor que ninguno porque crea una ilusión de fundamento. Lo que debe morir es la implementación superficial, no la recuperación.

### 33. ¿Una biblioteca entera o 2.000 tokens precisos?

La parte de la ventana que participa en la inferencia actual es el working set. Tenga el modelo 200K o 1M, el working set se llena de resultados viejos al mismo ritmo; una ventana mayor solo aleja la pared.

La biblioteca va fuera de la ventana; dentro solo la porción de la tarea actual. La prueba sigue siendo: quita este token, ¿sufre el razonamiento de este turno?

### 34. ¿Por qué un contexto equivocado da más miedo que ninguno?

Porque la información errónea supera a la ausente, y la ausente al ruido. El modelo puede escribir prosa fluida y segura a partir de mal contexto; fluidez y fundamento factual son mecanismos distintos.

El peor fallo es la pseudocompletación: una respuesta fluida, pertinente y educada que ignora en silencio una restricción que fijaste diez turnos antes. El último paso del ensamblaje siempre debe preguntar cuánto costaría colocar algo mal.

## 3. Cómo evitar que las sesiones largas terminen mal

### 35. ¿Cuándo se dispara la compactación y quién decide?

Claude Code compacta por defecto al llegar al límite del modelo: en la ventana de 1M de Sonnet 5, alrededor de 967K tokens. Puedes adelantarlo, entre 100K y 1M, con `/autocompact` o una variable de entorno.

La vía API es otra: la compactación del servidor usa un parámetro beta, por defecto unos 150K tokens, configurable hasta 50K. No mezcles ambas cifras.

### 36. ¿Por qué la compactación es inherentemente pérdida y descarta lo más importante?

Los resumidores conservan la idea principal y descartan el resto. En un experimento sobrevivieron 3/3 hechos principales y 0/3 números oscuros del apéndice. Una regla como «llama siempre a la API en vivo, nunca leas la caché» suena a charla para un resumidor.

La disciplina es simple: lo que no puedes perder no debe esperar en la conversación a que lo resuman. Ponlo en un archivo del proyecto o nómbralo explícitamente en la instrucción de compactación.

### 37. ¿Por qué más compactaciones enferman más la sesión?

Cada pasada envía toda la conversación por un tubo con pérdidas; los detalles del resumen anterior se pierden otra vez. La pérdida se multiplica en vez de sumarse, y una ventana peor produce un resumen siguiente peor.

En pruebas, un preset de compactación sacó 38% en sondas de memoria frente a 92% sin hacer nada. La compactación es primeros auxilios, no cura: si tras dos rondas la sesión sigue confusa, reinicia.

### 38. ¿Cuándo es verdad que «no hacer nada» supera a compactar?

Cuando el precio de caché es bajo y la sesión aún es manejable, conservar el historial completo puede ser más barato que cualquier reescritura, porque reescribir el prefijo invalida el descuento.

No es universal: sube el precio de caché o alarga la sesión y la conclusión se invierte. Mira tu precio y tu número de turnos antes de decidir.

### 39. ¿Cómo evito que una sesión larga llegue a una compactación catastrófica?

No esperes al 95% de uso. Cuanto más llena la ventana, más apretada la llamada de resumen, más corto y roto el resultado, y puede aparecer «ansiedad de contexto» cerca del límite.

Las líneas prácticas se agrupan entre 40% y 75%: compacta antes, con foco, o usa `/autocompact 500k` para bajar la línea automática.

### 40. /compact, /clear o ventana nueva: ¿cuál usar?

`/compact` para continuidad, `/clear` para empezar de cero y «archivo de traspaso + ventana nueva» para cambiar de tarea. Una sesión contaminada por supuestos erróneos se limpia más barato que se rescata.

Línea roja: `/clear` borra el historial para siempre. Antes de pulsarlo, asegúrate de que todo lo valioso salió de la ventana.

### 41. ¿Cómo escribo una instrucción de compactación dirigida que conserve lo que quiero?

Tras `/compact`, di en lenguaje llano qué conservar y qué tirar, nombrando sustantivos concretos. «Conserva los pasos y la conclusión del arreglo del error 401» supera a «conserva el proceso de arreglo».

No hagas la instrucción demasiado delgada: convenciones de formato, restricciones clave y próximos pasos deben nombrarse. La compactación automática adivina la importancia general; tú no puedes permitirte adivinar.

### 42. Tras compactar queda el nombre del plan pero no el contenido: ¿cómo lo evito?

Herida común: el nombre del archivo del plan sigue en contexto, el contenido no, y al modelo no se le ocurre leerlo. Metadatos presentes, cuerpo perdido: la forma clásica de una lesión de compactación.

Tres defensas: pon restricciones críticas en el CLAUDE.md raíz del proyecto; haz que la primera instrucción tras compactar relea el plan; o usa un hook SessionStart que inyecte el contenido automáticamente.

### 43. ¿Cómo escribir un documento de traspaso para continuar sin fricción?

Cinco secciones, ninguna vacía: intención de la sesión, archivos modificados, decisiones clave, objetivos activos y siguiente paso. Una plantilla estructurada actúa como checklist obligatoria y deja menos espacio a la pérdida silenciosa que la narrativa libre.

La única prueba de aceptación: alguien que no estuvo en la sesión —incluida la siguiente instancia del modelo— puede empezar a trabajar sin pedir contexto.

### 44. ¿Pueden convivir compactación, limpieza y memoria?

Sí; se reparten el trabajo como un sistema operativo. La limpieza gestiona resultados viejos de herramientas dentro de la ventana, la compactación toda la ventana y la memoria el estado entre sesiones. Cada una trata un crecimiento distinto.

Añade la herramienta de memoria a la lista de exclusión de la limpieza, o se borrarán memorias recién escritas. Separa sus umbrales para que no disparen a la vez.

### 45. La salida de herramientas inunda la ventana: ¿cómo la limito sin romper la caché?

Distingue limitar de resumir. Un tope acorta el prefijo sin cambiar bytes, así que la caché sigue acertando; un resumen reescribe el prefijo, invalida la caché y te hace pagar precio completo por los tokens ahorrados.

Así que encoge el contexto, no lo reescribas. Al limpiar resultados viejos, limpia suficiente de una vez para que la reconstrucción de caché valga la pena.

### 46. La sesión va lenta y cara: ¿cómo compruebo si el contexto está podrido?

Primero mira la factura. `/context` muestra qué hay en la ventana, `/usage` dónde van dinero y límites, `/cost` el total de la sesión.

Si los números son normales pero el comportamiento se repite, se contradice o ignora instrucciones, el contexto está podrido. Usa la pregunta 48 para elegir rescate o reinicio.

### 47. La compactación se queda atascada en un error: ¿cuál es el primer auxilio?

No luches contra ello. Pulsa Ctrl+C, reinicia el proceso, haz `/resume` de la sesión y luego `/compact`. La secuencia funciona porque descarta el estado dañado que crece en el cliente.

Si una versión nueva sigue fallando, abre un issue con el número de versión. La causa suele ser que la propia petición de compactación ya no cabe en la sesión.

### 48. ¿Cómo decido si rescatar la sesión o reiniciarla?

Tres preguntas: ¿el error es transitorio? Salir y volver a entrar lo arregla: rescate. ¿Obtuviste un resumen pero `/context` no bajó? Es falso éxito: no hay rescate. ¿Has escrito las decisiones pendientes en un archivo? Entonces reiniciar no cuesta nada.

Una sesión contaminada por supuestos erróneos se reinicia más barato que se rescata. Las sesiones son consumibles; no te encariñes.

### 49. ¿Cómo implementar memoria externa: archivos SQLite o base vectorial?

La mayoría no necesita base vectorial. Empieza con la herramienta de memoria integrada: el modelo llama a view, create, replace, insert, delete y rename sobre un backend de archivos que tú controlas, legible, diffeable y versionable.

Si de verdad tienes historial masivo entre sesiones, añade SQLite y recuperación vectorial. Trata la ventana como memoria y los archivos como disco, paginando solo lo necesario.

### 50. Con agentes concurrentes, ¿cómo aíslo el contexto para que no se contaminen?

Mete el trabajo en ventanas de subagentes: contexto independiente, system prompt independiente, lista de herramientas independiente. Las lecturas grandes se quedan en el subagente y solo vuelven conclusiones.

Aislar ventanas no basta; aísla también las descripciones de tarea. Cada subagente necesita objetivo, formato de salida, herramientas disponibles y límites, o duplicará trabajo o irá en la dirección equivocada.

### 51. Un bug de compactación tardó ocho meses en arreglarse: ¿qué pasó?

El error era un bucle: el aviso decía «contexto bajo, ejecuta /compact», pero la compactación respondía «conversación demasiado larga». Los usuarios se auto-rescataban saliendo, entrando, reanudando y compactando. El arreglo se anunció más de una vez, regresó, y solo v2.1.85 gestionó de verdad peticiones de compactación demasiado grandes.

Lección: la primera escena del crimen es el issue tracker, el auto-rescate precede al arreglo y «arreglado» debe anclarse a una versión, no a una línea del changelog.

### 52. ¿Por qué un falso éxito de compactación es peor que un crash?

Un fallo duro muestra un error y sabes volver atrás. El falso éxito devuelve un «resumen mínimo de traspaso» sin error mientras la ventana no encoge y la sesión sigue atascada en el límite.

La única defensa es inspeccionar la mercancía: tras compactar, mira `/context`. Si el número no bajó, trátalo como falso éxito y reinicia desde un traspaso escrito.

### 53. ¿Cómo hizo un error de compactación que unas cuentas reales fallaran 12 veces?

La regla estaba escrita: las posiciones deben venir de la API en vivo, nunca de la caché. Tras compactar, el modelo la olvidó, tomó un atajo por un archivo de caché de hace tres días y reportó posiciones de BTC con un error de 12x.

Lo importante no es el 12x, sino que «el archivo existe» no significa «la regla está en la ventana». Pon restricciones de dinero y datos en el archivo raíz y haz que el modelo las repita tras compactar.

### 54. ¿Qué herramientas externas crecieron alrededor de sesiones que la compactación no salva?

Tres patrones: limpiar antes de compactar, cortando lecturas duplicadas y salidas enormes; interceptar al 65% de uso y forzar un traspaso estructurado a otra ventana; y mover el contexto a una capa proxy con SQLite y vectores.

Ninguna está certificada, pero tres ideas son gratis: línea de aviso de uso, archivo de traspaso estructurado y cambiar de ventana en vez de apostar a la compactación.

## 4. Cómo escribir instrucciones que no sean ignoradas

### 55. ¿Cuántas líneas debe tener CLAUDE.md y qué pasa si se pasa?

Mantén un solo archivo por debajo de 200 líneas. Pasarse no da error, pero consume más contexto y baja el cumplimiento; por encima de 4 MiB, Claude Code lo ignora por completo.

Dividir con `@import` no ayuda: los archivos importados entran igualmente enteros en la ventana. Mueve reglas de alcance a `.claude/rules/` con cabecera `paths`, o borra lo que el modelo puede inferir del código.

### 56. ¿Por qué se ignoran a menudo las reglas escritas en CLAUDE.md?

Dos causas: CLAUDE.md se inyecta como mensaje de usuario después del system prompt, no dentro, así que el cumplimiento estricto no está garantizado; y reglas viejas y nuevas en conflicto dejan que el modelo elija una al azar.

Ejecuta `/context` para confirmar que el archivo aparece en Memory files y convierte reglas vagas en acciones verificables. Las reglas que deben dispararse en momentos fijos van en hooks o permisos, no en prosa.

### 57. CLAUDE.md, rules, AGENTS.md: ¿cuál manda?

No hay una jerarquía dura automática. Todos son contexto: el CLAUDE.md raíz tiene la influencia más amplia, las rules con `paths` solo se cargan para archivos coincidentes y AGENTS.md es una convención entre herramientas cuya lectura depende del host.

En conflicto suele ganar el alcance más específico y la instrucción más explícita, pero el conflicto en sí baja el cumplimiento. Mantén una única fuente de verdad y pon las restricciones duras en hooks o permisos.

### 58. ¿Dónde poner las instrucciones clave en un contexto largo para que no se diluyan?

Documentos largos arriba, pregunta al final. La atención es máxima al principio y al final y débil en el centro; cuanta más materia, más se diluye una instrucción central.

Divide la entrada multi-documento con etiquetas y fuentes, y haz que el modelo cite antes de responder. Raciona también el material: más allá de unos veinte documentos, añadir aporta poco.

### 59. ¿Qué palabras de un system prompt son desperdicio y cuáles son oro?

Dos extremos desperdician espacio: decenas de líneas de if-else que se rompen con casos no vistos, y un vago «eres un asistente útil» que no da nada con lo que decidir.

Oro son los registros de errores, la justificación de diseño y cualquier convención distinta del comportamiento por defecto. Las estructuras de directorios y listas de dependencias que el modelo infiere del código son ruido.

### 60. ¿Por qué restar en los prompts antiguos tras actualizar el modelo?

Los modelos nuevos siguen mejor las instrucciones, así que los viejos trucos pasan de seguro a ruido: prefill, mayúsculas amenazantes, pasos demasiado detallados y autocomprobaciones repetidas consumen atención y pueden hacer que el modelo actúe cuando debería preguntar.

Borra en vez de reescribir: elimina amenazas y autocomprobaciones ineficaces, conserva restricciones de dominio, criterios de aceptación y ejemplos realmente útiles.

### 61. El prefill está prohibido: ¿qué uso ahora para controlar el formato?

Usa Structured Outputs para restringir el esquema, o define una herramienta con campos enum para que «salida» sea una llamada a herramienta. Para quitar preámbulos, dilo directamente en el system prompt.

Para continuar una respuesta truncada, pon el texto en el mensaje de usuario e indica dónde se cortó. Para evitar rechazos, formula bien la petición en vez de depender de un inicio prefabricado.

### 62. ¿Dónde poner el punto de caché para ahorrar en cada turno?

En el último bloque que permanece idéntico entre peticiones. Si cambia cualquier bloque anterior, cambia el hash del prefijo y el siguiente turno lo recalcula todo.

El antipatrón clásico es una marca de tiempo: pon una hora con segundos al inicio del system prompt y cambiará cada segundo, así que siempre pagas precio completo.

### 63. ¿Por qué cambiar una definición de herramienta invalida toda la caché?

Las cachés se juzgan por prefijos por capas: tools → system → messages. Un cambio invalida esa capa y todas las siguientes. Las herramientas van primero, así que una palabra cambiada revienta las tres.

Trata las definiciones como artefactos de compilación: congélalas durante la sesión. Si debes cambiarlas, acepta «cambiar una vez, reventar una vez, recargar una vez», preferiblemente entre sesiones.

### 64. ¿Cómo ordenar prompts multi-turno para aprovechar la caché al máximo?

Pon el contenido estático primero en orden tools → system → messages. Los valores por petición —marcas de tiempo, IDs aleatorios, la fecha— van al final del flujo de mensajes.

Mantén el historial solo-añadir: no edites mensajes viejos y añade instrucciones a mitad de conversación como mensaje system, no cambiando el campo system superior. Revisa los campos de caché en usage cada turno.

### 65. ¿Cómo elijo ejemplos que devuelvan su coste en tokens?

Tres criterios: relevantes para casos reales, diversos para cubrir límites sin enseñar patrones falsos y estructurados con `<example>`, separados de las instrucciones.

Si dudas, pide al modelo que puntúe candidatos por relevancia y diversidad y luego decide a mano. Los ejemplos son contenido estable: ponlos en el prefijo cacheado.

### 66. ¿Cómo monto un flujo multi-ventana y por qué es mejor que forzar una sola?

Divide el trabajo: la primera ventana construye andamiaje, tests y scripts de inicio; las siguientes siguen la lista. Cuando el contexto se limpie, prefiere una ventana nueva a forzar la compactación.

La versión madura tiene tres fases: research produce un documento, plan produce un plan de implementación e implement sigue el plan. Los humanos revisan solo los dos documentos en las puertas.

### 67. ¿Por qué «enseñar el prompt a un colega» es la mejor prueba?

Porque al escribir y leer tu propio prompt, tu cerebro rellena el contexto que falta. Un colega no tiene esa caché; donde se atasque es donde falta algo.

Antes de pasarlo, comprueba tres cosas: si el formato y las restricciones son concretos; si los pasos dependientes están numerados; y si al pedir una acción extra explicas el motivo.

### 68. ¿Por qué decirle a un modelo lo que no debe hacer suele fallar?

Una prohibición dice dónde no ir pero no dónde ir, así que el modelo adivina alrededor de la zona prohibida. Para un formato estable, declara el objetivo positivo: en vez de «no uses markdown», di «responde en párrafos de prosa fluida».

Otro truco es igualar el estilo: un prompt lleno de listas markdown tiende a producir markdown. Escribe el prompt en el estilo que quieres recibir.

### 69. ¿Por qué un contexto cuidadosamente ajustado puede perder contra no ajustar nada?

Porque varias capas de middleware «obviamente razonables» pueden anularse. En una prueba, un preset de tres capas de limpieza y resumen sacó 58% en memoria, luego 38% al repetir, con el doble de coste que no hacer nada.

No te fíes del tacto; ejecuta evaluaciones. Usa las mismas tareas y datos, compara tu preset con el historial completo, puntúa solo las sondas plantadas y luego mira la curva de coste.

### 70. ¿Por qué una instrucción de una frase suele superar a un reglamento largo?

Cuanto más grueso el reglamento, menos atención recibe cada regla. Si una frase basta, no escribas un párrafo; específico y conciso no son opuestos: la verborrea es el enemigo.

El esqueleto: rol, acción concreta, entregable, criterio verificable y una línea de motivo. Los flujos complejos pueden ser largos, pero cada línea debe trabajar.

### 71. ¿Es correcta la frase «el contexto es la memoria del modelo»?

No del todo. La metáfora original completa es working memory, memoria de trabajo. El contexto es inmediato, limitado y se pierde al apagar; la memoria es almacenamiento externo que se compila al contexto en cada petición.

Los dos canales de Claude Code y los memory blocks de Letta muestran que memoria y contexto son capas distintas y no deben confundirse.

### 72. ¿Por qué Tobi puso «saber cargar contexto» en la evaluación de desempeño?

Porque cargar contexto es el paso que más se salta en el trabajo: se prueba dos veces, no funciona y se vuelve al método viejo, sin preguntar si falló el prompt, faltó contexto o nunca hubo segundo intento.

Meter el uso de IA y la habilidad de contexto en desempeño y revisión por pares lo convierte en requisito organizativo, no en artesanía personal. Pero es narrativa de gestión, no datos medidos: cítalo como tal.

## 5. Dónde se quema el dinero del contexto

### 73. ¿Por qué la caché cambia el precio pero no la ocupación de la ventana?

La caché es como una línea de caché de CPU: acelera la recuperación pero no ahorra ni un byte de memoria. El prefijo cacheado sigue ocupando la ventana, la atención se sigue repartiendo y la compactación sigue disparándose cerca del límite.

Lleva dos libros: ocupación en `/context`, gasto en `/usage`. El descuento está en la factura, no en la ventana.

### 74. ¿Por qué cada turno de un chat multi-turno vuelve a pagar todo el historial?

Los modelos no tienen memoria, así que cada petición reenvía la sesión completa. Envías dos palabras —«continúa»— y el turno se factura sobre todo el historial.

En la llamada de herramienta número 50, solo el historial puede superar 150K tokens; 50 turnos equivalen a pagar 1.275 entradas de un turno. La caché baja el precio unitario pero no cambia esa forma compuesta.

### 75. ¿Cómo estimo el gasto mensual de contexto?

Tres anclas: el despliegue empresarial ronda 13 dólares por día activo y 150–250 al mes; con Sonnet a 3 dólares por millón de tokens, un contexto de 150K cuesta unos 0,45 por turno y 30K unos 0,09; llenar una ventana de 1M una vez va de 0,14 a 10 dólares.

Factura mensual ≈ turnos activos al día × tokens de entrada por turno × precio de entrada × descuento de caché. Con buena tasa de acierto, la lectura cuesta una décima parte; si es inestable, deja un margen del 30–50%.

### 76. ¿Cómo calculo y controlo la factura de contexto multi-agente?

Chat es 1x, un agente unos 4x, multi-agente unos 15x; los equipos de agentes en modo plan van por 7x. Cada teammate lleva su propia ventana y quema sus propios tokens.

Palancas: escalona el esfuerzo por complejidad; limita los tokens de pensamiento; mantén equipos pequeños y apaga a cada teammate en cuanto termine.

### 77. ¿Dónde consulto la tasa de acierto de KV-cache y cómo la mejoro?

La línea de estadísticas de Claude Code informa peticiones, proporción de entrada cacheada, fallos y calidez. En la API, lee `cache_read_input_tokens`, `cache_creation_input_tokens` e `input_tokens` en usage.

La tasa es lecturas de caché divididas por la suma de los tres. Mejórala estabilizando el prefijo —congelar herramientas, mover marcas de tiempo al final, historial solo-añadir—, no recortando tokens.

### 78. ¿Cuándo conviene dar a la caché un TTL de una hora?

Si cinco minutos bastan, no actualices. Un TTL de una hora empieza a rentar cuando el hueco supera cinco minutos pero la siguiente petición llega con seguridad dentro de una hora.

Precios: escribir caché de cinco minutos cuesta 1,25x la entrada, la de una hora 2x, y leer 0,1x. Al mezclar, coloca el segmento de una hora antes del de cinco minutos.

### 79. ¿Cómo precaliento la caché al arrancar para mejorar la primera respuesta?

Envía una petición con `max_tokens: 0`, para que la API lea el prompt y escriba la caché en el punto de corte, y vuelva de inmediato sin generar salida.

Pon el corte en el último bloque compartido con las peticiones reales; iguala thinking y effort; usa un corte explícito, no caché automática. El precalentamiento puede generar un cargo de escritura.

### 80. ¿Cuándo es asequible una ventana de un millón y cuándo es una trampa?

Alimentar documentos grandes de una vez merece la pena: llenas, preguntas, te vas y pagas solo ese llenado. Pero la latencia del primer token se nota: unos 22 segundos a 100K y 76 segundos por encima de 800K.

No hagas de 1M el valor por defecto para sesiones frecuentes: cargar el historial completo cada turno compone latencia y coste, y al pasar de la mitad de ocupación solo te queda recuperar o compactar.

### 81. ¿Cómo convierte la ejecución de código un trabajo de 150K tokens en 2K?

Las definiciones de herramientas se vuelven archivos; el agente lista el directorio y lee solo lo necesario. Los datos fluyen de script a script dentro de un sandbox, así que los resultados intermedios no entran al modelo.

Dos ahorros: los manuales de herramientas ya no se cargan enteros y las salidas intermedias no pasan por el modelo. El coste es aislamiento, límites de recursos y monitorización del sandbox.

### 82. ¿Por qué la ejecución más barata puede ser la que más tokens envía?

Por la caché. Enviar casi 300K tokens por turno con 97% de acierto puede costar 0,0063 dólares por turno; recortar agresivamente parece más pequeño pero rompe el descuento y cuesta más.

Depende de un precio de caché bajo y de una carga concreta: no es ley universal. Si sube el precio de caché, la conclusión se invierte. El ahorro robusto es poner topes, no reescribir.

### 83. ¿Por qué resumir el historial cuesta 50% más que no resumir?

Los tokens ahorrados no cubren el descuento de caché destruido. El historial completo cuesta 0,11 por turno frente a 0,24 del preset con resumen, mientras las sondas de memoria dan 92% frente a 38%: más caro y más olvidadizo.

La caché exige reenviar el contexto anterior sin cambios. Resumir reescribe el prefijo, así que todo lo descontado se paga a precio completo.

### 84. Llenar una ventana de un millón: ¿cuánta diferencia hay entre lo más caro y lo más barato?

Con datos de junio de 2026, 71 veces: unos 0,14 dólares en el extremo barato y 10 en el caro. La diferencia viene sobre todo de la estructura de precios, no del nivel de capacidad.

La tabla precio un llenado, no un mes. El coste mensual aún se multiplica por la tasa de acierto y el número de turnos.

### 85. ¿Por qué pulsar compactar quema miles de tokens y más de diez segundos?

Porque compactar es en sí una petición de inferencia completa: lee toda la sesión y genera un resumen. Una ventana de 150K produce 3.000–5.000 tokens de salida y 5–15 segundos de latencia real.

La salida se factura a precio de salida, a menudo varias veces el de entrada, y la compactación reescribe el prefijo, forzando reconstruir toda la caché. Si no necesitas continuidad, `/clear` es más barato.

### 86. ¿Por qué el doble de trabajo cuesta siete veces más y vale la pena?

Multi-agente compra cómputo a cambio de tasa de éxito; el uso de tokens explica cerca del 80% de la varianza de resultados. Los equipos de agentes de Claude Code en modo plan cuestan unas 7x tokens.

Juzga con dos preguntas: ¿la salida se puede aceptar de forma independiente? ¿Las ramas paralelas deben compartir decisiones? Si deben compartir, un solo hilo con buen contexto es más seguro; solo el trabajo independiente y realmente paralelo justifica 15x.

### 87. ¿Por qué mi ventana se encogió en silencio tras actualizar el modelo?

Porque cambió el tokenizer. Desde Opus 4.7, el mismo texto puede contar hasta un 35% más de tokens; el tamaño de la ventana no cambió, el contador sí.

Ejecuta `/context` el día de la actualización, cuenta el mismo historial en el modelo viejo y el nuevo, y vuelve a declarar presupuesto y límites con las cifras nuevas.

### 88. Para ahorrar, ¿recorto contexto primero o cambio de modelo?

En orden: revisa la tasa de acierto de caché y arregla colocación y cortes, que es gratis; si la tasa es sana y el precio de caché está por debajo de unos 0,55 dólares por millón, recorta contexto; si el precio unitario es demasiado alto, cambia de modelo; si el modelo no puede cambiar, añade memoria externa o ejecución de código.

Cambia una variable cada vez y mide después de cada cambio.

## 6. Cómo saber si el contexto es bueno

### 89. ¿Por qué sigue sin haber un benchmark aceptado de calidad de contexto?

Porque «bueno» no está definido para este oficio. Los fallos son silenciosos: la compactación descarta detalles cuya importancia solo aparece después, así que en el momento nada parece mal.

Las sondas miden retención pero no utilización, y los benchmarks existentes no capturan la degradación encadenada de docenas de compactaciones con pérdida en producción. Sin respuesta pública, tu propio estándar es obligatorio.

### 90. ¿Cómo planto sondas para detectar cuándo un agente empieza a olvidar?

Cinco pasos: planta un hecho comprobable en el turno cero; empuja la conversación más allá del punto de compactación con preguntas reales; haz una pregunta que exija ese hecho; descarta la ejecución si la compactación no se disparó; y haz que un juez puntúe a ciegas respecto a la configuración.

Planta cosas concretas como «300 milisegundos», no preferencias vagas como «al usuario le gusta la brevedad». En pruebas, cero compactaciones acertaban todo; tras cinco o seis, solo sobrevivían tres de diez sondas.

### 91. ¿Qué métricas revelan si la compactación es buena o solo lo parece?

La ratio de compresión engaña: tres sistemas quedaron en 98–99% mientras la calidad iba de 3,35 a 3,70, y el más agresivo quedó último.

Mira seis dimensiones: precisión, conciencia de contexto, huella, completitud, continuidad y seguimiento de instrucciones. La huella —recordar qué archivos se leyeron o cambiaron— es la más débil y la mejor alarma.

### 92. ¿Cómo monto monitorización de contexto para mi propia carga?

Tres piezas: registra el total de tokens de contexto por turno, sumando sin caché, lectura de caché y escritura de caché en vez de confiar solo en `input_tokens`; registra compactaciones y limpiezas con umbrales y longitud de resumen; y mantén una línea de estadísticas de caché y coste.

Con eso puedes responder «en qué turno empezó a volverse torpe» y «dónde se fue el dinero».

### 93. Veinte o treinta trayectorias reales: ¿cómo empiezo una evaluación mínima?

Empieza con 20–50 tareas reales; los cambios tempranos tienen efectos grandes y unos pocos casos bastan. El ciclo: recoger trayectorias, definir puntuación verificable, guardar una base, cambiar una variable y reservar un conjunto de retención.

No escribas tú las respuestas de referencia; extrae puntos atómicos de registros humanos reales para que el juez puntúe de forma fiable.

### 94. ¿Cómo puntúo rápido un ensamblaje de contexto?

Cuatro preguntas: ¿hay una versión equivocada (corrección)? ¿Están todos los prerrequisitos (completitud)? ¿Cuánto es ruido (tamaño)? ¿Se puede continuar a mitad de tarea (trayectoria)?

El orden importa más que la lista: la corrección domina, lo erróneo supera a lo ausente y lo ausente al ruido. Nunca recortes corrección primero solo para ahorrar tokens.

### 95. ¿Por qué 97% dice que importa y solo 4% lo hace?

La brecha es de infraestructura, no de acuerdo. 97% dice que el contexto importa, pero solo 4% alcanza la madurez en la que el conocimiento compone; solo 42% dice poder medir con precisión la preparación para producción.

Evaluación, monitorización y gobernanza son donde el 97% se convierte en 4%. Quien construya esa capa primero se lleva la ventaja.

### 96. La calidad global es 97, ¿por qué sigue olvidando en silencio?

Porque la calidad global mide si la respuesta parece buena: prosa, pertinencia y formato están, pero el hecho olvidado no está en la rúbrica. En pruebas, la calidad ciega era 97–99% mientras las sondas de memoria eran 58%.

La aceptación debe puntuar solo las sondas. La calidad global es un panel, no una puerta. La pregunta es: ¿el hecho plantado en el turno cero sigue disponible en el turno once?

### 97. ¿Por qué la observabilidad es el mayor punto débil de la ingeniería de contexto?

Porque los proveedores dicen que el contexto importa pero rara vez dan una ventana para mirar dentro de la ventana. `/context` muestra ocupación estática, no la zona dinámica de mensajes, que es la que más importa.

Peor aún, la instrumentación puede mentir: un issue reportó `/context` mostrando 1.553,9% de ocupación. La solución es exportar trazas a OpenTelemetry y hacer que el agente emita hipótesis y evidencia en formato estructurado.

### 98. ¿Es creíble «menos del 5% de equipos tiene evaluaciones»?

La cifra no es creíble, pero el fenómeno probablemente sí. Viene del relato de un profesional anónimo, sin tamaño de muestra ni método auditable.

Usa la prueba de tres pasos: quién lo dijo, qué lo corrobora y cuál es el alcance. El 42% de preparación medida del informe sectorial apunta en la misma dirección. Trátalo como testimonio, no como estadística.

### 99. Aprendí muchas técnicas: ¿cómo sé cuál funciona en mi escenario?

Las técnicas no tienen verdad universal, solo «¿subió mi evaluación?». No ajustes por intuición; deja que la evaluación decida.

Crea un conjunto de evaluación con incidentes pasados y tests existentes, ejecuta una matriz sobre ensamblajes candidatos, cambia una variable cada vez y conserva solo lo que mejora.

### 100. ¿La ingeniería de contexto pasará de moda como la de prompts?

La mitad sí. Las técnicas concretas caducan: dónde poner el corte de caché, qué umbrales usar y qué instrucciones destacar se deprecian con cada actualización del modelo.

La otra mitad no: la evaluación no caduca —cuanto más fuerte el modelo, más escaso el buen juicio sobre calidad—; y los problemas difíciles tampoco: los modelos entienden bien contextos complejos pero siguen generando mal salidas largas igual de complejas.
