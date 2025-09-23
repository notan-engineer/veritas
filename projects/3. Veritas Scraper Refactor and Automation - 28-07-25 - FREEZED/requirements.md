# Project Requirements: Veritas Scraper Refactor and Automation

## 1. Core Requirements
- **TR-MVP-01: Modular Router Architecture**: The scraper MUST be re-architected using `Crawlee's createCheerioRouter`.
- **TR-MVP-05: Atomic Data Persistence**: All extracted data MUST be persisted using `context.pushData()`, with a final batch insert after the crawl completes.
- **TR-NEW-01: Generic Fallback Handler**: A default router handler MUST be implemented to perform a "best-effort" scrape for any source that does not have a specific handler.
- **TR-NEW-02: Configuration Generation Script**: A standalone script MUST be created. It will accept a source name, scrape 1-2 sample articles, and output a detailed markdown file. This file must contain the full HTML content and contextual instructions sufficient for an external LLM to generate a specific router handler.
- **TR-NEW-03: End-to-End Onboarding Test**: The process of adding a new source—from DB entry to running the generation script, to creating the handler with an LLM, to final testing—MUST be documented and validated in a dedicated story.
- **TR-CORE-LOGGING**: All handlers MUST use a centralized logging utility that produces structured JSON logs. Error logs MUST include the `jobId`, `sourceName`, `url`, and a specific `errorStage` (e.g., 'fetch', 'parse', 'validation').
- **TR-CORE-ERROR**: If a specific handler fails to extract the minimum required fields (as defined in the Handler Quality Standards), it MUST throw a `HandlerError` to clearly distinguish its failure from a generic network or request error.

## 2. Handler Quality Standards

### 2.1 Required Data Interface
Every handler MUST extract and return an object conforming to this TypeScript interface:
```typescript
interface ScrapedArticle {
  title: string;              // Required, non-empty
  author?: string;            // Optional
  publicationDate?: Date;     // Optional, properly parsed
  contentHtml: string;        // Required, cleaned HTML
  contentText: string;        // Required, plain text version
  mainImageUrl?: string;      // Optional, absolute URL
  sourceUrl: string;          // Required, absolute URL
}
```

### 2.2 Content Cleaning Requirements
Handlers MUST:
- Remove all advertisement blocks and injected content
- Strip cookie banners and privacy notices
- Convert all relative URLs to absolute URLs
- Remove inline styles that break layout
- Preserve semantic HTML structure (headings, paragraphs, lists)

### 2.3 Testing Requirements
- Every handler MUST be accompanied by at least one unit test
- Tests MUST use saved HTML fixtures (stored in `test/fixtures/[source-name]/`)
- Tests MUST verify all required fields are extracted correctly
- Tests MUST verify the handler throws `HandlerError` for unparseable content

## 3. Database Changes
- No database schema changes are required.

## 4. Test Scenarios
- **MVP Success Test**: Run the scraper for 10 known sources x 10 articles. Verify 100 articles are saved.
- **Fallback Test**: Add a new source to the DB *without* adding a code handler. Trigger a scrape. Verify the generic fallback handler is invoked and logs its attempt.
- **Generator Script Test**: Run the generation script for a new source. Verify it produces a well-structured markdown file with the complete HTML of sample articles.