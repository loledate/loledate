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

DROP TRIGGER IF EXISTS on_auth_user_internal_confirm ON auth.users;
CREATE TRIGGER on_auth_user_internal_confirm
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_internal_auth_user();
