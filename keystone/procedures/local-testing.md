# Local Testing Procedure

## Overview
Local testing using PostgreSQL copy of production data for safe development.

## Quick Start
1. Run setup script: `local/testing/setup-local-db.ps1`
2. Create `.env` in service directory (see template below)
3. Test with: `node test-local-scraping.js`

## Environment Setup

### Environment Template
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/veritas_local
NODE_ENV=development
PORT=3001
```

### File Locations
- UI Service: `services/ui/.env`
- Scraper Service: `services/scraper/.env`

## Key Points
- **NEVER commit .env files**
- Use local DB for all testing
- Clear test data between sessions
- See `local/testing/LOCAL-TESTING-GUIDE.md` for full details

## Testing Workflow

### 1. Setup Local Database
```powershell
# Run PowerShell script to create local database copy
.\local\testing\setup-local-db.ps1

# This will:
# - Create local PostgreSQL database
# - Import production schema
# - Set up test data
```

### 2. Configure Environment
```bash
# Create .env file in service directory
# Copy template above
# Update with your local PostgreSQL password
```

### 3. Run Tests
```bash
# For UI service
cd services/ui
npm run dev

# For scraper service
cd services/scraper
node test-local-scraping.js
```

### 4. Clean Up
```sql
-- Remove test data after testing
DELETE FROM scraped_content WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM factoids WHERE status = 'draft';
```

## Security Checklist
- [ ] .env files are in .gitignore
- [ ] No passwords in code
- [ ] SQL dumps are ignored
- [ ] Test scripts use local DB only
- [ ] No production URLs in test files

## Common Testing Scenarios

### UI Development
1. Set up local database
2. Create .env with local DATABASE_URL
3. Run `npm run dev` from services/ui
4. Test features against local data
5. No risk to production

### Scraper Testing
1. Set up local database
2. Configure scraper .env file
3. Run test-local-scraping.js
4. Verify content insertion
5. Check error handling

### Database Changes
1. Test migration on local DB first
2. Verify schema changes work
3. Test rollback procedure
4. Apply to production only after success

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running locally
- Check password in .env file
- Ensure database exists: `veritas_local`
- Check port 5432 is available

### Environment Variable Issues
- Confirm .env file in correct directory
- Check for typos in variable names
- Ensure no spaces around = in .env
- Restart dev server after .env changes

### Data Issues
- Run setup script to refresh schema
- Clear old test data regularly
- Use meaningful test data
- Don't rely on production data

## Best Practices

### Local Development
- Always use local database for development
- Create realistic test data
- Test edge cases locally
- Verify changes before pushing

### Data Management
- Keep test data minimal
- Use clear naming for test records
- Clean up after testing sessions
- Document any special test cases

### Security
- Never expose production credentials
- Use different passwords locally
- Keep .env files out of version control
- Review code for hardcoded values 