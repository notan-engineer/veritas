# Database Work Procedure

## Context Selection (2-3 files max)
```
Schema: @database/schema.sql
Client: @services/ui/lib/railway-database.ts
Types: @services/ui/lib/data-service.ts (if types change)
```

## Quick Procedure
- [ ] Close all UI/API files
- [ ] Request schema file first
- [ ] Update TypeScript interfaces
- [ ] Test database queries
- [ ] Complete → Start new session

## Migration Process

### 1. Create Migration Script
```sql
-- database/migrations/YYYY-MM-DD_description.sql
BEGIN;

-- Your changes here
ALTER TABLE factoids ADD COLUMN new_field VARCHAR(255);

-- Always include rollback comment
-- ROLLBACK: ALTER TABLE factoids DROP COLUMN new_field;

COMMIT;
```

### 2. Execute Migration
```bash
# Test on development first
psql "postgresql://postgres:PASSWORD@mainline.proxy.rlwy.net:PORT/railway" -f migration.sql
```

### 3. Update TypeScript Interfaces
```typescript
// Update in relevant files
interface Factoid {
  id: string
  title: string
  new_field?: string // Add new field
  // ... other fields
}
```

## Database Guidelines
- Always use transactions (BEGIN/COMMIT)
- Include rollback instructions in comments
- Test on development database first
- Update all affected TypeScript interfaces
- Document schema changes immediately

## Common Patterns

### Data Access Functions
```typescript
// Server-side (in lib/data.server.ts)
export async function getFactoidById(id: string) {
  const result = await db.query(
    'SELECT * FROM factoids WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// Client-side (in lib/data-service.ts)
export async function getAllFactoids() {
  const response = await fetch('/api/factoids')
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}
```

## Testing Checklist
- [ ] Migration runs without errors
- [ ] Rollback script works if needed
- [ ] TypeScript interfaces updated
- [ ] API endpoints return correct data
- [ ] No breaking changes to existing code

## Enum Types
- Use PostgreSQL enums for fixed value sets
- Include migration and rollback scripts
- Map legacy data carefully during migration
- Test thoroughly before applying to production

### Enum Migration Example
```sql
-- Create enum type
CREATE TYPE job_status AS ENUM ('new', 'in-progress', 'successful', 'partial', 'failed');

-- Convert existing column
ALTER TABLE scraping_jobs 
  ALTER COLUMN status TYPE job_status 
  USING CASE 
    WHEN status = 'pending' THEN 'new'::job_status
    WHEN status = 'running' THEN 'in-progress'::job_status
    WHEN status = 'completed' THEN 'successful'::job_status
    ELSE status::job_status
  END;

-- Rollback strategy
-- ALTER TABLE scraping_jobs ALTER COLUMN status TYPE VARCHAR(50);
-- DROP TYPE job_status;
```

## Common Issues
- **Constraint errors**: Check foreign key relationships
- **Type mismatches**: Verify TypeScript matches schema
- **Connection issues**: Use public Railway URL
- **Migration failures**: Test rollback procedure
- **Enum conversion errors**: Ensure all values map correctly
- **Type already exists**: Check before creating new types 