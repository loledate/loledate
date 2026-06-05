-- Protección anti-abuso / rate limiting
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_lookup
  ON rate_limit_events (bucket_key, action, created_at DESC);

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION assert_rate_limit(
  p_bucket_key TEXT,
  p_action TEXT,
  p_max_hits INTEGER,
  p_window_seconds INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hit_count INTEGER;
BEGIN
  IF p_bucket_key IS NULL OR length(trim(p_bucket_key)) = 0 THEN
    RAISE EXCEPTION 'invalid_bucket';
  END IF;

  DELETE FROM rate_limit_events
  WHERE created_at < NOW() - make_interval(secs => GREATEST(p_window_seconds * 2, 60));

  SELECT COUNT(*)::INTEGER INTO hit_count
  FROM rate_limit_events
  WHERE bucket_key = p_bucket_key
    AND action = p_action
    AND created_at > NOW() - make_interval(secs => p_window_seconds);

  IF hit_count >= p_max_hits THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO rate_limit_events (bucket_key, action)
  VALUES (p_bucket_key, p_action);
END;
$$;

CREATE OR REPLACE FUNCTION rate_limit_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_rate_limit(NEW.sender_id::text, 'message_send', 40, 60);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION rate_limit_swipes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_rate_limit(NEW.swiper_id::text, 'swipe', 120, 60);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION rate_limit_profile_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_rate_limit(NEW.liker_id::text, 'profile_like', 30, 60);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_rate_limit ON messages;
CREATE TRIGGER trg_messages_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION rate_limit_messages();

DROP TRIGGER IF EXISTS trg_swipes_rate_limit ON swipes;
CREATE TRIGGER trg_swipes_rate_limit
  BEFORE INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION rate_limit_swipes();

DROP TRIGGER IF EXISTS trg_profile_likes_rate_limit ON profile_likes;
CREATE TRIGGER trg_profile_likes_rate_limit
  BEFORE INSERT ON profile_likes
  FOR EACH ROW
  EXECUTE FUNCTION rate_limit_profile_likes();

GRANT EXECUTE ON FUNCTION assert_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
