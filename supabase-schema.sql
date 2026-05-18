-- KontaktPilotAI — Run in Supabase SQL Editor
-- supabase.com → SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','personal','family')),
  uses_this_month INT  NOT NULL DEFAULT 0,
  uses_limit      INT  NOT NULL DEFAULT 3,
  language        TEXT NOT NULL DEFAULT 'English',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, language)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language','English')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON profiles FOR ALL USING (auth.uid() = id);
