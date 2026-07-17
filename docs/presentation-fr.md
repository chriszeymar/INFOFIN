# InfoFin — Première Rencontre Client : Guide de Discussion
### Première conversation — parcourir la plateforme, puis ouvrir le dialogue

---

## Introduction — Donner le Ton

- Ceci est une discussion ouverte — nous voulons vous présenter ce que nous avons construit, mais surtout, nous voulons vos retours
- Rien n'est gravé dans le marbre — chaque décision est ouverte à la discussion
- Nous allons vous montrer la plateforme, vous expliquer la logique derrière, puis vous donner la parole pour vos impressions
- L'objectif aujourd'hui est l'alignement — s'assurer que nous construisons la bonne chose avant d'aller plus loin

---

## Le Problème (Tel Que Nous le Comprenons)

- Aujourd'hui, la gestion des dépenses se fait sur Excel — chaque département a sa propre feuille, pas de source unique de vérité
- Les demandes d'achat se font de manière informelle — pas de chaîne d'approbation structurée, pas de trace claire de qui a approuvé quoi
- Le FPA et le DG doivent rassembler manuellement les chiffres juste pour savoir où en est l'entreprise
- Le suivi budgétaire est réactif — on découvre qu'on a dépassé le budget après coup, pas avant

---

## Ce Que InfoFin Vise à Faire (Dans les Grandes Lignes)

- Un point central unique pour chaque demande d'achat dans chaque département
- Une chaîne d'approbation claire — chacun sait qui doit valider, et tout est enregistré
- Visibilité budgétaire en temps réel — voir où vous en êtes à tout moment, pas seulement en fin de mois
- Des tableaux de bord vivants qui remplacent les rapports que vous compilez manuellement aujourd'hui
- Nous n'allons pas passer en revue chaque fonctionnalité aujourd'hui — nous aborderons les grands morceaux et vous nous direz où approfondir

---

## La Structure Organisationnelle — Nous Avons Modélisé Ce Que Vous Avez Déjà

- **Business Units (BU)** — le côté générateur de revenus :
  - Banking & Digital : CIRRUS - DIGITAL, INFOSET SARL - MONETIQUE
  - IT & Cloud : GENISYS - CLOUD, AGMUX
- **Support Units (SU)** — le côté centre de coûts :
  - DG, Admin & Fin : DG, FPA, ADMIN & ACCOUNTING
- Chaque département est rattaché à son groupe BU ou SU pour les rapports agrégés — vous pouvez voir « Total Banking », « Total IT » ou « Total Groupe » en un coup d'œil

---

## Les Catégories Financières — Votre Plan Comptable

- Chaque ligne du fichier Excel existant est chargée dans le système :
  - **Revenus** (BU uniquement — ventes hardware, logiciels, cartes, plateformes digitales, financement Visa, etc.)
  - **Coût des Ventes** (BU uniquement — achats pour revente, production de cartes, services cloud, etc.)
  - **Coûts Fixes / OPEX** — salaires, loyer, assurances, permis, abonnements, etc.
  - **Coûts Variables / OPEX** — transport, voyages, marketing, honoraires professionnels, réparations, formation, etc.
- Organisé sous trois classifications : Admin & Finances, Technique & Opérations, Marketing & Ventes
- Le système calcule automatiquement la Marge Brute, le Total OPEX et l'EBIT
- Les données de base sont entièrement modifiables via l'interface — pas besoin de développeur pour ajouter ou modifier des catégories

---

## Le Circuit d'Approbation

- Chaque demande d'achat suit une chaîne d'approbation structurée :
  1. Un collaborateur soumet la demande — ce dont il a besoin, quelle catégorie, quel montant, quel fournisseur
  2. La demande va au Directeur de son département pour validation de la justification commerciale
  3. Ensuite au FPA — qui valide par rapport au budget et vérifie si les fonds sont disponibles
  4. Enfin au Directeur Général pour la signature finale
- Chaque étape est enregistrée — qui a approuvé, quand, avec quels commentaires — entièrement auditable
- Si quelqu'un refuse, le demandeur est notifié avec la raison

---

## Rôles & Accès — Comment Chaque Connexion est Délimitée

- Chaque utilisateur reçoit un compte lié à son rôle et son département
- Son affectation départementale détermine ce qu'il voit — automatiquement filtré, sans paramétrage manuel

| Rôle | Ce Qu'il Peut Faire | Ce Qu'il Voit |
|---|---|---|
| **Analyste Financier** | Créer et soumettre des demandes pour son département | Uniquement les données de son département |
| **Directeur** | Approuver/refuser les demandes de son département | Le budget complet et les dépenses de son département |
| **Réviseur FPA** | Valider par rapport au budget, approuver/refuser | Tous les départements — voit l'image complète |
| **Approbateur FPA / DG** | Autorité finale d'approbation | Tout, dans toute l'organisation |
| **Administrateur** | Gérer les données de base — catégories, utilisateurs, fournisseurs | Accès complet au système |

- La gestion des utilisateurs se fait via l'interface — ajouter des personnes, attribuer des rôles, activer ou désactiver des comptes

---

## Le Tableau de Bord — Ce Qui est Construit

- Tableau de bord personnalisable avec cartes KPI, graphiques et tableaux
- Affiche budget vs réel, catégories en dépassement, tendances des revenus et OPEX, ventilations par département
- Filtrer par année, par département, basculer entre les vues BU et SU
- Chaque utilisateur peut choisir les widgets qu'il souhaite voir
- Actuellement alimenté par des données d'exemple pour que vous puissiez voir la présentation et les capacités

---

## Intégration Odoo — La Vision

- C'est l'un des sujets les plus importants sur lesquels nous devons nous aligner
- **Le flux envisagé :**
  - Les demandes d'achat approuvées dans InfoFin sont transmises à Odoo pour les achats et le traitement des paiements
  - Les fournisseurs d'Odoo sont synchronisés vers InfoFin pour que les demandeurs puissent choisir dans la liste des fournisseurs approuvés
  - Les données de paiement réelles d'Odoo remontent dans InfoFin — pour comparer « ce qui a été demandé » avec « ce qui a été effectivement payé »
- **Contexte clé :** Nous comprenons qu'Odoo ne contient pas les données de prévision/budget — c'est exactement pourquoi InfoFin existe. La planification budgétaire et les prévisions sont ici, les données d'exécution réelles viennent d'Odoo

---

## Où Nous en Sommes Aujourd'hui

- Ce qui est construit : la plateforme centrale — connexion, rôles, circuit de demandes d'achat, structure budgétaire, tableau de bord
- Ce qui utilise des données d'exemple : le tableau de bord (prêt à être connecté aux données réelles une fois alignés sur la structure)
- La suite : vos retours déterminent les priorités

---

## Accès Démo (Pour Référence)

| Email | Mot de passe | Rôle | Portée |
|---|---|---|---|
| admin@infoset.cd | admin | Administrateur | Accès complet |
| analyst.cirrus@infoset.cd | pass | Analyste Financier | CIRRUS uniquement |
| reviewer@infoset.cd | pass | Réviseur FPA | Tous les départements |
| approver@infoset.cd | pass | Approbateur FPA | Tous les départements |

---

---

# Discussion — Questions Ouvertes

## Le Problème

- Est-ce que notre compréhension du processus actuel correspond à votre réalité ? Qu'est-ce qui nous manque ?
- Qu'est-ce qui est pire que ce que nous pensons ? Qu'est-ce qui est moins problématique ?
- Quel est le plus gros point de douleur dans votre processus actuel que nous n'avons pas encore abordé ?

---

## Structure Organisationnelle & Catégories

- La structure des départements est-elle correcte ? Manque-t-il des départements ?
- Les regroupements BU/SU ont-ils du sens par rapport à vos rapports actuels ?
- La structure des catégories correspond-elle à votre façon de penser les coûts ? Des reclassifications nécessaires ?
- Y a-t-il des catégories que vous suivez aujourd'hui et qui ne sont pas encore dans le système ?

---

## Circuit d'Approbation

- La chaîne d'approbation en 4 étapes (Demandeur → Directeur → FPA → DG) correspond-elle à votre processus réel ?
- Y a-t-il des exceptions — certains montants ou catégories qui sautent une étape ?
- Avez-vous besoin d'approbations parallèles (plusieurs personnes au même niveau) ou seulement séquentielles ?
- Qui peut soumettre des demandes — tout le monde, ou seulement des personnes désignées par département ?
- Que se passe-t-il quand quelqu'un est en congé — y a-t-il un délégué ou un approbateur suppléant ?

---

## Rôles, Accès & Gestion des Utilisateurs

- Ces cinq rôles correspondent-ils à la structure de votre équipe ? Des rôles manquants ?
- Les Directeurs devraient-ils voir uniquement leur département, ou les Directeurs BU devraient-ils voir tous les départements BU ?
- Une personne peut-elle avoir plusieurs rôles ? (ex : quelqu'un qui est à la fois Directeur ET fait la révision FPA)
- Le DG devrait-il pouvoir approuver à n'importe quelle étape, ou seulement à l'étape finale ?
- Avez-vous besoin d'un rôle en lecture seule — quelqu'un qui peut tout voir mais ne peut rien approuver ?
- Comment gérez-vous les personnes qui travaillent dans plusieurs départements ?
- Avez-vous besoin d'une intégration avec un annuaire existant (Active Directory, Google Workspace) ? Ou une connexion autonome est-elle suffisante ?
- Quelle est votre procédure quand quelqu'un quitte l'entreprise ou change de rôle — qui gère cela ?

---

## Tableau de Bord & Rapports

- Quels chiffres regardez-vous en premier chaque matin ?
- Quels rapports produisez-vous actuellement que vous voudriez voir en direct sur le tableau de bord ?
- Quels rapports présentez-vous au conseil d'administration que ce système devrait éventuellement produire ?
- Que manque-t-il au tableau de bord actuellement ?

---

## Intégration Odoo

- La séparation a-t-elle du sens — prévisions/budgétisation dans InfoFin, exécution/paiements dans Odoo ?
- Quels comptes alimentent quoi ? Synchronisons-nous tous les comptes, ou seulement certains ?
- Quels comptes Odoo correspondent à quelles catégories InfoFin ?
- Que manque-t-il dans Odoo ? Y a-t-il des dépenses qui se font en dehors d'Odoo — petite caisse, paiements manuels, transferts inter-sociétés ? Comment devrions-nous les gérer ?
- À quelle fréquence les données doivent-elles se synchroniser — en temps réel, quotidiennement, hebdomadairement ?
- Tenez-vous les fournisseurs dans Odoo aujourd'hui ? Est-ce la liste maîtresse des fournisseurs, ou les fournisseurs existent-ils aussi ailleurs ?
- Comment rapprochez-vous actuellement les dépenses planifiées des paiements réels ? À quoi ressemble ce processus ?

---

## Conformité & Processus

- Y a-t-il des exigences spécifiques de conformité ou d'audit que nous devons prendre en compte ?
- Comment fonctionnent les réallocations budgétaires aujourd'hui — qui approuve le transfert d'argent entre catégories ?
- Y a-t-il des considérations réglementaires ou fiscales qui devraient influencer la façon dont nous suivons les dépenses ?

---

## Déploiement & Prochaines Étapes

- Quel est un calendrier réaliste pour charger les données réelles et commencer à utiliser l'outil ?
- Quel département serait le meilleur groupe pilote ?
- Qui d'autre doit participer à la prochaine conversation ?
- Quelle est la chose que vous devriez voir avant de vous sentir à l'aise pour déployer cela ?
