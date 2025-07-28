# Veritas Database Documentation

## Overview
This directory contains the complete database schema for the Veritas project.

## File Structure

### schema.sql
The **single source of truth** for the current database schema. This file contains:
- All table definitions
- Indexes
- Functions and triggers
- Default data
- Table relationships

When you need to understand the current database structure, always refer to this file.

## Database Tables

### Core Tables
- **sources** - News sources and content providers
- **scraped_content** - Raw content from sources
- **tags** - Content categorization
- **factoids** - Core content units

### Relationship Tables
- **factoid_tags** - Links factoids to tags (many-to-many)
- **factoid_sources** - Links factoids to sources (many-to-many)

### Scraper Tables
- **scraping_jobs** - Tracks scraping job execution with granular status tracking
- **scraping_logs** - Detailed logs per scraping job

## Usage

### Apply Schema to New Database
```bash
psql $DATABASE_URL -f schema.sql
```

### Making Database Changes

When you need to modify the database:
1. Update `schema.sql` with your changes
2. Create a migration script with your specific changes
3. Test on development database first
4. Apply to production

Example migration:
```sql
-- Add new column to factoids table
BEGIN;
ALTER TABLE factoids ADD COLUMN new_field VARCHAR(255);
-- ROLLBACK: ALTER TABLE factoids DROP COLUMN new_field;
COMMIT;
```

## Railway Deployment

The database is deployed on Railway. Connection details are provided via the `DATABASE_URL` environment variable.

### Connection Pattern
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Migrations

### Granular Job Status (2025-07-26)
- Migration: `migrations/2025-07-26_granular-job-statuses.sql`
- Converts job statuses from VARCHAR to enum type
- Maps legacy statuses to new granular values
- Preserves all historical data

## Important Notes

1. **Always update schema.sql** when making database changes
2. **Test changes** on a development database first
3. **Include rollback instructions** in migration comments
4. **Update TypeScript interfaces** when schema changes