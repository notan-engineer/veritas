-- Railway PostgreSQL Schema for Veritas
-- Optimized schema with full-text search and proper indexing
-- Migration from Supabase to Railway PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Sources table: News sources and content providers
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    twitter_handle VARCHAR(100),
    profile_photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped content table: Raw content from sources
CREATE TABLE IF NOT EXISTS scraped_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url VARCHAR(500) NOT NULL,
    title TEXT,
    content TEXT,
    author VARCHAR(200),
    publication_date TIMESTAMP WITH TIME ZONE,
    content_type VARCHAR(50) DEFAULT 'article' CHECK (content_type IN ('article', 'social_post', 'video', 'other')),
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table: Hierarchical tag system
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factoids table: Core content with full-text search support
CREATE TABLE IF NOT EXISTS factoids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    bullet_points TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factoid-Tag relationship table (many-to-many)
CREATE TABLE IF NOT EXISTS factoid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, tag_id)
);

-- Factoid-Source relationship table (many-to-many through scraped content)
CREATE TABLE IF NOT EXISTS factoid_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
    relevance_score INTEGER DEFAULT 100 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, scraped_content_id)
);

-- Full-text search function for factoids
CREATE OR REPLACE FUNCTION update_factoid_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.bullet_points, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic search vector updates
CREATE TRIGGER factoid_search_update
    BEFORE INSERT OR UPDATE ON factoids
    FOR EACH ROW EXECUTE FUNCTION update_factoid_search_vector();

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER scraped_content_updated_at BEFORE UPDATE ON scraped_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER factoids_updated_at BEFORE UPDATE ON factoids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_created_at ON sources(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_url ON scraped_content(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_status ON scraped_content(processing_status);
CREATE INDEX IF NOT EXISTS idx_scraped_content_created_at ON scraped_content(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_level ON tags(level);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
CREATE INDEX IF NOT EXISTS idx_factoids_language ON factoids(language);
CREATE INDEX IF NOT EXISTS idx_factoids_confidence ON factoids(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_factoids_created_at ON factoids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_factoids_search_vector ON factoids USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_confidence ON factoid_tags(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_scraped_content_id ON factoid_sources(scraped_content_id);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_relevance ON factoid_sources(relevance_score DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_factoids_status_created_at ON factoids(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_factoids_status_language ON factoids(status, language);
CREATE INDEX IF NOT EXISTS idx_factoids_status_confidence ON factoids(status, confidence_score DESC);

-- Constraint for tag hierarchy integrity
CREATE OR REPLACE FUNCTION check_tag_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent circular references in tag hierarchy
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the new parent would create a cycle
        IF EXISTS (
            WITH RECURSIVE tag_path AS (
                SELECT id, parent_id, 1 as depth
                FROM tags 
                WHERE id = NEW.parent_id
                
                UNION ALL
                
                SELECT t.id, t.parent_id, tp.depth + 1
                FROM tags t
                INNER JOIN tag_path tp ON t.id = tp.parent_id
                WHERE tp.depth < 10 -- Prevent infinite loops
            )
            SELECT 1 FROM tag_path WHERE id = NEW.id
        ) THEN
            RAISE EXCEPTION 'Tag hierarchy would create a circular reference';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_tag_hierarchy_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION check_tag_hierarchy();

-- Comments for documentation
COMMENT ON TABLE sources IS 'News sources and content providers';
COMMENT ON TABLE scraped_content IS 'Raw content scraped from sources';
COMMENT ON TABLE tags IS 'Hierarchical tag system for content categorization';
COMMENT ON TABLE factoids IS 'Core factoid content with full-text search support';
COMMENT ON TABLE factoid_tags IS 'Many-to-many relationship between factoids and tags';
COMMENT ON TABLE factoid_sources IS 'Many-to-many relationship between factoids and scraped content';

COMMENT ON COLUMN factoids.search_vector IS 'Full-text search vector automatically maintained by trigger';
COMMENT ON COLUMN factoids.confidence_score IS 'Confidence score 0-100 for factoid accuracy';
COMMENT ON COLUMN tags.level IS 'Hierarchy level (0=root, 1=category, 2=subcategory, etc.)';

-- Set up Row Level Security (RLS) policies (optional for future use)
-- These can be enabled when authentication is implemented
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoids ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoid_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoid_sources ENABLE ROW LEVEL SECURITY;

-- Default policies (allow all for now - can be restricted later)
CREATE POLICY "Allow all operations on sources" ON sources FOR ALL USING (true);
CREATE POLICY "Allow all operations on scraped_content" ON scraped_content FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on factoids" ON factoids FOR ALL USING (true);
CREATE POLICY "Allow all operations on factoid_tags" ON factoid_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on factoid_sources" ON factoid_sources FOR ALL USING (true);

-- Analyze tables for optimal query planning
ANALYZE sources;
ANALYZE scraped_content;
ANALYZE tags;
ANALYZE factoids;
ANALYZE factoid_tags;
ANALYZE factoid_sources; 