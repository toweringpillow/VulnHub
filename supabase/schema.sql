-- VulnHub Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Tags for categorization
CREATE TABLE IF NOT EXISTS public.tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT tag_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50)
);

-- Articles (cybersecurity threats)
CREATE TABLE IF NOT EXISTS public.articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  original_link TEXT UNIQUE NOT NULL,
  source TEXT,
  published_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- AI-generated fields
  ai_summary TEXT,
  impact TEXT,
  in_wild TEXT CHECK (in_wild IN ('Yes', 'No', 'Unknown', NULL)),
  age TEXT,
  remediation TEXT,
  
  -- Deduplication
  content_hash TEXT,
  original_summary TEXT,
  ai_retry_count INTEGER DEFAULT 0 NOT NULL,
  
  CONSTRAINT title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 500)
);

-- Article-Tag junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id BIGINT REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (article_id, tag_id)
);

-- User subscriptions to tags
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (user_id, tag_id)
);

-- World news for ticker
CREATE TABLE IF NOT EXISTS public.world_news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT world_news_title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 300)
);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON public.articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_content_hash ON public.articles(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_source ON public.articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_in_wild ON public.articles(in_wild) WHERE in_wild IS NOT NULL;

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_title_trgm ON public.articles USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_articles_summary_trgm ON public.articles USING GIN (ai_summary gin_trgm_ops);

-- Article tags indexes
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON public.article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON public.article_tags(tag_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tag ON public.subscriptions(tag_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- World news indexes
CREATE INDEX IF NOT EXISTS idx_world_news_created ON public.world_news(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for articles.updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for profiles.updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_news ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Articles: Everyone can read, only service role can write
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update articles"
  ON public.articles FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

-- Tags: Everyone can read, only service role can write
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Article Tags: Everyone can read, only service role can write
CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert article tags"
  ON public.article_tags FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Subscriptions: Users can manage their own
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- World News: Everyone can read, only service role can write
CREATE POLICY "World news is viewable by everyone"
  ON public.world_news FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage world news"
  ON public.world_news FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- SEED DATA (Predefined tags)
-- ============================================================================

INSERT INTO public.tags (name, description) VALUES
  ('Windows', 'Microsoft Windows operating system'),
  ('Linux', 'Linux operating systems'),
  ('macOS', 'Apple macOS operating system'),
  ('iOS', 'Apple iOS mobile operating system'),
  ('Android', 'Google Android mobile operating system'),
  ('Ransomware', 'Ransomware attacks and malware'),
  ('Phishing', 'Phishing and social engineering'),
  ('CVE', 'Common Vulnerabilities and Exposures'),
  ('Zero-day', 'Zero-day vulnerabilities'),
  ('Microsoft', 'Microsoft products and services'),
  ('Apple', 'Apple products and services'),
  ('Google', 'Google products and services'),
  ('Cisco', 'Cisco products and services'),
  ('Fortinet', 'Fortinet products and services'),
  ('VMware', 'VMware products and services'),
  ('Exploit', 'Exploit code and techniques'),
  ('Vulnerability', 'Security vulnerabilities'),
  ('Patch', 'Security patches and updates'),
  ('Update', 'Software updates'),
  ('Data Breach', 'Data breaches and leaks'),
  ('APT', 'Advanced Persistent Threats'),
  ('Malware', 'Malicious software'),
  ('Trojan', 'Trojan malware'),
  ('Botnet', 'Botnet activity'),
  ('DDoS', 'Distributed Denial of Service attacks'),
  ('SQLi', 'SQL Injection vulnerabilities'),
  ('XSS', 'Cross-Site Scripting vulnerabilities'),
  ('RCE', 'Remote Code Execution'),
  ('Privilege Escalation', 'Privilege escalation vulnerabilities'),
  ('Critical', 'Critical severity issues')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Enable Realtime for articles (new threats appear instantly)
-- Run this after creating the tables:
-- 1. Go to Database > Replication in Supabase Dashboard
-- 2. Enable replication for the 'articles' table

-- ============================================================================
-- HELPFUL QUERIES (For testing)
-- ============================================================================

-- Get articles with tags
-- SELECT a.*, array_agg(t.name) as tags
-- FROM articles a
-- LEFT JOIN article_tags at ON a.id = at.article_id
-- LEFT JOIN tags t ON at.tag_id = t.id
-- GROUP BY a.id
-- ORDER BY a.created_at DESC
-- LIMIT 10;

-- Search articles by text
-- SELECT * FROM articles
-- WHERE title ILIKE '%ransomware%'
--    OR ai_summary ILIKE '%ransomware%'
-- ORDER BY created_at DESC;

-- Get user subscriptions with tag names
-- SELECT u.email, t.name as subscribed_tag
-- FROM subscriptions s
-- JOIN auth.users u ON s.user_id = u.id
-- JOIN tags t ON s.tag_id = t.id;

