-- Rollback Enhanced Scraper Schema Migration
-- Migration Date: 13-07-25
-- Purpose: Safely rollback all changes from enhance-scraper-schema.sql
-- 
-- WARNING: This will remove all job tracking data and enhanced content metadata
-- Make sure to backup the database before running this rollback

BEGIN;

-- ===============================================
-- SAFETY CHECKS
-- ===============================================

-- Check if we have recent scraping jobs before proceeding
DO $$
DECLARE
    recent_jobs_count INTEGER;
BEGIN
    -- Count jobs from last 24 hours
    SELECT COUNT(*) INTO recent_jobs_count
    FROM scraping_jobs 
    WHERE triggered_at >= NOW() - INTERVAL '24 hours';
    
    IF recent_jobs_count > 0 THEN
        RAISE WARNING 'Found % recent scraping jobs. Consider backing up data before rollback.', recent_jobs_count;
    END IF;
END $$;

-- ===============================================
-- 1. DROP NEW TABLES (in reverse dependency order)
-- ===============================================

-- Drop scraping logs table first (has foreign key to scraping_jobs)
DROP TABLE IF EXISTS scraping_logs CASCADE;

-- Drop scraping jobs table
DROP TABLE IF EXISTS scraping_jobs CASCADE;

-- ===============================================
-- 2. DROP UTILITY FUNCTIONS AND TRIGGERS
-- ===============================================

-- Drop the update trigger
DROP TRIGGER IF EXISTS update_scraping_jobs_updated_at ON scraping_jobs;

-- Drop utility functions
DROP FUNCTION IF EXISTS update_job_updated_at();
DROP FUNCTION IF EXISTS calculate_source_success_rate(UUID);

-- ===============================================
-- 3. REMOVE ENHANCED COLUMNS FROM EXISTING TABLES
-- ===============================================

-- Remove enhanced columns from scraped_content table
ALTER TABLE scraped_content 
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS tags,
    DROP COLUMN IF EXISTS full_html,
    DROP COLUMN IF EXISTS crawlee_classification,
    DROP COLUMN IF EXISTS content_hash;

-- Remove enhanced columns from sources table
ALTER TABLE sources 
    DROP COLUMN IF EXISTS rss_url,
    DROP COLUMN IF EXISTS scraping_config,
    DROP COLUMN IF EXISTS last_scraped_at,
    DROP COLUMN IF EXISTS success_rate,
    DROP COLUMN IF EXISTS is_enabled;

-- ===============================================
-- 4. DROP ENHANCED INDEXES
-- ===============================================

-- Drop indexes from scraped_content table
DROP INDEX IF EXISTS idx_scraped_content_hash;
DROP INDEX IF EXISTS idx_scraped_content_category;
DROP INDEX IF EXISTS idx_scraped_content_processing_status;

-- Drop indexes from sources table
DROP INDEX IF EXISTS idx_sources_enabled;
DROP INDEX IF EXISTS idx_sources_rss_url;

-- Drop indexes that would have been created for deleted tables
-- (These will be automatically dropped with the tables, but listing for completeness)
-- DROP INDEX IF EXISTS idx_scraping_jobs_status;
-- DROP INDEX IF EXISTS idx_scraping_jobs_triggered_at;
-- DROP INDEX IF EXISTS idx_scraping_jobs_completed_at;
-- DROP INDEX IF EXISTS idx_scraping_logs_job_id;
-- DROP INDEX IF EXISTS idx_scraping_logs_source_id;
-- DROP INDEX IF EXISTS idx_scraping_logs_timestamp;
-- DROP INDEX IF EXISTS idx_scraping_logs_level;
-- DROP INDEX IF EXISTS idx_scraping_logs_errors;

-- ===============================================
-- 5. REMOVE CONSTRAINTS
-- ===============================================

-- Remove constraints added during migration
ALTER TABLE scraped_content DROP CONSTRAINT IF EXISTS chk_content_hash_format;
ALTER TABLE sources DROP CONSTRAINT IF EXISTS chk_success_rate_range;
ALTER TABLE sources DROP CONSTRAINT IF EXISTS chk_scraping_config_json;

-- ===============================================
-- 6. RESTORE ORIGINAL TABLE COMMENTS
-- ===============================================

-- Restore original table comments
COMMENT ON TABLE scraped_content IS 'Raw content from sources';
COMMENT ON TABLE sources IS 'News sources and content providers';

-- ===============================================
-- 7. CLEANUP DATA (OPTIONAL)
-- ===============================================

-- Reset any data that might have been modified
-- (In this case, no destructive data changes were made in the migration)

-- ===============================================
-- 8. VERIFY ROLLBACK SUCCESS
-- ===============================================

-- Verify that enhanced tables no longer exist
DO $$
BEGIN
    -- Check if scraping_jobs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scraping_jobs') THEN
        RAISE EXCEPTION 'Rollback failed: scraping_jobs table still exists';
    END IF;
    
    -- Check if scraping_logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scraping_logs') THEN
        RAISE EXCEPTION 'Rollback failed: scraping_logs table still exists';
    END IF;
    
    -- Check if enhanced columns were removed from scraped_content
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scraped_content' 
        AND column_name IN ('category', 'tags', 'full_html', 'crawlee_classification', 'content_hash')
    ) THEN
        RAISE EXCEPTION 'Rollback failed: Enhanced columns still exist in scraped_content table';
    END IF;
    
    -- Check if enhanced columns were removed from sources
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sources' 
        AND column_name IN ('rss_url', 'scraping_config', 'last_scraped_at', 'success_rate', 'is_enabled')
    ) THEN
        RAISE EXCEPTION 'Rollback failed: Enhanced columns still exist in sources table';
    END IF;
    
    RAISE NOTICE 'Rollback verification successful: All enhanced schema elements removed';
END $$;

COMMIT;

-- ===============================================
-- ROLLBACK COMPLETE
-- ===============================================

-- Display summary
SELECT 'Enhanced Scraper Schema Rollback Completed Successfully' AS status,
       NOW() AS completed_at,
       'Removed job tracking, enhanced content storage, and source management capabilities' AS description;

-- Final warning
SELECT 'WARNING: All scraping job history and enhanced content metadata has been removed' AS warning_message; 