-- Refactor Scraping Logs Schema Migration
-- Changes job logs from separate table to single JSON field per job
-- Removes all existing jobs and logs as requested

-- ========================================
-- WARNING: This migration will DELETE all existing scraping jobs and logs
-- ========================================

BEGIN;

-- Remove all existing scraping jobs and logs
DELETE FROM scraping_logs;
DELETE FROM scraping_jobs;

-- Drop the scraping_logs table completely
DROP TABLE IF EXISTS scraping_logs CASCADE;

-- Modify scraping_jobs table to use JSONB for logs
ALTER TABLE scraping_jobs 
  ALTER COLUMN job_logs TYPE JSONB USING job_logs::JSONB;

-- Update the job_logs column to have a better default and constraint
ALTER TABLE scraping_jobs 
  ALTER COLUMN job_logs SET DEFAULT '[]'::JSONB;

-- Add a check constraint to ensure job_logs is an array
ALTER TABLE scraping_jobs 
  ADD CONSTRAINT check_job_logs_is_array 
  CHECK (jsonb_typeof(job_logs) = 'array');

-- Remove old indexes related to scraping_logs table (they're dropped with the table)
-- Keep existing indexes on scraping_jobs table

-- Add comment for the new schema
COMMENT ON COLUMN scraping_jobs.job_logs IS 'JSON array containing complete log history for the job. Each log entry should have: timestamp, log_level, message, context';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'scraping_jobs' 
  AND column_name = 'job_logs';

COMMIT; 