---
summary: "Une archive numérique permanente et un tableau d'affichage communautaire de post-its, créés en vibe coding."
tags: [Généré par IA, App web, Gratuit, Cloudflare, Vibe coding]
facts:
  - key: author
    value: alvinunreal
  - key: platforms
    value: Web (tous les navigateurs modernes)
  - key: version
    value: v0.1.0 · prototype en ligne
  - key: tech stack
    value: Nuxt · Hono · Cloudflare D1 · Workers AI
  - key: hosting cost
    value: $0 (offre gratuite)
    highlight: true
  - key: price
    value: Gratuit · accès communautaire
  - key: offline
    value: Non
---

## Qu'est-ce que c'est

[StickyArchive](https://stickyarchive.com/) est un mur numérique de post-its basé sur le web, qui offre aux notes de la communauté un tableau public, interrogeable et conservé de façon permanente. Construit comme la 69e livraison d'une série de développement rapide assisté par IA (« vibe coding »), il sert à la fois de toile publique et de micro-journal interactif.

Les utilisateurs peuvent parcourir et publier gratuitement dans le navigateur sans s'inscrire : les contributions passent par un mécanisme de modération automatique intégré, qui garde la barrière d'entrée basse tout en empêchant le spam d'envahir le mur.

## Proposition de valeur

Le projet comble l'écart entre les post-its locaux et temporaires du bureau et les espaces publics de micro-blogging.

- **Permanence maîtrisée** : les contributions sont archivées après une revue automatique, ce qui évite le spam désordonné et forme une chronologie d'idées communautaires sur le long terme.
- **Infrastructure sans maintenance** : entièrement bâtie sur l'écosystème serverless en périphérie de Cloudflare, elle conserve une latence très basse avec un coût d'hébergement serveur nul.
- **Isolation de la confidentialité à plusieurs niveaux** : prend en charge des murs thématiques publics visibles de tous et, suite aux premiers retours, a été rapidement étendue avec des Boards dédiés aux brouillons personnels et à l'organisation des prompts.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Microsoft Sticky Notes | Moyenne | Adapté à ceux qui veulent une synchronisation web entre appareils et un affichage public communautaire, mais sans widgets natifs épinglés ou ancrés au bureau. |
| Padlet | Moyenne | Alternative légère pour des tableaux publics sans abonnement complexe, mais sans gestion fine des permissions de niveau éducatif ou entreprise. |
| Twitter / X (micro-idées des débuts) | Partielle | Redonne l'expérience d'un fil sans algorithme pour consigner sans friction des humeurs brèves et des idées instantanées. |

## Réalités et limites actuelles

- **Pas de connexion push instantanée et persistante** : le mur dépend aujourd'hui d'actualisations manuelles de la page pour récupérer de nouvelles données ; la diffusion en temps réel par WebSocket ou SSE n'est pas encore en place.
- **Navigation dans les longues pages à améliorer** : lorsqu'on remonte de grands volumes de notes de dates passées, l'interface manque d'une barre de navigation flottante fixe et d'un raccourci « retour en haut ».
- **Peu de liberté de texte enrichi et de mise en page** : comparé aux outils de tableau blanc complets, les notes restent surtout du texte brut, sans mise en page avancée ni pièces jointes multimédias.

## Verdict

> **Recommandation principale**
>
> Une réserve d'idées sans friction et une capsule temporelle numérique publique pour les créateurs, les ingénieurs de prompts et les preneurs de notes du quotidien.

## Cycle de développement et stack technique

Toute l'application repose sur la stack de calcul en périphérie de Cloudflare, orientée vers un coût opérationnel minimal et une forte élasticité.

| Étape / Composant | Technologie utilisée |
| --- | --- |
| Framework frontend | Nuxt (Vue) |
| API backend | Hono |
| Base de données | Cloudflare D1 (SQL serverless) |
| Modération de contenu | Cloudflare Workers AI |
| Hébergement en périphérie | Cloudflare Pages / Workers |

> **Profil de coût**
>
> Coût total d'infrastructure en fonctionnement : **$0.00** (entièrement dans l'offre gratuite de Cloudflare).

## Métriques et monétisation

Le projet est aujourd'hui entièrement gratuit, sans paywall ni abonnement.

- **Retours et itération de la communauté** : après le lancement, il a rapidement attiré l'attention et récolté des votes sur [r/vibecoding](https://www.reddit.com/r/vibecoding/comments/1wh39qz/vibe_coding_random_websites_part_69_permanent/), et en moins de 24 heures l'auteur a livré une fonctionnalité Personal Boards en réponse aux demandes de la communauté pour stocker des prompts et des pensées privés.
- **Valeur du cas** : en tant qu'app native de la périphérie, il montre comment un développeur solo, avec des outils de programmation par IA, peut lancer en quelques jours et soutenir un trafic public à coût opérationnel nul.
