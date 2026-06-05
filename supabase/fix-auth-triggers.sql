DROP TRIGGER IF EXISTS on_auth_user_internal_confirm ON auth.users;

CREATE OR REPLACE FUNCTION public.auto_confirm_internal_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email LIKE '%@users.loledate.app' THEN
    IF NEW.email_confirmed_at IS NULL THEN
      NEW.email_confirmed_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_internal_confirm
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_internal_auth_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_safe_username TEXT;
BEGIN
  v_username := NULLIF(
    TRIM(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))),
    ''
  );

  IF v_username IS NULL THEN
    v_username := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  v_safe_username := v_username;

  BEGIN
    INSERT INTO public.profiles (user_id, name, username, age, city)
    VALUES (NEW.id, v_username, v_safe_username, 18, 'Madrid')
    ON CONFLICT (user_id) DO UPDATE
    SET
      username = COALESCE(profiles.username, EXCLUDED.username),
      name = COALESCE(NULLIF(profiles.name, ''), EXCLUDED.name);
  EXCEPTION
    WHEN unique_violation THEN
      v_safe_username := v_username || '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);
      INSERT INTO public.profiles (user_id, name, username, age, city)
      VALUES (NEW.id, v_username, v_safe_username, 18, 'Madrid')
      ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER FUNCTION public.auto_confirm_internal_auth_user() OWNER TO postgres;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
