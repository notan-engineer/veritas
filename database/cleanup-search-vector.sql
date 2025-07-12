-- Cleanup script to remove search_vector remnants
-- Run this to fix "column search_vector does not exist" errors

BEGIN;

-- Drop any indexes that reference search_vector columns
DROP INDEX IF EXISTS idx_factoids_search_vector;
DROP INDEX IF EXISTS idx_factoids_search;
DROP INDEX IF EXISTS idx_scraped_content_search_vector;
DROP INDEX IF EXISTS idx_sources_search_vector;

-- Drop any search_vector columns that might still exist
ALTER TABLE factoids DROP COLUMN IF EXISTS search_vector;
ALTER TABLE scraped_content DROP COLUMN IF EXISTS search_vector;
ALTER TABLE sources DROP COLUMN IF EXISTS search_vector;

-- Drop any search-related functions that might reference search_vector
DROP FUNCTION IF EXISTS update_factoid_search_vector();
DROP FUNCTION IF EXISTS update_search_vector();

-- Drop any triggers related to search_vector
DROP TRIGGER IF EXISTS factoids_search_vector_update ON factoids;
DROP TRIGGER IF EXISTS scraped_content_search_vector_update ON scraped_content;

-- Clean up any other search-related artifacts
DROP INDEX IF EXISTS gin_search_idx;
DROP INDEX IF EXISTS factoids_search_idx;

-- Show confirmation
SELECT 'Search vector cleanup completed successfully!' as status;

COMMIT; 