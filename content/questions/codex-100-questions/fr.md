---
title: 100 questions sur Codex
summary: Des fondamentaux et de la première mise en route aux pièges, aux flux avancés, aux cas concrets et aux limites de l'outil : 100 questions pour comprendre Codex en profondeur.
tags: [Codex, Agent IA, Productivité, Guide thématique]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
questionCount: 100
chapterCount: 6
facts:
  - key: Auteur
    value: 100mini Editorial
  - key: Questions
    value: 100
    highlight: true
  - key: Chapitres
    value: 6
  - key: Thème
    value: Codex / Agents IA
  - key: Source
    value: The 100 Questions Series
  - key: Mis à jour
    value: 2026-11-01
---

## Préface

Ceci est un guide « 100 questions » : une façon de découper un grand sujet en questions, puis de le lire une question à la fois.

Codex est l'agent IA d'OpenAI, et il fonctionne très différemment d'un assistant conversationnel. Ce guide part de ce qu'il est, passe par l'installation, les pièges, les flux avancés et les cas concrets, puis se termine sur ses limites et ce qu'il faut en retenir.

> D'après le volume Codex de la *série 100 questions* de Lei Shu, édité, traduit et légèrement complété pour ce site. [Voir la série](https://my.feishu.cn/wiki/FC6ZwnwWWi0dWpke56act61gnUd).

> **Comment lire**
>
> Pas besoin de commencer à la question 1. Parcourez le sommaire à gauche, allez directement à ce dont vous avez besoin, puis complétez le contexte.

> Ceci est une traduction éditée : le sommaire conserve les 100 questions et le corps contient les réponses déjà éditées. Certains passages sont encore en cours de vérification par rapport à l'OCR d'origine.

**Réponses rapides**

- Codex est un agent d'exécution : il lit des fichiers, exécute des commandes, vérifie les résultats et itère. Ce n'est pas une fenêtre de chat plus rapide.
- Commencez par un dossier de projet dédié et des permissions de demande d'approbation ; n'ouvrez pas l'accès total le premier jour.
- Utilisez le mode plan pour les tâches multi-fichiers et relisez le diff avant d'accepter.
- Committez avant les changements et arrêtez tôt les tâches en boucle. Ces deux habitudes évitent l'essentiel du retravail et du gaspillage de quota.
- Définissez le critère d'acceptation avant de commencer : c'est la vraie ligne de partage entre un usage fluide et un usage pénible.

> **Mention** : ceci est une compilation éditoriale indépendante fondée sur la *série 100 questions* de Lei Shu et sur la documentation publique de Codex disponible au moment de l'édition. Ce n'est pas de la documentation officielle d'OpenAI.


## 1. Fondamentaux et positionnement

### 1. Qu'est-ce que Codex exactement ?

Codex est l'agent IA d'OpenAI pour le travail logiciel. Contrairement à un modèle de chat qui ne fait que suggérer du code, il peut lire des fichiers, les modifier, exécuter des commandes, vérifier le résultat et itérer jusqu'à ce que la tâche soit vérifiablement terminée.

### 2. Quelles formes Codex prend-il, et laquelle choisir quand on est un utilisateur ordinaire ?

Codex existe en application de bureau, interface en ligne de commande, extension d'IDE et version cloud. L'application de bureau est la plus accessible : diffs visuels, plusieurs projets et navigateur intégré. Si vous vivez dans le terminal, la CLI peut vous convenir ; si l'équipe travaille avec des dépôts GitHub, la version cloud. Commencez par l'application de bureau.

### 3. Quelle différence avec demander du code à ChatGPT ?

ChatGPT explique le problème et colle du code ; vous devez encore l'exécuter et le vérifier. Codex transforme la demande en actions — lire ces fichiers, modifier cette fonction, installer cette dépendance, lancer ces tests —, les exécute et vérifie le résultat. Cette boucle d'exécution est la vraie différence.

### 4. Application de bureau ou Codex en ligne de commande ?

L'application de bureau a une interface, des diffs visuels, des aperçus et un navigateur intégré. La CLI est plus légère et rapide, s'intègre aux scripts shell, à Git et à l'automatisation, mais suppose d'être à l'aise avec le terminal. Utilisez l'application pour le travail général et la CLI pour les flux automatisés.

### 5. Puis-je utiliser Codex sans dépôt de code ?

Oui. Codex travaille sur un dossier de projet, pas sur un dépôt Git. La version cloud est plus naturelle avec GitHub, mais l'application de bureau peut ouvrir n'importe quel dossier local et y travailler.

### 6. Ai-je besoin d'un abonnement payant ?

L'offre gratuite suffit seulement à essayer ; quelques vraies tâches l'épuisent. ChatGPT Plus est le point d'entrée habituel. Les gros utilisateurs peuvent vouloir Pro ou des crédits supplémentaires. Si le budget est serré, Codex peut aussi être connecté à des modèles tiers, avec des compromis de compatibilité et de support.

### 7. Codex peut-il toucher à d'autres fichiers de mon ordinateur ?

Seulement dans le sandbox que vous accordez. Avec la permission du dossier de projet, il lit et écrit dans ce dossier, mais pas dans le reste du disque. L'accès total est dangereux et doit être réservé aux cas où vous comprenez le risque. Le « contrôle de l'ordinateur » est la fonction qui peut franchir cette frontière.

### 8. Est-ce un outil de chat ou de programmation ?

Il a une enveloppe de chat, mais se comporte comme un outil : il modifie des fichiers, exécute du code, pilote des applications et livre un résultat vérifiable. Traitez-le comme une couche d'exécution que vous dirigez, pas comme un chatbot avec qui discuter.

### 9. Pourquoi certains adorent Codex et d'autres le détestent ?

Surtout à cause des attentes. Ceux qui le traitent comme un ChatGPT plus rapide attendent des réponses parfaites immédiates et reçoivent un travail à moitié fait. Ceux qui écrivent des tâches claires, découpent le travail, surveillent l'exécution et relisent le diff obtiennent des résultats stables. Les versions du modèle fluctuent aussi.

### 10. Codex est-il meilleur pour un projet neuf ou pour du code existant ?

Le code existant est plus facile : le projet fournit des ancrages de structure, de conventions et de dépendances. Sur un projet neuf, Codex doit deviner l'architecture et le style ; précisez donc la stack, la structure et les critères d'acceptation dès le départ.

### 11. Qu'est-ce que les gens surestiment le plus ?

L'autonomie. Codex semble autonome, mais il devine quand la demande est vague. Plus vous laissez de flou, plus il consomme de tours et plus le résultat dérive. Des tâches claires et des points de contrôle comptent plus que la puissance brute du modèle.

### 12. Quels travaux ne faut-il pas confier à Codex ?

Ceux que vous ne pouvez ni décrire ni vérifier, le jugement subjectif, et tout ce qui est risqué ou irréversible : paiements, comptes bancaires, bases de production, suppression de fichiers importants. Il est aussi inadapté quand vous ne pouvez pas juger si la sortie est correcte.

### 13. Les non-programmeurs peuvent-ils utiliser Codex ?

Oui — c'est l'un de ses grands avantages face à une CLI. Vous décrivez le résultat, Codex exécute, vous inspectez. Il faut tout de même écrire une demande claire, définir des critères d'acceptation et savoir quand l'arrêter.

### 14. Que faut-il clarifier avant d'utiliser Codex ?

Comment vous saurez que le travail est terminé. Si vous pouvez vérifier le résultat, Codex est facile : vous l'acceptez ou vous dites ce qui ne va pas. Sinon, vous accepterez à l'aveugle ou vérifierez chaque ligne. Définissez d'abord le test d'acceptation.

### 15. Codex va-t-il remplacer mon travail manuel ?

Il remplace l'exécution répétitive, pas le jugement. Décider quoi déléguer, écrire la demande, vérifier le résultat et choisir l'étape suivante restent votre rôle. Plus l'agent est capable, plus votre jugement compte.

## 2. Première mise en route et mécanique centrale

### 16. Par où commencer la première fois que j'utilise Codex ?

Installez-le, connectez-vous, dites bonjour et confirmez qu'il fonctionne. Ne commencez pas par une grosse tâche. Le premier objectif est simplement de prouver que l'installation, la connexion et l'exécution fonctionnent.

### 17. Quelle méthode de connexion choisir : compte ChatGPT ou clé API ?

La plupart des gens devraient utiliser un compte ChatGPT ; l'usage suit l'abonnement et vous ne gérez pas la facturation API. La clé API sert à l'automatisation et aux passerelles de modèles tiers : elle est facturée à l'usage, plus transparente, et plus facile à faire exploser si une tâche dérape.

### 18. Qu'est-ce qu'un projet, et pourquoi en créer un d'abord ?

Un projet Codex est un dossier de travail que vous désignez. Les lectures et écritures de Codex y sont confinées, les artefacts restent au même endroit et le travail est traçable. Discuter sans projet, c'est la recette des fichiers manquants, des sorties éparpillées et des erreurs de commande incompréhensibles.

### 19. Quel dossier de projet choisir, et quels sont les pièges ?

Créez un dossier propre dédié à Codex, puis des sous-dossiers par projet. Préférez un chemin en anglais, sans espaces. Évitez la racine du disque, le bureau, les téléchargements, les dossiers système et ceux qui contiennent des fichiers personnels importants. Ne pointez pas Codex vers un dossier qu'un autre éditeur utilise.

### 20. Comment choisir entre les trois niveaux de permission du sandbox ?

Demande d'approbation, revue automatique et accès total. Commencez par l'approbation : Codex demande avant d'exécuter une commande. La revue automatique laisse le système approuver les opérations sûres. L'accès total est réservé à ceux qui comprennent le risque ; ne commencez pas par là.

### 21. Quelle est la différence entre les niveaux de raisonnement ?

Faible, moyen et élevé. Adaptez le niveau à la tâche : faible pour le texte et le style, moyen pour les fonctionnalités et bugs ordinaires, élevé pour l'architecture, les bugs difficiles et les refactorisations complexes. Tout mettre au maximum gaspille du temps et du quota.

### 22. Qu'est-ce que le mode plan, et quand l'utiliser ?

En mode plan, Codex propose un plan — étapes, fichiers, risques — avant de toucher à quoi que ce soit. Utilisez-le pour le travail multi-fichiers, les nouvelles fonctionnalités, les refactorisations et les bugs complexes. Tapez `/plan`, ou demandez un plan puis approuvez l'exécution.

### 23. À quoi sert la barre latérale, et pourquoi est-elle importante ?

La barre latérale est la zone de travail de Codex : diffs, fichiers générés, résultats de recherche, aperçus de pages et de PDF, navigateur intégré. Le chat est l'endroit où vous donnez les instructions ; la barre latérale est l'endroit où le travail est livré. Regardez-la.

### 24. Qu'est-ce qu'un diff, et pourquoi le relire à chaque fois ?

Un diff montre ce qui a changé : vert pour les ajouts, rouge pour les suppressions. Relisez-le après chaque tâche pour confirmer que le changement correspond à la demande. Vous pouvez aussi commenter une ligne pour itérer sur ce point précis. Relire les diffs est l'habitude de sécurité minimale.

### 25. Qu'est-ce qu'un thread, et combien un projet peut-il en avoir ?

Un thread est une conversation de tâche dans un projet. Un projet peut en avoir beaucoup. Utilisez des threads séparés pour des tâches séparées afin de garder le contexte concentré, et revenez au thread existant pour continuer le même travail.

### 26. Comment savoir combien de temps une tâche va prendre ?

Il n'y a pas d'estimation fiable. Les modifications simples prennent des secondes ou des minutes ; le travail multi-fichiers peut prendre beaucoup plus longtemps. Surveillez le journal des actions. Si une tâche prend beaucoup plus que prévu, fixez une limite et regardez ce qu'elle fait.

### 27. Que faire si une tâche devient silencieuse ?

Consultez le journal des actions. Des opérations similaires répétées, la même erreur ou aucune mise à jour signifient qu'elle est bloquée ou en boucle. Arrêtez-la, demandez un résumé de l'échec, puis reformulez la tâche ou réduisez son périmètre.

### 28. Où voir les résultats quand une tâche se termine ?

Le dossier du projet est la source de vérité : chaque fichier modifié ou généré par Codex y arrive. La barre latérale montre les diffs et les aperçus, et le chat donne un résumé. Vérifiez le dossier et le diff, pas seulement le résumé.

### 29. Comment fonctionne la fenêtre glissante de cinq heures ?

L'usage est calculé sur une fenêtre glissante de cinq heures, pas réinitialisé à l'heure pile. Les tâches lourdes consomment beaucoup plus que les légères, et il existe aussi une limite hebdomadaire. Vous ne contrôlez pas exactement le moment où le quota s'épuise ; planifiez les grosses tâches.

### 30. Comment vérifier le quota restant ?

Ouvrez la zone d'usage dans les réglages de Codex. Vérifiez avant de commencer quelque chose de gros. Codex ne prévient pas de façon fiable à l'avance ; la requête suivante échoue simplement quand le quota est épuisé.

### 31. Y a-t-il une grosse différence entre les quotas Plus et Pro ?

Oui, mais la plupart des gens n'ont pas besoin de Pro. Pro est beaucoup plus grand et beaucoup plus cher. Essayez Plus une ou deux semaines et voyez si vous atteignez souvent la limite. Pour un dépassement ponctuel, des crédits supplémentaires suffisent souvent, sans changer de formule.

### 32. Une tâche s'arrête-t-elle dès que le quota est épuisé ?

En général, elle termine le tour en cours, puis la requête suivante échoue. Une tâche en arrière-plan peut continuer à consommer jusqu'à ce que vous le remarquiez. Vérifiez le quota avant les longues exécutions, découpez le travail et ne lancez pas plusieurs tâches lourdes en même temps.

### 33. Puis-je utiliser Codex sur mon téléphone ?

Le vrai Codex tourne sur votre ordinateur. L'application mobile peut lancer ou continuer des tâches cloud, répondre aux questions de Codex et vous faire approuver l'étape suivante, mais elle ne touche pas à vos fichiers locaux. Elle est utile pour superviser de longues tâches quand vous êtes absent.

### 34. La tâche continue-t-elle après la fermeture de Codex ?

Cela dépend du mode. Les tâches locales s'arrêtent quand vous quittez complètement l'application ; réduire dans la barre d'état ou de menus les maintient en vie. Les tâches cloud continuent sur les serveurs d'OpenAI. Pour arrêter le travail local, quittez depuis la barre d'état ou de menus, pas seulement en fermant la fenêtre.

### 35. Les crédits Codex valent-ils le coup ?

Ils valent le coup si vous dépassez seulement de temps en temps. Si vous achetez des crédits chaque mois, passez à Pro : c'est moins cher que les recharges répétées et cela évite l'expérience stop-and-go. Attention à l'effet « j'ai payé, donc je peux dépenser ».

## 3. Pièges et antipatterns

### 36. Pourquoi Codex se met-il soudain à tourner en rond ?

L'agent réessaie des variantes de la même approche sans réaliser qu'il se répète. Arrêtez-le tôt : demandez un résumé de l'échec, changez d'approche, réduisez la tâche ou prenez le relais. Ne le laissez pas boucler en brûlant du quota.

### 37. Pourquoi obtenir un travail à moitié fait après trente minutes ?

Les contextes longs diluent l'attention, la définition de « terminé » peut être floue et le modèle peut déclarer victoire trop tôt. Écrivez les critères d'acceptation dans la tâche, découpez les longues exécutions et inspectez le diff au lieu de faire confiance au résumé.

### 38. J'ai tout expliqué clairement — pourquoi Codex oublie-t-il des instructions ?

L'attention n'est pas répartie uniformément sur de longues listes. Mettez le critique au début et à la fin, gardez des listes courtes, répétez les contraintes importantes et utilisez une checklist. Vérifiez ensuite chaque point contre le diff.

### 39. Pourquoi Codex casse-t-il du bon code en faisant une petite modification ?

Il peut refactoriser, renommer ou supprimer ce qu'il juge inutile. Interdisez-lui de supprimer des fichiers qu'il n'a pas créés, demandez la plus petite modification possible et relisez chaque diff. Annulez tout ce qui n'a pas de rapport avec la tâche.

### 40. Pourquoi une demande simple devient-elle une énorme modification ?

Codex applique par défaut des patterns de production : composants, abstractions, nouvelles dépendances. Dites « la solution la plus simple, sans nouvelles dépendances, sans nouveaux modules, rien en dehors de cette demande » et demandez pourquoi chaque changement est nécessaire.

### 41. Les tâches en arrière-plan consomment-elles mon quota en cachette ?

Oui, si elles tournent encore. Une application réduite ou une tâche cloud continue à consommer. Arrêtez la tâche ou quittez complètement l'application quand vous ne l'utilisez pas, et ne laissez pas plusieurs tâches lourdes en parallèle.

### 42. J'ai fermé la fenêtre — pourquoi le quota continue-t-il de baisser ?

Fermer la fenêtre ne signifie pas quitter. Codex se réduit dans la barre d'état ou de menus et continue de tourner. Quittez explicitement depuis cette barre, surtout si une longue tâche est encore active.

### 43. Pourquoi une tâche a-t-elle disparu sans résultat ?

Vérifiez si elle a échoué, été arrêtée ou si elle tourne encore en arrière-plan. Regardez le journal des actions et le dossier du projet. Ne supposez pas que l'absence de résultat signifie un succès.

### 44. Pourquoi la même tâche produit-elle un résultat complètement différent ?

La génération est stochastique, et le contexte ou la version du modèle peuvent différer. Sauvegardez le résultat et commitez-le ; n'attendez pas une rejeu exact. Si vous avez besoin de reproductibilité, conservez le résultat et la demande qui l'a produit.

### 45. Pourquoi la solution de Codex ne correspond-elle pas à mon projet ?

Il manque de contexte. Utilisez le mode projet, laissez-le lire le dépôt, indiquez-lui les fichiers et conventions pertinents et exécutez le résultat dans votre environnement. Un code qui semble correct hors de votre projet peut ne pas y fonctionner.

### 46. Codex dit avoir tout corrigé — pourquoi ça échoue encore ?

Il n'a peut-être rien exécuté. Faites-le tourner dans votre projet, collez les vraies erreurs dans le thread et vérifiez vous-même. N'acceptez jamais « ça devrait marcher » comme terminé.

### 47. Quels signaux indiquent que je dois arrêter une tâche ?

Des boucles, un nombre de fichiers modifiés qui explose, des suppressions massives, des dépendances ou changements de configuration inexpliqués, une absence de progrès ou un résumé qui ne correspond pas au diff. Arrêtez et demandez une explication.

### 48. Faut-il relancer une tâche échouée ou changer la demande ?

Relancez les échecs transitoires comme les erreurs réseau. Si la même tâche échoue encore et encore, changez-la : découpez-la, clarifiez-la ou vérifiez si elle dépasse ce que l'agent sait faire. Les relances aveugles gaspillent surtout du quota.

### 49. Pourquoi découper une grosse tâche empire-t-il parfois les choses ?

De mauvaises frontières créent un couplage caché, et des exécutions séparées perdent le contexte partagé. Découpez par couplage, donnez à chaque sous-tâche la vue d'ensemble, planifiez le découpage avec Codex et vérifiez chaque morceau.

### 50. Comment éviter qu'une tâche mange le quota de toute la semaine ?

Estimez le coût, fixez une limite de temps, surveillez le journal, découpez le gros travail, utilisez un raisonnement faible pour les petites tâches, planifiez avant d'exécuter, surveillez le quota et quittez les tâches en arrière-plan. Ne confiez pas une tâche puis partez.

### 51. Qui échoue le plus avec Codex ?

Ceux qui le traitent comme une boîte noire, ne versionnent pas, ne relisent jamais les diffs, écrivent des demandes vagues et le laissent tourner sans surveillance. Commitez avant les changements, relisez le résultat et utilisez le mode worktree pour les modifications plus importantes.

## 4. Avancé : Skills, MCP, plugins, automatisation et contrôle de l'ordinateur

### 52. Quelle est la différence entre un Skill, MCP et un plugin ?

Un Skill est un flux de travail réutilisable écrit dans un fichier Markdown. Un plugin ajoute une capacité ou un connecteur à Codex. MCP relie Codex à des outils et des données externes. Apprenez d'abord les fonctions intégrées et les plugins, puis les Skills pour les flux répétables, puis MCP quand vous avez besoin de données externes.

### 53. Comment trouver et installer un plugin utile ?

Ouvrez la page des plugins et installez seulement ce dont vous avez besoin. Partez de la tâche, pas du catalogue. Une fois installé, appelez un plugin avec `@` et choisissez-le dans la liste.

### 54. Comment créer mon propre Skill ?

Exécutez le flux une fois jusqu'à obtenir un résultat satisfaisant, puis demandez à Codex d'en faire un Skill. Vous pouvez aussi utiliser skill-creator et décrire les étapes en langage naturel. Un Skill est un fichier Markdown : quand l'utiliser, l'objectif, les étapes et la sortie.

### 55. Comment écrire un Skill pour qu'il se déclenche automatiquement ?

La description décide si Codex associe la tâche au Skill. Mettez d'abord le cas d'usage courant et les mots de déclenchement, soyez précis sur les entrées et sorties, et évitez les étiquettes vagues comme « analyse de données ». L'invocation explicite `$skill-name` reste le repli.

### 56. Quand ai-je vraiment besoin de MCP ?

Quand Codex a besoin de données ou d'outils externes : GitHub, Notion, Feishu, une base de données, une API SaaS. Pour les fichiers locaux, les pages simples, les présentations ou les PDF, les fonctions intégrées et les plugins suffisent. MCP est un adaptateur, pas un badge de sophistication.

### 57. Faut-il écrire un AGENTS.md ?

Oui. Il indique à Codex qui vous êtes, ce qu'est le projet, quelles conventions suivre et ce qu'il ne doit pas faire. Laissez Codex le rédiger, puis affinez-le. Gardez-le court, à jour et versionné dans Git.

### 58. Comment fonctionnent l'intervention et la file de tâches ?

Les nouvelles instructions se placent normalement derrière la tâche en cours. Utilisez l'intervention quand vous voulez que Codex change immédiatement de direction, et la file quand la nouvelle instruction peut attendre. Sachez laquelle vous utilisez avant d'envoyer.

### 59. À quoi sert l'automatisation ?

Pour les résumés récurrents, les vérifications périodiques et la poursuite d'un thread de longue durée. Les automatisations n'héritent pas du modèle ni du raisonnement du chat actif ; configurez-les explicitement, sinon une tâche de sept minutes peut en prendre quarante.

### 60. Qu'est-ce que le contrôle de l'ordinateur, et est-ce sûr ?

Il permet à Codex de voir l'écran et de piloter des applications graphiques, même sans API. C'est puissant et risqué. Exigez votre confirmation pour toute action qui envoie, publie, supprime ou paie, et gardez le périmètre aussi étroit que possible.

### 61. Lequel des trois modes de navigateur choisir ?

Utilisez le navigateur intégré pour localhost, les vérifications de mise en page et les aperçus isolés. Utilisez l'extension Chrome quand la tâche a besoin de votre session connectée. Utilisez Playwright quand vous avez besoin d'un contrôle programmatique et répétable. Confirmez avant toute action risquée.

### 62. Quand utiliser le mode worktree ?

Utilisez un worktree pour les modifications plus importantes, les expériences et le travail en parallèle. Il isole la tâche de votre checkout principal et facilite l'abandon ou la fusion du résultat.

### 63. Comment choisir entre plusieurs aperçus ou solutions ?

Comparez-les avec les mêmes critères d'acceptation et choisissez la plus petite modification au risque le plus faible. N'acceptez pas un diff plus gros simplement parce qu'il paraît plus impressionnant.

### 64. Quelle est la différence entre le mode objectif et une tâche normale ?

En mode objectif, vous donnez à Codex un critère de réussite vérifiable et il itère jusqu'à l'atteindre. Cela convient aux migrations, aux corrections de bugs, aux performances et aux refactorisations. Cela ne convient pas aux demandes vagues, au travail subjectif ou aux tâches sans ligne d'arrivée claire.

### 65. Comment fonctionnent les threads durables et l'épinglage ?

Un thread durable conserve le contexte entre les sessions, ce qui évite de réexpliquer le projet. Utilisez-le pour le travail continu et épinglez les threads auxquels vous revenez le plus souvent.

### 66. Quelle est la façon la plus fiable de mettre en place une mémoire partagée ?

Gardez-la petite, structurée et à jour. Stockez les faits du projet, les conventions, les décisions et les pièges connus. Relisez-la régulièrement et ne laissez pas des notes obsolètes devenir des instructions permanentes.

### 67. Pourquoi la saisie vocale vaut-elle le coup ?

Parler est souvent plus rapide que d'écrire une longue demande, surtout pour réfléchir à voix haute et décrire une intention. Vérifiez la transcription avant l'envoi et gardez les contraintes importantes par écrit.

### 68. Que doit contenir un AGENTS.md avancé ?

Les commandes, l'architecture, les conventions, les actions interdites, les critères d'acceptation, les pièges connus et les fichiers à lire en premier. Gardez-le concis ; un long document que personne ne maintient est pire qu'un document court et exact.

### 69. Comment faire expliquer son approche à Codex avant qu'il modifie ?

Demandez un plan ou une proposition avec diff d'abord, utilisez le mode plan et exigez une courte note de conception pour les changements risqués. Approuvez l'approche avant de le laisser toucher aux fichiers.

### 70. Comment faire retenir les conventions de mon projet à Codex ?

Mettez-les dans AGENTS.md, indiquez des fichiers d'exemple et demandez à Codex de suivre les patterns existants plutôt que d'en inventer. Mettez le document à jour dès qu'une convention change.

### 71. Quelles petites habitudes améliorent le plus la stabilité ?

Planifier d'abord, relire chaque diff, committer avant les changements, une tâche par thread, écrire des critères d'acceptation, s'arrêter tôt quand quelque chose dérive et garder AGENTS.md à jour. Rien d'exotique ; tout se cumule.

## 5. Cas concrets

### 72. Quelle devrait être ma première tâche d'entraînement ?

Choisissez quelque chose de petit, non critique et vérifiable : une page simple, un script, une petite analyse. Le but est de pratiquer la boucle de collaboration, pas de tester les limites du modèle.

### 73. Comment demander une page web à Codex ?

Donnez le contexte, l'objectif, les contraintes et les critères d'acceptation. Générez d'abord une maquette visuelle, puis implémentez. Utilisez le navigateur intégré pour vérifier le résultat et testez la mise en page mobile.

### 74. Comment utiliser Codex pour des présentations ?

Installez le plugin Presentations, fournissez le matériel source et précisez le public, le style, les sections et le nombre de pages. Considérez la première sortie comme un brouillon à 80 %. Si vous faites souvent des slides, transformez votre style en Skill.

### 75. Codex est-il fiable pour la vidéo ?

Oui, avec les bons plugins, comme HyperFrames ou Remotion. La vidéo est un processus — script, assets, voix, sous-titres, montage —, pas un simple prompt. Construisez le flux une fois et enregistrez-le comme Skill.

### 76. Comment utiliser Codex avec des PDF et des documents ?

C'est un très bon cas d'usage : entrée claire, sortie vérifiable. Fournissez les fichiers, précisez la structure et le format de sortie, et vérifiez le résultat. Utilisez des outils documentaires ou MCP quand la source est dans un service externe.

### 77. Comment utiliser Codex pour l'analyse de données et le rapprochement ?

Indiquez où sont les données, quels champs doivent correspondre, ce qui compte comme anomalie et ce qu'il faut faire lorsqu'une anomalie est trouvée. Utilisez MCP ou une CLI pour les sources externes, puis transformez les règles en Skill planifié.

### 78. Codex peut-il m'aider à nettoyer mon ordinateur ?

Il est bon pour trouver des candidats et mauvais pour décider ce qu'on peut supprimer. Utilisez des permissions de projet, faites-lui lister les fichiers d'abord, sauvegardez ce qui est important et confirmez vous-même chaque suppression.

### 79. Comment utiliser Codex pour écrire et créer du contenu ?

Il est fort en recherche, plans, brouillons, couvertures et réutilisation. Donnez-lui un guide de style, un public et du matériel source. Attendez un brouillon à retravailler, pas une pièce finale. Automatisez la veille thématique si vous écrivez régulièrement.

### 80. Comment utiliser Codex sur un projet parallèle ?

Utilisez-le pour l'échafaudage, le travail répétitif, les petites fonctionnalités et les tests. Gardez l'architecture, les décisions produit et la relecture finale pour vous. Committez souvent et ne lui confiez pas tout le produit d'un coup.

### 81. Quelle est la façon la plus efficace de confier un bug à Codex ?

Donnez les étapes de reproduction, le comportement attendu, le comportement réel, les logs et les fichiers concernés. Demandez la plus petite correction, puis vérifiez. S'il ne peut pas reproduire le bug, corrigez d'abord les informations de reproduction.

### 82. Comment découper une nouvelle fonctionnalité pour Codex ?

Découpez par comportement visible pour l'utilisateur, définissez les interfaces et les tests d'acceptation, planifiez d'abord et relisez chaque tranche. Évitez une tâche géante qui change le modèle de données, l'interface et les tests en même temps.

### 83. Est-il sûr de laisser Codex refactoriser un ancien projet ?

Cela peut marcher, mais c'est risqué. Exigez des tests, faites une refactorisation par tâche, relisez le diff et committez avant chaque étape. Ne le laissez jamais refactoriser et ajouter des fonctionnalités dans la même exécution.

### 84. Comment confier l'écriture de tests à Codex ?

Décrivez le comportement et les cas limites, demandez d'abord les tests et exécutez-les. Ne le laissez pas réécrire les tests juste pour qu'ils passent ; les tests sont la spécification.

### 85. Codex est-il bon en revue de code ?

Il est utile pour une première passe cohérente. Demandez une liste de problèmes priorisée, puis décidez vous-même quoi corriger. Ne le laissez jamais fusionner automatiquement ; la décision reste la vôtre.

### 86. Une équipe peut-elle utiliser Codex ensemble ?

Oui, mais chaque personne utilise son compte et sa copie de travail. Partagez AGENTS.md et les Skills via Git, et faites attention aux données sensibles. Ne traitez pas un dossier comme un espace partagé multi-utilisateur.

### 87. Comment mettre en place un projet long semi-automatisé ?

Utilisez une liste de tâches, un superviseur et des commits fréquents. Définissez des points de contrôle, budgétez le quota et gardez un humain dans la boucle. « Un prompt puis dormir » n'est pas un flux de travail ; c'est un pari.

## 6. Limites, alternatives et réflexion

### 88. Quand dois-je arrêter d'utiliser Codex ?

Quand la tâche est une question simple, un jugement subjectif, une idée vague, une action risquée et irréversible, ou quelque chose que vous ne pouvez pas vérifier. Un outil n'est utile que dans ses limites.

### 89. Existe-t-il des alternatives à Plus ?

Oui. Vous pouvez connecter Codex à des modèles tiers via une passerelle, moins chère mais non officielle, ou utiliser d'autres agents. Choisissez selon le budget, la compatibilité et le risque accepté.

### 90. Codex ou Claude Code ?

Ils occupent un espace similaire. Claude Code est terminal-first et fort sur les bases de code complexes ; Codex est plus accessible, a une interface graphique et gère les tâches non liées au code. Beaucoup de gros utilisateurs ont les deux et changent selon la tâche.

### 91. J'utilise déjà Cursor — ai-je encore besoin de Codex ?

Ils sont complémentaires. Utilisez Cursor pour l'aide dans l'éditeur et Codex pour les tâches déléguées et la livraison. Si votre travail comprend des tâches non liées au code, Codex ajoute une portée que Cursor ne couvre pas.

### 92. Les quotas Codex vont-ils continuer à augmenter ?

La tendance est plus souple, mais le travail des agents coûte cher et ne peut pas être illimité. La concurrence et une inférence moins chère aident. Ne construisez pas d'habitudes qui dépendent d'un quota illimité ; utilisez-le avec intention.

### 93. Pourquoi Codex ressemble-t-il de plus en plus à un système d'exploitation ?

Il gère des fichiers, installe des plugins, planifie des tâches, mémorise des préférences et contrôle d'autres applications. OpenAI considère une grande partie du travail informatique comme proche du code, donc étendre l'agent est naturel. Le compromis est confort contre dépendance.

### 94. Codex sera-t-il bientôt remplacé ?

La forme persistera à court terme car elle répond à un vrai besoin. À long terme, des modèles plus forts et moins chers pourraient intégrer des agents au système d'exploitation et au navigateur. Gardez vos compétences indépendantes de l'outil.

### 95. Les gens ordinaires ont-ils vraiment besoin d'un agent IA ?

Si vous avez un problème concret et pouvez vérifier le résultat, oui. Si vous ne pouvez pas juger la sortie, la valeur est limitée. La nouvelle compétence consiste à décrire le problème, vérifier le résultat et itérer.

### 96. Quel est le risque de confier tout un projet à l'IA ?

Élevé. Elle manque de compréhension globale, peut refactoriser du code sans rapport et vous ne pouvez pas tout vérifier d'un coup. Changez par petites tranches, relisez chacune et gardez le contrôle de version.

### 97. Une utilisation intensive de Codex va-t-elle me faire régresser ?

Seulement si vous externalisez toute la réflexion. La collaboration — fixer la direction, vérifier, apprendre — améliore le jugement. Définissez « savoir coder » par la capacité à livrer et résoudre des problèmes, pas par le fait de taper chaque ligne.

### 98. Comment les utilisateurs gratuits en profitent-ils le plus ?

Réservez Codex aux tâches qui exigent une exécution. Utilisez des modèles bon marché ou tiers pour le reste, adaptez le niveau de raisonnement, planifiez d'abord, arrêtez tôt et sauvegardez chaque bon résultat.

### 99. Quand revenir à l'écriture manuelle de code ?

Quand vous avez besoin d'une compréhension profonde, d'une précision extrême, de sécurité ou de logique métier centrale, ou quand vous apprenez. Dans ces cas, Codex est un partenaire d'entraînement, pas un substitut.

### 100. Que faut-il revoir après avoir utilisé Codex un moment ?

Pouvez-vous expliquer ce que Codex a fait et pourquoi ? Sinon, vous externalisez au lieu de collaborer. Créez vos propres modèles de demande, mettez à jour AGENTS.md et les Skills, notez les échecs récurrents et révisez votre usage du quota. Le gain à long terme est la capacité à collaborer avec l'IA.

