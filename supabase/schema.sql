-- =============================================
-- LOL-EDATE — Esquema de base de datos
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Usa auth.users (Supabase Auth). No hace falta tabla users aparte.
-- =============================================

-- Perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  city TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  play_schedule TEXT,
  discord_username TEXT,
  x_username TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuentas de LoL
CREATE TABLE lol_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  riot_id TEXT NOT NULL DEFAULT '',
  opgg_url TEXT,
  elo TEXT,
  main_role TEXT CHECK (main_role IN ('Top', 'Jungle', 'Mid', 'ADC', 'Support')),
  favorite_champions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  UNIQUE(profile_id, interest)
);

CREATE TABLE profile_looking_for (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  looking_for TEXT NOT NULL CHECK (looking_for IN ('duoQ', 'amistad', 'cita', 'casual', 'ranked')),
  UNIQUE(profile_id, looking_for)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('like', 'super_like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Índices
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_lol_accounts_elo ON lol_accounts(elo);
CREATE INDEX idx_lol_accounts_role ON lol_accounts(main_role);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lol_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_looking_for ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Políticas: perfiles
CREATE POLICY "Perfiles visibles para autenticados"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuario edita su perfil"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario actualiza su perfil"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario borra su perfil"
  ON profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Políticas: cuenta LoL
CREATE POLICY "Cuentas LoL visibles para autenticados"
  ON lol_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuario gestiona su cuenta LoL"
  ON lol_accounts FOR ALL TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas: intereses
CREATE POLICY "Intereses visibles para autenticados"
  ON interests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuario gestiona sus intereses"
  ON interests FOR ALL TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas: qué busca
CREATE POLICY "Busqueda visible para autenticados"
  ON profile_looking_for FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuario gestiona que busca"
  ON profile_looking_for FOR ALL TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas: swipes
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

-- Políticas: matches
CREATE POLICY "Usuario ve sus matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Usuario crea matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Políticas: mensajes
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
