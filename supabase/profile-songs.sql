-- Canción de perfil (MP3 / MP4) + bucket de storage
-- Ejecutar en Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_song_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-songs',
  'profile-songs',
  true,
  10485760,
  ARRAY['video/mp4', 'audio/mp4', 'audio/mpeg', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Profile songs visibles publicamente" ON storage.objects;
CREATE POLICY "Profile songs visibles publicamente"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-songs');

DROP POLICY IF EXISTS "Usuario sube su cancion" ON storage.objects;
CREATE POLICY "Usuario sube su cancion"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-songs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Usuario actualiza su cancion" ON storage.objects;
CREATE POLICY "Usuario actualiza su cancion"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-songs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-songs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Usuario borra su cancion" ON storage.objects;
CREATE POLICY "Usuario borra su cancion"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-songs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
