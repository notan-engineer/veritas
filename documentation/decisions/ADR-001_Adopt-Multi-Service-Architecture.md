# ADR-001: Adopt Multi-Service Architecture

## Status
Accepted

## Context
The Veritas project needs to handle two distinct workloads:
1. User-facing web application for content consumption
2. Background content aggregation and scraping operations

These workloads have different resource requirements, scaling needs, and operational characteristics. The scraping service needs to run periodic jobs, manage external API calls, and handle potentially long-running operations. The UI service needs to be responsive, handle user requests, and serve content efficiently.

Railway's platform naturally supports multi-service architectures with shared databases, making it an ideal choice for separating these concerns.

## Decision
We will split the Veritas system into three Railway services:
- **UI Service**: Next.js application for user interface
- **Scraper Service**: Crawlee-based content aggregation system
- **Database Service**: Shared PostgreSQL instance used by both services

Services will communicate via:
- Shared database access (both services connect to same PostgreSQL)
- HTTP APIs (UI can trigger scraper operations via REST endpoints)

## Consequences

### Positive
- **Independent scaling**: Each service can scale based on its own needs
- **Isolation of failures**: Scraper issues won't affect UI availability
- **Clear separation of concerns**: UI focuses on presentation, scraper on data collection
- **Independent deployment**: Services can be updated without affecting each other
- **Resource optimization**: Different resource allocations per service type

### Negative
- **Increased complexity**: Managing multiple services vs monolithic application
- **Inter-service communication**: Need to handle service discovery and API contracts
- **Shared database coupling**: Both services depend on same database schema
- **Monitoring overhead**: Need to monitor multiple services independently

### Neutral
- Configuration split across multiple service definitions
- Logs separated by service (can be advantage or disadvantage)
- Development requires understanding service boundaries

## Alternatives Considered
1. **Monolithic Application**: Single Next.js app with background jobs
   - Rejected: Would couple UI performance with scraping operations
   - Background jobs would compete for resources with user requests

2. **Separate Databases**: Each service with its own database
   - Rejected: Would require complex data synchronization
   - Increases operational overhead without clear benefits

3. **Message Queue Architecture**: Services communicate via message queue
   - Rejected: Adds unnecessary complexity for current scale
   - Can be adopted later if needed

## Implementation Notes
- Use Railway's environment variable injection for service configuration
- Implement health checks for each service
- Create fallback behavior when scraper service is unavailable
- Document API contracts between services
- Use Railway CLI for local development with multiple services 