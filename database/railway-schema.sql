-- Railway PostgreSQL Schema for Veritas
-- Optimized schema with full-text search and proper indexing
-- Aligned with technical design requirements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "citext";  -- Case-insensitive text for emails/usernames

-- Sources table: News sources and content providers
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    domain CITEXT NOT NULL UNIQUE,  -- Case-insensitive domain
    url VARCHAR(500) NOT NULL CHECK (url ~ '^https?://'),  -- URL format validation
    description TEXT,
    icon_url VARCHAR(500) CHECK (icon_url IS NULL OR icon_url ~ '^https?://'),
    twitter_handle VARCHAR(100) CHECK (twitter_handle IS NULL OR twitter_handle ~ '^[a-zA-Z0-9_]{1,15}$'),
    profile_photo_url VARCHAR(500) CHECK (profile_photo_url IS NULL OR profile_photo_url ~ '^https?://'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped content table: Raw content from sources
CREATE TABLE IF NOT EXISTS scraped_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url VARCHAR(500) NOT NULL CHECK (source_url ~ '^https?://'),
    title TEXT CHECK (title IS NULL OR LENGTH(TRIM(title)) > 0),
    content TEXT CHECK (content IS NULL OR LENGTH(TRIM(content)) > 0),
    author VARCHAR(200) CHECK (author IS NULL OR LENGTH(TRIM(author)) > 0),
    publication_date TIMESTAMP WITH TIME ZONE CHECK (publication_date IS NULL OR publication_date <= NOW()),
    content_type VARCHAR(50) DEFAULT 'article' CHECK (content_type IN ('article', 'social_post', 'video', 'other')),
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table: Hierarchical tag system
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    slug VARCHAR(100) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$' AND slug NOT LIKE '-%' AND slug NOT LIKE '%-'),
    description TEXT CHECK (description IS NULL OR LENGTH(TRIM(description)) > 0),
    parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factoids table: Core content with full-text search support
-- FIXED: title length increased to 500, confidence_score changed to DECIMAL(3,2)
CREATE TABLE IF NOT EXISTS factoids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(title)) BETWEEN 3 AND 500),
    description TEXT NOT NULL CHECK (LENGTH(TRIM(description)) BETWEEN 10 AND 10000),
    bullet_points TEXT[] DEFAULT '{}' CHECK (array_length(bullet_points, 1) IS NULL OR array_length(bullet_points, 1) <= 20),
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
    confidence_score DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factoid-Tag relationship table (many-to-many)
-- FIXED: confidence_score changed to DECIMAL(3,2)
CREATE TABLE IF NOT EXISTS factoid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, tag_id)
);

-- Factoid-Source relationship table (many-to-many through scraped content)
-- FIXED: relevance_score changed to DECIMAL(3,2)
CREATE TABLE IF NOT EXISTS factoid_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 1.00 CHECK (relevance_score >= 0.00 AND relevance_score <= 1.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, scraped_content_id)
);

-- ADDED: Users table for authentication ready architecture
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    username CITEXT UNIQUE CHECK (username IS NULL OR (username ~ '^[a-zA-Z0-9_-]{3,30}$' AND username NOT LIKE '%-%-%')),
    full_name VARCHAR(200) CHECK (full_name IS NULL OR LENGTH(TRIM(full_name)) >= 1),
    avatar_url VARCHAR(500) CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADDED: User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, source_id)
);

-- ADDED: User tag preferences table
CREATE TABLE IF NOT EXISTS user_tag_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    preference_type VARCHAR(50) DEFAULT 'follow' CHECK (preference_type IN ('follow', 'block', 'mute')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_id)
);

-- ADDED: User actions table (private)
CREATE TABLE IF NOT EXISTS user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('read', 'bookmark', 'hide', 'report')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, factoid_id, action_type)
);

-- ADDED: User interactions table (public/semi-public)
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'comment')),
    content TEXT CHECK (
        (interaction_type != 'comment' AND content IS NULL) OR 
        (interaction_type = 'comment' AND content IS NOT NULL AND LENGTH(TRIM(content)) BETWEEN 1 AND 2000)
    ),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search function for factoids with multilingual support
CREATE OR REPLACE FUNCTION update_factoid_search_vector()
RETURNS trigger AS $$
DECLARE
    lang_config TEXT;
BEGIN
    -- Input validation
    IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
        RAISE EXCEPTION 'Factoid title cannot be null or empty';
    END IF;
    
    IF NEW.description IS NULL OR LENGTH(TRIM(NEW.description)) = 0 THEN
        RAISE EXCEPTION 'Factoid description cannot be null or empty';
    END IF;
    
    -- Map language codes to PostgreSQL text search configurations
    -- Note: Language mapping executed per row - for bulk imports consider optimizing
    lang_config := CASE 
        WHEN NEW.language = 'en' THEN 'english'
        WHEN NEW.language = 'ar' THEN 'arabic'
        WHEN NEW.language = 'he' THEN 'simple'  -- Hebrew falls back to simple
        ELSE 'simple'  -- Default fallback for 'other' and unknown languages
    END;
    
    -- Build search vector with error handling
    BEGIN
        NEW.search_vector := 
            setweight(to_tsvector(lang_config, COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector(lang_config, COALESCE(NEW.description, '')), 'B') ||
            setweight(to_tsvector(lang_config, COALESCE(array_to_string(NEW.bullet_points, ' '), '')), 'C');
    EXCEPTION
        WHEN others THEN
            -- Fallback to simple configuration if language-specific config fails
            NEW.search_vector := 
                setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
                setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
                setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.bullet_points, ' '), '')), 'C');
    END;
    
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
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_actions_updated_at BEFORE UPDATE ON user_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_interactions_updated_at BEFORE UPDATE ON user_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance indexes
-- Note: domain column already indexed via UNIQUE constraint, no explicit index needed
CREATE INDEX IF NOT EXISTS idx_sources_created_at ON sources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_active_domain ON sources(domain) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_url ON scraped_content(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_status ON scraped_content(processing_status);
CREATE INDEX IF NOT EXISTS idx_scraped_content_created_at ON scraped_content(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_level ON tags(level);
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

-- Performance indexes for RLS policy lookups
CREATE INDEX IF NOT EXISTS idx_factoids_status_published ON factoids(id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(id) WHERE is_active = true;

-- ADDED: User table indexes (optimized - removed low-cardinality boolean indexes)
-- Note: email and username columns already indexed via UNIQUE CITEXT constraints
-- Removed idx_users_email - redundant with email UNIQUE constraint
-- Removed idx_users_username - redundant with username UNIQUE constraint
-- Removed idx_users_active - boolean index provides minimal benefit

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_source_id ON user_subscriptions(source_id);

CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_user_id ON user_tag_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_tag_id ON user_tag_preferences(tag_id);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_factoid_id ON user_actions(factoid_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_factoid_id ON user_interactions(factoid_id);
-- Removed idx_user_interactions_public - boolean index provides minimal benefit

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

-- Email normalization function to ensure consistent case handling
CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize email to lowercase and trim whitespace
    IF NEW.email IS NOT NULL THEN
        NEW.email := LOWER(TRIM(NEW.email));
    END IF;
    
    -- Normalize username to lowercase and trim whitespace
    IF NEW.username IS NOT NULL THEN
        NEW.username := LOWER(TRIM(NEW.username));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_user_data_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION normalize_email();

-- Tag slug normalization function
CREATE OR REPLACE FUNCTION normalize_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize slug to lowercase and trim whitespace
    IF NEW.slug IS NOT NULL THEN
        NEW.slug := LOWER(TRIM(NEW.slug));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_tag_slug_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION normalize_tag_slug();

-- Comments for documentation
COMMENT ON TABLE sources IS 'News sources and content providers';
COMMENT ON TABLE scraped_content IS 'Raw content scraped from sources';
COMMENT ON TABLE tags IS 'Hierarchical tag system for content categorization';
COMMENT ON TABLE factoids IS 'Core factoid content with full-text search support';
COMMENT ON TABLE factoid_tags IS 'Many-to-many relationship between factoids and tags';
COMMENT ON TABLE factoid_sources IS 'Many-to-many relationship between factoids and scraped content';
COMMENT ON TABLE users IS 'User accounts for authentication and personalization';
COMMENT ON TABLE user_subscriptions IS 'User subscriptions to specific sources';
COMMENT ON TABLE user_tag_preferences IS 'User preferences for tags (follow/block/mute)';
COMMENT ON TABLE user_actions IS 'Private user actions (read/bookmark/hide/report)';
COMMENT ON TABLE user_interactions IS 'Public user interactions (like/dislike/comment)';

COMMENT ON COLUMN factoids.search_vector IS 'Full-text search vector automatically maintained by trigger';
COMMENT ON COLUMN factoids.confidence_score IS 'Confidence score 0.00-1.00 for factoid accuracy';
COMMENT ON COLUMN factoid_tags.confidence_score IS 'Tag relevance score 0.00-1.00';
COMMENT ON COLUMN factoid_sources.relevance_score IS 'Source relevance score 0.00-1.00';
COMMENT ON COLUMN tags.level IS 'Hierarchy level (0=root, 1=category, 2=subcategory, etc.)';

-- Set up Row Level Security (RLS) policies
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoids ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoid_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoid_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tag_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Public access policies (for current anonymous access)
CREATE POLICY "Allow public read access to published factoids" ON factoids FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read access to active sources" ON sources FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active tags" ON tags FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to completed scraped content" ON scraped_content FOR SELECT USING (processing_status = 'completed');

-- SECURITY FIX: Restrict factoid relationship access to published factoids only
CREATE POLICY "Allow public read access to published factoid tags" ON factoid_tags 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM factoids WHERE factoids.id = factoid_tags.factoid_id AND factoids.status = 'published')
  );

CREATE POLICY "Allow public read access to published factoid sources" ON factoid_sources 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM factoids WHERE factoids.id = factoid_sources.factoid_id AND factoids.status = 'published')
  );

-- Create Railway PostgreSQL compatible session functions for user authentication
-- These functions manage user session state for RLS policies
-- SECURITY: set_current_user_id is restricted to authorized roles to prevent impersonation
CREATE OR REPLACE FUNCTION set_current_user_id(uid UUID) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', uid::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth role for secure function execution
CREATE ROLE IF NOT EXISTS veritas_auth_role;

-- Restrict function access to prevent user impersonation
-- Remove public execute privileges and grant only to auth role
REVOKE ALL ON FUNCTION set_current_user_id(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_current_user_id(UUID) TO veritas_auth_role;

-- Allow public access to get_current_user_id for RLS policies
GRANT EXECUTE ON FUNCTION get_current_user_id() TO PUBLIC;

-- User-specific policies with proper access control
-- SECURITY: Users can only access their own data when authenticated
CREATE POLICY "Users can read their own data" ON users 
  FOR SELECT USING (
    get_current_user_id() IS NOT NULL AND id = get_current_user_id()
  );

CREATE POLICY "Users can read their own subscriptions" ON user_subscriptions 
  FOR SELECT USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can read their own tag preferences" ON user_tag_preferences 
  FOR SELECT USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can read their own actions" ON user_actions 
  FOR SELECT USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

-- Enhanced policy for user interactions: users can read their own + public interactions of others
CREATE POLICY "Users can read interactions" ON user_interactions 
  FOR SELECT USING (
    get_current_user_id() IS NOT NULL AND (
      user_id = get_current_user_id() OR 
      (is_public = true AND EXISTS (SELECT 1 FROM factoids WHERE factoids.id = factoid_id AND factoids.status = 'published'))
    )
  );

-- Write access policies for authenticated users to manage their own data
-- Users table: Allow profile updates only (account creation/deletion handled by auth system)
CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (
    get_current_user_id() IS NOT NULL AND id = get_current_user_id()
  );

-- User subscriptions: Full CRUD access to own subscriptions
CREATE POLICY "Users can create their own subscriptions" ON user_subscriptions 
  FOR INSERT WITH CHECK (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions 
  FOR UPDATE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can delete their own subscriptions" ON user_subscriptions 
  FOR DELETE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

-- User tag preferences: Full CRUD access to own preferences
CREATE POLICY "Users can create their own tag preferences" ON user_tag_preferences 
  FOR INSERT WITH CHECK (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can update their own tag preferences" ON user_tag_preferences 
  FOR UPDATE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can delete their own tag preferences" ON user_tag_preferences 
  FOR DELETE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

-- User actions: Full CRUD access to own actions
CREATE POLICY "Users can create their own actions" ON user_actions 
  FOR INSERT WITH CHECK (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can update their own actions" ON user_actions 
  FOR UPDATE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can delete their own actions" ON user_actions 
  FOR DELETE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

-- User interactions: Full CRUD access to own interactions
CREATE POLICY "Users can create their own interactions" ON user_interactions 
  FOR INSERT WITH CHECK (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can update their own interactions" ON user_interactions 
  FOR UPDATE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

CREATE POLICY "Users can delete their own interactions" ON user_interactions 
  FOR DELETE USING (
    get_current_user_id() IS NOT NULL AND user_id = get_current_user_id()
  );

-- Analyze tables for optimal query planning
ANALYZE sources;
ANALYZE scraped_content;
ANALYZE tags;
ANALYZE factoids;
ANALYZE factoid_tags;
ANALYZE factoid_sources;
ANALYZE users;
ANALYZE user_subscriptions;
ANALYZE user_tag_preferences;
ANALYZE user_actions;
ANALYZE user_interactions; 