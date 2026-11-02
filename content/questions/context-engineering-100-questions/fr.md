---
title: 100 questions sur le Context Engineering
summary: Du context rot et du budget d'attention à l'assemblage de la fenêtre, la compaction et le cache, la conception d'instructions, le coût et l'évaluation de la qualité — 100 questions pour appliquer l'ingénierie de contexte en pratique.
tags: [Context Engineering, Ingénierie de contexte, Agents IA, LLM, Guide thématique]
author: 100mini Editorial
publishedAt: 2026-11-02
updatedAt: 2026-11-02
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
    value: Context Engineering / fenêtre de contexte
  - key: Pour qui
    value: Ingénieurs IA / développeurs d'agents / produit et données
  - key: Mis à jour
    value: 2026-11-02
---

## Préface

Ceci est un guide « 100 questions » : une façon de découper un grand sujet en questions, puis de le lire une question à la fois.

L'ingénierie de contexte ne consiste pas à écrire une meilleure phrase de prompt. Elle consiste à décider, avant chaque inférence, quel petit ensemble de tokens assembler à partir de documents, d'outils, de mémoire et d'historique pour maximiser la probabilité de réussite. C'est aussi une discipline de coût : chaque token dans la fenêtre dilue l'attention et s'ajoute à la facture.

Le guide suit six étapes : pourquoi une fenêtre plus remplie devient plus bête, ce qui mérite d'entrer, comment éviter qu'une longue session finisse mal, comment les instructions survivent, où passe l'argent et comment vérifier la qualité.

**Réponses rapides**

- La fenêtre est un établi, pas un entrepôt : viser juste compte plus que accumuler.
- D'abord correction et complétude ; une information fausse est pire qu'une information absente.
- Mieux vaut plafonner que réécrire, et nettoyer plutôt que forcer la compaction ; le cache déteste les changements de préfixe.
- Les contraintes critiques vont dans des fichiers du projet, pas seulement dans la conversation.
- Aucune technique n'a de valeur universelle : seulement « mon évaluation a-t-elle progressé ? ».

> Compilé à partir de sources sur le Context Engineering et de références publiques, restructuré et édité pour ce site.

> Ceci est une édition éditée : certains passages source étaient tronqués par l'OCR, le corps privilégie donc une liste de questions actionnable avec des réponses concises.

## 1. Pourquoi une fenêtre plus grande devient plus bête

### 1. Pourquoi remplir la fenêtre rend-il le modèle plus bête ?

C'est le context rot : plus la fenêtre contient de tokens, moins le modèle récupère l'information avec précision. Une étude contrôlée sur 18 modèles a trouvé la même direction : aucun n'a tenu son score quand l'entrée grandissait.

La cause est le budget d'attention. Le transformer relie chaque paire de tokens, donc n tokens créent n² relations ; une fenêtre plus remplie répartit moins bien le budget. La dégradation est progressive, pas une falaise, mais la précision de récupération et le raisonnement long s'effritent.

### 2. Le test de l'aiguille est parfait, pourquoi les tâches réelles échouent-elles ?

Parce que « aiguille dans une botte de foin » mesure la correspondance lexicale, pas la compréhension sémantique. Dans les tâches réelles, question et réponse ne partagent souvent aucun mot-clé, et le modèle doit distinguer du matériel pertinent qui ne répond pas.

Testez trois choses : trouver le fait, le trouver avec la question reformulée, et le trouver avec des distracteurs. Ne tester que la première surestime le modèle.

### 3. Pourquoi l'information au milieu est-elle la plus oubliée ?

L'attention suit une forme en U : forte au début (primauté), forte à la fin (récence), faible au centre. Dans des expériences multi-documents, un fait placé au milieu de 20 à 30 documents a obtenu moins que la base sans aucun document.

Donc documents longs en haut, question à la fin ; au-delà d'une vingtaine de documents, en ajouter apporte très peu.

### 4. Pourquoi le placement compte-t-il plus que la simple présence dans la fenêtre ?

Une information présente mais enterrée n'est pas beaucoup mieux qu'une information absente. À aiguille et longueur égales, changer la similarité sémantique, les distracteurs et la structure du foin déplace nettement le score.

Faites trois choses : segmentez avec des titres ou des balises XML ; donnez des sections distinctes aux instructions, au contexte et à la documentation des outils ; utilisez des exemples représentatifs, pas des listes de cas limites.

### 5. Pourquoi un long chat devient-il chaotique, souvent sans retour ?

Le modèle conclut tôt, puis tourne autour d'une conclusion peut-être fausse. Dans les tests multi-tours, découper une tâche a fait chuter la performance de 39 % en moyenne, même sur des modèles forts.

Si vous voyez deux signaux sur trois — se contredit, répète une action échouée, ignore de nouvelles instructions — arrêtez de rafistoler. Écrivez les conclusions confirmées dans un fichier et repartez dans une fenêtre propre.

### 6. Pourquoi un contexte mélangé peut-il battre un contexte cohérent ?

C'est contre-intuitif mais reproductible : mélanger le foin a amélioré la récupération sur 18 modèles et de nombreuses longueurs. La prose cohérente a son propre flux, et l'aiguille insérée paraît incongrue ; le texte mélangé n'a pas de flux à briser.

N'envoyez pas de prompts mélangés, mais retenez les trois leviers positifs : réduire le volume, augmenter la similarité aiguille-question et supprimer les distracteurs.

### 7. Comment distinguer les quatre échecs : empoisonnement, distraction, confusion et conflit ?

L'empoisonnement est une hallucination qui entre dans la fenêtre et est citée à répétition. La distraction est une fenêtre longue qui fait rejouer l'historique au lieu d'agir. La confusion est du matériel superflu qui détourne la réponse. Le conflit est une information ancienne et nouvelle qui se contredisent.

Triez du plus vérifiable : cherchez l'empoisonnement, puis les conflits, retirez du matériel pour voir si la confusion passe, et seulement ensuite accusez la longueur.

### 8. Pourquoi l'attention est-elle un budget qui fond à chaque token ?

Chaque token ajouté dilue les relations d'attention entre tous les tokens. Doubler l'entrée quadruple les relations par paires : c'est la forme mathématique du rendement décroissant.

Gérez avec deux règles : ajoutez une chose en en supprimant une autre ; et plafonnez les éléments résidents, comme le system prompt et les définitions d'outils.

### 9. Comment savoir si l'agent est devenu bête à cause du modèle ou du contexte ?

En pratique, la plupart des échecs sont des échecs de contexte. Faites trois vérifications : réordonnez le contexte à la main et voyez si la performance revient ; vérifiez que les instructions ont bien été chargées ; comparez aux symptômes classiques d'échec de contexte.

Si les trois sont propres, alors seulement soupçonnez le modèle. Changer avant ne donne qu'un autre modèle que le même contexte peut tirer vers le bas.

### 10. Comment le modèle peut-il annoncer l'espace restant dans la fenêtre ?

Les API récentes de Claude injectent un budget et un rappel d'espace restant : la context awareness. Le modèle planifie avec l'espace réel au lieu de deviner quand s'arrêter.

Pour des données quantitatives, lisez les champs usage plutôt que d'analyser ces balises. Si votre harness compacte automatiquement, dites-le au modèle pour qu'il ne s'arrête pas trop tôt.

### 11. Comment mesurer à la main la fenêtre utilisable de mon modèle ?

Utilisez au moins cinq niveaux de longueur, de quelques milliers de tokens jusqu'à près de la limite annoncée, en ne changeant que la longueur et en gardant la difficulté. Prenez des aiguilles sémantiques, pas littérales, et testez une puis plusieurs aiguilles.

Mesurez le point d'entrée que vous utilisez réellement : la couche API ou abonnement peut différer de la page marketing.

### 12. Pourquoi le même modèle se comporte-t-il différemment selon l'hôte ?

Le modèle est fixe, mais l'hôte décide de ce qui est assemblé avant chaque inférence, de la troncature de l'historique et des outils attachés. Le même modèle peut rendre très différemment dans Cursor et Claude Code.

Avant d'accuser le modèle, inspectez l'assemblage de l'hôte : taille du system prompt, nombre d'outils, troncature de l'historique et chargement des règles du projet.

### 13. Quelle différence entre une fenêtre 1M annoncée et une fenêtre utilisable ?

Quatre couches : nominale, capacité, récupérabilité et portée de raisonnement. Acheter la fenêtre ne donne que la première ; le succès dépend souvent des deux dernières.

Chaque couche est plus petite que la précédente. La capacité se consulte dans la documentation et par comptage de tokens ; la récupérabilité et le raisonnement se mesurent sur vos documents.

### 14. L'ingénierie de prompt est-elle morte ou est-ce du marketing anxiogène ?

Elle n'est pas morte : elle a été absorbée. Elle reste un sous-ensemble de l'ingénierie de contexte. Bien écrire une instruction d'un tour sert toujours, mais ne suffit pas pour des sessions longues à nombreux outils.

Le récit de la « mort » est surtout du marketing de conflit. Ne choisissez pas un camp : corrigez la couche vers laquelle pointent vos échecs.

### 15. Pourquoi l'ingénierie de contexte est-elle de l'ingénierie et pas un rebranding ?

Parce qu'elle a de vrais modes de défaillance à combattre. Les échecs des LLM ressemblent plus à l'ingénierie physique qu'au logiciel : tolérances, incertitude et matériaux dont la résistance n'est pas entièrement connue.

Vous pouvez parler d'ingénierie quand vous savez énoncer votre taux d'échec actuel, les chiffres avant/après d'un changement et pourquoi il fonctionne. Avant cela, vous lancez encore des sorts.

### 16. Comment un tweet a-t-il rendu l'ingénierie de contexte virale ?

Le chemin fut court : Tobi Lütke a dit préférer le terme, Karpathy l'a amplifié en listant description de tâche, exemples, RAG, outils, état, historique et compaction ; puis Hacker News et Simon Willison lui ont donné une définition publique collante.

Le terme est un contenant ; la cargaison réelle est cette liste de sept points, qui correspond aux six chapitres de ce guide.

## 2. Ce qui mérite d'entrer dans la fenêtre

### 17. Pourquoi « le plus petit ensemble de tokens à fort signal » est-il le seul principe universel ?

Les autres techniques ont des limites : la récupération sert quand le savoir est dehors, la mémoire quand on traverse les sessions, la compaction quand la session est trop longue. Seul « peu et à fort signal » vaut partout.

Les deux qualificatifs comptent : fort signal signifie que chaque token contribue au raisonnement ; minimum signifie que contribuer ne suffit pas, il faut valoir l'espace. Une fenêtre de 200K remplie de 190K tokens hors sujet perd contre 20K pertinents.

### 18. Pourquoi récupérer avant de répondre bat-il le fait de tout entasser ?

Tout entasser encourage la paresse : une fois le tas dans la fenêtre, le modèle cesse de chercher. La récupération juste-à-temps ne garde que des identifiants légers — chemins, requêtes, liens — et lit le contenu au besoin.

Le schéma pratique est hybride : précharger le savoir statique stable et laisser l'agent chercher les détails dynamiques.

### 19. Pourquoi le RAG n'est-il pas mort, seul le RAG paresseux l'est ?

Ce qui est mort, c'est l'implémentation superficielle : découpage aléatoire, top-5 vectoriel, entassement dans le prompt, prière. Le cœur de la récupération — donner la bonne information au bon moment — reste nécessaire.

Le contexte long n'y a pas mis fin. Le savoir d'entreprise est dispersé, périmé, soumis à permissions, versions et contradictions ; une fenêtre plus grande donne plus de place, pas la réponse à ce qui doit y entrer. Corrigez le découpage, gardez BM25, ajoutez le reranking et un jeu d'évaluation.

### 20. Quel niveau de détail pour un system prompt ?

L'échelle est le « right altitude » : trop bas, une logique rigide casse sur les cas limites ; trop haut, le modèle n'a aucun signal concret et devine. Le bon point guide le comportement sans fermer la porte aux heuristiques.

Une structure utile : Identity, Instructions, Examples, Context. Commencez par le prompt minimal, puis ajoutez une règle par échec observé.

### 21. Comment donner des exemples few-shot sans gaspiller la fenêtre ?

Commencez par 3 à 5, pertinents, variés et représentatifs de cas standards, entourés de `<example>` et séparés des instructions. Les exemples sont des ancres de comportement, pas de la documentation.

Ce sont des contenus stables : placez-les dans le préfixe caché et le coût marginal chute. Dispersés et modifiés à chaque tour, vous payez plein tarif à chaque fois.

### 22. Dans quel ordre faire entrer plusieurs documents dans la fenêtre ?

Documents longs en haut, question à la fin. Dans les tâches complexes multi-documents, déplacer la requête vers la fin peut améliorer la qualité jusqu'à environ 30 % — un plafond, pas une garantie.

Entourez chaque document de `<document>` avec les métadonnées de source ; pour les tâches longues, faites d'abord citer les passages pertinents, puis répondre à partir de ces citations.

### 23. Que garder dans la fenêtre et que mettre dans des fichiers ?

Ce dont le raisonnement de ce tour a besoin reste ; le « peut-être utile plus tard » va sur disque. Les fichiers sont la persistance, la fenêtre est l'établi.

Écrivez notes de recherche, plans et progression dans des fichiers ; avant de fermer une session, mettez les décisions clés dans des fichiers du projet pour que la suivante reprenne.

### 24. Comment choisir parmi tant de systèmes de mémoire ?

Pas de classement, seulement un ajustement au scénario. Les graphes temporels servent aux faits qui changent et doivent être tracés ; l'approche type OS aux agents à état de longue durée ; les profils SQL sont bon marché et auditables ; le stockage littéral avec filtres de métadonnées égale ou dépasse souvent l'extraction.

Le tournant clair de 2026 est l'anti-extraction : toute écriture mémoire ne mérite pas un appel au modèle.

### 25. Quand installer un système de mémoire est-il un gaspillage ?

Trois signaux : la tâche ne traverse jamais les sessions ; ce qu'il faut retenir tient sur une page ; et les règles de projet et la mémoire automatique intégrées ne sont même pas utilisées.

Une solution légère suffit souvent, comme un NOTES.md tenu par l'agent ou une ligne dans les règles du projet pour relire le plan après compaction.

### 26. Pourquoi CLAUDE.md et la mémoire automatique sont-ils deux canaux séparés ?

La frontière est l'auteur : CLAUDE.md est ce que vous écrivez pour le modèle ; la mémoire automatique est ce que le modèle écrit pour lui-même. La première contient des instructions et règles relues ; la seconde, des leçons et préférences apprises des corrections.

Les séparer garde les deux auditables : vos règles ne sont pas réécrites en silence et les suppositions du modèle ne se font pas passer pour vos décisions.

### 27. Comment écrire des définitions d'outils sans faire exploser la fenêtre ?

Les définitions occupent la fenêtre à chaque tour et ne disparaissent pas à la compaction. Fusionnez d'abord les outils redondants et gardez les sorties intermédiaires hors de la fenêtre.

Ajoutez ensuite formats de réponse, pagination, portée, filtres et troncature. Ne laissez jamais une seule réponse d'outil déverser une sortie sans limite.

### 28. Trop d'outils MCP font exploser la fenêtre : comment les sortir de la conversation principale ?

Trois voies : donner à un sous-agent sa propre liste d'outils autorisés pour que le sale boulot reste dans sa fenêtre ; transformer les définitions en fichiers chargés à la demande ; et consolider avant de déplacer.

Le point n'est pas « utiliser moins de serveurs MCP », mais ne pas garder des dizaines de définitions résidentes dans la conversation principale. Beaucoup d'équipes manquent de consolidation, pas d'outils.

### 29. La recherche renvoie des choses hors sujet : comment traiter « sur le thème mais sans réponse » ?

Ce sont des distracteurs : liés au thème mais sans répondre. Ce n'est pas du bruit neutre ; ils interfèrent activement, et le dommage croît avec la longueur de l'entrée.

Corrigez en trois étapes : vérifiez si le découpage a séparé la réponse ; ajoutez la recherche hybride et gardez BM25 ; ajoutez le reranking pour passer de top-30 aux top-5 qui répondent vraiment.

### 30. Comment fixer un budget de fenêtre pour que chaque chose entre par quota ?

Quatre niveaux : fixe (contraintes système et objectif courant), rognable (contexte récupéré et anciens résultats d'outils), repliable (historique ancien) et par phase (outils, schémas et exemples propres à cette phase).

À chaque tour, exécutez un assemblage : charger les contraintes, extraire l'objectif, récupérer les preuves, rappeler la mémoire, choisir les outils, comprimer l'historique, classer par pertinence et tronquer au budget.

### 31. Avec le bon contexte, un modèle ordinaire peut-il gagner ?

Le bon contexte est ce qui permet à un modèle ordinaire de concourir, mais ne garantit pas la victoire. Le contexte résout « savoir » ; il ne résout pas « vérifier ».

Avec commande, garantie, ticket et outils complets, un modèle moyen peut produire un plan d'échange. Mais des réponses polies avec des erreurs de fond subsistent, donc la couche d'évaluation et de vérification est obligatoire.

### 32. Pourquoi celui qui dit « RAG is dead » se trahit-il ?

Parce qu'il suppose souvent que le savoir d'entreprise est un document propre qui tient entier dans la fenêtre. Ceux qui ont connu la production savent qu'il est dispersé, périmé, soumis à permissions, versions et contradictions ; la solution est de sélectionner, pas d'agrandir.

Un mauvais RAG est pire que pas de RAG, car il crée une illusion de fondement. Ce qui doit mourir est l'implémentation superficielle, pas la récupération.

### 33. Une bibliothèque entière ou 2 000 tokens précis ?

La partie de la fenêtre qui participe à l'inférence actuelle est le working set. Que le modèle ait 200K ou 1M, le working set se remplit de résultats périmés au même rythme ; une fenêtre plus grande éloigne seulement le mur.

La bibliothèque reste hors de la fenêtre ; dedans, seulement la tranche de la tâche courante. Le test reste : retirez ce token, le raisonnement de ce tour souffre-t-il ?

### 34. Pourquoi un mauvais contexte fait-il plus peur que pas de contexte ?

Parce qu'une information fausse bat une information absente, et l'absente bat le bruit. Le modèle peut écrire une prose fluide et assurée à partir d'un mauvais contexte ; fluidité et fondement factuel sont deux mécanismes différents.

Le pire est la pseudo-complétion : une réponse fluide, pertinente et polie qui ignore en silence une contrainte fixée dix tours plus tôt. La dernière étape de l'assemblage doit toujours demander ce que coûterait un mauvais placement.

## 3. Comment éviter qu'une longue session finisse mal

### 35. Quand la compaction se déclenche-t-elle et qui décide ?

Claude Code compacte par défaut à la limite du modèle : pour la fenêtre 1M de Sonnet 5, autour de 967K tokens. Vous pouvez avancer, entre 100K et 1M, avec `/autocompact` ou une variable d'environnement.

La voie API est distincte : la compaction serveur utilise un paramètre bêta, par défaut environ 150K tokens, réglable jusqu'à 50K. Ne mélangez pas les deux chiffres.

### 36. Pourquoi la compaction est-elle intrinsèquement lossy et sacrifie-t-elle le plus important ?

Les résumeurs gardent l'idée principale et jettent le reste. Dans une expérience, 3/3 faits principaux ont survécu et 0/3 chiffres obscurs de l'annexe ont disparu. Une règle comme « appelle toujours l'API en direct, ne lis jamais le cache » ressemble à du bavardage pour un résumeur.

La discipline est simple : ce que vous ne pouvez pas perdre ne doit pas attendre dans la conversation d'être résumé. Mettez-le dans un fichier du projet ou nommez-le explicitement dans l'instruction de compaction.

### 37. Pourquoi plus de compactages rendent-ils la session plus malade ?

Chaque passe envoie toute la conversation dans un tuyau avec pertes ; les détails du résumé précédent se perdent encore. La perte se multiplie au lieu de s'additionner, et une fenêtre dégradée produit un résumé suivant pire.

En test, un preset de compaction a marqué 38 % aux sondes de mémoire contre 92 % sans rien faire. La compaction est un premier secours, pas un remède : si après deux tours la session reste confuse, redémarrez.

### 38. Quand est-il vrai que « ne rien faire » vaut mieux que compacter ?

Quand le prix du cache est bas et la session encore gérable, garder tout l'historique peut coûter moins cher que toute réécriture, car réécrire le préfixe invalide la remise.

Ce n'est pas universel : augmentez le prix du cache ou allongez la session et la conclusion s'inverse. Vérifiez votre prix et votre nombre de tours avant de décider.

### 39. Comment éviter qu'une longue session atteigne une compaction catastrophique ?

N'attendez pas 95 % d'usage. Plus la fenêtre est pleine, plus l'appel de résumé est à l'étroit, plus le résultat est court et cassé, et une « anxiété de contexte » peut apparaître près de la limite.

Les lignes pratiques se situent entre 40 % et 75 % : compactez tôt, avec un focus, ou utilisez `/autocompact 500k` pour abaisser la ligne automatique.

### 40. /compact, /clear ou nouvelle fenêtre : lequel choisir ?

`/compact` pour la continuité, `/clear` pour repartir de zéro, et « fichier de passation + nouvelle fenêtre » pour changer de tâche. Une session contaminée par de mauvaises suppositions se nettoie moins cher qu'elle ne se sauve.

Ligne rouge : `/clear` supprime définitivement l'historique. Avant d'appuyer, assurez-vous que tout ce qui compte est sorti de la fenêtre.

### 41. Comment écrire une instruction de compaction ciblée qui garde ce que je veux ?

Après `/compact`, dites en langage simple quoi garder et quoi jeter, en nommant des substantifs concrets. « Garde les étapes et la conclusion du correctif 401 » bat « garde le processus de correction ».

Ne faites pas trop maigre : conventions de format, contraintes clés et prochaines étapes doivent être nommées. La compaction automatique devine l'importance générale ; vous ne pouvez pas vous permettre de deviner.

### 42. Après compaction, le nom du plan reste mais le contenu disparaît : comment l'éviter ?

Blessure classique : le nom du fichier de plan reste en contexte, le contenu non, et le modèle ne pense pas à le lire. Métadonnées présentes, corps perdu : la forme typique d'une lésion de compaction.

Trois défenses : mettre les contraintes critiques dans le CLAUDE.md racine ; faire relire le plan par la première instruction post-compaction ; ou utiliser un hook SessionStart qui injecte le contenu automatiquement.

### 43. Comment rédiger un document de passation pour continuer sans friction ?

Cinq sections, aucune vide : intention de session, fichiers modifiés, décisions clés, objectifs actifs et prochaine étape. Un modèle structuré agit comme une checklist obligatoire et laisse moins de place à la perte silencieuse que le récit libre.

Le seul test d'acceptation : quelqu'un qui n'était pas dans la session — y compris la prochaine instance du modèle — peut commencer à travailler sans demander de contexte.

### 44. Compaction, nettoyage et mémoire peuvent-ils tourner ensemble ?

Oui ; ils se partagent le travail comme un système d'exploitation. Le nettoyage gère les anciens résultats d'outils dans la fenêtre, la compaction toute la fenêtre, la mémoire l'état entre sessions. Chacun traite une croissance différente.

Ajoutez l'outil de mémoire à la liste d'exclusion du nettoyage, sinon des mémoires fraîchement écrites peuvent être effacées. Espacez les seuils pour qu'ils ne tirent pas en même temps.

### 45. La sortie d'outils inonde la fenêtre : comment la plafonner sans casser le cache ?

Distinguez plafonner de résumer. Un plafond raccourcit le préfixe sans changer les octets, donc le cache touche encore ; un résumé réécrit le préfixe, invalide le cache et vous fait payer plein tarif les tokens économisés.

Donc rétrécissez le contexte, ne le réécrivez pas. Pour nettoyer d'anciens résultats, nettoyez assez d'un coup pour que la reconstruction du cache vaille le coup.

### 46. La session ralentit et coûte cher : comment vérifier si le contexte est pourri ?

Regardez d'abord la facture. `/context` montre ce qu'il y a dans la fenêtre, `/usage` où vont l'argent et les limites, `/cost` le total de la session.

Si les chiffres semblent normaux mais que le comportement se répète, se contredit ou ignore les instructions, le contexte est pourri. Utilisez la question 48 pour choisir sauvetage ou redémarrage.

### 47. La compaction est bloquée sur une erreur : quel est le premier secours ?

Ne luttez pas. Appuyez sur Ctrl+C, redémarrez le processus, faites `/resume` de la session, puis `/compact`. La séquence fonctionne parce qu'elle jette l'état dégradé qui grossit côté client.

Si une version récente échoue encore, ouvrez un ticket avec le numéro de version. La cause est souvent que la requête de compaction elle-même ne tient plus dans la session.

### 48. Comment décider entre sauver la session et la redémarrer ?

Trois questions : l'erreur est-elle transitoire — sortir et rentrer la corrige, sauvetage ? Un résumé est-il revenu mais `/context` n'a pas baissé — faux succès, pas de sauvetage ? Les décisions en attente sont-elles écrites dans un fichier — alors redémarrer ne coûte rien.

Une session contaminée par de mauvaises suppositions se redémarre moins cher qu'elle ne se sauve. Les sessions sont consommables ; ne vous y attachez pas.

### 49. Comment implémenter une mémoire externe : fichiers SQLite ou base vectorielle ?

La plupart n'ont pas besoin de base vectorielle. Commencez par l'outil de mémoire intégré : le modèle appelle view, create, replace, insert, delete et rename sur un backend fichier que vous contrôlez, lisible, diffable et versionnable.

S'il y a vraiment un historique massif entre sessions, ajoutez SQLite et la récupération vectorielle. Traitez la fenêtre comme la mémoire et les fichiers comme le disque, en paginant seulement le nécessaire.

### 50. Avec des agents concurrents, comment isoler le contexte pour qu'ils ne se contaminent pas ?

Mettez le travail dans des fenêtres de sous-agents : contexte indépendant, system prompt indépendant, liste d'outils indépendante. Les grosses lectures restent dans le sous-agent et seules les conclusions remontent.

Isoler les fenêtres ne suffit pas ; isolez aussi les descriptions de tâche. Chaque sous-agent a besoin de l'objectif, du format de sortie, des outils disponibles et des limites, sinon il dupliquera le travail ou ira dans la mauvaise direction.

### 51. Un bug de compaction a mis huit mois à être corrigé : que s'est-il passé ?

L'erreur était une boucle : le message disait « contexte bas, lancez /compact », mais la compaction répondait « conversation trop longue ». Les utilisateurs se sauvaient en sortant, rentrant, reprenant et compactant. Le correctif a été annoncé plusieurs fois, a régressé, et seule la v2.1.85 a vraiment traité les requêtes de compaction trop grosses.

Leçon : la première scène de crime est le tracker d'issues, l'auto-sauvetage précède le correctif, et « corrigé » doit être ancré à une version, pas à une ligne de changelog.

### 52. Pourquoi un faux succès de compaction est-il pire qu'un crash ?

Un échec dur affiche une erreur et vous savez revenir. Le faux succès renvoie un « résumé minimal de passation » sans erreur alors que la fenêtre ne rétrécit pas et que la session reste bloquée à la limite.

La seule défense est d'inspecter la marchandise : après compaction, regardez `/context`. Si le chiffre n'a pas baissé, traitez-le comme un faux succès et redémarrez depuis une passation écrite.

### 53. Comment une erreur de compaction a-t-elle faussé de vraies comptes d'un facteur 12 ?

La règle était écrite : les positions doivent venir de l'API en direct, jamais du cache. Après compaction, le modèle l'a oubliée, a pris un raccourci par un fichier de cache vieux de trois jours et a rapporté des positions BTC fausses d'un facteur 12.

Le point n'est pas le 12x, mais que « le fichier existe » ne signifie pas « la règle est dans la fenêtre ». Mettez les contraintes d'argent et de données dans le fichier racine et faites répéter les règles après compaction.

### 54. Quels outils externes ont poussé autour des sessions que la compaction ne sauve pas ?

Trois schémas : nettoyer avant de compacter, en coupant lectures dupliquées et sorties énormes ; intercepter à 65 % d'usage et forcer une passation structurée vers une autre fenêtre ; et déplacer le contexte dans une couche proxy SQLite plus vecteurs.

Aucun n'est certifié, mais trois idées sont gratuites : ligne d'alerte d'usage, fichier de passation structuré et changement de fenêtre au lieu de parier sur la compaction.

## 4. Comment écrire des instructions qui ne sont pas ignorées

### 55. Combien de lignes pour CLAUDE.md, et que se passe-t-il au-delà ?

Gardez un seul fichier sous 200 lignes. Dépasser ne provoque pas d'erreur, mais consomme plus de contexte et réduit l'adhésion ; au-delà de 4 MiB, Claude Code l'ignore complètement.

Découper avec `@import` n'aide pas : les fichiers importés entrent entiers dans la fenêtre. Déplacez les règles de portée dans `.claude/rules/` avec un en-tête `paths`, ou supprimez ce que le modèle peut déduire du code.

### 56. Pourquoi les règles écrites dans CLAUDE.md sont-elles souvent ignorées ?

Deux causes : CLAUDE.md est injecté comme message utilisateur après le system prompt, pas dedans, donc l'adhésion stricte n'est pas garantie ; et des règles anciennes et nouvelles en conflit laissent le modèle en choisir une au hasard.

Lancez `/context` pour confirmer que le fichier apparaît dans Memory files, puis transformez les règles vagues en actions vérifiables. Les règles qui doivent se déclencher à des moments fixes vont dans des hooks ou permissions, pas en prose.

### 57. CLAUDE.md, rules, AGENTS.md : lequel gagne ?

Il n'y a pas de hiérarchie dure automatique. Tous sont du contexte : le CLAUDE.md racine a l'influence la plus large, les rules avec `paths` ne se chargent que pour les fichiers correspondants, et AGENTS.md est une convention inter-outils dont la lecture dépend de l'hôte.

En cas de conflit, la portée la plus spécifique et l'instruction la plus explicite gagnent souvent, mais le conflit lui-même réduit l'adhésion. Gardez une source unique de vérité et mettez les contraintes dures dans des hooks ou permissions.

### 58. Où placer les instructions clés dans un contexte long pour qu'elles ne se diluent pas ?

Documents longs en haut, question à la fin. L'attention est maximale au début et à la fin, faible au centre ; plus il y a de matière, plus une instruction centrale se dilue.

Divisez l'entrée multi-documents avec des balises et des sources, et faites citer avant de répondre. Rationnez aussi la matière : au-delà d'une vingtaine de documents, en ajouter apporte peu.

### 59. Quels mots d'un system prompt sont du gaspillage et lesquels valent de l'or ?

Deux extrêmes gaspillent : des dizaines de lignes de if-else qui cassent sur des cas imprévus, et un vague « tu es un assistant utile » qui ne donne rien pour décider.

L'or, ce sont les registres d'écueils, les justifications de design et toute convention différente du comportement par défaut. Les structures de dossiers et listes de dépendances que le modèle déduit du code sont du bruit.

### 60. Pourquoi soustraire dans les anciens prompts après une mise à jour du modèle ?

Les nouveaux modèles suivent mieux les instructions, donc les anciens contournements passent d'assurance à bruit : prefill, majuscules menaçantes, étapes trop détaillées et auto-vérifications répétées consomment de l'attention et peuvent faire agir le modèle quand il devrait demander.

Supprimez plutôt que réécrire : retirez menaces et auto-vérifications inefficaces, gardez contraintes métier, critères d'acceptation et exemples vraiment utiles.

### 61. Le prefill est interdit : qu'utiliser pour contrôler le format ?

Utilisez Structured Outputs pour contraindre le schéma, ou définissez un outil avec des champs enum pour que « sortie » devienne un appel d'outil. Pour supprimer les préambules, dites-le dans le system prompt.

Pour continuer une réponse tronquée, mettez le texte dans le message utilisateur et indiquez où il s'est arrêté. Pour éviter les refus, formulez clairement la demande au lieu de compter sur un début préfabriqué.

### 62. Où placer le point de cache pour économiser à chaque tour ?

Sur le dernier bloc qui reste identique entre requêtes. Si un bloc antérieur change, le hash du préfixe change et le tour suivant recalcule tout.

L'antipattern classique est l'horodatage : mettez une heure à la seconde en tête du system prompt et elle change chaque seconde, donc vous payez plein tarif toujours.

### 63. Pourquoi changer une définition d'outil invalide-t-il tout le cache ?

Les caches sont jugés par préfixes en couches : tools → system → messages. Un changement invalide cette couche et toutes les suivantes. Les outils étant en premier, un mot changé fait exploser les trois.

Traitez les définitions comme des artefacts de compilation : gelez-les pendant la session. S'il faut changer, acceptez « changer une fois, exploser une fois, recharger une fois », de préférence entre deux sessions.

### 64. Comment ordonner les prompts multi-tours pour profiter du cache ?

Placez le contenu statique d'abord dans l'ordre tools → system → messages. Les valeurs par requête — horodatages, IDs aléatoires, la date — vont à la fin du flux de messages.

Gardez l'historique en ajout seul : ne modifiez pas les anciens messages et ajoutez les instructions en cours de conversation comme message system, sans changer le champ system supérieur. Vérifiez les champs de cache dans usage à chaque tour.

### 65. Comment choisir des exemples qui remboursent leur coût en tokens ?

Trois critères : pertinents pour des cas réels, variés pour couvrir les limites sans enseigner de faux motifs, et structurés avec `<example>`, séparés des instructions.

En cas de doute, demandez au modèle de noter les candidats sur pertinence et diversité, puis tranchez à la main. Les exemples sont du contenu stable : placez-les dans le préfixe caché.

### 66. Comment monter un flux multi-fenêtres, et pourquoi est-ce meilleur que forcer une seule ?

Découpez le travail : la première fenêtre construit l'échafaudage, les tests et les scripts d'init ; les suivantes suivent la liste. Quand le contexte se vide, préférez une nouvelle fenêtre à une compaction forcée.

La version mûre a trois phases : research produit un document, plan produit un plan d'implémentation, implement suit le plan. Les humains ne relisent que les deux documents aux portes.

### 67. Pourquoi « montrer le prompt à un collègue » est-il le meilleur test ?

Parce qu'en écrivant et relisant votre propre prompt, votre cerveau comble le contexte manquant. Un collègue n'a pas ce cache ; là où il bloque, il manque quelque chose.

Avant de le passer, vérifiez trois choses : le format et les contraintes sont concrets ; les étapes dépendantes sont numérotées ; et quand vous demandez une action supplémentaire, le motif est expliqué.

### 68. Pourquoi dire à un modèle ce qu'il ne doit pas faire échoue-t-il souvent ?

Une interdiction dit où ne pas aller, pas où aller, donc le modèle devine autour de la zone interdite. Pour un format stable, énoncez la cible positive : au lieu de « pas de markdown », dites « réponds en paragraphes de prose fluide ».

Autre astuce : aligner le style. Un prompt rempli de listes markdown tend à produire du markdown. Écrivez le prompt dans le style que vous voulez recevoir.

### 69. Pourquoi un contexte soigneusement réglé peut-il perdre contre aucun réglage ?

Parce que plusieurs couches de middleware « évidemment raisonnables » peuvent s'annuler. Dans un test, un preset à trois couches de nettoyage et résumé a marqué 58 % en mémoire, puis 38 % au retest, pour le double du coût de ne rien faire.

Ne vous fiez pas au ressenti ; lancez des évaluations. Mêmes tâches, mêmes données, comparez votre preset à l'historique complet, notez seulement les sondes plantées, puis regardez la courbe de coût.

### 70. Pourquoi une instruction d'une phrase bat-elle souvent un long règlement ?

Plus le règlement est épais, moins chaque règle reçoit d'attention. Si une phrase suffit, n'écrivez pas un paragraphe ; précis et concis ne s'opposent pas : la verbosité est l'ennemi.

Le squelette : rôle, action concrète, livrable, critère vérifiable, une ligne de motif. Les flux complexes peuvent rester longs, mais chaque ligne doit travailler.

### 71. La phrase « le contexte est la mémoire du modèle » est-elle correcte ?

Pas tout à fait. La métaphore originale complète est working memory, mémoire de travail. Le contexte est immédiat, limité et perdu à l'extinction ; la mémoire est un stockage externe compilé dans le contexte à chaque requête.

Les deux canaux de Claude Code et les memory blocks de Letta montrent que mémoire et contexte sont deux couches à ne pas confondre.

### 72. Pourquoi Tobi a-t-il mis « savoir charger du contexte » dans l'évaluation de performance ?

Parce que charger du contexte est l'étape la plus souvent sautée au travail : on essaie deux fois, sans résultat, on revient à l'ancienne méthode, sans demander si le prompt était mauvais, le contexte insuffisant ou la deuxième tentative inexistante.

Mettre l'usage de l'IA et la compétence contexte dans la performance et la revue par les pairs en fait une exigence organisationnelle, pas un artisanat personnel. Mais c'est un récit managérial, pas une donnée mesurée : citez-le comme tel.

## 5. Où le contexte brûle de l'argent

### 73. Pourquoi le cache change-t-il le prix mais pas l'occupation de la fenêtre ?

Le cache est comme une ligne de cache CPU : il accélère la récupération mais n'économise pas un octet de mémoire. Le préfixe caché occupe toujours la fenêtre, l'attention reste divisée et la compaction se déclenche toujours près de la limite.

Tenez deux livres : l'occupation dans `/context`, la dépense dans `/usage`. La remise est sur la facture, pas dans la fenêtre.

### 74. Pourquoi chaque tour d'un chat multi-tours repaie-t-il tout l'historique ?

Les modèles n'ont pas de mémoire, donc chaque requête renvoie la session entière. Vous envoyez deux mots — « continue » — et le tour est facturé sur tout l'historique.

Au 50e appel d'outil, l'historique seul peut dépasser 150K tokens ; 50 tours équivalent à payer 1 275 entrées d'un tour. Le cache baisse le prix unitaire mais ne change pas cette forme composée.

### 75. Comment estimer ma dépense mensuelle de contexte ?

Trois ancrages : le déploiement entreprise tourne autour de 13 dollars par jour actif et 150–250 par mois ; avec Sonnet à 3 dollars par million de tokens, un contexte de 150K coûte environ 0,45 par tour et 30K environ 0,09 ; remplir une fenêtre 1M une fois va de 0,14 à 10 dollars.

Facture mensuelle ≈ tours actifs par jour × tokens d'entrée par tour × prix d'entrée × remise de cache. Avec un bon taux de réussite, la lecture coûte un dixième ; si instable, gardez une marge de 30–50 %.

### 76. Comment calculer et contrôler la facture de contexte multi-agents ?

Chat = 1x, un agent environ 4x, multi-agents environ 15x ; les équipes d'agents en mode plan tournent à 7x. Chaque teammate porte sa propre fenêtre et brûle ses propres tokens.

Leviers : étager l'effort selon la complexité ; plafonner les tokens de réflexion ; garder des équipes petites et éteindre chaque teammate dès qu'il a fini.

### 77. Où consulter le taux de réussite du KV-cache et comment l'améliorer ?

La ligne de statistiques de Claude Code indique requêtes, part d'entrée cachée, échecs et chaleur du cache. Côté API, lisez `cache_read_input_tokens`, `cache_creation_input_tokens` et `input_tokens` dans usage.

Le taux est les lectures de cache divisées par la somme des trois. Améliorez-le en stabilisant le préfixe — geler les outils, déplacer les horodatages à la fin, historique en ajout seul — pas en coupant des tokens.

### 78. Quand donner au cache un TTL d'une heure ?

Si cinq minutes suffisent, ne changez rien. Un TTL d'une heure commence à rentabiliser quand l'écart dépasse cinq minutes mais que la requête suivante arrive sûrement dans l'heure.

Prix : écrire un cache de cinq minutes coûte 1,25x l'entrée, celui d'une heure 2x, et lire 0,1x. En mélangeant, placez le segment d'une heure avant celui de cinq minutes.

### 79. Comment préchauffer le cache au démarrage pour améliorer la première réponse ?

Envoyez une requête avec `max_tokens: 0`, pour que l'API lise le prompt et écrive le cache au point de rupture, puis rende immédiatement sans générer de sortie.

Placez la rupture sur le dernier bloc partagé avec les requêtes réelles ; alignez thinking et effort ; utilisez une rupture explicite, pas le cache automatique. Le préchauffage peut lui-même facturer une écriture.

### 80. Quand une fenêtre d'un million est-elle abordable, et quand est-ce un piège ?

Alimenter un gros document en une fois vaut le coup : on remplit, on demande, on part, et on paie seulement ce remplissage. Mais la latence du premier token se voit : environ 22 secondes à 100K et 76 secondes au-delà de 800K.

Ne faites pas de 1M le défaut des sessions fréquentes : porter tout l'historique à chaque tour compose latence et coût, et au-delà de la moitié de l'occupation il ne reste que récupération ou compaction.

### 81. Comment l'exécution de code transforme-t-elle un travail de 150K tokens en 2K ?

Les définitions d'outils deviennent des fichiers ; l'agent liste le répertoire et ne lit que le nécessaire. Les données circulent de script en script dans un sandbox, donc les résultats intermédiaires n'entrent pas dans le modèle.

Deux économies : les manuels d'outils ne sont plus chargés entièrement et les sorties intermédiaires ne passent plus par le modèle. Le coût est l'isolation, les limites de ressources et la supervision du sandbox.

### 82. Pourquoi l'exécution la moins chère peut-elle être celle qui envoie le plus de tokens ?

À cause du cache. Envoyer près de 300K tokens par tour avec 97 % de réussite peut coûter 0,0063 dollar par tour ; couper agressivement paraît plus petit mais casse la remise et coûte plus cher.

Cela dépend d'un prix de cache bas et d'une charge précise : ce n'est pas une loi universelle. Si le prix du cache monte, la conclusion s'inverse. L'économie robuste est le plafonnement, pas la réécriture.

### 83. Pourquoi résumer l'historique coûte-t-il 50 % de plus que ne pas le résumer ?

Les tokens économisés ne couvrent pas la remise de cache détruite. L'historique complet coûte 0,11 par tour contre 0,24 pour le preset avec résumé, tandis que les sondes de mémoire donnent 92 % contre 38 % : plus cher et plus oublieux.

Le cache exige de renvoyer le contexte précédent inchangé. Résumer réécrit le préfixe, donc tout ce qui était remisé est repayé plein tarif.

### 84. Remplir une fenêtre d'un million : quel écart entre le moins cher et le plus cher ?

Avec les données de juin 2026, 71 fois : environ 0,14 dollar en bas et 10 en haut. L'écart vient surtout de la structure de prix, pas du niveau de capacité.

Le tableau chiffre un remplissage, pas un mois. Le coût mensuel se multiplie encore par le taux de réussite et le nombre de tours.

### 85. Pourquoi appuyer sur compacter brûle-t-il des milliers de tokens et plus de dix secondes ?

Parce que compacter est en soi une requête d'inférence complète : elle lit toute la session et génère un résumé. Une fenêtre de 150K produit 3 000 à 5 000 tokens de sortie et 5 à 15 secondes de latence réelle.

La sortie est facturée au prix de sortie, souvent plusieurs fois celui d'entrée, et la compaction réécrit le préfixe, forçant la reconstruction du cache. Si la continuité n'est pas nécessaire, `/clear` est moins cher.

### 86. Pourquoi deux fois plus de travail coûte-t-il sept fois plus, et est-ce rentable ?

Le multi-agent achète du calcul contre du taux de réussite ; l'usage de tokens explique environ 80 % de la variance des résultats. Les équipes d'agents de Claude Code en mode plan coûtent environ 7x tokens.

Jugez avec deux questions : la sortie peut-elle être acceptée indépendamment ? Les branches parallèles doivent-elles partager des décisions ? Si oui, un seul fil avec un bon contexte est plus sûr ; seul un travail indépendant et réellement parallèle justifie 15x.

### 87. Pourquoi ma fenêtre a-t-elle silencieusement rétréci après une mise à jour du modèle ?

Parce que le tokenizer a changé. Depuis Opus 4.7, le même texte peut compter jusqu'à 35 % de tokens en plus ; la taille de la fenêtre n'a pas bougé, le compteur si.

Lancez `/context` le jour de la mise à jour, comptez le même historique sur l'ancien et le nouveau modèle, et redéclarez budget et limites avec les nouveaux chiffres.

### 88. Pour économiser, couper le contexte ou changer de modèle d'abord ?

Dans l'ordre : vérifiez le taux de réussite du cache et corrigez placement et ruptures, c'est gratuit ; si le taux est sain et le prix du cache sous environ 0,55 dollar par million, coupez le contexte ; si le prix unitaire est trop élevé, changez de modèle ; si le modèle ne peut pas changer, ajoutez mémoire externe ou exécution de code.

Changez une variable à la fois et mesurez après chaque changement.

## 6. Comment savoir si le contexte est bon

### 89. Pourquoi n'y a-t-il toujours pas de benchmark accepté de qualité de contexte ?

Parce que « bon » n'est pas défini pour ce métier. Les échecs sont silencieux : la compaction jette des détails dont l'importance n'apparaît que plus tard, donc rien ne semble anormal sur le moment.

Les sondes mesurent la rétention mais pas l'utilisation, et les benchmarks existants ne capturent pas la dégradation en chaîne de dizaines de compactations avec perte en production. Sans réponse publique, votre propre standard est obligatoire.

### 90. Comment planter des sondes pour détecter quand un agent commence à oublier ?

Cinq étapes : plantez un fait vérifiable au tour zéro ; poussez la conversation au-delà du point de compaction avec de vraies questions ; posez une question qui exige ce fait ; jetez l'exécution si la compaction n'a pas eu lieu ; et faites noter par un juge aveugle à la configuration.

Plantez du concret comme « 300 millisecondes », pas des préférences vagues comme « l'utilisateur aime la concision ». En test, zéro compaction donnait tout bon ; après cinq ou six, seules trois sondes sur dix survivaient.

### 91. Quelles métriques révèlent si la compaction est bonne ou seulement en apparence ?

Le taux de compression ment : trois systèmes sont restés à 98–99 % tandis que la qualité allait de 3,35 à 3,70, et le plus agressif finissait dernier.

Regardez six dimensions : précision, conscience du contexte, empreinte, complétude, continuité et suivi des instructions. L'empreinte — se souvenir des fichiers lus ou modifiés — est la plus faible et la meilleure alarme.

### 92. Comment monter une supervision du contexte pour ma propre charge ?

Trois pièces : enregistrez le total de tokens de contexte par tour, en additionnant sans cache, lecture de cache et écriture de cache plutôt qu'en faisant confiance à `input_tokens` seul ; journalisez compactages et nettoyages avec seuils et longueur de résumé ; et gardez une ligne de statistiques cache et coût.

Avec cela, vous répondez à « à quel tour il est devenu bête » et « où est passé l'argent ».

### 93. Vingt ou trente trajectoires réelles : comment démarrer une évaluation minimale ?

Commencez avec 20 à 50 tâches réelles ; les changements précoces ont de gros effets et quelques cas suffisent. Le cycle : collecter les trajectoires, définir une notation vérifiable, stocker une base, changer une variable et garder un ensemble de rétention.

N'écrivez pas vous-même les réponses de référence ; extrayez des points atomiques de traitements humains réels pour que le juge note de façon fiable.

### 94. Comment noter rapidement un assemblage de contexte ?

Quatre questions : y a-t-il une mauvaise version (correction) ? Tous les prérequis sont-ils là (complétude) ? Quelle part est du bruit (taille) ? Peut-on continuer en cours de tâche (trajectoire) ?

L'ordre compte plus que la liste : la correction domine, le faux bat l'absent, l'absent bat le bruit. Ne coupez jamais la correction d'abord juste pour économiser des tokens.

### 95. Pourquoi 97 % disent que c'est important et seulement 4 % le font ?

L'écart est d'infrastructure, pas d'accord. 97 % disent que le contexte compte, mais seulement 4 % atteignent la maturité où le savoir compose ; seulement 42 % disent mesurer précisément la préparation à la production.

Évaluation, supervision et gouvernance sont là où les 97 % deviennent 4 %. Qui construit cette couche d'abord prend l'avantage.

### 96. La qualité globale est 97, pourquoi oublie-t-il encore en silence ?

Parce que la qualité globale mesure si la réponse semble bonne : prose, pertinence et format sont là, mais le fait oublié n'est pas dans la grille. En test, la qualité aveugle était de 97–99 % tandis que les sondes de mémoire étaient à 58 %.

L'acceptation doit noter uniquement les sondes. La qualité globale est un tableau de bord, pas une porte. La question est : le fait planté au tour zéro est-il encore disponible au tour onze ?

### 97. Pourquoi l'observabilité est-elle le plus grand point faible de l'ingénierie de contexte ?

Parce que les fournisseurs disent que le contexte compte mais donnent rarement une fenêtre pour regarder dans la fenêtre. `/context` montre l'occupation statique, pas la zone dynamique des messages, qui compte le plus.

Pire, l'instrumentation peut mentir : un ticket a rapporté `/context` affichant 1 553,9 % d'occupation. La solution est d'exporter les traces vers OpenTelemetry et de faire émettre à l'agent hypothèses et preuves en format structuré.

### 98. « Moins de 5 % des équipes ont des évaluations » est-il crédible ?

Le chiffre n'est pas crédible, mais le phénomène l'est probablement. Il vient du récit d'un praticien anonyme, sans taille d'échantillon ni méthode auditable.

Utilisez le test en trois étapes : qui l'a dit, qu'est-ce qui le corrobore, quel est le périmètre. Les 42 % de préparation mesurée du rapport sectoriel pointent dans la même direction. Traitez-le comme un témoignage, pas une statistique.

### 99. J'ai appris beaucoup de techniques : comment savoir laquelle marche dans mon scénario ?

Les techniques n'ont pas de vérité universelle, seulement « mon évaluation a-t-elle progressé ? ». Ne réglez pas au ressenti ; laissez l'évaluation décider.

Créez un jeu d'évaluation à partir d'incidents passés et de tests existants, lancez une matrice sur les assemblages candidats, changez une variable à la fois et ne gardez que ce qui améliore.

### 100. L'ingénierie de contexte passera-t-elle de mode comme celle des prompts ?

La moitié oui. Les techniques concrètes ont une durée de vie : où placer la rupture de cache, quels seuils choisir et quelles instructions mettre en gras se déprécient à chaque mise à jour du modèle.

L'autre moitié non : l'évaluation n'expire pas — plus le modèle est fort, plus le bon jugement sur la qualité est rare — ; et les problèmes difficiles non plus : les modèles comprennent bien les contextes complexes mais génèrent encore mal des sorties longues tout aussi complexes.
