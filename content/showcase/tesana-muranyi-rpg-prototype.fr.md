---
summary: "Une démo d'action fantastique 3D à la troisième personne, créée en vibe coding en deux jours avec le modèle muranyi-3 de Tesana et 39 prompts."
tags: [Vibe Coding, Développement de jeux, Prototype IA, RPG]
facts:
  - key: models
    value: muranyi-3
  - key: token cost
    value: $90
    highlight: true
  - key: prompts
    value: 39
  - key: development time
    value: 2 jours
  - key: engine
    value: Tesana (surcouche basée sur Godot)
  - key: genre
    value: Fantasy 3D à la troisième personne / MOBA
---

## De quoi s'agit-il

Tesana Muranyi-3 RPG Prototype est un projet expérimental de fantasy 3D à la troisième personne, généré par prompting itératif en langage naturel. Construit avec le modèle [muranyi-3](https://tesana.ai/en/blog/introducing-muranyi-3) sur la plateforme Tesana, le build montre un magicien encapuchonné évoluant dans un environnement montagneux ouvert, avec des contrôles de déplacement de base, des barres de compétences dans l'interface et des effets provisoires de lancement de sorts.

## Proposition de valeur

Le projet démontre la capacité à passer rapidement du concept au rendu pour des scènes 3D interactives, sans scripting manuel ni édition directe de l'arbre de scène :

- **Contrôleur de personnage piloté par prompt** : établit le suivi de caméra découplé à la troisième personne et le déplacement omnidirectionnel à partir de simples descriptions en anglais.
- **Génération de scène en langage naturel** : traduit des concepts d'environnement de haut niveau en terrains texturés et en arrière-plans avec points de repère.
- **Configuration d'interface intégrée au modèle** : génère des barres d'action et des icônes de sorts de base directement via des instructions de prompt.
- **Génération intégrée d'effets visuels** : produit des faisceaux magiques directionnels, des impacts de givre et des trajectoires de projectiles assortis aux états d'incantation du personnage.

## Ce qu'il peut remplacer

| Logiciel ciblé | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Templates de démarrage Unreal Engine 5 | partielle | Convient aux maquettes visuelles instantanées, mais manque de la physique, du réseau et de l'outillage de production robustes d'UE5. |
| Assets tiers-personne de démarrage Unity | partielle | Remplace les montages rapides de contrôleurs en whitebox, mais la maintenabilité du code reste non vérifiée. |
| Game Jams traditionnels (48 h) | modérée | Viable pour assembler des prototypes esthétiques non jouables, mais insuffisant en profondeur de mécaniques. |

## Réalités actuelles et limites

- **Aucune boucle de jeu jouable** : la démo se limite à la mobilité du personnage et à des animations déclenchables ; les mécaniques de combat centrales, l'IA ennemie, l'inventaire et la progression sont absents.
- **Rapport coût-résultat élevé** : atteindre une scène interactive de base a coûté 90 dollars sur 39 itérations, bien plus cher que d'utiliser des packs d'assets de démarrage gratuits.
- **Architecture de moteur opaque** : des commentateurs ont noté que le système semble fonctionner comme une fine surcouche générative au-dessus de Godot, soulevant des inquiétudes sur la portabilité du projet et la maintenabilité du code à long terme.
- **Goulots d'étranglement de scalabilité et de débogage** : l'absence d'accès structurel fin rend impraticable le débogage de mécaniques complexes comme la désynchronisation, l'enregistrement des coups et la gestion d'état à mesure que le projet grossit.

## Verdict

> **Recommandation principale**
>
> Utile uniquement comme preuve de concept visuelle pour tester les modèles génératifs texte-vers-monde, mais inadapté à l'ingénierie de jeux orientée production.

## Cycle de développement et d'itération

Le projet a été construit sur une période de 2 jours avec une structure de prompts séquentielle :

| Étape | Modèle utilisé | Résultat |
| --- | --- | --- |
| Planification et fondations | muranyi-3 | A établi la géométrie du monde, le terrain ouvert montagneux et les points de repère lointains en 3–4 prompts de planification. |
| Personnage et caméra | muranyi-3 | A configuré le modèle du magicien à la troisième personne, la caméra orbitale découplée et la locomotion directionnelle. |
| Barre d'action et interface | muranyi-3 | A ajouté une barre de compétences style MOBA à 4 emplacements, avec états d'incantation à une et deux mains. |
| VFX de sorts et impacts | muranyi-3 | A superposé des faisceaux arcaniques, des projectiles de feu et des effets de particules d'impact de givre. |

## Métriques et monétisation

- **Dépense en tokens** : 90 dollars sur 39 prompts.
- **Temps de production** : 2 jours d'itération.
- **Monétisation** : aucune ; le build est un prototype interne non publié, sans démo publique ni dépôt de code pour l'instant.

## Accueil de la communauté et débats clés

La communauté r/vibecoding a réagi avec un fort scepticisme quant à la valeur, l'authenticité et la substance technique :

- **Polémique sur le coût** : des utilisateurs ont souligné que dépenser 90 dollars pour assembler un déplacement de personnage standard et des maillages d'environnement préfabriqués soutient mal la comparaison avec zéro dollar en utilisant les templates de moteurs établis sous Unity, Unreal ou Godot.
- **Accusations d'astroturfing** : plusieurs membres ont signalé le post comme une promotion non déclarée de la [plateforme Tesana](https://tesana.ai/en/blog/introducing-muranyi-3), relevant des publications promotionnelles répétées et des réponses évasives sur le moteur sous-jacent.
- **Le clivage « prototype vs jeu »** : les commentateurs ont insisté sur le fait que marcher sur un asset de terrain ne constitue pas un jeu, soulignant l'immense écart entre l'assemblage d'assets génératifs et les systèmes fonctionnels comme la fidélité des collisions, le calcul des dégâts et la réplication réseau.
