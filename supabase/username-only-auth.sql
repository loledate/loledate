-- =============================================
-- LOL-EDATE — Auth solo por USUARIO (sin correo real)
-- Ejecutar en Supabase → SQL Editor
-- =============================================
--
-- IMPORTANTE (Dashboard, no SQL):
-- 1. Authentication → Providers → Email
--    - DESACTIVA "Confirm email"
--    - DESACTIVA "Secure email change" si aparece
-- 2. Authentication → Providers → desactiva Magic Link si está activo
-- 3. Authentication → URL Configuration → Site URL = tu dominio Vercel
--
-- Nota: Supabase Auth guarda un email interno ficticio por usuario
-- (usuario@users.loledate.app). Los usuarios NUNCA lo ven ni lo usan.

-- Username único en perfiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Rellenar username desde metadata en cuentas existentes
UPDATE profiles p
SET username = COALESCE(
  p.username,
  (SELECT raw_user_meta_data->>'username'
   FROM auth.users u
   WHERE u.id = p.user_id)
)
WHERE username IS NULL;

-- Índice único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (LOWER(username))
  WHERE username IS NOT NULL;

-- Guardar username al crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.set_profile_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username := (
      SELECT raw_user_meta_data->>'username'
      FROM auth.users
      WHERE id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_username ON profiles;
CREATE TRIGGER trg_profiles_username
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_username();

-- Trigger al registrarse: crear fila en profiles con username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (user_id, name, username, age, city)
  VALUES (
    NEW.id,
    v_username,
    v_username,
    18,
    'Madrid'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET username = EXCLUDED.username,
      name = COALESCE(profiles.name, EXCLUDED.name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ocultar emails reales en auth.users (solo dominio interno permitido)
-- Los usuarios con email real antiguo se pueden borrar manualmente desde
-- Authentication → Users si los creaste antes de este cambio.
