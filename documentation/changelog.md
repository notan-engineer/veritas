# Changelog

### September 23, 2025 - Crawlee Storage Fix for Production
**Summary**: Fixed critical scraper failure in production by configuring Crawlee to use in-memory storage in containerized environments, resolving file system errors in Railway deployment.

**Key Features**:
- Automatic storage mode detection based on environment
- In-memory storage for production (containerized environments)
- File system storage preserved for local development
- Zero configuration required after deployment

**Technical Details**:
- Identified root cause: Crawlee's file system storage incompatible with ephemeral containers
- Implemented environment-aware configuration using NODE_ENV variable
- Added early configuration in api-server.ts before Crawlee imports
- Created test utility to verify storage modes in both environments
- Documented decision in ADR-004

**Related**:
- Commits: b15b6bf
- Issues: Production scraper returning 0 articles vs 90 locally
- ADR: ADR-004-crawlee-storage-strategy.md

### September 23, 2025 - Content Extraction Enhancement & Project Cleanup
**Summary**: Major improvements to content extraction quality with multi-strategy approach, paragraph preservation, and safe structural filtering for promotional content. Includes comprehensive project cleanup and new debugging utilities.

**Key Features**:
- Advanced multi-strategy content extraction (JSON-LD, selectors, meta tags)
- Paragraph structure preservation with triple newline separation
- Structural filtering for promotional content (ALL CAPS + links only)
- Real-time extraction tracking for debugging with ExtractionRecorder
- Five new extraction testing utilities (07-11) for validation and debugging
- Project structure cleanup with test file removal
- Enhanced local development with git operation shortcuts

**Technical Details**:
- Implemented three-tier extraction strategy prioritizing structured data
- Added safe structural filtering that avoids text matching
- Enhanced `preserveContentStructure` function in utils.ts
- Created `ExtractionRecorder` class for zero-overhead optional debugging
- Implemented `enableTracking` parameter in scraper API
- Removed 12 temporary test files and updated .gitignore
- Achieved 85-95% extraction success rates across major sources

**New Utilities**:
- `07-extraction-analyzer.js` - HTML report generation for debugging extractions
- `08-analyze-all-sources.js` - Batch analysis across all configured sources
- `09-e2e-extraction-test.js` - End-to-end extraction validation
- `10-test-spacing.js` - Paragraph spacing verification
- `11-validate-extraction.js` - Content safety validation

**Related**:
- Commits: 6713fca, 49b1069, fadcc72 (local changes)
- ADR-005: Multi-Strategy Content Extraction
- ADR-006: Real-Time Extraction Tracking System
- Feature: [Content Extraction System](./features/12-content-extraction.md)
- Projects: Real-time extraction tracking (completed)

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