This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

This project uses **Supabase** as the database backend with a comprehensive factoid-based schema designed for news aggregation and content management.

### Database Schema

The database consists of several interconnected tables:

- **Sources** - News sources and publishers
- **Scraped Content** - Raw content from various sources
- **Factoids** - Processed news items (the central unit)
- **Tags** - Hierarchical categorization system
- **Factoid Tags** - Many-to-many relationship with confidence scores
- **Users** - User management and preferences
- **User Interactions** - Likes, comments, bookmarks

### Database Migration

#### Initial Setup

1. **Run the main migration script:**
   ```bash
   psql -d your_database -f database/veritas-migration.sql
   ```

2. **Apply tag linking improvements (optional):**
   ```bash
   psql -d your_database -f database/improve-tag-linking.sql
   ```

3. **Fix existing database issues (if needed):**
   ```bash
   psql -d your_database -f database/fix-existing-database.sql
   ```

#### Tag Linking System

The project uses an **improved tag linking system** that replaces hardcoded ILIKE conditions with a maintainable mapping approach:

**Features:**
- ✅ **Maintainable**: Easy to add/modify tag patterns
- ✅ **Multi-language**: Supports English and Hebrew content
- ✅ **Confidence Scores**: Different confidence levels per mapping
- ✅ **Flexible Matching**: Can match on title, description, or content
- ✅ **Organized**: Patterns grouped by category (AI, Finance, Israeli, etc.)

**Pattern Categories:**
- **AI & Technology**: NVIDIA, artificial intelligence, machine learning, chips, hardware
- **Finance & Economy**: Federal Reserve, interest rates, inflation, stock market
- **Israeli Content**: Hebrew patterns for Israeli tech, startups, and news
- **Startups**: Funding, venture capital, IPO, acquisitions
- **Future Categories**: Space, environment (ready for expansion)

**Example Mapping:**
```sql
('%NVIDIA%', 'ai', 0.95, 'title', 'NVIDIA is primarily an AI hardware company'),
('%Federal Reserve%', 'finance', 0.95, 'title', 'Fed is financial institution'),
('%ישראל%', 'israel', 0.95, 'title', 'Israel in Hebrew'),
```

#### Database Scripts

| Script | Purpose | Safe to Re-run |
|--------|---------|----------------|
| `veritas-migration.sql` | Initial database setup with sample data | ⚠️ Destructive (with backup) |
| `improve-tag-linking.sql` | Upgrade tag linking to improved system | ✅ Yes (idempotent) |
| `fix-existing-database.sql` | Fix security and performance issues in existing databases | ✅ Yes (idempotent) |

**Script Features:**
- **Transaction Safety**: All changes wrapped in transactions
- **Automatic Backup**: Creates timestamped backup tables before destructive operations
- **Security Hardening**: Proper row-level security policies with user authentication
- **NULL-Safe Indexes**: Full-text search indexes handle NULL values correctly
- **Robust Linking**: Fuzzy matching for factoid-source relationships
- **Validation**: Checks for required tables and valid mappings
- **Rollback Instructions**: Clear rollback procedures included
- **Progress Reporting**: Detailed status messages during execution

### Environment Setup

1. **Create a `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Configure Supabase:**
   - Create a new Supabase project
   - Run the migration scripts
   - Set up Row Level Security policies
   - Configure authentication (optional)

### Data Service

The project includes a comprehensive data service (`lib/data-service.ts`) with:

- **Type-safe functions** for all database operations
- **Error handling** with fallback mechanisms
- **Batch operations** for performance optimization
- **Full-text search** capabilities
- **Multi-language support** (English, Hebrew, Arabic)

**Key Functions:**
```typescript
// Fetch all factoids with pagination
getAllFactoids(page?: number, limit?: number): Promise<Factoid[]>

// Search factoids with full-text search
searchFactoids(query: string): Promise<Factoid[]>

// Get factoids by tag
getFactoidsByTag(tagSlug: string): Promise<Factoid[]>

// Get all tags with hierarchy
getAllTags(): Promise<Tag[]>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
