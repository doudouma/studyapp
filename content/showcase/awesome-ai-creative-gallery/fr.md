---
summary: Une galerie open source et filtrable de workflows de création d'images IA dont les cas remontent à des sources nommées — un tutoriel Datawhale, le guide officiel de prompts d'OpenAI, 24 threads X et un retour Reddit, chacun avec son prompt de référence.
tags: [Image IA, Bibliothèque de Prompts, Open Source, GPT Image 2.6, Flux de Design, Galerie Curatée]
facts:
  - key: cases
    value: 49 cas · 7 catégories de workflow
    highlight: true
  - key: author
    value: li-xiu-qi (GitHub)
  - key: license
    value: MIT (code) · les médias restent la propriété de leurs auteurs
  - key: model focus
    value: GPT Image 2.6 (en expansion)
  - key: platform
    value: Site statique · GitHub Pages
  - key: ui languages
    value: Chinois · Anglais
  - key: references
    value: 24 threads X · guide OpenAI · 2 articles · Reddit
---

## La galerie

[Awesome AI Creative Gallery](https://li-xiu-qi.github.io/awesome-ai-creative-gallery/) est une collection open source sous licence MIT de workflows de création d'images IA, curatée par l'utilisateur GitHub li-xiu-qi et publiée comme un site statique sans dépendance (clonez le dépôt, ouvrez `index.html`, c'est tout). Elle réunit aujourd'hui 49 cas dans sept catégories — 动态与表情 / 游戏与互动 / 图标与 SVG / 知识与表达 / 商业与设计 / 图片编辑 / 角色与故事 — filtrables par scénario, workflow et version du modèle, avec une interface bilingue chinois-anglais et une recherche par mot-clé.

Son propre README fixe la règle de lecture : voir d'abord l'effet, ensuite trouver la méthode. Chaque cas renvoie vers sa source d'origine et embarque le prompt de référence.

## D'où viennent ses cas

La galerie n'est pas un déversement de prompts ; son fichier de données cite des sources nommées pour chaque cas :

* **24 threads X d'origine** — les créateurs derrière les démos (MrLarus, umesh_ai, chetaslua, LinusEkenstam, gabrielchua et d'autres). Les planches de personnage, les éditions au cercle annoté et les boucles d'autocollants remontent toutes à un post précis.
* **Un tutoriel de lancement** — l'article de Datawhale [整理了最新GPT-Images-2.6的全网10个爆火用法！](https://mp.weixin.qq.com/s/jdxCmAGWznmZukPuhQUpzA), qui distille le matériel en dix manoeuvres de départ, chacune avec un prompt prêt à copier — détaillées une par une dans la section suivante.
* **Un retour de terrain sur Reddit** — un essai direct de la nouvelle fonction GIF, par un utilisateur et non par le marketing.
* **Une collection sœur** — [ZeroLu/awesome-gpt-image](https://github.com/ZeroLu/awesome-gpt-image), le dépôt voisin qu'elle référencie.

## Les dix manoeuvres de départ

Le tutoriel répartit ses dix manoeuvres en cinq familles de scénarios. Chacune vient avec son « comment démarrer » et un prompt de référence ; les prompts sont traduits en français depuis les originaux chinois du tutoriel.

### Personnages et assets dynamiques

**1. Personnage statique → autocollant animé en boucle.** Réduit ce qui exigeait un rigging par calques dans AE/Live2D à une seule instruction. Commencez par un sujet et une action, caméra fixe, retour à la pose initiale — puis vérifiez la couture de la boucle et la dérive du visage.

![Autocollant animé en boucle : le personnage cligne des yeux et salue, retour à la pose initiale](/showcase/aacg-play1-nod.gif)

```
À partir de la référence du personnage fournie, conservez inchangés la coiffure, les vêtements et l'arrière-plan. Faites cligner le personnage une fois et saluer doucement, avec un mouvement stable et naturel, puis un retour complet à la pose initiale à la fin, pour produire un GIF en boucle parfaitement raccordé.
```

**2. Sprites d'actions pour personnages de jeu.** Une planche de personnage produit des séquences d'attente et de marche pour valider le style et le rythme avant des jours de dessin manuel ; le tutoriel signale que les frames exigent encore un alignement manuel des pivots et du canal alpha avant le moteur.

![Sprites en style pixel : attente et marche](/showcase/aacg-play2-pixel.jpg)

```
En prenant l'illustration du personnage fournie comme référence, concevez une série de frames d'un personnage en style pixel à défilement latéral, montrant les états d'attente et de marche vers la droite ; conservez strictement les couleurs des vêtements, les proportions et la densité de pixels, avec un fond transparent.
```

**3. Planche de personnage multi-angles depuis une référence.** Corrige le problème de « tourne la tête, nouveau visage ». Listez d'abord les traits qui ne doivent pas changer, puis comparez accessoires et vêtements entre les vues.

![Planche de personnage multi-angles : face, profil, dos et gros plans](/showcase/aacg-play3-sheet.jpg)

```
En prenant l'illustration du personnage fournie comme référence, réalisez une planche horizontale du personnage avec des vues corps entier de face, de profil et de dos, plus deux gros plans du visage d'émotions différentes à droite ; conservez strictement coiffure, coupe des vêtements, traits et palette, sur un fond uni et propre.
```

### Affiches e-commerce et vitrines dynamiques

**4. Affiches saisonnières et publicités dynamiques depuis une photo produit.** Deux couches : changer le fond en verrouillant emballage, étiquettes et texte pour le matériel statique ; puis ajouter le micro-mouvement — couvercle qui s'ouvre, produit flottant, rotation douce — pour les fiches et les feeds.

![Affiche produit saisonnière — fond d'automne avec emballage verrouillé](/showcase/aacg-play4-seasonal.jpg)

```
Conservez strictement inchangés l'emballage, la forme du flacon, la mise en page de l'étiquette et les textes de l'image fournie ; remplacez l'arrière-plan par une table en bois d'automne, avec une lumière latérale chaude et douce, ponctuée de quelques feuilles d'érable et fleurs séchées, le produit restant le sujet visuel absolu.
```

```
En partant de la photo du produit, préservez entièrement sa forme et ses marquages ; faites ouvrir le couvercle de la boîte en douceur, le produit s'élever lentement et flotter légèrement, puis revenir et se refermer, pour générer un GIF de présentation en boucle stable sur un fond uni minimaliste.
```

### SVG vectoriel natif et design d'icônes

**5. Séries d'icônes SVG éditables par lot.** Produit du code vectoriel propre plutôt que des bitmaps. Unifiez l'épaisseur de trait, l'arrondi et la couleur d'accent, testez d'abord un petit lot — et d'après la documentation officielle, le SVG natif passe par un endpoint séparé : les planches multi-icônes doivent être découpées en composants avant la production.

![Série d'icônes météo linéaires, sortie en SVG](/showcase/aacg-play5-weather-icons.png)

```
Concevez une série d'icônes linéaires pour une application météo avec six éléments : soleil, nuageux, pluie fine, forte neige, orage et vent ; unifiez un trait de 2px, des angles arrondis et un style moderne minimaliste, une couleur d'accent commune, et livrez un code SVG propre.
```

### Éditions au cercle et rendu de croquis

**6. Éditions locales au cercle rouge.** Entourez la cible, dites ce qui change dans le cercle et ce qui reste dehors, et demandez la suppression du repère ; vérifiez ensuite les raccords.

![Édition au cercle rouge : veste recolorée, tout le reste verrouillé](/showcase/aacg-play6-revision.jpg)

```
Modifiez la veste dans la zone du cercle rouge en une texture de laine bleu foncé ; hors de la zone entourée, verrouillez strictement le visage, la coiffure, la pose et l'arrière-plan ; supprimez le cercle rouge dans le résultat, avec des raccords fondus naturellement.
```

**7. Croquis → rendu photoréaliste.** Des traits grossiers suffisent si la position du sujet et la perspective sont claires ; le modèle complète matériaux, lumière et végétation pour la communication du concept.

![Le croquis à la main de la vallée utilisé comme entrée](/showcase/aacg-play7-sketch.webp)

![Le croquis rendu en vallée réaliste au petit matin](/showcase/aacg-play7-valley.webp)

```
En prenant le dessin au trait fourni comme référence, conservez strictement la composition, la perspective et la position du sujet d'origine ; rendez le croquis en une vallée naturelle photoréaliste sous une lumière latérale douce du matin, en ajoutant une texture rocheuse crédible, une végétation et des reflets sur l'eau calme.
```

### Maquettes UI, diagrammes et storyboards

**8. Maquettes d'apps et de sites.** Le résultat est une référence visuelle, pas du code — dans la communauté, la maquette est ensuite confiée à des agents de code comme Codex pour boucler de l'idée visuelle au front-end.

![Maquette de l'écran d'accueil d'une app de marché](/showcase/aacg-play8-ui.webp)

```
Concevez l'écran d'accueil d'une application mobile pour un marché de producteurs local, avec des sections liste des exposants, offres du jour et horaires ; utilisez un fond blanc minimaliste avec une couleur d'accent vert naturel, une hiérarchie d'information claire, présenté dans le cadre de l'écran d'un téléphone.
```

**9. Diagrammes avec traduction dans l'image.** Génère des diagrammes légendés, ou remplace le texte d'un diagramme existant en conservant mise en page, flèches et illustrations — le pari du tutoriel pour localiser des diagrammes techniques ; vérifiez la terminologie à la main dans les domaines sérieux.

![Diagramme de la respiration cellulaire](/showcase/aacg-play9-respiration.webp)

```
Traduisez le texte anglais de l'image en chinois, en remplaçant les textes à leur place ; conservez exactement les couleurs du fond, la structure de l'illustration, les flèches et la mise en page, avec des tailles de police qui s'adaptent à l'espace d'origine.
```

**10. BD d'histoire en quatre cases.** Résumez l'histoire en une phrase, découpez-la en quatre moments qui changent, verrouillez le look et le style du personnage, puis lisez les cases dans l'ordre pour vérifier que l'histoire se comprend seule.

![BD d'animal en quatre cases : le chat attend à l'entrée](/showcase/aacg-play10-comic.webp)

```
Créez une BD d'histoire en quatre cases mettant en scène un chat tigré orange. Case 1 : le maître salue et sort ; case 2 : le chat guette par la fenêtre ; case 3 : le chat dort roulé en boule sur le canapé ; case 4 : le maître ouvre la porte et rentre, le chat assis qui attend dans l'entrée. Gardez le personnage uniforme, avec un trait simple et chaleureux.
```

## Le guide officiel derrière les cas

Une colonne vertébrale discrète : presque chaque workflow signature de la galerie correspond à une section nommée du [guide officiel de prompts gpt-image-2.6 d'OpenAI](https://developers.openai.com/api/docs/guides/image-prompting?model=gpt-image-2.6) — générer un GIF en boucle, guider une édition au marqueur, traduire en préservant la mise en page, transformer un dessin en image réaliste, transformer une histoire en strip, garder un personnage cohérent, créer un aperçu d'interface.

La galerie se lit donc comme une couche éprouvée par la communauté par-dessus le cookbook officiel : le guide nomme la capacité, la galerie montre qui l'a déjà poussée à bout et avec quel prompt.

## Comment la communauté juge le modèle derrière tout ça

Pourquoi se concentrer sur GPT Image 2.6 ? Le [duel de 卡尔的AI沃茨](https://mp.weixin.qq.com/s/ASxig6mFVYxrIE8-8Fthew) contre Nano Banana 2 sur cinq scénarios réels donne le contexte :

* **Texte et typographie chinoise** — les affiches de GPT se lisent comme une vraie marque (serif délicates, pages produit crédibles) ; celles de Banana traînent plus de « feeling IA ». C'est là que vivent les cas d'affiches et d'infographies de la galerie.
* **Réplique d'interfaces** — GPT a produit un lecteur de musique et une home e-commerce convaincants ; de là vient le workflow de maquettes UI de la galerie.
* **Photographie du monde réel** — quasiment ex æquo, jusqu'à deviner l'époque des données d'entraînement grâce à un vélo ofo dans le cadre.
* **Cohérence et édition par référence** — match nul dans l'ensemble, même si l'édition au clic de GPT et la stabilité du texte dans la traduction de BD se sont distinguées.

La galerie se place exactement du côté gagnant de cette comparaison — et la comparaison elle-même vaut la lecture pour ses prompts.

## À garder en tête

* **Les prompts ne garantissent pas le même résultat.** Le README le dit carrément : les prompts publics ne promettent pas une sortie identique.
* **GPT Image 2.6 d'abord.** Les autres modèles sont annoncés mais maigres ; les cas dont la source ne nomme pas le modèle sont étiquetés « modèle à confirmer ».
* **Certaines démos sont des preuves de concept.** Le tutoriel Datawhale lui-même prévient : les planches de sprites exigent un alignement manuel avant le moteur de jeu, et les planches multi-icônes doivent être découpées avant la production.
* **Les médias ne sont pas MIT.** Seul le code l'est ; les images et vidéos de tiers appartiennent à leurs propriétaires.

## Verdict

> **Recommandation principale**
```
Utilisez-la comme le tissu conjonctif entre trois couches : le guide officiel d'OpenAI pour les capacités, le tutoriel Datawhale pour les dix manoeuvres de départ, et les 24 threads sources pour le détail au niveau du prompt. Quand une tâche a une forme d'image, trouvez le cas correspondant ici et suivez son lien vers le post d'origine avant d'écrire votre propre prompt.
```

## Attribution

Assemblé à partir du README et des données de cas du projet lui-même (qui citent chaque source), du tutoriel Datawhale, de la comparaison de 卡尔的AI沃茨, du guide officiel d'OpenAI et des threads communautaires liés. La galerie est maintenue par li-xiu-qi sous licence MIT pour le code ; les médias présentés restent aux créateurs d'origine.
