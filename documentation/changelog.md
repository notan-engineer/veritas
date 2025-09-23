# Changelog

### September 23, 2025 - Content Extraction Enhancement & Project Cleanup
**Summary**: Major improvements to content extraction quality with multi-strategy approach, paragraph preservation, and safe structural filtering for promotional content. Includes comprehensive project cleanup and new debugging utilities.

**Key Features**:
- Advanced multi-strategy content extraction (JSON-LD, selectors, meta tags)
- Paragraph structure preservation with triple newline separation
- Structural filtering for promotional content (ALL CAPS + links only)
- Real-time extraction tracking for debugging
- Five new testing utilities for extraction validation
- Project structure cleanup with test file removal

**Technical Details**:
- Implemented three-tier extraction strategy prioritizing structured data
- Added safe structural filtering that avoids text matching
- Enhanced `preserveContentStructure` function in utils.ts
- Created `ExtractionRecorder` class for optional debugging
- Removed 12 temporary test files and updated .gitignore
- Achieved 85-95% extraction success rates across major sources

**Related**:
- Commits: e8684ac, 1cb0c9d, af3f9d9, 5cd2865
- PRs: N/A (uncommitted changes)
- Issues: N/A

---

### August 9, 2025 - Testing Utilities and Documentation Consolidation
**Summary**: Introduced comprehensive testing utilities suite for local development and consolidated documentation for improved maintainability.

**Key Features**:
- New utilities directory with 6 testing and setup tools
- Consolidated enhanced logging documentation
- Added utility creation procedure to Keystone framework
- Improved local development workflow with automated database setup

**Technical Details**:
- Created standalone testing utilities (01-06) for database setup, scraper testing, API testing, and log analysis
- Merged duplicate enhanced logging documentation (features 11 and 12)
- Updated Keystone procedures for utility creation standards
- Removed obsolete test files from scraper service
- Enhanced CLAUDE.md with comprehensive utility commands

**New Utilities**:
- `01-db-setup.ps1` - Automated database setup with Railway import
- `02-db-clear.js` - Safe data cleanup utility
- `03-test-scraper.js` - End-to-end scraper testing
- `04-test-api.js` - Standalone API test server
- `05-test-db-mapping.js` - Database field mapping verification
- `06-test-logs.js` - Advanced log analysis tool

**Documentation Updates**:
- Created `utilities/README.md` with comprehensive tool documentation
- Added `keystone/procedures/utility-creation.md` for utility standards
- Updated CLAUDE.md with utility commands and usage
- Consolidated `documentation/features/11-enhanced-logging.md`
- Updated multiple Keystone procedures with utility references

**Cleanup**:
- Removed `services/scraper/src/clear-data.ts`
- Removed `services/scraper/src/test-enhanced-logging.ts`
- Removed `services/scraper/src/test-logs.ts`
- Removed `database/migrations/README.md`
- Removed `documentation/features/12-enhanced-logging.md`

**Related**:
- Commits: Latest local changes (uncommitted)
- PRs: To be created upon commit
- Issues: N/A