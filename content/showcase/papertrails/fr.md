---
summary: Un prompt, des critiques à l'aveugle et une référence dorée : comment Shikhar a construit un monde de papier infini en three.js.
tags: [Three.js, Papercraft, Fable 5.2, Opus 5.5, Critiques à l'aveugle, Jeu navigateur]
facts:
  - key: method
    value: Un sous-agent par pièce · critiques A/B à l'aveugle
    highlight: true
  - key: models
    value: Fable 5.2 + Opus 5.5
  - key: stack
    value: three.js · Vite · MIT
  - key: source
    value: ~900 Ko de JS · plus de 50 modules
  - key: assets
    value: 19 Mo de modèles, textures et audio
  - key: biomes
    value: 5 publiés · 15 explorés · jour et nuit
  - key: target
    value: 60 fps sur un portable milieu de gamme
  - key: author
    value: Shikhar — fait des choses cools avec l'IA
  - key: reception
    value: 51 K vues · 1,4 K j'aime · 85 réponses
---

## Le brief avant le jeu

La chose la plus utile que Shikhar a publiée n'est pas le jeu. C'est le prompt. Le nom final est Papertrails ; presque tout le reste du document a survécu. Il est reproduit intégralement ci-dessous, mot pour mot depuis l'image qu'il a publiée, parce que la suite raconte ce qu'il en a fait.

## Le prompt original

Reproduit tel quel depuis l'image du prompt dans son fil :

> **Build "Pop-up Atlas", a browser 3D walking toy, in Three.js.**
>
> **Reference**
> none yet. First generate 4-6 concept frames with imagegen (tilt-shift papercraft diorama, tiny paper traveller, terrain folding up out of an open book, warm lantern light). Collect photos of real pop-up books and papercraft dioramas. These become the target. Match their look and tactile paper feel exactly.
>
> **Details**
> small paper traveller walks across an endless open pop-up book. Terrain ahead folds up out of the flat page: hinged paper tiles (hills, trees, houses, bridges, rivers) rise on springs, overshoot and settle with a slight wobble. Wave function collapse picks tiles so neighbours always connect. Tiles behind fold back flat. Look: matte cardstock, limited warm palette, visible paper edges and fibre, layered cut-paper silhouettes, soft shadows between layers, high-angle tilt-shift camera with strong DOF blur, warm key light + cool fill. Every fold gets a soft paper "flap" sound with varied pitch. Controls: WASD or click to walk, smooth camera follow. No physical-looking UI, no external brand assets.
>
> **Tools**
> Blender (tile models with hinge pivots, traveller, fold animations, baked paper materials → glTF). Codex CLI imagegen (concept frames, paper textures, printed details). Web Audio procedural paper sounds (or samples if better).
>
> **How to work**
> autonomous, no questions; log assumptions. Study reference → checklist of components with measurable targets. One sub-agent per component, each owns its files, project stays running. Loop on every component: separate harsh blind critic, A/B side by side vs reference in random order, says which is better + fixes. Continue until critics can't reliably pick the original and are wowed. Also judge fold motion/spring feel, walking feel, sound, performance (steady 60 fps mid-range laptop). Revert anything that makes it worse. Append-only log. User's explicit instructions override critics.
>
> **Deliver**
> playable Vite build + run instructions, 30-second gameplay capture, final side-by-sides and scores.

Ce n'est pas « fais un jeu en papier ». C'est une liste de choses vérifiables. Toute la différence est là.

## L'agent a dû fabriquer sa propre référence

Il n'a pas commencé par le code. L'agent a généré des images conceptuelles avec GPT Image et rassemblé des photographies de pop-up réelles, puis il a mesuré leurs couleurs, leurs bords et leur éclairage. La référence est devenue une série de nombres avant de devenir un style.

Ensuite est venue la décision que l'agent ne pouvait pas prendre : Shikhar a choisi une image comme référence de style concrète. L'agent a fait des captures du jeu et généré une cible dorée pour chaque biome ; les animaux ont été dessinés de la même façon. À partir de là, chaque rendu avait quelque chose de précis contre quoi échouer.

## Un sous-agent par pièce, un critique qui ne sait pas laquelle est laquelle

Les règles de travail de son prompt sont la partie la plus personnelle du projet. Elles se lisent comme un protocole de relecture, pas comme un souhait : l'agent travaille seul, ne pose pas de questions et consigne ses hypothèses. Il transforme la référence en liste de composants avec des cibles mesurables, donne à chaque composant son propre sous-agent et ses fichiers, et garde le projet en marche. Chaque build passe devant un critique sévère et aveugle à part, A/B côte à côte contre la référence dans un ordre aléatoire. La boucle ne s'arrête que lorsque les critiques « ne peuvent plus distinguer l'original et restent bouche bée ». Le mouvement du pli, la sensation de marche, le son et les 60 fps sur un portable milieu de gamme sont jugés aussi ; tout ce qui l'aggrave est annulé ; le journal est en ajout seul ; ses instructions explicites priment sur les critiques.

Le dépôt garde les frontières. Les fichiers commencent par `OWNER: render agent`, `OWNER: fold agent`, `OWNER: wfc agent` ; chaque agent a conservé sa configuration et ses notes de réglage. Les critiques étaient séparés des constructeurs et voyaient les deux versions dans un ordre aléatoire : ils ne pouvaient pas récompenser celle qu'ils venaient de faire.

Ce n'est plus écrire un prompt. Il a conçu un processus de relecture, puis l'a laissé tourner sans poser de questions.

## Cible dorée, cinq images

Il a publié le même plan à chaque passe : première build, passe d'art, passe de biomes, passe dorée, maintenant, cible dorée. La première build est claire et vide. La passe d'art remplace les arbres provisoires par des découpes de papier imprimées. La passe de biomes remplit le sol d'objets. La passe dorée ajoute le village et la lumière des lanternes. La dernière image est la cible, pas le jeu ; l'écart entre « maintenant » et « cible dorée » est la raison d'être de la boucle.

Puis les nombres. L'inclinaison de caméra est passée de 46° à 42° pour retrouver le trois-quarts plus bas de la référence. La distance de suivi est passée de 14,8 à 12,6 puis 10,8, parce que le cadre doré était environ 1,5 fois plus serré. La saturation est descendue de 1,04 à 0,92 ; le rayon de flou de 19 à 12,5 ; la densité d'animaux est montée de 1 à 1,5 parce que l'image dorée comptait une dizaine d'animaux dans le cadre. Ce ne sont pas des adjectifs de moodboard. Ce sont des mesures avec une direction.

Il a aussi annulé l'agent, et le code garde le reçu. Un chat qui aurait adopté le voyageur est désactivé avec `/* user 2026-11-17: no companion */` ; un comportement de suivi est à zéro avec `/* user 2026-11-17: animals never follow the traveller */`. Les critiques pouvaient comparer des rendus. Ils ne pouvaient pas décider si un chat devait te suivre. C'était sa décision.

## La carte qui reste

Les guides de style ont exploré quinze types de biome. La carte en publie cinq : heartland à l'origine, désert à l'est, neige à l'ouest, floraison au sud et pinède au nord, chacun avec jour et nuit. L'origine est toujours la ferme d'automne chaude, et les quatre voisins sont fixes pour que chaque biome soit à une douzaine de cases du départ.

Le monde est généré par wave function collapse, les pièces montent sur des ressorts et se replient à plat derrière le voyageur, les animaux paissent, picorent, s'éparpillent et se perchent, et Tab ou E ouvre un atlas qui se dessine tout seul pendant l'exploration. La carte continue de grandir dans toutes les directions.

## Ce qu'il y a vraiment dans le dépôt

Ce n'est pas une maquette de 54 secondes. Le dépôt public contient environ 900 Ko de JavaScript répartis sur plus de cinquante modules, plus des modèles GLB de pièces et de voyageur et 19 Mo de modèles, textures et audio. three.js est la seule dépendance à l'exécution. La licence est MIT. La version jouable est sur GitHub Pages, avec des paramètres d'URL pour la graine, la qualité, le son, la nuit, la vie et les animaux. La vidéo est une capture de cette version.

## La part qui est la sienne

Les modèles ont écrit le code. Le standard est le sien. « Continue jusqu'à ce que les critiques ne puissent plus distinguer l'original et restent bouche bée » n'est pas une astuce de prompt ; c'est un seuil de goût, et il l'a resserré avec des nombres. Les artefacts les plus personnels du dépôt sont les commentaires qui enregistrent ses vetos et les notes « fixer » qui ont déplacé une valeur d'une mesure à une autre.

S'il faut retenir une chose de sa build, que ce soit l'ordre : référence d'abord, critères ensuite, code enfin, et un critique qui ne sait pas quelle version il regarde. Le monde de papier est le résultat. La boucle est la méthode.
