# STUDIO MANAGER — Roadmap & Architecture Technique

> **Stack :** React (Vite) + Supabase  
> **Date :** Mars 2026  
> **Document confidentiel**

---

## Sommaire

1. [Vision du projet](#1-vision-du-projet)
2. [Inspirations UI & direction artistique](#2-inspirations-ui--direction-artistique)
3. [Stack technique](#3-stack-technique)
4. [Architecture de la base de données](#4-architecture-de-la-base-de-données)
5. [Détail des fonctionnalités](#5-détail-des-fonctionnalités)
6. [Roadmap de développement](#6-roadmap-de-développement)
7. [Structure du projet](#7-structure-du-projet)
8. [Sécurité & bonnes pratiques](#8-sécurité--bonnes-pratiques)
9. [Stratégie de déploiement](#9-stratégie-de-déploiement)

---

## 1. Vision du projet

Studio Manager est une application web complète conçue pour centraliser et optimiser la gestion d'un studio d'enregistrement. Elle répond à un besoin concret : remplacer les multiples outils dispersés (tableurs, emails, calendriers, transferts de fichiers) par une plateforme unique, fluide et professionnelle.

### Objectifs clés

- **Centralisation totale** — Une seule source de vérité pour clients, sessions, transactions et fichiers.
- **Double accès** — Interface complète pour l'admin, espace personnel pour chaque client.
- **Interconnexion des données** — Chaque session est liée à un client, chaque transaction à une session, chaque fichier à une session/transaction.
- **Interface modulable** — Dashboard personnalisable, calendrier interactif, navigation fluide entre les modules.
- **Stockage durable** — Gestion des fichiers multimédia avec stockage économique et pérenne.

### Les deux profils utilisateurs

| Profil | Accès |
|--------|-------|
| **Administrateur (Studio)** | Accès au CRM, calendrier, transactions, dashboard, médias. Gestion complète de l'activité. |
| **Client** | Espace personnel : ses sessions, ses transactions, ses fichiers, son calendrier filtré. |

---

## 2. Inspirations UI & direction artistique

Les interfaces suivantes servent de références visuelles pour le design de Studio Manager. Elles illustrent les principes de design à appliquer : navigation latérale claire, cartes de données colorées, espacement aéré et hiérarchie visuelle forte.

> Les images de référence sont disponibles dans `/docs/ui-references/` (3 captures : SkillSet dashboard, OpenStock dashboard, HRM fiche détaillée).

### Référence 1 — Dashboard modulaire (SkillSet)

**Éléments à retenir :**
- **Sidebar claire et organisée** — Navigation verticale avec icônes et labels, séparation visuelle des sections, bouton d'upgrade en bas.
- **Bannière d'accueil personnalisée** — Message de bienvenue avec le nom de l'utilisateur, crée une expérience chaleureuse.
- **Cartes de contenu colorées** — Chaque carte a un fond de couleur douce, des barres de progression et des indicateurs visuels.
- **Calendrier intégré en sidebar** — Mini-calendrier dans le panneau latéral droit, idéal pour les prochaines sessions.
- **Planning hebdomadaire** — Vue semaine avec créneaux horaires, transposable directement au calendrier des sessions.

### Référence 2 — Dashboard KPI (OpenStock)

**Éléments à retenir :**
- **Sidebar sombre contrastée** — Fond foncé avec texte clair, profil utilisateur en bas, sections regroupées (Menu, Quick Actions, Settings).
- **KPI cards en haut de page** — 4 indicateurs clés avec code couleur, pourcentages de variation et badges. Idéal pour le CA, sessions du mois, bénéfice et sessions à venir.
- **Onglets Quick Access** — Accès rapide par onglets (Todos, Contacts, Deals) transposable en (Sessions, Clients, Transactions).
- **Barre de recherche globale** — Recherche unifiée en haut à droite, applicable à toutes les sections de l'application.

### Référence 3 — Fiche détaillée (HRM)

**Éléments à retenir :**
- **Bannière profil avec gradient** — Header coloré avec photo, nom et rôle. Parfait pour la fiche client dans le CRM.
- **Navigation par onglets verticaux** — Menu contextuel (General Info, Job, Notes…) transposable en (Infos, Sessions, Transactions, Fichiers) pour chaque client.
- **Données en grille éditable** — Informations présentées en paires clé/valeur sur 2 colonnes, avec bouton d'édition par section.
- **Sections séparées avec titres et icônes** — Chaque bloc (Basic Info, Work) est clairement délimité, facilitant lecture et maintenance.

### Synthèse : direction artistique

| Principe | Application Studio Manager |
|----------|---------------------------|
| Sidebar fixe | Navigation principale à gauche avec icônes + labels, profil admin/client en bas, sections regroupées logiquement. |
| Palette de couleurs | Violet/indigo comme couleur primaire (inspiré Réf.1), accents colorés pour les statuts et types de sessions. |
| KPI cards | 4 indicateurs en haut du dashboard (CA, sessions, bénéfice, à venir) avec variations et code couleur (inspiré Réf.2). |
| Fiches détaillées | Bannière gradient + onglets verticaux pour les profils clients, avec données en grille éditable (inspiré Réf.3). |
| Espacement aéré | Marges généreuses, border-radius arrondis, ombres légères sur les cartes pour un rendu moderne et lisible. |
| Interactivité | Drag & drop sur le calendrier et le dashboard, transitions fluides, hover states sur tous les éléments cliquables. |
| Mode sombre | Option future : la sidebar sombre de Réf.2 peut servir de base pour un thème dark complet. |

---

## 3. Stack technique

| Besoin | Solution | Justification |
|--------|----------|---------------|
| Frontend | React + Vite | Rapide, grande communauté, écosystème riche de composants (calendrier, drag & drop, graphiques). |
| UI / CSS | Tailwind CSS + shadcn/ui | Design système moderne et personnalisable, composants accessibles prêts à l'emploi. |
| Routing | React Router v6 | Navigation SPA fluide avec routes protégées selon le rôle (admin/client). |
| State | TanStack Query | Gère le cache, la synchronisation serveur et les requêtes Supabase efficacement. |
| Backend | Supabase | PostgreSQL, Auth, Storage, Realtime, Edge Functions — tout en un seul service. |
| Base de données | PostgreSQL (Supabase) | Modèle relationnel idéal pour les liens clients-sessions-transactions-fichiers. |
| Auth | Supabase Auth | Gestion des comptes, rôles (admin/client), tokens JWT, récupération de mot de passe. |
| Stockage | Supabase Storage | Stockage objet pour fichiers multimédia avec contrôle d'accès par bucket (RLS). |
| Calendrier | FullCalendar.js | Composant React mature, événements drag & drop, vues mois/semaine/jour. |
| Dashboard | react-grid-layout | Grille draggable et redimensionnable pour les modules du dashboard personnalisable. |
| Graphiques | Recharts | Graphiques React natifs, légers et bien intégrés pour les stats du dashboard. |
| Hébergement | Vercel (gratuit) | Déploiement automatique depuis GitHub, CDN mondial, parfait pour React/Vite. |

---

## 4. Architecture de la base de données

Le schéma PostgreSQL repose sur 4 tables principales interconnectées via des clés étrangères. Chaque table dispose de Row Level Security (RLS) pour garantir que les clients ne voient que leurs propres données.

### Table `profiles` (Utilisateurs)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Référence `auth.users.id` de Supabase |
| `role` | TEXT | `'admin'` ou `'client'` — détermine les accès |
| `full_name` | TEXT | Nom complet de l'utilisateur |
| `email` | TEXT | Email (synchronisé avec Supabase Auth) |
| `phone` | TEXT | Téléphone |
| `artist_name` | TEXT | Nom d'artiste (clients uniquement) |
| `notes` | TEXT | Notes internes (visibles admin seulement) |
| `avatar_url` | TEXT | URL de la photo de profil |
| `created_at` | TIMESTAMPTZ | Date de création du compte |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

### Table `sessions` (Séances)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Identifiant unique de la session |
| `client_id` | UUID (FK) | Référence `profiles.id` — le client concerné |
| `title` | TEXT | Titre ou description courte de la session |
| `session_type` | TEXT | `'enregistrement'`, `'mixage'`, `'mastering'`, `'composition'`, `'autre'` |
| `status` | TEXT | `'planifiee'`, `'confirmee'`, `'en_cours'`, `'terminee'`, `'annulee'` |
| `start_time` | TIMESTAMPTZ | Date et heure de début |
| `end_time` | TIMESTAMPTZ | Date et heure de fin |
| `notes` | TEXT | Notes spécifiques à la session |
| `created_at` | TIMESTAMPTZ | Date de création de l'entrée |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

### Table `transactions` (Transactions)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Identifiant unique |
| `client_id` | UUID (FK) | Référence `profiles.id` (NULL si dépense interne) |
| `session_id` | UUID (FK) | Référence `sessions.id` (optionnel) |
| `type` | TEXT | `'revenu'` ou `'depense'` |
| `category` | TEXT | `'session'`, `'mixage'`, `'mastering'`, `'composition'`, `'materiel'`, `'loyer'`, `'logiciel'`, `'autre'` |
| `amount` | NUMERIC(10,2) | Montant en euros |
| `date` | DATE | Date de la transaction |
| `description` | TEXT | Description détaillée |
| `payment_status` | TEXT | `'en_attente'`, `'paye'`, `'annule'` |
| `notes` | TEXT | Notes additionnelles |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

### Table `media` (Fichiers multimédia)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Identifiant unique |
| `uploaded_by` | UUID (FK) | Référence `profiles.id` — qui a uploadé |
| `client_id` | UUID (FK) | Référence `profiles.id` — client concerné |
| `session_id` | UUID (FK) | Référence `sessions.id` (optionnel) |
| `transaction_id` | UUID (FK) | Référence `transactions.id` (optionnel) |
| `file_name` | TEXT | Nom original du fichier |
| `file_type` | TEXT | `'audio'`, `'video'`, `'document'`, `'image'` |
| `file_url` | TEXT | URL Supabase Storage |
| `file_size` | BIGINT | Taille en octets |
| `notes` | TEXT | Description ou notes |
| `created_at` | TIMESTAMPTZ | Date d'upload |

### Relations entre les tables

- **profiles → sessions** : Un client peut avoir plusieurs sessions.
- **profiles → transactions** : Un client peut avoir plusieurs transactions.
- **sessions → transactions** : Une session peut être liée à une transaction (facturation).
- **sessions → media** : Une session peut avoir plusieurs fichiers associés.
- **transactions → media** : Une transaction peut avoir une pièce jointe (facture, reçu).
- **profiles → media** : Chaque fichier est lié à un client et à un uploader.

---

## 5. Détail des fonctionnalités

### 5.1 CRM (Admin uniquement)

Le module CRM est le centre de gestion des clients. Il offre une vue en liste complète avec recherche intelligente en temps réel (par nom, nom d'artiste, email, téléphone).

- **Recherche intelligente :** Filtrage instantané sur tous les champs du profil client pendant la saisie.
- **Fiche client détaillée :** Boîte de dialogue modale pour créer/éditer un client avec tous ses champs, plus un aperçu de ses sessions, transactions et fichiers liés.
- **Gestion des accès :** Réinitialisation du mot de passe, désactivation de compte, envoi d'invitation par email via Supabase Auth.
- **Actions rapides :** Suppression, envoi d'email, création de session depuis la fiche client.

### 5.2 Calendrier interactif

Le calendrier est accessible aux admins et aux clients (filtré pour les clients). Il repose sur FullCalendar.js avec synchronisation temps réel via Supabase Realtime.

- **Vues multiples :** Mois, semaine, jour avec navigation fluide.
- **Création par clic :** Cliquer sur un créneau ouvre une boîte de dialogue pré-remplie avec la date/heure.
- **Drag & drop :** Déplacer et redimensionner les sessions directement sur le calendrier.
- **Boîte de dialogue complète :** Client (sélecteur intelligent), type de séance, date/heure début et fin, statut, notes, fichier joint.
- **Code couleur :** Chaque type de session a sa couleur pour une lecture rapide.
- **Vue client :** Le client ne voit que ses propres sessions avec un calendrier en lecture seule ou avec possibilité de réservation selon la configuration.

### 5.3 Transactions (Admin uniquement)

Ce module gère l'ensemble des flux financiers du studio : revenus liés aux prestations et dépenses matérielles.

- **Double nature :** Chaque transaction est un « revenu » (prestation) ou une « dépense » (matériel, loyer, etc.).
- **Liaison session :** Une transaction de type prestation peut être rattachée à une session spécifique pour traçabilité complète.
- **Boîte de dialogue :** Client (sélecteur), montant, catégorie, date, statut de paiement, session rattachée, notes.
- **Filtres avancés :** Par période, type, catégorie, client, statut de paiement.
- **Visibilité client :** Le client voit ses propres transactions dans son espace personnel.

### 5.4 Dashboard (Admin uniquement)

Le dashboard est une page d'accueil personnalisable composée de modules repositionnables et redimensionnables grâce à react-grid-layout.

- **Modules disponibles :** Chiffre d'affaires (graphique), dernières transactions, dernières dépenses, bénéfice net, prochaines sessions, sessions du mois, clients fréquents.
- **Personnalisation :** Chaque module peut être déplacé par drag & drop et redimensionné. La disposition est sauvegardée dans le profil admin.
- **Filtres temporels :** Sélecteur de période global (semaine, mois, année) qui affecte tous les modules simultanément.
- **Navigation directe :** Cliquer sur un module redirige vers la section concernée (ex: cliquer sur « prochaines sessions » ouvre le calendrier).
- **Temps réel :** Les données se mettent à jour automatiquement grâce à Supabase Realtime.

### 5.5 Média / Drive

Le module Média centralise tous les échanges de fichiers entre le studio et ses clients, avec un stockage durable via Supabase Storage.

- **Upload intelligent :** Chaque upload déclenche une boîte de dialogue pour renseigner la session rattachée, la transaction rattachée, le type de fichier et des notes.
- **Organisation :** Les fichiers sont organisés par client et par session pour une navigation claire.
- **Types supportés :** Audio (WAV, MP3, FLAC), vidéo (MP4, MOV), documents (PDF, DOCX), images (PNG, JPG).
- **Contrôle d'accès :** Les clients ne voient que leurs fichiers. Les admins voient tout.
- **Lecture en ligne :** Lecteur audio/vidéo intégré pour prévisualiser sans télécharger.
- **Buckets Supabase :** Un bucket privé par client avec des politiques RLS pour la sécurité.

---

## 6. Roadmap de développement

Le développement est découpé en 6 phases progressives. Chaque phase produit un résultat fonctionnel testable avant de passer à la suivante.

### Phase 1 : Fondations — Semaine 1-2

- [x] Initialiser le projet React + Vite + Tailwind + shadcn/ui
- [x] Créer le projet Supabase et configurer les tables SQL
- [x] Mettre en place Supabase Auth (inscription, connexion, rôles)
- [x] Créer le layout principal : sidebar, header, routing protégé
- [x] Configurer TanStack Query pour les requêtes Supabase
- [ ] Déployer la v1 sur Vercel (CI/CD automatique via GitHub)

### Phase 2 : CRM & Gestion clients — Semaine 3-4

- [ ] Page liste des clients avec recherche intelligente temps réel
- [ ] Boîte de dialogue création/édition client complète
- [ ] Fiche client détaillée avec aperçu sessions/transactions/fichiers
- [ ] Gestion des accès : reset mot de passe, invitation email
- [ ] Suppression de compte avec gestion des données liées
- [ ] Politiques RLS pour isoler les données par client

### Phase 3 : Calendrier & Sessions — Semaine 5-6

- [ ] Intégrer FullCalendar.js avec vues mois/semaine/jour
- [ ] Boîte de dialogue de création/édition de session complète
- [ ] Drag & drop pour déplacer et redimensionner les sessions
- [ ] Code couleur par type de session
- [ ] Synchronisation temps réel via Supabase Realtime
- [ ] Vue filtrée pour l'espace client

### Phase 4 : Transactions & Finances — Semaine 7-8

- [ ] Page transactions avec liste et filtres avancés
- [ ] Boîte de dialogue complète : montant, catégorie, client, session liée
- [ ] Distinction revenus/dépenses avec indicateurs visuels
- [ ] Liaison transaction-session pour traçabilité
- [ ] Visibilité des transactions dans l'espace client
- [ ] Export des données (optionnel : CSV)

### Phase 5 : Dashboard personnalisable — Semaine 9-10

- [ ] Grille react-grid-layout avec modules drag & drop
- [ ] Module chiffre d'affaires (Recharts : graphique en barres/lignes)
- [ ] Modules dernières transactions, dépenses, bénéfice
- [ ] Modules sessions à venir et sessions du mois
- [ ] Module clients fréquents
- [ ] Filtres temporels globaux + sauvegarde de la disposition
- [ ] Navigation cliquable vers les sections concernées

### Phase 6 : Média & Drive — Semaine 11-12

- [ ] Configuration des buckets Supabase Storage avec RLS
- [ ] Interface d'upload avec boîte de dialogue de métadonnées
- [ ] Explorateur de fichiers organisé par client/session
- [ ] Lecteur audio/vidéo intégré
- [ ] Téléchargement sécurisé avec URLs signées
- [ ] Espace client filtré sur ses propres fichiers

---

## 7. Structure du projet

```
studio-manager/
  src/
    components/         ← Composants réutilisables (boutons, modals, tableaux)
    pages/              ← Pages principales (Dashboard, CRM, Calendar, etc.)
    layouts/            ← Layouts (AdminLayout, ClientLayout)
    hooks/              ← Hooks personnalisés (useAuth, useSessions, etc.)
    lib/                ← Configuration Supabase, utilitaires
    stores/             ← State global si nécessaire
    styles/             ← Fichiers CSS/Tailwind globaux
    App.jsx             ← Routes principales et providers
    main.jsx            ← Point d'entrée
  public/               ← Assets statiques
  supabase/
    migrations/         ← Scripts SQL de création des tables
    seed.sql            ← Données de test
  .env                  ← Variables Supabase (VITE_SUPABASE_URL, etc.)
  package.json
  vite.config.js
  tailwind.config.js
```

---

## 8. Sécurité & bonnes pratiques

### Row Level Security (RLS)

Chaque table Supabase dispose de politiques RLS qui garantissent que les clients ne peuvent accéder qu'à leurs propres données. Les admins ont accès à toutes les données. Ces politiques sont la couche de sécurité principale de l'application.

### Authentification

Supabase Auth gère les tokens JWT, le rafraîchissement automatique des sessions, et la récupération de mot de passe par email. Le rôle de chaque utilisateur est stocké dans la table `profiles` et accessible dans les politiques RLS.

### Stockage sécurisé

Les fichiers multimédia sont stockés dans des buckets Supabase Storage avec des politiques d'accès. Les URLs de téléchargement sont signées et temporaires pour éviter le partage non autorisé.

### Variables d'environnement

Les clés Supabase (URL du projet et clé publique anon) sont stockées dans un fichier `.env` et préfixées par `VITE_` pour être accessibles côté client. La clé `service_role` ne doit **jamais** être exposée côté client.

### Bonnes pratiques

- ✓ Validation côté client ET côté serveur (via les contraintes PostgreSQL).
- ✓ Pas de logique sensible côté client — toute autorisation passe par les politiques RLS.
- ✓ Limiter la taille des uploads via les politiques de bucket Supabase Storage.
- ✓ Auditer les accès en activant les logs Supabase pour tracer les actions critiques.
- ✓ Sauvegardes automatiques — activées par défaut sur les plans Supabase payants.

---

## 9. Stratégie de déploiement

### Environnements

| Environnement | Usage | URL |
|---------------|-------|-----|
| Développement | Tests locaux, nouvelles fonctionnalités | `localhost:5173` |
| Staging | Tests avant mise en production | `staging.studio-manager.vercel.app` |
| Production | Version live pour les utilisateurs | `studio-manager.vercel.app` |

### Workflow de déploiement

Le déploiement suit un flux Git classique connecté à Vercel :

1. **Développement local** — Coder et tester sur la branche `feature/`.
2. **Pull Request** — Ouvrir une PR vers la branche `main`. Vercel génère un preview automatique.
3. **Review & merge** — Vérifier le preview, merger si tout est bon.
4. **Déploiement auto** — Vercel déploie automatiquement en production après le merge.

### Coûts estimés

| Service | Plan | Coût mensuel |
|---------|------|-------------|
| Supabase (BDD + Auth + Storage) | Free → Pro | 0€ → 25€/mois |
| Vercel (Hébergement frontend) | Hobby → Pro | 0€ → 20€/mois |
| Domaine personnalisé | Optionnel | ~10€/an |
| **Total démarrage** | — | **0€ (100% gratuit)** |
| **Total production** | — | **~45€/mois** |

---

> **Prochaine étape :** Valider cette roadmap, puis passer à la Phase 2 — développement du module CRM & gestion des clients.
