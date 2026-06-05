export const SUPABASE_SCHEMA_SQL = `
-- =============================================

-- LOL-EDATE — Esquema de base de datos

-- =============================================



-- Perfiles de usuario (vinculados a Supabase Auth)

CREATE TABLE profiles (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  name TEXT NOT NULL,

  age INTEGER NOT NULL CHECK (age >= 16),

  city TEXT NOT NULL,

  avatar_url TEXT,

  profile_song_url TEXT,

  bio TEXT,

  play_schedule TEXT,

  discord_username TEXT,

  x_username TEXT,

  latitude DECIMAL(10, 8),

  longitude DECIMAL(11, 8),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  updated_at TIMESTAMPTZ DEFAULT NOW()

);



-- Cuentas de LoL vinculadas

CREATE TABLE lol_accounts (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  riot_id TEXT NOT NULL,

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



-- Políticas básicas (ajustar según necesidad)

CREATE POLICY "Perfiles visibles para autenticados"

  ON profiles FOR SELECT TO authenticated USING (true);



CREATE POLICY "Usuario edita su perfil"

  ON profiles FOR ALL TO authenticated

  USING (auth.uid() = user_id)

  WITH CHECK (auth.uid() = user_id);



CREATE POLICY "Usuario edita su cuenta LoL"

  ON lol_accounts FOR ALL TO authenticated

  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))

  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));



CREATE POLICY "Usuario edita sus intereses"

  ON interests FOR ALL TO authenticated

  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))

  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));



CREATE POLICY "Usuario edita qué busca"

  ON profile_looking_for FOR ALL TO authenticated

  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))

  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

`



export interface DbProfile {

  id: string

  user_id: string

  name: string

  age: number

  city: string

  avatar_url: string | null

  profile_song_url: string | null

  bio: string | null

  play_schedule: string | null

  discord_username: string | null

  x_username: string | null

  latitude: number | null

  longitude: number | null

  created_at: string

  updated_at: string

  last_seen_at: string | null

}



export interface DbLolAccount {

  id: string

  profile_id: string

  riot_id: string

  opgg_url: string | null

  elo: string | null

  main_role: string | null

  favorite_champions: string[]

  created_at: string

  updated_at: string

}



export interface DbMatch {

  id: string

  user_a: string

  user_b: string

  matched_at: string

}



export interface DbMessage {

  id: string

  match_id: string

  sender_id: string

  content: string

  created_at: string

  read_at: string | null

}

