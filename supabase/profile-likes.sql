-- Likes de perfil y reputación (ejecutar en Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  liked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(liker_id, liked_user_id),
  CHECK (liker_id != liked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_liked_user ON profile_likes(liked_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_liker ON profile_likes(liker_id);

ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes visibles para autenticados"
  ON profile_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuario da like a perfil"
  ON profile_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = liker_id AND liker_id != liked_user_id);

CREATE POLICY "Usuario quita like"
  ON profile_likes FOR DELETE TO authenticated
  USING (auth.uid() = liker_id);

GRANT SELECT, INSERT, DELETE ON profile_likes TO authenticated;
