-- Ejecutar si los mensajes no se guardan o no se ven al recargar

GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

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
