---
summary: "Une promenade nocturne interactive en cinq chapitres dans un temple de montagne de Kyoto, rendue en direct avec Three.js et des plaques de scène générées par IA."
tags: [Three.js, WebGL, Art génératif, Narration interactive]
facts:
  - key: author
    value: Meng To
  - key: models
    value: GPT Image 2 · Claude
  - key: stack
    value: Three.js r149 · HTML · CSS · WebGL
  - key: stars
    value: 1600
    highlight: true
  - key: architecture
    value: Application web statique en fichier unique (sans build)
---

## Ce que c'est

Kage est une promenade nocturne interactive en cinq chapitres, exécutée dans le navigateur, à travers un temple de montagne stylisé de Kyoto. Conçu et dirigé artistiquement par Meng To aux côtés de Claude, le projet fusionne des éléments 3D procéduraux en Three.js avec des plaques de fond 2D générées par IA et des découpes superposées au premier plan, offrant une expérience narrative atmosphérique entièrement pilotée par le défilement de la page.

## Proposition de valeur

Le projet montre comment des ressources d'image génératives et un rendu WebGL procédural peuvent être combinés sans nécessiter de pipelines d'assets 3D lourds ni de systèmes de build à l'exécution.

- **Architecture statique sans build** : empaquetée dans un fichier `index.html` unique et autonome avec Three.js r149 intégré, sans paquets npm, bundlers ni dépendances de runtime distantes.
- **Profondeur hybride 2D/3D** : combine une géométrie procédurale à l'exécution (terrain, structures du temple, portiques torii, lanternes) avec des découpes WebP à canal alpha préservé et des plaques de fond haute résolution.
- **Chorégraphie synchronisée au défilement** : lie la translation de la caméra WebGL, les effets météorologiques dynamiques (brouillard, pluie, feuilles à la dérive) et l'éclairage directement à la progression du défilement.
- **Post-traitement cinématographique** : intègre un pipeline de bloom mesuré, une vignette, un flou de profondeur de champ dynamique et une typographie adaptative pensée pour mobile et bureau.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Moteurs de jeu 3D traditionnels (exports WebGL Unity / Unreal) | Modérée | Pratique pour le scrollytelling léger et les portfolios, mais ne remplace pas une physique de jeu interactive complexe ni une logique de jeu dynamique. |
| Sites de scrollytelling basés sur la vidéo | Élevée | Bien supérieur en efficacité de bande passante et en mise à l'échelle de résolution responsive par rapport au scrubbing vidéo plein écran pré-rendu. |
| Boilerplates 3D lourds Webpack/Vite | Élevée | Démontre que du code créatif de qualité commerciale peut être écrit et livré en HTML/JS statique pur et sans dépendances. |

## Réalités et limites actuelles

- **Strictement narratif et linéaire** : l'interaction est liée à la position de défilement et aux traînées du pointeur, sans contrôle de caméra en libre parcours ni chemins narratifs ramifiés.
- **Incohérence de génération des assets** : superposer des plaques génératives statiques 2D à des éléments 3D à l'exécution exige une direction artistique manuelle soignée pour éviter les décalages de perspective.
- **Licence restreinte** : bien que la bibliothèque sous-jacente Three.js reste sous MIT, le dépôt n'accorde aucune licence publique de réutilisation ou de redistribution pour le code et les assets visuels originaux de Kage.
- **Portée procédurale figée** : la géométrie de la scène et les variations architecturales sont générées de façon procédurale pour cette promenade précise, et ne fonctionnent pas comme un générateur de scènes polyvalent.

## Verdict

> **Recommandation principale**
> Kage est une étude de référence pour les designers web et les technologues créatifs qui cherchent à construire une narration interactive de haute fidélité. Il prouve que combiner la synthèse d'images par IA et un rendu WebGL procédural ciblé produit des résultats cinématographiques tout en contournant d'énormes pipelines d'assets et des environnements de build complexes.

## Cycle de vie et boucle d'itération

Le code a été conçu via un partenariat humain-IA entre Meng To et Claude, en s'appuyant sur des prompts explicites documentés dans `PROMPT.md` pour définir les règles de mise en page, le langage de mouvement et les paramètres de la scène procédurale.

| Étape | Modèle utilisé |
| --- | --- |
| Génération des plaques et découpes visuelles | GPT Image 2 |
| Implémentation du code et débogage de la mise en page | Claude |
| Direction artistique et composition | Meng To |

## Métriques et monétisation

- **Traction GitHub** : 1,6 k étoiles et près de 300 forks dans son premier mois de sortie.
- **Coût de distribution** : aucun coût de serveur à l'exécution ; conçu pour être servi directement depuis GitHub Pages ou tout hébergeur de fichiers statiques, sans infrastructure backend.
- **Modèle commercial** : expérience web publique gratuite ; sert de vitrine technique ouverte et d'étude fondatrice pour des compétences modulaires d'agents web.

## Accueil de la communauté et débats clés

Le projet a rapidement attiré l'attention des communautés du code créatif et du design IA pour son esthétique soignée et son empreinte technique légère. Les discussions portent souvent sur sa philosophie de fichier unique sans build, les développeurs louant la simplicité d'exécuter et de lire le code directement via `python3 -m http.server`. Des débats mineurs évoquent la contrainte de licence propriétaire sur le code source, en contraste avec l'esprit ouvert typique des expériences de code créatif sur le web.
