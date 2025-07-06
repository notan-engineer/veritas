-- Veritas Database Migration Script
-- This script migrates from the simple articles table to a comprehensive factoid-based schema
-- Based on Supabase best practices and PostgreSQL standards

-- Start transaction to ensure atomicity
BEGIN;

-- Drop existing articles table if it exists (backup data first if needed)
DROP TABLE IF EXISTS articles CASCADE;

-- 1. Create Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  twitter_handle TEXT,
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  scraping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Scraped Content table
CREATE TABLE IF NOT EXISTS scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  title TEXT,
  content TEXT,
  author TEXT,
  publication_date TIMESTAMP WITH TIME ZONE,
  content_type TEXT CHECK (content_type IN ('article', 'social_post', 'video', 'other')) DEFAULT 'article',
  language TEXT CHECK (language IN ('en', 'he', 'ar', 'other')) DEFAULT 'en',
  raw_data JSONB,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Factoids table (the central unit)
CREATE TABLE IF NOT EXISTS factoids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bullet_points TEXT[],
  language TEXT CHECK (language IN ('en', 'he', 'ar', 'other')) DEFAULT 'en',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status TEXT CHECK (status IN ('draft', 'published', 'archived', 'flagged')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Tags table (hierarchical)
DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Factoid-Sources junction table
CREATE TABLE IF NOT EXISTS factoid_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  scraped_content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(factoid_id, scraped_content_id)
);

-- 6. Create Factoid-Tags junction table
DROP TABLE IF EXISTS factoid_tags CASCADE;
CREATE TABLE factoid_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(factoid_id, tag_id)
);

-- 7. Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create User Subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, source_id)
);

-- 9. Create User Tag Preferences table
CREATE TABLE IF NOT EXISTS user_tag_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  preference_type TEXT CHECK (preference_type IN ('follow', 'block', 'mute')) DEFAULT 'follow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_id)
);

-- 10. Create User Actions table (private)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('read', 'bookmark', 'hide', 'report')) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, factoid_id, action_type)
);

-- 11. Create User Interactions table (public/semi-public)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('like', 'dislike', 'comment')) NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create Generated Images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  status TEXT CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create LLM Feedback table
CREATE TABLE IF NOT EXISTS llm_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  factoid_id UUID REFERENCES factoids(id) ON DELETE CASCADE,
  feedback_type TEXT CHECK (feedback_type IN ('accuracy', 'completeness', 'clarity', 'relevance')) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_status ON scraped_content(processing_status);
CREATE INDEX IF NOT EXISTS idx_scraped_content_created_at ON scraped_content(created_at);
CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
CREATE INDEX IF NOT EXISTS idx_factoids_created_at ON factoids(created_at);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_factoid_id ON user_interactions(factoid_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_factoids_title_description ON factoids USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_scraped_content_title_content ON scraped_content USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tag_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_feedback ENABLE ROW LEVEL SECURITY;

-- Create public read access policies
CREATE POLICY "Allow public read access to factoids" ON factoids FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read access to sources" ON sources FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to tags" ON tags FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to scraped_content" ON scraped_content FOR SELECT USING (processing_status = 'completed');
CREATE POLICY "Allow public read access to factoid_sources" ON factoid_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access to factoid_tags" ON factoid_tags FOR SELECT USING (true);
CREATE POLICY "Allow public read access to generated_images" ON generated_images FOR SELECT USING (true);

-- Create user-specific policies (temporary - will be updated when auth is implemented)
CREATE POLICY "Users can manage their own actions" ON user_actions FOR ALL USING (true);
CREATE POLICY "Users can manage their own interactions" ON user_interactions FOR ALL USING (true);
CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions FOR ALL USING (true);
CREATE POLICY "Users can manage their own tag preferences" ON user_tag_preferences FOR ALL USING (true);
CREATE POLICY "Users can provide feedback" ON llm_feedback FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO sources (name, domain, url, description, is_active) VALUES
('TechCrunch', 'techcrunch.com', 'https://techcrunch.com', 'Technology news and analysis', true),
('Reuters', 'reuters.com', 'https://reuters.com', 'International news and business', true),
('The Verge', 'theverge.com', 'https://theverge.com', 'Technology, science, art, and culture', true),
('Bloomberg', 'bloomberg.com', 'https://bloomberg.com', 'Business and financial news', true),
('Ynet', 'ynet.co.il', 'https://ynet.co.il', 'Israeli news portal', true),
('Globes', 'globes.co.il', 'https://globes.co.il', 'Israeli business news', true);

-- Insert sample tags
INSERT INTO tags (name, slug, description, level) VALUES
('Technology', 'technology', 'Technology and innovation', 1),
('AI', 'ai', 'Artificial Intelligence', 1),
('Finance', 'finance', 'Financial news and markets', 1),
('Space', 'space', 'Space exploration and astronomy', 1),
('Environment', 'environment', 'Environmental news and climate', 1),
('Israel', 'israel', 'Israeli news and developments', 1),
('Hardware', 'hardware', 'Computer hardware and devices', 2),
('Software', 'software', 'Software and applications', 2),
('Startups', 'startups', 'Startup companies and funding', 2),
('Economy', 'economy', 'Economic news and trends', 2);

-- Set up tag hierarchy (only if parent_id column exists)
DO $$
BEGIN
    -- Check if parent_id column exists before updating
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tags' 
        AND column_name = 'parent_id'
    ) THEN
        UPDATE tags SET parent_id = (SELECT id FROM tags WHERE slug = 'technology') WHERE slug IN ('ai', 'hardware', 'software');
        UPDATE tags SET parent_id = (SELECT id FROM tags WHERE slug = 'finance') WHERE slug = 'economy';
        UPDATE tags SET level = 2 WHERE parent_id IS NOT NULL;
    END IF;
END $$;

-- Insert sample scraped content
INSERT INTO scraped_content (source_id, source_url, title, content, author, publication_date, content_type, language, processing_status) VALUES
(
  (SELECT id FROM sources WHERE domain = 'techcrunch.com'),
  'https://techcrunch.com/2024/nvidia-ai-chip',
  'NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost',
  'NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads. The new H200 chip delivers 10x faster AI training compared to previous generation and features 141GB of HBM3 memory for large language model processing.',
  'John Smith',
  '2024-12-15T10:30:00Z',
  'article',
  'en',
  'completed'
),
(
  (SELECT id FROM sources WHERE domain = 'reuters.com'),
  'https://reuters.com/business/fed-interest-rates',
  'Federal Reserve Maintains Interest Rates at 5.25-5.50%',
  'The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy. Federal funds rate remains at 5.25-5.50% for the third consecutive meeting.',
  'Jane Doe',
  '2024-12-14T14:00:00Z',
  'article',
  'en',
  'completed'
),
(
  (SELECT id FROM sources WHERE domain = 'ynet.co.il'),
  'https://ynet.co.il/tech/article/rk8h8h9',
  'ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון',
  'אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר. חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024.',
  'ישראל ישראלי',
  '2024-12-15T08:30:00Z',
  'article',
  'he',
  'completed'
);

-- Insert sample factoids
INSERT INTO factoids (title, description, bullet_points, language, confidence_score, status) VALUES
(
  'NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost',
  'NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads.',
  ARRAY[
    'New H200 chip delivers 10x faster AI training compared to previous generation',
    'Features 141GB of HBM3 memory for large language model processing',
    'Expected to ship in Q2 2024 with major cloud providers already pre-ordering',
    'Priced at $40,000 per unit, targeting enterprise AI infrastructure',
    'Compatible with existing CUDA ecosystem for seamless integration'
  ],
  'en',
  0.95,
  'published'
),
(
  'Federal Reserve Maintains Interest Rates at 5.25-5.50%',
  'The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy.',
  ARRAY[
    'Federal funds rate remains at 5.25-5.50% for the third consecutive meeting',
    'Fed Chair Powell indicates potential rate cuts in 2024 if inflation continues to decline',
    'Core inflation rate at 3.1%, down from 4.1% in September',
    'Unemployment rate stable at 3.7%, showing strong labor market',
    'Markets react positively with S&P 500 gaining 1.2% following announcement'
  ],
  'en',
  0.92,
  'published'
),
(
  'ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון',
  'אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר.',
  ARRAY[
    'חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024',
    'חברות בינה מלאכותית הובילו עם 40% מהגיוסים הכוללים',
    'חברות סייבר גייסו 800 מיליון דולר, עלייה של 25% מהרבעון הקודם',
    'מרכזי פיתוח של חברות בינלאומיות גדולות נפתחים בתל אביב וירושלים',
    'הממשלה הכריזה על תכנית חדשה לתמיכה בחברות טכנולוגיה צעירות'
  ],
  'he',
  0.88,
  'published'
);

-- Link factoids to sources
INSERT INTO factoid_sources (factoid_id, scraped_content_id, relevance_score)
SELECT 
  f.id,
  sc.id,
  0.95
FROM factoids f
JOIN scraped_content sc ON f.title = sc.title;

-- Link factoids to tags
INSERT INTO factoid_tags (factoid_id, tag_id, confidence_score)
SELECT 
  f.id,
  t.id,
  0.9
FROM factoids f
CROSS JOIN tags t
WHERE 
  (f.title ILIKE '%AI%' OR f.title ILIKE '%chip%' OR f.title ILIKE '%NVIDIA%') AND t.slug = 'ai'
  OR (f.title ILIKE '%AI%' OR f.title ILIKE '%chip%' OR f.title ILIKE '%NVIDIA%') AND t.slug = 'technology'
  OR (f.title ILIKE '%Federal Reserve%' OR f.title ILIKE '%interest rate%') AND t.slug = 'finance'
  OR (f.title ILIKE '%Federal Reserve%' OR f.title ILIKE '%interest rate%') AND t.slug = 'economy'
  OR (f.title ILIKE '%ישראל%' OR f.title ILIKE '%טכנולוגיה%') AND t.slug = 'israel'
  OR (f.title ILIKE '%ישראל%' OR f.title ILIKE '%טכנולוגיה%') AND t.slug = 'technology';

-- Commit the transaction
COMMIT;

-- Display success message and table count
SELECT 'Migration completed successfully!' as status;

-- Show created tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('sources', 'scraped_content', 'factoids', 'factoid_sources', 'tags', 'factoid_tags', 'users', 'user_subscriptions', 'user_tag_preferences', 'user_actions', 'user_interactions', 'generated_images', 'llm_feedback', 'analytics_events')
ORDER BY table_name; 