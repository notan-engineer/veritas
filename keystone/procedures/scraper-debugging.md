# Keystone Procedure: Scraper Debugging

## Overview
This procedure provides systematic approaches for debugging scraper issues, analyzing site structures, and developing scraping strategies using both traditional methods and advanced tools like Playwright MCP.

## When to Use This Procedure
- Scraper fails to extract content from a source
- Source website structure changes unexpectedly
- Developing extraction strategy for new sources
- Validating scraped content accuracy
- Performance issues with specific sites

## Debugging Workflow

### Phase 1: Initial Analysis
1. **Check scraper logs** using `node 06-test-logs.js <job-id>`
2. **Test basic connectivity** with `node 03-test-scraper.js`
3. **Visual extraction debugging** with `node 07-extraction-analyzer.js`
4. **Verify source accessibility** via simple HTTP fetch

### Phase 2: Advanced Investigation (Playwright MCP)
When initial analysis doesn't reveal the issue:

**Site Structure Analysis:**
- Use Playwright to capture full page screenshots
- Inspect DOM structure for changes in content selectors
- Test JavaScript-dependent content loading
- Analyze network requests and responses

**Content Extraction Validation:**
- Compare Playwright-extracted content with scraper results
- Verify CSS selectors still target correct elements
- Test different viewport sizes and user agents
- Check for anti-bot measures (rate limiting, CAPTCHAs)

**Dynamic Content Testing:**
- Wait for JavaScript content to load
- Test interaction flows (clicking, scrolling)
- Capture element-specific screenshots
- Monitor network activity during page load

### Phase 3: Strategy Development
**For New Sources:**
- Use Playwright to understand site architecture
- Identify optimal extraction points
- Test selector stability across multiple pages
- Develop fallback strategies for content changes

**For Existing Sources:**
- Compare current vs previous site structure
- Identify specific changes affecting extraction
- Test updated selectors before deployment
- Validate extraction accuracy

## Tool Selection Guidelines

### Use Traditional Methods When:
- Simple HTTP connectivity issues
- Basic selector problems
- Rate limiting or timeout issues
- Database connectivity problems

### Use Playwright MCP When:
- JavaScript-heavy sites
- Dynamic content loading
- Complex interaction requirements
- Visual validation needed
- Site structure analysis required
- Anti-bot detection suspected

## Integration with Existing Utilities

### Enhanced Testing Scripts
Core debugging utilities:
- `07-extraction-analyzer.js` - Visual side-by-side extraction debugging with HTML report generation
- `08-analyze-all-sources.js` - Batch analysis across all configured sources
- `09-e2e-extraction-test.js` - Comprehensive extraction quality validation
- `10-test-spacing.js` - Paragraph spacing and structure validation
- `11-validate-extraction.js` - Content preservation and filtering safety checks
- `03-test-scraper.js` - End-to-end scraper testing
- `06-test-logs.js` - Log analysis and performance metrics

Advanced capabilities can be integrated:
- `04-test-api.js` - Test with real browser contexts
- Playwright MCP - For complex JavaScript-heavy debugging scenarios
- Real-time extraction tracking with `enableTracking` parameter

### Development Workflow
1. **Start with visual analysis** using `07-extraction-analyzer.js` for immediate side-by-side debugging
2. **Run comprehensive tests** with `09-e2e-extraction-test.js` for quality validation
3. **Validate spacing** with `10-test-spacing.js` to ensure proper paragraph preservation
4. **Use log analysis** with `06-test-logs.js` for performance and error insights
5. **Enable extraction tracking** in API calls for real-time debugging
6. **Escalate to Playwright MCP** when complex JavaScript debugging is needed
7. **Document findings** in source management system
8. **Update extraction strategies** based on insights

## Best Practices

### Efficient Debugging
- Begin with simplest diagnostic methods
- Use Playwright for complex scenarios only
- Document all findings for future reference
- Test solutions across multiple source pages

### Resource Management
- Run Playwright in headless mode for automated testing
- Use headed mode only for active debugging sessions
- Clean up browser resources after debugging
- Consider rate limiting when testing live sources

### Documentation
- Record site structure changes in source management
- Update extraction patterns based on findings
- Share insights with team via Keystone documentation
- Maintain debugging notes for recurring issues

## Common Debugging Scenarios

### Scenario 1: Content Not Extracting
1. Generate extraction report with `07-extraction-analyzer.js`
2. Enable extraction tracking via API `enableTracking: true`
3. Verify selectors with Playwright DOM inspection
4. Check for dynamic loading delays
5. Test alternative extraction methods (JSON-LD, selectors, meta tags)
6. Validate content existence on source page

### Scenario 2: Partial Content Extraction
1. Run `11-validate-extraction.js` to check filtering safety
2. Verify paragraph spacing with `10-test-spacing.js`
3. Screenshot comparison between expected and actual
4. Element-specific selector testing
5. Check for structural filtering (ALL CAPS + links)
6. JavaScript execution timing analysis
7. Content format validation

### Scenario 3: Source Site Changes
1. Full page structural comparison
2. Selector migration path identification
3. Impact assessment across all source pages
4. Fallback strategy development

## Success Metrics
- Reduced debugging time through systematic approach
- Improved extraction accuracy (target: >90% per source)
- Faster adaptation to source changes
- Enhanced understanding of site architectures
- Paragraph structure preservation with triple newlines
- Minimal false positives in content filtering

## Related Procedures
- `local-testing.md` - For testing scraped changes
- `api-development.md` - For API endpoint debugging
- `error-resolution.md` - For systematic error handling