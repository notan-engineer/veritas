# Veritas

A modern news aggregation platform that transforms traditional news consumption by presenting verified information through structured "factoids" instead of lengthy articles.

## Overview

**Veritas** combats information overload by providing factual, multi-sourced summaries of current events. The system processes news from multiple sources and presents verified facts in an easily digestible format.

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/veritas.git
cd veritas

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
veritas/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with news feed
│   ├── layout.tsx         # Root layout
│   ├── article/[id]/      # Dynamic article pages
│   └── settings/          # Settings pages
├── components/            # React components
│   └── ui/               # Reusable UI components (shadcn/ui)
├── lib/                  # Utilities and services
│   ├── data-service.ts   # Database operations
│   ├── supabase.ts       # Database client
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── database/             # Database management
│   └── migrations/       # SQL migration files
├── infrastructure/       # Deployment configuration
│   └── railway.toml      # Railway deployment config
└── docs/                 # Documentation
```

## Technology Stack

### Core Technologies
- **Framework**: Next.js 15.3.5 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives via shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Railway

### Database

This project uses **Supabase** as the database backend with a comprehensive factoid-based schema designed for news aggregation and content management.

#### Database Schema

The database consists of several interconnected tables:

- **Sources** - News sources and publishers
- **Scraped Content** - Raw content from various sources
- **Factoids** - Processed news items (the central unit)
- **Tags** - Hierarchical categorization system
- **Factoid Tags** - Many-to-many relationship with confidence scores
- **Users** - User management and preferences
- **User Interactions** - Likes, comments, bookmarks

#### Database Migration

**Initial Setup:**
```bash
psql -d your_database -f database/migrations/veritas-migration.sql
```

#### Key Features
- **Factoid-Centric Design**: News presented as structured facts
- **Multi-source Verification**: Every factoid linked to multiple verified sources
- **Multi-language Support**: First-class Hebrew and Arabic support with RTL handling
- **Performance Optimized**: Batch queries and efficient database operations
- **Type-Safe**: Comprehensive TypeScript usage throughout

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

## Core Features

### Content Management
- **News Aggregation**: Ingestion from multiple sources with metadata preservation
- **Factoid Processing**: Conversion of articles into structured, bullet-pointed summaries
- **Multi-language Support**: Native Hebrew/Arabic RTL support with language-specific formatting
- **Tag-based Organization**: Intelligent categorization with confidence scoring

### User Experience
- **Feed Interface**: Card-based layout with expandable summaries
- **Topic Filtering**: Dynamic filtering by tags/categories
- **Article Details**: Full factoid view with source verification
- **Responsive Design**: Optimized for mobile and desktop consumption
- **Dark/Light Theme**: Built-in theme switching

### Performance Features
- **Search Capabilities**: Full-text search with fallback mechanisms
- **Source Tracking**: Multiple source attribution with relevance scoring
- **Content Verification**: Confidence scoring for factoids and tag associations
- **Performance Optimization**: Batch queries to prevent N+1 problems

## Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js and React rules
- **Component Development**: Uses shadcn/ui design system
- **RTL Support**: Built-in right-to-left text support

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Deployment

The application is deployed on Railway with automatic deployments from the main branch.

- **Platform**: Railway
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Production environment variables configured

## Contributing

1. Create a feature branch from main
2. Develop and test changes locally
3. Push branch and create PR
4. Code review and approval
5. Merge to main (triggers deployment)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about the database platform
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - re-usable components built using Radix UI and Tailwind CSS
