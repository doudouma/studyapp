---
summary: "Un jeu web 3D jouable, créé à partir de deux prompts et de zéro ligne de code écrite à la main : 5,77 $ d'appels au modèle, quatre cycles de révision, aucun moteur de jeu."
tags: [Généré par IA, Jeu web, 3D, Prompts seuls, Détail des coûts]
facts:
  - key: author
    value: AYi (@AYi_AInotes)
  - key: platforms
    value: Web (cible CrazyGames) · mini-jeu WeChat
  - key: models
    value: Fusion Max 2.0 (FUMO Lab)
  - key: cost
    value: 5,77 $ · 17 appels
    highlight: true
  - key: same volume elsewhere
    value: ~14,92 $ avec Claude Fable 5.1 / GPT-6 Astra
  - key: codebase
    value: 130 Ko pour la première version · 0 ligne éditée à la main
  - key: revisions
    value: 4 cycles · 16 exigences acceptées sur 20
  - key: status
    value: Jouable en local · pas encore publié
---

## Ce que c'est

《猫咪拆家：从出租屋拆到博物馆》 est un jeu 3D dans le navigateur où l'on incarne un chat roux laissé seul à la maison. Chaque partie dure 90 secondes : renverser des meubles, casser des objets, récolter des boîtes de pâtée, puis dépenser ces boîtes en améliorations qui débloquent des décors de plus en plus luxueux, d'un appartement en location jusqu'à un musée.

Ce qui en fait un cas et non une fiche produit, c'est la méthode. L'auteur n'a pas écrit une ligne de code. Tout vient de deux prompts adressés à Fusion Max 2.0, un modèle du singapourien FUMO Lab, appelé 17 fois pour un total de 5,77 $.

## Proposition de valeur

Le sujet de l'expérience, c'est le coût d'une tentative, pas le jeu.

- Le document de conception avant le code : le premier prompt demande un document Markdown complet construit à partir des critères d'évaluation de CrazyGames — sessions d'au moins 10 minutes, rétention au jour 2 de 10 à 15 %, prise en main en 3 secondes — plutôt que « fais-moi un jeu ». Les métriques de la plateforme tiennent lieu de cahier des charges.
- Une facture mesurable par tentative : 5,77 $ pour 17 appels, contre environ 14,92 $ pour le même volume sur Claude Fable 5.1 ou GPT-6 Astra. Sur 100 prototypes, l'écart atteint près de 900 $, et c'est précisément l'argument, puisque la plupart des prototypes ne rapportent rien.
- Un seul point d'accès pour tout le cycle : document de conception, première version de 130 Ko, quatre cycles de révision et la passe artistique sont sortis du même modèle. Il parle l'API Chat Completions d'OpenAI, donc Cursor ou Codex peuvent le piloter avec une base URL et une clé.

## Ce qu'il remplace

| Outil de référence | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Cycle de prototypage Unity / Godot | Partial | Pour un jeu web en sessions de 90 secondes sans technologie moteur maison, deux prompts et quatre cycles ont couvert ce que coûte normalement l'étape du prototype en blocs. Ce n'est pas un substitut à l'ingénierie de production : pas de physique réglée à la main, pas de pipeline de build, pas de travail sur les SDK de plateforme. |
| Modèles frontière payants pour coder | Moderate | Quand la livraison est un jeu HTML/JS autonome, un point d'accès moins cher a assuré conception, code et itération d'un seul tenant. Un travail qui exige un long contexte sur un vrai dépôt renvoie toujours vers un modèle frontière. |
| Mini-jeu 3D commandé à un studio | Low | Une commande apporte direction artistique, QA et publication en boutique. Ici, on obtient une version jouable, pas un titre publié. |
| Constructeurs de jeux sans code | Moderate | Les constructeurs fournissent modèles et hébergement ; ici vous gardez le code, à un coût par tentative plus faible une fois le premier prototype passé. |

## Réalités et limites actuelles

- Pas publié. Le jeu reste sur la machine de l'auteur et n'a été soumis ni à CrazyGames ni à la plateforme de mini-jeux de WeChat.
- Quatre cycles n'ont pas tout réglé. Sur 20 exigences formulées, 16 ont été confirmées ; les quatre autres demandaient une passe supplémentaire.
- Les 5,77 $ sont une facture mesurée sur 17 appels, pas un prix unitaire. La reproduire dépend des crédits d'essai pour les nouveaux comptes et du tarif promotionnel en cours.
- Le plus dur s'est déplacé, il n'a pas disparu. CrazyGames applique trois lignes de revue, les mini-jeux WeChat exigent un dossier, et la conclusion de l'auteur lui-même est que la plupart des petits jeux ne prennent pas.

## Verdict

> **Recommandation principale**
>
> À prendre comme un modèle de coût pour installer une habitude de prototypage, pas comme la preuve que ce jeu rapportera. Ce qui se transfère, c'est la structure des prompts — écrire le document de conception contre les métriques de la plateforme, puis borner les corrections à quatre cycles — et le chiffre qui compte est 5,77 $ par tentative, parce qu'il détermine combien de tentatives vous pouvez vous offrir.

## Cycle de développement et itération

1. **Document de conception.** Un prompt, environ 27 000 caractères, dérivé des critères de CrazyGames plutôt que d'une théorie du game design.
2. **Première version.** Près de 130 Ko de code fonctionnel, sans édition manuelle.
3. **Quatre cycles de révision.** 20 exigences formulées, 16 confirmées. L'auteur affirme qu'aucune ligne n'a été corrigée à la main entre les cycles.
4. **Passe artistique.** Le chat primitif par défaut a été remplacé par un chat roux modélisé sous Blender avec 24 couches de poils.
5. **Reste à faire.** Soumission, QA de plateforme et démarche d'enregistrement pour WeChat.

| Étape | Modèle utilisé |
| --- | --- |
| Document de conception | Fusion Max 2.0 |
| Première version jouable | Fusion Max 2.0 |
| Quatre cycles de révision | Fusion Max 2.0 |
| Art 3D du personnage | Blender (externe) |

> **Profil de coût**
>
> 5,77 $ pour 17 appels. Aux tarifs de Claude Fable 5.1 ou GPT-6 Astra, le même volume revient à environ 14,92 $, soit 2,6 fois plus.

## Métriques et monétisation

Aucun revenu pour l'instant. Le jeu n'a ni joueurs, ni impressions publicitaires, ni pourboires, faute d'avoir été soumis quelque part.

La monétisation suit la voie par défaut des plateformes plutôt qu'un choix de conception : CrazyGames paie à l'impression publicitaire une fois les lignes de revue franchies, et les mini-jeux WeChat reçoivent des pourboires via la plateforme ouverte.

La référence en ouverture de l'article est une variante façon Suika du développeur solo anul agarwal, réalisée avec ChatGPT en 2023 : plus de 65 millions de joueurs et plus de 25 000 $ de revenus, au prix de plus de 120 prototypes dont les 100 premiers n'ont presque rien rapporté.

## Réception et débats

La publication a récolté environ 300 mentions J'aime et 16 reposts le premier jour : la conversation est modeste. Et elle ne porte pas vraiment sur le jeu.

- **Des tentatives bon marché rendent le volume viable.** Si un essai coûte 5,77 $ au lieu de 15, la trajectoire des 120 prototypes cesse d'être réservée aux studios financés.
- **Le volume n'est pas le goulot d'étranglement.** Les chiffres d'anul agarwal indiquent que les 100 premiers prototypes n'ont presque rien gagné : un cycle moins cher raccourcit la boucle sans dire quelle idée fonctionnera.
- **La comparaison a un intérêt commercial.** L'article contient un lien de parrainage vers le fournisseur du modèle, ce qui invite à lire le chiffre de 14,92 $ comme une estimation côté vendeur plutôt qu'un repère neutre.

Les deux prompts sont publiés intégralement, et c'est la raison d'inclure ce cas dans la bibliothèque : la méthode peut être confrontée à votre propre projet au lieu d'être acceptée sur parole.
