-- Scrape run logging for monitoring and self-healing
-- Run this in Supabase SQL Editor if upgrading an existing deployment

CREATE TABLE IF NOT EXISTS public.scrape_runs (
  id BIGSERIAL PRIMARY KEY,
  scrape_type TEXT NOT NULL CHECK (scrape_type IN ('articles', 'world_news', 'health_check')),
  articles_processed INTEGER DEFAULT 0 NOT NULL,
  articles_added INTEGER DEFAULT 0 NOT NULL,
  articles_skipped INTEGER DEFAULT 0 NOT NULL,
  errors JSONB DEFAULT '[]'::jsonb NOT NULL,
  metadata JSONB,
  ran_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_type_ran_at ON public.scrape_runs(scrape_type, ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_metadata ON public.scrape_runs USING GIN (metadata);

ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrape runs viewable by service role"
  ON public.scrape_runs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Keep only last 30 days of scrape logs
CREATE OR REPLACE FUNCTION public.prune_old_scrape_runs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.scrape_runs WHERE ran_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
