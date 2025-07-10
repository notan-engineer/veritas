# Veritas Development Guide

## Overview

This document provides comprehensive development setup, workflows, and coding standards for the Veritas application.

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (included with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Development Tools (Optional)
- **Railway CLI**: For deployment management
- **Docker**: For future services development

## Quick Start

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/[username]/veritas.git
cd veritas

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Environment Configuration

```bash
# Copy environment template
cd services/ui
cp .env.example .env.local
```

Edit `services/ui/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=development
```

### 3. Verify Setup

```bash
# From project root
npm run test:env

# Start development
npm run dev
```

Application available at `http://localhost:3000`.

## Project Structure

```
veritas/
├── services/
│   └── ui/                 # Next.js Frontend Application
│       ├── app/           # Next.js App Router pages
│       ├── components/    # React components
│       ├── lib/           # Utilities and services
│       └── public/        # Static assets
├── database/              # Database management
│   └── migrations/        # SQL migration files
├── infrastructure/        # Deployment configuration
│   └── railway.toml       # Railway deployment config
├── docs/                  # Documentation
└── planning/              # Project planning documents
```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start UI development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Testing
npm run test:env        # Test environment configuration
npm run test:smoke      # Build validation test
```

### Working with the UI Service

```bash
cd services/ui

# Development with hot reload
npm run dev

# Production build
npm run build

# Local production server
npm run start
```

## Coding Standards

### UI Framework Standards

This project uses **shadcn/ui** with **Next.js** as the primary UI framework.

#### Core Technologies

- **Next.js 15** - React framework with App Router
- **shadcn/ui** - Component library built on Radix UI and Tailwind CSS
- **Tailwind CSS v4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Lucide React** - Icon library

#### Component Architecture

**Available shadcn/ui Components:**
- `Button` - All button interactions
- `Card` - Content containers and layouts
- `Badge` - Status indicators and tags
- `Avatar` - User profile images
- `Switch` - Toggle controls
- `Skeleton` - Loading states
- `ThemeToggle` - Dark/light mode switching

**Usage Patterns:**
```tsx
// ✅ Correct: Import from ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ❌ Incorrect: Don't create custom components for basic UI elements
// Use shadcn/ui components instead of custom implementations
```

#### Styling Guidelines

- Use Tailwind CSS classes for all styling
- Follow the established design system colors and spacing
- Use CSS variables for theme-aware styling
- Maintain RTL support for Hebrew and Arabic content

```tsx
// ✅ Correct: Use Tailwind classes with theme variables
<Card className="bg-background border-border hover:shadow-lg transition-all">
  <CardContent className="p-6 space-y-4">
    <h2 className="text-foreground text-xl font-semibold">
      Content Title
    </h2>
  </CardContent>
</Card>
```

### Code Organization

#### File Structure
```
services/ui/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── data-service.ts    # Database operations
│   ├── supabase.ts        # Supabase client
│   ├── utils.ts           # Utility functions
│   └── rtl-utils.ts       # RTL support utilities
└── public/                # Static assets
```

#### Component Development
```tsx
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

#### Database Operations
```tsx
// Use the data service layer
import { getFactoidById } from '@/lib/data-service';

// Async operations with error handling
try {
  const factoid = await getFactoidById(id);
  // Handle success
} catch (error) {
  console.error('Failed to fetch factoid:', error);
}
```

### TypeScript Standards

- **Strict mode enabled**
- **Comprehensive interfaces** for all data models
- **Type-safe database operations**
- **Proper error handling**

### Responsive Design

- **Mobile-first approach**
- **Standard breakpoints**: `sm:`, `md:`, `lg:`, `xl:`
- **Consistent spacing and typography**

```tsx
// ✅ Responsive design pattern
<div className="px-4 sm:px-0">
  <div className="text-sm sm:text-base md:text-lg">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Responsive content */}
    </div>
  </div>
</div>
```

### RTL Support

- Use RTL utility functions from `lib/rtl-utils.ts`
- Test Hebrew and Arabic content layout
- Ensure proper text direction and alignment

```tsx
// ✅ RTL support pattern
import { getRTLClasses, getRTLContainerClasses } from "@/lib/rtl-utils";

<div className={`${getRTLContainerClasses(factoid.language)}`}>
  <h2 className={`${getRTLClasses(factoid.language)}`}>
    {factoid.title}
  </h2>
</div>
```

### Performance Guidelines

- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Dynamic imports for heavy components
- **Loading States**: Skeleton components for better UX
- **Error Boundaries**: Graceful error handling

## Database Development

### Current Setup (Supabase)
- **Dashboard**: Access via Supabase web interface
- **Local Development**: Connect to hosted Supabase instance
- **Schema Changes**: Apply via Supabase dashboard or SQL editor

### Data Service

The project includes a comprehensive data service (`lib/data-service.ts`) with:

- **Type-safe functions** for all database operations
- **Error handling** with fallback mechanisms
- **Batch operations** for performance optimization
- **Full-text search** capabilities
- **Multi-language support** (English, Hebrew, Arabic)

**Key Functions:**
```typescript
// Core data operations
getAllFactoids(): Promise<Factoid[]>
getFactoidById(id: string): Promise<Factoid | null>
getFactoidsByTag(tagSlug: string): Promise<Factoid[]>
searchFactoids(query: string): Promise<Factoid[]>
getAllTags(): Promise<Tag[]>
```

## Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **feature/[name]**: New features
- **fix/[name]**: Bug fixes

### Commit Conventions
```bash
# Format: type(scope): description
feat(ui): add factoid search functionality
fix(database): resolve connection timeout issue
docs(readme): update setup instructions
refactor(components): improve card component structure
```

### Pull Request Process
1. Create feature branch from main
2. Develop and test changes locally
3. Push branch and create PR
4. Code review and approval
5. Merge to main (triggers deployment)

## Testing

### Local Testing
```bash
# Environment validation
npm run test:env

# Build validation
npm run test:smoke

# Manual testing checklist:
# - Homepage loads correctly
# - Factoid pages render with data
# - Settings page accessible
# - Navigation works properly
# - Responsive design functions
# - RTL languages display correctly
```

## Development Tools

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

## Deployment

### Railway Platform
- **Platform**: Railway
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Production environment variables configured

### Deployment Process
1. **Automatic**: Push to main branch triggers deployment
2. **Manual**: Use Railway CLI or dashboard

## Troubleshooting

### Common Issues
1. **Port Already in Use**: Kill process on port 3000
2. **Environment Variables**: Verify `.env.local` exists and has correct values
3. **Build Errors**: Clear Next.js cache (`rm -rf .next`)
4. **Database Connection**: Check Supabase URL and key

### Debug Commands
```bash
# Check environment
npm run test:env

# Verbose logging
DEBUG=* npm run dev

# Database connection test
# (verify in browser console)
```

## Performance Optimization

### Development
- Use Next.js Fast Refresh
- Implement proper code splitting
- Monitor Core Web Vitals
- Optimize bundle size

### Production
- Implement error boundaries
- Add loading states for async operations
- Optimize images and static assets
- Configure proper caching headers

## Best Practices

### Component Development
1. **Single Responsibility**: One purpose per component
2. **Type Safety**: Props interfaces for all components
3. **Accessibility**: Proper ARIA attributes and keyboard navigation
4. **Reusability**: Use shadcn/ui patterns for consistency

### Data Management
1. **Error Handling**: Graceful fallbacks for failed operations
2. **Loading States**: Skeleton components during data fetching
3. **Batch Operations**: Avoid N+1 query problems
4. **Type Safety**: Use TypeScript interfaces throughout

### Code Quality
1. **ESLint**: Follow configured rules
2. **Prettier**: Consistent code formatting
3. **TypeScript**: Strict mode enabled
4. **Testing**: Write tests for critical functionality

This guide covers the essential development practices for the Veritas project. Update this document as the project evolves and new patterns emerge. 