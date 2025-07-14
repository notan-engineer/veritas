-- Enhanced Scraper Schema Migration
-- Migration Date: 13-07-25
-- Purpose: Add comprehensive scraper enhancements for job tracking, content classification, and source management
-- 
-- This migration enhances the existing schema while maintaining backward compatibility

BEGIN;

-- ===============================================
-- 1. ENHANCED SCRAPED_CONTENT TABLE
-- ===============================================

-- Add new columns to scraped_content table for enhanced functionality
ALTER TABLE scraped_content 
    ADD COLUMN IF NOT EXISTS category VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS full_html TEXT,
    ADD COLUMN IF NOT EXISTS crawlee_classification JSONB,
    ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- Add index for content hash for duplicate detection
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON scraped_content(content_hash);

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_scraped_content_category ON scraped_content(category);

-- Add partial index for processing status
CREATE INDEX IF NOT EXISTS idx_scraped_content_processing_status ON scraped_content(processing_status) WHERE processing_status != 'completed';

-- ===============================================
-- 2. ENHANCED SOURCES TABLE
-- ===============================================

-- Add new columns to sources table for source management
ALTER TABLE sources 
    ADD COLUMN IF NOT EXISTS rss_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS scraping_config JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 100.00,
    ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

-- Add index for enabled sources (most common query)
CREATE INDEX IF NOT EXISTS idx_sources_enabled ON sources(is_enabled) WHERE is_enabled = true;

-- Add index for RSS URL lookups
CREATE INDEX IF NOT EXISTS idx_sources_rss_url ON sources(rss_url) WHERE rss_url IS NOT NULL;

-- ===============================================
-- 3. SCRAPING JOBS TABLE
-- ===============================================

-- Create scraping jobs table for job tracking and management
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    sources_requested TEXT[] DEFAULT '{}',
    articles_per_source INTEGER DEFAULT 3 CHECK (articles_per_source > 0 AND articles_per_source <= 50),
    total_articles_scraped INTEGER DEFAULT 0 CHECK (total_articles_scraped >= 0),
    total_errors INTEGER DEFAULT 0 CHECK (total_errors >= 0),
    job_logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for job tracking queries
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_triggered_at ON scraping_jobs(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_completed_at ON scraping_jobs(completed_at DESC);

-- ===============================================
-- 4. SCRAPING LOGS TABLE
-- ===============================================

-- Create scraping logs table for detailed per-source logging
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB DEFAULT '{}'
);

-- Add indexes for log queries
CREATE INDEX IF NOT EXISTS idx_scraping_logs_job_id ON scraping_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_source_id ON scraping_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON scraping_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_level ON scraping_logs(log_level);

-- Partial index for error logs (most important for monitoring)
CREATE INDEX IF NOT EXISTS idx_scraping_logs_errors ON scraping_logs(timestamp DESC) 
    WHERE log_level IN ('error', 'critical');

-- ===============================================
-- 5. UTILITY FUNCTIONS
-- ===============================================

-- Function to update job timestamps automatically
CREATE OR REPLACE FUNCTION update_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_scraping_jobs_updated_at ON scraping_jobs;
CREATE TRIGGER update_scraping_jobs_updated_at
    BEFORE UPDATE ON scraping_jobs
    FOR EACH ROW EXECUTE FUNCTION update_job_updated_at();

-- Function to calculate source success rate
CREATE OR REPLACE FUNCTION calculate_source_success_rate(source_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_attempts INTEGER;
    successful_attempts INTEGER;
    success_rate DECIMAL(5,2);
BEGIN
    -- Count total scraping attempts for this source in last 30 days
    SELECT COUNT(*) INTO total_attempts
    FROM scraping_logs sl
    JOIN scraping_jobs sj ON sl.job_id = sj.id
    WHERE sl.source_id = source_uuid
    AND sj.triggered_at >= NOW() - INTERVAL '30 days';
    
    -- Count successful attempts (no error logs)
    SELECT COUNT(*) INTO successful_attempts
    FROM scraping_logs sl
    JOIN scraping_jobs sj ON sl.job_id = sj.id
    WHERE sl.source_id = source_uuid
    AND sl.log_level NOT IN ('error', 'critical')
    AND sj.triggered_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate success rate
    IF total_attempts = 0 THEN
        RETURN 100.00;
    ELSE
        success_rate = (successful_attempts::DECIMAL / total_attempts::DECIMAL) * 100;
        RETURN ROUND(success_rate, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 6. UPDATE EXISTING DATA
-- ===============================================

-- Set default scraping configuration for existing sources
UPDATE sources 
SET scraping_config = '{
    "maxArticles": 3,
    "respectRobotsTxt": true,
    "delayBetweenRequests": 1000,
    "userAgent": "Veritas News Aggregator Bot 1.0"
}'::jsonb
WHERE scraping_config IS NULL OR scraping_config = '{}'::jsonb;

-- Set RSS URLs for existing sources if they exist
UPDATE sources SET rss_url = 'http://feeds.bbci.co.uk/news/rss.xml' WHERE domain = 'bbc.com' AND rss_url IS NULL;
UPDATE sources SET rss_url = 'https://feeds.reuters.com/reuters/topNews' WHERE domain = 'reuters.com' AND rss_url IS NULL;

-- Enable all existing sources by default
UPDATE sources SET is_enabled = true WHERE is_enabled IS NULL;

-- ===============================================
-- 7. TABLE COMMENTS AND DOCUMENTATION
-- ===============================================

-- Update table comments with new functionality
COMMENT ON TABLE scraped_content IS 'Enhanced scraped content with classification and full HTML storage';
COMMENT ON TABLE sources IS 'Enhanced news sources with RSS feeds and scraping configuration';
COMMENT ON TABLE scraping_jobs IS 'Job tracking and management for scraping operations';
COMMENT ON TABLE scraping_logs IS 'Detailed logging per source for each scraping job';

-- Column comments for better documentation
COMMENT ON COLUMN scraped_content.category IS 'Article category extracted from source metadata';
COMMENT ON COLUMN scraped_content.tags IS 'Article tags extracted from source metadata';
COMMENT ON COLUMN scraped_content.full_html IS 'Complete HTML content of the article';
COMMENT ON COLUMN scraped_content.crawlee_classification IS 'Crawlee content classification results';
COMMENT ON COLUMN scraped_content.content_hash IS 'SHA-256 hash for duplicate detection';

COMMENT ON COLUMN sources.rss_url IS 'RSS feed URL for automated scraping';
COMMENT ON COLUMN sources.scraping_config IS 'JSON configuration for source-specific scraping settings';
COMMENT ON COLUMN sources.last_scraped_at IS 'Timestamp of last successful scraping attempt';
COMMENT ON COLUMN sources.success_rate IS 'Success rate percentage over last 30 days';
COMMENT ON COLUMN sources.is_enabled IS 'Whether this source is active for scraping';

-- ===============================================
-- 8. VALIDATION AND CONSTRAINTS
-- ===============================================

-- Add safe constraints (without IF NOT EXISTS since PostgreSQL doesn't support it)
DO $$ 
BEGIN
    -- Add content hash format constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_hash_format') THEN
        ALTER TABLE scraped_content ADD CONSTRAINT chk_content_hash_format 
        CHECK (content_hash IS NULL OR content_hash ~ '^[a-f0-9]{64}$');
    END IF;
    
    -- Add success rate range constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_success_rate_range') THEN
        ALTER TABLE sources ADD CONSTRAINT chk_success_rate_range 
        CHECK (success_rate >= 0.00 AND success_rate <= 100.00);
    END IF;
    
    -- Add scraping config JSON constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_scraping_config_json') THEN
        ALTER TABLE sources ADD CONSTRAINT chk_scraping_config_json 
        CHECK (scraping_config IS NULL OR jsonb_typeof(scraping_config) = 'object');
    END IF;
END $$;

COMMIT;

-- ===============================================
-- MIGRATION COMPLETE
-- ===============================================

-- Display summary
SELECT 'Enhanced Scraper Schema Migration Completed Successfully' AS status,
       NOW() AS completed_at,
       'Added job tracking, enhanced content storage, and source management capabilities' AS description; 