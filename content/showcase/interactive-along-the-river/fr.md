---
summary: "Une expérience web interactive à défilement horizontal 2D qui fait revivre le paysage urbain de la dynastie Song du « Le Long de la rivière lors de la fête Qingming »."
tags: [Canvas-2d, Assisté par IA, Art interactif, Patrimoine culturel]
facts:
  - key: author
    value: Xian | 弦 (@Xian0063)
  - key: platforms
    value: Web (navigateur)
  - key: tech stack
    value: Canvas 2D · HTML · CSS · JavaScript
  - key: models
    value: Codex
  - key: characters
    value: 141
    highlight: true
  - key: world width
    value: 6 516 unités sur 3 quartiers
  - key: tests
    value: 48 tests automatisés
  - key: backend
    value: Aucun (100 % côté client)
---

## Ce que c'est

Interactive Along the River During the Qingming Festival est une expérience web horizontale entièrement côté client développée par Xian | 弦. Plutôt que de découper ou de faire défiler la peinture historique statique, le projet reconstruit tout un paysage urbain parcourable de la dynastie Song à l'aide de ressources générées par IA, d'un rendu dynamique par calques et du Canvas 2D natif du navigateur. L'utilisateur pilote un avatar central à travers trois quartiers urbains animés, où il croise des citadins autonomes, des événements narratifs déclenchés, des changements de météo et des manœuvres de bateaux sur la rivière.

## Proposition de valeur

Le projet transforme un rouleau panoramique passif, vu à vol d'oiseau, en un monde vivant et interactif à hauteur de sol :

- **Monde 2D multicouche parcourable** : affiche 141 personnages dynamiques sur la berge, des intérieurs de boutiques en calques, des ponts et des voies d'eau sur 6 516 unités de monde, sans dépendre de moteurs 3D lourds.
- **Physique environnementale contextuelle** : le placement des pieds est calculé en fonction de la hauteur des ponts et des contours transparents des sprites, ce qui évite que les personnages flottent ou traversent le sol en se déplaçant.
- **Enchaînement d'événements narratifs** : les échanges entre PNJ — livraison de thé, passage de tissu, marchandage au marché — partagent le rendu d'un objet unique afin d'éviter les bugs visuels de props dupliqués.
- **Manœuvre interactive des bateaux (« Passer le pont Arc-en-ciel »)** : l'utilisateur tire des cordes de remorquage avec un retour de tension variable pour aider les barges à franchir l'arche du pont, débloquant des esquisses d'illustration à collectionner.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Visionneuses statiques de musée numérique avec zoom/défilement | Élevée | Remplace les visionneuses passives de zoom et de défilement par une immersion historique interactive et jouable pour les expositions culturelles. |
| Recréations 3D lourdes sous WebGL / Three.js | Modérée | Remplace les flux complexes de modélisation 3D lorsque la fidélité visuelle repose sur d'authentiques traits d'encre 2D et un rendu léger par calques. |
| Jeux éducatifs historiques narratifs | Faible | Ne peut pas remplacer entièrement les jeux narratifs complets, faute de persistance côté backend, d'inventaire ou de dialogues ramifiés. |

## Réalités et limites actuelles

- **État purement côté client** : conçu sans service backend, ce qui signifie que la progression de l'utilisateur, les illustrations obtenues et les états d'interaction personnalisés ne se synchronisent ni entre appareils ni entre sessions.
- **Chutes de performance avant optimisation** : la forte densité de personnages sans culling à l'écran faisait chuter la fréquence d'images à 25 FPS avant l'ajout du culling par viewport et de la limitation de la fréquence de mise à jour.
- **Cas limites occasionnels de tri des sprites** : l'ordre strict des calques 2D a exigé des corrections manuelles ciblées pour empêcher les personnages de s'enfoncer dans le mobilier ou de se détacher des rambardes du pont.
- **Pas de profondeur 3D complète** : comme la caméra utilise une projection orthographique 2D, l'utilisateur ne peut ni s'engager dans les ruelles latérales ni explorer la profondeur derrière les façades donnant sur la rue.

## Verdict

> **Recommandation principale**
> Une référence inspirante pour la préservation du patrimoine numérique et le vibe coding. Elle prouve que combiner synthèse visuelle par IA et rendu par calques en Canvas 2D peut transformer l'art classique en environnements interactifs et réactifs, sans la charge des moteurs 3D lourds.

## Cycle de vie et boucle d'itération

L'auteur est parti d'objectifs d'expérience fonctionnelle plutôt que d'une bible artistique finalisée, en donnant à Codex des règles essentielles : format à défilement horizontal, paysages urbains navigables, comportements de PNJ indépendants et thèmes de l'ère Song. Après que Codex a généré un modèle artistique de base cohérent, avec des lavis d'encre sobres et des tons terreux peu saturés, le reste de l'environnement s'est déployé sur trois zones continues.

| Étape | Modèle / outil utilisé | Objectif et résultat |
| --- | --- | --- |
| Définition des règles visuelles et base conceptuelle | IA générative et Codex | A établi le passage d'une vue à vol d'oiseau à des façades orthogonales ; a produit les tuiles architecturales de base. |
| Moteur central et architecture en calques | Codex (Canvas 2D / JS) | A séparé le monde en 7 plans de rendu distincts (arrière-plan, intérieurs de boutiques, props au premier plan, piétons, eau, météo, UI). |
| Réglage des collisions et de la locomotion | Codex | A ajouté la détection de hauteur de pont sur les deux pieds et le calcul du placement du pied par masque alpha. |
| Refactorisation des performances et tests | Codex | A mis en place le culling de frustum par viewport, la pré-mise à l'échelle des sprites et 48 suites de tests automatisés pour la logique des ponts et de la météo. |

## Métriques et monétisation

- **Portée utilisateurs** : plus de 3 400 vues et des dizaines de reposts/enregistrements quelques heures après la publication sur X.
- **Monétisation** : expérience web gratuite, sans monétisation, paywall ni dépendance à un backend.
- **Échelle** : s'étend sur 3 grands quartiers urbains (6 516 unités de coordonnées), avec 141 PNJ individuels et 7 rencontres commerciales et quotidiennes scénarisées.
- **Performance de rendu** : optimisée d'un goulot initial à 25 FPS jusqu'à environ 55 FPS fluides sur les navigateurs standards.

## Accueil de la communauté et débats clés

Les premières réactions sur les réseaux sociaux ont salué le passage des archives statiques de musées numériques à une gamification vivante et explorable. Les discussions entre développeurs web ont porté sur le choix de Canvas 2D plutôt que de Three.js, beaucoup louant l'architecture légère et le chargement rapide sur mobile. D'autres ont relevé l'équilibre habile dans la cohérence des ressources assistées par IA, notant que l'art généré conservait la sobriété atmosphérique des peintures des Song du Nord sans ressembler à un collage d'IA générique.
