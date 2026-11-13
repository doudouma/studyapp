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

## Un chat, deux prompts, une facture

Un chat roux se retrouve seul dans un appartement avec 90 secondes pour le saccager : renverser les meubles, casser la vaisselle, récolter des boîtes de pâtée et les dépenser en améliorations qui ouvrent des pièces de plus en plus belles. Le premier niveau est une location bon marché. Le dernier est un musée.

Le jeu est la démonstration. Le chiffre qui mérite lecture, c'est la facture : deux prompts, 17 appels au modèle, 5,77 $ et pas une ligne de code tapée à la main. Le modèle était Fusion Max 2.0, du singapourien FUMO Lab, atteint via un endpoint compatible OpenAI : la même boucle tourne donc depuis Cursor ou Codex dès que vous renseignez une base URL et une clé.

## Le premier prompt est un cahier des charges, pas un vœu

Presque tous les prompts du type « fais-moi un jeu » échouent faute de critère auquel se mesurer. Celui-ci commence par demander un document de conception, et ce document est jugé aux critères d'évaluation de CrazyGames eux-mêmes : sessions d'au moins 10 minutes, rétention au deuxième jour entre 10 % et 15 %, jouable en trois secondes, tout généré par le code pour qu'il n'y ait aucun asset à télécharger.

Ce recadrage travaille plus que le choix du modèle. Les métriques de revue d'une plateforme sont un cahier des charges gratuit, et elles imposent la boucle dont le jeu a besoin — parties courtes, améliorations, tâches quotidiennes, une raison de revenir — avant qu'une seule ligne de code existe. Le document fait environ 27 000 caractères ; la version suivante pesait près de 130 Ko et tournait du premier coup.

## Quatre cycles, seize sur vingt

Quatre cycles de révision ont suivi. Vingt exigences y ont été formulées et 16 confirmées ; selon l'auteur, les quatre autres demandaient une passe supplémentaire. Aucune correction n'a été écrite à la main, et c'est le point à retenir : chaque cycle était un nouveau prompt sur la version précédente, pas une séance de débogage.

La dernière passe fut artistique, et c'est la seule étape qui sort du modèle. Le chat provisoire est devenu un modèle Blender : un rouquin tigré avec 24 couches de poils.

## Ce que la comparaison de coûts mesure vraiment

5,77 $ pour 17 appels. Aux tarifs de Claude Fable 5.1 ou GPT-6 Astra, le même volume revient à environ 14,92 $, soit un rapport de 2,6×. Sur 100 prototypes, l'écart approche 900 $.

Le montant est réel : c'est une facture mesurée, pas une estimation. Deux choses se cachent dessous. D'abord, il dépend des crédits d'essai pour les nouveaux comptes et du tarif promotionnel pratiqué par le fournisseur à ce moment-là : c'est le coût de cette tentative aujourd'hui, pas un prix unitaire stable. Ensuite, l'article contient un lien de parrainage vers le fournisseur du modèle, ce qui fait de la comparaison à 14,92 $ un calcul côté vendeur plutôt qu'un repère neutre.

L'argument ne dépend pas pour autant du ratio exact. Le développeur solo anul agarwal a réalisé en 2023 une variante façon Suika avec ChatGPT qui a atteint plus de 65 millions de joueurs et rapporté plus de 25 000 $, et il précise qu'il a fallu plus de 120 prototypes et que les 100 premiers n'ont presque rien gagné. Si une tentative coûte 5,77 $ au lieu de 15, cette trajectoire cesse d'être réservée à ceux qui ont un budget. Si elle coûte 5,77 $ et que les 100 premiers ne rapportent toujours rien, la boucle moins chère achète plus d'essais, pas une meilleure réussite.

## Rien de tout cela n'est publié

Le jeu est toujours sur la machine de l'auteur. Il n'a été soumis ni à CrazyGames ni à la plateforme de mini-jeux de WeChat : aucun joueur, aucune impression publicitaire, aucun revenu.

Reste exactement ce qu'un modèle ne règle pas à votre place : CrazyGames applique trois lignes de revue, les mini-jeux WeChat viennent avec des formalités d'enregistrement, et ni l'une ni l'autre n'est un problème de conception. La conclusion de l'auteur lui-même est que la plupart des petits jeux ne prennent pas, aussi bon marché ait été leur fabrication.

## Ce qui se transpose

> Ce qui se réutilise ici n'est ni le jeu ni le modèle : c'est l'ordre des prompts. Écrivez d'abord le cahier des charges contre les métriques de la plateforme, puis bornez l'itération à un nombre fixe de cycles pour que le coût par tentative reste connu.

Le reste est conditionnel. L'avantage de coût suppose un endpoint bon marché et une réalisation petite et autonome. L'art continue d'exiger une personne et un outil qui n'est pas un modèle de langage. Et les deux prompts sont publiés intégralement, ce qui justifie la présence du cas dans la bibliothèque : vous pouvez faire tourner la méthode sur votre propre idée au lieu d'accepter la conclusion sur parole.
