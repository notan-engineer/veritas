-- Sources Table Cleanup Migration
-- Removes unused fields and flattens scraping_config to individual columns
-- Part of the Veritas simplification initiative

-- Step 1: Add new columns for flattened scraping config
ALTER TABLE sources ADD COLUMN IF NOT EXISTS respect_robots_txt BOOLEAN DEFAULT true;
ALTER TABLE sources ADD COLUMN IF NOT EXISTS delay_between_requests INTEGER DEFAULT 1000; -- milliseconds
ALTER TABLE sources ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) DEFAULT 'Veritas-Scraper/1.0';
ALTER TABLE sources ADD COLUMN IF NOT EXISTS timeout_ms INTEGER DEFAULT 30000; -- 30 seconds

-- Step 2: Migrate existing scraping_config data to new columns if any exists
UPDATE sources 
SET 
  respect_robots_txt = COALESCE((scraping_config->>'respectRobotsTxt')::boolean, true),
  delay_between_requests = COALESCE((scraping_config->>'delayBetweenRequests')::integer, 1000),
  user_agent = COALESCE(scraping_config->>'userAgent', 'Veritas-Scraper/1.0'),
  timeout_ms = COALESCE((scraping_config->>'timeout')::integer, 30000)
WHERE scraping_config IS NOT NULL;

-- Step 3: Remove unused columns
ALTER TABLE sources DROP COLUMN IF EXISTS description;
ALTER TABLE sources DROP COLUMN IF EXISTS url;
ALTER TABLE sources DROP COLUMN IF EXISTS is_active;
ALTER TABLE sources DROP COLUMN IF EXISTS is_enabled;
ALTER TABLE sources DROP COLUMN IF EXISTS success_rate;
ALTER TABLE sources DROP COLUMN IF EXISTS last_scraped_at;
ALTER TABLE sources DROP COLUMN IF EXISTS scraping_config;

-- Step 4: Update any existing sources to have proper default values
UPDATE sources 
SET 
  respect_robots_txt = COALESCE(respect_robots_txt, true),
  delay_between_requests = COALESCE(delay_between_requests, 1000),
  user_agent = COALESCE(user_agent, 'Veritas-Scraper/1.0'),
  timeout_ms = COALESCE(timeout_ms, 30000)
WHERE 
  respect_robots_txt IS NULL OR 
  delay_between_requests IS NULL OR 
  user_agent IS NULL OR 
  timeout_ms IS NULL;

-- Step 5: Add constraints for the new columns
ALTER TABLE sources ADD CONSTRAINT check_delay_between_requests CHECK (delay_between_requests >= 0);
ALTER TABLE sources ADD CONSTRAINT check_timeout_ms CHECK (timeout_ms > 0);

-- Step 6: View the final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sources' 
ORDER BY ordinal_position; 