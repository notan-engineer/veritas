-- Veritas Minimal Schema - Lean and Simple
-- Supports only implemented functionality
-- Massive simplification from over-engineered original

-- Essential extensions only
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For basic text search

-- Sources table: News sources and content providers
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped content table: Raw content from sources (for future scraper service)
CREATE TABLE IF NOT EXISTS scraped_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url VARCHAR(500) NOT NULL,
    title TEXT,
    content TEXT,
    author VARCHAR(200),
    publication_date TIMESTAMP WITH TIME ZONE,
    content_type VARCHAR(50) DEFAULT 'article',
    language VARCHAR(10) DEFAULT 'en',
    processing_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table: Simple categorization
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factoids table: Core content
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

-- Factoid-Tag relationships
CREATE TABLE IF NOT EXISTS factoid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, tag_id)
);

-- Factoid-Source relationships
CREATE TABLE IF NOT EXISTS factoid_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, scraped_content_id)
);

-- Essential indexes only
CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
CREATE INDEX IF NOT EXISTS idx_factoids_created_at ON factoids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);

-- Simple tag slug normalization (keep essential functionality)
CREATE OR REPLACE FUNCTION normalize_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := LOWER(TRIM(NEW.slug));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_tag_slug_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION normalize_tag_slug();

-- Simple table comments
COMMENT ON TABLE sources IS 'News sources and content providers';
COMMENT ON TABLE scraped_content IS 'Raw content from sources';
COMMENT ON TABLE tags IS 'Simple categorization system';
COMMENT ON TABLE factoids IS 'Core factoid content';
COMMENT ON TABLE factoid_tags IS 'Factoid-tag relationships';
COMMENT ON TABLE factoid_sources IS 'Factoid-source relationships';

-- Basic data for testing
INSERT INTO sources (name, domain, url, description) VALUES 
('BBC News', 'bbc.com', 'https://www.bbc.com/news', 'British Broadcasting Corporation news'),
('Reuters', 'reuters.com', 'https://www.reuters.com', 'International news agency')
ON CONFLICT (domain) DO NOTHING;

INSERT INTO tags (name, slug, description) VALUES 
('All', 'all', 'All topics'),
('Politics', 'politics', 'Political news and analysis'),
('Technology', 'technology', 'Tech news and innovation'),
('Science', 'science', 'Scientific discoveries and research'),
('Business', 'business', 'Business and economic news'),
('Health', 'health', 'Health and medical news')
ON CONFLICT (slug) DO NOTHING; 