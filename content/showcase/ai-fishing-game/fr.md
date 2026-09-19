---
summary: "Un prototype de jeu de pêche 3D low-poly créé entièrement avec Claude Code, Godot et l'orchestration Blender MCP."
tags: [Développement de jeux, Claude Code, Moteur Godot, Blender MCP, Low poly]
facts:
  - key: author
    value: u/RUSuper
  - key: platforms
    value: Windows · macOS
  - key: engine
    value: Godot 4.7.1
  - key: models
    value: Claude (Ultracode) · ChatGPT (OpenAI Playground) · Codex
  - key: token cost
    value: 200 $/mois plan Claude Max + 20 $/mois ChatGPT
    highlight: true
  - key: pipeline
    value: Blender MCP · Godot MCP · Orchestration multi-sessions
---

## De quoi il s'agit

AI Fishing Game est une expérience de développement en solo du développeur u/RUSuper, visant à créer un jeu complet de pêche et de navigation low-poly dans Godot entièrement à l'aide de l'IA. Développé sur plusieurs semaines avec Claude (principalement sur le plan Max avec Ultracode) et ChatGPT, le projet illustre un pipeline multi-agents de bout en bout : art de référence 2D, modélisation 3D low-poly automatisée dans Blender via Model Context Protocol (MCP), et shaders d'eau GLSL personnalisés intégrés à Godot 4.7.1.

## Proposition de valeur

Le flux de travail prouve qu'un créateur unique agissant comme directeur artistique peut produire un environnement de jeu 3D cohérent en orchestrant des sessions d'IA modulaires :

* **Modélisation 3D procédurale scriptée** : remplace les outils de génération de maillages bruts par une session Claude dédiée reliée à Blender via MCP, garantissant des modèles éditables, low-poly et stylistiquement homogènes.
* **Traçabilité stricte des décisions** : impose un journal décisionnel étiquetant chaque choix comme dicté par l'utilisateur ou suggéré par l'IA, éliminant les hallucinations où des idées synthétiques deviennent des exigences fantômes.
* **Notation visuelle à l'aveugle** : évalue les refontes visuelles à l'aide de points de vue de caméra en jeu, notés selon des critères préétablis (seuil 8/10) et des comparaisons à l'aveugle pour éliminer le biais de nouveauté.
* **Fédération d'agents multi-sessions** : utilise une session maître qui distribue des tâches discrètes à des sous-sessions spécialisées (modélisation, intégration, shaders, UI) et gère les passations entre elles.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Modélisation 3D low-poly manuelle | Moyenne | Claude via Blender MCP scripte bien les props, docks et bateaux simples ; les personnages riggés complexes exigent encore des outils dédiés. |
| Écriture traditionnelle de shaders | Élevée | Claude produit de manière fiable des shaders d'eau complexes, une dynamique de vagues et des transitions de couleur diurnes directement dans Godot. |
| Plateformes de maillages 3D génératifs (ex. Rodin) | Élevée | Les assets low-poly scriptés offrent une topologie plus propre et des fichiers plus légers que les sorties génératives directes. |
| Flux humains de maquettes UI | Moyenne | Esquisse rapidement des inventaires thématiques et des guides de terrain nautiques, mais le polish spatial manuel reste indispensable. |

## Réalités et limites actuelles

* **Consommation massive de tokens et limites de débit** : les itérations profondes atteignent les plafonds du plan Claude à 200 $/mois en quelques jours, obligeant à recourir à des modèles secondaires comme Codex.
* **Absurdités environnementales et clipping** : sans supervision manuelle constante, les dispositions génératives produisent une géométrie illogique, comme des docks murés inaccessibles, des maisons encastrées dans des falaises et des PNJ en lévitation.
* **Throttling thermique du moteur** : les passes de shader complexes et les simulations de l'éditeur poussent le matériel mobile non optimisé (comme les MacBook) à chauffer et à perdre des images.
* **Manque de profondeur de jeu** : si la navigation ambiante et les shaders d'eau procéduraux semblent soignés de loin, les mécaniques de quête et la progression restent des placeholders squelettiques.

## Verdict

> **Recommandation principale**
> Ce projet est une étude de cas de référence pour l'orchestration multi-agents dans le jeu vidéo. Il prouve que combiner des outils MCP scriptés avec une direction artistique stricte gardant l'humain dans la boucle surpasse la génération aveugle de bout en bout, offrant un plan viable aux développeurs indie solo prêts à échanger du code manuel contre une modération rigoureuse du système.

## Cycle de développement et d'itération

Le flux a évolué de la simple saisie de prompts vers un pipeline modulaire multi-sessions gouverné par une session directrice globale.

| Étape | Modèle / Outil | Axe de travail |
| --- | --- | --- |
| Référence 2D et maquette UI | ChatGPT / Playground | Génération d'art conceptuel pour les structures portuaires, les guides de poissons et les écrans d'amélioration |
| Génération de géométrie 3D | Claude (Ultracode) + Blender MCP | Création scriptée de bateaux, bâtiments et props low-poly |
| Intégration et shaders | Claude Code + Godot MCP | Rendu de l'eau, cycles jour/nuit, mise à l'échelle et placement du littoral |
| Polish et code de débordement | OpenAI Codex | Correction de bugs et nettoyage de scripts pendant les temps de refroidissement hebdomadaires de Claude |

## Métriques et monétisation

* **Coût en tokens et abonnements** : 200 $/mois sur le plan Claude Max, complété par un abonnement ChatGPT à 20 $/mois pour l'art conceptuel et le repli sur Codex.
* **Distribution actuelle** : projet passion non commercial encore au stade de prototype ; une démo publique est prévue une fois la boucle de quête initiale finalisée.
* **Engagement communautaire** : plus de 2 700 upvotes et 240+ commentaires dans la communauté r/ClaudeAI.

## Accueil de la communauté et débats clés

Le fil a suscité un vif intérêt chez les développeurs indie tout en mettant en lumière des tensions récurrentes du développement de jeux par IA :

* **Éloge esthétique vs. effondrement logique** : les commentaires ont beaucoup loué la présentation atmosphérique, dans l'esprit de *Dredge*, mais les designers chevronnés ont vite relevé des incohérences brisant l'immersion, comme des escaliers bloqués et des bâtiments trop entassés.
* **La validation du « journal décisionnel »** : d'autres développeurs ont largement salué la pratique consistant à consigner si une idée vient de l'utilisateur ou du modèle, jugée essentielle contre la dérive des prompts IA.
* **Créer comme se divertir** : les membres de la communauté ont débattu de la viabilité commerciale du développement solo de jeux par IA, ou de sa nature de nouveau loisir créatif très prenant, comparable à l'assemblage de sets Lego.
