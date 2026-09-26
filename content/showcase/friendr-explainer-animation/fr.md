---
summary: "Une exécution entièrement autonome de Claude Code qui a rédigé, illustré, doublé, animé et rendu une vidéo de présentation produit de 30–60 s pour environ 4 $."
tags: [Généré par IA, Production vidéo, Claude Code, Animation Canvas, Agents autonomes, Synthèse vocale]
facts:
  - key: models
    value: Claude Code (Opus 5.5) · TTS OpenRouter · modèle externe de relecture
  - key: token cost
    value: ~4 $ sur OpenRouter · ~30 % du quota de session Claude Pro
    highlight: true
  - key: runtime
    value: 1,5 à 2 heures, entièrement autonome
  - key: output
    value: Script · Storyboard · Visuels collage · Voix off · Animation Canvas · MP4
  - key: spend cap
    value: Budget OpenRouter de 10 $
  - key: style
    value: Collage dessiné à la main, 30–60 s
---

## Qu'est-ce que c'est

Dio-V a repris un prompt populaire de r/ClaudeAI, l'a adapté et l'a pointé vers Friendr.nl — un petit projet personnel — avec Claude Code (Opus 5.5), un budget de 10 $ sur OpenRouter et une seule instruction : produire la meilleure vidéo de présentation possible de 30 à 60 secondes en style collage dessiné à la main, en travaillant de façon entièrement autonome. Environ 1,5 à 2 heures plus tard, la session a livré un MP4 terminé : script, visuels, voix, musique et animation inclus.

## Proposition de valeur

* **Autonomie réelle de bout en bout** : un seul prompt a produit le script, le concept de storyboard, les visuels style collage, la voix off, la musique de fond, les effets sonores, le code d'animation et le rendu final — pendant que l'auteur était loin de son ordinateur.
* **Motion design par le code** : l'animation est du pur code JavaScript Canvas ; chaque image est déterministe, modifiable et comparable via diff, au lieu d'être enfermée dans la timeline d'un logiciel de montage.
* **Synchronisation audio précise à l'image** : l'agent a aligné les images d'animation sur le rythme de la voix off générée — précisément l'étape sur laquelle les monteurs humains passent le plus de temps.
* **Auto-revue intégrée** : l'exécution a fait appel à des modèles externes pour critiquer son propre premier montage, puis a appliqué les corrections avant le rendu.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Agences de vidéos de présentation | Modérée | Couvre concept, voix, musique et mouvement pour une histoire produit simple ; la direction artistique de niveau marque exige encore des humains. |
| Flux After Effects / motion design | Partielle | Le code Canvas automatise l'animation de collage simple, mais les easing complexes, la 3D et la composition restent hors de portée. |
| Créateurs de vidéo à base de modèles | Élevée | Bat les modèles génériques en originalité à coût similaire ; chaque visuel est généré pour le produit concerné. |
| Voix off freelance + musique sous licence | Élevée | Le TTS et l'audio généré couvrent la narration et la bande-son d'une présentation courte à coût marginal quasi nul. |

## Réalités actuelles et limites

* **La voix est du TTS** : l'intonation, l'accentuation et l'émotion sont plafonnées par le modèle de synthèse vocale ; un narrateur humain reste plus percutant.
* **Pas de directeur créatif dans la boucle** : l'auteur s'est délibérément éloigné, donc le ton du script, l'humour et le rythme sont ce que le modèle a décidé — une vraie vidéo de marque voudrait une relecture humaine du script avant l'animation.
* **Le style collage est un atout et une limite** : l'esthétique collage dessiné à la main masque bien les artefacts de mouvement de l'IA, mais les démonstrations nettes d'interface produit exigent toujours des captures d'écran ou du motion design professionnel.
* **Risque budgétaire en un seul tir** : une exécution autonome engage tout le budget sur une seule direction créative ; il n'existe pas de moyen bon marché de générer deux concepts concurrents et de choisir le meilleur.

## Verdict

> **Recommandation principale**
> Une vidéo de présentation produit aboutie et regardable pour environ 4 $ et zéro heure de travail manuel, c'est un nouveau point de prix bien réel. Utilisez ce schéma comme générateur de premier brouillon pour la narration produit : lancez-le en autonome, puis investissez l'effort humain là où il compose vraiment — relecture du script, voix de marque et polissage final. Cela ne remplace pas encore une vidéo de marque conçue sur mesure, mais c'est imbattable en coût par itération.

## Cycle de développement et itération

Tout s'est joué en une unique session autonome de Claude Code avec une clé OpenRouter pour les modèles auxiliaires, en environ 1,5 à 2 heures :

| Étape | Modèle / outil utilisés | Focus |
| --- | --- | --- |
| Planification | Claude Code (Opus 5.5) | Lecture de la FAQ produit, rédaction du script et du concept de storyboard |
| Production des visuels | Claude Code + TTS OpenRouter | Visuels style collage, voix off, musique de fond, effets sonores |
| Animation | Claude Code | Animation Canvas en JavaScript pur, images alignées sur le rythme de la voix off |
| Relecture | Modèle externe via OpenRouter | Critique du premier brouillon ; l'agent a corrigé lui-même les points signalés |
| Rendu | Claude Code | Export du MP4 final |

## Le prompt derrière l'exécution

Le prompt complet tel que publié (remplacez Friendr.nl par votre propre produit) :

```text
Create a pure javascript animation. 30s-60s whimsical hand drawn collage style with appropriate audio on Friendr.nl.

Entire video should be as high of a production value as possible. Please spend your time on this, it's very important. People should understand what Friendr.nl is for and after seeing the video will want to create an event to try it out. Read the FAQ first.

Use high quality text-to-speech model for generation. You can find open router API key in .env file

You can use any tools you can find access to and resources on the internet. You create the script, the assets, the animation, concept, everything.

I have to go away from my computer so please work autonomously until done. Quality is paramount. Production value should be on professional level.

One more thing: max OpenRouter spend is $10
```

## Métriques et monétisation

* **Coût** : ~4 $ de dépense API OpenRouter sur le plafond de 10 $, plus ~30 % d'un quota de session Claude Code Pro.
* **Temps** : 1,5 à 2 heures de travail entièrement autonome, sans intervention humaine.
* **Diffusion** : partagé sur r/ClaudeAI comme vitrine communautaire ; Friendr.nl est le projet personnel de l'auteur.
