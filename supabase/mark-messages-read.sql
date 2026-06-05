-- Marca mensajes como leídos de forma fiable (ejecutar en Supabase SQL Editor)

GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

DROP POLICY IF EXISTS "Usuario marca mensajes leidos" ON messages;

CREATE POLICY "Usuario marca mensajes leidos"
  ON messages FOR UPDATE TO authenticated
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  )
  WITH CHECK (
    match_id IN (
      SELECT id FROM matches
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION mark_match_messages_read(p_match_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM matches
    WHERE id = p_match_id
      AND (user_a = auth.uid() OR user_b = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not a match participant';
  END IF;

  UPDATE messages
  SET read_at = NOW()
  WHERE match_id = p_match_id
    AND sender_id <> auth.uid()
    AND read_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_match_messages_read(UUID) TO authenticated;
