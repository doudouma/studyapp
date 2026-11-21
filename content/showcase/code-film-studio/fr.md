---
slug: code-film-studio
name: Code Film Studio
summary: Treize dépôts open source qui s'assemblent en un studio vidéo opérationnel — décortiquez une référence, choisissez un style, rendez en code, composez les effets et exportez avec ffmpeg.
category: resource
tags: [Open Source, Vidéo IA, Agent Skills, Motion Design, Sélection, FFmpeg]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
facts:
  - key: repositories
    value: 13 · tous open source
  - key: stars
    value: 634 K au total (21-11-2026)
    highlight: true
  - key: styles
    value: 99 styles de cinéma rendus en code (Lemo-Opuscar)
  - key: effects
    value: 244 effets pixel (PixelFX) · 308 effets de compositing (EffectCraft)
  - key: prompts
    value: 703 prompts · 418 avec une refonte en ligne
  - key: price
    value: 0 $ pour démarrer · le vrai coût, ce sont les tokens, les GPU et la licence entreprise de Remotion
  - key: time
    value: Environ une demi-journée pour un film de 40 secondes une fois la stack installée
  - key: requires
    value: Claude Code ou Codex · Node 20+ · ffmpeg · Python 3.10+
sources:
  - title: JuneYaooo/rea-video — dépôt GitHub
    url: https://github.com/JuneYaooo/rea-video
    publisher: GitHub
  - title: lemomo-ai/lemo-opuscar — dépôt GitHub
    url: https://github.com/lemomo-ai/lemo-opuscar
    publisher: GitHub
  - title: heygen-com/hyperframes — dépôt GitHub
    url: https://github.com/heygen-com/hyperframes
    publisher: GitHub
  - title: storytold/effectcraft — dépôt GitHub
    url: https://github.com/storytold/effectcraft
    publisher: GitHub
  - title: Licence et tarifs de Remotion
    url: https://www.remotion.dev/docs/license/pricing
    publisher: Remotion
  - title: GSAP est désormais gratuit pour tous
    url: https://gsap.com/pricing/
    publisher: GSAP
cover:
  src: /showcase/code-film-studio.png
---

## Treize dépôts, une chaîne de production

La liste a tourné deux fois sur X la semaine dernière : treize dépôts GitHub qui, paraît-il, transforment un agent de code en studio de cinéma. 99 styles, 244 effets, 703 prompts, zéro dollar.

Lue comme une liste, ce n'est qu'un paquet de favoris. Lue par ce que chaque outil fait à une image, elle devient une ligne droite : quelque chose qui vous dit comment la référence a été tournée, quelque chose qui décide de l'allure de votre film, quelque chose qui écrit les images, quelque chose qui ajoute les étincelles, quelque chose qui exporte le fichier.

C'est l'ordre ci-dessous. Chaque chiffre a été vérifié dans le dépôt, son README ou les benchmarks de l'auteur le 21 novembre 2026, et chaque jugement sur la qualité vient de quelqu'un qui a réellement livré avec l'outil.

![Cinq étapes, treize dépôts : décortiquer, choisir un style, rendre, composer, exporter](/showcase/code-film-studio-pipeline.png)

*Les cinq étapes autour desquelles cet article s'organise. Chaque dépôt appartient à une seule.*

## Ce que la stack apporte vraiment

- **Une carte de la référence, pas sa copie.** Rea-Video découpe une vidéo finie en plans et juge chacun : tourné, généré par IA, 3D, motion design en code ou capture d'écran. Il en sort un plan de tournage, des prompts par plan et un `VIDEO.md` que votre agent peut continuer à exploiter.
- **Un look que vous n'avez pas eu à inventer.** Lemo-Opuscar propose 99 styles nommés en 15 catégories, chacun avec un film démo rendu en code : vous choisissez à l'œil, pas à l'adjectif.
- **Des images que l'on peut versionner.** HyperFrames transforme HTML/CSS/JS en MP4 déterministes, Remotion fait de même avec des composants React. Les deux laissent un projet qu'un humain peut modifier — la différence entre une vidéo IA et une vidéo IA réparable.
- **Des primitives de mouvement déjà réglées.** GSAP pour la typographie et le DOM, three.js pour de la vraie 3D, PixelFX pour les impacts pixel art, EffectCraft quand il faut un compositing, ffmpeg pour tout à la fin.

## Ce que cela remplace

| Logiciel visé | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Adobe After Effects | Partial | EffectCraft reprend les panneaux, raccourcis et expressions d'AE et embarque 308 effets, mais son propre README le dit en alpha et « pas encore recommandé pour du travail client ». Bon pour génériques, synthés et transitions. |
| Premiere Pro / DaVinci Resolve | Low | Aucun NLE à timeline ici. Remotion et HyperFrames sont des moteurs de rendu, ffmpeg une ligne de commande ; le montage reste votre travail. |
| Générateurs vidéo IA (Sora, Veo, Kling) | Low | Ces dépôts ne génèrent pas d'images. Rea-Video indique quels plans exigent un générateur et écrit les prompts — le modèle reste à votre charge. |
| Blender à la main | Partial | Blender MCP pilote `bpy` depuis un agent. Très fort sur le placement procédural et le travail en lot, faible sur la direction artistique. |
| Banques d'images et d'assets | Moderate | HyperFrames inclut images, musiques, SFX et TTS de stock ; le reste suppose que vous apportez ou générez votre matériel. |
| Passerelle Figma vers le motion | Moderate | Les styles rendus en code et GSAP suppriment beaucoup d'animation post-design, mais aucun dépôt n'importe proprement un fichier de design. |

## Où chaque dépôt gagne sa place

| Dépôt | Couche | À utiliser quand | Il ne fera pas |
| --- | --- | --- | --- |
| Rea-Video | Décorticage | Vous trouvez une vidéo à étudier | Tourner à votre place les plans live |
| Awesome Opus 5.5 Videos | Référence | Il vous faut des départs prompt-vers-mouvement éprouvés | Vous donner une histoire ou un script |
| Lemo-Opuscar | Style | Vous voulez un rendu fini sans le concevoir | Fonctionner aussi bien hors des modèles Claude |
| EffectCraft | Compositing | Il faut des keyframes, des expressions et les réflexes AE | Survivre à une deadline client |
| PixelFX | Effets | Le plan est en pixel art ou un trailer de jeu | Aider sur une prise de vue réelle |
| ComfyUI | Assets | Il faut des stills, textures ou keyframes générés | Rester stable après une mise à jour de plugin |
| Remotion | Rendu | La vidéo est un composant React avec des données derrière | Être gratuit pour les entreprises de plus de trois personnes |
| Remotion Skills | Rendu | Votre agent écrit Remotion de travers | Remplacer la lecture de la doc |
| HyperFrames | Rendu | Votre agent écrit du HTML plus vite que du React | Sortir un film à 90 points en une passe |
| three.js | 3D | Il faut des particules, de la volumétrie, de vrais matériaux | Concevoir la scène à votre place |
| GSAP | Mouvement | Le texte doit voler, rebondir ou glisser | Animer une scène 3D |
| Blender MCP | 3D | Le travail est procédural ou en lot | Juger si un rendu est beau |
| FFmpeg | Export | Tout doit devenir un fichier | Être optionnel |

## Réalités et limites actuelles

- **Zéro dollar est un prix d'appel, pas un total.** Remotion est gratuit pour les particuliers et les entreprises de trois personnes maximum ; au-delà, c'est 25 $ par siège et par mois ou 0,01 $ par rendu avec un minimum de 100 $ mensuels. Lemo consomme des tokens pendant 30 à 60 minutes par film. ComfyUI est un logiciel gratuit qui réclame un GPU. La meilleure précision de Rea-Video exige un modèle de vision payant.
- **Le compositeur gratuit assume son état inachevé.** Le README d'EffectCraft le situe à 91 % de parité fonctionnelle et à environ 45 % du chemin vers la production professionnelle, macOS étant la plateforme la plus testée. Le benchmark d'un utilisateur : un film vertical de 65 secondes exporté en une douzaine de minutes depuis une app de 150 Mo, quand After Effects tombait en panne de mémoire sur la même machine de 64 Go.
- **Le mythe du clic unique mérite d'être nommé.** La critique la plus partagée de cette stack dit clairement qu'il ne faut pas croire que HyperFrames ou Remotion vont monter une vidéo de haute qualité tout seuls. Ce qu'ils suppriment, c'est le logiciel de montage, pas la réalisation.
- **La précision s'effondre sur des images recompressées.** Les outils hors ligne de Rea-Video atteignent 88,6 % sur des clips recompressés par WeChat et 99,6 % avec un modèle de vision ; sur un cas d'unboxing, la passe hors ligne annonçait 35 % d'IA et le résultat était 97 % de prises réelles après examen des images par un agent.
- **Le contexte est le vrai budget.** Installer les treize d'un coup noie l'agent sous des skills qu'il ne peut pas garder en ordre. Trois à la fois est la limite pratique.

## Verdict

> **Recommandation principale :** commencez par trois — Rea-Video pour apprendre la structure, HyperFrames pour la rendre, ffmpeg pour finir. Ajoutez le reste seulement quand un plan précis l'exige.

La liste est réelle, mais c'est une chaîne de production, pas un studio dans une boîte. Ce qu'elle supprime, c'est la facture de logiciels et la courbe d'apprentissage de six mois. Ce qu'elle ne supprime pas, c'est ce qui décide si quelqu'un regarde : une référence qui vaut la peine d'être copiée, un style qui sert l'histoire, et l'envie de remonter le film quatre fois.

## Un film de 40 secondes, étape par étape

| Étape | Ce qui se passe | Durée |
| --- | --- | --- |
| Décorticage | Rea-Video découpe la référence en plans et rend le rythme, les sous-titres et un plan de tournage | 15 min |
| Style | Choisir un style Lemo, ou reprendre un prompt de mouvement de la liste Awesome | 10 min |
| Construction | HyperFrames monte la timeline HTML ; trois passes de corrections | 30 min |
| 3D et typographie | three.js pour le plan héros, GSAP pour les titres | 1 h |
| Compositing | EffectCraft ou PixelFX pour les transitions et les impacts | 20 min |
| Assets | ComfyUI pour les keyframes et les textures | 20 min |
| Export | ffmpeg pour le concat, la loudness, les sous-titres et le master | 5 min |

Une demi-journée, une fois. Le plus lent reste la première installation : un agent, Node, ffmpeg, Python et un plugin par outil.

## Chiffres et coûts

| Poste | Combien ça coûte |
| --- | --- |
| Les 13 dépôts | 0 $, mélange d'Apache-2.0, MIT et GPL-3.0 |
| Abonnement à l'agent | 20 à 200 $ par mois, selon l'offre et l'usage |
| Un film Lemo-Opuscar | 30 à 60 minutes d'agent, très gourmand en tokens |
| Remotion, licence entreprise | 25 $ par siège et par mois, ou 0,01 $ par rendu |
| ComfyUI | 0 $ de logiciel, GPU et électricité bien réels |
| Modèle vidéo optionnel | À la génération, selon le fournisseur choisi |

Étoiles GitHub cumulées : environ 634 000, menées par ComfyUI à 147,8 K, three.js à 119 K et HyperFrames à 87,5 K. Six des treize ont été créés en 2026 — c'est une stack qui n'existait pas il y a un an.

## Réception de la communauté et les débats à lire

Les éloges sont précis, et c'est bon signe. Un utilisateur japonais a monté un clip musical avec paroles en faisant piloter EffectCraft par Opus 5.5 via MCP sans toucher à l'app, a rapporté un timing des paroles presque parfait et une session ayant consommé environ 5 % du quota hebdomadaire de Claude. Un autre a comparé EffectCraft à After Effects sur la même machine et a tout de même choisi de ne pas l'utiliser en clientèle : 150 Mo contre 5,4 Go, 12 minutes contre un plantage mémoire, et un verdict honnête — « suffisant pour presque tout, trop risqué pour le boulot ».

Le scepticisme est précis aussi. Le contre-argument le plus partagé soutient que la vidéo IA en un clic est un mythe et que ceux qui obtiennent de bons résultats font tourner Claude avec Remotion dans un vrai flux de script, storyboard et montage. Cela colle à ce que disent les dépôts eux-mêmes : Rea-Video insiste sur des images libres de droits, EffectCraft se déclare alpha, Remotion publie une page de licences au lieu de prétendre être gratuit pour tous.

Un avertissement devrait accompagner toute liste de ce genre. En octobre, un dépôt imitant Blender MCP est apparu, à une lettre du pseudo de l'auteur réel, avec des issues copiées et un plugin qui téléchargeait du code d'un autre dépôt à l'activation. Le vrai projet est `ahujasid/mcp-for-blender`. Vérifiez l'auteur et l'historique des commits avant d'installer ce qu'un agent vous recommande.

![Un même sujet, douze styles : ce qu'une bibliothèque de styles rendue en code peut réellement couvrir](/showcase/code-film-studio-styles.png)
