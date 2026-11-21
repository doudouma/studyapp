---
slug: codex-c4d-vs-blender
name: Codex : C4D vs Blender
summary: Le même prompt et la même photo de référence envoyés par Codex à Blender et Cinema 4D : 21:09 contre 22:44 pour modéliser, et un moteur de rendu qui n'a jamais terminé.
category: experiment
tags: [Blender, Cinema 4D, Codex, MCP, Modélisation 3D, Hard Surface]
publishedAt: 2026-11-21
updatedAt: 2026-11-21
author: 老鹰 (老鹰aic4d)
externalUrl: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
facts:
  - key: model
    value: GPT-6.2 Astra · Codex · raisonnement en Ultra
  - key: setup
    value: MCP vers Blender 5.2.3 et Cinema 4D 2027.0.0
  - key: input
    value: Le même prompt · la même référence 600×600
  - key: build time
    value: Blender 21 min 09 s · C4D 22 min 44 s
    highlight: true
  - key: render
    value: Cycles sur Blender, gratuit · animation de 15 s ≈ 40 minutes
  - key: c4d render
    value: Aucun rendu abouti — aucun moteur adapté n'était configuré pour le test
  - key: verdict
    value: Modélisation à égalité · Blender gagne à la finition
  - key: sample
    value: Un produit, une exécution, une machine
sources:
  - title: Codex控制C4D和Blender到底哪个好？渲染品质如何？
    url: https://mp.weixin.qq.com/s/WN9I3PKOepLKkLhbSVEqmw
    publisher: 老鹰aic4d
  - title: Blender — suite de création 3D libre
    url: https://www.blender.org/
    publisher: Blender Foundation
  - title: Maxon Cinema 4D
    url: https://www.maxon.net/en/cinema-4d
    publisher: Maxon
cover:
  src: /showcase/codex-c4d-blender-cover.png
---

## J'ai fait le même travail deux fois, une par logiciel

Tout a commencé par un enregistrement de tutoriel. Je voulais montrer ce que le nouveau modèle de Codex fait dans une fenêtre 3D, et la façon honnête de le montrer était de donner le même brief à deux applications et de m'asseoir pour regarder.

Le même prompt. La même photo de référence, 600 × 600, une Hublot Big Bang à mouvement squelette. Codex connecté par MCP à Blender 5.2.3 et à Cinema 4D 2027.0.0. GPT-6.2 Astra des deux côtés, raisonnement en Ultra — l'option chère, parce que la mécanique est précisément là où un modèle perd patience.

Ce détail compte plus qu'il n'y paraît. L'agent ne générait pas une image. Il écrivait du Python, appelait `bpy` et l'API de C4D, vérifiait la fenêtre et ajoutait les pièces une par une pendant que je regardais. Je voyais la lunette apparaître, puis les vis, puis les ponts.

![La référence : une photo produit de 600×600, envoyée aux deux applications sans modification](/showcase/codex-c4d-blender-reference.jpg)

*La seule entrée en plus du prompt. Les deux applications ont vu exactement ce fichier.*

## 21:09 contre 22:44

| | Blender 5.2.3 | Cinema 4D 2027.0.0 |
| --- | --- | --- |
| Temps de modélisation | 21 min 09 s | 22 min 44 s |
| Boîtier, aiguilles et mouvement | Oui | Oui |
| Vérification dans la fenêtre | 08:16 | 08:07 |
| Moteur de rendu | Cycles, gratuit | Aucun adapté |
| Image finale | Oui | Rendu de test abandonné |

Une minute et demie d'écart, ce qui ne veut rien dire à cette échelle. L'écart n'est pas l'histoire. Les deux applications ont livré une montre reconnaissable avec un mouvement fonctionnel, et au premier coup d'œil on aurait du mal à dire laquelle vient de laquelle.

![À gauche : la fenêtre de Blender 5.2.3. À droite : Cinema 4D 2027.0.0, caméra libérée et zoomée](/showcase/codex-c4d-blender-viewport.jpg)

*Les deux fenêtres après la remise de la scène. Le côté C4D est zoomé sur le mouvement, celui de Blender cadre encore la montre entière.*

## Ce que chacun a réussi

Cinema 4D m'a surpris à l'intérieur. Une fois la caméra libérée et le zoom poussé, les rouages, les aiguilles squelettes et le tourbillon à six heures étaient là, séparés et lisibles. Rien n'était une texture qui imitait la géométrie.

Blender était plus fort à l'extérieur. Les marquages de la lunette étaient plus nets, les vis reposaient correctement dans leurs fraisures, et le caoutchouc à motif hexagonal comme les pièces rouges tenaient leurs bords de près.

Si l'on compare seulement les modèles, cette manche est presque nulle — et c'est la partie que les gens citeront. La différence intéressante est venue une étape plus tard.

## Le moteur de rendu a tranché

Cinema 4D n'avait aucun moteur adapté configuré pour ce test. J'ai lancé un rendu de test, attendu, puis fermé. C'est un manque de préparation de ma part, pas un verdict sur les moteurs de C4D — Redshift et Octane sont là —, mais c'est ce qui s'est passé ce soir-là, et c'est pourquoi il n'y a pas d'image finale C4D dans cet article.

Blender avait Cycles, gratuit et déjà installé. Les bords métalliques, les surfaces brossées et les minuscules structures du mouvement ne sont devenus lisibles qu'après cette passe. Le modèle n'a jamais été le goulot. La finition l'était.

![Deux images Cycles : le mouvement de face, et un macro du tourbillon](/showcase/codex-c4d-blender-cycles.jpg)

*La même scène rendue deux fois dans Cycles. Le macro est l'endroit où le modèle tient ou s'effondre, et il a tenu.*

## L'animation est l'endroit où l'IA se voit encore

J'ai demandé un clip de 15 secondes : rouages qui tournent, quelques positions de caméra, montés ensemble. Cycles a mis près de 40 minutes pour ces 15 secondes.

La rotation des rouages fonctionnait. Les échecs étaient de mise en scène. En passant de la couronne au gros plan du mouvement, l'ease-in et l'ease-out de la caméra étaient faux : trop brusque à l'entrée, trop mou à la sortie — le genre de chose qu'un animateur corrige en dix secondes et qu'un modèle ne perçoit pas.

Ce plan unique résume la répartition actuelle : le modèle construit l'objet et l'éclaire, et il ne ressent toujours pas un cut.

## Le même Blender, un modèle d'écart

Ce matin-là, j'avais fait une version de cette montre avec Sol, également dans Blender. Seule, elle me plaisait ; le reflet métallique de la lunette était beau. Côte à côte, l'écart n'est pas subtil.

![À gauche : la version du matin faite avec Sol. À droite : GPT-6.2 Astra en Ultra, même application, même brief](/showcase/codex-c4d-blender-models.jpg)

*La même application, la même référence. La différence, c'est le modèle et le budget de raisonnement, pas le logiciel.*

La nouvelle exécution a plus de pièces séparées, des transitions de matière plus propres et des vis qui ressemblent à des vis plutôt qu'à des bosses. Ce qui a changé entre les modèles, je ne saurais le dire, mais cela se manifeste comme de la patience.

## Verdict

> **Recommandation principale :** si le travail est un produit à surface dure comme celui-ci, mettez Codex sur Blender et gardez Cinema 4D pour les plans où un pipeline Redshift ou Octane tourne déjà.

La question de la modélisation est assez tranchée pour arrêter d'en débattre : sur des produits mécaniques, Codex est utilisable, pas une démo. L'éclairage et le rendu ont atteint ce que j'appellerais un niveau humain intermédiaire à confirmé — en copie. Donnez-lui une référence et il la calquera superbement. Demandez-lui une direction artistique sans référence et je n'attendrais pas le même résultat.

La question du moteur de rendu est celle qui a décidé ma soirée. Blender a terminé parce que Cycles était déjà là. C4D aurait probablement terminé aussi, avec un moteur configuré et une demi-heure de préparation en plus. Ce n'est pas un défaut du logiciel : c'est ce que vaut « gratuit et déjà installé » à onze heures du soir.

## Ce que ce test ne prouve pas

- **Un produit, une exécution.** Une montre est le cas le plus favorable : surface dure, pièces répétées, un objet héros, une référence qui montre chaque détail. La modélisation organique, le tissu, les personnages et les environnements sont d'autres combats.
- **Pas de topologie mesurée.** J'ai jugé à l'œil et au rendu, pas en inspectant le maillage. Un modèle peut sembler juste et être un cauchemar à éditer.
- **C4D n'a pas eu un rendu équitable.** Sans Redshift ni Octane configurés, la comparaison s'arrête à la fenêtre, et je ne vais pas prétendre le contraire.
- **Les temps sont ceux de cette machine et de ce réseau.** 21 minutes, c'est cette machine, ce MCP, ce modèle en Ultra. Votre file d'attente, votre GPU et la charge du fournisseur déplacent ce chiffre.
- **Le modèle changera sous vos pieds.** Deux exécutions à une semaine d'écart semblaient déjà différentes. Tout benchmark est une photo d'une cible mobile.
- **Le coût n'est pas nul.** Blender est gratuit ; Cinema 4D est un abonnement ; le raisonnement Ultra sur une longue session d'agent ne l'est pas non plus.

## Ce que cela a coûté

| Poste | Réalité |
| --- | --- |
| Blender | 0 $, Cycles inclus |
| Cinema 4D | Abonnement, et le moteur se paie en pratique à part |
| Agent | Session Codex en Ultra, très gourmande en tokens pour plus de 20 minutes d'appels |
| Temps machine | Environ 40 minutes de Cycles pour 15 secondes d'animation |

La facture qui décide de cette comparaison n'est pas la licence. C'est l'heure passée à brancher MCP dans une deuxième application juste pour découvrir que le moteur n'était jamais installé.
