---
summary: "Una app de bandeja de Windows de código abierto que escucha los gritos nocturnos e interrumpe a los jugadores ruidosos para mantener la casa en silencio."
tags: [Monitorización de audio, App de escritorio, Código abierto, Control parental, Creado con Claude]
facts:
  - key: author
    value: u/omricn
  - key: platforms
    value: Windows
  - key: version
    value: v1.1.0
    highlight: true
  - key: price
    value: Gratis (código abierto)
  - key: offline
    value: 100% local (sin almacenar audio)
---

## Qué es

[S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) (Sound Trigger Focus Utility) es una utilidad de bandeja del sistema de Windows de código abierto diseñada para frenar los gritos involuntarios de madrugada de los jugadores que usan auriculares. Creada por el desarrollador u/omricn con Claude Code, la app monitoriza de forma continua la entrada del micrófono en local, diferencia el habla normal de un grito a todo volumen mediante una calibración personalizada y fuerza interrupciones inmediatas en el escritorio cuando se supera el umbral de volumen.

## Propuesta de valor

La herramienta sustituye el regaño verbal o el corte de red por un bucle de retroalimentación inmediato, determinista y acordado de antemano:

- **Calibración adaptativa en 3 pasos**: al primer arranque, la app pide al usuario que se quede callado, hable con normalidad y grite, estableciendo así un rango dinámico de referencia preciso.
- **Penalizaciones escalonadas**: el primer grito minimiza el juego activo, reproduce un efecto de sonido y muestra un popup a pantalla completa imposible de saturar con un botón de cierre móvil que exige 4 clics; las siguientes infracciones mandan al usuario directamente al escritorio durante 10 segundos.
- **Ajustes y auditoría protegidos con PIN**: los cambios de umbral, la programación y los interruptores de encendido requieren un PIN configurado por el padre, respaldado por un gráfico de incidencias que registra cada evento.
- **Procesamiento local centrado en la privacidad**: calcula la sonoridad RMS cada 20 ms y descarta los búferes de audio al instante, sin grabar, almacenar ni transmitir telemetría.
- **Franjas horarias programadas**: añadidas en la v1.1.0, permiten a los padres definir ventanas activas concretas para que el juego diurno normal no se vea afectado.

## Qué puede reemplazar

| Software objetivo | Viabilidad | Veredicto y contexto de uso |
| --- | --- | --- |
| Suites comerciales de control parental | Moderada | Mejor para imponer límites de ruido concretos sin espionaje intrusivo ni suscripciones. |
| Caídas de paquetes / cortes de Wi-Fi a nivel de router | Alta | Mucho más quirúrgico; evita la rabia por lag y mantiene internet para tareas silenciosas. |
| Plugins de puerta de ruido / cables de audio virtuales | Baja | Los cables virtuales solo cortan o silencian la voz de salida en Discord en lugar de sancionar el grito físico. |
| Sonómetros de hardware | Parcial | Elimina las luces de alerta físicas montadas en la pared en favor de la interrupción directa a nivel de sistema. |

## Realidades y limitaciones actuales

- **Vulnerabilidades de elusión**: como señalan miembros de la comunidad, los usuarios pueden apagar el interruptor físico del micrófono antes de gritar o engañar la calibración soplando al micrófono.
- **Exclusividad de SO**: actualmente limitado a entornos de escritorio Windows; no admite consolas como PlayStation o Xbox.
- **Síntoma conductual vs. causa raíz**: el desarrollador reconoce que enseña a los jugadores a gritar más bajo en lugar de abordar la autorregulación emocional nocturna.
- **Interrupción de partidas cooperativas**: minimizar el juego o expulsar al jugador al escritorio en títulos multijugador competitivos (p. ej., ranked) también perjudica a los compañeros.

## Veredicto

> **Recomendación principal**
> [S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) es una utilidad ingeniosa y deliciosamente mezquina que funciona mejor como un "contrato social" explícito que como spyware encubierto. Si tu hogar sufre arrebatos de medianoche inducidos por auriculares durante maratones de juego en vacaciones, ofrece retroalimentación pavloviana instantánea sin ningún compromiso con la privacidad de los datos.

## Ciclo de desarrollo e iteración

El desarrollador creó la utilidad con Claude Code para convertir rápidamente una molesta fricción doméstica en una herramienta publicable en una sola noche. La retroalimentación de la comunidad marcó de inmediato el ritmo de las versiones.

| Etapa | Modelo / Herramienta | Enfoque |
| --- | --- | --- |
| Arquitectura inicial y UI | Claude Code | Arnés de bandeja de Windows, sondeo de sonoridad cada 20 ms, colocación dinámica del botón |
| Versión v1.0.0 | Claude Code | Panel bloqueado con PIN, visualizador de historial de disparos, asistente de calibración |
| Parche v1.1.0 | Claude Code | Integración de franjas programadas de monitorización activa/pasiva según sugerencias de Reddit |

## Métricas y monetización

- **Precio**: 100% gratis y de código abierto en un repositorio público de GitHub.
- **Adopción**: más de 3600 upvotes y 700+ comentarios en semanas desde su publicación en Reddit.
- **Monetización**: ninguna; se distribuye solo como utilidad comunitaria y escaparate del desarrollador.

## Recepción de la comunidad y debates clave

El post generó intensos debates sobre filosofía de crianza y estilos de escritura de IA:

- **Ingeniería vs. crianza tradicional**: los comentaristas se dividieron entre quienes elogiaban la solución como "crianza heroica y compasiva mediante consecuencias naturales" y quienes la criticaban como un "collar eléctrico digital" para padres reacios a confiscar consolas.
- **Tácticas troll alternativas**: administradores de sistemas veteranos y padres compartieron tácticas de represalia heredadas, como configurar los puntos de acceso para descartar aleatoriamente el 30% de los paquetes de las consolas o revocar los alquileres DHCP del router a medianoche.
- **Detección de clichés de escritura de IA**: varios comentaristas señalaron la dependencia del post de marcadores estilísticos típicos de Claude —sobre todo la frase "load-bearing"—, lo que desató un meta-debate sobre si los desarrolladores ya escriben de forma natural con la cadencia de las LLM con las que colaboran.
