# Local Testing Procedure

## Overview
Local testing using PostgreSQL copy of production data for safe development.

## Quick Start

### Automated Mode (Claude Code Compatible)
```bash
# One-time credential setup (if not already done)
echo "localhost:5432:*:postgres:localdbpass" > ~/.pgpass
chmod 600 ~/.pgpass

# One-time Railway credentials (if not already done)
cp utilities/.env.example utilities/.env
# Edit utilities/.env with real Railway URL

# Run database setup (zero prompts)
./utilities/01-db-setup.sh --full-setup  # Mac/Linux
.\utilities\01-db-setup.ps1 -FullSetup   # Windows
```

### Interactive Mode (Human-Friendly)
```bash
# Traditional menu-driven approach
./utilities/01-db-setup.sh   # Mac/Linux - shows menu
.\utilities\01-db-setup.ps1  # Windows - shows menu
```

### After Setup
1. Create `.env` in service directory (see template below)
2. Test with: `node utilities/03-test-scraper.js`
3. Debug extraction: `node utilities/07-extraction-analyzer.js`
4. For advanced debugging, see: `keystone/procedures/scraper-debugging.md`

## Environment Setup

### Creating Environment Files
Both services include `.env.example` templates. Copy and customize for local development:

```bash
# Scraper service
cd services/scraper
cp .env.example .env
# Edit .env and replace YOUR_PASSWORD with your local PostgreSQL password

# UI service
cd services/ui
cp .env.example .env.local
# Edit .env.local and replace YOUR_PASSWORD with your local PostgreSQL password
```

### Environment Template (from .env.example files)
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/veritas_local
NODE_ENV=development
PORT=3001  # scraper service only
```

**Note**: If using `.pgpass` file (recommended), your password is typically `localdbpass` for local development.

### File Locations
- UI Service: `services/ui/.env.local` (copy from `.env.example`)
- Scraper Service: `services/scraper/.env` (copy from `.env.example`)

## Key Points
- **NEVER commit .env or .env.local files** (already in .gitignore)
- `.env.example` files ARE tracked in git as templates
- Use local DB for all testing
- Clear test data between sessions
- Database schema now applies in single pass (fixed Oct 2025)
- See `utilities/README.md` for complete utility documentation

## Testing Workflow

### 1. Setup Local Database

#### Automated Mode (Recommended for Claude Code)
```bash
# macOS/Linux: Full setup with zero prompts
./utilities/01-db-setup.sh --full-setup

# Windows: Full setup with zero prompts
.\utilities\01-db-setup.ps1 -FullSetup

# Individual operations (if needed)
./utilities/01-db-setup.sh --create-db    # Create database only
./utilities/01-db-setup.sh --export       # Export Railway data only
./utilities/01-db-setup.sh --import       # Import existing dump only
```

#### Interactive Mode (Human-Friendly)
```bash
# macOS/Linux: Shows menu with options
./utilities/01-db-setup.sh

# Windows: Shows menu with options
.\utilities\01-db-setup.ps1

# Both scripts provide:
# - Create local PostgreSQL database
# - Export and import Railway production data
# - Verify data integrity
# - Menu-driven options for different scenarios
```

#### One-Time Credential Setup
**Required for automated mode to work without prompts:**

```bash
# PostgreSQL credentials (eliminates password prompts)
cat > ~/.pgpass <<EOF
localhost:5432:*:postgres:localdbpass
EOF
chmod 600 ~/.pgpass

# Railway credentials (for production data export)
cp utilities/.env.example utilities/.env
# Edit utilities/.env and add your Railway DATABASE_URL
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
npm run dev

# Then test with utilities
cd ../../utilities
node 03-test-scraper.js
```

### 4. Clean Up
```bash
# Use the dedicated cleanup utility
node utilities/02-db-clear.js --confirm

# Or for selective cleanup:
# - Preview what will be deleted
node utilities/02-db-clear.js

# SQL alternative for specific cleanup:
# DELETE FROM scraped_content WHERE created_at > NOW() - INTERVAL '1 day';
# DELETE FROM factoids WHERE status = 'draft';
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
1. Set up local database with `./utilities/01-db-setup.sh` (Mac/Linux) or `.\utilities\01-db-setup.ps1` (Windows)
2. Configure scraper .env file
3. Start scraper: `cd services/scraper && npm run dev`
4. Run tests: `node utilities/03-test-scraper.js`
5. Debug extraction: `node utilities/07-extraction-analyzer.js`
6. Test all sources: `node utilities/08-analyze-all-sources.js`
7. Validate quality: `node utilities/09-e2e-extraction-test.js`
8. Check spacing: `node utilities/10-test-spacing.js`
9. Verify filtering: `node utilities/11-validate-extraction.js`
10. Analyze logs: `node utilities/06-test-logs.js <job-id>`
11. Verify with API: `node utilities/04-test-api.js`

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