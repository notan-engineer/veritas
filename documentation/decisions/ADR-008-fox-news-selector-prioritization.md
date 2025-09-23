# ADR-008: Fox News Selector Prioritization Strategy

## Status
Accepted (September 23, 2025)

## Context
The scraper was experiencing inconsistent content extraction from Fox News articles, returning 0 articles despite content being available. Testing revealed that Fox News uses a specific `.article-body` selector that wasn't being prioritized in the extraction selector list.

**Problem manifestation:**
- Fox News extraction success rate: ~85% (below other sources)
- Playwright could extract 8,954 characters from test articles
- Scraper was returning 0 articles from same URLs
- Generic selectors were failing to match Fox News content structure

## Decision
Prioritize the `.article-body` selector early in the extraction selector list to improve Fox News content extraction reliability.

**Implementation:**
- Move `.article-body` selector to position 2 in the selector array (after structured data check)
- Ensure Fox News specific selector is tried before generic fallbacks
- Maintain existing selector fallback chain for other sources

## Consequences

### Positive
- **Improved Fox News extraction**: Success rate increased from ~85% to ~90%
- **Better content coverage**: More articles successfully extracted from Fox News
- **Consistent extraction**: Reliable extraction across different Fox News article layouts
- **No regression**: Other sources continue to work with existing selectors

### Negative
- **Site-specific optimization**: Creates precedent for source-specific selector ordering
- **Maintenance overhead**: May need similar adjustments for other problematic sources

### Neutral
- Selector prioritization is a common practice in web scraping
- Change is minimal and doesn't affect overall extraction architecture

## Technical Details

**Selector order before:**
```javascript
const selectors = [
  '[itemprop="articleBody"]',
  '.article-wrap .article-body',  // Fox-specific was buried here
  '.article-content',
  // ... other selectors
];
```

**Selector order after:**
```javascript
const selectors = [
  '[itemprop="articleBody"]',
  '.article-body',                // Fox-specific prioritized
  '.article-wrap .article-body',
  '.article-content',
  // ... other selectors
];
```

**Testing approach:**
- Created `utilities/test-fox-extraction.js` for Fox News specific testing
- Verified extraction success with prioritized selector
- Confirmed no impact on other sources

## Alternatives Considered

1. **Site-specific extraction handlers**: Would provide maximum flexibility but adds complexity
2. **Dynamic selector ordering**: Could reorder based on source domain but over-engineering for current need
3. **Multiple extraction attempts**: Could try all selectors but reduces performance

## References
- Test utility: `utilities/test-fox-extraction.js`
- Implementation: `services/scraper/src/utils.ts`
- Related commits: 33c08f5 (crawler teardown fix included Fox News improvements)