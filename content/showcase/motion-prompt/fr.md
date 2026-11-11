---
slug: motion-prompt
name: Motion Prompt
summary: Une bibliothèque de noms pour travailler avec l'IA — 192 noms de mouvements, de caméra, de composants UI, d'effets de landing page et de partis pris photo. Chacun vient avec un exemple animé, une phrase de sens, un exemple de demande et une spécification précise à la milliseconde. MIT, cinq langues, installable comme skill pour agents.
category: resource
tags: [Design de mouvement, Bibliothèque de prompts, Canvas, Design system, Open Source, Multilingue]
publishedAt: 2026-11-11
updatedAt: 2026-11-11
author: Shohei Ohtaki
externalUrl: https://showheyohtaki.github.io/motion-prompt/
facts:
  - key: names
    value: 192 noms · 8 packs
    highlight: true
  - key: languages
    value: Anglais / japonais / espagnol / chinois simplifié et traditionnel
  - key: each name
    value: Exemple animé + sens en une phrase + demande type + motion spec
  - key: license
    value: MIT · 1,9K étoiles · 187 forks
  - key: install
    value: npx skills add showheyohtaki/motion-prompt
  - key: author
    value: Shohei Ohtaki (Daytra Inc.)
sources:
  - title: Motion Prompt — galerie
    url: https://showheyohtaki.github.io/motion-prompt/
    publisher: Shohei Ohtaki
  - title: showheyohtaki/motion-prompt — GitHub (MIT)
    url: https://github.com/showheyohtaki/motion-prompt
    publisher: GitHub
cover:
  src: /showcase/motion-prompt-cover.jpg
---

## Ce qui bloque n'est pas l'imagination, c'est le nom

Shohei Ohtaki a commencé par publier quelques courtes vidéos sur X qui donnaient un nom aux mouvements de motion design et de caméra. En quelques jours, les commentaires sont arrivés. L'un disait en substance : **ce qui me bloquait n'était pas un manque d'imagination. C'était de ne pas savoir comment ce type de mouvement s'appelle.**

Ce commentaire est devenu le point de départ du projet. Si les gens qui connaissent leur domaine, dans beaucoup de langues, posaient le langage commun nécessaire pour bien travailler avec l'IA sous forme de bibliothèque consultable, ce serait vraiment utile — il a donc construit Motion Prompt : pas un style à copier, mais une bibliothèque de noms.

Le titre le dit sans détour : **For the creative directors who direct AI.**

## À quoi ressemble un nom

Ouvrez n'importe quel numéro et vous obtenez une fiche complète :

- un **exemple animé** de 4,7 secondes en boucle — pas un fichier vidéo, mais un dessin en direct sur un canvas
- un **sens** en une phrase (« Une forme se transforme doucement en une autre »)
- **How to ask an AI** : une demande type qu'on peut coller telle quelle dans un modèle
- un **Motion spec** : l'effet découpé en étapes à suivre — durées, courbes d'easing, distances, conditions aux limites, au milliseconde et au pixel près
- **Copy prompt / Copy code** : le prompt et l'implémentation de référence, à un clic

Pour #012 « Shape morph », la spec indique : quatre formes, 1,175 s chacune ; chaque segment marque d'abord un temps d'arrêt, puis se transforme en la suivante en 0,58 s ; chaque contour est stocké en 240 points et les points de même indice sont interpolés linéairement ; la progression utilise backOut (s = 1,6), donc elle dépasse légèrement ; les couleurs se mélangent bleu → corail → jaune → menthe en easing quadratique. Une IA qui lit ça peut reproduire presque exactement, et une personne qui le lit peut décider si elle en veut.

![La fiche de #012 Shape morph : exemple animé, sens, demande type, motion spec et boutons de copie](/showcase/motion-prompt-detail.jpg)

## Huit packs, 192 noms

Huit packs de 24 noms chacun, numérotés à la suite :

* **001–024 motion** : motion design — Pop-in, Stagger, Burst, Line draw, Mask reveal, Typewriter, Count-up, Kinetic typography, Easing, Overshoot, Squash & stretch, Shape morph, Particles, Parallax… groupés en entrées et texte, finition du mouvement, transitions et temps forts
* **025–048 camera** : mouvements de caméra — Pan, Tilt, Dolly in, Zoom in, Tracking shot, Orbit, Crane up, Dolly zoom (Vertigo), Rack focus…
* **049–072 ui** : noms de composants — Modal dialog, Drawer, Bottom sheet, Accordion, Dropdown, Tooltip, Popover, Toast notification, Tabs… chacun montré par un curseur qui le déclenche
* **073–096 lp** : landing pages et effets web — Parallax scrolling, Fade-in on scroll, Sticky header, Pinning, Horizontal scroll, Scroll snap, Scroll progress bar, Hover lift…
* **097–120 photo** : lumière et partis pris photo — Backlighting, Rim light, Silhouette, Split lighting, Rembrandt lighting, Butterfly lighting…
* **121–144 motion2 / 145–168 lp2 / 169–192 camera2** : la deuxième série de ces trois packs

Ce qui mérite le détour, c'est la façon dont les packs ui et lp sont présentés. Chacun est dessiné comme une petite page en wireframe — ui sur un blanc cassé chaleureux, avec des traits fins et un pointeur ; lp comme une fenêtre de navigateur posée sur un bureau, où le défilement, le snap et les en-têtes fixes se produisent réellement dans la fenêtre. Vous ne regardez pas un schéma ; vous regardez l'effet.

![Le pack motion : bleu nuit, quatre couleurs, une animation en direct par nom](/showcase/motion-prompt-motion.jpg)

![Le pack camera : gris clair, un seul bleu, avec une silhouette et des immeubles qui montrent où va la caméra](/showcase/motion-prompt-camera.jpg)

![Le pack ui : des wireframes en blanc cassé et un curseur qui montre comment chaque composant se déclenche](/showcase/motion-prompt-ui.jpg)

![Le pack lp : défilement, snap et survol dans une fenêtre de navigateur](/showcase/motion-prompt-lp.jpg)

## Choisir, puis l'envoyer à votre IA

Il y a trois façons d'utiliser la bibliothèque. La première est empaquetée comme skill pour agents :

Lancez `npx skills add showheyohtaki/motion-prompt` dans un terminal, puis dites à votre IA « ouvre la bibliothèque motion-prompt » : la galerie s'ouvre dans le navigateur. Cliquez sur **Pick** sur ce qui vous plaît ; quand vous en avez assez, écrivez une courte note en bas (par exemple « pour le titre d'ouverture ») et cliquez sur **Copy picks** ou **Send to AI** — les numéros, noms, specs et votre note partent ensemble vers le modèle.

La deuxième façon ne demande aucune installation : trouvez le nom de ce que vous avez en tête et mettez ce nom dans votre prompt. « Fais entrer le titre avec un mask reveal par le bas, 0,6 s, chaque ligne un peu après la précédente » — cette phrase fonctionne sur une IA de code, un modèle de génération vidéo ou une personne designer.

La troisième consiste à créer une autre bibliothèque pour votre propre domaine : le dépôt fournit trois prompts à copier-coller (traduire, votre propre domaine, une fiche mémo d'une page) et un script qui rend les vidéos ; deux exemples complets existent déjà.

![Après avoir choisi quelques éléments : le plateau, le champ de note et Copy picks](/showcase/motion-prompt-pick.jpg)

## Derrière chaque nom, une implémentation qui tourne

C'est ce qui le distingue d'un tableau d'inspiration : chaque exemple est une implémentation réelle et exécutable, et elle est pensée pour être emportée.

La convention du code est : **un élément est une fonction**, `cells[i](ctx, w, h, u)` — `ctx` est un contexte canvas 2D, `w`/`h` la taille de la carte, `u` le temps en secondes dans le cycle. L'image ne dépend que de `u` ; la fonction ne lit pas l'horloge et n'utilise pas de nombres aléatoires, donc la lecture en direct et le rendu image par image donnent les mêmes images. Couleurs, tailles, durée du cycle et fonctions partagées vivent dans le kit de chaque pack ; les éléments ne dépendent que du kit de leur pack, et il n'y a aucune bibliothèque externe.

La même convention se voit dans l'interface publique : `api/v1/` est un ensemble de fichiers statiques — `catalog.json` (les métadonnées des 192), `{ja,en}/catalog.tsv` (un index), `e/{id}.txt` (la spec et le code complet d'une entrée), `p/{id}.txt` (un prompt prêt à coller), `kit/{pack}.js` (le code partagé du pack). La CLI du skill ne fait que des requêtes GET, ne lit rien de votre projet et n'envoie rien ; `pick` ouvre un écouteur temporaire sur `127.0.0.1` qui ne reçoit que les numéros et la note choisis dans la galerie.

## Un look par pack, volontairement

motion est bleu nuit avec quatre couleurs ; camera est gris clair avec un bleu ; ui est blanc cassé chaud, noir et un bleu ; lp est une fenêtre de navigateur sur un bureau gris pâle, avec le vermillon en accent ; photo n'a pas de palette commune : chaque carte est peinte aux couleurs de sa propre scène, et l'effet entre et ressort en fondu pour permettre la comparaison.

Le README le dit clairement : ce qu'un pack doit réussir, ce sont les **noms**, pas un style de la maison. C'est pourquoi, dans une même bibliothèque, cinq packs ressemblent à cinq petits produits distincts ; seule la manière d'écrire noms et specs reste constante.

![Le pack photo : une scène par carte, chacune avec sa palette, en fondu pour comparer](/showcase/motion-prompt-photo.jpg)

## Cinq langues, et un peu d'attention aux gens

Chaque nom, sens et demande type existent en anglais, japonais, espagnol, chinois simplifié et chinois traditionnel (les traductions espagnole, traditionnelle et simplifiée ont été lancées par des contributeurs de la communauté). L'interface de la galerie est en anglais et en japonais, avec un mode sombre et un bouton **Pause** : une pression et toutes les animations de la page s'arrêtent, ce qui compte pour les personnes sensibles au mouvement.

Sur téléphone, la grille devient une seule colonne et montre un ou deux noms à la fois — pour « chercher un mot », c'est même plus adapté que la grille de bureau.

![La disposition en une colonne sur téléphone](/showcase/motion-prompt-mobile.jpg)

## Verdict

> **Il traduit le goût en vocabulaire.**
> Là où la plupart des gens se bloquent en travaillant avec l'IA, ce n'est pas la description : c'est de ne pas savoir que la chose a un nom. Cette bibliothèque réunit 192 noms, leur apparence, comment les demander et comment les reproduire précisément sur une seule page, et rend tout cela emportable sous MIT : dans votre prompt, votre projet vidéo, votre propre domaine.

## Attribution

Motion Prompt est de Shohei Ohtaki (Daytra Inc., X [@showheyohtaki](https://x.com/showheyohtaki)) ; la galerie est sur showheyohtaki.github.io/motion-prompt et le code est sous licence MIT sur GitHub (conservez la première ligne du code d'un élément quand vous le réutilisez). Les traductions espagnole, chinoise traditionnelle et simplifiée ont commencé avec @herberthcr, @daddydanielt et @xhonye ; le format galerie plus skill s'inspire de Lucian UX/UI Prompt. Les captures de cet article ont été prises par nous sur la galerie en ligne (bureau 1280×900, mobile 390×844) ; les exemples et les visuels appartiennent à l'auteur.
