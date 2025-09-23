# ADR-007: Multi-Element Content Extraction Strategy

## Status
Accepted

## Date
2025-09-23

## Context
The Veritas scraper was experiencing severe extraction failures with success rates dropping to 0% for certain news sources, particularly BBC News. Investigation revealed that modern news websites often distribute article content across multiple DOM elements rather than a single container, causing our single-element extraction approach to miss most of the content.

### Problem Details
- **BBC News**: Article content split across multiple `[data-component="text-block"]` elements
- **Success Rate**: Dropped from ~47% to 0% for affected sources
- **Root Cause**: Extraction logic only processed the first matching element
- **Impact**: Critical data loss affecting the core value proposition of the platform

## Decision
We will implement a **multi-element extraction strategy** with cascading fallbacks to handle diverse DOM structures across news sources.

### Implementation Approach
1. **Multi-Element Processing**: When a selector matches multiple elements, aggregate content from ALL matching elements
2. **Enhanced Fallback Cascade**: Implement multiple extraction strategies that progressively degrade from specific to general
3. **Source-Specific Handlers**: Add targeted selectors for known source patterns while maintaining generic fallbacks

## Consequences

### Positive
- **Improved Extraction Success**: Restored extraction capability for BBC and similar multi-element layouts
- **Greater Resilience**: System can adapt to various DOM structures without code changes
- **Future-Proof**: Pattern supports adding new source-specific handlers without breaking existing ones
- **Better Content Completeness**: Captures all article content, not just first section

### Negative
- **Increased Complexity**: Extraction logic is more complex with multiple strategies
- **Performance Impact**: Processing multiple elements takes slightly more time
- **Potential Duplication**: Risk of duplicate content if not properly deduplicated
- **Debugging Difficulty**: Harder to trace which extraction strategy was used

### Neutral
- **Memory Usage**: Marginal increase from processing multiple elements
- **Testing Requirements**: Need more comprehensive tests for various DOM patterns

## Alternatives Considered

### 1. JavaScript Rendering (Puppeteer/Playwright)
- **Pros**: Would handle all dynamic content perfectly
- **Cons**: 10x slower, higher resource usage, complexity
- **Decision**: Rejected for now, keep as future option for specific sources

### 2. Source-Specific Extractors Only
- **Pros**: Optimal for each source
- **Cons**: High maintenance, breaks with site changes, no fallback
- **Decision**: Rejected in favor of hybrid approach

### 3. AI-Based Content Detection
- **Pros**: Could intelligently identify content
- **Cons**: Slow, expensive, unpredictable
- **Decision**: Rejected for core extraction, possible future enhancement

## Implementation Details

### Code Changes
- `services/scraper/src/extraction-recorder.ts`: Modified to process ALL matching elements
- `services/scraper/src/utils.ts`: Added BBC-specific selectors and patterns
- `services/scraper/src/enhanced-scraper.ts`: Implemented fallback cascade

### Extraction Strategy Order
1. JSON-LD structured data
2. Source-specific selectors (BBC, NYTimes, Guardian, etc.)
3. Generic article selectors
4. Meta tag fallback
5. Body text extraction (last resort)

### Key Pattern
```typescript
// Process all matching elements, not just first
elements.each((index, element) => {
  // Extract and aggregate content
});
```

## References
- Commit: 52ed9c9 - "fix(scraper): improve content extraction for BBC and other sources"
- Related Issue: Scraper extraction failures investigation
- Documentation: `keystone/procedures/scraper-debugging.md`

## Lessons Learned
1. Modern websites increasingly use component-based architectures that distribute content
2. Single-element assumptions are fragile in web scraping
3. Fallback strategies are essential for production reliability
4. Source-specific optimizations should augment, not replace, generic strategies

## Future Considerations
- Monitor extraction success rates per source
- Consider adding Playwright for JavaScript-heavy sites
- Implement extraction strategy analytics to optimize selector order
- Add automatic selector learning from successful extractions