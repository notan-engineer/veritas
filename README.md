# Veritas

A modern news aggregation platform that transforms traditional news consumption by presenting verified information through structured "factoids" instead of lengthy articles.

## Overview

**Veritas** combats information overload by providing factual, multi-sourced summaries of current events. The system processes news from multiple sources and presents verified facts in an easily digestible format, with first-class support for Hebrew and Arabic content.

## Quick Start

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

## Technology Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Database**: Supabase (PostgreSQL)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **Deployment**: Railway
- **Language**: TypeScript (strict mode)

## Key Features

- **Factoid-based News**: Structured summaries instead of full articles
- **Multi-source Verification**: Every factoid linked to verified sources
- **Multilingual Support**: Native Hebrew/Arabic RTL support
- **Responsive Design**: Optimized for mobile and desktop
- **Dark/Light Theme**: Built-in theme switching
- **Performance Optimized**: Sub-2-second page loads

## Documentation

For detailed information, see the `documentation/` directory:

- **[Product Requirements](documentation/product-requirements.md)** - User requirements, use cases, and business logic
- **[Technical Design](documentation/technical-design.md)** - Architecture, tech stack, and system design
- **[Developer Guidelines](documentation/developer-guidelines.md)** - Development standards and best practices
- **[Planning](documentation/planning/)** - Historical project planning documents and implementation records

## Development Workflow

1. **Create feature branch** from main
2. **Follow developer guidelines** in documentation/
3. **Update relevant documentation** with changes
4. **Test thoroughly** before pushing
5. **Manual review and merge** to main

**Important**: Never push directly to main branch. All changes must go through feature branches.

## Deployment

- **Platform**: Railway with automatic deployments
- **Environment**: Production variables configured
- **Monitoring**: Railway built-in observability

## Contributing

Please read the [Developer Guidelines](documentation/developer-guidelines.md) before contributing. Key principles:

- **Simplicity first** - write minimal, maintainable code
- **Cost consciousness** - consider cloud costs in all decisions  
- **Security by design** - follow security best practices
- **Documentation updates** - update docs with every relevant change

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
