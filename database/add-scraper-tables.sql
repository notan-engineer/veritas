-- Add scraper job tracking tables to Veritas database
-- This adds support for tracking scraping jobs and their logs

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

-- Scraping logs table: Detailed logs for each job
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    additional_data JSONB
);

-- Add missing columns to scraped_content table for enhanced scraping
DO $$
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' AND column_name = 'category'
    ) THEN
        ALTER TABLE scraped_content ADD COLUMN category VARCHAR(100);
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' AND column_name = 'tags'
    ) THEN
        ALTER TABLE scraped_content ADD COLUMN tags TEXT[];
    END IF;
    
    -- Add full_html column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' AND column_name = 'full_html'
    ) THEN
        ALTER TABLE scraped_content ADD COLUMN full_html TEXT;
    END IF;
    
    -- Add crawlee_classification column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' AND column_name = 'crawlee_classification'
    ) THEN
        ALTER TABLE scraped_content ADD COLUMN crawlee_classification JSONB;
    END IF;
    
    -- Add content_hash column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' AND column_name = 'content_hash'
    ) THEN
        ALTER TABLE scraped_content ADD COLUMN content_hash VARCHAR(64);
    END IF;
    
    -- Add rss_url column to sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' AND column_name = 'rss_url'
    ) THEN
        ALTER TABLE sources ADD COLUMN rss_url VARCHAR(500);
    END IF;
    
    -- Add is_enabled column to sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' AND column_name = 'is_enabled'
    ) THEN
        ALTER TABLE sources ADD COLUMN is_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Add success_rate column to sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' AND column_name = 'success_rate'
    ) THEN
        ALTER TABLE sources ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 100.0;
    END IF;
    
    -- Add last_scraped_at column to sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' AND column_name = 'last_scraped_at'
    ) THEN
        ALTER TABLE sources ADD COLUMN last_scraped_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add scraping_config column to sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' AND column_name = 'scraping_config'
    ) THEN
        ALTER TABLE sources ADD COLUMN scraping_config JSONB;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_triggered_at ON scraping_jobs(triggered_at);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_job_id ON scraping_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON scraping_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_url ON scraped_content(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_content_hash ON scraped_content(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sources_is_enabled ON sources(is_enabled) WHERE is_enabled = true;

-- Add some initial test sources for development
INSERT INTO sources (name, domain, url, rss_url, description, is_active, is_enabled) VALUES
('CNN', 'cnn.com', 'https://cnn.com', 'http://rss.cnn.com/rss/edition.rss', 'Cable News Network', true, true),
('BBC News', 'bbc.com', 'https://bbc.com/news', 'http://feeds.bbci.co.uk/news/rss.xml', 'British Broadcasting Corporation', true, true),
('Reuters', 'reuters.com', 'https://reuters.com', 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best', 'Reuters News Agency', true, true)
ON CONFLICT (domain) DO UPDATE SET
    rss_url = EXCLUDED.rss_url,
    is_enabled = EXCLUDED.is_enabled,
    description = EXCLUDED.description;

-- Insert initial tags
INSERT INTO tags (name, slug, description, is_active) VALUES
('Technology', 'technology', 'Technology and innovation news', true),
('Politics', 'politics', 'Political news and analysis', true),
('Business', 'business', 'Business and finance news', true),
('Health', 'health', 'Health and medical news', true),
('World', 'world', 'International news', true),
('Science', 'science', 'Scientific discoveries and research', true)
ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

COMMIT; 