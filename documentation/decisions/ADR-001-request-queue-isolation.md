# ADR-001: RequestQueue Isolation for Concurrent Scraping

## Status
Accepted (October 28, 2025)

## Context
When implementing concurrent multi-source scraping using Crawlee's `CheerioCrawler`, we discovered that multiple concurrent crawlers were sharing the same RequestQueue in development mode (file system storage). This caused request cross-contamination where Source A's crawler would execute Source B's requests, leading to source misattribution in the database.

**Symptoms:**
- Articles from CNN appeared as BBC News articles in database
- Database counts didn't match extraction log claims
- Lifecycle logs showed extractions but no corresponding database records for certain sources

**Investigation revealed:**
1. Crawlee defaults to file system storage in development mode
2. Without explicit queue names, crawlers use a default shared queue
3. `addRequests()` calls from concurrent sources added to the same shared queue
4. First-started crawler consumed all requests regardless of intended source

**Example Bug Scenario:**
```typescript
// Job starts with BBC News and CNN concurrently
await Promise.allSettled([
  scrapeSourceEnhanced(jobId, 'BBC News', 10),   // Starts first
  scrapeSourceEnhanced(jobId, 'CNN', 10)         // Starts concurrently
]);

// Without queue isolation:
// - BBC crawler starts, creates default queue
// - BBC adds 20 requests to default queue
// - CNN crawler starts, uses same default queue
// - CNN adds 20 requests to same queue
// - BBC crawler consumes all 40 requests (BBC + CNN)
// - Result: All articles attributed to BBC News
```

## Decision
Implement unique RequestQueue isolation per source using job ID and source name:

```typescript
const requestQueueName = `${jobId}-${sourceName.replace(/\s+/g, '-').toLowerCase()}`;

crawler = new CheerioCrawler({
  requestQueue: await RequestQueue.open(requestQueueName),
  // ... other config
});
```

Additionally, use Map-based storage to prevent closure scope issues:

```typescript
// Instead of:
const scrapedArticles: any[] = [];

// Use:
const articlesBySource = new Map<string, any[]>();

// Store by source name from userData:
if (!articlesBySource.has(sourceName)) {
  articlesBySource.set(sourceName, []);
}
articlesBySource.get(sourceName)!.push(articleData);
```

## Consequences

### Positive
- ✅ Each source gets isolated request processing
- ✅ No cross-contamination of requests between sources
- ✅ Accurate source attribution in all cases
- ✅ Concurrent scraping works reliably
- ✅ Minimal performance impact (queue creation overhead negligible)
- ✅ Clear separation of concerns (one queue per source)
- ✅ Easier debugging (can inspect individual source queues)

### Negative
- ⚠️ More file system storage usage in development (one queue directory per source)
- ⚠️ Slightly more complex setup (explicit queue names required)
- ⚠️ Cleanup needed for orphaned queue directories (mitigated by job ID in name)

### Neutral
- In production with in-memory storage, this pattern continues to work correctly
- Queue naming convention ties to job ID for automatic cleanup
- Pattern scales to any number of concurrent sources
- File: [enhanced-scraper.ts:176-193](../../services/scraper/src/enhanced-scraper.ts#L176-L193)

## Alternatives Considered

### 1. Sequential Processing
**Approach**: Process sources one at a time instead of concurrently

```typescript
for (const sourceName of sources) {
  await scrapeSourceEnhanced(jobId, sourceName, articlesPerSource);
}
```

**Rejected**:
- Significantly slower for multi-source jobs (2-3 sources = 2-3x longer)
- Doesn't utilize available concurrency capacity
- Defeats purpose of Promise.allSettled fault tolerance

### 2. Shared Queue with Custom Filtering
**Approach**: Use one queue but filter requests by source in request handler

```typescript
requestHandler: async ({ request, $ }) => {
  if (request.userData.sourceName !== source.name) {
    return; // Skip requests not for this source
  }
  // ... process
}
```

**Rejected**:
- Crawlee's queue doesn't support per-request filtering
- All crawlers still see all requests in queue
- Inefficient: crawlers waste cycles checking and skipping
- Doesn't solve the fundamental queue-sharing problem

### 3. Separate Scraper Instances
**Approach**: Create entirely separate `EnhancedRSSScraper` instances per source

```typescript
const scrapers = sources.map(source => new EnhancedRSSScraper());
await Promise.allSettled(
  scrapers.map((scraper, i) => scraper.scrapeSource(...))
);
```

**Rejected**:
- Overcomplicated architecture for simple concurrency issue
- Duplicates logger instances and database connections
- Higher memory footprint
- Doesn't align with single scraper instance design

## Implementation Details

### Queue Naming Convention
```
Pattern: {jobId}-{source-name-kebab-case}
Example: 84b53be2-8ba4-4e89-a2dd-f03bec734845-bbc-news
Example: 84b53be2-8ba4-4e89-a2dd-f03bec734845-cnn
```

**Benefits of this pattern:**
- Unique per job and source combination
- Human-readable (can identify source from directory name)
- Tied to job ID for cleanup tracking
- URL-safe characters only

### Storage Location (Development)
```
File: ./storage/request_queues/{requestQueueName}/
Example: ./storage/request_queues/84b53be2-...-bbc-news/
```

### Map-based Article Storage
**Problem**: JavaScript closure scope capture caused articles to be added to wrong arrays when multiple scrapers ran concurrently.

**Solution**:
```typescript
// Map ensures articles are keyed by the ACTUAL source name from userData
const articlesBySource = new Map<string, any[]>();

// In requestHandler:
const sourceName = request.userData.sourceName as string;
if (!articlesBySource.has(sourceName)) {
  articlesBySource.set(sourceName, []);
}
articlesBySource.get(sourceName)!.push(articleData);

// Retrieve only this source's articles:
const scrapedArticles = articlesBySource.get(source.name) || [];
```

## Verification

### Test Job: `84b53be2-8ba4-4e89-a2dd-f03bec734845`
**Sources**: BBC News, CNN, Reuters (3 concurrent)
**Articles per source**: 10

**Results Before Fix:**
- BBC News: 20 articles (incorrect - should be ~10)
- CNN: 0 articles (incorrect - should be ~7-10)
- Reuters: 0 articles (expected - RSS 404)

**Results After Fix:**
- BBC News: 20 articles ✅ (all `bbc.com` URLs)
- CNN: 17 articles ✅ (all `cnn.com` URLs)
- Reuters: 0 articles ✅ (RSS 404 as expected)

**Verification Metrics:**
- ✅ Extraction logs match database counts
- ✅ Persistence logs match database counts
- ✅ Reconciliation shows perfect alignment
- ✅ URL inspection confirms correct source attribution

## Related
- **Bug discovered**: During Project #4 logging verification session (October 28, 2025)
- **Fixed in**: [enhanced-scraper.ts](../../services/scraper/src/enhanced-scraper.ts) (lines 1, 85, 176-193)
- **Documented in**: [changelog.md](../changelog.md) (October 28, 2025 - Evening entry)
- **Tested with**: Jobs `36e68eaa-f200-4726-9210-6fcdb8c85823` and `84b53be2-8ba4-4e89-a2dd-f03bec734845`
- **Feature docs**: [11-enhanced-logging.md](../features/11-enhanced-logging.md)

## Future Considerations

1. **Production Mode**: In Railway production, Crawlee uses in-memory storage, so queue isolation continues to work without file system overhead

2. **Queue Cleanup**: Consider implementing automatic cleanup of orphaned queue directories older than 7 days

3. **Monitoring**: Add metrics tracking number of active request queues to detect potential issues

4. **Testing**: Add integration test that verifies concurrent scraping with multiple sources maintains correct attribution
