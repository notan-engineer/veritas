# ADR-005: Multi-Strategy Content Extraction with Structural Filtering

## Status
Accepted (2025-09-23)

## Context
Content extraction from news websites faces several challenges:
- Inconsistent HTML structures across different news sources
- Promotional content mixed with article content (especially Fox News)
- Loss of paragraph structure during extraction
- Difficulty debugging extraction failures
- Need to preserve content integrity while filtering noise

Initial approaches using text-based content matching were rejected as they could accidentally filter legitimate article content. A safer, structural approach was needed.

## Decision
We will implement a multi-strategy extraction system with structural filtering that:

1. **Multi-Strategy Extraction**: Use three extraction methods in order of preference:
   - JSON-LD structured data (most reliable when available)
   - CSS selector-based extraction (site-specific and common patterns)
   - Meta tag fallback (ensures some content always extracted)

2. **Paragraph Structure Preservation**: Maintain readability with triple newlines (`\n\n\n`) between paragraphs

3. **Structural Filtering Only**: Filter content based on HTML structure, not text content:
   - Filter paragraphs that are BOTH entirely hyperlinks AND in ALL CAPS
   - Remove known non-content elements (nav, ads, newsletters)
   - Preserve all other content to avoid false positives

4. **Real-Time Extraction Tracking**: Optional debugging system to track extraction process

## Implementation Details

### Extraction Strategy Priority
```typescript
// 1. Try JSON-LD structured data
const jsonLd = $('script[type="application/ld+json"]')
// Parse NewsArticle or Article types

// 2. Try selector-based extraction
const selectors = getSelectorsForDomain(domain)
// Iterate through selectors until sufficient content found

// 3. Fall back to meta tags
const metaDescription = $('meta[property="og:description"]').attr('content')
```

### Structural Filtering Pattern
```typescript
// Safe structural filtering - only if BOTH conditions met:
const link = $elem.find('a').first();
if (link.length > 0) {
  const linkText = link.text().trim();
  const text = $elem.text().trim();
  // Only filter if: entire paragraph is link AND all caps AND substantial length
  if (linkText === text && text === text.toUpperCase() && text.length > 20) {
    return; // Skip promotional content
  }
}
```

### Extraction Tracking
```typescript
// Enable with API parameter
enableTracking: true
// Provides traces of what was extracted and how
```

## Consequences

### Positive
- **High extraction success rates**: 85-95% across major news sources
- **Preserved content integrity**: No risk of filtering legitimate content
- **Improved readability**: Proper paragraph separation maintained
- **Debuggable**: Clear visibility into extraction process
- **Safe filtering**: Structural patterns avoid content-based false positives

### Negative
- **Complex implementation**: Three extraction strategies increase code complexity
- **Site-specific maintenance**: Selectors may need updates as sites change
- **Limited filtering**: Some promotional content may still appear
- **Processing overhead**: Multiple extraction attempts add latency

### Neutral
- **Performance impact**: 50-200ms per article (acceptable)
- **Storage requirements**: Minimal increase for tracking data
- **Testing complexity**: Requires comprehensive test utilities

## Alternatives Considered

1. **Text-based content matching**: Rejected - too risky for false positives
2. **Machine learning classification**: Rejected - over-engineering for current needs
3. **Manual source configuration only**: Rejected - doesn't scale well
4. **Single extraction strategy**: Rejected - insufficient coverage

## Validation Metrics
Current performance across sources:
- BBC News: ~95% success rate
- CNN: ~90% success rate
- The Guardian: ~95% success rate
- Fox News: ~85% success rate (with filtering)
- NY Times: Limited (403 errors)
- WSJ: Limited (authentication required)

## Testing Infrastructure
Created comprehensive testing utilities (07-11) for:
- Visual debugging with HTML reports
- Batch source analysis
- E2E quality validation
- Paragraph spacing verification
- Content safety checks

## References
- Feature documentation: [Content Extraction System](../features/12-content-extraction.md)
- Related ADR: [ADR-004 Scraper Logging Separation](./ADR-004-scraper-logging-separation.md)
- Implementation files: `services/scraper/src/utils.ts`, `services/scraper/src/extraction-recorder.ts`
- Testing utilities: `utilities/07-extraction-analyzer.js` through `utilities/11-validate-extraction.js`