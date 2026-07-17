# Session avec Tshiluka — Préparation (14 Juillet 2026)

> Ce qu'on a fait, ce qu'on a découvert, ce qu'il faut clarifier.

---

## 1. Ce qui est FONCTIONNEL (démo prête)

L'intégration Odoo → InfoFin tourne de bout en bout. Voici le pipeline complet :

| Étape | Ce que ça fait | Statut |
|-------|---------------|--------|
| 1. Authentification | Connexion XML-RPC à `INFOSET_TEST` | ✅ |
| 2. Sociétés → Départements | `res.company` → `Department.OdooCompanyId` | ✅ |
| 3. Comptes → Catégories | `account.account` (P&L uniquement) → `Category` avec FG auto-détecté | ✅ |
| 4. Écritures → Actuals | `account.move.line` → `OdooJournalLine` → agrégation `Actuals` | ✅ |
| 5. Budgets → Prévisions | `crossovered.budget.lines` → `Budget.ForecastAmount` | ✅ |

**Résultat concret** : 57 lignes de budget importées depuis Odoo, couvrant les 3 sociétés (INFOSET, GENISYS, AGMUX), pour 2026.

### Classification automatique des charges

On a découvert que les comptes Odoo d'Infoset ont un suffixe dans leur nom qui indique le type de coût :

| Suffixe dans le nom | → Classification |
|---------------------|-----------------|
| `Opex Fix` | Charges Fixes |
| `Opex Variable` | Charges Variables |
| `COS` | Coût des Ventes |

Exemple : `610001 | Janitorial Expenses- Opex Fix` → automatiquement classé en Charges Fixes. Aucune intervention manuelle nécessaire.

---

## 2. Ce qu'on a découvert en explorant l'instance

### La base INFOSET_TEST

| Métrique | Valeur |
|----------|--------|
| Comptes totaux | 2 585 |
| Comptes P&L | 883 |
| Comptes P&L avec transactions 2026 | 67 |
| Comptes avec budgets | 105 |
| Budgets (`crossovered.budget`) | 14 (2023–2026) |
| Lignes budgétaires | 307 |
- Les budgets sont nommés par département : "BUDGET ADMINISTRATION 2026", "BUDGET FPA 2026", etc.
- 10 centres analytiques (`account.analytic.account`) couvrant les départements : Cirrus, Genisys, Direction Générale, FPA, etc.

### Notre avis sur la base

`INFOSET_TEST` ressemble à une **copie de staging** (pas un bac à sable vide) :
- 4 ans de budgets (2023–2026)
- Nomenclature comptable réelle (codes RDC)
- Montants réalistes ($1.9M pour AGMUX, $574K pour Cloud, etc.)
- Classification manuelle des comptes (Opex Fix/Variable) — discipline opérationnelle

**Question pour Tshiluka** : `INFOSET_TEST` c'est la bonne base pour le pilote ? Ou on bascule sur la prod ?

---

## 3. Points à clarifier avec Tshiluka

### 3.1 Base de données

> *"On est connectés à `INFOSET_TEST`. C'est une copie récente de la prod ? Les données sont-elles à jour ? Pour le pilote, on utilise cette base ou on passe en production ?"*

### 3.2 Périmètre des budgets

> *"On voit 14 budgets dans Odoo, couvrant 2023 à 2026. On a synchronisé les prévisions 2026. On synchronise aussi les années précédentes pour l'historique, ou juste l'année en cours ?"*

Les budgets qu'on a trouvés :
- 2023 : Budget Cirrus
- 2024 : Budget GENISYS
- 2025 : 5 budgets (ADMINISTRATION, FPA, DIRECTION TECHNIQUE, DIRECTION GENERALE, GENISYS)
- 2026 : 5 budgets (ADMINISTRATION, FPA, DIRECTION GENERALE, MONETIQUE, GENISYS-CLOUD, AGMUX)

### 3.3 Structure des départements

> *"Dans Odoo, on voit 10 centres analytiques (Compte Cirrus, Compte Genisys, Direction Générale, FPA, etc.). Dans InfoFin, on a 7 départements. Est-ce que le mapping centre analytique → département vous paraît correct, ou vous voulez qu'on crée un département par centre analytique ?"*

Actuellement on agrège par société (tous les centres analytiques d'une même société → un seul département).

| Société | Centres analytiques | → Département InfoFin |
|---------|-------------------|----------------------|
| INFOSET SARL | Cirrus, DG, Direction Technique, FPA, Admin, Monétique, Project SD | INFOSET SARL - MONETIQUE |
| GENISYS | Genisys, Projet & SD | GENISYS - CLOUD |
| AGMUX SA | AGMUX-SAS | AGMUX |

### 3.4 Plan comptable — charges fixes vs variables

> *"On a remarqué que vos comptes ont des suffixes dans leurs noms : Opex Fix, Opex Variable, COS. On les utilise pour classer automatiquement les charges. Est-ce que cette convention est fiable et maintenue ? Y a-t-il des comptes qui pourraient être mal classés ?"*

### 3.5 Flux retour (InfoFin → Odoo)

> *"La vision à terme c'est que les demandes d'achat approuvées dans InfoFin créent des commandes dans Odoo. Quel module Odoo utilisez-vous pour les achats (Purchase, Accounting) ? On peut en discuter aujourd'hui ou on garde ça pour une prochaine session ?"*

### 3.6 Fournisseurs

> *"On a la capacité de synchroniser les fournisseurs depuis Odoo (`res.partner`). Vous les maintenez dans Odoo ? C'est toujours utile qu'on les importe dans InfoFin pour que les demandeurs puissent choisir dans la liste approuvée ?"*

### 3.7 Fréquence de synchronisation

> *"Actuellement la synchro est manuelle (bouton dans l'interface). On peut la programmer en automatique — quotidien (la nuit), ou plus fréquent. Qu'est-ce qui vous conviendrait pour le pilote ?"*

---

## 4. Ce qui est PRÊT pour la démo

- [x] Connexion Odoo vérifiée et fonctionnelle
- [x] Synchronisation complète (entreprises, comptes, écritures, budgets)
- [x] Interface de synchronisation avec barre de progression en temps réel
- [x] Dashboard avec KPIs (revenus, OPEX, EBIT, taux d'exécution)
- [x] Grille budgétaire avec comparaison Forecast vs Execution
- [x] Tableau des dépassements
- [x] Export Excel et PDF
- [x] Master Data : gestion des comptes, départements, utilisateurs
- [x] Circuit d'approbation des demandes d'achat

---

## 5. Prochaines étapes (après la session)

| Priorité | Action | Dépend de |
|----------|--------|-----------|
| 1 | Valider la base de données pour le pilote | Réponse de Tshiluka (#3.1) |
| 2 | Activer la synchronisation automatique quotidienne | Accord sur la fréquence (#3.7) |
| 3 | Synchroniser les fournisseurs Odoo → InfoFin | Confirmation (#3.6) |
| 4 | Corriger les ~35 comptes budgétés non mappés | Investigation des comptes manquants |
| 5 | Planifier le flux retour (demandes → commandes Odoo) | Discussion (#3.5) |

---

## Notes pour la démo

- **Login** : `admin.system@infoset.cd` / `admin`
- **URL API** : `http://localhost:5292`
- **URL UI** : `http://localhost:5173`
- **Point d'entrée démo** : Page Master Data → onglet "Odoo Sync" → bouton "Start Sync"
- **Durée synchro** : ~30-45 secondes (883 comptes + 6 363 écritures + budgets)
- **À montrer** : Dashboard après synchro → KPIs, graphiques, tableau des dépassements
