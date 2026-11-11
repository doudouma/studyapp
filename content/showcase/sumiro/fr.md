---
summary: Un jeu de samouraï 3D jouable, livré en 24 heures par un seul développeur avec six outils IA — l'article décompose les 24 heures en six étapes, deux préconditions et deux points où le reproduire coince.
tags: [Jeu IA, Three.js, Blender, Claude Code, Prototype de Jeu, Flux de Travail]
facts:
  - key: build time
    value: 24 heures (affirmation de l'auteur)
    highlight: true
  - key: tools
    value: 6 — Opus 5.5 · Flux 3 Max · GPT Image · Tripo · Blender · Three.js
  - key: author
    value: Shikhar (@xikhar) · troisième jeu fait avec l'IA
  - key: platform
    value: Navigateur · gratuit
  - key: playtime
    value: 30–40 minutes
  - key: launch
    value: 2,6 M de vues en deux jours
  - key: inspiration
    value: Video2Game d'OdinLovis
---

## Le jeu

Le 4 novembre 2026, le développeur Shikhar a publié Sumiro — une aventure de samouraï en style encre qui tourne gratuitement dans le navigateur. Un voyageur au chapeau de paille traverse des falises brumeuses, des toriis et des escaliers de pierre ; il grimpe, emprunte des ascenseurs et enchaîne les chapitres, pour une partie de 30 à 40 minutes. Le thread de lancement a dépassé 2,6 millions de vues en deux jours.

![L'écran-titre de Sumiro : style encre, le samouraï debout sur l'eau](/showcase/sumiro-title.jpg)

![Extrait de la démo en jeu (de l'original de 97 secondes), la partie la plus réussie du projet](/showcase/sumiro-demo.gif)

Sa phrase : « Maintenant, tout le monde peut faire des jeux. » L'article chinois dont nous nous inspirons passe sa longueur sur ce que cette phrase omet — les vraies 24 heures, et les conditions derrière elles.

## Comment les 24 heures ont été réparties

Six étapes, six outils prêts à l'emploi (Opus 5.5, Flux 3 Max, GPT Image, Tripo, Blender, Three.js). Chaque étape nourrit la suivante :

1. **Commencer par une vidéo, pas par du code.** Flux 3 Max génère un court clip de référence — cette vidéo est la bible visuelle du projet. Monde, personnage, palette, caméra : tout en dérive, selon l'approche Video2Game d'OdinLovis.
   ![Le produit de l'étape 1 : le clip de référence dont dérive chaque scène](/showcase/sumiro-step1-reference.jpg)
2. **Découper la vidéo en scènes.** Les captures deviennent des assets reconstruits dans Blender et placés dans Three.js. Le détail facile à rater : des flux dynamiques dans Claude Code, avec plusieurs agents qui construisent et se vérifient en parallèle — « une troupe d'agents qui travaille séparément et se contrôle », pas un seul agent de bout en bout.
   ![Le résultat de l'étape 2 : cascade, toriis et escaliers, tout reconstruit à partir de captures vidéo](/showcase/sumiro-step2-scenes.jpg)
3. **Construire le personnage.** Quatre vues de profil générées avec GPT Image à partir d'une capture, Tripo les transforme en modèle 3D, Opus ajoute physique des tissus et animation.
   ![Comment quatre vues de profil deviennent un personnage 3D animé (accéléré)](/showcase/sumiro-step3-character.gif)
4. **Jouer d'abord.** Toute l'étape tient en une phrase : jouer le prototype avant d'empiler davantage, confirmer qu'il tourne vraiment. Le seul geste du pipeline qui va contre l'instinct de l'IA.
5. **Laisser les agents remplir les niveaux.** GPT Image génère l'art conceptuel de chaque niveau dans le style verrouillé, jusqu'à huit images par niveau ; chaque concept devient un niveau 3D jouable.
   ![Étape 5 : art conceptuel de niveaux généré par GPT Image dans un style unique — une image par niveau](/showcase/sumiro-step5-concepts.jpg)
6. **Boucler.** Jouer, signaler les bugs, laisser les agents corriger, rejouer.
   ![De l'image conceptuelle à un niveau jouable (accéléré)](/showcase/sumiro-step6-level.gif)

## Ce que la phrase choc omet

L'article pose deux préconditions avant de répéter « tout le monde peut faire des jeux » :

**24 heures, c'est un chiffre de troisième jeu, pas de premier jeu.** Avant Sumiro, Shikhar avait déjà sorti Spiderbench (un jeu Spider-Man dans le navigateur — celui-là a pris trois jours et un abonnement Claude 5x) et Walden, un duel de katanas qu'il appelle son premier prototype. Les leçons payées cher — aligner les assets Blender avec Three.js, empêcher les agents parallèles de se marcher dessus, éviter que les tissus traversent le corps — l'ont toutes été avant que cette horloge de 24 heures ne démarre.

**Deux pans que le pipeline ne couvre pas.**

> La musique est le seul pan non résolu : les modèles n'entendent pas, donc il faut une chaîne d'outils séparée pour la génération musicale — la septième étape, hors des six.

L'autre lacune, ce sont les contrôles : la vidéo de démo semble raide parce qu'elle a été pilotée par l'agent et enregistrée par script. Une vraie personne aux commandes joue bien mieux — mais ce n'est pas la partie produite par les 24 heures.

## Les deux points où le reproduire coince vraiment

* **Juger la vidéo de référence.** Ouvrir les outils, tout le monde sait le faire. Le difficile, c'est de savoir si la vidéo suffit — si le style peut porter un niveau, si la silhouette du personnage se lit bien, si la palette devient boueuse en 3D. Se tromper ici gaspille les cinq autres étapes.
* **L'étape 4 est réservée aux humains.** L'IA adore continuer à ajouter — assets, art conceptuel, niveaux ; elle ne fatigue jamais. Mais jouer au prototype avant de poursuivre est un jugement que seule une personne peut porter ; l'auteur en a fait une étape à part entière parce qu'il avait déjà payé pour l'avoir sautée.

## Verdict

> **À lire comme une histoire de compression, pas de démocratisation.**
> Le chiffre fait peur — 24 heures, six outils, un jeu jouable — mais il appartient à quelqu'un qui avait déjà fait deux jeux et enjambé chaque trou avant. Les outils relèvent beaucoup le plancher ; le plafond reste à ceux qui continuent de s'entraîner. Sur les six étapes, le jugement de l'étape 1 est le seul qui ne se copie pas ; le reste se suit tel qu'écrit.

## Attribution

Cas assemblé à partir de l'article chinois de 挥码天涯（大黑猫） « 用 AI 做游戏的完整流程 », du thread de lancement de Shikhar lui-même et de couvertures tierces. Le chiffre de 24 heures est une affirmation du développeur, reprise (non vérifiée de façon indépendante) par AIGamer et d'autres médias.

Les images de ce cas proviennent de l'article d'analyse et du thread de Shikhar ; les droits restent aux éditeurs d'origine.
