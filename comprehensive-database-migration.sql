-- Comprehensive Database Migration for Veritas
-- Adds scraper job tracking tables and cleans up sources schema
-- Combines add-scraper-tables.sql and cleanup-sources-schema.sql

-- ========================================
-- PART 1: Add scraper job tracking tables
-- ========================================

-- Scraping jobs table: Track scraping job execution
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    sources_requested TEXT[] NOT NULL,
    articles_per_source INTEGER DEFAULT 3,
    total_articles_scraped INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    job_logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping logs table: Detailed logging for debugging
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    additional_data JSONB
);

-- Indexes for scraper tables
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_triggered_at ON scraping_jobs(triggered_at);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_job_id ON scraping_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON scraping_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_level ON scraping_logs(log_level);

-- ========================================
-- PART 2: Sources table cleanup
-- ========================================

-- Step 1: Add new columns for flattened scraping config
ALTER TABLE sources ADD COLUMN IF NOT EXISTS respect_robots_txt BOOLEAN DEFAULT true;
ALTER TABLE sources ADD COLUMN IF NOT EXISTS delay_between_requests INTEGER DEFAULT 1000; -- milliseconds
ALTER TABLE sources ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) DEFAULT 'Veritas-Scraper/1.0';
ALTER TABLE sources ADD COLUMN IF NOT EXISTS timeout_ms INTEGER DEFAULT 30000; -- 30 seconds

-- Step 2: Migrate existing scraping_config data to new columns if any exists
UPDATE sources 
SET 
  respect_robots_txt = COALESCE((scraping_config->>'respectRobotsTxt')::boolean, true),
  delay_between_requests = COALESCE((scraping_config->>'delayBetweenRequests')::integer, 1000),
  user_agent = COALESCE(scraping_config->>'userAgent', 'Veritas-Scraper/1.0'),
  timeout_ms = COALESCE((scraping_config->>'timeout')::integer, 30000)
WHERE scraping_config IS NOT NULL;

-- Step 3: Remove unused columns
ALTER TABLE sources DROP COLUMN IF EXISTS description;
ALTER TABLE sources DROP COLUMN IF EXISTS url;
ALTER TABLE sources DROP COLUMN IF EXISTS is_active;
ALTER TABLE sources DROP COLUMN IF EXISTS is_enabled;
ALTER TABLE sources DROP COLUMN IF EXISTS success_rate;
ALTER TABLE sources DROP COLUMN IF EXISTS last_scraped_at;
ALTER TABLE sources DROP COLUMN IF EXISTS scraping_config;

-- Step 4: Update any existing sources to have proper default values
UPDATE sources 
SET 
  respect_robots_txt = COALESCE(respect_robots_txt, true),
  delay_between_requests = COALESCE(delay_between_requests, 1000),
  user_agent = COALESCE(user_agent, 'Veritas-Scraper/1.0'),
  timeout_ms = COALESCE(timeout_ms, 30000)
WHERE 
  respect_robots_txt IS NULL OR 
  delay_between_requests IS NULL OR 
  user_agent IS NULL OR 
  timeout_ms IS NULL;

-- Step 5: Add constraints for the new columns
ALTER TABLE sources ADD CONSTRAINT IF NOT EXISTS check_delay_between_requests CHECK (delay_between_requests >= 0);
ALTER TABLE sources ADD CONSTRAINT IF NOT EXISTS check_timeout_ms CHECK (timeout_ms > 0);

-- ========================================
-- PART 3: Verification and cleanup
-- ========================================

-- View final sources schema
SELECT 'SOURCES SCHEMA' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sources' 
ORDER BY ordinal_position;

-- View scraping tables
SELECT 'SCRAPING_JOBS SCHEMA' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scraping_jobs' 
ORDER BY ordinal_position;

SELECT 'SCRAPING_LOGS SCHEMA' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scraping_logs' 
ORDER BY ordinal_position;

-- Show current sources count
SELECT 'CURRENT SOURCES' as info, COUNT(*) as count FROM sources; 