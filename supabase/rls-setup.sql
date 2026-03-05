-- ================================================================
-- Studio Manager — Configuration Supabase Phase 2
-- Exécute ce script dans l'éditeur SQL de Supabase
-- ================================================================

-- ── 1. Trigger : auto-créer un profil à l'inscription ──────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Activer RLS sur toutes les tables ───────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ── 3. Helper : vérifier si l'utilisateur courant est admin ───

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── 4. Politiques RLS — profiles ──────────────────────────────

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- Lecture : chacun voit son propre profil, l'admin voit tout
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Insertion : autorisée par le trigger (SECURITY DEFINER) et l'admin
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- Modification : chacun modifie le sien, l'admin modifie tout
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Suppression : admin uniquement
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (public.is_admin());

-- ── 5. Politiques RLS — sessions ──────────────────────────────

DROP POLICY IF EXISTS "sessions_select" ON sessions;
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
DROP POLICY IF EXISTS "sessions_update" ON sessions;
DROP POLICY IF EXISTS "sessions_delete" ON sessions;

CREATE POLICY "sessions_select" ON sessions FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "sessions_insert" ON sessions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "sessions_update" ON sessions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "sessions_delete" ON sessions FOR DELETE
  USING (public.is_admin());

-- ── 6. Politiques RLS — transactions ──────────────────────────

DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

-- Clients voient leurs transactions, admin voit tout (y compris dépenses sans client)
CREATE POLICY "transactions_select" ON transactions FOR SELECT
  USING (
    public.is_admin()
    OR client_id = auth.uid()
  );

CREATE POLICY "transactions_insert" ON transactions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "transactions_update" ON transactions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "transactions_delete" ON transactions FOR DELETE
  USING (public.is_admin());

-- ── 7. Politiques RLS — media ─────────────────────────────────

DROP POLICY IF EXISTS "media_select" ON media;
DROP POLICY IF EXISTS "media_insert" ON media;
DROP POLICY IF EXISTS "media_update" ON media;
DROP POLICY IF EXISTS "media_delete" ON media;

CREATE POLICY "media_select" ON media FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "media_insert" ON media FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = uploaded_by);

CREATE POLICY "media_update" ON media FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "media_delete" ON media FOR DELETE
  USING (public.is_admin());
