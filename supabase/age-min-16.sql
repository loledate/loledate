-- Edad mínima: 16 años
-- Ejecutar en Supabase SQL Editor si ya tienes la base desplegada

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_age_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_age_check CHECK (age >= 16);
