---
slug: lemo-opuscar
name: Lemo-Opuscar
summary: Un Skill open source pour Claude Code qui organise les vidéos faites avec le code d'Opus 5.5 en 66 styles prêts à l'emploi — chaque style est un prompt réutilisable plus un film de démo réalisé, dessiné et musiqué entièrement en code.
category: tools
tags: [Claude Code, Skill, Vidéo IA, Motion Design, Open Source, Opus 5.5]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Lemomo
externalUrl: https://github.com/lemomo-ai/lemo-opuscar
facts:
  - key: styles
    value: 66 styles prêts à l'emploi · 11 catégories (59 à la publication de l'article)
    highlight: true
  - key: stars
    value: 14,5K (au 10-11-2026)
  - key: license
    value: MIT · gratuit et open source
  - key: how it's made
    value: Image et musique générées par Opus 5.5 en code · voix TTS · sans modèles de vidéo
  - key: runtime
    value: Environ 30–60 minutes par film · tokens pas vraiment légers
  - key: requires
    value: Node 20+ · ffmpeg · Python 3.11+
  - key: install
    value: Plugin Claude Code (marketplace lemolab)
sources:
  - title: 这个Skill，让你轻松做59种视频风格，助你涨粉上万 (Le Skill qui rend faciles 59 styles de vidéo)
    url: https://mp.weixin.qq.com/s/Yc129owSJnJkk7wvxNpNBw
    publisher: HalfAI
  - title: lemomo-ai/lemo-opuscar — dépôt GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
cover:
  src: /showcase/lemo-style-guide.jpg
---

## Il a transformé les vidéos faites avec Opus 5.5 en bibliothèque de styles

Toutes les platforms poussent actuellement les vidéos de code, et des comptes ont gagné des dizaines de milliers d'abonnés en un mois et des millions de vues avec elles. La méthode n'a rien de mystérieux : un Claude Opus 5.5 et un sujet, et vous pouvez commencer. L'article de HalfAI que nous prenons comme référence partage le Skill qui facilite tout ça — Lemo-Opuscar.

Sa force première n'est pas « il fait des vidéos », mais d'avoir organisé le contenu vidéo que les gens ont fait avec Opus 5.5 en styles prêts, avec un nom. Vous ne dessinez plus un style de zéro — installez le Skill, dites lequel vous voulez, donnez-lui votre sujet et votre matériel, et il génère la vidéo dans ce style.

Chaque film de démo du dépôt a une image et une musique écrites par Claude en code, avec la voix synthétisée par TTS : pas de modèle de génération vidéo, pas de banque d'images. Chaque style est un prompt réutilisable plus un court-métrage réalisé, dessiné et musiqué entièrement en code. Les GIF ci-dessous ont été capturés par HalfAI après avoir fait tourner le dépôt pour de vrai.

![L'affiche de la galerie de styles LEMO OPUSCAR : 59 styles · 11 catégories · 56 minutes de film](/showcase/lemo-style-guide.jpg)

## La galerie de styles : 11 catégories, une par une

### Montage et documentaire · 8 styles

Vous lui donnez des images réelles et il les monte en visuels d'actualité. Les actualités sous-titrées sont utilisées par beaucoup de comptes d'info — compréhensibles même sans le son ; l'écran partagé à compte à rebours en temps réel convient à la couverture d'un lancement, les cases défilant de 1 à 9 jusqu'à l'allumage ; le tableau tactique sportif gèle l'image, trace des lignes et coupe l'écran, avec la position et la trajectoire de chaque joueur bien claires ; et l'habillage d'info TV, c'est le générique complet d'une chaîne, utilisable pour un journal quotidien ou matinal. Cette catégorie comprend aussi les actualités filmées des années 20, la symphonie time-lapse, l'enquête visuelle et le montage constructiviste — l'enquête visuelle dissèque un objet ou un événement en détail, parfaite pour la vulgarisation.

![Actualités sous-titrées — les États-Unis ont perdu 1,3 million de ruches en un an, et pourtant le total a grimpé de 6 %](/showcase/lemo-captioned-news.gif)

![Écran partagé à compte à rebours — la dernière minute du lancement d'Artemis II](/showcase/lemo-countdown.gif)

![Tableau tactique sportif — geler l'image, tracer des lignes, couper l'écran](/showcase/lemo-tactics.gif)

![Habillage d'info TV — quatre actus IA par semaine, l'habillage complet d'une chaîne](/showcase/lemo-tv-package.gif)

### Images probantes · 8 styles

Utilise cartes, images satellite ou modélisations 3D pour présenter des lieux et désosser des produits — et chaque chiffre a sa source citée, ce qui le sépare d'une infographie ordinaire.

![Bulletin satellite — le satellite suit la carte vers la mer d'Aral et trouve un désert](/showcase/lemo-satellite.gif)

![Démontage de produit — la moitié d'un clavier open source, couche par couche](/showcase/lemo-teardown.gif)

### Dessin et peinture · 7 styles

Dessin à la main, aquarelle, lavis d'encre chinois, plus empâtement à l'huile et dessin au trait unique — bien adapté aux vidéos explicatives.

![Lavis d'encre chinois — un épéiste effleure le fleuve et tranche le courant](/showcase/lemo-ink.gif)

### Traditions orientales · 4 styles

Théâtre d'ombres, ukiyo-e, fenêtres découpées rouges et ombres de lanternes sculptées — stylisés et nettement asiatiques.

![Théâtre d'ombres — dix soleils brûlent la terre, Hou Yi bande son arc](/showcase/lemo-shadowplay.gif)

### Impression et gravure · 5 styles

Riso, gravure sur bois, taille-douce — ces textures d'imprimerie stylisées.

![Gravure sur bois — un village passe tout un hiver à fondre une cloche](/showcase/lemo-woodcut.gif)

### Graphisme et typographie · 7 styles

Des propositions typographiques qui ont du punch, comme la typographie cinétique suisse : une grille, une couleur signal, chaque mouvement calé sur le beat.

![Typographie cinétique suisse — cinq règles font une affiche](/showcase/lemo-swiss-type.gif)

### Information et publication · 5 styles

Lancements produit, récit de données, screencasts — taillé pour les lancements.

![Récit de données — cent étés de température mondiale, dessinés au crayon](/showcase/lemo-data-story.gif)

### Cartoon et animation · 4 styles

Cartoon rubber-hose des années 30, animation celluloïd des années 80, plus cartoon de sitcom sci-fi.

![Cartoon rubber-hose années 30 — les aventures de cuisine d'une tasse de café](/showcase/lemo-rubberhose.gif)

### Jeux · 4 styles

RPG pixel 16 bits, micro-jeux flash et rythme plat de divertissement — à la façon jeu, mignons et très dynamiques.

![RPG pixel 16 bits — le dernier point de sauvegarde](/showcase/lemo-pixel-rpg.gif)

### Cinéma et époques · 2 styles

Film muet des années 1920, et le look new-weird du Backrooms — vous pouvez convertir tout votre matériel dans ce style.

![Film muet années 1920 — un boulanger poursuit un pain évadé](/showcase/lemo-silent.gif)

![Backrooms / new weird — une cassette VHS de veille de nuit de 1996](/showcase/lemo-backrooms.gif)

### Matériaux et 3D · 5 styles

Jouets de briques, livres pop-up, miniatures tilt-shift — des textures à la saveur 3D.

![Jouet de briques — assembler une fusée pièce par pièce](/showcase/lemo-bricks.gif)

## Pourquoi ça vaut la peine d'être gardé

Mot de l'auteur de l'article lui-même : « Sincèrement, c'est la première fois que je vois un dépôt pareil. » Sa valeur n'est pas dans les prompts en soi — il résout un problème précis : il y a des gens qui savent exactement quelle sensation ils cherchent, mais qui n'ont pas en tête le nom ni le concept de ce style. Avec une bibliothèque de styles indexée par nom, on cesse de demander à l'IA d'inventer un style de zéro.

## Transformez-le en votre propre style

Une fonctionnalité ajoutée récemment au dépôt : passez vos couleurs de marque, votre logo, votre IP et votre ton de compte, et transformez un style intégré en style à vous. Par exemple, l'auteur du dépôt a transformé la typographie cinétique suisse en « Grille de matériaux » — il garde la grille, le beat et les polices, et passe à des objets réels en argile, plastique, velours, verre et chrome.

![Le style retravaillé : Grille de matériaux (sur base de typographie cinétique suisse)](/showcase/lemo-material-grid.gif)

Le processus va de question en question : il vous demande une chose à la fois, chaque question propose quelques options, la recommandée en premier ; il montre d'abord une image de style, puis monte un film de démo de 15 à 30 secondes, et ne l'enregistre comme votre style nommé qu'une fois satisfait — ensuite vous l'appelez simplement par son nom.

## Installation et usage

Totalement gratuit et open source. Il s'installe dans Claude Code avec deux commandes de terminal (HalfAI a testé l'installation) :

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

![L'installation testée : marketplace add + plugin install, deux étapes](/showcase/lemo-install.jpg)

Ensuite dites simplement quel film vous voulez — les noms de styles fonctionnent en chinois. L'exemple du README :

```
Fais un film de 30 secondes en style empâtement à l'huile sur mon chat roux qui m'attend tous les jours au rebord de la fenêtre en rentrant du travail.
```

Si vous ne savez pas encore quoi faire, lancez `/lemo-opuscar:lemo-opuscar` et il demande d'abord si vous voulez faire un film avec un style de la bibliothèque, retravailler un style à votre façon, ou utiliser un style déjà enregistré.

## Avant de commencer

Trois préconditions, énoncées sans détour dans l'article :

* **Les styles sont liés à Opus 5.5.** Tous ont été réglés pour Claude Opus 5.5 ; avec d'autres modèles, rien n'est garanti.
* **Le temps et les tokens sont réels.** Un film demande à l'agent environ 30 à 60 minutes, et l'usage de tokens n'est pas léger.
* **Exigences d'environnement.** Il faut Node 20+, ffmpeg et Python 3.11+ sur la machine.

## Verdict

> **Utilisez-le comme un index de styles, pas comme un générateur de vidéos.**
> Le vrai produit, c'est « le nom d'un style + un prompt réutilisable + un film de démo tout en code » — la vidéo n'est que la forme que prend la démo. La bonne façon de choisir un style, c'est de regarder d'abord les démos ; la différence de sensation entre les catégories est bien plus grande que ce que les noms suggèrent. Avant de commencer, retenez trois choses : Opus 5.5 uniquement, 30–60 minutes par film, et un coût en tokens pas du tout trivial.

## Attribution

Compilé à partir de l'article de HalfAI (这个Skill，让你轻松做59种视频风格，助你涨粉上万) et du dépôt lemomo-ai/lemo-opuscar (MIT). Les GIF et captures viennent des exécutions de l'auteur de l'article lui-même ; les droits restent à HalfAI et Lemomo. Les données d'actualité (66 styles, 14,5K étoiles) sont vérifiées par rapport au dépôt au 10-11-2026 ; à la publication, l'article indiquait 59 styles et 6,3K étoiles.
