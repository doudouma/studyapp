---
title: 100 preguntas sobre Codex
summary: De los fundamentos y la puesta en marcha a los errores, los flujos avanzados, los escenarios reales y los límites de la herramienta: 100 preguntas para entender Codex de forma completa.
tags: [Codex, Agente de IA, Productividad, Guía temática]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
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
    value: Codex / Agentes de IA
  - key: Fuente
    value: The 100 Questions Series
  - key: Actualizado
    value: 2026-11-01
---

## Prefacio

Esta es una guía de «100 preguntas»: una forma de dividir un tema grande en preguntas y leerlo después una por una.

Codex es el agente de IA de OpenAI y funciona de manera muy distinta a un asistente conversacional. Esta guía empieza por lo que es, sigue con la configuración, los errores, los flujos avanzados y los escenarios reales, y termina con sus límites y con lo que puedes concluir.


> **Cómo leer**
>
> No hace falta empezar por la pregunta 1. Mira el índice de la izquierda, salta a lo que necesites y completa después el contexto.

> Esta es una traducción editada: el índice conserva las 100 preguntas y el cuerpo contiene las respuestas ya editadas. Algunos pasajes todavía se están revisando respecto al OCR original.

**Respuestas rápidas**

- Codex es un agente de ejecución: lee archivos, ejecuta comandos, comprueba resultados e itera. No es una ventana de chat más rápida.
- Empieza con una carpeta de proyecto dedicada y permisos de aprobación; no abras el acceso total el primer día.
- Usa el modo plan para tareas de varios archivos y revisa el diff antes de aceptar.
- Haz commit antes de los cambios y detén pronto las tareas en bucle. Esos dos hábitos evitan la mayor parte del retrabajo y del gasto de cuota.
- Define el criterio de aceptación antes de empezar: esa es la verdadera línea entre un uso fluido y uno doloroso.



## 1. Fundamentos y posicionamiento

### 1. ¿Qué es exactamente Codex?

Codex es el agente de IA de OpenAI para trabajo de software. A diferencia de un modelo de chat que solo sugiere código, puede leer archivos, editarlos, ejecutar comandos, comprobar el resultado e iterar hasta que la tarea esté verificada.

### 2. ¿Qué formas tiene Codex y cuál debería elegir una persona normal?

Codex existe como aplicación de escritorio, interfaz de línea de comandos, plugin de IDE y versión en la nube. La aplicación de escritorio es la más amable: diffs visuales, varios proyectos y navegador integrado. Si vives en la terminal, puede que prefieras la CLI; si el equipo trabaja con repositorios de GitHub, la nube. Empieza por la aplicación de escritorio.

### 3. ¿En qué se diferencia de pedirle código a ChatGPT?

ChatGPT explica el problema y pega código; tú tienes que ejecutarlo y verificarlo. Codex convierte la petición en acciones —leer estos archivos, cambiar esa función, instalar esta dependencia, ejecutar estas pruebas—, las ejecuta y comprueba el resultado. Ese bucle de ejecución es la diferencia real.

### 4. ¿Aplicación de escritorio o Codex de línea de comandos?

La aplicación de escritorio tiene interfaz, diffs visuales, vistas previas y navegador integrado. La CLI es más ligera y rápida, encaja con scripts de shell, Git y automatización, pero exige soltura con la terminal. Usa la aplicación para el trabajo general y la CLI para flujos automatizados.

### 5. ¿Puedo usar Codex sin un repositorio de código?

Sí. Codex trabaja sobre una carpeta de proyecto, no sobre un repositorio Git. La versión en la nube encaja mejor con GitHub, pero la aplicación de escritorio puede abrir cualquier carpeta local y trabajar ahí.

### 6. ¿Necesito una suscripción de pago?

El plan gratuito solo alcanza para probarlo; un par de tareas reales lo agotan. ChatGPT Plus es el punto de entrada habitual. Los usuarios intensivos pueden querer Pro o créditos extra. Si el presupuesto aprieta, Codex también se puede conectar a modelos de terceros, con sus ventajas y riesgos de compatibilidad.

### 7. ¿Puede Codex tocar otros archivos de mi ordenador?

Solo dentro del sandbox que le concedas. Con el permiso de carpeta de proyecto puede leer y escribir esa carpeta, pero no el resto del disco. El acceso total es peligroso y debe reservarse a casos en los que entiendas el riesgo. La función de «control del equipo» es la que puede cruzar esa frontera.

### 8. ¿Es una herramienta de chat o de programación?

Tiene una capa de chat, pero se comporta como una herramienta: cambia archivos, ejecuta código, opera aplicaciones y entrega un resultado verificable. Trátalo como una capa de ejecución que diriges, no como un chatbot con el que charlas.

### 9. ¿Por qué algunos aman Codex y otros lo odian?

Sobre todo por las expectativas. Quien lo trata como un ChatGPT más rápido espera respuestas perfectas al instante y recibe trabajo a medias. Quien escribe tareas claras, divide el trabajo, vigila la ejecución y revisa el diff obtiene resultados estables. Las versiones del modelo también fluctúan.

### 10. ¿Codex es mejor para proyectos nuevos o para código existente?

El código existente es más fácil: el proyecto da anclas de estructura, convenciones y dependencias. En un proyecto nuevo, Codex tiene que adivinar la arquitectura y el estilo, así que especifica el stack, la estructura y los criterios de aceptación desde el principio.

### 11. ¿Qué es lo que más sobreestima la gente?

La autonomía. Codex parece autónomo, pero adivina cuando el encargo es vago. Cuanto más dejes sin especificar, más rondas consumirá y más se desviará el resultado. Las tareas claras y los puntos de control importan más que la potencia bruta del modelo.

### 12. ¿Qué trabajo no debería darle a Codex?

El que no puedes describir ni verificar, el juicio subjetivo y todo lo arriesgado o irreversible: pagos, cuentas bancarias, bases de datos de producción, borrar archivos importantes. Tampoco encaja cuando no puedes juzgar si la salida es correcta.

### 13. ¿Puede usar Codex alguien que no programa?

Sí; es una de sus grandes ventajas frente a una CLI. Describes el resultado, Codex ejecuta y tú revisas. Aun así necesitas escribir un encargo claro, definir criterios de aceptación y saber cuándo detenerlo.

### 14. ¿Qué debo tener claro antes de usar Codex?

Cómo sabrás que el trabajo está hecho. Si puedes verificar el resultado, Codex es fácil: lo aceptas o le dices qué está mal. Si no puedes, aceptarás a ciegas o revisarás cada línea. Define primero la prueba de aceptación.

### 15. ¿Codex sustituirá mi trabajo manual?

Sustituye la ejecución repetitiva, no el criterio. Decidir qué delegar, escribir el encargo, comprobar el resultado y elegir el siguiente paso sigue siendo tuyo. Cuanto más capaz es el agente, más importa tu criterio.

## 2. Primera puesta en marcha y mecánica básica

### 16. ¿Por dónde empiezo la primera vez que uso Codex?

Instálalo, inicia sesión, saluda y confirma que funciona. No empieces con una tarea grande. El primer objetivo es solo demostrar que la instalación, el inicio de sesión y la ejecución funcionan.

### 17. ¿Qué método de inicio de sesión elijo: cuenta de ChatGPT o clave API?

La mayoría debería usar una cuenta de ChatGPT; el uso va con la suscripción y no tienes que gestionar la facturación de la API. La clave API es para automatización y pasarelas de modelos de terceros: se factura por consumo, es más transparente y es más fácil pasarse si una tarea se descontrola.

### 18. ¿Qué es un proyecto y por qué crearlo primero?

Un proyecto de Codex es una carpeta de trabajo que designas. Las lecturas y escrituras de Codex se limitan a ella, los artefactos quedan en un solo lugar y el trabajo es rastreable. Chatear sin proyecto es la receta para archivos que faltan, salidas dispersas y errores de comandos incomprensibles.

### 19. ¿Qué carpeta de proyecto elijo y qué trampas hay?

Crea una carpeta limpia dedicada a Codex y usa subcarpetas por proyecto. Prefiere una ruta en inglés y sin espacios. Evita la raíz del disco, el escritorio, descargas, carpetas del sistema y carpetas con archivos personales importantes. No apuntes Codex a una carpeta que otro editor esté usando.

### 20. ¿Cómo elijo entre los tres niveles de permisos del sandbox?

Aprobación de solicitudes, revisión automática y acceso total. Empieza por la aprobación: Codex pregunta antes de ejecutar comandos. La revisión automática deja que el sistema apruebe operaciones seguras. El acceso total es para quien entiende el riesgo; no empieces por ahí.

### 21. ¿Cuál es la diferencia entre los niveles de razonamiento?

Bajo, medio y alto. Ajusta el nivel a la tarea: bajo para textos y estilos, medio para funciones y errores normales, alto para arquitectura, errores difíciles y refactorizaciones complejas. Poner todo al máximo desperdicia tiempo y cuota.

### 22. ¿Qué es el modo plan y cuándo usarlo?

En modo plan, Codex propone un plan —pasos, archivos, riesgos— antes de tocar nada. Úsalo para trabajo multiarchivo, funciones nuevas, refactorizaciones y errores complejos. Escribe `/plan` o pide un plan primero y aprueba después la ejecución.

### 23. ¿Para qué sirve la barra lateral y por qué importa?

La barra lateral es el área de trabajo de Codex: diffs, archivos generados, resultados de búsqueda, vistas previas de páginas y PDF, y el navegador integrado. El chat es donde das instrucciones; la barra lateral es donde se entrega el trabajo. Mírala.

### 24. ¿Qué es un diff y por qué revisarlo siempre?

Un diff muestra qué cambió: verde para añadidos, rojo para eliminaciones. Revísalo después de cada tarea para confirmar que el cambio coincide con la petición. También puedes comentar una línea para iterar solo en ese punto. Revisar diffs es el hábito mínimo de seguridad.

### 25. ¿Qué es un hilo y cuántos puede tener un proyecto?

Un hilo es una conversación de tarea dentro de un proyecto. Un proyecto puede tener muchos. Usa hilos separados para tareas separadas para mantener el contexto enfocado y vuelve al hilo existente para continuar el mismo trabajo.

### 26. ¿Cómo sé cuánto tardará una tarea?

No hay una estimación fiable. Los cambios simples tardan segundos o minutos; el trabajo multiarchivo puede tardar mucho más. Vigila el registro de acciones. Si una tarea tarda mucho más de lo esperado, ponle un límite y mira qué está haciendo.

### 27. ¿Qué hago si una tarea se queda en silencio?

Revisa el registro de acciones. Operaciones parecidas repetidas, el mismo error o ninguna actualización significan que está atascada o en bucle. Detenla, pide un resumen del fallo y reformula la tarea o reduce su alcance.

### 28. ¿Dónde veo los resultados cuando termina una tarea?

La carpeta del proyecto es la fuente de verdad: allí va cada archivo que Codex cambió o generó. La barra lateral muestra diffs y vistas previas, y el chat da un resumen. Revisa la carpeta y el diff, no solo el resumen.

### 29. ¿Cómo funciona la ventana móvil de cinco horas?

El uso se calcula sobre una ventana móvil de cinco horas, no se reinicia en punto. Las tareas pesadas consumen mucho más que las ligeras, y también hay un límite semanal. No controlas exactamente cuándo se agota la cuota, así que planifica las tareas grandes.

### 30. ¿Cómo compruebo cuánta cuota me queda?

Abre el área de uso en los ajustes de Codex. Compruébalo antes de empezar algo grande. Codex no avisa de forma fiable por adelantado; la siguiente petición simplemente falla cuando no queda cuota.

### 31. ¿Hay mucha diferencia entre la cuota de Plus y Pro?

Sí, pero la mayoría no necesita Pro. Pro es mucho más grande y mucho más caro. Prueba Plus una o dos semanas y mira si llegas al límite a menudo. Para un exceso puntual suelen bastar créditos extra, sin cambiar de plan.

### 32. ¿Una tarea se detiene en cuanto se agota la cuota?

Normalmente termina la ronda actual y luego falla la siguiente petición. Una tarea en segundo plano puede seguir consumiendo hasta que lo notes. Comprueba la cuota antes de ejecuciones largas, divide el trabajo y no lances varias tareas pesadas a la vez.

### 33. ¿Puedo usar Codex en el móvil?

El Codex real se ejecuta en tu ordenador. La app móvil puede iniciar o continuar tareas en la nube, responder a las preguntas de Codex y permitirte aprobar el siguiente paso, pero no puede tocar tus archivos locales. Es útil para supervisar tareas largas cuando estás fuera.

### 34. ¿La tarea sigue ejecutándose si cierro Codex?

Depende del modo. Las tareas locales se detienen cuando cierras del todo la aplicación; minimizar a la bandeja o a la barra de menús las mantiene activas. Las tareas en la nube siguen en los servidores de OpenAI. Para detener el trabajo local, sal desde la bandeja o la barra de menús, no solo cerrando la ventana.

### 35. ¿Vale la pena comprar créditos de Codex?

Vale la pena si solo te pasas de vez en cuando. Si compras créditos cada mes, cambia a Pro: sale más barato que recargar y evita la experiencia de parar y arrancar. Ojo con el efecto «he pagado, ahora puedo derrochar».

## 3. Errores y antipatrones

### 36. ¿Por qué Codex empieza de repente a dar vueltas?

El agente reintenta variaciones del mismo enfoque sin darse cuenta de que se repite. Detenlo pronto: pide un resumen del fallo, cambia el enfoque, reduce la tarea o toma el control. No lo dejes en bucle quemando cuota.

### 37. ¿Por qué recibo trabajo a medias después de media hora?

Los contextos largos diluyen la atención, la definición de terminado puede ser ambigua y el modelo puede cantar victoria antes de tiempo. Escribe los criterios de aceptación en la tarea, divide las ejecuciones largas y revisa el diff en vez de fiarte del resumen.

### 38. Se lo expliqué claramente, ¿por qué Codex sigue olvidando instrucciones?

La atención no se reparte de forma uniforme en listas largas. Pon lo crítico al principio y al final, mantén las listas cortas, repite las restricciones importantes y usa una checklist. Después verifica cada punto contra el diff.

### 39. ¿Por qué Codex rompe código bueno al hacer un cambio pequeño?

Puede refactorizar, renombrar o borrar cosas que considera innecesarias. Prohíbe borrar archivos que no haya creado, pide el cambio más pequeño posible y revisa cada diff. Revierte todo lo que no tenga que ver con la tarea.

### 40. ¿Por qué una petición simple se convierte en un cambio enorme?

Codex tiende a aplicar patrones de producción: componentes, abstracciones, dependencias nuevas. Di «la solución más simple, sin dependencias nuevas, sin módulos nuevos, nada fuera de esta petición» y pregunta por qué hace falta cada cambio.

### 41. ¿Las tareas en segundo plano me están gastando cuota sin saberlo?

Sí, si siguen ejecutándose. Una app minimizada o una tarea en la nube sigue consumiendo. Detén la tarea o cierra del todo la aplicación cuando no la uses, y no dejes varias tareas pesadas en paralelo.

### 42. Cerré la ventana, ¿por qué sigue bajando la cuota?

Cerrar la ventana no es salir. Codex se minimiza a la bandeja o a la barra de menús y sigue ejecutándose. Sal explícitamente desde ahí, sobre todo si hay una tarea larga activa.

### 43. ¿Por qué desapareció una tarea sin resultado?

Comprueba si falló, se detuvo o sigue en segundo plano. Mira el registro de acciones y la carpeta del proyecto. No des por hecho que la falta de resultado significa éxito.

### 44. ¿Por qué la misma tarea produce un resultado completamente distinto?

La generación es estocástica y el contexto o la versión del modelo pueden cambiar. Guarda el resultado y haz commit; no esperes una repetición exacta. Si necesitas repetibilidad, conserva el resultado y el encargo que lo produjo.

### 45. ¿Por qué la solución de Codex no encaja con mi proyecto?

Le falta contexto. Usa el modo proyecto, deja que lea el repositorio, señálale los archivos y convenciones relevantes y ejecuta el resultado en tu entorno. El código que parece correcto fuera de tu proyecto puede no funcionar dentro.

### 46. Codex dice que lo arregló, ¿por qué sigue fallando?

Puede que no haya ejecutado nada. Haz que se ejecute en tu proyecto, pega los errores reales en el hilo y verifica tú el resultado. Nunca aceptes «debería funcionar» como terminado.

### 47. ¿Qué señales indican que debo detener una tarea?

Bucles, un número de archivos modificados que crece rápido, borrados masivos, dependencias o cambios de configuración sin explicación, falta de progreso o un resumen que no coincide con el diff. Detente y pide una explicación.

### 48. ¿Reintento una tarea fallida o cambio el encargo?

Reintenta fallos transitorios como errores de red. Si la misma tarea falla repetidamente, cámbiala: divídela, clarifícala o comprueba si supera lo que el agente puede hacer. Los reintentos a ciegas suelen gastar cuota.

### 49. ¿Por qué dividir una tarea grande a veces empeora las cosas?

Los límites mal elegidos crean acoplamientos ocultos y las ejecuciones separadas pierden el contexto compartido. Divide por acoplamiento, da a cada subtarea la visión general, planifica la división con Codex y verifica cada pieza.

### 50. ¿Cómo evito que una tarea se coma la cuota de toda la semana?

Estima el coste, pon un límite de tiempo, vigila el registro, divide el trabajo grande, usa razonamiento bajo para tareas pequeñas, planifica antes de ejecutar, controla la cuota y cierra las tareas en segundo plano. No entregues una tarea y te vayas.

### 51. ¿Quién falla más con Codex?

Quien lo trata como una caja negra, no usa control de versiones, nunca revisa diffs, escribe encargos vagos y lo deja ejecutarse sin supervisión. Haz commit antes de los cambios, revisa el resultado y usa worktree para ediciones grandes.

## 4. Avanzado: Skills, MCP, plugins, automatización y control del equipo

### 52. ¿Cuál es la diferencia entre Skill, MCP y plugin?

Un Skill es un flujo de trabajo reutilizable escrito en Markdown. Un plugin añade una capacidad o conector a Codex. MCP conecta Codex con herramientas y datos externos. Aprende primero las funciones integradas y los plugins, después los Skills para flujos repetibles y por último MCP cuando necesites datos externos.

### 53. ¿Cómo encuentro e instalo un plugin útil?

Abre la página de plugins e instala solo lo que necesites. Empieza por la tarea, no por el catálogo. Una vez instalado, llama a un plugin con `@` y elígelo de la lista.

### 54. ¿Cómo creo mi propio Skill?

Ejecuta el flujo una vez hasta que el resultado te convenza y pide a Codex que lo convierta en un Skill. También puedes usar skill-creator y describir los pasos en lenguaje natural. Un Skill es un archivo Markdown: cuándo usarlo, el objetivo, los pasos y la salida.

### 55. ¿Cómo escribo un Skill para que se active automáticamente?

La descripción decide si Codex relaciona la tarea con el Skill. Pon primero el caso de uso habitual y las palabras de activación, sé concreto con las entradas y salidas y evita etiquetas vagas como «análisis de datos». La invocación explícita `$skill-name` sigue siendo el respaldo.

### 56. ¿Cuándo necesito realmente MCP?

Cuando Codex necesita datos o herramientas externas: GitHub, Notion, Feishu, una base de datos, una API SaaS. Para archivos locales, páginas simples, presentaciones o PDF, las funciones integradas y los plugins bastan. MCP es un adaptador, no una insignia de sofisticación.

### 57. ¿Debo escribir un AGENTS.md?

Sí. Le dice a Codex quién eres, qué es el proyecto, qué convenciones seguir y qué no debe hacer. Deja que Codex lo redacte y luego refínalo. Mantenlo corto, actualizado y versionado en Git.

### 58. ¿Cómo funcionan la intervención y la cola de tareas?

Las instrucciones nuevas normalmente se ponen en cola detrás de la tarea actual. Usa la intervención cuando quieras que Codex cambie de rumbo de inmediato y la cola cuando la nueva instrucción pueda esperar. Ten claro cuál estás usando antes de enviarla.

### 59. ¿Para qué sirve la automatización?

Para resúmenes recurrentes, comprobaciones periódicas y continuar un hilo de larga duración. Las automatizaciones no heredan el modelo ni el razonamiento del chat activo, así que configúralos explícitamente; si no, una tarea de siete minutos puede convertirse en cuarenta.

### 60. ¿Qué es el control del equipo y es seguro?

Permite que Codex vea la pantalla y opere aplicaciones gráficas, incluso sin API. Es potente y arriesgado. Exige tu confirmación para cualquier acción que envíe, publique, borre o pague, y mantén el alcance lo más estrecho posible.

### 61. ¿Cuál de los tres modos de navegador debo usar?

Usa el navegador integrado para localhost, comprobaciones de diseño y vistas previas aisladas. Usa la extensión de Chrome cuando la tarea necesite tu sesión iniciada. Usa Playwright cuando necesites control programático y repetible del navegador. Confirma antes de cualquier acción arriesgada.

### 62. ¿Cuándo debo usar el modo worktree?

Usa un worktree para cambios grandes, experimentos y trabajo en paralelo. Aísla la tarea de tu checkout principal y facilita descartar o fusionar el resultado.

### 63. ¿Cómo elijo entre varias vistas previas o soluciones?

Compáralas con los mismos criterios de aceptación y elige el cambio más pequeño con el menor riesgo. No aceptes un diff más grande solo porque parezca más impresionante.

### 64. ¿Cuál es la diferencia entre el modo objetivo y una tarea normal?

En el modo objetivo das a Codex un criterio de éxito verificable y sigue iterando hasta cumplirlo. Encaja en migraciones, corrección de errores, rendimiento y refactorizaciones. No encaja en peticiones vagas, trabajo subjetivo o tareas sin una meta clara.

### 65. ¿Cómo funcionan los hilos duraderos y el anclaje?

Un hilo duradero conserva el contexto entre sesiones, así no tienes que volver a explicar el proyecto. Úsalo para trabajo continuo y ancla los hilos a los que vuelves más a menudo.

### 66. ¿Cuál es la forma más fiable de montar una memoria compartida?

Mantenla pequeña, estructurada y actual. Guarda hechos del proyecto, convenciones, decisiones y trampas conocidas. Revísala con regularidad y no dejes que notas obsoletas se conviertan en instrucciones permanentes.

### 67. ¿Por qué merece la pena la entrada por voz?

Hablar suele ser más rápido que escribir un encargo largo, sobre todo para idear y describir intenciones. Revisa la transcripción antes de enviar y mantén por escrito las restricciones importantes.

### 68. ¿Qué debe incluir un AGENTS.md avanzado?

Comandos, arquitectura, convenciones, acciones prohibidas, criterios de aceptación, trampas conocidas y los archivos que hay que leer primero. Mantenlo conciso; un documento largo que nadie mantiene es peor que uno corto y exacto.

### 69. ¿Cómo hago que Codex explique su enfoque antes de editar?

Pide un plan o una propuesta con diff primero, usa el modo plan y exige una nota breve de diseño para cambios arriesgados. Aprueba el enfoque antes de dejar que toque archivos.

### 70. ¿Cómo hago que Codex recuerde las convenciones de mi proyecto?

Ponlas en AGENTS.md, señala archivos de ejemplo y pide a Codex que siga los patrones existentes en lugar de inventar nuevos. Actualiza el documento cuando cambie una convención.

### 71. ¿Qué pequeños hábitos mejoran más la estabilidad?

Planificar primero, revisar cada diff, hacer commit antes de los cambios, una tarea por hilo, escribir criterios de aceptación, detenerse pronto cuando algo se desvía y mantener AGENTS.md al día. Nada de esto es exótico; se acumula.

## 5. Casos prácticos

### 72. ¿Cuál debería ser mi primera tarea de práctica?

Elige algo pequeño, no crítico y verificable: una página simple, un script, un análisis pequeño. El objetivo es practicar el bucle de colaboración, no probar los límites del modelo.

### 73. ¿Cómo planteo a Codex una página web?

Da el contexto, el objetivo, las restricciones y los criterios de aceptación. Genera primero un mockup visual y luego implementa. Usa el navegador integrado para comprobar el resultado y prueba el diseño móvil.

### 74. ¿Cómo uso Codex para presentaciones?

Instala el plugin Presentations, aporta el material de origen y especifica audiencia, estilo, secciones y número de páginas. Trata la primera salida como un borrador al 80 %. Si haces presentaciones a menudo, convierte tu estilo en un Skill.

### 75. ¿Es fiable Codex para vídeo?

Sí, con los plugins adecuados, como HyperFrames o Remotion. El vídeo es un proceso —guion, material, voz, subtítulos, montaje—, no un único prompt. Construye el flujo una vez y guárdalo como Skill.

### 76. ¿Cómo uso Codex con PDF y documentos?

Es un caso muy adecuado: entrada clara, salida verificable. Aporta los archivos, especifica la estructura y el formato de salida y comprueba el resultado. Usa herramientas de documentos o MCP cuando la fuente esté en un servicio externo.

### 77. ¿Cómo uso Codex para análisis de datos y conciliación?

Di dónde están los datos, qué campos deben coincidir, qué cuenta como anomalía y qué debe pasar cuando se encuentre una. Usa MCP o una CLI para fuentes externas y convierte las reglas en un Skill programado.

### 78. ¿Puede Codex ayudarme a limpiar el ordenador?

Es bueno encontrando candidatos y malo decidiendo qué es seguro borrar. Usa permisos de proyecto, haz que liste primero los archivos, haz copia de seguridad de lo importante y confirma tú cada borrado.

### 79. ¿Cómo uso Codex para escribir y crear contenido?

Es fuerte en investigación, esquemas, borradores, portadas y reutilización. Dale una guía de estilo, audiencia y material de origen. Espera un borrador para editar, no una pieza final. Automatiza la vigilancia de temas si escribes con regularidad.

### 80. ¿Cómo uso Codex en un proyecto paralelo?

Úsalo para el andamiaje, el trabajo repetitivo, funciones pequeñas y pruebas. Reserva para ti la arquitectura, las decisiones de producto y la revisión final. Haz commits a menudo y no le entregues todo el producto de una vez.

### 81. ¿Cuál es la forma más eficaz de entregar un error a Codex?

Da pasos de reproducción, comportamiento esperado, comportamiento real, registros y los archivos implicados. Pide la corrección más pequeña y verifícala. Si no puede reproducir el error, arregla primero la información de reproducción.

### 82. ¿Cómo divido una función nueva para Codex?

Divide por comportamiento visible para el usuario, define las interfaces y las pruebas de aceptación, planifica primero y revisa cada porción. Evita una tarea gigante que cambie el modelo de datos, la interfaz y las pruebas a la vez.

### 83. ¿Es seguro dejar que Codex refactorice un proyecto antiguo?

Puede funcionar, pero es arriesgado. Exige pruebas, haz una refactorización por tarea, revisa el diff y haz commit antes de cada paso. Nunca dejes que refactorice y añada funciones en la misma ejecución.

### 84. ¿Cómo le encargo a Codex la escritura de pruebas?

Describe el comportamiento y los casos límite, pide primero las pruebas y ejecútalas. No dejes que reescriba las pruebas solo para que pasen; las pruebas son la especificación.

### 85. ¿Codex es bueno revisando código?

Es útil para una primera pasada consistente. Pide una lista de problemas priorizada y decide tú qué corregir. Nunca dejes que fusione automáticamente; la decisión sigue siendo tuya.

### 86. ¿Puede un equipo usar Codex en conjunto?

Sí, pero cada persona usa su cuenta y su copia de trabajo. Comparte AGENTS.md y Skills mediante Git y ten cuidado con los datos sensibles. No trates una carpeta como un espacio compartido multiusuario.

### 87. ¿Cómo monto un proyecto largo semiautomatizado?

Usa una lista de tareas, un supervisor y commits frecuentes. Define puntos de control, presupuesta la cuota y mantén a una persona en el bucle. «Un prompt y a dormir» no es un flujo de trabajo; es una apuesta.

## 6. Límites, alternativas y reflexión

### 88. ¿Cuándo debo dejar de usar Codex?

Cuando la tarea sea una pregunta simple, un juicio subjetivo, una idea vaga, una acción arriesgada e irreversible o algo que no puedas verificar. Una herramienta solo es útil dentro de su límite.

### 89. ¿Hay alternativas a Plus?

Sí. Puedes conectar Codex a modelos de terceros mediante una pasarela, más barata pero no oficial, o usar otros agentes. Elige por presupuesto, compatibilidad y riesgo aceptable.

### 90. ¿Codex o Claude Code?

Ocupan un espacio parecido. Claude Code es terminal-first y fuerte en bases de código complejas; Codex es más amable, tiene interfaz gráfica y maneja tareas que no son de código. Muchos usuarios intensivos tienen ambos y cambian según la tarea.

### 91. Ya uso Cursor, ¿necesito Codex?

Son complementarios. Usa Cursor para la ayuda dentro del editor y Codex para tareas delegadas y entrega. Si tu trabajo incluye tareas que no son de código, Codex añade un alcance que Cursor no cubre.

### 92. ¿Las cuotas de Codex seguirán creciendo?

La tendencia es más flexible, pero el trabajo de agentes es caro y no puede ser ilimitado. La competencia y la inferencia más barata ayudan. No construyas hábitos que dependan de una cuota ilimitada; úsala con intención.

### 93. ¿Por qué Codex se parece cada vez más a un sistema operativo?

Gestiona archivos, instala plugins, programa tareas, recuerda preferencias y controla otras aplicaciones. OpenAI ve gran parte del trabajo informático como cercano al código, así que extender el agente es natural. El intercambio es comodidad frente a dependencia.

### 94. ¿Codex será sustituido pronto?

La forma persistirá a corto plazo porque resuelve una necesidad real. A largo plazo, modelos más fuertes y baratos pueden integrar agentes en el sistema operativo y el navegador. Mantén tus habilidades independientes de la herramienta.

### 95. ¿La gente normal necesita realmente un agente de IA?

Si tienes un problema concreto y puedes verificar el resultado, sí. Si no puedes juzgar la salida, el valor es limitado. La nueva habilidad es describir el problema, comprobar el resultado e iterar.

### 96. ¿Qué riesgo hay en entregar todo un proyecto a la IA?

Alto. Le falta comprensión global, puede refactorizar código no relacionado y no puedes verificarlo todo a la vez. Cambia en porciones pequeñas, revisa cada una y mantén control de versiones.

### 97. ¿Usar mucho Codex me hará retroceder?

Solo si externalizas todo el pensamiento. La colaboración —marcar dirección, verificar, aprender— mejora el criterio. Define «saber programar» por la capacidad de entregar y resolver problemas, no por escribir cada línea.

### 98. ¿Cómo aprovechan al máximo los usuarios gratuitos?

Reserva Codex para tareas que necesiten ejecución. Usa modelos baratos o de terceros para el resto, ajusta el nivel de razonamiento, planifica primero, detente pronto y guarda cada buen resultado.

### 99. ¿Cuándo debo volver a escribir código a mano?

Cuando necesites comprensión profunda, precisión extrema, seguridad o lógica de negocio central, o cuando estés aprendiendo. En esos casos Codex es un compañero de entrenamiento, no un sustituto.

### 100. ¿Qué debo revisar después de usar Codex un tiempo?

¿Puedes explicar qué hizo Codex y por qué? Si no, estás externalizando en lugar de colaborar. Crea tus propias plantillas de encargo, actualiza AGENTS.md y los Skills, registra fallos recurrentes y revisa cómo gastas la cuota. La ganancia a largo plazo es la capacidad de colaborar con la IA.

