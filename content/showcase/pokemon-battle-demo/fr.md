---
summary: "Une démo jouable de combats Pokémon réalisée avec Claude Opus 5.5 en quelques heures — JavaScript pur et Three.js, tous les assets générés par IA."
tags: [Pokémon, Claude Opus, Three.js, Pixel art, Démo fan, Généré par IA]
facts:
  - key: author
    value: u/Chemical_Deer_512 · « Built with Claude »
  - key: models
    value: Claude Opus 5.5 (high) · modèle d'image pour le fond
  - key: build time
    value: Quelques heures, en une seule session
    highlight: true
  - key: stack
    value: JavaScript pur + Three.js · sans moteur de jeu
  - key: assets
    value: Sprites · SFX · musique · animations via IA, retouchés à la main
  - key: status
    value: Démo fan gratuite · sans affiliation avec Nintendo
---

## Qu'est-ce que c'est

Une démo jouable de combats Pokémon en 3D par u/Chemical_Deer_512, construite en quelques heures après être resté « scotché » par le nouveau modèle Opus. Inspiré par un post viral sur Twitter, l'auteur s'est lancé le défi de transformer le hype en quelque chose d'interactif — et a livré un combat fonctionnel sur [pokemon-battle-sim-1vq.pages.dev](https://pokemon-battle-sim-1vq.pages.dev/). Quasiment tout est sorti de Claude Opus 5.5 en mode high : sprites, effets sonores, musique et animations ; seul le fond provient d'un modèle d'image distinct. C'est une démo fan gratuite, explicitement sans affiliation avec Nintendo.

## Proposition de valeur

* **Sans moteur, sans framework** : tout le combat tourne sur du JavaScript pur + Three.js — pas d'Unity, pas de Godot, pas de middleware commercial — prouvant jusqu'où un modèle de code seul peut porter une boucle de jeu 3D.
* **Pipeline de sprites par prompt** : les sprites pixel art ont été recréés en demandant au modèle de reproduire des images de référence, puis retouchés « sur les marges » à la main — une recette reproductible pour générer des assets de style fan.
* **Paquet audiovisuel complet dans un seul modèle** : SFX, musique et animations sont tous sortis de la même session Opus, pas de banques de sons ni de prestataires.
* **Jouabilité instantanée** : déployée sur Cloudflare Pages, jouable dans le navigateur sans aucune installation.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Moteurs de jeu pour petites démos | Élevée | Pour une démo de combat à scène unique, JS + Three.js orchestrés par un LLM remplacent entièrement le surcoût du moteur. |
| Banques de SFX/musique libres | Élevée | Les effets et la musique générés par IA ont couvert tout le volet audio dans la même session. |
| Commandes de pixel art | Modérée | Les recréations à partir d'images de référence approchent le résultat, mais l'auteur a quand même retouché les marges à la main. |
| Les vrais jeux Pokémon | Faible | Une démo technique de quelques heures, pas un jeu complet — mécaniques et roster restent superficiels. |

## Réalités actuelles et limites

* **La mine de PI** : la démo emprunte la propriété intellectuelle de Nintendo, et la blague récurrente de la communauté — l'équipe juridique de Nintendo et un éventuel DMCA/mise en demeure — est un risque réel pour tout ce qui prend de l'ampleur.
* **Bizarreries de la logique générée** : les comportements de combat ont des anomalies, p. ex. le *Rock Throw* de Geodude frappe le sprite du joueur au lieu de Charmander quand il rate — du code généré classique non relu.
* **Périmètre de quelques heures** : quelques heures de construction signifient mécaniques superficielles, roster limité et aucune progression ; le poli est large, pas profond.

## Verdict

> **Recommandation principale**
> Jouez-y comme à un benchmark, gardez-la comme un plan. C'est l'une des démonstrations les plus claires qu'un modèle de code de pointe peut livrer une démo 3D polie et jouable en une soirée — et sans moteur. Clonez le *pipeline* (sprites depuis des images de référence, audio dans la même session, déploiement instantané) pour vos propres personnages originaux ; n'arrimez simplement pas un vrai produit à la PI de quelqu'un d'autre.

## Cycle de développement et itération

Une seule soirée de développement par prompts, de l'inspiration Twitter à la démo déployée :

| Étape | Modèle / outil utilisés | Focus |
| --- | --- | --- |
| Jeu central | Claude Opus 5.5 (high) | Logique de combat, scène Three.js, animations |
| Sprites | Opus, recréant les pixel sprites d'après des images de référence | Retouche manuelle « sur les marges » après génération |
| Audio | Opus | Effets sonores et musique |
| Fond | Modèle d'image | Décor de la scène de combat |
| Déploiement | Cloudflare Pages | URL publique instantanée sur pages.dev |

## Métriques et monétisation

* **Coût/temps** : quelques heures de l'idée à la démo déployée ; aucune API payante mentionnée en dehors de l'abonnement au modèle.
* **Monétisation** : aucune — une démo fan gratuite, explicitement non commerciale et sans affiliation avec Nintendo/Pokémon.
* **Traction** : accueil chaleureux sur r/ClaudeAI avec de vifs éloges pour le poli et la vitesse de développement ; pas de chiffres utilisateurs publics.

## Réception communautaire et débats clés

La réaction au fil s'est partagée entre ravissement, frayeur et chasse aux bugs :

* **Émerveillement devant le poli et la vitesse** : la réponse dominante a salué le rendu visuellement complet d'une construction de « quelques heures ».
* **La question Nintendo** : blagues et avertissements sincères sur les DMCA et mises en demeure reviennent en boucle — la communauté considère que les démos IA enfreignant la PI vivent à crédit.
* **Les bizarreries du code généré comme genre à part** : les commentateurs ont échangé leurs observations d'anomalies logiques de l'IA, comme ce *Rock Throw* qui frappe le mauvais sprite sur un échec — un argument implicite pour faire relire la logique de jeu par des humains, et pas seulement les visuels.
