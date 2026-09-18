---
summary: "Un mod Minecraft Fabric créé de façon autonome par Fable 5.1 à partir de vidéos YouTube, avec des modèles 3D Blender et des effets de particules."
tags: [Généré par IA, Minecraft, Mod de jeu, Anthropic, Blender]
facts:
  - key: models
    value: Anthropic Fable 5.1
  - key: token cost
    value: $20.54
    highlight: true
  - key: version
    value: Fabric 1.21.1
  - key: platforms
    value: Minecraft (Java Edition)
  - key: price
    value: Gratuit (open source sur GitHub)
  - key: tools used
    value: atomic.chat · Blender MCP Bridge
---

## Qu'est-ce que c'est

Le projet est un mod Minecraft Fabric créé presque entièrement par un agent IA autonome exécutant Fable 5.1 d'Anthropic. À partir de deux liens YouTube — un clip d'anime du dragon de foudre Kirin de Sasuke, tiré de *Naruto*, et une séquence de gameplay d'un mod de canon orbital —, l'IA a synthétisé les deux concepts en une arme de canon fonctionnelle qui invoque un immense coup de dragon de foudre à l'impact.

## Proposition de valeur

- **Analyse d'images multimodale** : l'agent a extrait les références visuelles directement des vidéos YouTube en ingérant des flux de captures image par image.
- **Contrôle d'outils inter-logiciels** : intégration via un pont MCP (Model Context Protocol) de Blender pour modéliser et texturer à la fois l'arme et l'entité du dragon, sans sculpture 3D manuelle.
- **Itération par retour visuel** : les corrections de bugs se faisaient uniquement en renvoyant à l'agent des clips de gameplay montrant les erreurs, plutôt qu'en écrivant des révisions de code à la main.
- **Échafaudage de mod de bout en bout** : a généré du code Java Fabric 1.21.1 standard, les structures d'assets, la logique d'entité et les effets d'impact au sol en une heure environ.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Modélisation manuelle Blockbench / Blender | Modérée | Grande capacité pour prototyper rapidement des entités et faire du rigging de base, mais l'optimisation fine des polygones reste l'affaire des humains. |
| Échafaudage traditionnel de mods Fabric | Élevée | Remplace le code Java répétitif, l'enregistrement et la configuration initiale des mécaniques d'entité pour des mods d'objets autonomes. |
| Scripting VFX / particules dédié | Partielle | Convient aux dégâts de zone standard et aux rafales de particules ; les pipelines de shaders personnalisés complexes demandent encore un réglage manuel. |

## Réalités et limites actuelles

- **Code produit peu structuré** : les revues de la communauté ont relevé des conventions de nommage chaotiques et une structure difficile à maintenir, malgré un gameplay fonctionnel.
- **Surcoût de tokens pour la vidéo** : l'analyse d'images brutes a consommé environ 383,6k tokens de sortie et coûté plus de $20 d'API pour un seul petit mod.
- **Dépendance à la plateforme** : repose fortement sur des intégrations MCP personnalisées comme le pont Blender et un orchestrateur externe (`atomic.chat`) pour coordonner l'exécution multi-outils.
- **Débats sur l'originalité** : plusieurs mécaniques ressemblent fortement à des mods de canon et de foudre open source déjà existants, ce qui soulève des questions de mémorisation des données d'entraînement.

## Verdict

> **Recommandation principale**
>
> Une démonstration pionnière de workflows agentiques multimodaux où les clips vidéo servent directement de spécifications de design visuel, abaissant drastiquement la barrière de création de mods malgré un coût en tokens élevé et un code source peu soigné.

## Cycle de développement et itération

L'auteur a fourni deux URLs YouTube et un prompt de haut niveau demandant à l'agent de combiner la mécanique de l'arme et l'esthétique du dragon de foudre. L'exécution a été menée avec Fable 5.1 en mode agent dans `atomic.chat`.

Lors de la première passe, Fable a analysé les images, généré les maillages 3D dans Blender via MCP, écrit la logique du mod et compilé le paquet. Quand les tests ont révélé que le dragon apparaissait à l'envers et manquait d'impact, l'auteur a simplement renvoyé des captures d'écran de jeu. Fable a corrigé l'orientation, doublé la taille de l'entité et généré des cratères de terrain, des débris et des effets de feu personnalisés en un seul cycle de révision.

| Étape | Modèle / Outil | Résultat |
| --- | --- | --- |
| Extraction vidéo | Extension de captures du navigateur | Références visuelles image par image |
| Modélisation et texturation 3D | Fable 5.1 + Blender MCP Bridge | Assets 3D du dragon et du canon |
| Logique et compilation du mod | Fable 5.1 | Base de code Java Fabric 1.21.1 |
| QA et peaufinage visuel | Fable 5.1 (critique visuelle) | Correction d'orientation, physique des cratères, FX de débris |

## Métriques et monétisation

- **Utilisation de tokens** : ~383,6k tokens de sortie entre la construction initiale et les boucles de raffinement.
- **Coût API** : $20.54 de dépense totale sur l'API Anthropic.
- **Temps investi** : ~1 heure du prompt initial à une build testée en jeu.
- **Modèle de monétisation** : publié 100 % gratuit et open source sur GitHub, même si des membres de la communauté ont souligné que les revenus publicitaires des vidéos courtes constituent une voie viable pour rentabiliser la création.

## Accueil de la communauté et débats clés

Le fil a suscité une forte attention sur r/ClaudeAI, avec des milliers de votes pour avoir démontré une exécution agentique multimodale de bout en bout. Si certains utilisateurs ont tiqué à l'idée de dépenser $20 en tokens d'API pour un mod éphémère, des moddeurs ont rappelé que produire des modèles riggés, des textures et du code Java personnalisés demande généralement des jours de travail manuel.

Les discussions ont porté sur la boucle d'itération visuelle — en particulier la façon dont le modèle a interprété des captures de gameplay pour corriger l'orientation 3D sans instructions au niveau du code —, ainsi que sur la question de savoir si les mécaniques de fond étaient réellement synthétisées ou en grande partie reprises de mods open source préexistants.
