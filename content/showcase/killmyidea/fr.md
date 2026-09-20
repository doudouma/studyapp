---
summary: "Un outil rapide de validation d'idées de startup qui évalue les pitches selon 10 critères en parallèle grâce au modèle déterministe Jev de TypeSafe."
tags: [Validation d'idées, Classification, Open source, IA en parallèle, Preuve de concept]
facts:
  - key: models
    value: TypeSafe Jev
  - key: author
    value: stemonte
  - key: platforms
    value: Web
  - key: price
    value: Gratuit (open source)
  - key: latency
    value: ~539 ms
    highlight: true
  - key: output
    value: Score quantitatif de 0 à 100 (non génératif)
---

## Ce que c'est

KillMyIdea est une preuve de concept open source conçue pour mettre à l'épreuve le modèle non génératif Jev de TypeSafe. Plutôt que de s'appuyer sur un LLM conversationnel classique qui produit un raisonnement en langage naturel, il reçoit un pitch d'idée et exécute en parallèle une dizaine de questions d'évaluation ciblées. En une fraction de seconde, le système renvoie un score numérique composite de 0 à 100 accompagné de classifications de diagnostic fines (comme « SHIP IT » ou « FIX IT »).

## Proposition de valeur

- **Zéro bavardage génératif** : élimine les digressions conversationnelles et la dérive des prompts grâce à un modèle déterministe qui ne produit que des probabilités quantitatives, et non du texte.
- **Évaluation parallèle en moins d'une seconde** : exécute toutes les requêtes d'évaluation simultanément et fournit un retour complet sur plusieurs axes en environ 500 millisecondes au lieu de 30 à 60 secondes.
- **Grilles multifactorielles pondérées** : note des axes indépendants comme la Demande, la Clarté du client et la Faisabilité de construction sur des échelles fixes de 0 à 4, en accordant un poids plus fort aux facteurs critiques tels que le besoin de marché et les problèmes réels.
- **Calibration selon l'objectif** : prend en charge les objectifs du projet (comme Open source ou Juste pour le plaisir) afin de ne pas pénaliser les idées qui évitent volontairement la monétisation.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Prompts de validation avec un LLM standard (ChatGPT / Claude) | Partielle | Remplace les lentes réponses génératives de 30 à 60 secondes par une classification déterministe instantanée, mais sans explications qualitatives. |
| Tableurs manuels de notation d'idées | Élevée | Remplace la notation manuelle de grilles pour des vérifications rapides lors de hackathons ou de séances initiales de brainstorming. |
| Revue de pitch par un mentor humain | Faible | Ne peut remplacer une étude de marché approfondie, une expertise réglementaire du domaine ni les nuances contextuelles. |

## Réalités et limites actuelles

- **Évalue le pitch, pas le marché** : le modèle sous-jacent évalue la formulation descriptive du pitch par rapport à des grilles linguistiques calibrées ; il n'interroge pas de données de marché en direct et ne vérifie pas la réalité extérieure.
- **Aveugle aux réglementations du secteur** : des barrières spécifiques comme la conformité régionale, les licences ou des obstacles juridiques complexes ne sont pas prises en compte, sauf si elles sont explicitement détaillées dans le prompt.
- **Absence de récit qualitatif** : comme le modèle ne renvoie que des chiffres et des niveaux discrets, l'utilisateur n'obtient aucune explication écrite sur les raisons d'un score faible pour une métrique donnée.
- **Pondération heuristique** : le score composite provient d'une moyenne pondérée définie par l'auteur, et non d'un référentiel reconnu du capital-risque.

## Verdict

> **Recommandation principale**
> Utilisez KillMyIdea comme un contrôle de cohérence ultra-rapide et objectif pour repérer une formulation faible ou un public cible mal défini avant de rédiger des propositions complètes.

KillMyIdea prouve que des modèles d'évaluation non génératifs comme Jev peuvent réduire drastiquement la latence et éliminer la variance non déterministe dans les flux automatisés. Même s'il ne doit pas être considéré comme un verdict de marché faisant autorité, il constitue un filtre de tri efficace en première passe pour les développeurs, les fondateurs et les pipelines d'agents.

## Cycle de vie et boucle d'itération

Le projet a été implémenté sous forme d'application web open source ([code source de killmyidea](https://github.com/monteduro/killmyidea?utm_source=gemini)) afin d'expérimenter l'accès direct au modèle Jev de TypeSafe. Les itérations issues des retours de la communauté ont ajouté un flux « Refine Idea » et des paramètres d'objectif optionnels pour ajuster la logique de notation des projets non commerciaux.

| Étape | Modèle utilisé |
| --- | --- |
| Formulation de la grille et conception des questions | LLM général (GPT) avec affinage de l'auteur |
| Classification parallèle en temps réel | TypeSafe Jev |
| Agrégation finale du score et seuillage | Pondération algorithmique client/serveur (TypeScript) |

## Métriques et monétisation

- **Prix** : entièrement gratuit.
- **Licence** : open source dans un dépôt public accessible.
- **Performance** : capable d'évaluer 10 grilles distinctes simultanément en environ 539 millisecondes.
- **Monétisation** : aucune directe ; conçu comme démonstration technique et POC pour les retours des développeurs.

## Accueil de la communauté et débats clés

- **Prévisibilité déterministe** : les développeurs ont salué la vitesse parallèle et la nature non générative de Jev, soulignant son potentiel comme garde-fou déterministe pour les architectures agentiques.
- **Scepticisme sur la notation** : des commentateurs ont d'abord demandé si les scores différaient réellement de nombres pseudo-aléatoires, ce qui a conduit l'auteur à clarifier la mécanique de la grille calibrée de 0 à 4.
- **Craintes sur la collecte de données** : certains utilisateurs hésitaient à soumettre des idées de startup propriétaires, ce qui a poussé l'auteur à mettre en avant un interrupteur explicite de refus qui empêche le stockage du pitch.
