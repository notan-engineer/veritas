# ADR-004: Crawlee Storage Strategy for Production

## Status
Accepted (September 23, 2025)

## Context
The scraper service was failing in production (Railway) while working perfectly in local development. Investigation revealed that Crawlee's default file system storage was incompatible with Railway's ephemeral container environment.

**Problem manifestation:**
- Local environment: 60 articles requested → 90 received and scraped successfully
- Production environment: 60 articles requested → 0 received, job marked as successful
- Error: `ENOENT: no such file or directory, open '/app/storage/request_queues/default/[id].json'`

## Decision
Configure Crawlee to use in-memory storage when running in production (`NODE_ENV=production`) while preserving file system storage for local development.

**Implementation approach:**
1. Early configuration in `api-server.ts` before any Crawlee imports
2. Backup configuration in `EnhancedRSSScraper` constructor
3. Remove manual file system directory creation attempts

## Consequences

### Positive
- **Immediate production fix**: Scraper works in containerized environments
- **No local regression**: Development environment continues using file system storage
- **Simpler deployment**: No need for persistent volume configuration in Railway
- **Better performance**: In-memory storage is faster than file I/O
- **Stateless operation**: Aligns with container best practices

### Negative
- **No persistence between restarts**: Crawler state lost on container restart (acceptable since each job is independent)
- **Memory usage**: Storage now uses RAM instead of disk (minimal impact for our use case)
- **No request queue recovery**: Failed requests can't be recovered after crash (mitigated by job-level recovery)

### Neutral
- Different storage strategies between environments (clearly documented and logged)
- Crawlee's advanced features like request queue persistence are unavailable in production

## Technical Details

**Code changes:**
```javascript
// In api-server.ts (early configuration)
import { Configuration } from 'crawlee';
if (process.env.NODE_ENV === 'production') {
  Configuration.set('persistStorage', false);
}

// In EnhancedRSSScraper constructor (backup)
if (process.env.NODE_ENV === 'production') {
  Configuration.set('persistStorage', false);
}
```

**Testing approach:**
- Created `utilities/test-crawlee-storage.js` to verify both modes
- Confirms development uses file system storage
- Confirms production uses in-memory storage

## Alternatives Considered

1. **Persistent volume in Railway**: Would require additional configuration and cost
2. **Redis/External storage**: Over-engineering for our stateless use case
3. **Disable Crawlee queue entirely**: Would lose retry and concurrency management benefits

## References
- Crawlee Documentation: [Storage Configuration](https://crawlee.dev/docs/guides/configuration)
- Railway Documentation: [Ephemeral Storage](https://docs.railway.app/reference/runtime#ephemeral-storage)
- Related commits: b15b6bf