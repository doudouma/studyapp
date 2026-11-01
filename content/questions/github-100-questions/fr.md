---
title: 100 questions sur GitHub
summary: De l'intérêt d'apprendre et des premiers pas sans code aux erreurs courantes, à la recherche et l'exécution de projets, au portfolio et à la contribution open source — 100 questions pour qu'une personne normale utilise GitHub.
tags: [GitHub, Git, Open Source, Portfolio, Guide thématique]
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
    value: GitHub / Git / collaboration open source
  - key: Pour qui
    value: Personnes sans code / étudiants / candidats / créateurs
  - key: Mis à jour
    value: 2026-11-01
---

## Préface

Ceci est un guide « 100 questions » : une façon de découper un grand sujet en questions, puis de le lire une question à la fois.

GitHub n'est pas qu'un dépôt de code pour programmeurs. Il peut stocker du travail, héberger un portfolio, servir un site statique, soutenir la collaboration open source, gérer l'écriture et même lancer des tâches planifiées avec Actions. Le guide suit six étapes : décider s'il faut l'apprendre, démarrer sans ligne de commande, éviter les erreurs douloureuses, trouver et exécuter des projets, stocker et montrer son travail, et décider jusqu'où aller.

**Réponses rapides**

- Cela vaut la peine, mais traitez-le comme un espace durable pour stocker, montrer et collaborer, pas comme une pile de commandes Git.
- Le premier jour, utilisez le web ou GitHub Desktop et faites un vrai commit avant de toucher au terminal.
- Lisez le README avant d'exécuter un projet ; s'il est trop technique, demandez à l'IA de l'expliquer.
- Ne commitez jamais de clés, mots de passe ou pièces d'identité. Si c'est fait, révoquez et renouvelez d'abord.
- Décidez si vous avez besoin de stockage, de portfolio, de collaboration ou d'automatisation. Chaque objectif demande une profondeur différente.

> Compilé à partir de la documentation GitHub et de sources publiques, structuré et légèrement complété pour ce site.

> Ceci est une édition éditée : certains passages source étaient tronqués par l'OCR, le corps privilégie donc une liste de questions actionnable avec des réponses concises.

## 1. Faut-il l'apprendre ? Est-il trop tard ?

### 1. L'IA est très forte. Apprendre GitHub a-t-il encore du sens si je ne code pas ?

Oui. L'IA génère du code, mais GitHub est l'endroit où le travail est stocké, relu, versionné, partagé et montré. C'est la couche de collaboration et de preuve.

### 2. On dit que GitHub est réservé aux programmeurs. Qu'apporte-t-il à une personne normale ?

Stocker des fichiers en sécurité, publier un portfolio, héberger un site statique, suivre des projets, apprendre de l'open source et collaborer sur l'écriture ou la recherche.

### 3. On dit que GitHub est un second CV. Quelqu'un a-t-il vraiment eu une offre grâce à son profil ?

Oui, mais le profil compte parce qu'il montre des preuves : projets, contributions, régularité et communication. Un profil seul ne garantit pas une offre ; il rend vos affirmations vérifiables.

### 4. Je commence tard. Suis-je trop loin pour rattraper ?

Non. La plupart ne commencent jamais. Un petit historique public régulier vaut mieux qu'un profil parfait qui n'existe pas.

### 5. Mon entreprise ne l'exige pas et mon école ne l'a pas enseigné. Pourquoi y consacrer du temps ?

Parce que c'est un lieu durable pour votre travail et un langage commun de collaboration. Cela vous force aussi à organiser, documenter et publier.

### 6. Les profils des autres semblent impressionnants. Vais-je paraître ridicule en débutant ?

Seulement si vous prétendez être expert. Un README clair, un petit projet qui marche et des notes honnêtes valent mieux qu'un profil vide ou du travail copié.

### 7. On dit que GitHub est addictif. Qui finit par collectionner sans jamais utiliser ?

Ceux qui font des étoiles et des favoris un objectif. Utilisez GitHub pour exécuter, forker ou contribuer, pas seulement pour collectionner des liens.

### 8. Si je n'utilise que des outils IA, quelle capacité clé me manquera ?

Versionner, relire, collaborer et publier. L'IA écrit du code, mais sans dépôt vous perdez l'historique, la reproductibilité, la revue et le contexte partagé.

### 9. Apprendre GitHub, est-ce mémoriser une pile de commandes Git ?

Non. Commencez par le web ou GitHub Desktop. Apprenez ensuite les quelques commandes utiles : status, add, commit, push, pull.

### 10. Il y a beaucoup de ressources gratuites. GitHub diffère-t-il d'un cours ?

Les cours enseignent ; GitHub est l'endroit où vivent de vrais projets et où vous pouvez les inspecter, les exécuter et contribuer. C'est un environnement de travail.

### 11. Pour un portfolio, pourquoi GitHub vaut-il mieux qu'un CV PowerPoint ?

Un dépôt s'ouvre, s'exécute et s'inspecte. Il montre le travail, l'historique et la documentation ; une présentation ne fait que le décrire.

### 12. Tout le monde dit d'apprendre, mais je crains de perdre du temps. Comment décider ?

Si vous devez stocker du travail, montrer des preuves, collaborer ou publier un site, ça vaut le coup. Si vous voulez seulement interroger l'IA, vous pouvez attendre.

### 13. GitHub propose des modèles IA gratuits. Quel rapport avec moi ?

Beaucoup de projets IA publient modèles, démos et API sur GitHub. Vous pouvez les essayer, les exécuter localement ou les connecter à vos outils.

### 14. Quels bénéfices concrets une personne sans code tire-t-elle de GitHub ?

Une archive sûre, un portfolio public, un site statique gratuit, un moyen de suivre et d'exécuter des outils, et un chemin vers la contribution sans beaucoup coder.

## 2. Premier jour sans code : l'utiliser sans ligne de commande

### 15. Un dépôt est plein de boutons en anglais. Lesquels regarder d'abord ?

La liste des fichiers, le README, le bouton vert Code, Issues et Releases. Ils couvrent lire, télécharger, exécuter et poser des questions.

### 16. Puis-je envoyer quelque chose uniquement via le web, sans Git ni commandes ?

Oui. Créez un dépôt, utilisez « Add file » ou glissez des fichiers dans le navigateur, écrivez un message de commit et enregistrez.

### 17. Que fait le bouton vert Code et pourquoi confond-il les débutants ?

Il propose de cloner en HTTPS ou SSH, d'ouvrir avec GitHub Desktop ou de télécharger un ZIP. Pour un premier regard, Download ZIP est le plus simple.

### 18. Star, Watch et Fork : quelle différence, et puis-je casser quelque chose ?

Star est un favori, Watch envoie des notifications et Fork copie un dépôt dans votre compte. Aucun ne modifie le projet d'origine.

### 19. On dit « Fork puis modifie ». Fork est-il une copie ou un lien ?

C'est une copie dans votre compte avec un lien vers l'original. Vous modifiez votre fork sans toucher la source, puis ouvrez une pull request.

### 20. Je veux le projet de quelqu'un dans mon compte. Cloner ou Fork ?

Fork si vous voulez votre copie GitHub et un chemin de contribution. Cloner si vous voulez seulement une copie locale pour exécuter ou inspecter.

### 21. Puis-je modifier du code en ligne avec une touche, sans rien installer ?

Oui. Appuyez sur `.` sur la page d'un dépôt pour ouvrir github.dev, un éditeur dans le navigateur. Utile pour de petites modifications et la lecture.

### 22. Puis-je éviter de configurer le nom et l'email Git ? Que se passe-t-il ?

Non. Les commits utilisent cette identité et GitHub attribue les contributions à votre compte. Utilisez le même email que GitHub.

### 23. Les clés SSH échouent avec « permission denied ». Quelle étape est fausse ?

Souvent la clé publique. Copiez le fichier `.pub` entier, de `ssh-` à la fin, dans GitHub. Ne partagez jamais la clé privée. Testez avec `ssh -T git@github.com`.

### 24. GitHub est lent en Chine. Existe-t-il des moyens d'accélérer sans VPN ?

Essayez un fichier hosts maintenu comme GitHub520, un domaine miroir ou un proxy configuré dans Git. Évitez les miroirs inconnus pour les dépôts privés.

### 25. Je n'ai pas reçu l'email de vérification GitHub. Que faire ?

Vérifiez le spam, l'adresse, renvoyez depuis Settings → Emails et évitez les emails temporaires. Sinon, utilisez une autre boîte fiable.

### 26. Avant mon premier commit, GitHub Desktop ou ligne de commande ?

Utilisez GitHub Desktop ou le web le premier jour. Apprenez la ligne de commande quand vous aurez besoin de vitesse, de scripts ou de traitement par lots.

### 27. Pourquoi lire le README d'abord ? Que se passe-t-il sinon ?

Le README explique ce qu'est le projet, comment l'installer, l'exécuter et quoi éviter. L'ignorer conduit souvent à la mauvaise version ou à une étape manquante.

### 28. Je veux sauvegarder un projet que j'aime. Star ou liste personnelle ?

Star pour un favori rapide. Une liste personnelle quand vous en avez beaucoup et besoin de catégories. Ajoutez une note sur la raison.

### 29. Les branches semblent avancées. En ai-je besoin le premier jour ?

Non. Le premier jour, travaillez sur la branche principale. Apprenez les branches quand vous modifiez le projet d'un autre ou testez deux idées.

### 30. Je veux envoyer un dossier local pour la première fois. Quelles commandes minimum ?

`git init`, `git add .`, `git commit -m "first commit"`, `git remote add origin <url>`, `git push -u origin main`. Sinon, utilisez GitHub Desktop.

### 31. À quoi servent Issues, Pull requests et Actions ?

Issues suivent bugs, idées et questions. Pull requests proposent des changements. Actions exécute des tâches automatiques comme tests ou déploiement.

### 32. Puis-je mettre GitHub en chinois ? Cela complique-t-il les tutoriels anglais ?

La localisation est limitée. Utilisez la traduction du navigateur, mais gardez les termes clés en anglais pour que tutoriels et documentation restent compréhensibles.

### 33. Quelle différence entre un dépôt et un projet ?

Un dépôt est le stockage et l'historique des fichiers. Un « projet » est un effort plus large ; GitHub Projects est un tableau qui relie issues et pull requests.

### 34. Modifier un fichier sur le web compte-t-il comme commit ? Différence avec un commit local ?

Oui, cela crée un commit sur le serveur. Un commit local se fait sur votre machine puis est poussé ; l'historique est le même, le flux diffère.

## 3. Pourquoi je me plante dès que je l'utilise ?

### 35. Push dit que l'authentification par mot de passe a été supprimée. Pourquoi mon mot de passe ne marche pas ?

GitHub n'accepte plus les mots de passe de compte en HTTPS. Utilisez un token d'accès personnel, SSH ou GitHub Desktop, qui gère l'authentification.

### 36. J'ai envoyé par erreur une clé, un mot de passe ou une pièce d'identité. Comment l'effacer complètement ?

Révoquez et renouvelez le secret d'abord. Retirez-le de l'historique avec git-filter-repo ou BFG, forcez le push et prévenez les personnes ayant accès. Un nouveau commit ne l'efface pas.

### 37. Mon .gitignore était faux et j'ai envoyé des fichiers inutiles. Comment réparer ?

Ajoutez-les à `.gitignore`, retirez-les de l'index avec `git rm --cached`, commitez et poussez. S'ils contiennent des secrets, renouvelez-les et nettoyez l'historique.

### 38. Mes messages de commit sont « fix » et « update ». Peut-on les rendre utiles ?

Utilisez un résumé impératif court et un corps expliquant pourquoi. Pour l'historique non poussé, amend ou squash ; après publication, préférez de nouveaux commits clairs.

### 39. Je veux annuler mon dernier commit. Reset, revert ou checkout ?

`revert` pour annuler un commit public en sécurité. `reset` seulement pour un historique local non partagé. `checkout` sert à changer de fichiers ou de branches.

### 40. Une fusion a produit une masse de `<<<<<<<`. Qu'est-ce que c'est ?

Ils marquent des versions en conflit des mêmes lignes. Éditez le fichier pour garder le bon contenu, supprimez les marqueurs, puis add et commit.

### 41. `git add` doit-il ajouter un fichier ou tout le dossier ? Comment annuler une erreur ?

Ajoutez seulement ce qui appartient au commit. Si vous avez trop ajouté, `git restore --staged <file>` le retire du stage. Vérifiez `git status`.

### 42. Pourquoi commit après add ? Que fait le staging ?

Le staging sélectionne ce qui ira dans le prochain commit. Il permet de relire et séparer les changements pour un commit cohérent.

### 43. Que signifient les fichiers rouges et verts dans `git status` ?

Rouge : non suivi ou modifié sans stage. Vert : prêt à committer. Lisez les libellés.

### 44. J'ai commité une erreur et je ne veux pas de trace d'annulation. Existe-t-il un moyen propre ?

Pour un commit non poussé, amend ou reset puis recommit. Pour un commit poussé, ne réécrivez pas l'historique public ; faites un commit correctif ou coordonnez-vous.

### 45. Deux personnes ont modifié le même fichier et mes changements ont été écrasés. Comment éviter ?

Faites pull avant de commencer, travaillez sur une branche, commitez souvent et ouvrez une pull request. Résolvez les conflits explicitement, sans force-push.

### 46. Je suis un tutoriel mais je bloque au premier push. Quels sont les trois points courants ?

Authentification, URL distante et nom de branche. Vérifiez le token ou la clé SSH, `git remote -v` et poussez vers la branche qui existe.

### 47. Pull dit « unrelated histories ». Qu'est-ce que cela signifie ?

Les dépôts local et distant n'ont pas d'ancêtre commun. Fusionnez avec `--allow-unrelated-histories` seulement si vous êtes sûr, ou repartez d'un clone propre.

### 48. Push est rejeté, pull crée des conflits et je tourne en boucle. Comment sortir ?

Fetch, inspectez la divergence, puis merge ou rebase volontairement. Pour une branche personnelle, réinitialisez sur le distant et réappliquez vos changements ; jamais de force-push sur une branche partagée.

### 49. J'ai cloné un dossier vide alors que la page web a des fichiers. Pourquoi ?

Mauvaise branche, mauvaise URL, ou fichiers dans un sous-module ou une release. Vérifiez la branche par défaut et l'URL.

### 50. Un dépôt renvoie 404 ou accès refusé. Suis-je bloqué ou l'URL est-elle fausse ?

Vérifiez l'URL, si le dépôt est privé et si vous êtes connecté. Un dépôt privé renvoie 404 sans accès.

### 51. J'ai supprimé .git, perdu une branche ou modifié la mauvaise branche. Comment récupérer ?

Vérifiez le reflog et les branches distantes. Si .git a disparu, clonez à nouveau et récupérez les fichiers non commités depuis les sauvegardes ou l'historique de l'éditeur.

## 4. Comment trouver de bons projets, les juger et les exécuter ?

### 52. Je veux un outil utilisable. Comment chercher sur GitHub mieux qu'un moteur général ?

Cherchez par problème, pas par nom. Utilisez la recherche GitHub, filtrez par langage, étoiles et mise à jour récente, et lisez le README des premiers résultats.

### 53. Pourquoi ajouter « awesome » à la recherche trouve-t-il des listes précieuses ?

Les listes « awesome » sont des collections curatées de liens sur un thème. Elles évitent de parcourir des dépôts au hasard.

### 54. Le nombre d'étoiles suffit-il pour juger un projet ? Que regarder d'autre ?

Non. Regardez les commits récents, les issues ouvertes, l'activité des mainteneurs, la documentation, la licence et si le projet résout votre problème.

### 55. Comment savoir si un projet est vivant ou abandonné ?

Regardez le dernier commit, la release et l'activité des issues. Un projet sans mise à jour depuis un an et avec des issues sans réponse est souvent abandonné.

### 56. Le README est trop technique. Existe-t-il une lecture rapide pour non-spécialistes ?

Lisez la première section, l'installation, l'exemple d'usage et le dépannage. Sautez l'architecture sauf si vous voulez le modifier.

### 57. Je veux exécuter un projet. Quelle section du README lire d'abord ?

Prérequis et installation, puis usage. Vérifiez le système d'exploitation et les versions supportées avant d'installer.

### 58. Que sont `npm install` et `pip install` ? J'ai peur de les lancer.

Ils installent les dépendances du projet. C'est normal, mais lancez-les dans un dossier de confiance, idéalement un environnement virtuel ou un conteneur.

### 59. La commande d'installation échoue sur mon ordinateur. Qu'est-ce qui cloche souvent ?

Mauvaise version de runtime, dépendance système manquante, problème de chemin ou de permissions. Lisez la première erreur et comparez votre environnement aux prérequis.

### 60. Puis-je remplacer github par deepwiki dans l'URL pour une documentation en langage clair ?

Certains dépôts ont une documentation générée sur DeepWiki, pas tous. Cela aide à comprendre, mais vérifiez les détails importants à la source.

### 61. Je ne comprends pas le code. Est-il fiable de coller le README dans l'IA pour une explication ?

Utile pour s'orienter, mais l'IA peut omettre des détails ou inventer. Servez-vous-en pour formuler des questions, puis vérifiez README et code.

### 62. Un projet télécharge à 20 KB/s. À part attendre, comment accélérer ?

Utilisez un miroir de téléchargement, un proxy configuré dans Git ou téléchargez le ZIP d'une release au lieu de cloner tout l'historique.

### 63. Le projet demande une API key. Où l'obtenir et est-ce sûr ?

Chez le fournisseur officiel, jamais dans un dépôt aléatoire. Gardez-la dans une variable d'environnement, ne la commitez pas et fixez des limites de dépense.

### 64. Puis-je tester un projet dans le navigateur ou sur mobile sans environnement local ?

Parfois. Cherchez une démo, une version hébergée, GitHub Pages ou un notebook cloud. Sinon, un environnement local est généralement nécessaire.

### 65. Le projet affiche un mur d'erreurs rouges. Est-ce le projet ou mon environnement ?

Voyez si l'erreur concerne un runtime ou un paquet manquant (votre environnement) ou une traceback de logique (le projet ou un scénario non supporté). Cherchez la même erreur dans Issues.

### 66. Releases ou télécharger le code : que choisir quand on est normal ?

Releases pour un paquet prêt à l'emploi. Le code source seulement pour lire, modifier ou compiler.

### 67. Je ne veux pas toucher au code. Comment choisir une version prête à l'emploi ?

Regardez les assets de Releases, choisissez la build pour votre système et préférez une version récente avec des instructions claires.

### 68. Comment distinguer un projet IA hype d'un projet vraiment utile ?

Vérifiez si le README a de vraies étapes d'installation et d'usage, si le projet est mis à jour et si les Issues montrent un usage réel ou seulement « ça ne démarre pas ».

### 69. Je collectionne de bons projets mais je ne les ouvre jamais. Comment créer l'habitude ?

Choisissez un projet dont vous avez besoin aujourd'hui, suivez une étape du README et utilisez-le ou supprimez-le de la liste. Une petite liste annotée vaut mieux qu'une grande collection.

## 5. Comment stocker mon travail, le montrer et contribuer à l'open source ?

### 70. Que doit contenir mon premier dépôt ? Un dépôt vide fait-il mauvaise impression ?

Mettez une vraie note, un journal d'étude ou un petit projet d'entraînement. Un dépôt vide fait pire qu'un dépôt simple et honnête.

### 71. Comment écrire un README compréhensible sans compétences en design ?

Structure simple : nom, description en une ligne, fonctionnalités, installation, usage et contact. GitHub rend le Markdown ; prévisualisez avant de sauvegarder.

### 72. Markdown a beaucoup de syntaxe. Que faut-il pour un README ?

Titres, gras, listes, liens, images et blocs de code. Cela couvre presque tous les README.

### 73. Je veux publier du code mais je crains qu'il soit mauvais. Comment emballer mon premier dépôt ?

Ne craignez pas le ridicule. Un README clair, des instructions qui marchent et un périmètre honnête suffisent. Tout le monde commence quelque part.

### 74. Qu'est-ce que GitHub Pages et comment transformer un dépôt en page personnelle ou CV ?

Pages est un hébergement statique gratuit. Mettez un `index.html` dans un dépôt, activez Pages dans Settings et le site apparaît à `utilisateur.github.io/repo`.

### 75. Faut-il un serveur et un domaine pour Pages ? Est-ce suffisant pour une personne normale ?

Non. Pages inclut l'hébergement et un domaine `github.io`. Il ne gère que le statique, suffisant pour un CV, un portfolio ou une documentation.

### 76. Comment faire apparaître ma page quand un recruteur cherche mon nom ?

Mettez le lien dans le CV, les réseaux et la signature email. Gardez les dépôts documentés et actifs ; le classement suit le contenu réel et trouvable.

### 77. Comment rendre mon profil GitHub présentable avec statistiques ou modèles en dix minutes ?

Cherchez un modèle de README de profil, copiez-le, remplacez les données et commitez. Les cartes lisent votre activité publique, continuez donc à contribuer.

### 78. Je veux aider un projet open source mais je ne code pas. Que puis-je apporter ?

Documentation, traductions, étapes plus claires, rapports de bugs, design, tutoriels et réponses aux nouveaux utilisateurs.

### 79. Corriger des fautes et de la documentation compte-t-il ? Les auteurs apprécient-ils ?

Oui. Les contributions documentaires sont parmi les plus faciles à accepter et sont souvent remerciées explicitement.

### 80. Le label « good first issue » est-il pour les débutants ? Comment l'utiliser ?

Oui. Il marque des tâches pour nouveaux. Lisez l'issue, posez des questions, suivez le guide de contribution et gardez un petit changement.

### 81. Je veux signaler un bug ou suggérer une amélioration. Comment écrire une Issue non ignorée ?

Titre clair, étapes de reproduction, comportement attendu et réel, versions et logs. Cherchez les issues existantes et une issue par problème.

### 82. Qu'est-ce qu'une Pull Request et en quoi diffère-t-elle d'une modification directe ?

Une PR propose des changements de votre branche ou fork vers le dépôt cible. Elle ajoute revue, discussion et CI avant la fusion.

### 83. Ma première PR a été refusée. Est-ce que je ne vaux rien ?

Non. C'est normal : hors périmètre, tests manquants ou conflit avec le plan du mainteneur. Lisez le retour et itérez.

### 84. Quelle différence entre Discussions et Issues ? Où parler ?

Issues pour bugs et tâches actionnables. Discussions pour questions ouvertes, idées et conversation. Suivez les consignes du projet.

### 85. Puis-je utiliser GitHub pour gérer écriture, notes et recherche ? Est-ce mieux que le cloud ?

Oui. Historique, diffs, issues, collaboration et texte portable. Mieux pour un travail structuré et évolutif que pour de gros binaires.

### 86. GitHub Actions exécute des tâches automatiquement. À quoi cela sert-il à une personne normale ?

Sauvegardes planifiées, publication d'un site statique, tests, génération de rapports et synchronisation de contenu. Commencez par un modèle avec des permissions étroites.

### 87. Copilot CLI peut-il m'aider à manipuler GitHub sans écrire de code ?

Oui. Il suggère et explique des commandes en langage naturel et demande confirmation avant exécution. Utile quand vous oubliez la commande exacte.

### 88. Puis-je utiliser GitHub + jsDelivr comme hébergement d'images et CDN gratuit pour mon blog ?

Oui, avec prudence : dépôt public, pas d'images privées, dépôt petit. Convient pour des images occasionnelles, pas comme stockage illimité.

### 89. Peut-on vraiment gagner de l'argent avec GitHub Sponsors ?

Certains mainteneurs oui, et GitHub ne prend pas de commission. Il faut un projet avec de vrais utilisateurs et une contribution continue. C'est un soutien, pas un raccourci.

## 6. Jusqu'où aller, ou où s'arrêter ?

### 90. Après les bases, apprendre les branches ou la collaboration d'abord ?

Choisissez selon l'objectif. Releases pour publier, Pages pour montrer, Actions pour automatiser et collaboration pour travailler à plusieurs. Les branches s'apprennent dans une vraie PR.

### 91. Que révise vraiment une Code Review et comment éviter les remarques ?

Logique, cas limites, bugs, performance, noms et clarté. Gardez des PR petites, répondez aux commentaires et voyez-la comme du coaching gratuit.

### 92. Les tableaux Projects servent-ils à gérer des projets ? En quoi dépassent-ils Excel ?

Oui. Ils relient issues et pull requests, montrent statut, responsables, dates et priorité. Les données restent dans Issues/PRs, sans doublon.

### 93. Actions pour builds et déploiement semble avancé. Faut-il s'y mettre maintenant ?

Oui, mais avec des modèles. Utilisez-les pour des sauvegardes planifiées ou une publication automatique. Apprenez l'intérieur quand le besoin est réel.

### 94. Quels problèmes les « variables » et le « cache » d'Actions résolvent-ils ?

Les variables évitent de répéter la même valeur dans plusieurs flux. Le cache évite de réinstaller les dépendances à chaque exécution.

### 95. Quels raccourcis et astuces de palette de commandes apprendre le premier jour ?

Apprenez `?` pour les raccourcis, la navigation `G`, `t` pour chercher un fichier, `y` pour un lien permanent et `.` pour l'éditeur web. La palette est le recours.

### 96. Que fait « y » pour créer un lien permanent, et pourquoi ne pas partager l'URL actuelle ?

Une URL normale pointe vers une branche, qui change. `y` remplace la branche par un ID de commit, rendant le lien stable. Utilisez-le pour partager du code.

### 97. Les cartes au survol montrent-elles ce qu'est un lien sans l'ouvrir ?

Oui, dans GitHub Docs. Survolez ou appuyez sur Alt/Option + Haut sur un lien pour prévisualiser l'article ; Entrée suit, Échap ferme.

### 98. Comment configurer les alias Copilot CLI et combien de frappe économisent-ils ?

Utilisez `gh copilot alias` pour générer `ghcs` (suggest) et `ghce` (explain). Ajoutez la ligne eval générée au shell ; n'écrivez pas un alias simple.

### 99. Qu'est-ce que « suffisant » ? Quelles zones profondes une personne normale peut sauter ?

Suffisant : stocker du travail, lire un README, exécuter un projet, ouvrir une PR et publier une page. Vous pouvez sauter les internals Git avancés, Actions complexes et le tooling monorepo.

### 100. Que ne résout pas GitHub, et où un outil spécialisé est-il meilleur ?

Ce n'est ni un disque cloud, ni un éditeur collaboratif temps réel, ni un outil de design, ni une suite complète de gestion de projet. Utilisez-le pour un travail versionné, textuel et collaboratif.

