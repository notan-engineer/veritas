# Changelog

### October 27, 2025 (PM) - Build Configuration & Database Schema Fixes
**Summary**: Fixed critical build errors on fresh Mac setup and resolved database schema circular dependency issue that required multiple schema application passes. Improved developer onboarding with environment variable templates.

**Key Fixes**:
- Database schema now applies correctly in single pass (fixed circular dependency)
- Build configuration cleaned of deprecated Next.js options
- Environment variable templates created for both services
- Local database password documentation clarified

**Technical Details**:
- **Database Schema** (`database/schema.sql`):
  - Moved `scraping_jobs` table creation before `scraped_content` to resolve foreign key dependency
  - Added clear dependency ordering documentation in schema header
  - Verified single-pass application on fresh database
- **Build Configuration** (`services/ui/next.config.ts`):
  - Removed deprecated `eslint` configuration (no longer supported in Next.js 15.3+)
  - Cleaned up configuration warnings
- **Environment Templates**:
  - Created `services/scraper/.env.example` with correct local PostgreSQL credentials
  - Created `services/ui/.env.example` with scraper service URL options
  - Both files tracked in git for developer reference
- **Dependency Management**:
  - Fixed TypeScript version conflict (5.8.3 for Next.js peer dependency compatibility)
  - Verified all dependencies installed correctly on fresh Mac setup

**Developer Impact**:
- Fresh database setups now work on first schema application
- New developers have `.env.example` templates to copy from
- Build process runs cleanly without deprecation warnings
- Correct local PostgreSQL password documented (`localdbpass` not `db0212`)

**Files Changed**: 4 files modified, 2 new templates created
**Testing**: Verified on fresh PostgreSQL database and clean Node.js environment

---

### October 27, 2025 (AM) - Mac Migration & Claude Code Automation Compatibility
**Summary**: Completed comprehensive migration from Windows to Mac development environment and established automation-first infrastructure to ensure all utility scripts are compatible with Claude Code's non-interactive execution model. This foundational update enables seamless AI-assisted development workflows.

**Key Features**:
- Cross-platform development support for both Mac/Linux and Windows environments
- Automated database setup with zero-prompt execution for Claude Code compatibility
- Comprehensive Keystone framework documentation for automation best practices
- Ready-to-use script template for creating automation-compatible utilities
- Enhanced credential management using `.pgpass` and `.env` files

**Technical Details**:
- Created `utilities/01-db-setup.sh` (Mac/Linux bash equivalent) with dual-mode support (interactive + automated)
- Implemented credential file approach eliminating all password prompts and interactive sessions
- Added comprehensive automation guide: `keystone/claude-code-compatibility.md`
- Updated 6 Keystone framework files with mandatory automation requirements
- Fixed cross-platform date commands in 3 knowledge export scripts
- Created automation script template: `keystone/templates/automation-script-template.sh`
- Security improvement: Removed hardcoded password from `utilities/check-recent-jobs.js`
- Updated all documentation from Windows-centric to cross-platform approach

**Automation Architecture**:
- **Dual-Mode Pattern**: All utilities support both interactive (human-friendly) and automated (CLI arguments) modes
- **Credential Files**: PostgreSQL `.pgpass` eliminates password prompts; `.env` stores Railway credentials
- **Direct Connections**: Replaced `railway connect` interactive sessions with direct `DATABASE_URL` usage
- **Claude Code Compatible**: All utilities tested in non-interactive subprocess environment

**Documentation Updates**:
- `CLAUDE.md` - Converted from Windows-only to cross-platform development guide
- `keystone/claude-code-compatibility.md` - NEW comprehensive automation reference
- `keystone/agentic-principles.md` - Added Claude Code shell limitations awareness
- `keystone/development-principles.md` - Added mandatory automation requirements
- `keystone/procedures/utility-creation.md` - Embedded automation compatibility checklist
- `keystone/procedures/local-testing.md` - Added automated/interactive mode documentation
- `keystone/procedures/database-work.md` - Cross-platform script references
- `utilities/README.md` - Updated with cross-platform usage examples

**Related**:
- Files Changed: 15 modified, 4 new files created
- Keystone Impact: 7 framework files updated
- Utilities: New bash script, updated README, fixed security issue
- Platform Support: Mac (primary), Windows (maintained), Linux (supported)

### September 23, 2025 - Scraper Extraction Fixes and Debugging Enhancements
**Summary**: Fixed critical scraper extraction issues that were causing 0 article extraction despite content being available. Enhanced debugging capabilities with new monitoring tools and improved error handling for more reliable content collection.

**Key Features**:
- Fixed crawler teardown errors that prevented proper cleanup after scraping jobs
- Improved Fox News content extraction with prioritized `.article-body` selector
- Added real-time job monitoring utility for debugging scraper issues
- Enhanced error handling to prevent scraper crashes from cleanup failures
- Created Fox News specific testing utility for extraction validation

**Technical Details**:
- Resolved variable scope issue causing "Cannot read properties of undefined (reading teardown)" errors
- Moved `.article-body` selector to priority position for Fox News extraction reliability
- Relaxed overly aggressive paragraph filtering that was removing legitimate content
- Added comprehensive debug logging to enhanced-scraper.ts for troubleshooting
- Created utilities for source-specific testing and job monitoring

**Related**:
- Commits: 33c08f5 (crawler teardown fix)
- ADRs: ADR-008 (Fox News selector prioritization strategy)
- Utilities: test-fox-extraction.js, check-recent-jobs.js
- Issues: Fixed scraper returning 0 articles despite Playwright extracting 8,954 characters

### September 23, 2025 - UI Content Display Enhancement
**Summary**: Improved article readability in the Scraper Management Content tab with proper paragraph formatting.

**Key Features**:
- Paragraphs now display with clear separation when articles are expanded
- Automatic detection of paragraph breaks (triple or double newlines)
- Enhanced typography with relaxed line spacing

**Technical Details**:
- Added formatArticleContent function in content-tab.tsx
- Preserves collapsed preview with line-clamp-3
- No backend changes required

**Related**:
- Commits: 654081d

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
- `01-db-setup.sh` / `01-db-setup.ps1` - Automated database setup with Railway import (cross-platform)
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