---
title: 100 preguntas sobre GitHub
summary: Desde si merece la pena aprenderlo y los primeros pasos sin código hasta los errores habituales, encontrar y ejecutar proyectos, portafolios y contribución open source — 100 preguntas para que una persona normal use GitHub.
tags: [GitHub, Git, Open Source, Portafolio, Guía temática]
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
    value: GitHub / Git / colaboración open source
  - key: Para quién
    value: Personas sin código / estudiantes / buscadores de empleo / creadores
  - key: Actualizado
    value: 2026-11-01
---

## Prefacio

Esta es una guía de «100 preguntas»: una forma de dividir un tema grande en preguntas y leerlo después una por una.

GitHub no es solo un repositorio de código para programadores. Puede guardar trabajo, alojar un portafolio, servir un sitio estático, apoyar la colaboración open source, gestionar escritura e incluso ejecutar tareas programadas con Actions. La guía sigue seis etapas: decidir si aprenderlo, empezar sin línea de comandos, evitar los errores dolorosos, encontrar y ejecutar proyectos, guardar y mostrar tu trabajo y decidir hasta dónde llegar.

**Respuestas rápidas**

- Merece la pena aprenderlo, pero trátalo como un espacio duradero para guardar, mostrar y colaborar, no como un montón de comandos Git.
- El primer día usa la web o GitHub Desktop y haz un commit real antes de tocar la línea de comandos.
- Lee el README antes de ejecutar un proyecto; si es demasiado técnico, pide a la IA que lo explique.
- Nunca subas claves, contraseñas o números de identidad. Si uno se sube, revócalo y rótalo primero.
- Decide si necesitas almacenamiento, portafolio, colaboración o automatización. Cada objetivo exige una profundidad distinta.

> Compilado a partir de la documentación de GitHub y material público, estructurado y ligeramente completado para este sitio.

> Esta es una edición editada: algunos pasajes originales estaban truncados por OCR, así que el cuerpo se centra en una lista de preguntas accionable con respuestas concisas.

## 1. ¿Merece la pena aprenderlo? ¿Llego tarde?

### 1. La IA es muy fuerte. ¿Sigue teniendo sentido aprender GitHub si no programo?

Sí. La IA genera código, pero GitHub es donde el trabajo se guarda, revisa, versiona, comparte y muestra. Es la capa de colaboración y evidencia.

### 2. Dicen que GitHub es cosa de programadores. ¿Qué aporta a una persona normal?

Guardar archivos con seguridad, publicar un portafolio, alojar un sitio estático, seguir proyectos, aprender de open source y colaborar en escritura o investigación.

### 3. Dicen que GitHub es un segundo currículum. ¿De verdad alguien consigue una oferta por su perfil?

Sí, pero el perfil importa porque muestra evidencia: proyectos, contribuciones, constancia y comunicación. Un perfil solo no garantiza una oferta; hace verificables tus afirmaciones.

### 4. Empiezo tarde. ¿Estoy demasiado lejos para alcanzar?

No. La mayoría nunca empieza. Un registro público pequeño y constante vale más que un perfil perfecto que no existe.

### 5. Mi empresa no lo exige y mi escuela no lo enseñó. ¿Por qué dedicarle tiempo?

Porque es un lugar duradero para tu trabajo y un lenguaje compartido para colaborar. También te obliga a organizar, documentar y publicar.

### 6. Otros perfiles parecen impresionantes. ¿Pareceré tonto como principiante?

Solo si finges ser experto. Un README claro, un proyecto pequeño que funciona y notas honestas se ven mejor que un perfil vacío o trabajo copiado.

### 7. Dicen que GitHub engancha. ¿Quién acaba coleccionando y sin usar nada?

Quien convierte estrellas y marcadores en el objetivo. Usa GitHub para ejecutar, hacer fork o contribuir a algo, no solo para coleccionar enlaces.

### 8. Si solo uso herramientas de IA, ¿qué capacidad clave me faltará?

Versionar, revisar, colaborar y publicar. La IA escribe código, pero sin repositorio pierdes historial, reproducibilidad, revisión y contexto compartido.

### 9. ¿Aprender GitHub es memorizar un montón de comandos Git?

No. Puedes empezar con la web o GitHub Desktop. Aprende luego los pocos comandos que uses: status, add, commit, push, pull.

### 10. Hay muchos recursos gratuitos. ¿En qué se diferencia GitHub de un curso?

Los cursos enseñan; GitHub es donde viven los proyectos reales y donde puedes inspeccionarlos, ejecutarlos y contribuir. Es un entorno de trabajo.

### 11. Para un portafolio, ¿por qué GitHub es mejor que un currículum en PPT?

Un repositorio se puede abrir, ejecutar e inspeccionar. Muestra el trabajo, el historial y la documentación; una presentación solo lo describe.

### 12. Todos dicen que aprenda, pero temo perder el tiempo. ¿Cómo decido?

Si necesitas guardar trabajo, mostrar evidencia, colaborar o publicar un sitio, vale la pena. Si solo necesitas preguntar a la IA, puedes posponerlo.

### 13. GitHub tiene modelos de IA gratuitos. ¿Qué relación tiene conmigo?

Muchos proyectos de IA publican modelos, demos y APIs en GitHub. Puedes probarlos, ejecutarlos localmente o conectarlos a tus herramientas.

### 14. ¿Qué beneficios concretos obtiene una persona sin código de GitHub?

Un archivo seguro, un portafolio público, un sitio estático gratis, una forma de seguir y ejecutar herramientas y un camino a la contribución open source sin escribir mucho código.

## 2. Primer día sin código: cómo usarlo sin la línea de comandos

### 15. Un repositorio está lleno de botones en inglés. ¿Cuáles miro primero?

La lista de archivos, el README, el botón verde Code, Issues y Releases. Cubren leer, descargar, ejecutar y preguntar.

### 16. ¿Puedo subir algo solo con la web, sin Git ni comandos?

Sí. Crea un repositorio, usa «Add file» o arrastra archivos al navegador, escribe un mensaje de commit y guarda. Eso es un commit real.

### 17. ¿Qué hace el botón verde Code y por qué confunde a los principiantes?

Ofrece opciones de descarga: clonar por HTTPS o SSH, abrir con GitHub Desktop o descargar un ZIP. Para una primera mirada, Download ZIP es lo más simple.

### 18. Star, Watch y Fork: ¿qué diferencia hay y puedo romper algo?

Star es un marcador, Watch envía notificaciones y Fork copia un repositorio a tu cuenta. Ninguno cambia el proyecto original.

### 19. Dicen «haz Fork y luego cambia». ¿Fork es una copia o un vínculo?

Es una copia en tu cuenta con un vínculo al original. Puedes cambiar tu fork sin afectar la fuente y abrir un pull request para proponer cambios.

### 20. Quiero el proyecto de otra persona en mi cuenta. ¿Clonar o Fork?

Fork si quieres tu copia en GitHub y un camino para contribuir. Clonar si solo quieres una copia local para ejecutar o inspeccionar.

### 21. ¿Puedo editar código online con una tecla, sin instalar nada?

Sí. Pulsa `.` en la página de un repositorio para abrir github.dev, un editor en el navegador. Sirve para ediciones pequeñas y leer código.

### 22. ¿Puedo saltarme configurar nombre y email de Git? ¿Qué pasa?

No lo hagas. Los commits usan esa identidad y GitHub atribuye las contribuciones a tu cuenta. Usa el mismo email de GitHub.

### 23. Las claves SSH fallan con «permission denied». ¿Qué paso está mal?

Normalmente la clave pública. Copia el archivo `.pub` completo, de `ssh-` al final, en GitHub. Nunca compartas la privada. Prueba con `ssh -T git@github.com`.

### 24. GitHub va lento en China. ¿Hay formas de acelerarlo sin VPN?

Prueba un archivo hosts mantenido como GitHub520, un dominio espejo o un proxy configurado en Git. Evita espejos no confiables para repositorios privados.

### 25. No recibí el correo de verificación de GitHub. ¿Qué más puedo hacer?

Revisa spam, confirma la dirección, reenvía desde Settings → Emails y evita correos temporales. Si falla, usa otro buzón fiable.

### 26. Antes de mi primer commit, ¿GitHub Desktop o línea de comandos?

Usa GitHub Desktop o la web el primer día. Aprende la línea de comandos cuando necesites velocidad, scripting o trabajo por lotes.

### 27. ¿Por qué todos dicen que lea el README primero? ¿Qué pasa si no?

El README explica qué es el proyecto, cómo instalarlo, cómo ejecutarlo y qué cuidar. Saltarlo suele significar descargar la versión equivocada o perder un paso obligatorio.

### 28. Quiero guardar un proyecto que me gusta. ¿Star o una lista propia?

Star para un marcador rápido. Una lista propia cuando tengas muchos y necesites categorías. Añade una nota de por qué lo guardaste.

### 29. Las ramas suenan avanzadas. ¿Las necesito el primer día?

No. El primer día puedes trabajar en la rama principal. Aprende ramas cuando empieces a cambiar el proyecto de otra persona o a probar dos ideas a la vez.

### 30. Quiero subir una carpeta local por primera vez. ¿Cuáles son los comandos mínimos?

`git init`, `git add .`, `git commit -m "first commit"`, `git remote add origin <url>`, `git push -u origin main`. Si es demasiado, usa GitHub Desktop.

### 31. ¿Para qué sirven Issues, Pull requests y Actions?

Issues rastrean bugs, ideas y preguntas. Pull requests proponen cambios. Actions ejecuta tareas automáticas como tests o despliegues. El primer día solo los lees.

### 32. ¿Puedo poner GitHub en chino? ¿Eso hará más difícil seguir tutoriales en inglés?

GitHub tiene localización limitada. Puedes usar la traducción del navegador, pero mantén los términos clave en inglés para que los tutoriales sigan teniendo sentido.

### 33. ¿Cuál es la diferencia entre un repositorio y un proyecto?

Un repositorio es el almacenamiento y el historial de archivos. Un «proyecto» es un esfuerzo más amplio; GitHub Projects es un tablero que enlaza issues y pull requests.

### 34. ¿Editar un archivo en la web cuenta como commit? ¿En qué se diferencia de uno local?

Sí, crea un commit en el servidor. Un commit local ocurre en tu máquina y se sube después; el historial es el mismo, el flujo cambia.

## 3. ¿Por qué me atasco en cuanto lo uso?

### 35. Push dice que la autenticación con contraseña se eliminó. ¿Por qué no funciona mi contraseña?

GitHub ya no acepta contraseñas de cuenta por HTTPS. Usa un token de acceso personal, SSH o GitHub Desktop, que gestiona la autenticación.

### 36. Subí por accidente una clave, contraseña o número de identidad. ¿Cómo lo borro del todo?

Revoca y rota el secreto primero. Luego quítalo del historial con git-filter-repo o BFG, fuerza el push y avisa a quien tenga acceso. Un commit nuevo no lo borra del historial.

### 37. Mi .gitignore estaba mal y subí archivos basura. ¿Cómo lo arreglo?

Añade los archivos a `.gitignore`, quítalos del índice con `git rm --cached`, haz commit y push. Si contienen secretos, rótalos y limpia el historial.

### 38. Mis mensajes de commit son «fix» y «update». ¿Puedo hacerlos útiles?

Usa un resumen imperativo corto y un cuerpo que explique por qué. Para historial no publicado, puedes hacer amend o squash; si ya lo publicaste, prefiere commits nuevos claros.

### 39. Quiero deshacer mi último commit. ¿Reset, revert o checkout?

Usa `revert` para deshacer un commit público de forma segura. Usa `reset` solo para historial local no compartido. `checkout` sirve para cambiar archivos o ramas, no para reescribir historial.

### 40. Una fusión produjo un muro de `<<<<<<<`. ¿Qué son?

Marcan versiones en conflicto de las mismas líneas. Edita el archivo para quedarte con el contenido correcto, borra los marcadores y haz add y commit.

### 41. ¿`git add` debe añadir un archivo o todo el directorio? ¿Cómo deshago un error?

Añade solo lo que pertenece al commit. Si añadiste de más, usa `git restore --staged <file>` para desmarcarlo. Revisa `git status` antes de commitear.

### 42. ¿Por qué necesito commit después de add? ¿Qué hace el staging?

El staging selecciona lo que va al siguiente commit. Permite revisar y separar cambios, para que un commit contenga un cambio coherente.

### 43. ¿Qué significan los archivos rojos y verdes en `git status`?

Rojo significa no rastreado o modificado sin preparar. Verde significa preparado para commit. Lee las etiquetas; indican qué incluirá el siguiente commit.

### 44. Cometí un error y no quiero dejar registro de deshacer. ¿Hay forma limpia?

Para un commit no publicado, amend o reset y recommit. Para uno publicado, no reescribas el historial público; haz un commit correctivo o coordina con el equipo.

### 45. Dos personas cambiamos el mismo archivo y mis cambios se sobrescribieron. ¿Cómo lo evito?

Haz pull antes de empezar, trabaja en una rama, commitea a menudo y abre un pull request. Resuelve conflictos explícitamente en vez de hacer force-push.

### 46. Sigo un tutorial pero me atasco en el primer push. ¿Cuáles son los tres puntos habituales?

Autenticación, URL remota y nombre de rama. Revisa el token o la clave SSH, confirma `git remote -v` y haz push a la rama que existe.

### 47. Pull dice «unrelated histories». ¿Qué significa?

Los repositorios local y remoto no comparten un ancestro. Fusiona con `--allow-unrelated-histories` solo si estás seguro, o empieza desde un clon limpio.

### 48. Push se rechaza, pull crea conflictos y estoy en un bucle. ¿Cómo salgo?

Haz fetch, inspecciona la divergencia y luego merge o rebase con intención. Si es una rama personal, resetea al remoto y reaplica tus cambios; nunca hagas force-push a una rama compartida.

### 49. Cloné un directorio vacío aunque la web tiene archivos. ¿Por qué?

Puede que hayas clonado otra rama, otra URL o un repositorio con archivos en un submódulo o release. Revisa la rama por defecto y la URL.

### 50. Un repositorio da 404 o acceso denegado. ¿Me bloquearon o la URL está mal?

Revisa la URL, si el repositorio es privado y si has iniciado sesión. Un repositorio privado da 404 a quien no tiene acceso.

### 51. Borré .git, perdí una rama o edité la rama equivocada. ¿Cómo recupero?

Revisa el reflog y las ramas remotas primero. Si .git desapareció, clona de nuevo y recupera archivos sin commit desde backups o el historial del editor.

## 4. ¿Cómo encuentro buenos proyectos, los juzgo y los ejecuto?

### 52. Quiero una herramienta usable. ¿Cómo busco en GitHub mejor que en un buscador general?

Busca por problema, no por nombre. Usa la búsqueda de GitHub, filtra por lenguaje, estrellas y actualización reciente, y lee el README de los primeros resultados.

### 53. ¿Por qué añadir «awesome» a la búsqueda encuentra listas valiosas?

Las listas «awesome» son colecciones curadas de enlaces sobre un tema. Te ahorran revisar repositorios al azar.

### 54. ¿Basta el número de estrellas para juzgar un proyecto? ¿Qué más miro?

No. Revisa commits recientes, issues abiertos, actividad de mantenedores, documentación, licencia y si resuelve tu problema.

### 55. ¿Cómo sé si un proyecto está vivo o abandonado?

Mira el último commit, release y actividad de issues. Un proyecto sin actualizaciones durante un año y con issues sin responder suele estar abandonado.

### 56. El README es demasiado técnico. ¿Hay una lectura rápida para personas normales?

Lee la primera sección, los pasos de instalación, el ejemplo de uso y la solución de problemas. Salta la arquitectura salvo que vayas a modificarlo.

### 57. Quiero ejecutar un proyecto. ¿Qué sección del README leo primero?

Requisitos e instalación, luego uso. Comprueba el sistema operativo y las versiones soportadas antes de instalar.

### 58. ¿Qué son `npm install` y `pip install`? Me da miedo ejecutarlos.

Instalan las dependencias del proyecto. Son normales, pero ejecútalos en una carpeta de confianza, idealmente en un entorno virtual o contenedor.

### 59. El comando de instalación falla en mi equipo. ¿Qué suele estar mal?

Versión de runtime incorrecta, dependencia del sistema ausente, problema de ruta o de permisos. Lee el primer error y compara tu entorno con los requisitos.

### 60. ¿Puedo cambiar github por deepwiki en la URL para obtener documentación en lenguaje llano?

Algunos repositorios tienen documentación generada en DeepWiki, pero no todos. Puede ayudar a entender, pero verifica los detalles importantes en la fuente.

### 61. No entiendo el código. ¿Es fiable pegar el README en la IA y pedir explicación?

Sirve para orientarte, pero la IA puede omitir detalles o inventar. Úsala para formular preguntas y luego comprueba README y código.

### 62. Un proyecto se descarga a 20 KB/s. Además de esperar, ¿cómo acelerarlo?

Usa un espejo de descarga, un proxy configurado para Git o descarga el ZIP de un release en vez de clonar todo el historial.

### 63. El proyecto pide una API key. ¿Dónde la consigo y es segura?

En el proveedor oficial, nunca en un repositorio aleatorio. Guárdala en una variable de entorno, no la subas y pon límites de gasto.

### 64. ¿Puedo probar un proyecto en el navegador o en el móvil sin montar un entorno local?

A veces. Busca una demo, una versión alojada, GitHub Pages o un cuaderno en la nube. Si no existe, normalmente hace falta un entorno local.

### 65. El proyecto lanza un muro de errores rojos. ¿Es el proyecto o mi entorno?

Comprueba si el error es de runtime o paquete faltante (tu entorno) o un traceback de lógica (el proyecto o un escenario no soportado). Busca el mismo error en Issues.

### 66. Releases o descargar el código: ¿qué elige una persona normal?

Releases para un paquete listo para usar. El código fuente solo si quieres leer, modificar o compilar.

### 67. No quiero tocar código. ¿Cómo elijo una versión lista para usar?

Mira los assets de Releases, elige la build para tu sistema operativo y prefiere una versión reciente con instrucciones claras.

### 68. ¿Cómo distingo un proyecto de IA hype de uno realmente útil?

Comprueba si el README tiene instalación y uso reales, si el proyecto se actualiza y si los Issues muestran uso real o solo «no arranca».

### 69. Colecciono buenos proyectos pero nunca los abro. ¿Cómo creo el hábito de usarlos?

Elige un proyecto que necesites hoy, sigue un paso del README y úsalo o bórralo de la lista. Una lista pequeña con notas vale más que una colección enorme sin abrir.

## 5. ¿Cómo guardo mi trabajo, lo muestro y contribuyo al open source?

### 70. ¿Qué debe contener mi primer repositorio? ¿Un repositorio vacío se ve mal?

Pon una nota real, un registro de estudio o un pequeño proyecto de práctica. Un repositorio vacío se ve peor que uno simple y honesto.

### 71. ¿Cómo escribo un README fácil de entender sin saber diseño?

Usa una estructura simple: nombre, descripción en una línea, funciones, instalación, uso y contacto. GitHub renderiza Markdown; previsualiza antes de guardar.

### 72. Markdown tiene mucha sintaxis. ¿Qué necesito para un README?

Aprende títulos, negrita, listas, enlaces, imágenes y bloques de código. Cubre casi todos los README que escribirás.

### 73. Quiero subir código pero temo que sea malo. ¿Cómo empaqueto mi primer repositorio?

No te preocupes por las burlas. Un README claro, instrucciones que funcionan y un alcance honesto bastan. Todos empiezan en algún sitio.

### 74. ¿Qué es GitHub Pages y cómo convierto un repositorio en página personal o currículum?

Pages es alojamiento estático gratis. Pon un `index.html` en un repositorio, activa Pages en Settings y tu sitio aparece en `usuario.github.io/repo`.

### 75. ¿Necesito servidor y dominio para Pages? ¿Basta para una persona normal?

No. Pages incluye alojamiento y un dominio `github.io`. Solo admite sitios estáticos, suficiente para currículum, portafolio o documentación.

### 76. ¿Cómo hago que mi página aparezca cuando un reclutador busca mi nombre?

Pon el enlace en currículum, redes y firma de email. Mantén repositorios documentados y activos; el ranking sigue al contenido real y encontrable.

### 77. ¿Cómo dejo mi perfil de GitHub presentable con estadísticas o plantillas en diez minutos?

Busca una plantilla de README de perfil, cópiala, cambia los datos y haz commit. Las tarjetas leen tu actividad pública, así que sigue contribuyendo.

### 78. Quiero ayudar a un proyecto open source pero no sé programar. ¿Qué puedo aportar?

Documentación, traducciones, pasos más claros, reportes de bugs, diseño, tutoriales y responder a nuevos usuarios.

### 79. ¿Corregir erratas y documentación cuenta como contribución? ¿Los autores lo agradecen?

Sí. Las contribuciones de documentación son de las más fáciles de aceptar y suelen agradecerse explícitamente.

### 80. ¿La etiqueta «good first issue» es para principiantes? ¿Cómo la uso?

Sí. Marca tareas pensadas para nuevos. Lee el issue, pregunta dudas, sigue la guía de contribución y mantén el cambio pequeño.

### 81. Quiero reportar un bug o sugerir una mejora. ¿Cómo escribo un Issue que no sea ignorado?

Título claro, pasos de reproducción, comportamiento esperado y real, versiones y logs. Busca issues existentes y usa uno por problema.

### 82. ¿Qué es un Pull Request y en qué se diferencia de editar archivos directamente?

Un PR propone cambios desde tu rama o fork al repositorio destino. Añade revisión, discusión y CI antes de fusionar.

### 83. Mi primer PR fue rechazado. ¿Significa que no valgo?

No. Es normal: puede estar fuera de alcance, necesitar tests o chocar con el plan del mantenedor. Lee el feedback e itera.

### 84. ¿Cuál es la diferencia entre Discussions e Issues? ¿Dónde hablo?

Issues son para bugs y tareas accionables. Discussions para preguntas abiertas, ideas y conversación. Sigue la guía del proyecto.

### 85. ¿Puedo usar GitHub para gestionar escritura, notas e investigación? ¿Es mejor que la nube?

Sí. Tienes historial, diffs, issues, colaboración y texto portable. Es mejor para trabajo estructurado y cambiante que para archivos binarios grandes.

### 86. GitHub Actions ejecuta tareas automáticamente. ¿Para qué sirve a una persona normal?

Copias programadas, publicar un sitio estático, ejecutar tests, generar informes y sincronizar contenido. Empieza con una plantilla y permisos estrechos.

### 87. ¿Puede Copilot CLI ayudarme a operar GitHub sin escribir código?

Sí. Sugiere y explica comandos en lenguaje natural y pide confirmación antes de ejecutarlos. Útil cuando no recuerdas el comando exacto.

### 88. ¿Puedo usar GitHub + jsDelivr como alojamiento de imágenes y CDN gratis para mi blog?

Sí, con cuidado: el repositorio debe ser público, no subas imágenes privadas y mantenlo pequeño. Sirve para imágenes ocasionales, no como almacenamiento ilimitado.

### 89. ¿De verdad se puede ganar dinero con GitHub Sponsors?

Algunos mantenedores sí, y GitHub no cobra comisión. Requiere un proyecto con usuarios reales y contribución sostenida. Es apoyo al trabajo continuo, no un atajo.

## 6. ¿Hasta dónde llegar o dónde parar?

### 90. Después de lo básico, ¿aprendo ramas o colaboración primero?

Elige por objetivo. Releases para publicar, Pages para mostrar, Actions para automatizar y colaboración para trabajar con otros. Las ramas se aprenden en un PR real.

### 91. ¿Qué revisa realmente un Code Review y cómo evito que me critiquen?

Revisa lógica, casos límite, bugs, rendimiento, nombres y claridad. Mantén PR pequeños, responde a los comentarios y trátalo como coaching gratuito.

### 92. ¿Sirven los tableros de Projects para gestionar proyectos? ¿En qué superan a Excel?

Sí. Enlazan issues y pull requests, muestran estado, responsables, fechas y prioridad. Los datos siguen en Issues/PRs, sin duplicar.

### 93. Actions para builds y despliegues suena avanzado. ¿Debo tocarlo ahora?

Sí, pero empieza con plantillas. Úsalas para copias programadas o publicación automática. Aprende el interior cuando tengas una necesidad real.

### 94. ¿Qué problemas resuelven las «variables» y la «caché» de Actions?

Las variables evitan repetir el mismo valor en varios flujos. La caché evita reinstalar dependencias en cada ejecución.

### 95. ¿Qué atajos y trucos de la paleta de comandos debo aprender el primer día?

Aprende `?` para atajos, navegación `G`, `t` para buscar archivos, `y` para enlace permanente y `.` para el editor web. La paleta es el recurso cuando olvidas un atajo.

### 96. ¿Qué hace pulsar «y» para crear un enlace permanente y por qué no compartir la URL actual?

Una URL normal apunta a una rama, que cambia. Pulsar `y` sustituye la rama por un ID de commit, así el enlace es estable. Úsalo al compartir código.

### 97. ¿Pueden las tarjetas al pasar el ratón mostrarme qué es un enlace sin abrirlo?

Sí, en GitHub Docs. Pasa el ratón o pulsa Alt/Opción + Arriba sobre un enlace para previsualizar el artículo; Enter para seguir, Esc para cerrar.

### 98. ¿Cómo configuro alias de Copilot CLI y cuánto tipeo ahorran?

Usa `gh copilot alias` para generar alias como `ghcs` para suggest y `ghce` para explain. Añade la línea eval generada a tu shell; no escribas un alias plano.

### 99. ¿Cuánto es «suficiente»? ¿Qué áreas profundas puede saltarse una persona normal?

Suficiente es guardar trabajo, leer un README, ejecutar un proyecto, abrir un PR y publicar una página. Puedes saltarte internals avanzados de Git, Actions complejas y tooling de monorepo.

### 100. ¿Qué no resuelve GitHub y dónde es mejor una herramienta especializada?

No es un disco en la nube, un editor colaborativo en tiempo real, una herramienta de diseño ni una suite completa de gestión de proyectos. Úsalo para trabajo versionado, textual y colaborativo.

