---
summary: "Un skill de design anti-AI-slop pour Claude Code, Codex, Cursor et OpenCode qui distribue 50 thèmes, rend les pages dans un vrai navigateur et traque les signes qui les font paraître générées par une machine."
tags: [Skill pour agents, Design, Claude Code, Codex, Cursor, Anti-AI-Slop, Open source]
facts:
  - key: Auteur
    value: Together AI
  - key: Stars
    value: 47,3K
    highlight: true
  - key: Thèmes
    value: "50"
  - key: Photos
    value: 755 (Wikimedia Commons)
  - key: Agents
    value: Claude Code, Codex, Cursor, OpenCode
  - key: Licence
    value: MIT
---

## Ce que c'est

Hallmark est un skill de design qui se branche sur des agents de programmation et refuse de produire des pages qui ont l'air générées par une IA. Il est distribué comme Skill pour Claude Code, Codex CLI, Cursor et OpenCode, et réalisé par Together AI. Au lieu de demander à un modèle de « faire joli », il distribue trois thèmes d'un catalogue de 50, construit la page autour de ce que le visiteur est venu faire, la rend dans un vrai navigateur et la passe au crible des signes d'IA connus.

## Le problème visé

Les modèles convergent vers les mêmes habitudes visuelles : un eyebrow au-dessus de chaque titre, des libellés en capitales avec du tracking, un mot coloré dans le titre, des grilles de cadres vides ou rien que des photos, un hero qui rate le premier écran, une inscription e-mail à la fin de chaque page et un formulaire qui dit merci sans rien envoyer. Hallmark les traite comme des défauts et bloque les pires.

## Comment se déroule une construction

1. Le pré-vol lit le projet (polices, palette, framework, un `design.md` verrouillé) et demande une fois le matériel : photos, captures, vrais chiffres. Rien n'est inventé.
2. `scripts/theme.mjs deal` propose trois thèmes qui correspondent au prompt et passent le journal ; `draw` distribue l'anatomie de la page selon sa tâche.
3. Le hero est construit seul, rendu et relu à froid avant que le reste de la page existe.
4. `scripts/sloplint.mjs --render` vérifie la page à huit largeurs, puis un sous-agent la relit avec un œil neuf.

Chaque page est du HTML et du CSS autonomes, estampillés dans leur premier commentaire CSS avec les décisions prises.

## Nouveautés de la v2

- **50 thèmes.** Chacun est un matériau (papier, typographie, couleur, surfaces, composants et texture) avec l'image d'une page finie ; une construction n'en lit qu'un.
- **Construit à partir de la tâche.** Une page de réservation réserve, une boutique vend, une newsletter abonne : l'action est là où la catégorie la place, et la page se termine dessus.
- **Custom.** Dites « custom » et Hallmark conçoit à partir de votre seul prompt, sous les mêmes règles et contrôles.
- **Votre vrai produit.** Pointez-le vers une URL, un serveur de développement ou une app et il capture les écrans lui-même.
- **Vraies photographies.** 755 photos sous licence ouverte, choisies par sujet et créditées sur la page.
- **Refonte et audit.** `/hallmark redesign <path>` reconstruit une page en gardant contenu et câblage ; `/hallmark audit <path>` se contente de rapporter.

## Les paliers

Les contrôles sont par niveaux :

- **Floor** ne sort jamais : contraste, focus, mouvement réduit, faits inventés, mise en page mobile cassée.
- **Reflex** sont les défauts dans lesquels tombe un modèle ; une construction motivée peut en écarter un en le consignant.
- **Finish** sont des détails de métier qui ne bloquent jamais la livraison.

## Limites actuelles

- C'est un Skill, pas un générateur de pages : il faut un environnement d'agent compatible et Node 18 ou plus.
- Les contrôles navigateur (`sloplint --render`, captures) demandent aussi `puppeteer-core` et Chrome ; sans eux, seuls les contrôles statiques tournent.
- Les thèmes sont des matériaux, pas des plans : deux prompts dans un même thème donnent deux pages différentes ; la cohérence vient du matériau, pas d'un template figé.
- Le catalogue de 50 thèmes et la bibliothèque photo sont des opinions curatées, pas un système de design universel.
- Le nombre d'étoiles et les fonctionnalités sont un instantané ; le dépôt avance vite.

## Verdict

> **Recommandation principale**
> Utilisez Hallmark quand un agent continue de produire la même landing générique. Le plus utile, ce sont les paliers et le lint navigateur : ils transforment « ça a l'air généré par une IA » en une checklist que le modèle peut rater.

Hallmark convient aux développeurs qui utilisent déjà Claude Code, Codex, Cursor ou OpenCode et veulent une couche de goût reproductible sans adopter un système de design complet. Il est moins pertinent si vous avez besoin d'une bibliothèque de composants complète ou d'un éditeur visuel.

## Attribution

Réalisé par Together AI. Code et instructions d'installation sur [github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark) ; galerie de thèmes sur [usehallmark.com](https://www.usehallmark.com/). Licence MIT.
