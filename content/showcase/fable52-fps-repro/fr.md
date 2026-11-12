---
slug: fable52-fps-repro
name: Reproduction FPS de Fable 5.2
summary: Un seul prompt et Fable 5.2 écrit en 40 minutes un shooter 3D de 131 KB en un seul fichier ; le flux est ensuite découpé en expériences audio, matériaux et modélisation, chacune facturée séparément. Sans aucune intervention : l'IA fait ses propres captures dans le navigateur, rend son audio hors ligne pour détecter le clipping, et les quatre expériences reviennent à environ 39,6 dollars.
category: experiment
tags: [Fable 5.2, Claude Code, Three.js, WebAudio, Développement de jeux, Ingénierie de prompts]
publishedAt: 2026-11-12
updatedAt: 2026-11-12
author: WquGuru
externalUrl: https://github.com/wquguru/fable52-fps-repro
facts:
  - key: one prompt
    value: Un prompt → un FPS de 131 KB en un fichier (trois vagues de drones, 18 sons synthétisés)
    highlight: true
  - key: experiments
    value: 4 expériences indépendantes · 5 exécutions · tout en HTML monofichier
  - key: time
    value: 16,6 / 23,9 / 28,7 / 40,8 minutes
  - key: cost
    value: Environ 39,6 $ pour les quatre · l'exécution 04 coûte 15,96 $ (60,57 $ sans cache)
  - key: stack
    value: Claude Code headless · Fable 5.2 · agent-browser · OfflineAudioContext
  - key: license
    value: MIT · 55 étoiles
sources:
  - title: Fable 5.2 de la modélisation au jeu FPS complet (republié par WaytoAGI)
    url: https://waytoagi.feishu.cn/wiki/WhlCwkIkpi0Y3ik2NHXcB46enUc
    publisher: WaytoAGI / WquGuru
  - title: wquguru/fable52-fps-repro — GitHub (MIT)
    url: https://github.com/wquguru/fable52-fps-repro
    publisher: GitHub
  - title: Jouer en ligne
    url: https://wquguru.github.io/fable52-fps-repro/
    publisher: GitHub Pages
  - title: Publication d'origine (X)
    url: https://x.com/wquguru/status/2120382704
    publisher: WquGuru
cover:
  src: /showcase/fable52-cover.jpg
---

## Un prompt, quarante minutes, un shooter

Le 9 novembre 2026, Felix Rieseberg, d'Anthropic, a montré sur X un shooter navigateur nommé Saltline, généré à partir d'un seul prompt de Fable 5.2 : 8 heures d'exécution, 445 millions de tokens d'entrée, environ 550 dollars. Deux jours plus tard, WquGuru l'a reproduit avec le prompt publié par Felix — **40,8 minutes, 73 tours, 6,61 millions de tokens d'entrée, environ 15,96 dollars** — et le modèle a créé son propre jeu, SUBLEVEL 07 : un couloir souterrain de sous-station humide, des reflets en temps réel au sol, une carabine avec viseur point rouge et trois vagues de drones flottants.

Il ne s'est pas arrêté à une exécution. Le tutoriel découpe le flux en quatre expériences facturables séparément : d'abord l'audio, puis les matériaux, puis la modélisation, et seulement ensuite le prompt d'origine lâché dans un dossier vide. Chaque expérience est **du code pur, sans charger d'images, de modèles ni d'audio externes**.

![SUBLEVEL 07 en jeu : un couloir souterrain de sous-station, la carabine et la première des trois vagues de drones](/showcase/fable52-cover.jpg)

## La distribution : quatre outils et une commande

Le matériel est réduit :

* **Claude Code** — exécute tout en mode headless depuis la ligne de commande, gère les fichiers, le cache et un plafond de budget
* **Fable 5.2** — écrit le code de synthèse WebAudio, les shaders Three.js, les modèles par sommets et la logique du jeu
* **agent-browser** — permet à l'IA d'ouvrir sa propre page dans votre Chrome local, de faire des captures, de lire les erreurs de console et de vérifier que WebGL tourne sur un vrai GPU
* **OfflineAudioContext** — le moteur de rendu audio hors ligne du navigateur, pour qu'une IA qui n'entend rien puisse rendre l'audio et vérifier les pics, le clipping et les passages silencieux

En une phrase : lancez Claude Code en ligne de commande avec Fable 5.2, passez-lui une demande unique et un prompt système d'autocontrôle, et laissez-le écrire du code, capturer sa page dans le navigateur et rendre l'audio hors ligne, sans interruption jusqu'à la livraison d'un HTML monofichier.

En pratique, deux fichiers : `builder_system.md` contient le prompt système additionnel (autorise agent-browser, impose l'autocontrôle, limite la sortie au dossier indiqué), et `prompt.md` la demande de cette exécution. Puis :

```
claude -p "$(cat prompt.md)" \
  --model claude-fable-5-2 \
  --permission-mode auto \
  --append-system-prompt "$(cat builder_system.md)" \
  --max-budget-usd 12
```

## D'abord, 16,6 minutes pour prouver la boucle

Ne commencez pas par le FPS complet. Commencez par la plus petite console audio possible pour prouver que la boucle sans intervention fonctionne ; cette exécution a coûté 4,66 dollars. Trois étapes :

1. **Préparer l'environnement (2 minutes)** — Claude Code 2.1.242 ou plus récent (l'auteur a utilisé 2.1.322), Chrome et agent-browser installés
2. **Créer deux fichiers (2 minutes)** — `builder_system.md` et `prompt.md` dans un dossier vide
3. **Écrire le prompt système (1 minute)** — demander à l'IA de faire ses propres captures et de vérifier l'audio, puis lancer la commande

Le résultat dépasse la demande : une console avec forme d'onde, spectrogramme et spectre, pic / RMS / nombre de voix en direct, et 14 boutons de son couvrant tir de fusil en intérieur et extérieur, les trois phases du rechargement, une douille qui tombe, trois pas (béton, métal, flaque), une balle qui passe, un ricochet, la pluie, un tonnerre lointain et environ 30 secondes de musique. Il a même ajouté un bouton « démo de fusillade » qui enchaîne tous les sons, et chaque déclenchement tire une nouvelle graine aléatoire : appuyer deux fois sur le même bouton ne sonne pas identique.

![La console audio SALTLINE : forme d'onde, spectrogramme, spectre et 14 sons de jeu synthétisés en code](/showcase/fable52-audio.jpg)

## Expérience 01 : synthétiser l'audio d'un jeu en code pur

Pourquoi tester l'audio d'abord ? Parce que c'est là que « l'IA n'entend rien » se voit le plus nettement : une capture vérifie une image, pas un son.

Cette exécution a pris 16,6 minutes en 16 tours : 1,17 million de tokens d'entrée, 88,6 % de cache, 78 000 tokens de sortie — 4,66 dollars contre 12,47 sans cache. Le HTML monofichier pèse 56 KB.

Conformément au prompt système, il a rendu l'audio hors ligne avec OfflineAudioContext pour vérifier le clipping et les silences, et son propre rapport indique « non écouté par une oreille humaine ». Cette phrase compte : **l'autocontrôle valide des propriétés techniques, pas si ça sonne bien**.

## Expérience 02 : matériaux procéduraux pour un quai pluvieux

Aucune texture d'image, et une seule bibliothèque depuis un CDN (Three.js) ; tout le reste est généré en code : béton mouillé avec reflets réels dans les flaques, conteneurs peints qui rouillent sur les bords (même les numéros de caisse sont dessinés), armoires en acier galvanisé, pneus en caoutchouc noir, palettes de bois, plaque de laiton patinée.

23,9 minutes, 25 tours, 2,46 millions de tokens d'entrée, 83,8 % de cache, 8,56 dollars et 55 KB de sortie. Il a utilisé agent-browser pour capturer sa propre page et confirmé que WebGL tournait sur le vrai GPU d'un Apple M2 Pro, pas en rendu logiciel. Ses défauts auto-déclarés : certains nids-de-poule peu profonds sont lus comme des flaques et les piles de conteneurs au loin sont des aplats de couleur.

![L'étude de matériaux du quai pluvieux : sol mouillé réfléchissant, conteneurs rouillés et numéros peints par code](/showcase/fable52-materials.jpg)

## Expérience 03 : une grue, un navire et un fusil faits de code

Le troisième test est de la modélisation hard-surface sans fichier de modèle : uniquement de la géométrie, assemblée dans Three.js :

1. **Un portique de quai** — treillis, local technique, cabine, huit câbles de levage, spreader de 40 pieds, avec animation de chargement
2. **Un porte-conteneurs de 215 mètres** — étrave bulbeuse, douze baies de conteneurs, passerelle
3. **Un fusil d'assaut à la première personne** — rail, frein de bouche, fenêtre d'éjection, chargeur, viseur point rouge

28,7 minutes, 19 tours, 2,05 millions de tokens d'entrée, 76,1 % de cache, 10,38 dollars et 69 KB de sortie. Il a aussi ajouté un onglet « panorama du quai » que personne n'avait demandé, réunissant les trois scènes : environ 1,85 million de triangles, à environ 120 fps sur le M2 Pro. Son défaut auto-déclaré est tout aussi honnête : la vue à la première personne n'a pas de bras.

![La visionneuse de modèles : grue, navire, fusil et panorama du quai, assemblés en géométrie pure](/showcase/fable52-models.jpg)

## Expérience 04 : un prompt, un FPS complet

Les trois modules validés, l'auteur est passé à un dossier propre et vide et a utilisé le prompt d'origine de Felix — sans le « You know, you should also » initial, avec une ligne sur le HTML monofichier, CDN uniquement, aucun fichier externe — pour voir ce qu'une seule exécution produirait.

Celle-ci a utilisé le cache d'une heure : 40,8 minutes, 73 tours, 6,61 millions de tokens d'entrée, 90,9 % de cache, 193 000 tokens de sortie. Au prix catalogue, 60,57 dollars ; avec le cache, 15,96. Ces 90,9 % tombent exactement dans la fourchette de 90–95 % qu'il avait estimée à partir des chiffres de la publication d'origine.

Le modèle a construit SUBLEVEL 07, 131 KB en un fichier :

* **Scène et rendu** — un couloir souterrain de sous-station humide avec des numéros peints sur les piliers, matériaux procéduraux, reflets en temps réel au sol, AO, bloom et étalonnage cinéma, avec trois niveaux de qualité
* **Armes et combat** — carabine avec viseur point rouge, rechargement, recul, flash de bouche et éjection des douilles ; trois vagues de drones flottants (la deuxième dans une zone de lumières rouges) ; 18 sons synthétisés en code
* **Test automatisé** — avant de livrer, il a écrit son propre script qui a vaincu les trois vagues, vérifié les écrans de victoire et de mort et confirmé une console sans erreur

Ses défauts auto-déclarés : avant-bras et gants grossiers, et seul le sol réfléchit.

![SUBLEVEL 07 : flash de bouche, douilles éjectées et fusillade dans la zone de lumières d'alerte](/showcase/fable52-fps.jpg)

## La facture : le cache transforme 60 dollars en 16

Toutes les données ont été mesurées le 2026-11-10 avec Claude Code 2.1.322 et le modèle `claude-fable-5-2`. L'auteur utilisait son quota d'abonnement ; les montants sont donc l'estimation de Claude Code aux prix officiels de l'API, qu'il a recalculée ligne par ligne avec un script ; chaque expérience n'a été exécutée qu'une fois.

| Expérience | Temps | Tours | Tokens d'entrée | Cache | Coût | Sans cache |
| --- | --- | --- | --- | --- | --- | --- |
| 01 console audio (cache 5 min) | 16,6 min | 16 | 1,17 M | 88,6 % | 4,66 $ | 12,47 $ |
| 01 console audio (cache 1 h) | 18,8 min | 16 | 1,29 M | 78,6 % | 6,97 $ | 13,98 $ |
| 02 matériaux | 23,9 min | 25 | 2,46 M | 83,8 % | 8,56 $ | 24,24 $ |
| 03 modélisation | 28,7 min | 19 | 2,05 M | 76,1 % | 10,38 $ | 21,96 $ |
| 04 FPS en un prompt | 40,8 min | 73 | 6,61 M | 90,9 % | 15,96 $ | 60,57 $ |

Les quatre expériences totalisent environ 39,6 dollars, ou environ 47 avec l'exécution de contrôle et les tests rapides. L'essentiel : le modèle ne produit pas le jeu d'un coup, il relit le projet et le modifie sur des dizaines de tours. La lecture de cache coûte 0,025× le prix d'entrée de base, et tant que l'écart entre deux tours n'est que de quelques secondes le cache se renouvelle — c'est ainsi que l'exécution 04 est passée de 60,57 à 15,96 dollars.

## Un accident : pourquoi les trois premiers affichent SALTLINE

C'est un piège que l'auteur a rencontré lui-même, et la leçon la plus mémorable de tout l'article.

Les expériences 01–03 ont tourné dans un dossier de sa bibliothèque créative **dont le nom contenait `saltline`**, et ce dossier contenait aussi un `AGENTS.md` de règles d'écriture sans rapport avec le jeu, chargé automatiquement. Fable 5.2 a donc pris `SALTLINE` dans le nom du dossier et l'a mis sur l'interface : c'est pourquoi la console audio, la page de matériaux et la visionneuse de modèles portent ce mot.

Pour l'expérience 04, il est passé à un dossier vide, sans aucun `CLAUDE.md` ni `AGENTS.md`, et le modèle a nommé son œuvre lui-même : **SUBLEVEL 07**.

## À vous d'essayer

Le dépôt est sous licence MIT et contient les quatre démos, les prompts d'origine, les scripts et les données de facturation de chaque exécution ; les quatre démos en code pur se jouent depuis la page du projet :

* Dépôt : `https://github.com/wquguru/fable52-fps-repro`
* Jouer en ligne : `https://wquguru.github.io/fable52-fps-repro/`
* Pour lancer : `scripts/run.sh 01-audio prompts/01-audio.md 5m 12` (le dernier argument est le plafond de budget par exécution, en dollars)

## Attribution

Compilé à partir de « Fable 5.2 de la modélisation au jeu FPS complet », republié dans la base de connaissances WaytoAGI ; l'auteur original est WquGuru (X [@wquguru](https://x.com/wquguru)) et la publication date du 2026-11-11. Le dépôt wquguru/fable52-fps-repro est sous licence MIT. L'inspiration vient de Saltline, le jeu que Felix Rieseberg (Anthropic) a réalisé avec Fable 5.2 ; ces démos ne sont pas Saltline et n'en contiennent aucun code. Les captures proviennent du tutoriel d'origine et du dépôt et restent la propriété de l'auteur ; tous les chiffres viennent de sa facturation mesurée.
