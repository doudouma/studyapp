---
summary: "Une app de barre d'état Windows open source qui écoute les cris nocturnes et interrompt les joueurs bruyants pour garder la maison au calme."
tags: [Surveillance audio, App de bureau, Open source, Contrôle parental, Créé avec Claude]
facts:
  - key: author
    value: u/omricn
  - key: platforms
    value: Windows
  - key: version
    value: v1.1.0
    highlight: true
  - key: price
    value: Gratuit (open source)
  - key: offline
    value: 100 % local (aucun audio stocké)
---

## De quoi il s'agit

[S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) (Sound Trigger Focus Utility) est un utilitaire de barre d'état Windows open source conçu pour freiner les cris involontaires de pleine nuit des joueurs casqués. Créé par le développeur u/omricn avec Claude Code, l'app surveille en continu l'entrée du microphone en local, distingue la parole normale d'un cri à plein volume grâce à une calibration personnalisée, et déclenche des interruptions immédiates du bureau dès que le seuil de volume est franchi.

## Proposition de valeur

L'outil remplace les remontrances verbales ou les coupures réseau brutales par une boucle de rétroaction immédiate, déterministe et convenue d'avance :

- **Calibration adaptative en 3 étapes** : au premier lancement, l'app invite l'utilisateur à rester silencieux, à parler normalement puis à crier, établissant ainsi une plage dynamique de référence précise.
- **Sanctions graduées** : le premier cri réduit le jeu actif, déclenche un effet sonore et affiche un popup plein écran impossible à spammer, avec un bouton de fermeture mobile exigeant 4 clics ; les récidives envoient immédiatement l'utilisateur sur le bureau pendant 10 secondes.
- **Réglages et audit protégés par PIN** : les ajustements de seuil, la planification et les interrupteurs nécessitent un PIN configuré par le parent, appuyé par un graphique d'incidents qui enregistre chaque déclenchement.
- **Traitement local respectueux de la vie privée** : calcule la sonorité RMS toutes les 20 ms et jette instantanément les tampons audio, sans enregistrer, stocker ni transmettre la moindre télémétrie.
- **Plages horaires programmées** : ajoutées en v1.1.0, elles permettent de définir des fenêtres actives précises pour que le jeu diurne normal ne soit pas perturbé.

## Ce qu'il peut remplacer

| Logiciel cible | Faisabilité | Verdict et contexte d'usage |
| --- | --- | --- |
| Suites commerciales de contrôle parental | Moyenne | Plus adapté pour imposer une limite de bruit ciblée, sans espionnage intrusif ni abonnement. |
| Pertes de paquets / coupures Wi-Fi au niveau du routeur | Élevée | Bien plus chirurgical ; évite la rage liée au lag tout en gardant internet pour les tâches silencieuses. |
| Plugins noise gate / câbles audio virtuels | Faible | Les câbles virtuels ne font que couper ou couper le son de sortie Discord, sans sanctionner le cri lui-même. |
| Sonomètres matériels | Partielle | Élimine les voyants muraux physiques au profit d'une interruption directe au niveau du système. |

## Réalités et limites actuelles

- **Failles de contournement** : comme l'ont souligné des membres de la communauté, il suffit de couper l'interrupteur physique du micro avant de crier, ou de tromper la calibration en soufflant dans le micro.
- **Exclusivité OS** : pour l'instant limité aux environnements de bureau Windows ; ne prend pas en charge les consoles comme PlayStation ou Xbox.
- **Symptôme comportemental vs. cause profonde** : le développeur reconnaît que l'app apprend aux joueurs à crier plus discrètement plutôt qu'à réguler leurs émotions tard le soir.
- **Perturbation des parties coopératives** : réduire le jeu ou éjecter le joueur vers le bureau dans les titres multijoueurs compétitifs (ex. matchs classés) pénalise aussi les coéquipiers.

## Verdict

> **Recommandation principale**
> [S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) est un utilitaire ingénieux et délicieusement mesquin, qui fonctionne mieux comme un « contrat social » explicite que comme un logiciel espion déguisé. Si votre foyer subit des explosions nocturnes causées par le casque pendant les marathons de jeu des vacances, il offre une rétroaction pavlovienne instantanée sans aucun compromis sur la confidentialité des données.

## Cycle de développement et d'itération

Le développeur a construit l'utilitaire avec Claude Code pour transformer rapidement un irritant domestique en outil publiable en une soirée. Les retours de la communauté ont immédiatement dicté le rythme des versions.

| Étape | Modèle / Outil | Axe de travail |
| --- | --- | --- |
| Architecture initiale et UI | Claude Code | Harnais de barre d'état Windows, sondage de sonorité toutes les 20 ms, placement dynamique du bouton |
| Version v1.0.0 | Claude Code | Panneau verrouillé par PIN, visualiseur d'historique des déclenchements, assistant de calibration |
| Correctif v1.1.0 | Claude Code | Intégration de plages programmées de surveillance active/passive d'après les suggestions Reddit |

## Métriques et monétisation

- **Prix** : 100 % gratuit et open source sur un dépôt GitHub public.
- **Adoption** : plus de 3 600 upvotes et 700+ commentaires en quelques semaines après la publication sur Reddit.
- **Monétisation** : aucune ; distribué uniquement comme utilitaire communautaire et vitrine du développeur.

## Accueil de la communauté et débats clés

Le post a suscité des débats intenses, mêlant philosophie éducative et styles d'écriture IA :

- **Ingénierie vs. éducation traditionnelle** : les commentaires se sont divisés entre l'éloge d'une « éducation héroïque et bienveillante par les conséquences naturelles » et la critique d'un « collier électrique numérique » pour des parents réticents à confisquer les consoles.
- **Tactiques de troll alternatives** : des sysadmins vétérans et des parents ont partagé des représailles éprouvées, comme configurer les points d'accès pour perdre aléatoirement 30 % des paquets des consoles ou révoquer les baux DHCP du routeur à minuit.
- **Détection des tics d'écriture IA** : plusieurs commentateurs ont relevé la dépendance du post aux marqueurs stylistiques typiques de Claude — notamment l'expression « load-bearing » —, lançant un méta-débat sur le fait que les développeurs écrivent désormais naturellement au rythme des LLM avec lesquelles ils collaborent.
