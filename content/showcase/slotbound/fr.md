---
slug: slotbound
name: Slotbound
summary: Un jeu indé réalisé avec Codex par un développeur qui dit ne pas savoir coder : 50 000 copies en 48 heures, et les douze mois de démo que les posts viraux ont oubliés.
category: ai
tags: [Jeu IA, Steam, Indie Dev, Codex, Love2D, Étude de cas]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: KLeo (KKLeoAI)
externalUrl: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
facts:
  - key: sales
    value: 50 000 copies dans les 48 premières heures (chiffre du développeur)
    highlight: true
  - key: gross
    value: 356 000 $ bruts, avant la commission Steam, les taxes et les remboursements
  - key: wishlists
    value: Plus de 100 000 avant la sortie · 50 000 fin juillet
  - key: peak
    value: Plus de 15 000 joueurs simultanés le 15 novembre (SteamDB)
  - key: stack
    value: Love2D · VS Code + Codex · Claude / Gemini · Nano Banana / PixelLab
  - key: art
    value: En partie générée, en partie achetée, en partie dessinée à la main pour la sortie
  - key: timeline
    value: Production depuis 2025-10 · démo 2026-07-10 · sortie 2026-11-13 UTC
  - key: caveat
    value: Ventes et revenus autodéclarés, non audités
sources:
  - title: 一个不会写代码的人，48小时卖出5万份游戏：AI造富故事，最容易被看漏的真相
    url: https://mp.weixin.qq.com/s/j94CGt0uD6od2sna1V1hpQ
    publisher: KLeo / KKLeoAI
cover:
  src: /showcase/slotbound-cover.png
---

## La première chose que j'ai faite, c'est chercher l'arithmétique manquante

La première fois que c'est passé dans mon fil, ma réaction a été la même que la vôtre : quelqu'un a arrondi.

Un développeur coréen qui dit ne pas savoir coder. Un jeu fait avec de l'IA. 50 000 copies en 48 heures sur Steam, 356 000 $ bruts, devenus 470 millions de wons dans les reposts. La version propre ajoute deux abonnements IA à 30 000 wons par mois, aucun autre coût, aucun marketing, et de l'art comme du code entièrement générés.

Je suis donc remonté les posts publics du développeur et les annonces Steam. Le chiffre des ventes tient. L'arithmétique autour, non.

![La capsule Steam de Slotbound](/showcase/slotbound-capsule.jpg)

*Développeur et éditeur : Optima Arch. Sorti sur Steam le 13 novembre 2026 (UTC).*

Voici ce qui est réellement documenté. Les 50 000 copies et les 356 000 $ viennent d'un message du développeur le 15 novembre — revenus bruts, avant la commission Steam, les taxes, les remboursements et les coûts de développement. Les 100 000 listes de souhaits ont été annoncées fin septembre, avant la sortie. SteamDB a enregistré plus de 15 000 joueurs simultanés le 15 novembre, et c'est la partie que le marketing ne peut pas truquer : les gens jouaient, pas seulement achetaient.

Ce qui n'est pas documenté, c'est l'affirmation sur les coûts. « Deux abonnements à 30 $, pas de tokens en plus, aucune autre dépense » n'a aucune source de première main que j'aie trouvée. Raconter une bonne histoire n'exige pas d'inventer sa comptabilité.

## Le jeu est une machine à sous qui construit une armée

Avant l'angle IA, le design mérite l'attention, parce que les ventes en découlent.

Le pitch tient en une phrase, ce qui est plus rare qu'il n'y paraît : et si une machine à sous recrutait votre armée ? On tire un rouleau 3 × 3, il tombe des guerriers, des mages et d'autres unités. On fusionne les faibles vers le haut, on ajoute objets et modificateurs, puis on regarde la formation encaisser la vague suivante.

Deux plaisirs familiers sont câblés ensemble. Le tirage, c'est la récompense aléatoire : chaque tour est une petite attente d'une surprise. La fusion, c'est la croissance contrôlée : même un mauvais tirage se rattrape par des choix. On perd, on s'en prend à la configuration montée deux tours plus tôt. On gagne, on veut voir si une combinaison plus absurde marche aussi. C'est le même moteur que sous Vampire Survivors et la moitié du genre.

Le point important pour cette histoire : rien de tout cela n'avait besoin d'IA. La boucle fonctionnerait si un humain avait tapé chaque ligne.

## Ce que l'IA a réellement écrit

Dans un post de mai, le développeur a dit que le code de la démo était entièrement généré par IA et qu'il ne savait pas écrire une ligne de code. Cette phrase est beaucoup citée. La suite beaucoup moins.

![Quatre bacs : ingénierie, réflexion, art, et les décisions restées humaines](/showcase/slotbound-split.png)

| Bac | Qui | Ce que cela couvrait |
| --- | --- | --- |
| Ingénierie | Codex dans VS Code | La démo et la majeure partie du code final, sur Love2D |
| Réflexion | Claude, Gemini | Discussions d'architecture, points bloqués, second avis |
| Art | Nano Banana, PixelLab | Quelques scènes et sprites, à côté de packs achetés |
| Décisions | Le développeur | Difficulté, lisibilité, sensation de récompense, quoi couper |

Donc « tout l'art est généré par IA » est faux tel quel. Il a dit publiquement que certaines unités venaient de packs achetés et que la version finale ajoutait pas mal d'art dessiné à la main. Le moteur est Love2D, pas un outil no-code. Et la répartition ci-dessus est sa propre description de son flux, pas une feuille de coûts complète.

L'habitude qu'il décrit quand on lui demande ses prompts est la chose la plus transférable de tout l'entretien : ne confiez pas au modèle une tâche énorme et vague. Faites une fonctionnalité à la fois, donnez les contraintes et les fichiers concernés, testez la sortie immédiatement et, quand ça dérape, dites précisément ce qui a cassé et ce qui ne doit pas bouger.

Ce n'est pas une astuce de prompt. C'est la façon dont un ingénieur soigneux parle à un junior.

## Le travail que l'IA n'a pas pris

Demandez une machine à sous à n'importe quel modèle et il vous rendra une machine à sous qui fonctionne. Ce qu'il ne vous dira pas : que le niveau trois est trop dur, que le bouton de fusion est caché derrière l'infobulle, que la récompense arrive une demi-seconde trop tard pour être agréable, ou qu'un mécanisme dont vous êtes fier devrait être supprimé entièrement.

Le développeur a dit quelque chose comme ça au lancement de la démo : l'IA lui a permis de faire le jeu, mais savoir s'il est amusant, équilibré et lisible reste sa décision.

Cette phrase est tout le dossier, honnêtement. Le code a été externalisé. Le goût, non.

## « Aucun marketing » est la phrase la plus trompeuse

La version virale dit qu'il n'a fait aucun marketing à part un post sur les réseaux. Il a effectivement dit avoir évité le marketing traditionnel. Puis on regarde les dates.

![Chronologie du premier build à la sortie](/showcase/slotbound-timeline.png)

Il commence en octobre 2025. Une version jouable arrive sur itch.io fin juin 2026. La démo Steam ouvre le 10 juillet. Suivent les corrections, les passes d'interface, les réglages de difficulté et les mises à jour de gameplay. Les listes de souhaits atteignent 50 000 fin juillet et 100 000 fin septembre. La sortie elle-même est repoussée par la validation de build Steam, et il écrit un long texte sur la visibilité qu'il craint de perdre.

Rien de tout cela n'est un seul post. Une démo n'est pas une décoration de fiche boutique pour un jeu de systèmes : c'est la publicité la plus honnête que le genre possède. Voir un clip dit que ça a l'air sympa. Y jouer une demi-heure dit si l'on va le regretter.

Ne pas acheter de trafic n'est pas la même chose que ne pas faire d'acquisition.

## Ce que je copierais, dans l'ordre

**Un : une boucle qui s'explique en une phrase.** « Une machine à sous qui construit ton armée » n'a pas besoin de tutoriel. Si votre idée exige trois minutes de mise en place avant le plaisir, le problème est l'idée, pas le marketing.

**Deux : utilisez l'IA pour rendre la validation bon marché, pas pour agrandir le jeu.** Construisez la plus petite boucle complète — on peut gagner, on peut perdre, quelque chose réagit — puis étendez. Ne demandez pas 300 niveaux le premier jour.

**Trois : mettez-le devant des inconnus tôt.** Votre propre plaisir est un point de départ, pas une preuve. Quelqu'un qui l'ouvre, quelqu'un qui joue une deuxième partie, quelqu'un qui le partage sans qu'on demande : voilà les signaux qui méritent un mois de plus.

## Verdict

> **Recommandation principale :** prenez Slotbound comme la preuve qu'une personne sans formation en programmation peut désormais atteindre le marché, pas comme la preuve que le marché est devenu facile. Copiez l'ordre — boucle, prototype bon marché, démo publique — et ignorez le conte de fées sur les coûts.

L'exploit est réel et plus grand que les mèmes : quelqu'un sans background de programmation a sorti un jeu commercialement viable en treize mois environ. La correction est plus petite mais compte : il n'a pas sauté l'année, la démo, les patchs ni le jugement. Il a sauté la syntaxe.

Cette distinction sépare « n'importe qui peut le faire pour vendredi » de « n'importe qui peut commencer maintenant ».

## Ce que cette histoire ne prouve pas

- **Un jeu, un genre, une sortie.** Un roguelite de machine à sous est un genre éprouvé, lisible et bon marché à prototyper. Un jeu narratif ou un jeu d'action 3D ne tiendrait pas dans cette chronologie.
- **Les chiffres sont autodéclarés.** 356 000 $ bruts, ce n'est pas du net, et rien n'est audité. Commission Steam, prix régionaux, remboursements et taxes sortent de là.
- **Le biais du survivant fait beaucoup de travail.** Pour chaque Slotbound, des centaines de jeux assistés par IA sont sortis dans le silence. Vous lisez celui qui a marché.
- **« Ne pas savoir coder » n'est pas « ne pas savoir penser techniquement ».** Il a dirigé un moteur, une architecture et une chaîne d'outils. C'est une compétence, simplement pas une compétence de syntaxe.
- **La liste d'outils n'est pas une recette.** Codex plus Claude plus Nano Banana ont produit ce jeu à cause de ce qu'il leur a demandé. Le même stack avec un brief vague produit un prototype que personne ne joue.
- **L'IA ne résout pas la découverte.** La démo, les mises à jour et l'entonnoir de listes de souhaits ont fait le marketing. Ce travail reste le vôtre.
