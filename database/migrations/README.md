# Database Migrations

## Applied Migrations

### 2025-07-26: Granular Job Statuses
- **Purpose**: Enhanced job status tracking
- **Changes**: 
  - Created job_status enum type
  - Converted status column from VARCHAR to enum
  - Mapped: pending→new, running→in-progress, completed→successful
- **Rollback**: Included in migration file