---
summary: "Une carte sélectionnée de 369 projets open source de vidéo et de montage automatique conçus pour Claude Code, Codex et d'autres agents de programmation, filtrés par production, compatibilité agent et documentation."
tags: [Vidéo IA, Open source, Claude Code, Codex, Skills pour agents, Remotion]
facts:
  - key: projects
    value: "369"
    highlight: true
  - key: author
    value: "@leo_xiaolei"
  - key: platform
    value: X / Feishu
  - key: language
    value: Chinois
  - key: focus
    value: Vidéo IA et montage automatique
  - key: data
    value: Instantané de l'API GitHub 2026-10-27
---

## Ce que c'est

Une analyse en chinois de 369 dépôts open source qui permettent à des agents de programmation comme Claude Code et Codex de générer de la vidéo, de monter des rushes automatiquement ou de rendre du motion design à partir de code. L'auteur ignore délibérément le « filtre des étoiles GitHub » habituel, car les étoiles ne mesurent pas la valeur de production réelle : certains dépôts à peine étoilés résolvent un problème très précis mieux que des projets bien plus populaires.

La liste est une carte, pas un benchmark. Chaque entrée pointe vers un dépôt, une Skill, un plugin ou un serveur MCP, et l'article les regroupe par flux de travail pour choisir un point de départ plutôt que cloner 369 dépôts.

## Comment la liste est filtrée

Trois règles décident de ce qui entre :

1. **La production doit être de la vidéo ou du mouvement.** Les scènes 3D purement web sont exclues ; la sortie doit être un film, un clip ou un ensemble de prompts rendus par code qu'un agent peut reproduire.
2. **L'outil doit être conçu pour les agents.** Skills, plugins, serveurs MCP ou toolkits explicitement pensés pour Claude Code, Codex et agents similaires.
3. **Le README doit être complet.** Sans documentation, la valeur pratique ne peut pas être vérifiée.

Tous les nombres d'étoiles et données de dépôts sont un instantané de l'API GitHub du 2026-10-27 : à traiter comme un signal ponctuel, pas comme un classement actuel.

## Les quatre frameworks phares

| Projet | Étoiles | Ce qu'il fait |
| --- | --- | --- |
| lemo-opuscar | 8 322 | Un moteur de styles visuels avec 59 styles de vidéo rendus par code, réglés pour Claude Opus 5.5. L'échantillon « OPUSCAR 98 » dure 6 min 31 s et montre 98 styles sans appeler de modèle de génération vidéo. |
| huashu-art-motion | 5 418 | Une Skill d'animation artistique combinant 36 styles artistiques, 9 grammaires de narration et 8 clips paramétrés. Solide pour des explications de marque sans présentateur. |
| huashu-motion | 1 766 | Automatise les films de lancement produit : lire les infos produit, proposer trois directions, écrire le film, puis composer la musique en notation ABC. Son montage visuel dans le navigateur permet de cliquer sur une image et de décrire la correction. |
| sweety-handdraw-video | 903 | Un pipeline d'explications dessinées à la main compatible Codex : un sujet ou un article entre, scénario, storyboard et illustrations sortent, puis le rendu local aligne à l'image près avec la synthèse vocale VoxCPM 2. |

## Autres groupes à connaître

- **Montage automatique et human-in-the-loop :** browser-use/video-use découpe les rushes à partir de transcriptions mot à mot et gère sous-titres et couleur avec FFmpeg. OpenChatCut et BaoCut ajoutent des retouches manuelles de timeline après la passe automatique.
- **Expérimentations frontière à peu d'étoiles :** fragua (11 étoiles) tourne en local avec FFmpeg et sans clé API pour retirer le silence en vertical et incruster les sous-titres. cutloupe (0 étoile) expose un MCP et une timeline visuelle, et renvoie de vraies images rendues au modèle via une commande `look`.
- **Prompts et fiches de plan code-vers-vidéo :** awesome-opus5-5-videos rassemble 703 prompts Opus 5.5. video-shotcraft fournit 152 recettes de plan structurées et 209 aperçus de mouvement pour des travaux commerciaux Remotion.
- **Rétro-ingénierie du mouvement :** lovisdotio/motion2code reconstruit une vidéo de mouvement existante en SVG inline et timelines GSAP, pour comparer image par image avec l'original.
- **Explications, présentateurs et clips musicaux :** Raven lit l'historique Git d'un dépôt et génère une explication dessinée à la main de deux minutes ; stickman-video-director vise les chaînes de vulgarisation avec bonhommes bâtons ; lanshu-create-ai-presenter-video reste neutre côté fournisseur pour des images de présentateur autorisées ; digital-human-koubo transforme une image et du texte en vidéo synchronisée labialement via Renoise MCP et Grok Video ; PDoomVideo publie une base complète de code source pour clips musicaux.

## Limites actuelles

- **C'est une étude, pas un test.** L'auteur a lu les dépôts et les README ; il n'y a pas de benchmark de qualité de sortie en face à face.
- **Les étoiles vieillissent par nature.** L'instantané date d'un seul jour, et les projets d'agents évoluent vite, parfois chaque semaine.
- **Chinois d'abord.** L'analyse et les commentaires de sélection sont en chinois, même si la plupart des dépôts liés sont en anglais.
- **Risque de liens morts et de maintenance.** Une liste de 369 dépôts inclura forcément des projets abandonnés ou renommés ; vérifiez le README, la licence et le dernier commit avant d'en adopter un.
- **Biais de périmètre.** La liste se concentre sur la vidéo et le mouvement pour agents de programmation ; les monteurs vidéo généralistes, le travail 3D purement web et les outils non orientés agents sont volontairement exclus.

## Verdict

> **Recommandation principale**
> Utilisez-la comme générateur de shortlist, pas comme classement. Partez des quatre frameworks phares si vous avez besoin d'un flux éprouvé, puis explorez la section à peu d'étoiles pour combler un manque précis de votre pipeline.

Le plus utile reste le filtre lui-même : la sortie doit être de la vidéo, l'outil doit être appelable par un agent et le README doit être complet. C'est une meilleure heuristique de sélection que le nombre d'étoiles pour quiconque construit un pipeline vidéo IA avec Claude Code ou Codex. Vérifiez l'état actuel de chaque dépôt avant de vous engager.

## Attribution

Ce cas renvoie à une reprise Feishu de WaytoAGI. Le fil original a été publié par 刘老板 (@leo_xiaolei) sur X le 2026-10-27 ; les droits restent à l'auteur original et le lien original fait foi.
