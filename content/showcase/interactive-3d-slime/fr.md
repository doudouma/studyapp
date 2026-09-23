---
summary: Un tutoriel Codex + GPT-6 pour créer un slime gélatineux translucide et pressable avec WebGPU dans Three.js, avec l'ensemble complet des prompts inclus.
tags: [Three.js, WebGPU, Tutoriel, Généré par IA, Interactif]
---

## C'est quoi

C'est un tutoriel chapitre par chapitre qui vous guide pour construire un slime gélatineux 3D pressable comme un vrai jouet de navigateur, avec Codex + GPT-6, Three.js et WebGPU natif. Il s'agit d'une véritable scène 3D — maillages, éclairage, matériaux physiques et caméra — et non d'une image collée sur un canvas : les deux yeux noirs et la petite bouche sont ancrés à la face avant du même maillage et se déforment avec le corps quand on appuie, qu'on tire vers le haut puis qu'on relâche.

La page finale associe une scène blanc chaud à un panneau de contrôle proposant cinq palettes de couleurs, la raideur, l'amortissement, l'échelle (65 %–115 %) et un bouton « Poke ». Un ensemble complet de prompts est fourni à la fin, un bloc par chapitre.

## Proposition de valeur

L'atout du tutoriel, c'est que l'écrasement est réel : un modèle de ressorts léger pilote un seul maillage continu, si bien que le visage et les reflets bougent avec la surface au lieu de glisser dessus.

- **Un maillage de gel continu** : une primitive en dôme est fusionnée avec plusieurs ellipsoïdes inférieurs via Marching Cubes, ce qui donne une base souple et étalée avec un vrai volume et une vraie courbure.
- **Des traits du visage solidaires** : les yeux et la bouche sont projetés depuis la face avant et partagent exactement la même passe `deform()` et les mêmes mises à jour de normales que le corps.
- **Translucidité uniquement WebGPU** : `MeshPhysicalNodeMaterial` et des nœuds TSL combinent teinte d'absorption, épaisseur, faible rugosité et reflets de studio, avec 640 microbulles instanciées pour la profondeur intérieure.
- **Prompts réutilisables** : cinq prompts de chapitre — objectif et maquette, page et entrée de rendu, maillage et translucidité, interaction et physique, packaging — à donner à Codex un par un.

## Ce qu'il peut remplacer

| Approche cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Clips produit 3D pré-rendus | Élevée | Remplace les boucles mp4 pré-calculées des visuels principaux par un canvas temps réel qui répond au pointeur. |
| Coller une image de mascotte 2D sur le canvas | Élevée | Remplace le raccourci de la fausse 3D par un maillage dont le visage et les reflets spéculaires se déforment ensemble sous la pression. |
| Prototypes sur moteur de jeu (Unity/Godot) | Partielle | Couvre un jouet interactif à objet unique dans le navigateur sans moteur ni build ; ne remplace pas un jeu complet. |
| Bacs à sable physiques (matter.js/rapier) | Modérée | Gère à moindre coût un corps mou stylisé à ressorts et gravité ; ce n'est pas une simulation précise de corps rigides ou de tissus. |
| Places de marché d'assets 3D | Faible | Le slime est entièrement procédural et n'achète aucun modèle, mais les personnages sur mesure exigent encore des outils de modélisation. |

## Réalités et limites actuelles

- **WebGPU est un prérequis strict** : aucun repli WebGL et la dégradation automatique de Three.js est désactivée à dessein, donc les navigateurs non compatibles voient une erreur et les contrôles sont désactivés.
- **Version figée** : le build fige Three.js 0.180.0 / r180 et utilise des propriétés internes (`_getFallback`, `backend.isWebGPUBackend`), donc une montée de version peut casser la vérification du backend.
- **Ciblage bureau** : les benchmarks ont été pris sur un M4 Pro avec un canvas de 990×720 ; le mobile et les GPU d'entrée de gamme ne sont pas évalués.

## Verdict

> **Recommandation principale**
>
> Un bon modèle pour les développeurs qui veulent un vrai jouet 3D déformable dans le navigateur — et une référence claire pour figer le WebGPU natif au lieu de retomber silencieusement sur WebGL.

## Cycle de vie du développement et boucle d'itération

Le build suit la même boucle que celle enseignée par l'article : choisir une maquette de référence, confier à Codex un chapitre à la fois, comparer le résultat à la maquette, puis itérer. La forme avant la matière — le maillage et ses traits du visage sont fixés d'abord, puis le shading de transmission et les bulles.

| Étape | Modèle utilisé |
| --- | --- |
| Maquette conceptuelle et base visuelle | Génération d'images GPT-6 |
| Mise en page et initialisation du WebGPU natif | Codex · GPT-6 |
| Maillage, traits solidaires et translucidité | Codex · GPT-6 |
| Interaction et réglage de la physique | Codex · GPT-6 |
| Reproduction et packaging | Codex · GPT-6 |

## Métriques et monétisation

Les benchmarks de la v0.8 ont été enregistrés sur un M4 Pro / 48 Go, Headless Chrome 152 / Metal 3, viewport 1440×1000, canvas 990×720, DPR 1 : 59,40 FPS au repos pendant 10,02 s, 59,26 FPS en interaction continue pendant 13,50 s, et un P95 du temps de frame de 16,8 ms.

Aucune monétisation : le tutoriel est distribué gratuitement, avec l'ensemble complet des prompts inclus pour être réutilisés.

## Débats clés et reproductibilité

Le parti pris délibérément non négociable est le tout-WebGPU. Le `WebGPURenderer` standard de Three.js peut retomber silencieusement sur WebGL 2, donc le tutoriel vérifie le nom de la classe et affirme `renderer.backend.isWebGPUBackend` ; si un appareil n'est pas disponible, il affiche une explication au lieu de se dégrader. C'est un compromis assumé : un rendu natif réel et un code de shader plus propre, contre une couverture d'appareils plus étroite.

La reproductibilité est la raison d'être de ce format : les cinq prompts sont ordonnés pour pouvoir rejouer le build chapitre par chapitre, et la maquette de référence donne à chaque étape une cible visuelle fixe à comparer.

## L'ensemble complet des prompts

Donnez ces prompts à Codex dans l'ordre, un chapitre à la fois. La maquette du Prompt 01 sert de référence de calibrage pour tous les chapitres suivants.

### Prompt 01 · Objectif et maquette visuelle

```text
Crée dans le projet actuel une page web interactive avec un slime 3D en utilisant Three.js et WebGPU natif. Les replis WebGL et les dégradations automatiques sont strictement interdits.

D'abord, génère une image de maquette conceptuelle pleine page, en enregistrant à la fois l'image et le prompt de génération, et attends ma confirmation avant d'implémenter. (Si aucun outil d'image n'est disponible, utilise l'image de référence fournie.)
La mise en page exige un fond blanc chaud et épuré, un titre chinois en gras « 捏捏，放轻松。 » (« Presse, détends-toi. ») et le sous-titre « 一团软乎乎，接住你的无聊。 » (« Un compagnon tout doux pour ton ennui. »).
À gauche : un slime gélatineux vert menthe semi-transparent avec un dôme, une base charnue et étalée, de fines bulles internes, des bandes lumineuses de studio et de subtiles ombres de contact. Deux petits yeux noirs et une bouche épousent étroitement la face avant.
À droite : un panneau de contrôle arrondi proposant couleur, raideur, amortissement, échelle et un bouton « Poke ». Beaucoup d'espace négatif, sans encombrement.

Le personnage final doit gérer l'écrasement localisé, le glissement vers le haut, le rebond élastique au relâchement et un atterrissage doux, avec des traits du visage qui se déforment sans couture avec la surface. Objectif 60 FPS et vérification sur du matériel réel à la fin.
```

### Prompt 02 · Page et entrée de rendu

```text
Crée une page web exécutable à partir de la maquette choisie. Utilise un fond blanc chaud #F8F6F3, une typographie en gras, une scène canvas 3D à gauche et un panneau de contrôle à droite (repositionné en dessous sur mobile/écrans étroits).
Organise proprement le projet en fichiers séparés : mise en page, génération de maillage, physique de corps mou et initialisation WebGPU. Conserve le design de référence sans simuler la 3D en collant l'image sur le canvas.

Fige et embarque localement Three.js 0.180.0 / r180. Demande un appareil WebGPU natif, désactive les mécanismes de repli automatique vers WebGL de cette version et vérifie le backend actif après l'initialisation du renderer.
Si tu utilises des propriétés internes, documente explicitement les contraintes de version.
Affiche une explication à l'utilisateur, désactive les contrôles et arrête les boucles d'exécution si WebGPU est indisponible, échoue à s'initialiser ou perd le contexte.

Lance un serveur local, fournis l'URL locale et confirme dans un vrai navigateur que la scène se charge proprement sans créer de contexte WebGL.
```

### Prompt 03 · Maillage, traits du visage et translucidité

```text
Construis un maillage de gel 3D lisse et continu d'après la référence cible, avec un dôme arrondi, une base douce et charnue et une profondeur de volume suffisante. Ne le remplace pas par une sphère rigide standard.
Génère les yeux et la bouche ancrés aux coordonnées de la face avant, en partageant exactement la même logique de déformation et les mêmes mises à jour de normales que le corps, afin de conserver des reflets continus et lisses sur tout le visage.

Implémente des matériaux de transmission physique compatibles WebGPU combinant teinte d'absorption, cartes d'épaisseur, faible rugosité et reflets d'environnement doux pour obtenir un gel turquoise lumineux. Maîtrise le coût avec des maillages instanciés pour les microbulles internes.
Garde la base plus claire et plus légère à l'aide de coordonnées de repos locales, pour que les zones restent stables pendant l'étirement et le glissement.

Fige la caméra, le viewport, la couleur de base et l'échelle, capture une vraie capture d'écran du navigateur, compare contours, volume et translucidité à la référence, puis peaufine les détails subtils.
```

### Prompt 04 · Interaction et réglage de la physique

```text
Implémente la compression localisée, le glissement, le rebond élastique et une subtile collision avec le sol. Assure-toi que le corps, les traits du visage et les reflets spéculaires partagent le même pipeline de déformation, en mettant à jour un système léger ressort-amortisseur-gravité à pas de temps fixe.
Implémente 5 couleurs prédéfinies, la raideur, l'amortissement, une échelle de 65 %–115 % et une action « Poke ». Les opérations d'échelle doivent mettre à jour de façon synchrone le mapping des coordonnées pour les touches du raycast.
Gère élégamment l'annulation du pointeur, la perte de focus et les entrées rapides, pour éviter les états de glissement bloqués ou les éléments qui sortent du champ.

Inclus un chargeur de gel qui respire doucement pendant la préparation initiale des ressources, avec une transition fluide une fois que le GPU a terminé le coût de sa première frame, avant d'activer les contrôles utilisateur. Respecte les réglages 'prefers-reduced-motion'.

Teste minutieusement les interactions, les variantes de couleur, les valeurs limites d'échelle, les vues mobiles et les états d'erreur. Profile et rapporte les FPS soutenus (au repos et en activité), en enregistrant les specs de l'appareil, la version du navigateur, la taille du viewport, le DPR, la durée d'échantillonnage et toute chute de frame au 95e percentile.
```

### Prompt 05 · Reproduction et packaging

```text
Organise et valide ce projet de slime 3D afin qu'il puisse être reproduit de manière fiable dans d'autres environnements.

Regroupe index.html, les styles, les fichiers source src/, les dépendances locales vendor et les licences dans un ZIP complet, accompagné d'un README sans chemin absolu.
Documente les prérequis, les commandes de lancement local, les URL, les solutions en cas de port occupé et les procédures de sortie propre, en soulignant les exigences strictes de WebGPU.
Effectue une exécution en environnement propre directement depuis l'archive décompressée pour vérifier l'absence de dépendance manquante.

Enregistre une brève capture d'écran du navigateur montrant les interactions presser, glisser, déposer, recolorer et piquer.
Inclus une comparaison côte à côte entre l'image de référence initiale et le rendu WebGPU actuel, en signalant les écarts visuels et les critères de performance mesurés.
Fournis des URL de démo en direct, des liens de téléchargement, et insère les prompts de chapitre réutilisables de façon séquentielle dans la documentation.
```
