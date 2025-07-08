# Veritas Development Setup

## Overview

This document provides comprehensive setup instructions for developing the Veritas application locally, including environment configuration, development workflows, and best practices.

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (included with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Development Tools (Optional but Recommended)
- **Railway CLI**: For deployment and environment management
- **Supabase CLI**: For database management (Phase 1)
- **Docker**: For containerized development (future services)

## Project Setup

### 1. Repository Clone and Setup

```bash
# Clone the repository
git clone https://github.com/[username]/veritas.git
cd veritas

# Install root-level dependencies (for development scripts)
npm install

# Install UI service dependencies
npm run install:all
```

### 2. Environment Configuration

#### Create Local Environment File
```bash
# Copy environment template (in services/ui directory)
cd services/ui
cp .env.example .env.local
```

#### Configure Environment Variables
Edit `services/ui/.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xicalfkgycgtvjvexdtc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Development Settings
NODE_ENV=development
```

**Note**: Contact team lead for actual Supabase credentials.

### 3. Verify Setup

```bash
# From project root
npm run test:env

# Start development server
npm run dev
```

The application should be available at `http://localhost:3000`.

## Development Workflow

### Directory Structure
```
veritas/
├── services/
│   ├── ui/                 # Next.js Frontend (active development)
│   ├── scraping/          # Future: Scraping Service
│   └── llm/               # Future: LLM Service
├── shared/                # Shared utilities
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Common utilities
│   └── config/            # Shared configuration
├── database/              # Database management
│   ├── migrations/        # SQL migration files
│   ├── seeds/             # Database seeds
│   └── schemas/           # Schema definitions
├── infrastructure/        # Deployment configuration
│   ├── docker/            # Docker configurations
│   └── scripts/           # Deployment scripts
└── docs/                  # Documentation
```

### Available Scripts (Root Level)

```bash
# Development
npm run dev              # Start UI development server
npm run ui:dev          # Alias for dev

# Building
npm run build           # Build UI service for production
npm run ui:build        # Alias for build

# Testing
npm run test:env        # Test environment configuration
npm run test:smoke      # Run build test

# Utilities
npm run install:all     # Install dependencies for all services
npm run lint           # Run linting
```

### UI Service Development

#### Working in services/ui/
```bash
cd services/ui

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Linting
npm run lint
```

#### Key Technologies
- **Framework**: Next.js 15.3.5 with App Router
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Database**: Supabase client

### Code Organization

#### UI Service Structure
```
services/ui/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   ├── article/           # Article pages
│   │   └── [id]/page.tsx  # Dynamic article page
│   └── settings/          # Settings pages
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and services
│   ├── supabase.ts       # Database client
│   ├── data-service.ts   # Data access layer
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

#### Shared Components
```
shared/
├── types/                # TypeScript interfaces
├── utils/                # Cross-service utilities
└── config/               # Shared configuration
```

## Development Best Practices

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js and React rules
- **Prettier**: Automatic code formatting
- **Naming**: Use descriptive, camelCase names

### Component Development
```typescript
// Example component structure
interface ComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function Component({ title, children }: ComponentProps) {
  return (
    <div className="component-container">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Database Operations
```typescript
// Use the data service layer
import { getArticle } from '@/lib/data-service';

// Async operations with error handling
try {
  const article = await getArticle(id);
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to fetch article:', error);
}
```

### Environment Handling
```typescript
// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Always check for required environment variables
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}
```

## Testing

### Local Testing
```bash
# Environment validation
npm run test:env

# Build validation (smoke test)
npm run test:smoke

# Manual testing checklist:
# - Homepage loads correctly
# - Article pages render with data
# - Settings page accessible
# - Navigation works properly
# - Responsive design functions
```

### Future Testing Framework
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **API Tests**: Custom test suite

## Database Development

### Current (Phase 1): Supabase
- **Dashboard**: Access via Supabase web interface
- **Local Development**: Connect to hosted Supabase instance
- **Schema Changes**: Apply via Supabase dashboard or SQL editor

### Future (Phase 2): Railway PostgreSQL
- **Local Database**: Docker PostgreSQL container
- **Migrations**: SQL files in `database/migrations/`
- **Seeds**: Test data in `database/seeds/`

## Debugging

### Development Server Debugging
```bash
# Verbose logging
DEBUG=* npm run dev

# Check environment variables
npm run test:env

# Database connection test
# (test query in browser console)
```

### Common Issues and Solutions

1. **Port Already in Use**:
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **Environment Variable Issues**:
   ```bash
   # Verify .env.local exists and has correct values
   cat services/ui/.env.local
   ```

3. **Build Errors**:
   ```bash
   # Clear Next.js cache
   cd services/ui && rm -rf .next
   npm run build
   ```

4. **Database Connection Issues**:
   - Verify Supabase URL and key
   - Check network connectivity
   - Review Supabase project status

## Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **feature/[name]**: New features
- **fix/[name]**: Bug fixes
- **docs/[name]**: Documentation updates

### Commit Conventions
```bash
# Format: type(scope): description
feat(ui): add article search functionality
fix(database): resolve connection timeout issue
docs(api): update endpoint documentation
refactor(components): improve button component structure
```

### Pull Request Process
1. Create feature branch from main
2. Develop and test changes locally
3. Push branch and create PR
4. Code review and approval
5. Merge to main (triggers deployment)

## Development Tools Configuration

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- ESLint
- Prettier - Code formatter
- GitLens

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Future Development (Phase 2)

### Scraping Service Development
- **Language**: Python or Node.js
- **Framework**: TBD (Beautiful Soup, Scrapy, or Playwright)
- **Development**: Docker container for local development

### LLM Service Development
- **Language**: Python
- **Framework**: FastAPI or Flask
- **Models**: Llama 2/3, Mistral integration
- **Development**: Docker container with GPU support

### Inter-Service Communication
- **API Design**: RESTful APIs
- **Authentication**: Service-to-service tokens
- **Monitoring**: Distributed tracing

## Performance Considerations

### Development Optimization
- Use Next.js development features (Fast Refresh, etc.)
- Implement proper code splitting
- Optimize bundle size with dynamic imports
- Monitor Core Web Vitals during development

### Production Preparation
- Implement proper error boundaries
- Add loading states for async operations
- Optimize images and static assets
- Configure proper caching headers

## Troubleshooting Guide

### Common Development Issues
1. **Slow development server**: Clear cache and restart
2. **TypeScript errors**: Ensure all types are properly defined
3. **Styling issues**: Check Tailwind CSS configuration
4. **API errors**: Verify environment variables and network connectivity

### Getting Help
- Check existing documentation
- Review error messages carefully
- Use browser developer tools
- Consult team members or create issue

## Contributing Guidelines

### Before Contributing
1. Read and understand the codebase
2. Follow established patterns and conventions
3. Write clear, descriptive commit messages
4. Test changes thoroughly

### Code Review Checklist
- Code follows project conventions
- No console.log statements in production code
- Proper error handling implemented
- TypeScript types are correctly defined
- Documentation updated if necessary 