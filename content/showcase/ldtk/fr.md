---
name: LDtk
summary: "L'éditeur de niveaux 2D que le lead designer de Dead Cells a créé en quittant le studio — gratuit, sous licence MIT, et volontairement limité."
tags: [Open source, Jeu vidéo, Éditeur de niveaux, App de bureau, Gratuit]
facts:
  - key: author
    value: Sébastien Benard (deepnight)
  - key: license
    value: MIT · toutes les fonctions ouvertes
  - key: platforms
    value: Windows · macOS · Linux
  - key: downloads
    value: plus de 670 000 téléchargements
    highlight: true
  - key: github
    value: 4,9 k étoiles · 323 forks
  - key: version
    value: v1.5.3 · dernier commit nov. 2026
  - key: built with
    value: Haxe + Electron
  - key: price
    value: Gratuit · copie payante facultative sur itch.io / Steam
---

## Un éditeur gratuit de designer

Sébastien Benard a été lead designer de Dead Cells chez Motion Twin pendant des années. La première grande chose qu'il a publiée en quittant le studio n'est pas un jeu, mais un éditeur de niveaux, libéré sous licence MIT : LDtk, pour Level Designer Toolkit.

La phrase du site officiel est plus directe que d'habitude pour une page d'outil — « un éditeur de niveaux 2D par le lead designer de Dead Cells, rapide, gratuit, open source » — et la ligne juste en dessous semble écrite pour des confrères plutôt que pour des acheteurs : fait par un développeur de jeux, pour des développeurs de jeux.

Six ans plus tard, les chiffres ne sont pas ceux d'un projet du dimanche : environ 4 900 étoiles, plus de 670 000 téléchargements toutes versions confondues, et des studios indés qui l'utilisent en production.

## Faire moins, mais le faire bien

Tout outil de ce genre meurt de la même façon : il accumule des fonctions jusqu'à ce que personne ne trouve celle qu'il cherche. Tiled, le vétéran du secteur, reste l'exemple cité dès qu'on parle d'interfaces surchargées.

LDtk va dans l'autre sens et l'énonce comme principe de conception : faire moins, mais le faire bien. Uniquement de la 2D. Uniquement plateforme et vue de dessus, avec un « désolé » explicite pour ceux qui demandent de l'isométrique ou de la fausse 3D. La liste de fonctions n'est pas courte, mais chaque élément est quelque chose qu'un level designer manipule tous les jours ; rien n'est là pour démontrer une prouesse technique.

Cette retenue vient de jeux réellement livrés. Nuclear Blaze, le titre de Benard lui-même, a été entièrement construit dans LDtk : l'éditeur est venu d'abord, puis un jeu commercial a prouvé qu'il tenait.

## Trois choix pour un solo

Ceux qui utilisent LDtk ne sont pas des studios, mais une ou trois personnes sans programmeur d'outils, sans budget et sans temps. Trois fonctions sont taillées exactement pour ça.

**Un export si simple que c'en est gênant.** Tout nouvel éditeur crée le même moment awkward : il faut maintenant écrire un importateur pour son propre moteur. LDtk sort quelques PNG par niveau plus un petit JSON, avec une documentation qui se lit en une après-midi.

![La vue monde : les niveaux deviennent des salles, reliées comme elles le seront dans le jeu final](/showcase/ldtk-1.jpg)

**Des règles de rendu automatique pour la partie ennuyeuse.** Poser des tuiles à la main, c'est choisir la bonne variante de bord à chaque coin d'herbe. LDtk permet de définir les règles visuellement et génère les raccords lui-même. La formule de l'auteur : laissez LDtk faire le travail ennuyeux.

**Le mode monde.** Les niveaux cessent d'être des images isolées pour devenir des salles d'un monde, disposées en grid-vania, linéaire ou libre. On glisse pour réorganiser la carte, la molette bascule entre vue monde et vue niveau. Si la structure vous dit quelque chose, c'est le même problème que Dead Cells a dû résoudre.

## Gratuit, copie payante en option

LDtk est gratuit sans verrou : pas d'offre Pro, pas de filigrane à l'export, pas de limite de niveaux par projet.

Et pourtant on peut payer : il est vendu sur itch.io et Steam, et le site invite à acheter une copie ou à devenir sponsor si l'on veut soutenir le travail. Ce que l'on reçoit est octet pour octet le même logiciel. C'est le modèle « payez si le cœur vous en dit », et il ne fonctionne que lorsque l'outil est assez bon pour donner envie.

![Définition des entités : champs, énumérations, valeurs par défaut et affichage dans l'éditeur](/showcase/ldtk-2.jpg)

## Une personne, des milliers de commits

L'historique raconte la forme du projet : plus de cinq ans, des milliers de commits, des dizaines de versions, et un code qui bouge encore — le dernier push date de novembre 2026.

C'est du Haxe sur Electron, la même famille de langages que Dead Cells. Moins une coïncidence qu'un rappel : chacun construit ses outils avec ce qu'il maîtrise déjà.

La partie la plus intéressante à lire reste la section sauvegarde de la page d'accueil : en substance, ils savent que de mauvaises choses arrivent, LDtk garde des sauvegardes solides et récupère les modifications non enregistrées après un plantage — il ne devrait pas planter, mais le monde n'est pas parfait. C'est une attitude concrète envers le travail des autres, du genre qu'on n'écrit qu'après avoir perdu du travail soi-même.

![Écran d'accueil de LDtk 1.5 — la version qui a introduit le logo actuel et les outils de disposition du monde](/showcase/ldtk-3.jpg)

## Pourquoi il est ici

LDtk n'est pas un produit d'IA, et cette bibliothèque ne se limite pas aux produits d'IA. Il est ici parce qu'il occupe l'autre moitié de la même question : que publie aujourd'hui une personne expérimentée, avec de bons outils et aucune entreprise derrière elle ?

La réponse est un outil qui supprime un coût pour tous les autres. Un éditeur de niveaux correct, ce sont des mois de travail qu'un développeur solo ne peut ni s'offrir ni éviter. LDtk ramène ce coût à zéro, et continue de livrer.
