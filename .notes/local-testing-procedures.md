# Local Testing Procedures

## Overview
Local testing using PostgreSQL copy of production data for safe development.

## Quick Start
1. Run setup script: `documentation/local-testing/setup-local-db.ps1`
2. Create `.env` in service directory (see template below)
3. Test with: `node test-local-scraping.js`

## Environment Template
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/veritas_local
NODE_ENV=development
PORT=3001
```

## Key Points
- NEVER commit .env files
- Use local DB for all testing
- Clear test data between sessions
- See `documentation/local-testing/LOCAL-TESTING-GUIDE.md` for details

## Testing Workflow
1. **Setup Local DB**: Run PowerShell script to create local database copy
2. **Configure Environment**: Create .env with local credentials
3. **Run Tests**: Use test-local-scraping.js for scraper testing
4. **Clean Up**: Remove test data after testing

## Security Checklist
- [ ] .env files are in .gitignore
- [ ] No passwords in code
- [ ] SQL dumps are ignored
- [ ] Test scripts use local DB only 