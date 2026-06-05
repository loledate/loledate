-- Ejecutar SOLO si ya corriste schema.sql antes y faltan estas políticas

CREATE POLICY "Usuario registra swipes"
  ON swipes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Usuario actualiza swipes"
  ON swipes FOR UPDATE TO authenticated
  USING (auth.uid() = swiper_id)
  WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Usuario ve swipes"
  ON swipes FOR SELECT TO authenticated
  USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

CREATE POLICY "Usuario ve sus matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Usuario crea matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Usuario ve mensajes de sus matches"
  ON messages FOR SELECT TO authenticated
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE POLICY "Usuario envia mensajes"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND match_id IN (
      SELECT id FROM matches
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );
