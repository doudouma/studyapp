---
summary: Un chasseur pixel art de 32 KB, sans moteur 3D ni polygones : sprites empilés, trois caméras et un bouton Remix.
tags: [Sprite stacking, Pixel art, Fable 5.2, Forge, Jeu navigateur, Remixable]
facts:
  - key: code
    value: 32 KB
    highlight: true
  - key: rendering
    value: Sprite stacking · canvas 2D, sans polygones
  - key: model
    value: Fable 5.2 (selon @Gorden_Sun)
  - key: assets
    value: 32 fichiers · 3,18 Mo d'art et d'audio
  - key: cameras
    value: Dessus · poursuite · cockpit (Espace)
  - key: weapons
    value: Canon (clic droit) · missiles (M) · chasseurs ennemis
  - key: made with
    value: Forge d'UI8 · public et remixable
  - key: reception
    value: 1,9 M de vues · 26 K j'aime · 553 réponses
  - key: author
    value: Dash — builder et designer chez UI8
---

## Tout le pitch tient en une phrase

Le lancement de Dash, c'est un lien et une ligne : « No 3D engine, no polygons, 32 KB of code. » Pas de fil, pas de build log, pas de benchmark. Le lien ouvre un chasseur pixel art qui rase une chaîne d'îles, et en un jour et demi le post a dépassé 1,9 million de vues et 26 000 j'aime. Les 553 réponses ressemblent à une salle en train de se disputer pour savoir si la vidéo est vraie.

Elle l'est, et elle se joue. La page Forge fait tourner la démo dans le navigateur, à côté d'un panneau de dix groupes de réglages. La description de l'auteur est courte : « Chasseur pixel art construit par sprite stacking, au-dessus d'îles empilées. Espace fait défiler les vues dessus, poursuite et cockpit ; clic pour un tonneau, maintenir pour allumer les propulseurs ; vole de la crête des vagues à haute altitude. »

## Ce que vous pilotez vraiment

Le pointeur dirige. Le clic fait faire un tonneau, maintenir le bouton allume les propulseurs, et Espace passe de la vue dessus à la poursuite puis au cockpit. Le clic droit tire au canon, M lance des missiles, et les chasseurs ennemis restent dans le cadre pour que vous les accrochiez. Si vous piquez vers le sol, l'avion s'écrase et la caméra suit le pilote éjecté au lieu de fondu au noir vers un menu.

Ce détail fait de la démo un petit jeu, pas un test de shader. Le panneau expose le reste : crash activé ou non, temps de recharge du canon et des missiles, jusqu'à cinq chasseurs ennemis, ralenti d'esquive, ailiers, graine du monde, heure du jour, densité des nuages, couverture des îles, ombre de l'avion, sillage et embruns au ras de l'eau, traînées d'aile, style de flamme, secousse des explosions, grain de pellicule et couleurs de fuselage, d'accent et de verrière. L'intro « stack-up » assemble l'avion tranche par tranche avant le premier décollage. Trente fichiers son couvrent moteur, vent, canon, missiles, éjection, éclaboussures et radio.

## De la profondeur sans polygones

Le sprite stacking est une vieille technique, et obstinément efficace. Au lieu d'un maillage, l'avion est une pile de tranches plates en pixel art, chacune un frame d'une planche à quatre vues. Faites tourner la pile, l'objet tourne ; bougez la caméra, les tranches glissent juste assez pour vendre le volume. Aucun polygone à transformer, aucun moteur 3D à charger. La scène principale est dessinée dans un canvas 2D.

Les îles et les nuages sont empilés de la même façon, et c'est là que le débat commence. Pavian, le chercheur coréen dont le post a porté la démo bien plus loin, a parlé de « cette sensation de Super Famicom du début des années 90, construite point par point », et estimé que l'IA avait hissé l'artisanat à un niveau où « le travail manuel était trop lourd pour que quiconque s'y lance ». D'autres ont regardé les nuages et ont attaqué la phrase par l'autre bout : une pile de tranches, ce sont des voxels, quoi qu'en dise le tweet.

## Ce qu'en disent les gens

Les réponses sont plus utiles que le nombre de j'aime.

- **@bdvd_25** (219 j'aime) : « Il faut des contrôles mobiles, je ne peux pas changer de vue ! » La réponse la plus aimée est un rapport de bug, et il est juste. Le panneau propose des boutons tactiles, mais changer de vue suppose encore un clavier.
- **@PKekbar** (77 j'aime) n'a pas attendu une mise à jour. Il a passé la démo à Grok, ajouté des armes, un arbre de compétences, des ramassages derrière des portes de lumière et une boucle roguelite entre les niveaux, puis publié un lien jouable. Le chasseur est devenu un genre en un après-midi.
- **@ayzekdiolar** (turc, 70 j'aime) : « Tu as publié le code en open source ? C'est très réussi. » La version polie de la question que posait la moitié des citations.
- **@mimicry_ryu** (chinois) : « Ce n'est pas évident que c'est de la 3D ? Regarde les nuages et le terrain, tout est en voxels. » Il a raison sur les pixels et tort sur le moteur, ce qui est la façon la plus intéressante d'avoir raison.
- **@Gorden_Sun** (chinois) : « Fable 5.2 l'a fait presque du premier coup ; le résultat est trop bon. Les collègues, trouvez quelque chose et rattrapez-le. » C'est de là que vient l'attribution du modèle : un observateur externe des démos, pas Dash.
- **@meta_pavy** (coréen, 2 200 j'aime) : « Pas de 3D, pas de polygones : un simulateur de vol de 32 KB empilé uniquement avec des bandes... l'IA peut élever ça à un travail que personne ne ferait à la main. » Il a dû remettre le lien jouable en dessous parce que les lecteurs croyaient à un rendu. Ce malentendu est la critique.

## Là où la phrase s'arrête

- **32 KB, c'est le code, pas le téléchargement.** Le registre public de Forge liste 32 ressources pour 3,18 Mo, dont deux grandes planches de sprites et trente fichiers audio. La scène se charge vite ; ce n'est pas une page de 32 KB.
- **C'est public, pas open source.** L'aperçu sert les modules de l'app et Remix copie le fragment dans un espace Forge, mais il n'y a ni dépôt ni licence. La question d'Ayzek reste sans réponse dans le fil.
- **Le mobile est le point faible.** Les boutons tactiles sont un réglage, mais la réponse la plus aimée vient d'un utilisateur au téléphone qui ne pouvait pas changer de vue. La démo a été pensée pour le clavier, et ça se voit.
- **« Sans 3D » parle du moteur, pas de ce que vous voyez.** Les piles sont des voxels sous un autre nom ; la démo gagne le point technique et perd le perceptif.

## Dix minutes, puis Remix

> **Dix minutes qui valent le coup**
> Ouvrez-la sur un portable, passez en vue cockpit et rasez l'eau jusqu'à ce que le sillage apparaisse. L'astuce a des décennies ; ce qui a changé, c'est la finition. Ensuite, appuyez sur Remix — le fragment est public et l'offre gratuite de Forge couvre trois projets — si vous voulez voir ce qu'il reste du récit du « un seul prompt » devant le panneau de contrôle.

L'avion n'est pas vraiment l'histoire. L'histoire, c'est qu'une démo de 32 KB est désormais assez finie, jusqu'au gros plan de l'éjection et au bruit de la radio, pour que 26 000 personnes aient aimé avant de demander quel moteur elle utilise.
