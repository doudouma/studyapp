---
title: 100 preguntas sobre Vibe Coding
summary: De «hablar y crear una app» al despliegue seguro, el control de calidad y las decisiones de carrera: 100 preguntas para entender los límites reales, las herramientas y los errores del vibe coding.
tags: [Vibe Coding, Programación con IA, Sin código, Seguridad, Guía temática]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
questionCount: 100
chapterCount: 7
facts:
  - key: Autor
    value: 100mini Editorial
  - key: Preguntas
    value: 100
    highlight: true
  - key: Capítulos
    value: 7
  - key: Tema
    value: Vibe Coding / creación con IA
  - key: Para quién
    value: Creadores sin código / producto / trabajadores ante la IA
  - key: Actualizado
    value: 2026-11-01
---

## Prefacio

Esta es una guía de «100 preguntas»: una forma de dividir un tema grande en preguntas y leerlo después una por una.

El vibe coding hace posible «crear una app hablando», pero hay un largo camino entre una demo que funciona y un producto seguro, desplegable y mantenible. La guía sigue siete etapas: un chequeo de realidad honesto, el primer día, por qué la salida sigue saliendo mal, cómo ponerlo online, cómo evitar los desastres, cómo juzgar la calidad y la cuestión profesional.

**Respuestas rápidas**

- El vibe coding convierte ideas en demos rápido, pero el despliegue de producción, la seguridad, los datos y el mantenimiento siguen necesitando criterio humano.
- Los principiantes sin código deben empezar con una herramienta alojada en el navegador, no con Node, Git o la terminal.
- Divide la idea en quién la usa, qué hace, dónde viven los datos y qué no hará el producto.
- Cambia una cosa a la vez, revisa después de cada cambio y comprueba a mano todo lo que toque dinero, privacidad o datos de usuarios.
- «Funciona» no es «está bien hecho». Los criterios de aceptación, las copias de seguridad y lo básico de seguridad son la verdadera línea entre una demo y algo que puedes publicar.


> Esta es una traducción condensada: algunos pasajes todavía se están revisando respecto al OCR original.

## 1. ¿De verdad puedes crear una app hablando con la IA?

### 1. ¿De verdad puedes crear una app solo hablando? Empecemos por el agua fría

Sí, la IA puede convertir una frase en una pequeña app que abre y funciona. Lo difícil no es la primera pantalla, sino todo lo que hay entre una demo y un producto en el que usuarios reales confíen con sus datos. Las herramientas han mejorado mucho, pero los vídeos de «una app en una hora» cortan el despliegue, la autenticación, los pagos, la seguridad de datos y el mantenimiento.

### 2. ¿Mi madre también puede crear una app? ¿Hasta dónde llega de verdad alguien sin código?

Alguien sin código puede llegar sorprendentemente lejos con prototipos, herramientas internas y proyectos personales. Los sistemas de producción son otra historia: exigen criterio sobre arquitectura, seguridad y operaciones que la IA no aporta. El vibe coding amplifica lo que traes: claridad o confusión.

### 3. «Quiero crear un comercio electrónico»: ¿por qué la IA no lo entiende?

Una petición de una línea esconde decenas de supuestos: quién inicia sesión, cómo se listan los productos, cómo se cobra, quién ve qué datos. Divide la idea en personas y acciones: quién lo usa, qué hace cada uno, dónde van los datos y qué no hará el producto. Un breve documento escrito vale más que un deseo.

### 4. ¿La IA sustituirá a los programadores? Primero la conclusión y luego qué hacer

Se sustituye a quien solo traduce una especificación terminada a código. Los programadores que diseñan sistemas, juzgan compromisos, depuran causas raíz y deciden qué construir se vuelven más valiosos. Aprende a dirigir la IA, no solo a escribir código.

### 5. Soy un trabajador afectado por la IA y no sé programar. ¿Todavía tengo oportunidad?

Sí, y la oportunidad es mayor de lo que parece. La habilidad escasa ya no es teclear sintaxis, sino convertir una idea vaga en un encargo claro y paso a paso que la IA pueda ejecutar, y luego juzgar el resultado. Empieza por una molestia pequeña y real y practica explicarla con precisión.

### 6. Mi jefe quiere usar IA y no contratar programadores. ¿Salen las cuentas?

Para herramientas pequeñas y sistemas internos, a menudo sí. Para sistemas de producción que tocan autenticación, pagos y datos de usuarios, normalmente no. La IA reduce el código repetitivo, pero no sustituye a quien posee la arquitectura, la revisión y la respuesta a incidentes.

### 7. Vibe coding, programación asistida por IA, agentic: ¿cuál es la diferencia?

La línea divisoria es si revisas el código. La programación asistida significa que lees, pruebas y entiendes lo generado. El vibe coding significa que aceptas la salida e iteras por resultados sin leer el código. Agentic significa que orquestas un equipo de agentes y actúas como supervisor.

### 8. ¿Es real eso de «crear una app en una hora»? ¿Qué se corta en el vídeo?

La hora del prototipo es real. Lo que se corta es todo lo que viene después: arreglar la lógica, añadir inicio de sesión y almacenamiento, elegir una base de datos, desplegar, proteger los datos y atender a usuarios reales. La demo es el setenta por ciento fácil; el último treinta es donde se para la mayoría.

### 9. ¿Puede un principiante absoluto crear algo usable o solo juguetes?

Puedes crear cosas pequeñas realmente útiles: una web personal, una herramienta interna, un prototipo para validar una idea. No puedes saltarte la infraestructura que aún no entiendes cuando llegan usuarios, datos o tráfico reales. El vibe coding es más fuerte en el terreno intermedio.

### 10. «Hecho» y «hecho correctamente» no son lo mismo. ¿Qué significa?

Que una página abra no demuestra que la lógica de negocio sea correcta ni que los datos estén seguros. El código generado por IA puede parecer seguro mientras se equivoca en nombres de campos, permisos o comportamiento asíncrono. Hazte tres preguntas: ¿hace lo que quiero?, ¿trata bien los datos?, ¿me daría cuenta si falla?

### 11. Las grandes empresas lanzan herramientas como Miaoda, TRAE y Coze. ¿Dónde está la oportunidad para la gente normal?

No en competir por el modelo o la plataforma. La oportunidad está en entender a un público concreto y convertir una necesidad real en un prototipo funcional más rápido. Las herramientas bajan la barrera de ejecución; el criterio, el conocimiento del dominio y la distribución siguen importando.

### 12. ¿Quién acuñó «vibe coding» y por qué todo el mundo empezó a hablar de ello en 2025?

Andrej Karpathy popularizó el término a principios de 2025. Se extendió porque la capacidad por fin alcanzó la promesa: los modelos se volvieron lo bastante buenos para que personas sin código crearan pequeñas apps conversando. La frase puso nombre a una sensación que mucha gente ya tenía.

### 13. Tengo una idea de producto. ¿Puede la IA hacerla realidad? Hasta dónde llega

La IA puede llevarte de una idea a una demo clicable y, a menudo, hasta el despliegue. No puede tomar decisiones de posicionamiento, juzgar compromisos de privacidad ni asumir la responsabilidad de un incidente en producción. La última milla sigue siendo tuya.

### 14. ¿Para quién es esta guía y para quién no?

Es para personas sin código con una idea o una tarea repetitiva, trabajadores preocupados por la IA y gente de producto o negocio que quiere prototipar antes de contratar. No es para quien espera que un producto rentable aparezca sin pensar.

## 2. No sabes programar: ¿por dónde empiezas el primer día?

### 15. No sé nada de código. ¿Qué instalo primero y puedo evitar la terminal?

El primer día probablemente no instales nada. Abre una herramienta en el navegador, escribe una descripción y deja que genere la app; la plataforma gestiona el entorno. La terminal, Node y Git son para otro camino. Empieza por el camino que te da un resultado hoy.

### 16. ¿Cómo elijo herramienta: totalmente alojada o autoalojada? ¿Miaoda, WorkBuddy, Tencent Marvis, Zhipu zcode?

Las herramientas totalmente alojadas (Miaoda, WorkBuddy, Zhipu zcode) se encargan del entorno y del despliegue. Las autoalojadas (Cursor, Claude Code, Trae) son más potentes pero exigen editor, terminal y gestión de archivos. Los principiantes deberían empezar por las alojadas y cambiar solo cuando el proyecto necesite más control.

### 17. Dicen que necesito Node y Git. ¿Puede evitarlo alguien sin código?

Sí. Las plataformas en el navegador gestionan esas herramientas por detrás. Los tutoriales que empiezan instalando Node y Git están escritos para programadores. Busca herramientas etiquetadas como «sin código» o «creación por lenguaje natural»; si un tutorial te pide instalar un paquete primero, probablemente no sea tu camino.

### 18. No quiero tocar la terminal. ¿Hay una herramienta donde solo hable?

Sí. Los constructores alojados y centrados en el chat están diseñados para eso. Describes la app, revisas la vista previa y pides cambios en lenguaje natural. Mantén el proyecto pequeño y usa los botones de vista previa y publicación de la plataforma en lugar de comandos locales.

### 19. ¿Cómo convierto «quiero una app de presupuestos» en algo que la IA entienda y construya?

Escribe un brief de una página: quién es el usuario, las tres acciones principales, dónde viven los datos, qué no debe hacer la app y cómo sabrás que funciona. Luego pide a la IA que proponga un plan antes de escribir código. El brief es la diferencia entre una primera versión útil y un montón de pantallas aleatorias.

### 20. ¿Cómo debe ser un PRD para la IA y por qué «lo que no hará» importa más que «lo que hará»?

Un buen PRD indica el usuario, el objetivo, los flujos principales, los datos, las restricciones y los no-objetivos explícitos. Los no-objetivos evitan que la IA invente alcance. Que sea corto para leer y concreto para probar.

### 21. ¿Cómo de detallada debe ser mi especificación frente a una petición de una línea?

Lo bastante detallada para que otra persona pueda decir si el resultado es correcto. Incluye el camino feliz, los casos límite que importan y los criterios de aceptación. Una petición de una línea deja que la IA adivine; una buena especificación la deja ejecutar.

### 22. ¿Describo toda la idea de una vez o construyo y reviso?

Empieza con una porción pequeña de extremo a extremo y luego revisa. Un brief gigante invita a un primer borrador gigante y frágil. Construye la versión más pequeña que demuestre el valor central, verifícala y añade una función a la vez.

### 23. ¿Cómo doy la primera instrucción a la IA sin desviarla?

Indica el objetivo, las restricciones, los archivos o pantallas implicados y cómo verificarás el resultado. Pide un plan primero si la tarea toca más de un archivo. Evita verbos vagos como «mejóralo»; di qué significa «mejor».

### 24. La IA generó un montón de archivos que no entiendo. ¿Es normal? ¿Debo preocuparme?

Es normal, y deberías preocuparte por los pocos archivos que importan: la página de entrada, el modelo de datos, la lógica de autenticación y la configuración de despliegue. No necesitas leer cada línea, pero sí saber dónde están las partes de riesgo y quién puede revisarlas.

### 25. ¿Puede ejecutarse en local? ¿Qué es «localhost» y por qué importa?

Localhost significa que la app se ejecuta en tu máquina y solo tú la ves. Sirve para previsualizar y depurar, pero no es un producto desplegado. Para que otros la usen, debes publicarla en una plataforma de alojamiento y configurar el dominio y los servicios de datos.

### 26. Apareció un muro de errores rojos. ¿Lo pego en la IA o investigo primero?

Pega el error completo, el comando que lo provocó y lo que esperabas. La IA es buena encontrando patrones en trazas, pero necesita el contexto real. Si el mismo error se repite, detente y acota el problema en lugar de dejarla reintentar sin fin.

### 27. ¿Las herramientas cuestan dinero? ¿Hasta dónde llega el plan gratuito para un principiante?

La mayoría tiene un plan gratuito suficiente para un primer prototipo. Los límites suelen aparecer en cuotas de mensajes, despliegues, dominios personalizados o uso. Empieza gratis, aprende el flujo y paga solo cuando el proyecto tenga un usuario real o un coste real de fallo.

### 28. Elegí mal la herramienta o el rumbo. ¿Puedo cambiar a mitad de camino y cuánto cuesta?

Normalmente sí, pero el coste depende de cuánto código y datos específicos de la plataforma tengas. Mantén la lógica y la exportación de datos portables, evita encerrar datos críticos en un formato propietario y cambia antes de que el proyecto sea crítico para producción.

### 29. ¿Existe un «camino mínimo para gente sin código» que produzca una demo?

Sí: elige una herramienta alojada, escribe un brief de una página, genera el flujo funcional más pequeño, pruébalo con un usuario real, arregla los tres problemas principales y publica. No añadas autenticación, pagos ni base de datos hasta que el flujo central los merezca.

## 3. ¿Por qué mi IA construye siempre lo que no quiero?

### 30. La idea es demasiado grande para una sola ejecución. ¿Cómo la divido sin romperlo todo?

Divide por comportamiento visible para el usuario, no por capa técnica. Cada porción debe tener una entrada, una salida y una prueba de aceptación claras. Mantén estables los datos y las interfaces compartidas, y verifica cada porción antes de empezar la siguiente.

### 31. ¿Cómo divido «crear un comercio electrónico» en piezas que la IA pueda construir y recomponer?

Empieza por el catálogo y una página de producto, luego añade carrito, pago, cuentas y pedidos. Define el modelo de datos y los límites entre porciones desde el principio. Cada porción debe poder probarse y desplegarse de forma independiente detrás de una bandera.

### 32. ¿Construyo primero la interfaz o la funcionalidad?

Construye primero el flujo más fino de extremo a extremo: una pantalla, una acción, un dato. Una interfaz bonita sin lógica oculta los riesgos reales. Cuando el flujo funcione, mejora la interfaz y añade casos límite.

### 33. Lo que quería y lo que construyó la IA son distintos. ¿Cómo lo corrijo para que lo entienda?

Muestra la diferencia de forma concreta: una captura, una entrada que falla, la salida esperada. Pide a la IA que reformule el requisito con sus palabras antes de cambiar código. Si sigue fallando, reduce la tarea a un solo comportamiento y pruébalo.

### 34. El mismo bug sobrevive a diez arreglos de la IA y empeora. ¿Cómo salgo del bucle?

Detén el bucle. Pide un diagnóstico escrito, una reproducción mínima y el arreglo más pequeño posible. Si el tercer intento falla, vuelve a la última versión que funcionaba y cambia el enfoque o reduce el alcance.

### 35. ¿Cómo sé que esta versión está «terminada» sin depender de una sensación?

Escribe una lista corta de aceptación antes de construir: las acciones principales, los datos esperados, los estados de error y lo básico de seguridad. Prueba cada punto a mano. Si no sabes describir cómo verificarlo, no está listo.

### 36. La demo funciona, pero se ralentiza con más datos. ¿Es normal y cómo lo arreglo?

Sí. Las demos suelen usar datos en memoria o sin índices. El uso real necesita base de datos, índices, paginación y caché. Pide a la IA que identifique el cuello de botella antes de optimizar y prueba con un volumen de datos realista.

### 37. No puedo leer el código que escribió la IA. ¿Cómo lo mantendré? ¿Me quedaré atrapado?

No necesitas leer cada línea, pero sí ser dueño de la arquitectura, el modelo de datos y el despliegue. Pide a la IA que documente el sistema, guarda el código en un repositorio y exige revisión humana en las partes críticas de seguridad. Si no puedes explicar cómo funciona, no puedes cambiarlo con seguridad.

### 38. Al crecer el proyecto, la IA empieza a olvidar cosas y contradecirse. ¿Cómo evito que se pudra?

Los contextos largos se degradan. Mantén un brief y un documento de arquitectura, abre hilos nuevos para tareas separadas y repite las restricciones importantes. Revisa los diffs y ejecuta las pruebas existentes después de cada cambio.

### 39. ¿Cómo hago que la IA «recuerde» decisiones en vez de empezar de cero cada vez?

Pon las decisiones duraderas en un documento del proyecto (AGENTS.md, ARCHITECTURE.md o un PRD) y señálalo al inicio de cada tarea. Mantén el documento corto y actualizado; un documento obsoleto es peor que ninguno.

### 40. En una conversación larga, la IA olvida lo que dijimos antes. ¿Cómo la traigo de vuelta?

Resume las decisiones y restricciones en un mensaje corto y pide a la IA que las confirme antes de continuar. Para proyectos largos, abre un hilo nuevo con el resumen y los archivos relevantes en lugar de estirar una sola conversación.

### 41. La IA dice «sí» a una función nueva y luego la build se rompe. ¿Cómo lo evito?

Exige un plan y una evaluación de impacto antes de implementar. Pregunta qué archivos e interfaces cambiarán, añade una prueba de regresión para el comportamiento existente e implementa detrás de un cambio pequeño y reversible.

### 42. ¿Cómo dejo un «manual» de lo que construí para poder cambiarlo después?

Escribe un README corto: qué hace, cómo ejecutarlo, dónde viven los datos, cómo se despliega, cuáles son las partes de riesgo y a quién preguntar. Mantenlo junto al código y actualízalo cuando cambie la arquitectura.

### 43. El prototipo está listo. ¿Cómo se lo muestro a amigos y recibo feedback útil?

Dales una tarea concreta que completar, no un «¿qué te parece?» genérico. Pídeles que cuenten qué esperan, dónde se atascan y si el resultado cumple la promesa. Arregla los tres puntos de fricción principales antes de añadir funciones.

### 44. Dicen que mi interfaz es fea. ¿Puede la IA hacerla más bonita?

Sí, si le das una referencia y restricciones. Describe el público, el tono deseado, el diseño y los componentes; pide dos o tres variantes y compáralas. No dejes que una reescritura visual cambie la lógica que funciona.

## 4. Funciona en local: ¿cómo dejo que otros lo usen?

### 45. La demo funciona en mi ordenador. ¿Cómo la hago accesible al mundo?

Despliégala en una plataforma de alojamiento, conecta un dominio, configura variables de entorno y una base de datos, y pruébala desde un dispositivo que no sea el tuyo. «Funciona en mi máquina» es el inicio del despliegue, no el final.

### 46. ¿Necesito alquilar un servidor para desplegar o hay una opción gratuita?

Muchas plataformas ofrecen un plan gratuito para sitios estáticos y apps pequeñas. Los planes gratuitos tienen límites de ancho de banda, minutos de build, bases de datos o dominios personalizados. Empieza ahí y pasa a un plan de pago cuando lleguen usuarios o datos reales.

### 47. ¿Cuál es la diferencia entre «estar online» y «ser usable online»?

«Online» significa que la URL responde. «Usable» significa que la autenticación funciona, los datos persisten, los errores se gestionan, el sitio es suficientemente rápido y puedes recuperarte de un fallo. Prueba el recorrido completo, no solo la portada.

### 48. ¿Dónde deben vivir los datos? Excel no basta: ¿qué es una base de datos?

Una base de datos almacena datos estructurados, gestiona accesos concurrentes y permite consultarlos con seguridad. Para una app pequeña, un Postgres o SQLite alojado es suficiente. Mantén copias de seguridad y no guardes datos de producción solo en una hoja local.

### 49. Los usuarios necesitan registrarse e iniciar sesión. ¿Cómo guardo las contraseñas sin filtrarlas?

Nunca guardes contraseñas en texto plano. Usa un proveedor de autenticación gestionado o una librería bien probada que haga hash, gestione sesiones y permita restablecer contraseñas. Si no estás seguro, no construyas la autenticación tú mismo.

### 50. ¿Qué es un backend y por qué no basta con una interfaz?

El backend gestiona datos, autenticación, permisos, pagos e integraciones. Una app solo de frontend puede parecer completa pero no tiene un lugar seguro para guardar datos ni para hacer cumplir reglas. La mayoría de los riesgos de producción viven en el backend.

### 51. Quiero añadir pagos, mapas y SMS. ¿Puede la IA conectarlos?

Sí, pero estas integraciones implican credenciales, cumplimiento y dinero. Usa el SDK oficial del proveedor y prueba primero en modo sandbox. Mantén los secretos en el servidor, nunca en el navegador, y haz que una persona revise el flujo de pago.

### 52. ¿Qué es una API y por qué no puedo construir un producto real sin ella?

Una API es un contrato que permite a tu app hablar con otro servicio. Pagos, mapas, email, autenticación y modelos de IA exponen APIs. No necesitas memorizar los detalles, pero sí entender claves, cuotas, errores y límites de velocidad.

### 53. Mi sitio no tiene el candado HTTPS. ¿Qué pasa?

Sin HTTPS, el tráfico puede interceptarse y los navegadores avisan a los usuarios. La mayoría de los hosts ofrecen HTTPS automático; actívalo, fuerza la redirección desde HTTP y nunca envíes credenciales o tokens por HTTP plano.

### 54. El despliegue falló con un «build error». ¿Cómo se recupera un principiante?

Lee el primer error, no el último. Revisa el comando de build, las variables de entorno y las rutas de archivos. Pega el log completo en la IA y pide el arreglo más pequeño; si persiste, despliega el último commit que funcionaba y cambia una cosa a la vez.

### 55. ¿Puedo mantener solo un producto desplegado y cuánto esfuerzo requiere?

Puedes mantener un producto pequeño y de bajo riesgo, pero exige trabajo continuo: monitorización, copias de seguridad, actualizaciones de dependencias, parches de seguridad y soporte. Si toca dinero o datos sensibles, planifica ayuda humana antes del lanzamiento, no después de un incidente.

### 56. El sitio se ralentiza al crecer los usuarios. ¿Es culpa mía o de la IA?

Normalmente de ninguno: es un problema de capacidad. Revisa consultas a la base de datos, índices, tamaños de imagen, caché y límites del servidor. Mide antes de optimizar y arregla primero el cuello de botella más grande.

### 57. ¿Cómo subo una demo local sin filtrar secretos?

Usa variables de entorno para los secretos, mantén los archivos `.env` fuera de Git, rota cualquier clave que se haya subido alguna vez y revisa el diff de despliegue. Nunca pegues claves privadas en un chat ni en un bundle del cliente.

### 58. ¿Hay una lista de comprobación previa al lanzamiento que pueda seguir?

Sí: HTTPS, autenticación, permisos, copia de seguridad de datos, monitorización de errores, política de privacidad, términos, límites de velocidad, plan de reversión y una prueba con un usuario real. Si falta algún punto, el producto no está listo para tráfico real.

## 5. Los desastres de IA se suceden: ¿mi proyecto también explotará?

### 59. ¿Hay fallos reales de vibe coding? Dame algunos incidentes de producción

Sí. Los patrones habituales son claves API filtradas, comprobaciones de autorización ausentes, datos de usuarios expuestos y facturas de nube descontroladas. Rara vez vienen de un bug dramático; vienen de saltarse la revisión, dar permisos amplios y poner secretos donde el navegador puede alcanzarlos.

### 60. ¿Cómo ocurren tres desastres de seguridad de IA en una semana?

Normalmente por los mismos huecos: credenciales subidas a un repositorio público, un endpoint de administración sin autorización y una regla de base de datos que confía en el cliente. La IA escribe código plausible rápido, pero no conoce tu modelo de amenazas si no lo explicas.

### 61. ¿Por qué casi la mitad de los programas escritos por IA fallan las pruebas de seguridad y un 15% expone claves?

Porque la seguridad no se ve en una demo. La IA tiende a optimizar el camino feliz, no las entradas adversarias, los límites de permisos ni el manejo de secretos. Añade una revisión de seguridad al flujo en lugar de suponer que «funciona» significa «es seguro».

### 62. ¿Qué es la inyección de prompts y cómo puede un atacante entrar en mi sistema con ella?

La inyección de prompts esconde instrucciones en contenido que el modelo lee: una web, un PDF, un email. Si el modelo también tiene herramientas o credenciales, esas instrucciones pueden desencadenar acciones. Trata todo contenido externo como no confiable, limita los permisos de las herramientas y exige confirmación para operaciones sensibles.

### 63. ¿Qué son RLS y la autorización, y por qué ignorarlos filtra datos de usuarios?

La seguridad a nivel de fila y la autorización deciden quién puede leer o cambiar qué registros. Si la base de datos confía en el cliente o la API solo comprueba «ha iniciado sesión» en vez de «es dueño de este registro», un usuario puede leer los datos de otro. Prueba con dos cuentas, no con una.

### 64. Mi app recoge información personal real. ¿Cómo protejo la privacidad de los usuarios?

Recoge solo lo necesario, cifra en tránsito y en reposo, restringe quién puede acceder y elimina los datos cuando ya no hagan falta. Publica una política de privacidad y conoce qué leyes aplican a tus usuarios. Si no puedes explicar el flujo de datos, no lances.

### 65. Alguien filtró 1,5 millones de claves online. ¿Cómo lo evito?

Nunca hagas commit de secretos, nunca los pongas en código del cliente y escanea el repositorio antes de cada push. Usa variables de entorno y un gestor de secretos, rota las claves con regularidad y asume que cualquier clave que tocó un lugar público está comprometida.

### 66. ¿Puede la IA llamar en secreto a APIs de pago que no quería y quemar mi presupuesto?

Sí, si tiene credenciales y no hay límite de gasto. Pon cuotas duras y alertas en cada proveedor, usa claves sandbox durante el desarrollo y revisa el código en busca de tareas en segundo plano, reintentos y bucles que multipliquen el coste.

### 67. ¿Cómo evito que la IA escriba una contraseña de administrador en el código y deje una puerta trasera?

Prohíbe credenciales hard-codeadas en las reglas del proyecto, exige variables de entorno y revisa cada diff que toque autenticación. Usa un proveedor de autenticación gestionado, haz hash de contraseñas y nunca publiques una cuenta de administrador por defecto.

### 68. ¿Cómo hago una autocomprobación básica de seguridad antes de lanzar sin contratar una agencia?

Prueba autenticación y permisos con dos cuentas, inspecciona la pestaña de red en busca de secretos, comprueba que HTTPS esté forzado, revisa dependencias con vulnerabilidades conocidas, haz copia de la base de datos y lee el OWASP Top Ten. Arregla lo obvio antes de invitar usuarios.

### 69. Me han hackeado o se han filtrado datos. ¿Qué hago primero para limitar el daño?

Revoca claves, saca el servicio comprometido de línea si hace falta, conserva los logs, cambia contraseñas y notifica a los usuarios y autoridades según la ley. No borres pruebas. Después encuentra la causa raíz y arréglala antes de restaurar el servicio.

### 70. ¿Qué no debería entregarse nunca al vibe coding? Casos reales y cuatro errores de principiante

No entregues pagos, autenticación, bases de datos de producción, sistemas de permisos ni nada que no puedas verificar. Los cuatro errores habituales son aceptarlo todo, saltarse la revisión, exponer secretos y creer que una demo que funciona equivale a un producto seguro.

### 71. ¿Qué problemas de copyright y cumplimiento debo conocer al usar código generado por IA?

El código generado por IA puede reproducir patrones con licencia y su procedencia es difícil de probar. Revisa los términos de la herramienta, evita copiar código propietario, conserva las licencias de dependencias y haz que una persona revise todo lo que toque datos regulados o un producto de pago.

### 72. ¿Cómo juzgo si una herramienta de IA es fiable?

Mira quién la gestiona, dónde se almacenan los datos, si entrena con tus entradas, su historial de disponibilidad y seguridad, y si permite exportar y eliminar. Evita plataformas desconocidas que piden permisos amplios de cuenta.

### 73. En un incidente de seguridad, ¿quién es responsable y cómo trata la ley a la gente normal?

La responsabilidad depende del contrato, la jurisdicción y los datos implicados. La persona o empresa que opera el servicio suele cargar con el deber legal y regulatorio. «Lo escribió la IA» no es una defensa. Busca asesoramiento profesional para todo lo que implique pagos, salud o datos personales.

### 74. Dame diez bases de seguridad para creadores sin código

Usa HTTPS, nunca hard-codees secretos, aplica autorización en el servidor, valida entradas, haz hash de contraseñas, haz copias de seguridad, limita el acceso de administrador, monitoriza errores, mantén dependencias actualizadas y ten un plan de reversión. Si no puedes verificar uno de estos puntos, busca ayuda antes de lanzar.

## 6. ¿Qué significa que algo sea «realmente fiable»?

### 75. La app no deja de producir bugs. ¿Cómo hago que la IA escriba menos? La regla 70/30

Usa la regla 70/30: deja que la IA haga código repetitivo, pruebas, documentación y refactorizaciones, mientras los humanos se encargan de arquitectura, lógica compleja, seguridad y revisión. El error es entregar el 95% y preguntarse por qué falta el 5% crítico para la seguridad.

### 76. ¿Qué son las pruebas y cómo puede alguien sin código pedir a la IA que las escriba primero (TDD)?

Una prueba es una comprobación repetible de que un comportamiento sigue funcionando. Pide a la IA que escriba una prueba que falle para el comportamiento, luego implementa hasta que pase. TDD te da una red de seguridad para cambios futuros, aunque no leas cada línea.

### 77. ¿Qué es la «deuda técnica» generada por IA y por qué empeora con el tiempo?

La deuda técnica es el coste extra de un código difícil de cambiar: lógica duplicada, pruebas ausentes, límites poco claros. La IA puede añadirla rápido porque cada parche puede introducir una nueva solución temporal. Págala de forma continua con pequeñas refactorizaciones y pruebas, no con una reescritura heroica.

### 78. ¿Cómo me aseguro de que cada cambio de la IA no rompa lo que ya funcionaba?

Revisa después de cada cambio, ejecuta las pruebas existentes y cambia una cosa a la vez. Mantén una lista de los flujos críticos y vuelve a probarlos después de cada despliegue. Una regresión se detecta más barato al instante que después de una semana de funciones nuevas.

### 79. ¿Cómo doy reglas de proyecto a la IA (CLAUDE.md, ARCHITECTURE.md, bucle plan-review) en lenguaje llano?

Escribe un documento corto del proyecto: stack, estructura de carpetas, convenciones, objetivo actual y acciones prohibidas. Luego usa un bucle plan-review: pide un plan, haz que otro modelo o una persona lo revise y solo entonces implementa. El documento es el contexto que la IA no tiene.

### 80. ¿Cómo acepto el resultado como «suficientemente bueno» para entregarlo?

Define criterios de aceptación antes de construir y pruébalos a mano. Revisa el flujo principal, los estados de error, los permisos, la persistencia de datos y el diseño móvil. «Se ve bien» no es aceptación; «estas cinco comprobaciones pasan» sí lo es.

### 81. Desde la perspectiva de un jefe, ¿cómo juzgo un proyecto externalizado o entregado por IA?

Pide la arquitectura, el flujo de datos, la cobertura de pruebas, la revisión de seguridad y el plan de reversión. Una demo no demuestra casi nada. Una entrega fiable explica qué pasa cuando algo falla y quién es responsable de arreglarlo.

### 82. ¿Cómo debe gestionar un equipo la calidad del código tras adoptar IA?

Trata la salida de la IA como el pull request de un junior: exige revisión, pruebas y una descripción clara. Mide la tasa de defectos, deja los cambios sensibles de seguridad bajo aprobación humana y actualiza las reglas compartidas a medida que evoluciona el código.

### 83. ¿Cómo paso de «la IA escribe y yo adivino» a «yo especifico y la IA sigue»? Cinco patrones de prompt

Usa cinco patrones: especifica objetivo y restricciones; da un ejemplo concreto; pide un plan antes del código; pide el diff más pequeño; y exige un paso de verificación. El patrón importa menos que el hábito de escribir un brief y comprobar el resultado.

### 84. ¿Debe escribir la IA la documentación y los comentarios, o debo hacerlo yo?

Deja que la IA redacte las partes repetitivas, pero tú eres dueño de las decisiones de arquitectura, el runbook y las notas de seguridad. Los comentarios deben explicar por qué, no qué. Si la IA no puede explicar el sistema en lenguaje llano, es señal de que el diseño no está claro.

### 85. El proyecto se ha convertido en un desastre. ¿Hay un procedimiento general de limpieza?

Congela funciones nuevas, escribe el comportamiento actual, añade pruebas para los caminos críticos, elimina código muerto y refactoriza en pasos pequeños. Si el desastre es demasiado profundo, reconstruye la versión mínima que funcione y migra los datos con cuidado.

### 86. ¿Cómo controlo el coste (tokens, cuota, tiempo) y evito la espiral de «más arreglos, más gasto»?

Pon un presupuesto por tarea, usa el modelo más barato que funcione, detén pronto las tareas en bucle y mide el coste de cada iteración. Planifica antes de ejecutar y evita relanzar una tarea fallida sin cambios. El control de coste es un flujo de trabajo, no un cupón.

### 87. ¿Cuándo debo traer a un programador real en vez de seguir insistiendo?

Trae ayuda cuando el producto toque dinero, datos personales, autenticación o disponibilidad, o cuando no puedas entender ni verificar el fallo. Cuanto antes involucres a un profesional, más barato será el arreglo. Esperar a un incidente es la opción más cara.

### 88. ¿Cómo hago copias de seguridad para no perderlo todo de la noche a la mañana?

Sube el código a un repositorio remoto, exporta la base de datos con regularidad, guarda un archivo de una versión que funcione y prueba a restaurar desde la copia. Una copia que nunca has restaurado es una esperanza, no una copia.

## 7. ¿Se sustituirá a los programadores y qué debo hacer?

### 89. ¿Puede el vibe coding sustituir a los programadores? Otra respuesta honesta

Sustituye parte del trabajo, pero no la parte que probablemente imaginas. La IA es buena traduciendo una especificación clara a código; es débil decidiendo qué construir, diseñando un sistema y diagnosticando un incidente en producción. En riesgo están quienes solo traducen especificaciones.

### 90. Si no escribo código, ¿cuál es mi valor central?

Tu valor pasa de teclear código a clarificar problemas ambiguos, describirlos con precisión y juzgar el resultado. Las habilidades escasas son descomposición, verificación y pensamiento sistémico. Se pueden aprender y se acumulan.

### 91. ¿Qué vale más: «describir sistemas» o «escribir código»?

Describir sistemas gana valor, pero solo cuando se combina con criterio. Un ingeniero senior puede dirigir la IA porque sabe cómo es un buen sistema. Un creador sin código puede ganar conociendo al usuario, el dominio y los criterios de aceptación.

### 92. ¿Cómo deben colaborar los programadores con la IA para seguir siendo empleables?

Actúa como arquitecto y revisor, no como mecanógrafo. Pasa de «escribe esta función» a «aquí está el diseño, impleméntalo dentro de estos límites». Revisa la salida de la IA, aprende las herramientas y construye un proyecto completo desde el brief hasta el despliegue.

### 93. Del vibe coding al agentic engineering: ¿cuánto necesita saber alguien sin código?

No necesitas escribir código, pero sí entender tres cosas: cómo es un buen sistema, cómo dar reglas y límites a la IA, y qué pasos exigen aprobación humana. El agentic engineering es supervisión, no abdicación.

### 94. Mi pequeña herramienta está creciendo. ¿Cuándo debo pasarla al «ejército regular»?

Pásala cuando sirva a usuarios reales, toque dinero o privacidad, o necesite estar siempre online. Haz una revisión de seguridad antes de escalar. Entregarla pronto no es un fracaso; es cómo proteges lo que validaste.

### 95. ¿Qué proyectos son aptos para vibe coding y cuáles no debo tocar?

Aptos: prototipos personales, herramientas internas, experimentos de bajo riesgo y cosas que no tocan dinero ni privacidad. Evita: pagos, autenticación, permisos, datos sensibles, servicios de alta disponibilidad y todo lo que no puedas verificar. Ante la duda, busca revisión humana.

### 96. ¿Los niños y estudiantes deben seguir aprendiendo a programar o solo a usar IA?

Deberían aprender ambas cosas: usar IA y entender la lógica. Programar ya no es solo sintaxis; es dirigir un sistema y comprobar su comportamiento. Una comprensión básica de la computación te hace mucho mejor usando IA.

### 97. ¿Cómo será el vibe coding dentro de un año? ¿Es tarde para empezar?

No es tarde, y la dirección importa más que el momento. Los ganadores serán quienes usen bien la IA, no los primeros en llegar. Empieza ahora, construye la intuición para dirigir la IA y mantén un portafolio de proyectos reales.

### 98. Siete consejos honestos para fundadores sin código

Aclara el problema de quién resuelves; escribe un PRD que diga qué no hará el producto; publica la demo más pequeña; usa tu propio producto; pide una revisión de seguridad antes de tocar dinero o privacidad; mantén copias y un runbook; trae profesionales antes de escalar. Cada consejo evita un tipo concreto de retrabajo caro.

### 99. Siete consejos honestos para trabajadores ante la IA

Primero estabilízate: se sustituye a quien solo traduce especificaciones, no a quien piensa y juzga. No compitas con la IA en velocidad de tecleo; compite en descomposición y verificación. Entrega el código repetitivo a la IA, aprende arquitectura y negocio, y construye un proyecto completo que puedas mostrar.

### 100. Palabra final: no necesitas escribir código, pero sí pensar con claridad

Hazlo concreto: divide la idea vaga en pasos que la IA pueda ejecutar, define qué significa «hecho» para cada paso y mantén una comprobación humana donde haya dinero, privacidad o datos de usuarios. Esa es toda la línea entre entender el vibe coding y publicar algo fiable.

