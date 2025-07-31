-- Veritas Database Schema
-- This is the single source of truth for the current database schema
-- Last Updated: 2025-07-25
-- 
-- This file reflects the actual production database schema on Railway
-- Verified against Railway database on 2025-07-25

-- ===============================================
-- EXTENSIONS
-- ===============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For text search functionality

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Sources table: News sources and content providers
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL UNIQUE,
    icon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rss_url VARCHAR(500),
    respect_robots_txt BOOLEAN DEFAULT true,
    delay_between_requests INTEGER DEFAULT 1000,
    user_agent VARCHAR(255) DEFAULT 'Veritas-Scraper/1.0',
    timeout_ms INTEGER DEFAULT 30000
);

-- Tags table: Simple categorization system
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped content table: Raw content from sources
CREATE TABLE IF NOT EXISTS scraped_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url VARCHAR(500) NOT NULL UNIQUE,
    title TEXT,
    content TEXT,
    author VARCHAR(200),
    publication_date TIMESTAMP WITH TIME ZONE,
    content_type VARCHAR(50) DEFAULT 'article',
    language VARCHAR(10) DEFAULT 'en',
    processing_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category VARCHAR(255),
    tags TEXT[],
    full_html TEXT,
    crawlee_classification JSONB,
    content_hash VARCHAR(64),
    compressed_content BYTEA,
    compressed_html BYTEA,
    compression_ratio NUMERIC(5,2),
    original_size BIGINT,
    compressed_size BIGINT
);

-- Factoids table: Core content units
CREATE TABLE IF NOT EXISTS factoids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    bullet_points TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- RELATIONSHIP TABLES
-- ===============================================

-- Factoid-Tag relationships (many-to-many)
CREATE TABLE IF NOT EXISTS factoid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, tag_id)
);

-- Factoid-Source relationships (many-to-many)
CREATE TABLE IF NOT EXISTS factoid_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, scraped_content_id)
);

-- ===============================================
-- SCRAPER SERVICE TABLES
-- ===============================================

-- Job status enum type (added 2025-07-26)
CREATE TYPE job_status AS ENUM ('new', 'in-progress', 'successful', 'partial', 'failed');

-- Scraped content archive table: Archive for old content
CREATE TABLE IF NOT EXISTS scraped_content_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id UUID NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    full_html TEXT,
    compressed_content BYTEA,
    compressed_html BYTEA,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    original_size BIGINT,
    compressed_size BIGINT,
    compression_ratio NUMERIC(5,2)
);

-- Scraping jobs table: Track scraping job execution
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status job_status DEFAULT 'new',
    sources_requested TEXT[] DEFAULT '{}',
    articles_per_source INTEGER DEFAULT 3,
    total_articles_scraped INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping logs table: Detailed logs for each job with structured JSONB logging
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id VARCHAR(255),
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    additional_data JSONB, -- Enhanced structured logging data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES
-- ===============================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
CREATE INDEX IF NOT EXISTS idx_sources_rss_url ON sources(rss_url) WHERE rss_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_url ON scraped_content(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_content_hash ON scraped_content(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON scraped_content(content_hash);
CREATE INDEX IF NOT EXISTS idx_scraped_content_processing_status ON scraped_content(processing_status) WHERE processing_status != 'completed';
CREATE INDEX IF NOT EXISTS idx_scraped_content_category ON scraped_content(category);
CREATE INDEX IF NOT EXISTS idx_scraped_content_compressed ON scraped_content(compressed_content) WHERE compressed_content IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_compression_ratio ON scraped_content(compression_ratio) WHERE compression_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
CREATE INDEX IF NOT EXISTS idx_factoids_created_at ON factoids(created_at DESC);

-- Relationship table indexes
CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);

-- Archive table indexes
CREATE INDEX IF NOT EXISTS idx_archive_original_id ON scraped_content_archive(original_id);
CREATE INDEX IF NOT EXISTS idx_archive_source_id ON scraped_content_archive(source_id);
CREATE INDEX IF NOT EXISTS idx_archive_created_at ON scraped_content_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_archive_archived_at ON scraped_content_archive(archived_at);

-- Scraper table indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_triggered_at ON scraping_jobs(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_completed_at ON scraping_jobs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_job_id ON scraping_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON scraping_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_level ON scraping_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_source_id ON scraping_logs(source_id);

-- Enhanced JSONB indexes for structured logging performance
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON scraping_logs((additional_data->>'event_type'));
CREATE INDEX IF NOT EXISTS idx_logs_http_status ON scraping_logs((additional_data->'http'->>'status')) WHERE additional_data->>'event_type' = 'http';
CREATE INDEX IF NOT EXISTS idx_logs_correlation ON scraping_logs((additional_data->>'correlation_id')) WHERE additional_data->>'correlation_id' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_additional_data_gin ON scraping_logs USING GIN (additional_data);
CREATE INDEX IF NOT EXISTS idx_logs_event_name ON scraping_logs((additional_data->>'event_name'));
CREATE INDEX IF NOT EXISTS idx_logs_perf_snapshots ON scraping_logs(job_id, timestamp) WHERE additional_data->>'event_type' = 'performance';

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Tag slug normalization function
CREATE OR REPLACE FUNCTION normalize_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := LOWER(TRIM(NEW.slug));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tag slug normalization trigger
CREATE TRIGGER normalize_tag_slug_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION normalize_tag_slug();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger for scraping_jobs
CREATE TRIGGER update_scraping_jobs_updated_at
    BEFORE UPDATE ON scraping_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===============================================
-- TABLE COMMENTS
-- ===============================================
COMMENT ON TABLE sources IS 'News sources and content providers';
COMMENT ON TABLE scraped_content IS 'Raw content from sources';
COMMENT ON TABLE scraped_content_archive IS 'Archive of old scraped content';
COMMENT ON TABLE tags IS 'Simple categorization system';
COMMENT ON TABLE factoids IS 'Core factoid content';
COMMENT ON TABLE factoid_tags IS 'Factoid-tag relationships';
COMMENT ON TABLE factoid_sources IS 'Factoid-source relationships';
COMMENT ON TABLE scraping_jobs IS 'Job tracking and management for scraping operations';
COMMENT ON TABLE scraping_logs IS 'Enhanced structured logging with JSONB data for comprehensive job monitoring and performance analysis';

-- ===============================================
-- DEFAULT DATA
-- ===============================================

-- Insert default tags
INSERT INTO tags (name, slug, description) VALUES 
('All', 'all', 'All topics'),
('Politics', 'politics', 'Political news and analysis'),
('Technology', 'technology', 'Tech news and innovation'),
('Science', 'science', 'Scientific discoveries and research'),
('Business', 'business', 'Business and economic news'),
('Health', 'health', 'Health and medical news'),
('World', 'world', 'International news')
ON CONFLICT (slug) DO NOTHING;

-- Insert default sources
INSERT INTO sources (name, domain, rss_url) VALUES
('CNN', 'cnn.com', 'http://rss.cnn.com/rss/edition.rss'),
('BBC News', 'bbc.com', 'http://feeds.bbci.co.uk/news/rss.xml'),
('Reuters', 'reuters.com', 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best')
ON CONFLICT (domain) DO UPDATE SET
    rss_url = EXCLUDED.rss_url;