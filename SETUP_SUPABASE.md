# Studio Manager — Guide de configuration Supabase

## Étape 1 : Créer ton compte Supabase

1. Va sur **https://supabase.com** et clique sur **"Start your project"**
2. Connecte-toi avec ton **compte GitHub** (c'est le plus simple)
3. Autorise Supabase à accéder à ton compte GitHub

## Étape 2 : Créer un nouveau projet

1. Clique sur **"New Project"**
2. Remplis les champs :
   - **Organization** : ton nom ou le nom du studio
   - **Name** : `studio-manager`
   - **Database Password** : choisis un mot de passe solide et **note-le quelque part**, tu en auras besoin
   - **Region** : choisis **West EU (Paris)** pour de meilleures performances depuis la France
3. Clique sur **"Create new project"**
4. Attends ~2 minutes que le projet se configure

## Étape 3 : Récupérer tes clés API

Une fois le projet créé :

1. Va dans **Settings** (icône engrenage en bas à gauche) → **API**
2. Tu y trouveras 2 informations essentielles :
   - **Project URL** : ça ressemble à `https://xxxxxxx.supabase.co`
   - **anon public key** : une longue chaîne de caractères commençant par `eyJ...`

3. **Copie ces 2 valeurs**, tu les mettras dans le fichier `.env` du projet React

> ⚠️ **IMPORTANT** : Ne copie JAMAIS la `service_role key` dans le frontend. Elle donne un accès total à ta base de données. Seule la `anon key` est utilisée côté client.

## Étape 4 : Créer les tables

1. Va dans **SQL Editor** (icône dans la sidebar gauche)
2. Clique sur **"New Query"**
3. Copie-colle **l'intégralité** du fichier `supabase/schema.sql` que je t'ai fourni
4. Clique sur **"Run"** (ou Ctrl+Enter)
5. Tu devrais voir "Success. No rows returned" — c'est normal, ça veut dire que tout s'est bien créé

## Étape 5 : Vérifier les tables

1. Va dans **Table Editor** (icône table dans la sidebar)
2. Tu devrais voir 4 tables : `profiles`, `sessions`, `transactions`, `media`
3. Clique sur chaque table pour vérifier que les colonnes sont bien là

## Étape 6 : Configurer l'authentification

1. Va dans **Authentication** → **Providers**
2. Vérifie que **Email** est activé (c'est le cas par défaut)
3. Va dans **Authentication** → **URL Configuration**
4. Dans **Site URL**, mets : `http://localhost:5173` (pour le dev local)
5. Dans **Redirect URLs**, ajoute : `http://localhost:5173/**`

## Étape 7 : Créer le bucket de stockage

1. Va dans **Storage** (icône dans la sidebar)
2. Clique sur **"New Bucket"**
3. Crée un bucket nommé : `media`
4. **Décoche** "Public bucket" (on veut qu'il soit privé)
5. Clique sur **"Create bucket"**

## Étape 8 : Créer ton premier compte admin

1. Va dans **Authentication** → **Users**
2. Clique sur **"Add User"** → **"Create New User"**
3. Renseigne ton email et un mot de passe
4. Coche **"Auto Confirm User"**
5. Clique sur **"Create User"**
6. Copie l'**UUID** de l'utilisateur créé (colonne `UID`)
7. Va dans **Table Editor** → table `profiles`
8. Clique **"Insert Row"** et remplis :
   - `id` : colle l'UUID copié
   - `role` : `admin`
   - `full_name` : ton nom
   - `email` : ton email
9. Sauve — ton compte admin est prêt !

---

## Récapitulatif des valeurs à reporter dans le projet

Crée un fichier `.env` à la racine du projet React avec :

```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Remplace par tes vraies valeurs depuis Settings → API.

**Tu es prêt ! Lance le projet React et connecte-toi avec ton compte admin.**
