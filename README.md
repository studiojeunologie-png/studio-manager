# 🎵 Studio Manager

Application de gestion de studio d'enregistrement — React + Supabase.

## Lancement rapide

### 1. Configurer Supabase
Suis le guide complet : **[SETUP_SUPABASE.md](./SETUP_SUPABASE.md)**

### 2. Installer les dépendances
```bash
cd studio-manager
npm install
```

### 3. Configurer l'environnement
```bash
cp .env.example .env
```
Puis édite `.env` avec tes clés Supabase (voir le guide).

### 4. Créer les tables
Copie le contenu de `supabase/schema.sql` dans le SQL Editor de Supabase et exécute-le.

### 5. Lancer le projet
```bash
npm run dev
```
L'app s'ouvre sur `http://localhost:5173`

## Structure du projet

```
studio-manager/
  src/
    components/       ← Composants réutilisables (Sidebar, Header, etc.)
    pages/            ← Pages principales (Dashboard, CRM, Calendar, etc.)
    layouts/          ← Layouts (AppLayout)
    hooks/            ← Hooks personnalisés (useAuth)
    lib/              ← Configuration Supabase, utilitaires
    styles/           ← CSS global + Tailwind
    App.jsx           ← Routes principales
    main.jsx          ← Point d'entrée
  supabase/
    schema.sql        ← Schéma complet de la BDD
  SETUP_SUPABASE.md   ← Guide de configuration Supabase
```

## Stack technique

| Outil | Usage |
|-------|-------|
| React + Vite | Framework frontend |
| Tailwind CSS | Styles utilitaires |
| Supabase | Backend (BDD, Auth, Storage) |
| TanStack Query | Gestion du cache/requêtes |
| React Router v6 | Navigation SPA |
| Lucide React | Icônes |
| React Hot Toast | Notifications |
