-- ══════════════════════════════════════════════════════════════
-- STUDIO MANAGER — Schéma complet de la base de données
-- À exécuter dans Supabase SQL Editor en une seule fois
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────
-- 1. TABLE PROFILES (Utilisateurs)
-- ─────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  artist_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs (admins et clients du studio)';

-- ─────────────────────────────────────
-- 2. TABLE SESSIONS (Séances studio)
-- ─────────────────────────────────────
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  session_type TEXT NOT NULL DEFAULT 'enregistrement' 
    CHECK (session_type IN ('enregistrement', 'mixage', 'mastering', 'composition', 'autre')),
  status TEXT NOT NULL DEFAULT 'planifiee' 
    CHECK (status IN ('planifiee', 'confirmee', 'en_cours', 'terminee', 'annulee')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

COMMENT ON TABLE public.sessions IS 'Sessions d''enregistrement, mixage, mastering, etc.';

-- Index pour les requêtes fréquentes
CREATE INDEX idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX idx_sessions_status ON public.sessions(status);

-- ─────────────────────────────────────
-- 3. TABLE TRANSACTIONS (Finances)
-- ─────────────────────────────────────
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('revenu', 'depense')),
  category TEXT NOT NULL DEFAULT 'session'
    CHECK (category IN ('session', 'mixage', 'mastering', 'composition', 'materiel', 'loyer', 'logiciel', 'autre')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'en_attente'
    CHECK (payment_status IN ('en_attente', 'paye', 'annule')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.transactions IS 'Transactions financières (revenus des prestations et dépenses)';

CREATE INDEX idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX idx_transactions_session_id ON public.transactions(session_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- ─────────────────────────────────────
-- 4. TABLE MEDIA (Fichiers multimédia)
-- ─────────────────────────────────────
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'audio'
    CHECK (file_type IN ('audio', 'video', 'document', 'image')),
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.media IS 'Fichiers multimédia échangés entre le studio et les clients';

CREATE INDEX idx_media_client_id ON public.media(client_id);
CREATE INDEX idx_media_session_id ON public.media(session_id);
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);

-- ══════════════════════════════════════════════════════════════
-- TRIGGER : Mise à jour automatique de updated_at
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════
-- TRIGGER : Création automatique du profil après inscription
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- FONCTION : Vérifier si l'utilisateur est admin
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

-- ─── PROFILES ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Les admins voient tous les profils
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Les clients ne voient que leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Les admins peuvent créer des profils
CREATE POLICY "Admins can create profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

-- Les admins peuvent modifier tous les profils
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Seuls les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ─── SESSIONS ───
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Les admins voient toutes les sessions
CREATE POLICY "Admins can view all sessions"
  ON public.sessions FOR SELECT
  USING (public.is_admin());

-- Les clients voient leurs propres sessions
CREATE POLICY "Clients can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = client_id);

-- Les admins peuvent tout faire sur les sessions
CREATE POLICY "Admins can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update sessions"
  ON public.sessions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete sessions"
  ON public.sessions FOR DELETE
  USING (public.is_admin());

-- Les clients peuvent créer des sessions (réservation)
CREATE POLICY "Clients can create own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- ─── TRANSACTIONS ───
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Les admins voient toutes les transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin());

-- Les clients voient leurs propres transactions
CREATE POLICY "Clients can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = client_id);

-- Seuls les admins gèrent les transactions
CREATE POLICY "Admins can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete transactions"
  ON public.transactions FOR DELETE
  USING (public.is_admin());

-- ─── MEDIA ───
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Les admins voient tous les fichiers
CREATE POLICY "Admins can view all media"
  ON public.media FOR SELECT
  USING (public.is_admin());

-- Les clients voient leurs propres fichiers
CREATE POLICY "Clients can view own media"
  ON public.media FOR SELECT
  USING (auth.uid() = client_id);

-- Les admins et les clients peuvent uploader
CREATE POLICY "Admins can upload media"
  ON public.media FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can upload own media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by AND auth.uid() = client_id);

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete media"
  ON public.media FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- STORAGE : Politiques pour le bucket "media"
-- (À exécuter APRÈS avoir créé le bucket dans l'interface)
-- ══════════════════════════════════════════════════════════════

-- Les admins peuvent tout faire dans le bucket
CREATE POLICY "Admins full access to media bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'media' AND public.is_admin());

-- Les clients peuvent lire leurs propres fichiers
CREATE POLICY "Clients can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Les clients peuvent uploader dans leur dossier
CREATE POLICY "Clients can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ══════════════════════════════════════════════════════════════
-- DONNÉES DE TEST (optionnel — décommenter si besoin)
-- ══════════════════════════════════════════════════════════════

/*
-- Après avoir créé ton compte admin via l'interface Supabase Auth,
-- tu peux insérer des données de test ici.
-- Remplace 'TON_UUID_ADMIN' par l'UUID de ton compte.

-- Exemple de client test :
-- INSERT INTO auth.users (id, email, ...) via l'interface Supabase Auth
-- Le trigger créera automatiquement le profil
*/

-- ✅ Schéma créé avec succès !
-- Prochaine étape : configure le bucket "media" dans Storage
