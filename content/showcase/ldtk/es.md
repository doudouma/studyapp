---
name: LDtk
summary: "El editor de niveles 2D que el diseñador principal de Dead Cells construyó al dejar el estudio: gratis, con licencia MIT y deliberadamente limitado."
tags: [Código abierto, Desarrollo de juegos, Editor de niveles, App de escritorio, Gratis]
facts:
  - key: author
    value: Sébastien Benard (deepnight)
  - key: license
    value: MIT · todas las funciones abiertas
  - key: platforms
    value: Windows · macOS · Linux
  - key: downloads
    value: más de 670.000 descargas
    highlight: true
  - key: github
    value: 4,9k estrellas · 323 forks
  - key: version
    value: v1.5.3 · último commit nov. 2026
  - key: built with
    value: Haxe + Electron
  - key: price
    value: Gratis · copia de pago opcional en itch.io / Steam
---

## Un editor gratis de un diseñador

Sébastien Benard fue diseñador principal de Dead Cells en Motion Twin durante años. Lo primero grande que publicó al salir del estudio no fue un juego, sino un editor de niveles, liberado con licencia MIT: LDtk, abreviatura de Level Designer Toolkit.

La frase de la web oficial es poco habitual en una página de herramienta — "un editor de niveles 2D del diseñador principal de Dead Cells, rápido, gratis y de código abierto" — y debajo añade una línea que parece escrita para otros desarrolladores y no para compradores: hecho por un desarrollador de juegos, para desarrolladores de juegos.

Seis años después, las cifras no son de proyecto de fin de semana: unas 4.900 estrellas, más de 670.000 descargas entre todas las versiones y estudios indie que lo usan en producción.

## Hacer menos, pero hacerlo bien

Toda herramienta de este tipo muere igual: acumula funciones hasta que nadie encuentra la que necesita. Tiled, el veterano del sector, sigue siendo el ejemplo que aparece cuando se habla de interfaces recargadas.

LDtk va al revés y lo declara como principio de diseño: hacer menos, pero hacerlo bien. Solo 2D. Solo plataformas y vista cenital, con un "lo sentimos" explícito para quien pida isométrico o pseudo-3D. La lista de funciones no es corta, pero cada punto es algo que un diseñador de niveles toca a diario; nada está ahí para lucir tecnología.

Esa contención viene de haber publicado juegos reales. Nuclear Blaze, el título del propio Benard, se construyó entero en LDtk: primero existió el editor, después un juego comercial demostró si aguantaba.

## Tres decisiones para ir solo

Quien usa LDtk no suele ser un estudio, sino una o tres personas sin programador de herramientas, sin presupuesto y sin tiempo. Tres funciones están pensadas exactamente para eso.

**Exportar tan simple que da vergüenza.** Todo editor nuevo crea el mismo momento incómodo: ahora toca escribir un importador para tu propio motor. LDtk genera unos PNG por nivel más un JSON pequeño, con documentación que se lee en una tarde.

![La vista de mundo: los niveles se organizan como salas, conectadas igual que en el juego final](/showcase/ldtk-1.jpg)

**Reglas de auto-render para la parte aburrida.** Colocar tiles a mano significa elegir la variante de borde correcta en cada esquina de hierba. LDtk te deja definir las reglas visualmente y genera las costuras solo. La idea del autor: que LDtk haga el trabajo aburrido.

**Modo mundo.** Los niveles dejan de ser imágenes sueltas y pasan a ser salas dentro de un mundo, con disposición grid-vania, lineal o libre. Arrastras para reorganizar el mapa y la rueda alterna entre vista de mundo y de nivel. Si la estructura te suena, es el mismo problema que Dead Cells tuvo que resolver.

## Gratis, copia de pago opcional

LDtk es gratis sin puertas: sin versión Pro, sin marca de agua al exportar, sin límite de niveles por proyecto.

Y aun así puedes pagar: está en itch.io y en Steam, y la web pide comprar una copia o hacerse patrocinador si quieres apoyar el trabajo. Lo que recibes es byte por byte el mismo programa. Es el modelo de "paga si te apetece", y solo funciona cuando la herramienta es lo bastante buena como para apetecer.

![Definición de entidades: campos, enums, valores por defecto y cómo se muestra cada entidad en el editor](/showcase/ldtk-2.jpg)

## Una persona, miles de commits

El historial cuenta la forma del proyecto: más de cinco años, miles de commits, decenas de versiones, y un código que sigue moviéndose — el último push fue en noviembre de 2026.

Es Haxe sobre Electron, la misma familia de lenguajes que Dead Cells. Más que casualidad, es la constancia de que cada uno construye herramientas con lo que ya domina.

Lo que más merece leerse es la sección de copias de seguridad de la portada: viene a decir que saben que pasan cosas malas, que LDtk guarda copias sólidas y puede recuperar cambios sin guardar tras un cierre inesperado — no debería cerrarse solo, pero el mundo no es perfecto. Es una actitud concreta hacia el trabajo ajeno, del tipo que solo escribe quien ha perdido trabajo.

![Pantalla de inicio de LDtk 1.5 — la versión que estrenó el logo actual y las herramientas de disposición de mundo](/showcase/ldtk-3.jpg)

## Por qué está aquí

LDtk no es un producto de IA, y esta biblioteca no solo recoge productos de IA. Está aquí porque es la otra mitad de la misma pregunta: ¿qué publica hoy una persona con experiencia, buenas herramientas y ninguna empresa detrás?

La respuesta es una herramienta que le quita un coste a todos los demás. Un editor de niveles decente son meses de trabajo que un desarrollador solo no puede permitirse construir ni permitirse evitar. LDtk pone ese coste a cero, y sigue publicando.
