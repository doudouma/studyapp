---
name: Crumb Colony
summary: Une personne, 30 ¥ et Claude Code : un mini-jeu WeChat passé de 3,65 ¥ à 2002 ¥ par jour en trois semaines.
tags: [Mini-jeu WeChat, Claude Code, Développeur solo, Pixel art, Puzzle, Revenus publicitaires]
facts:
  - key: ad revenue
    value: 2002 ¥ en un jour · 2730 ¥ sur 7 jours
    highlight: true
  - key: first ad day
    value: 3,65 ¥, 2002 ¥ trois semaines plus tard
  - key: team
    value: 1 personne · compte individuel, sans société
  - key: startup cost
    value: Certification WeChat 30 ¥/an · sans ISBN · sans dépôt de logiciel
  - key: models
    value: Claude Code — code, tests par bots, envoi des builds
  - key: port to WeChat
    value: Version web portée en une semaine
  - key: review
    value: 2 refus, tous deux textuels
  - key: discovery
    value: 57% des revenus de la semaine viennent de la recherche WeChat
---

## Une personne, trois semaines : de 3,65 ¥ à 2002 ¥

Il y a trois semaines, le premier jour de publicité de Crumb Colony rapportait 3,65 ¥. Le 13 novembre 2026, le jeu a gagné 2002,04 ¥ en une journée ; 2730,44 ¥ sur les sept derniers jours.

Une seule personne l'a fait : compte WeChat individuel, pas de société, aucun achat de trafic, et tout le code écrit avec Claude Code. Le jeu est un puzzle de tri de couleurs : chaque niveau est une image en pixel art, on touche une boîte de couleur, on lâche une colonie de fourmis de la même couleur, et elle mange l'image depuis le bord vers l'intérieur avant de la rapporter au nid. Il tourne en mini-jeu WeChat et dans le navigateur. L'auteur, 本山德彪, écrivait du code chez Tencent et Meituan ; il construit aujourd'hui ses propres produits. Il a raconté le parcours en sept étapes : éligibilité, inscription, développement, validation, ouverture du programme publicitaire, placement des annonces, trafic.

Ce qui rend le texte utile n'est pas « l'IA sait faire des jeux », mais comment une personne précise a mené une petite chose jusqu'au bout : où est passé l'argent, à quelle étape ça a bloqué, et quelles décisions il a dû prendre seul.

## D'abord les comptes : société, ISBN, démarches

C'est la partie qu'on lui demande le plus, et ses réponses sont concrètes :

* **Tout le monde peut le faire** : il s'est inscrit en personne physique. Pas de société nécessaire.
* **Pas d'ISBN** : tant que le jeu ne diffuse que des publicités et n'a pas d'achats intégrés.
* **Des démarches, oui — deux** : d'abord le dépôt du mini-jeu, ensuite celui du mini-programme, tous deux avec reconnaissance faciale. Une version solo peut sortir avant la fin du dépôt ; c'est ainsi qu'il a publié.
* **Pas de dépôt de logiciel** : ni la validation, ni la publication, ni le programme publicitaire ne l'ont demandé.
* **Le seul vrai coût, c'est la certification** : 30 ¥/an en personne physique, 300 ¥/an pour une société. La plateforme prélève l'impôt au versement.
* **Solo d'abord** : classements et duels entre amis obligeraient à passer en ligne, et cela exige de terminer d'abord le dépôt du mini-programme.

Deux décisions en disent long. Il voulait l'appeler 蚂蚁搬家 (« des fourmis qui déménagent »), le nom était pris, et il a retenu 蚂蚁搬画 (« des fourmis qui déplacent des tableaux ») : le nom est aussi le terme que les joueurs chercheront, donc il doit être court et trouvable. Et il a choisi le solo plutôt que de laisser un classement pousser la sortie dans une file de démarches. La certification de 30 ¥ s'est remboursée dès la première semaine de publicité.

## L'IA écrit le code, l'humain garde le plaisir

Sa version web est passée sur WeChat en une semaine environ. La liste des tâches de l'IA est très concrète :

* écrire le code et corriger les bugs ;
* écrire quelques « joueurs bots » qui jouent chaque niveau dans le vrai jeu, estiment la part de joueurs capables de gagner, réajustent quand la difficulté dérape, puis retestent ;
* dérouler tout le parcours après chaque modification — démarrage, niveau réussi, échec, vidéo récompensée, partage — avec plus de cent vérifications à passer ;
* empaqueter et téléverser via la ligne de commande de WeChat DevTools, pour que la build de développement apparaisse seule dans la console.

L'humain clique toujours sur « envoyer en validation » et « publier ». C'est la répartition qu'il répète : l'IA produit un résultat vérifiable, l'humain tranche.

Le plaisir est ce qui lui a pris le plus de temps. Une mécanique lasse après quelques dizaines de niveaux, alors chaque chapitre change de décor quotidien et ajoute une mécanique qui n'existe que là : dans le chapitre d'hiver, la neige tombe et recouvre le plateau ; dans celui du Nouvel An, des pétards pendent dans l'image. Ses règles de design ressemblent à des règles de produit, pas de fonctionnalité : alterner aide et obstacle ; lier la mécanique au décor ; l'expliquer avec une carte à la première apparition ; si le joueur perd, lui montrer comment ; rendre l'explosion agréable et ne pas étirer la fin.

## La difficulté est une phrase, pas un chiffre

Chaque niveau reçoit une phrase de « déclic » : ce que le joueur dira quand il aura compris. S'il n'arrive pas à l'écrire, le niveau repose sur la chance ou sur l'empilement de difficulté, et il est refait.

La difficulté avance par vagues : un niveau dur tous les quelques niveaux, suivi d'un facile. Le premier reste court ; le deuxième demande déjà de réfléchir. Les bots testent avant la sortie, les vrais joueurs après — le tableau de bord a montré que beaucoup de nouveaux joueurs abandonnaient avant le niveau cinq, alors il a raccourci le premier niveau. La difficulté des bots et celle des humains ne concordent souvent pas, et les données réelles tranchent.

Tout cela vit dans un document de « standards de niveau ». L'IA vérifie chaque nouveau chapitre contre lui avant publication, et une règle échouée signifie que le chapitre ne sort pas. Le jeu compte aujourd'hui 440 niveaux en 22 chapitres ; ce document est la seule chose qui empêche les derniers de devenir du remplissage.

## Deux refus, aucun lié au code

Le formulaire de validation demande plus de matière que le code : rapport d'auto-évaluation, description des scènes principales, explication du gameplay, conception des systèmes, contexte et thème, et au moins trois captures prises dans WeChat, avec le bouton capsule et le nom du jeu visibles.

Le jeu a été renvoyé deux fois :

1. Du texte en anglais dans l'interface — le nom anglais de l'accueil, des sous-titres anglais dans les fenêtres — tout est passé en chinois.
2. Un titre d'accueil peu soigné : il l'a réduit à exactement 蚂蚁搬画, caractère pour caractère le nom enregistré.

Sa conclusion tient en une phrase : partout où le nom apparaît dans le jeu, mettre le nom enregistré, sans anglais ni sous-titre. Les deux corrections étaient triviales ; ce qu'elles ont coûté, c'est du délai de sortie, pas de l'ingénierie.

## Des annonces seulement là où le joueur bloque

Le 13 novembre, la vidéo récompensée a produit 90,6% des revenus et les interstitiels 1,9%. Le joueur moyen a choisi de regarder environ sept vidéos récompensées ce jour-là. Les interstitiels ont eu à peu près autant d'impressions que les bannières et ont rapporté le moins : la plupart ferment le jeu quand l'un apparaît.

Ses trois règles :

* **Placer la vidéo récompensée là où le joueur en a besoin** : bloqué, à court d'objets, en quête d'un indice. Pas à l'entrée du niveau, avant que quoi que ce soit n'ait mal tourné.
* **Ne pas offrir d'objets** : plus on en donne, moins on regarde de vidéos. Chaque objet commence à un et n'est jamais rechargé automatiquement.
* **Serrer les interstitiels** : seulement quand le joueur s'est arrêté, par exemple en revenant au menu ; jamais dans les 15 premiers niveaux ; jamais sur « suivant » ou « réessayer ». Les bannières restent en bas de l'écran de résultat, nulle part ailleurs dans un niveau.

Le design publicitaire façonne le jeu en retour. Vivre uniquement d'annonces fait de la vidéo récompensée le métier, donc le design doit ménager des moments où le joueur bloque et où on peut lui proposer une sortie : rembobiner le plateau ou tenter un autre sauvetage.

## Trafic : un coup de pouce pour jeu récent et un nom qui se cherche

Il n'a rien dépensé en acquisition. Ce qu'il a utilisé :

* **Le coup de pouce aux nouveaux jeux** : WeChat offre une fenêtre de recommandation dans les 90 jours suivant la première sortie. Il l'a ouverte et les utilisateurs ont été multipliés par 10. Il n'y en a qu'une, donc il conseille de la garder pour quand le jeu est poli.
* **Ajouter à Mes mini-programmes** : ceux qui arrivent par recommandation vous oublient en partant. Il a créé une carte avec une flèche vers le « ··· » en haut à droite.
* **Cartes de partage** : partager un niveau place l'ami directement dans ce niveau, pas au premier.
* **Un nom cherchable** : le tableau de bord ventile les revenus par source ; 57% de la semaine dernière venaient de la recherche. Un bon nom, c'est comme ça qu'on vous trouve.
* **Un journal public** : il publie chaque jour « jour N de publicité sur mon mini-jeu » sur X, transforme les questions des réponses en articles pour les comptes officiels WeChat, Zhihu et Juejin, puis les enregistre de sa voix pour les chaînes, Bilibili et Douyin.

Le dernier point est le volant : des revenus publics amènent des questions, les questions deviennent des articles, les articles amènent du trafic de recherche et de nouveaux joueurs.

## Pour qui est ce chemin

> **Recommandation principale**
> Copiez le processus, pas le jackpot. Entre 3,65 ¥ et 2002 ¥, il y a trois semaines, 440 niveaux, deux démarches, deux refus et un document de standards. Cela convient à quelqu'un qui construira en public, supportera la paperasse et traitera l'IA comme une équipe d'ingénierie, pas comme une machine à vœux ; cela ne convient ni à qui cherche un revenu passif, ni à qui refuse de rejouer des niveaux sur téléphone jusqu'à ce que la difficulté sonne juste. Si vous commencez, suivez ses sept étapes — mais faites deux choses d'abord : vérifier que le nom est libre, et sortir la version solo.

La même capture peut se lire de deux façons. L'une est un encouragement : une personne peut le faire, et ça coûte 30 ¥ pour démarrer. L'autre est le biais de survie : personne n'a partagé le jour à 3,65 ¥. Sur l'IA, aucun des deux refus ne mentionnait la chaîne d'outils, mais les critères de validation et les seuils du programme publicitaire bougent (à son lancement, le seuil était de 500 visiteurs ; il est de 100 aujourd'hui), donc un chemin qui marche aujourd'hui ne marchera pas forcément pareil demain. Il n'esquive rien : les revenus sont publics, les chiffres sont publics, et même l'erreur — un premier niveau trop long — a fini dans l'article.
