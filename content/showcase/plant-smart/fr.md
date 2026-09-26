---
summary: "Base de données gratuite et sans pub des plantes toxiques pour les animaux : gravité, symptômes et recherche inversée, API ouverte, données d'ASPCA et iNaturalist."
tags: [Sécurité animale, Base de données de plantes, API ouverte, Données ouvertes, Sans pub]
facts:
  - key: author
    value: u/WilhelmCodes
  - key: price
    value: Gratuit · sans pub · sans compte
    highlight: true
  - key: lookup
    value: Par nom de plante ou par symptômes (recherche inversée)
  - key: data sources
    value: ASPCA · iNaturalist · curé par des humains, sans IA
  - key: api
    value: API ouverte · données ouvertes avec attributions
  - key: age
    value: 3,5 ans d'âge, refait à neuf récemment
---

## Qu'est-ce que c'est

Plant Smart est une base de données gratuite des plantes toxiques pour les animaux, créée par u/WilhelmCodes pour en finir avec la panique classique du propriétaire de plantes : vous voyez une jolie plante, vous avez des animaux à la maison, et vous voilà dix onglets plus loin dans des pages contradictoires pleines de pub. Construite il y a 3,5 ans et récemment retapée, elle vit sur [plantsm.art](https://plantsm.art) et a été partagée sur r/InternetIsBeautiful pour jauger l'intérêt.

## Proposition de valeur

* **Recherche par nom de plante, commun ou scientifique** : gravité, animaux concernés et symptômes à surveiller en une seule requête, au lieu de dix onglets.
* **Recherche inversée par symptômes** : si votre animal présente déjà des symptômes, cherchez par ceux-ci et resserrez la liste jusqu'à la plante coupable.
* **Gratuit, sans pub, sans boue** : sans compte, sans publicité, et chaque entrée est curée depuis des sources vérifiées avec attributions — des données explicitement non générées par IA.
* **API ouverte** : le jeu de données est ouvert et l'API est là pour construire dessus ; les données survivent au site.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Dix onglets de recherches sur la toxicité | Élevée | Une base curée répond gravité, animaux concernés et symptômes en une seule requête. |
| Fermes de contenu SEO sur la toxicité | Élevée | « Sans boue » par conception : données non-IA curées de sources vérifiées comme ASPCA et iNaturalist. |
| Applications commerciales d'identification de plantes | Modérée | Pensée pour la toxicité animale plutôt que l'identification photo ; il faut connaître le nom de la plante. |
| Centre antipoison vétérinaire | Faible | Un guide, pas un outil de diagnostic — une urgence va toujours d'abord chez le vétérinaire. |

## Réalités actuelles et limites

* **Pas d'identification photo** : la recherche fonctionne par nom (commun ou scientifique), donc il faut savoir comment s'appelle la plante avant de la vérifier.
* **Anglais uniquement pour l'instant** : l'internationalisation avec des noms communs localisés est sur la feuille de route mais pas encore livrée.
* **Un guide, pas un vétérinaire** : les données de gravité et de symptômes éclairent les décisions ; elles ne remplacent pas un avis professionnel quand un animal a vraiment avalé quelque chose.
* **Jeu de données encore en nettoyage** : l'auteur corrige activement les entrées pour la précision et ajoute de nouvelles sources ouvertes fiables, donc des détails peuvent changer.

## Verdict

> **Recommandation principale**
> Mettez-la en favori si vous partagez votre maison entre animaux et plantes. La recherche inversée par symptômes est la fonctionnalité tuerie — c'est précisément le moment de panique où dix onglets font le plus de mal — et l'API ouverte en fait une base propre pour quiconque construit des outils de sécurité animale. C'est un utilitaire de référence bien fait : gratuit, sans pub, sourcé, et qui s'améliore en public.

## Cycle de développement et itération

Un projet solo de longue durée qui a utilisé ses débuts sur Reddit comme ronde de feedback concentrée :

| Étape | Outils | Focus |
| --- | --- | --- |
| Construction initiale | Développement solo, il y a 3,5 ans | Base de données centrale, recherche et données de gravité |
| Retouche | « Coup de peinture fraîche » | UI modernisée qui a motivé le lancement public |
| Itération communautaire | Feedback Reddit, implémenté en quelques jours | Filtrage par continent/pays, index des noms communs + scientifiques, galerie de plantes sûres avec photos iNaturalist |
| Curation des données | Sources ouvertes vérifiées (ASPCA, iNaturalist) | Jeu de données sans IA avec page publique d'attributions ; nettoyage de précision en cours |

## Métriques et monétisation

* **Monétisation** : aucune visible — entièrement gratuit, sans pub, sans compte.
* **Ouverture** : API ouverte et données ouvertes, toutes les sources listées sur la page d'attributions.
* **Traction** : partagée sur r/InternetIsBeautiful pour jauger l'intérêt ; l'auteur a implémenté la plupart des suggestions en deux rondes d'édition et enrichit le jeu de données avec de nouvelles sources fiables.

## Réception communautaire et débats clés

Le fil a bien reçu, et fait plus rare, la boucle de feedback s'est refermée presque immédiatement :

* **Les suggestions sont devenues des fonctionnalités** : le filtrage par continent et pays, l'index élargi des noms communs + scientifiques et la galerie de plantes sûres avec photos de référence d'iNaturalist ont tous été livrés après le fil de lancement.
* **La provenance comme gage de confiance** : la confirmation de l'auteur que toutes les données sont non-IA et curées de sources vérifiées (ASPCA, iNaturalist) a résonné dans une communauté méfiante envers les réponses de fermes de contenu.
* **Demande de localisation** : les noms communs localisés ont été identifiés comme le prochain besoin majeur — la feuille de route inclut désormais le support multilingue.
