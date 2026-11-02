---
title: 100 questions sur Vibe Coding
summary: De « créer une app en parlant » au déploiement sûr, au contrôle qualité et aux choix de carrière : 100 questions pour comprendre les limites réelles, les outils et les erreurs du vibe coding.
tags: [Vibe Coding, Programmation IA, Sans code, Sécurité, Guide thématique]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
questionCount: 100
chapterCount: 7
facts:
  - key: Auteur
    value: 100mini Editorial
  - key: Questions
    value: 100
    highlight: true
  - key: Chapitres
    value: 7
  - key: Thème
    value: Vibe Coding / création avec IA
  - key: Pour qui
    value: Créateurs sans code / produit / actifs face à l'IA
  - key: Mis à jour
    value: 2026-11-01
---

## Préface

Ceci est un guide « 100 questions » : une façon de découper un grand sujet en questions, puis de le lire une question à la fois.

Le vibe coding rend possible « créer une app en parlant », mais il y a un long chemin entre une démo qui fonctionne et un produit sûr, déployable et maintenable. Le guide suit sept étapes : un état des lieux honnête, le premier jour, pourquoi le résultat continue de rater, la mise en ligne, comment éviter les désastres, comment juger la qualité et la question professionnelle.

**Réponses rapides**

- Le vibe coding transforme vite une idée en démo, mais le déploiement de production, la sécurité, les données et la maintenance exigent encore un jugement humain.
- Les débutants sans code doivent commencer par un outil hébergé dans le navigateur, pas par Node, Git ou le terminal.
- Découpez l'idée en : qui l'utilise, ce qu'il fait, où vivent les données et ce que le produit ne fera pas.
- Changez une chose à la fois, relisez après chaque changement et vérifiez manuellement tout ce qui touche à l'argent, à la vie privée ou aux données utilisateurs.
- « Ça marche » n'est pas « c'est correct ». Les critères d'acceptation, les sauvegardes et les bases de sécurité sont la vraie ligne entre une démo et un produit livrable.

> Ceci est une traduction condensée : certains passages sont encore en cours de vérification par rapport à l'OCR d'origine.

## 1. Peut-on vraiment créer une app en parlant à l'IA ?

### 1. Peut-on vraiment créer une app juste en parlant ? Commençons par l'eau froide

Oui, l'IA peut transformer une phrase en petite app qui s'ouvre et fonctionne. Le plus dur n'est pas le premier écran, mais tout ce qui sépare une démo d'un produit auquel de vrais utilisateurs confient leurs données. Les outils ont beaucoup progressé, mais les vidéos « une app en une heure » coupent le déploiement, l'authentification, les paiements, la sécurité des données et la maintenance.

### 2. Ma mère peut-elle aussi créer une app ? Jusqu'où va vraiment une personne sans code ?

Une personne sans code peut aller étonnamment loin avec des prototypes, des outils internes et des projets personnels. Les systèmes de production sont une autre histoire : ils demandent un jugement sur l'architecture, la sécurité et l'exploitation que l'IA n'apporte pas. Le vibe coding amplifie ce que vous apportez : clarté ou confusion.

### 3. « Je veux créer un e-commerce » : pourquoi l'IA ne comprend-elle pas ?

Une demande d'une ligne cache des dizaines d'hypothèses : qui se connecte, comment les produits sont listés, comment l'argent est encaissé, qui voit quelles données. Découpez l'idée en personnes et actions : qui l'utilise, ce que chacun fait, où vont les données et ce que le produit ne fera pas. Un court brief écrit vaut mieux qu'un vœu.

### 4. L'IA va-t-elle remplacer les programmeurs ? D'abord la conclusion, puis quoi faire

Sont remplacés ceux dont le métier se limite à traduire une spécification terminée en code. Les programmeurs qui conçoivent des systèmes, arbitrent, diagnostiquent les causes racines et décident quoi construire deviennent plus précieux. Apprenez à diriger l'IA, pas seulement à taper du code.

### 5. Je suis un actif bousculé par l'IA et je ne sais pas coder. Ai-je encore une chance ?

Oui, et l'opportunité est plus grande qu'elle n'y paraît. La compétence rare n'est plus de taper de la syntaxe, mais de transformer une idée floue en brief clair et étape par étape que l'IA peut exécuter, puis de juger le résultat. Commencez par un petit tracas réel et entraînez-vous à l'expliquer précisément.

### 6. Mon patron veut utiliser l'IA et ne pas embaucher de programmeurs. Les comptes sont-ils bons ?

Pour les petits outils et les systèmes internes, souvent oui. Pour les systèmes de production qui touchent à l'authentification, aux paiements et aux données utilisateurs, généralement non. L'IA réduit le code répétitif, mais ne remplace pas celui qui possède l'architecture, la revue et la réponse aux incidents.

### 7. Vibe coding, programmation assistée par IA, agentic : quelle différence ?

La ligne de partage est de savoir si vous relisez le code. La programmation assistée signifie que vous lisez, testez et comprenez ce qui a été généré. Le vibe coding signifie que vous acceptez le résultat et itérez par essais sans lire le code. Agentic signifie que vous orchestrez une équipe d'agents et jouez le superviseur.

### 8. « Créer une app en une heure », est-ce réel ? Que coupe la vidéo ?

L'heure du prototype est réelle. Ce qui est coupé, c'est tout ce qui suit : corriger la logique, ajouter connexion et stockage, choisir une base de données, déployer, sécuriser les données et gérer de vrais utilisateurs. La démo représente les soixante-dix pour cent faciles ; les trente derniers arrêtent la plupart des gens.

### 9. Un débutant absolu peut-il créer quelque chose d'utilisable ou seulement des jouets ?

Vous pouvez créer de petites choses vraiment utiles : un site personnel, un outil interne, un prototype pour valider une idée. Vous ne pouvez pas sauter l'infrastructure que vous ne comprenez pas encore dès que de vrais utilisateurs, données ou trafics arrivent. Le vibe coding est plus fort au milieu du chemin.

### 10. « Fait » et « fait correctement » ne sont pas la même chose. Qu'est-ce que cela signifie ?

Qu'une page s'ouvre ne prouve pas que la logique métier est correcte ni que les données sont sûres. Le code généré par l'IA peut paraître confiant tout en se trompant sur les noms de champs, les permissions ou l'asynchrone. Posez trois questions : fait-il ce que je voulais, traite-t-il les données sans risque, et le remarquerais-je s'il échouait ?

### 11. Les grandes entreprises lancent Miaoda, TRAE et Coze. Où est l'opportunité pour les gens ordinaires ?

Pas dans la compétition sur le modèle ou la plateforme. L'opportunité est de comprendre un public précis et de transformer un besoin réel en prototype fonctionnel plus vite. Les outils abaissent la barrière d'exécution ; le goût, la connaissance du domaine et la distribution comptent toujours.

### 12. Qui a inventé « vibe coding » et pourquoi tout le monde en a-t-il parlé en 2025 ?

Andrej Karpathy a popularisé le terme début 2025. Il s'est répandu parce que la capacité a enfin rattrapé la promesse : les modèles sont devenus assez bons pour que des personnes sans code créent de petites apps en conversant. La phrase a nommé un sentiment que beaucoup avaient déjà.

### 13. J'ai une idée de produit. L'IA peut-elle la rendre réelle ? Jusqu'où va-t-elle

L'IA peut vous mener d'une idée à une démo cliquable, et souvent jusqu'au déploiement. Elle ne prend pas les décisions de positionnement, n'arbitre pas les compromis de vie privée et n'assume pas la responsabilité d'un incident en production. Le dernier kilomètre reste le vôtre.

### 14. À qui s'adresse ce guide, et à qui non ?

Aux personnes sans code avec une idée ou une tâche répétitive, aux actifs inquiets de l'IA et aux profils produit ou business qui veulent prototyper avant d'embaucher. Pas à ceux qui espèrent voir un produit rentable apparaître sans réfléchir.

## 2. Tu ne sais pas coder : par où commencer le premier jour ?

### 15. Je ne connais rien au code. Qu'installer en premier, et puis-je éviter le terminal ?

Le premier jour, vous n'installez probablement rien. Ouvrez un outil dans le navigateur, écrivez une description et laissez-le générer l'app ; la plateforme gère l'environnement. Terminal, Node et Git relèvent d'un autre chemin. Commencez par celui qui produit un résultat aujourd'hui.

### 16. Comment choisir un outil : entièrement hébergé ou auto-hébergé ? Miaoda, WorkBuddy, Tencent Marvis, Zhipu zcode ?

Les outils entièrement hébergés (Miaoda, WorkBuddy, Zhipu zcode) gèrent l'environnement et le déploiement. Les auto-hébergés (Cursor, Claude Code, Trae) sont plus puissants mais exigent un éditeur, un terminal et la gestion de fichiers. Les débutants doivent commencer par l'hébergé et changer seulement quand le projet a vraiment besoin de plus de contrôle.

### 17. On dit qu'il faut Node et Git. Une personne sans code peut-elle les éviter ?

Oui. Les plateformes dans le navigateur gèrent ces outils en coulisses. Les tutoriels qui commencent par installer Node et Git sont écrits pour des développeurs. Cherchez des outils étiquetés « sans code » ou « création en langage naturel » ; si un tutoriel vous demande d'installer un paquet d'abord, ce n'est probablement pas votre chemin.

### 18. Je ne veux pas toucher au terminal. Existe-t-il un outil où je peux juste discuter ?

Oui. Les constructeurs hébergés et centrés sur le chat sont faits pour cela. Vous décrivez l'app, relisez l'aperçu et demandez des changements en langage naturel. Gardez le projet petit et utilisez les boutons d'aperçu et de publication de la plateforme plutôt que des commandes locales.

### 19. Comment transformer « je veux une app de budget » en quelque chose que l'IA comprend et construit ?

Écrivez un brief d'une page : qui est l'utilisateur, les trois actions principales, où vivent les données, ce que l'app ne doit pas faire et comment vous saurez qu'elle fonctionne. Demandez ensuite à l'IA un plan avant d'écrire du code. Le brief fait la différence entre une première version utile et un tas d'écrans aléatoires.

### 20. À quoi doit ressembler un PRD pour l'IA, et pourquoi « ce qu'elle ne fera pas » compte-t-il plus que « ce qu'elle fera » ?

Un bon PRD indique l'utilisateur, l'objectif, les parcours principaux, les données, les contraintes et les non-objectifs explicites. Les non-objectifs empêchent l'IA d'inventer du périmètre. Assez court pour être lu, assez précis pour être testé.

### 21. Quel niveau de détail donner à ma spécification par rapport à une demande d'une ligne ?

Assez détaillé pour qu'une autre personne puisse dire si le résultat est correct. Incluez le parcours heureux, les cas limites importants et les critères d'acceptation. Une demande d'une ligne laisse l'IA deviner ; une bonne spécification la laisse exécuter.

### 22. Faut-il décrire toute l'idée d'un coup, ou construire et réviser ?

Commencez par une petite tranche de bout en bout, puis révisez. Un brief géant invite à un premier brouillon géant et fragile. Construisez la plus petite version qui démontre la valeur centrale, vérifiez-la, puis ajoutez une fonctionnalité à la fois.

### 23. Comment donner sa première instruction à l'IA sans la faire dériver ?

Indiquez l'objectif, les contraintes, les fichiers ou écrans concernés et la façon dont vous vérifierez le résultat. Demandez un plan d'abord si la tâche touche plusieurs fichiers. Évitez les verbes vagues comme « améliore » ; dites ce que « mieux » signifie.

### 24. L'IA a généré un tas de fichiers que je ne comprends pas. Est-ce normal, faut-il s'en soucier ?

C'est normal, et vous devez vous soucier des quelques fichiers qui comptent : la page d'entrée, le modèle de données, la logique d'authentification et la configuration de déploiement. Vous n'avez pas besoin de lire chaque ligne, mais vous devez savoir où sont les parties risquées et qui peut les relire.

### 25. Ça peut tourner en local ? Qu'est-ce que « localhost » et pourquoi est-ce important ?

Localhost signifie que l'app tourne sur votre machine et que vous seul la voyez. C'est utile pour prévisualiser et déboguer, mais ce n'est pas un produit déployé. Pour que d'autres l'utilisent, il faut la publier sur une plateforme d'hébergement et configurer le domaine et les services de données.

### 26. Un mur d'erreurs rouges est apparu. Faut-il le coller à l'IA ou enquêter d'abord ?

Collez l'erreur complète, la commande qui l'a causée et ce que vous attendiez. L'IA est bonne pour reconnaître des motifs dans les traces, mais elle a besoin du contexte réel. Si la même erreur se répète, arrêtez et réduisez le problème au lieu de la laisser réessayer sans fin.

### 27. Les outils coûtent-ils de l'argent ? Jusqu'où va l'offre gratuite pour un débutant ?

La plupart ont une offre gratuite suffisante pour un premier prototype. Les limites apparaissent souvent sur les quotas de messages, les déploiements, les domaines personnalisés ou l'usage. Commencez gratuitement, apprenez le flux et payez seulement quand le projet a un vrai utilisateur ou un vrai coût d'échec.

### 28. J'ai choisi le mauvais outil ou la mauvaise direction. Puis-je changer en route, et à quel prix ?

Souvent oui, mais le coût dépend de la quantité de code et de données spécifiques à la plateforme. Gardez la logique et l'export des données portables, évitez d'enfermer les données critiques dans un format propriétaire et changez avant que le projet ne devienne critique pour la production.

### 29. Existe-t-il un « chemin minimum pour les personnes sans code » qui produise une démo ?

Oui : choisissez un outil hébergé, écrivez un brief d'une page, générez le plus petit parcours fonctionnel, testez-le avec un vrai utilisateur, corrigez les trois principaux problèmes, puis publiez. N'ajoutez pas d'authentification, de paiement ou de base de données avant que le parcours central ne les mérite.

## 3. Pourquoi mon IA construit-elle toujours la mauvaise chose ?

### 30. L'idée est trop grande pour une seule exécution. Comment la découper sans tout casser ?

Découpez par comportement visible pour l'utilisateur, pas par couche technique. Chaque tranche doit avoir une entrée, une sortie et un test d'acceptation clairs. Gardez les données et interfaces partagées stables, et vérifiez chaque tranche avant de commencer la suivante.

### 31. Comment découper « créer un e-commerce » en morceaux que l'IA peut construire et réassembler ?

Commencez par le catalogue et une page produit, puis ajoutez panier, paiement, comptes et commandes. Définissez le modèle de données et les frontières entre tranches dès le départ. Chaque tranche doit pouvoir être testée et déployée indépendamment derrière un feature flag.

### 32. Faut-il construire d'abord l'interface ou la fonctionnalité ?

Construisez d'abord le parcours le plus fin de bout en bout : un écran, une action, une donnée. Une belle interface sans logique cache les vrais risques. Une fois le parcours fonctionnel, améliorez l'interface et ajoutez les cas limites.

### 33. Ce que je voulais et ce que l'IA a construit diffèrent. Comment corriger pour qu'elle comprenne vraiment ?

Montrez la différence concrètement : une capture, une entrée qui échoue, la sortie attendue. Demandez à l'IA de reformuler l'exigence avec ses mots avant de changer le code. Si elle rate encore, réduisez la tâche à un seul comportement et testez-le.

### 34. Le même bug survit à dix corrections de l'IA et empire. Comment sortir de la boucle ?

Arrêtez la boucle. Demandez un diagnostic écrit, une reproduction minimale et la plus petite correction possible. Si la troisième tentative échoue, revenez à la dernière version qui fonctionnait et changez d'approche ou réduisez le périmètre.

### 35. Comment savoir que cette version est « terminée » sans me fier à une sensation ?

Écrivez une courte liste d'acceptation avant de construire : les actions principales, les données attendues, les états d'erreur et les bases de sécurité. Testez chaque point manuellement. Si vous ne savez pas décrire comment le vérifier, ce n'est pas prêt.

### 36. La démo fonctionne, mais elle ralentit avec plus de données. Est-ce normal, et comment corriger ?

Oui. Les démos utilisent souvent des données en mémoire ou sans index. L'usage réel exige une base de données, des index, de la pagination et du cache. Demandez à l'IA d'identifier le goulot avant d'optimiser et testez avec un volume réaliste.

### 37. Je ne sais pas lire le code écrit par l'IA. Comment le maintenir ? Serai-je piégé ?

Vous n'avez pas besoin de lire chaque ligne, mais vous devez être propriétaire de l'architecture, du modèle de données et du déploiement. Demandez à l'IA de documenter le système, gardez le code dans un dépôt et exigez une revue humaine sur les parties critiques de sécurité. Si vous ne pouvez pas expliquer le fonctionnement, vous ne pouvez pas le modifier en sécurité.

### 38. Le projet grandit et l'IA oublie des choses ou se contredit. Comment éviter la pourriture ?

Les contextes longs se dégradent. Gardez un brief et un document d'architecture, ouvrez de nouveaux fils pour des tâches séparées et répétez les contraintes importantes. Relisez les diffs et exécutez les tests existants après chaque changement.

### 39. Comment faire « mémoriser » les décisions à l'IA au lieu de repartir de zéro ?

Placez les décisions durables dans un document de projet (AGENTS.md, ARCHITECTURE.md ou un PRD) et indiquez-le au début de chaque tâche. Gardez le document court et à jour ; un document obsolète est pire que rien.

### 40. Dans une longue conversation, l'IA oublie ce qui a été dit. Comment la ramener ?

Résumez les décisions et contraintes dans un court message, puis demandez à l'IA de les confirmer avant de continuer. Pour les projets longs, ouvrez un nouveau fil avec le résumé et les fichiers concernés plutôt que d'étirer une seule conversation.

### 41. L'IA dit « oui » à une nouvelle fonctionnalité, puis le build casse. Comment l'éviter ?

Exigez un plan et une évaluation d'impact avant l'implémentation. Demandez quels fichiers et interfaces vont changer, ajoutez un test de régression pour le comportement existant et implémentez derrière un changement petit et réversible.

### 42. Comment laisser un « manuel » de ce que j'ai construit pour pouvoir le modifier plus tard ?

Écrivez un court README : ce que ça fait, comment le lancer, où vivent les données, comment déployer, quelles sont les parties risquées et qui appeler. Gardez-le à côté du code et mettez-le à jour quand l'architecture change.

### 43. Le prototype est prêt. Comment le montrer à des amis et obtenir un retour utile ?

Donnez-leur une tâche précise à accomplir, pas un « qu'en penses-tu ? » générique. Demandez-leur de raconter ce qu'ils attendent, où ils bloquent et si le résultat tient la promesse. Corrigez les trois principaux points de friction avant d'ajouter des fonctionnalités.

### 44. On dit que mon interface est moche. L'IA peut-elle l'embellir ?

Oui, si vous donnez une référence et des contraintes. Décrivez le public, le ton, la mise en page et les composants ; demandez deux ou trois variantes et comparez. Ne laissez pas une réécriture visuelle changer la logique qui fonctionne.

## 4. Ça marche en local : comment laisser les autres l'utiliser ?

### 45. La démo tourne sur mon ordinateur. Comment la rendre accessible au monde ?

Déployez-la sur une plateforme d'hébergement, connectez un domaine, configurez les variables d'environnement et une base de données, puis testez depuis un appareil qui n'est pas le vôtre. « Ça marche chez moi » est le début du déploiement, pas la fin.

### 46. Dois-je louer un serveur pour déployer, ou existe-t-il une option gratuite ?

Beaucoup de plateformes offrent une offre gratuite pour les sites statiques et les petites apps. Les offres gratuites ont des limites de bande passante, de minutes de build, de bases de données ou de domaines personnalisés. Commencez là et passez à un plan payant quand de vrais utilisateurs ou données arrivent.

### 47. Quelle différence entre « en ligne » et « utilisable en ligne » ?

« En ligne » signifie que l'URL répond. « Utilisable » signifie que l'authentification fonctionne, que les données persistent, que les erreurs sont gérées, que le site est assez rapide et que vous pouvez vous remettre d'une panne. Testez le parcours complet, pas seulement la page d'accueil.

### 48. Où doivent vivre les données ? Excel ne suffit pas : qu'est-ce qu'une base de données ?

Une base de données stocke des données structurées, gère les accès concurrents et permet des requêtes sûres. Pour une petite app, un Postgres ou SQLite hébergé suffit. Gardez des sauvegardes et ne stockez jamais les données de production uniquement dans un tableur local.

### 49. Les utilisateurs doivent s'inscrire et se connecter. Comment stocker les mots de passe sans les fuiter ?

Ne stockez jamais les mots de passe en clair. Utilisez un fournisseur d'authentification géré ou une bibliothèque éprouvée qui hache les mots de passe, gère les sessions et permet la réinitialisation. En cas de doute, ne construisez pas l'authentification vous-même.

### 50. Qu'est-ce qu'un backend, et pourquoi une interface ne suffit-elle pas ?

Le backend gère les données, l'authentification, les permissions, les paiements et les intégrations. Une app uniquement frontend peut sembler complète mais n'a pas d'endroit sûr pour stocker les données ni appliquer les règles. La plupart des risques de production vivent dans le backend.

### 51. Je veux ajouter paiements, cartes et SMS. L'IA peut-elle les connecter ?

Oui, mais ces intégrations impliquent des identifiants, de la conformité et de l'argent. Utilisez le SDK officiel du fournisseur et testez d'abord en sandbox. Gardez les secrets sur le serveur, jamais dans le navigateur, et faites relire le parcours de paiement par un humain.

### 52. Qu'est-ce qu'une API, et pourquoi ne peut-on pas construire un vrai produit sans elle ?

Une API est un contrat qui permet à votre app de parler à un autre service. Paiements, cartes, email, authentification et modèles d'IA exposent des API. Vous n'avez pas besoin de mémoriser les détails, mais vous devez comprendre les clés, quotas, erreurs et limites de débit.

### 53. Mon site n'a pas le cadenas HTTPS. Que se passe-t-il ?

Sans HTTPS, le trafic peut être intercepté et les navigateurs alertent les utilisateurs. La plupart des hébergeurs fournissent HTTPS automatiquement ; activez-le, forcez la redirection depuis HTTP et n'envoyez jamais d'identifiants ou de jetons en HTTP clair.

### 54. Le déploiement a échoué avec une « build error ». Comment un débutant s'en remet-il ?

Lisez la première erreur, pas la dernière. Vérifiez la commande de build, les variables d'environnement et les chemins de fichiers. Collez le journal complet dans l'IA et demandez la plus petite correction ; si cela persiste, redéployez le dernier commit qui fonctionnait et changez une chose à la fois.

### 55. Puis-je maintenir seul un produit déployé, et combien d'effort cela demande-t-il ?

Vous pouvez maintenir un petit produit à faible risque, mais cela demande un effort continu : supervision, sauvegardes, mises à jour de dépendances, correctifs de sécurité et support. Si le produit touche à l'argent ou à des données sensibles, prévoyez de l'aide humaine avant le lancement, pas après un incident.

### 56. Le site ralentit quand les utilisateurs augmentent. Est-ce ma faute ou celle de l'IA ?

En général aucune des deux : c'est un problème de capacité. Vérifiez les requêtes de base de données, les index, le poids des images, le cache et les limites du serveur. Mesurez avant d'optimiser et corrigez d'abord le plus gros goulot.

### 57. Comment mettre une démo locale en ligne sans fuiter de secrets ?

Utilisez des variables d'environnement pour les secrets, gardez les fichiers `.env` hors de Git, faites tourner toute clé déjà commitée et relisez le diff de déploiement. Ne collez jamais de clé privée dans un chat ni dans un bundle client.

### 58. Existe-t-il une checklist avant lancement que je peux suivre ?

Oui : HTTPS, authentification, permissions, sauvegarde des données, supervision des erreurs, politique de confidentialité, conditions d'utilisation, limites de débit, plan de retour arrière et un test avec un vrai utilisateur. S'il manque un point, le produit n'est pas prêt pour du trafic réel.

## 5. Les désastres IA s'enchaînent : mon projet va-t-il exploser aussi ?

### 59. Existe-t-il de vrais échecs de vibe coding ? Donnez quelques incidents de production

Oui. Les schémas courants sont des clés API fuitées, des contrôles d'autorisation absents, des données utilisateurs exposées et des factures cloud incontrôlées. Ils viennent rarement d'un bug spectaculaire ; ils viennent de la revue sautée, de permissions larges et de secrets placés là où le navigateur peut les atteindre.

### 60. Comment trois désastres de sécurité IA arrivent-ils en une semaine ?

Souvent par les mêmes trous : des identifiants commités dans un dépôt public, un endpoint d'administration sans autorisation et une règle de base de données qui fait confiance au client. L'IA écrit du code plausible vite, mais elle ne connaît pas votre modèle de menace si vous ne l'expliquez pas.

### 61. Pourquoi près de la moitié des programmes écrits par l'IA échouent-ils aux tests de sécurité, et 15 % exposent-ils des clés ?

Parce que la sécurité ne se voit pas dans une démo. L'IA tend à optimiser le parcours heureux, pas les entrées adverses, les frontières de permission ou la gestion des secrets. Ajoutez une revue de sécurité au flux au lieu de supposer que « ça marche » signifie « c'est sûr ».

### 62. Qu'est-ce qu'une injection de prompt, et comment un attaquant peut-il entrer dans mon système avec ?

L'injection cache des instructions dans le contenu que le modèle lit : une page, un PDF, un email. Si le modèle a aussi des outils ou des identifiants, ces instructions peuvent déclencher des actions. Traitez tout contenu externe comme non fiable, limitez les permissions des outils et exigez une confirmation pour les opérations sensibles.

### 63. Que sont RLS et l'autorisation, et pourquoi les ignorer fait-il fuiter des données utilisateurs ?

La sécurité au niveau des lignes et l'autorisation décident qui peut lire ou modifier quels enregistrements. Si la base fait confiance au client ou si l'API vérifie seulement « connecté » au lieu de « propriétaire de cet enregistrement », un utilisateur lit les données d'un autre. Testez avec deux comptes, pas un.

### 64. Mon app collecte de vraies informations personnelles. Comment protéger la vie privée des utilisateurs ?

Collectez seulement le nécessaire, chiffrez en transit et au repos, limitez l'accès et supprimez les données quand elles ne sont plus utiles. Publiez une politique de confidentialité et sachez quelles lois s'appliquent à vos utilisateurs. Si vous ne pouvez pas expliquer le flux de données, ne lancez pas.

### 65. Quelqu'un a fuité 1,5 million de clés en ligne. Comment l'éviter ?

Ne commitez jamais de secrets, ne les mettez jamais dans le code client et scannez le dépôt avant chaque push. Utilisez des variables d'environnement et un gestionnaire de secrets, faites tourner les clés régulièrement et considérez comme compromise toute clé ayant touché un endroit public.

### 66. L'IA peut-elle appeler en secret des API payantes que je ne voulais pas et brûler mon budget ?

Oui, si elle a des identifiants et aucune limite de dépense. Fixez des quotas stricts et des alertes chez chaque fournisseur, utilisez des clés sandbox pendant le développement et relisez le code pour les tâches en arrière-plan, les retentatives et les boucles qui multiplient le coût.

### 67. Comment empêcher l'IA d'écrire un mot de passe administrateur en dur et de laisser une porte dérobée ?

Interdisez les identifiants en dur dans les règles du projet, exigez des variables d'environnement et relisez chaque diff touchant l'authentification. Utilisez un fournisseur d'authentification géré, hachez les mots de passe et ne livrez jamais de compte administrateur par défaut.

### 68. Comment faire un contrôle de sécurité de base avant de lancer sans agence ?

Testez l'authentification et les permissions avec deux comptes, inspectez l'onglet réseau pour les secrets, vérifiez que HTTPS est forcé, examinez les dépendances vulnérables, sauvegardez la base et lisez l'OWASP Top Ten. Corrigez l'évident avant d'inviter des utilisateurs.

### 69. J'ai été piraté ou des données ont fuité. Que faire d'abord pour limiter les dégâts ?

Révoquez les clés, coupez le service compromis si nécessaire, conservez les journaux, changez les mots de passe et notifiez les utilisateurs et les autorités selon la loi. Ne supprimez pas les preuves. Puis trouvez la cause racine et corrigez-la avant de restaurer le service.

### 70. Qu'est-ce qu'il ne faut jamais confier au vibe coding ? Cas réels et quatre erreurs de débutant

Ne confiez pas les paiements, l'authentification, les bases de production, les systèmes de permissions ou tout ce que vous ne pouvez pas vérifier. Les quatre erreurs courantes sont tout accepter, sauter la revue, exposer des secrets et croire qu'une démo qui marche équivaut à un produit sûr.

### 71. Quels problèmes de copyright et de conformité connaître avec du code généré par IA ?

Le code généré par IA peut reproduire des motifs sous licence et sa provenance est difficile à prouver. Vérifiez les conditions de l'outil, évitez de copier du code propriétaire, conservez les licences des dépendances et faites relire par un humain tout ce qui touche à des données réglementées ou à un produit payant.

### 72. Comment juger si un outil d'IA est fiable ?

Regardez qui l'exploite, où sont stockées les données, s'il s'entraîne sur vos entrées, son historique de disponibilité et de sécurité, et s'il permet l'export et la suppression. Évitez les plateformes inconnues qui demandent des permissions de compte larges.

### 73. Lors d'un incident de sécurité, qui est responsable, et comment la loi traite-t-elle les gens ordinaires ?

La responsabilité dépend du contrat, de la juridiction et des données concernées. La personne ou l'entreprise qui exploite le service porte généralement l'obligation légale et réglementaire. « L'IA l'a écrit » n'est pas une défense. Demandez un avis professionnel pour tout ce qui touche aux paiements, à la santé ou aux données personnelles.

### 74. Donnez-moi dix bases de sécurité pour les créateurs sans code

Utilisez HTTPS, ne codez jamais les secrets en dur, appliquez l'autorisation côté serveur, validez les entrées, hachez les mots de passe, sauvegardez les données, limitez l'accès administrateur, surveillez les erreurs, gardez les dépendances à jour et ayez un plan de retour arrière. Si vous ne pouvez pas vérifier l'un de ces points, demandez de l'aide avant de lancer.

## 6. Que signifie « vraiment fiable » ?

### 75. L'app n'arrête pas de produire des bugs. Comment faire écrire moins à l'IA ? La règle 70/30

Utilisez la règle 70/30 : laissez l'IA gérer le code répétitif, les tests, la documentation et les refactorisations, tandis que les humains possèdent l'architecture, la logique complexe, la sécurité et la revue. L'erreur est de tout confier à 95 % puis de se demander pourquoi les 5 % critiques pour la sécurité manquent.

### 76. Que sont les tests, et comment une personne sans code demande-t-elle à l'IA de les écrire d'abord (TDD) ?

Un test est une vérification répétable qu'un comportement fonctionne toujours. Demandez à l'IA d'écrire un test qui échoue pour le comportement, puis implémentez jusqu'à ce qu'il passe. Le TDD donne un filet de sécurité pour les changements futurs, même si vous ne lisez pas chaque ligne.

### 77. Qu'est-ce que la « dette technique » générée par l'IA, et pourquoi s'aggrave-t-elle avec le temps ?

La dette technique est le coût supplémentaire d'un code difficile à modifier : logique dupliquée, tests absents, frontières floues. L'IA peut en ajouter vite car chaque correctif peut introduire un nouveau contournement. Remboursez-la en continu par de petites refactorisations et des tests, pas par une réécriture héroïque.

### 78. Comment m'assurer que chaque changement de l'IA ne casse pas ce qui marchait déjà ?

Relisez après chaque changement, exécutez les tests existants et changez une chose à la fois. Gardez une liste des parcours critiques et retestez-les après chaque déploiement. Une régression coûte moins cher à attraper tout de suite qu'après une semaine de nouvelles fonctionnalités.

### 79. Comment donner des règles de projet à l'IA (CLAUDE.md, ARCHITECTURE.md, boucle plan-review) en langage simple ?

Écrivez un court document de projet : stack, structure des dossiers, conventions, objectif actuel et actions interdites. Puis utilisez une boucle plan-review : demandez un plan, faites-le relire par un autre modèle ou un humain, et seulement ensuite implémentez. Le document est le contexte qui manque à l'IA.

### 80. Comment accepter le résultat comme « assez bon » pour le livrer ?

Définissez des critères d'acceptation avant de construire et testez-les manuellement. Vérifiez le parcours principal, les états d'erreur, les permissions, la persistance des données et la mise en page mobile. « Ça a l'air bien » n'est pas une acceptation ; « ces cinq contrôles passent » en est une.

### 81. Du point de vue d'un patron, comment juger un projet externalisé ou livré par l'IA ?

Demandez l'architecture, le flux de données, la couverture de tests, la revue de sécurité et le plan de retour arrière. Une démo ne prouve presque rien. Une livraison fiable explique ce qui se passe en cas d'échec et qui est responsable de la correction.

### 82. Comment une équipe doit-elle gérer la qualité du code après l'adoption de l'IA ?

Traitez la sortie de l'IA comme la pull request d'un junior : exigez revue, tests et description claire. Mesurez le taux de défauts, gardez les changements sensibles de sécurité sous approbation humaine et mettez à jour les règles partagées à mesure que le code évolue.

### 83. Comment passer de « l'IA écrit, je devine » à « je spécifie, l'IA suit » ? Cinq modèles de prompt

Utilisez cinq modèles : spécifier l'objectif et les contraintes ; donner un exemple concret ; demander un plan avant le code ; demander le plus petit diff ; et exiger une étape de vérification. Le modèle compte moins que l'habitude d'écrire un brief et de vérifier le résultat.

### 84. L'IA doit-elle écrire la documentation et les commentaires, ou moi ?

Laissez l'IA rédiger les parties répétitives, mais possédez les décisions d'architecture, le runbook et les notes de sécurité. Les commentaires doivent expliquer le pourquoi, pas le quoi. Si l'IA ne peut pas expliquer le système en langage simple, c'est que le design n'est pas clair.

### 85. Le projet est devenu un fouillis. Existe-t-il une procédure générale de nettoyage ?

Gelez les nouvelles fonctionnalités, écrivez le comportement actuel, ajoutez des tests pour les chemins critiques, supprimez le code mort et refactorisez par petites étapes. Si le désordre est trop profond, reconstruisez la plus petite version fonctionnelle et migrez les données avec soin.

### 86. Comment contrôler le coût (tokens, quota, temps) et éviter la spirale « plus de correctifs, plus de dépenses » ?

Fixez un budget par tâche, utilisez le modèle le moins cher qui fonctionne, arrêtez tôt les tâches en boucle et mesurez le coût de chaque itération. Planifiez avant d'exécuter et évitez de relancer une tâche échouée sans changement. Le contrôle des coûts est un flux de travail, pas un coupon.

### 87. Quand faire appel à un vrai programmeur au lieu d'insister ?

Faites appel à l'aide quand le produit touche à l'argent, aux données personnelles, à l'authentification ou à la disponibilité, ou quand vous ne pouvez ni comprendre ni vérifier la panne. Plus vous impliquez un professionnel tôt, moins la correction coûte cher. Attendre un incident est l'option la plus coûteuse.

### 88. Comment sauvegarder pour ne pas tout perdre du jour au lendemain ?

Poussez le code vers un dépôt distant, exportez la base régulièrement, gardez une archive d'une version qui fonctionnait et testez la restauration. Une sauvegarde que vous n'avez jamais restaurée est un espoir, pas une sauvegarde.

## 7. Les programmeurs seront-ils remplacés, et que dois-je faire ?

### 89. Le vibe coding peut-il remplacer les programmeurs ? Une autre réponse honnête

Il remplace une partie du travail, mais pas celle que vous imaginez probablement. L'IA est bonne pour traduire une spécification claire en code ; elle est faible pour décider quoi construire, concevoir un système et diagnostiquer un incident en production. Les personnes en risque sont celles qui ne font que traduire des spécifications.

### 90. Si je n'écris pas de code, quelle est ma valeur centrale ?

Votre valeur passe de la frappe de code à la clarification de problèmes ambigus, à leur description précise et au jugement du résultat. Les compétences rares sont la décomposition, la vérification et la pensée systémique. Elles s'apprennent et se cumulent.

### 91. Qu'est-ce qui vaut le plus : « décrire des systèmes » ou « écrire du code » ?

Décrire des systèmes prend de la valeur, mais seulement avec du jugement. Un ingénieur senior peut diriger l'IA parce qu'il sait à quoi ressemble un bon système. Un créateur sans code peut gagner en connaissant l'utilisateur, le domaine et les critères d'acceptation.

### 92. Comment les programmeurs doivent-ils collaborer avec l'IA pour rester employables ?

Agissez en architecte et relecteur, pas en dactylo. Passez de « écris cette fonction » à « voici le design, implémente-le dans ces limites ». Relisez la sortie de l'IA, apprenez les outils et construisez un projet complet du brief au déploiement.

### 93. Du vibe coding à l'agentic engineering : que doit savoir une personne sans code ?

Vous n'avez pas besoin d'écrire du code, mais vous devez comprendre trois choses : à quoi ressemble un bon système, comment donner des règles et des limites à l'IA, et quelles étapes exigent une approbation humaine. L'agentic engineering est une supervision, pas une abdication.

### 94. Mon petit outil grandit. Quand le confier à l'« armée régulière » ?

Confiez-le quand il sert de vrais utilisateurs, touche à l'argent ou à la vie privée, ou doit rester en ligne. Faites un audit de sécurité avant de passer à l'échelle. Le confier tôt n'est pas un échec ; c'est protéger ce que vous avez validé.

### 95. Quels projets sont adaptés au vibe coding, et lesquels ne pas toucher ?

Adaptés : prototypes personnels, outils internes, expériences à faible risque et choses qui ne touchent ni à l'argent ni à la vie privée. À éviter : paiements, authentification, permissions, données sensibles, services à haute disponibilité et tout ce que vous ne pouvez pas vérifier. En cas de doute, demandez une revue humaine.

### 96. Les enfants et étudiants doivent-ils encore apprendre à programmer, ou juste à utiliser l'IA ?

Ils doivent apprendre les deux : utiliser l'IA et comprendre la logique. Programmer n'est plus seulement de la syntaxe ; c'est diriger un système et vérifier son comportement. Une compréhension de base de l'informatique rend bien meilleur dans l'usage de l'IA.

### 97. À quoi ressemblera le vibe coding dans un an ? Est-il trop tard pour commencer ?

Il n'est pas trop tard, et la direction compte plus que le moment. Les gagnants seront ceux qui savent bien utiliser l'IA, pas les premiers arrivés. Commencez maintenant, construisez l'intuition pour diriger l'IA et gardez un portfolio de projets réels.

### 98. Sept conseils honnêtes pour les fondateurs sans code

Clarifiez le problème de qui vous résolvez ; écrivez un PRD qui dit ce que le produit ne fera pas ; publiez la plus petite démo ; utilisez votre propre produit ; faites un audit de sécurité avant de toucher à l'argent ou à la vie privée ; gardez des sauvegardes et un runbook ; faites appel à des professionnels avant de passer à l'échelle. Chaque conseil évite un type précis de reprise coûteuse.

### 99. Sept conseils honnêtes pour les actifs bousculés par l'IA

Stabilisez-vous d'abord : sont remplacés ceux qui ne font que traduire des spécifications, pas ceux qui pensent et jugent. Ne rivalisez pas avec l'IA sur la vitesse de frappe ; rivalisez sur la décomposition et la vérification. Confiez le code répétitif à l'IA, apprenez l'architecture et le métier, et construisez un projet complet que vous pouvez montrer.

### 100. Dernier mot : vous n'avez pas besoin d'écrire du code, mais vous devez penser clairement

Rendez-le concret : découpez l'idée floue en étapes que l'IA peut exécuter, définissez ce que « terminé » signifie pour chaque étape et gardez un contrôle humain partout où il y a de l'argent, de la vie privée ou des données utilisateurs. C'est toute la ligne entre comprendre le vibe coding et livrer quelque chose de fiable.

