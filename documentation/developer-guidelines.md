# Veritas Developer Guidelines

## Purpose & Scope

This document establishes development standards, practices, and guardrails for the Veritas project. These guidelines are designed to be understood and followed by both human developers and AI coding assistants (LLMs) to ensure consistent, safe, and cost-effective development.

## Core Development Principles

### 1. **Simplicity First**
- **Write the minimum code necessary** to achieve the goal
- **Favor existing solutions** over creating new ones
- **Question complexity** - if something seems complex, find a simpler approach
- **Prioritize readability** over clever optimization
- **Use established patterns** rather than inventing new ones

### 2. **Change Minimization**
- **Analyze before coding** - understand the full scope before making changes
- **Change as little as possible** to achieve the objective
- **Prefer configuration changes** over code changes when possible
- **Test changes thoroughly** in development before committing
- **Document the reasoning** behind each significant change

### 3. **Cost Consciousness**
- **Always consider cloud costs** before implementing features that scale
- **Use free tiers** and cost-optimized services (Railway, Supabase free tier)
- **Monitor resource usage** and set up alerts for cost overruns
- **Question features** that require expensive infrastructure
- **Review cost implications** of database queries, API calls, and storage

### 4. **Security & Privacy By Design**
- **Validate all inputs** on the server side
- **Use environment variables** for all secrets and configuration
- **Apply principle of least privilege** for all access controls
- **Never log sensitive information** (passwords, API keys, personal data)
- **Regular security updates** for all dependencies

## Mandatory Documentation Practices

### Documentation Update Requirements

**CRITICAL**: These documentation files MUST be updated with every relevant commit:

1. **`documentation/product-requirements.md`** - Update when:
   - User experience changes
   - New features are added or removed
   - Business logic modifications
   - User interface changes
   - Performance requirements change

2. **`documentation/technical-design.md`** - Update when:
   - Architecture changes
   - Technology stack modifications
   - Database schema changes
   - New services or components added
   - Infrastructure changes

3. **`documentation/developer-guidelines.md`** - Update when:
   - Development practices change
   - New tools or processes are adopted
   - Security requirements evolve
   - Cost considerations change

### Planning Documentation Requirements

**MANDATORY**: For any larger changes or projects, create a comprehensive planning document in `documentation/planning/`.

#### Planning File Standards

**File Naming Convention:**
```
DD-MM-YY - [Project Short Name].md           # Active planning
DD-MM-YY - [Project Short Name] - DONE.md    # Completed project
```

**Required File Structure:**
```markdown
# [Project Name] Plan

**Plan Created:** [Date]
**Last Updated:** [Date]
**Status:** [🔄 IN PROGRESS | ⏸️ PAUSED | ✅ FULLY IMPLEMENTED | ❌ CANCELLED]
**Project:** [Brief description]

---

## Executive Summary
[Objective, rationale, expected outcome]

## Implementation Plan
### Phase 1: [Phase Name] [Status Icon]
[Detailed step-by-step instructions]

## Implementation Status
[Current progress tracking]

## Plan Status
[Updated throughout implementation with current status]
```

#### Planning Requirements

1. **When to Create Planning Files:**
   - Major architectural changes
   - Multi-phase projects
   - Infrastructure migrations
   - Significant feature additions
   - Code refactoring projects
   - Any project expected to take >1 day

2. **Planning File Management:**
   - **Create** with initial plan date in filename
   - **Update** plan status section with each implementation milestone
   - **Rename** to add "- DONE" when fully implemented
   - **Keep** planning history - never delete completed plans
   - **Reference** in commit messages when implementing planned changes

3. **Status Tracking:**
   - Update "Last Updated" date with each status change
   - Maintain "Plan Status" section with current progress
   - Document any deviations from original plan
   - Record lessons learned and recommendations

### Documentation Quality Standards

- **Be specific and actionable** - avoid vague statements
- **Include examples** for complex concepts
- **Maintain consistency** with existing documentation style
- **Update immediately** after implementing changes, not later
- **Cross-reference related sections** to maintain coherence

## Branching & Workflow Standards

### Branch Protection Rules

**ABSOLUTE RULE**: Never push or merge directly to the `main` branch.

**Required Workflow**:
1. **Create feature branch** from current main: `git checkout -b feature/description`
2. **Work on feature branch** with frequent commits
3. **Test thoroughly** in development environment
4. **Update documentation** in the same branch
5. **Request manual review** before merging to main
6. **Manual merge only** by project maintainer

### Branch Naming Conventions

```
feature/short-description     # New features
fix/bug-description          # Bug fixes
refactor/area-description    # Code refactoring
docs/section-update          # Documentation updates
config/setting-change        # Configuration changes
```

### Commit Message Standards

```
type(scope): brief description

Detailed explanation of changes, including:
- What was changed and why
- Documentation files updated
- Cost implications (if any)
- Security considerations (if any)

Examples:
feat(ui): add dark mode toggle
docs: update technical design for theme system
cost: estimated $0 impact - client-side only
security: no security implications

fix(database): optimize factoid query performance
docs: update technical design query optimization section
cost: reduced database load, potential cost savings
security: no security implications
```

## Code Quality Standards

### TypeScript Requirements

- **Strict mode enabled** - no `any` types without justification
- **Comprehensive interfaces** for all data structures
- **Type safety at boundaries** - validate external data
- **Proper error handling** with typed error objects
- **JSDoc comments** for complex functions and interfaces

### Performance Standards

- **Page load times** < 2 seconds for all pages
- **Database queries** optimized with proper indexing
- **Bundle size monitoring** with webpack-bundle-analyzer
- **Image optimization** using Next.js Image component
- **Lazy loading** for non-critical components

### Code Organization

```
services/ui/lib/              # Utility functions
├── data-service.ts          # Database operations (single responsibility)
├── utils.ts                 # General utilities
├── rtl-utils.ts             # RTL-specific functions
└── supabase.ts              # Database client configuration

services/ui/components/       # React components
├── ui/                      # Reusable UI components (shadcn/ui)
└── [feature]/               # Feature-specific components (future)

services/ui/app/              # Next.js App Router pages
├── page.tsx                 # Homepage
├── layout.tsx               # Root layout
├── [feature]/               # Feature pages
└── api/                     # API routes (future)
```

## Development Environment Standards

### Required Tools

- **Node.js** 18+ with npm
- **TypeScript** 5+ with strict mode
- **ESLint** with Next.js configuration
- **Prettier** for code formatting
- **Git** with proper commit signing (recommended)

### Environment Configuration

```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development commands
npm run dev              # Development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # Linting check
```

### Pre-Development Checklist

Before making any code changes:

1. **Read relevant documentation** sections
2. **Understand the current architecture** affected by your changes
3. **Identify minimum changes required**
4. **Consider cost implications** of your changes
5. **Plan documentation updates** needed
6. **Create feature branch** for your work

## Cost Management Guidelines

### Cost Monitoring Requirements

- **Monthly cost review** of Railway and Supabase usage
- **Alert setup** for unexpected cost increases
- **Resource usage tracking** through platform dashboards
- **Performance monitoring** to optimize resource usage

### Cost-Conscious Development

**Database Operations**:
- Use batch operations instead of individual queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor query performance and optimize slow queries

**Frontend Performance**:
- Minimize bundle size with code splitting
- Optimize images and static assets
- Use efficient re-rendering strategies
- Implement proper caching headers

**Infrastructure Usage**:
- Use Railway's free tier features when possible
- Stay within Supabase free tier limits
- Monitor bandwidth and storage usage
- Plan for scaling only when necessary

### Cost Impact Assessment

For every feature that might affect costs, document:

```markdown
## Cost Impact Analysis
- **Database**: New tables/increased queries/storage impact
- **Bandwidth**: Additional API calls or asset downloads
- **Computing**: Server-side processing requirements
- **Storage**: File storage or increased data volume
- **Estimated Monthly Cost**: $ amount or "No cost impact"
```

## Security Guidelines

### Data Protection

- **Input validation** on all form inputs and API parameters
- **SQL injection prevention** through parameterized queries
- **XSS protection** using React's built-in safeguards
- **CSRF protection** for state-changing operations
- **Secure headers** configured in Next.js

### API Security

- **Rate limiting** to prevent abuse
- **Authentication** for protected endpoints
- **Authorization** checks for all data access
- **Input sanitization** before database operations
- **Error message sanitization** to avoid information leakage

### Environment Security

```bash
# Environment variables - NEVER commit these
SUPABASE_URL=                 # Database connection
SUPABASE_ANON_KEY=           # Public API key
SUPABASE_SERVICE_ROLE_KEY=   # Private API key (future)
NEXTAUTH_SECRET=             # Session encryption (future)
```

### Security Checklist

Before deploying any change:

- [ ] All inputs validated on server side
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly configured
- [ ] Dependencies updated to latest secure versions
- [ ] No hardcoded secrets or API keys
- [ ] Proper error handling without information leakage

## Testing Standards

### Development Testing

- **Local development** must work without errors
- **Build process** must complete successfully
- **Type checking** must pass without warnings
- **Linting** must pass all rules
- **Basic functionality** tested manually

### Production Readiness

```bash
# Pre-deployment checklist
npm run build            # Must complete without errors
npm run lint             # Must pass all checks
npm run type-check       # Must pass TypeScript validation
```

### Manual Testing Requirements

For UI changes:
- [ ] Desktop browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive design testing
- [ ] Dark/light theme compatibility
- [ ] RTL language support (if applicable)
- [ ] Keyboard navigation accessibility

For backend changes:
- [ ] Database query performance
- [ ] Error handling scenarios
- [ ] Data validation edge cases
- [ ] API response consistency

## Database Development Guidelines

### Schema Changes

**CRITICAL**: All database schema changes must:

1. **Be backwards compatible** during deployment
2. **Include migration scripts** in `database/migrations/`
3. **Update TypeScript interfaces** in affected files
4. **Test thoroughly** with existing data
5. **Document in technical design** document

### Query Performance

- **Use indexes** for frequently queried fields
- **Batch operations** instead of N+1 queries
- **Monitor query performance** through Supabase dashboard
- **Optimize slow queries** before they impact users
- **Use proper JOIN strategies** for related data

### Data Service Patterns

```typescript
// Preferred: Batch operations
const factoids = await getAllFactoids()
const tags = await getBatchTagsForFactoids(factoids)

// Avoid: N+1 queries
const factoids = await getAllFactoids()
for (const factoid of factoids) {
  factoid.tags = await getTagsForFactoid(factoid.id) // DON'T DO THIS
}
```

## LLM-Specific Guidelines

### For AI Coding Assistants

When working with this codebase:

1. **Always read project documentation** before making changes
2. **Follow the branching workflow** - never commit to main
3. **Update documentation** in the same commit as code changes
4. **Consider cost implications** of every change
5. **Ask clarifying questions** if requirements are unclear
6. **Test changes thoroughly** before considering them complete
7. **Use existing patterns** rather than creating new ones

### Preferred AI Decision-Making

When choosing between options:

- **Simpler solution** over complex solution
- **Existing library** over custom implementation
- **Configuration change** over code change
- **Client-side logic** over server-side (when appropriate for cost)
- **Proven pattern** over experimental approach

### AI Communication Patterns

When documenting changes:

```markdown
## Change Summary
**What**: Brief description of what was changed
**Why**: Reasoning behind the change
**Impact**: Cost, security, and performance implications
**Documentation**: Which docs were updated
**Testing**: How the change was validated
```

## Emergency Procedures

### Production Issues

1. **Immediate response**: Check Railway dashboard for errors
2. **Rollback procedure**: Use Railway deployment history
3. **Communication**: Document issue and resolution
4. **Post-mortem**: Update guidelines to prevent recurrence

### Security Incidents

1. **Immediate**: Revoke compromised credentials
2. **Assessment**: Determine scope of potential data exposure
3. **Notification**: Follow data breach notification requirements
4. **Prevention**: Update security measures and guidelines

## Continuous Improvement

### Guideline Updates

These guidelines should be updated when:

- **New technologies** are adopted
- **Security threats** are identified
- **Cost structures** change
- **Development patterns** evolve
- **Team feedback** suggests improvements

### Performance Monitoring

Regular review of:

- **Page load times** and Core Web Vitals
- **Database query performance**
- **Cost trends** and usage patterns
- **Security vulnerabilities** in dependencies
- **User experience metrics**

## Conclusion

These guidelines exist to ensure Veritas remains:

- **Simple and maintainable**
- **Cost-effective and scalable**
- **Secure and reliable**
- **Well-documented and understandable**

Every development decision should be evaluated against these principles. When in doubt, choose the simpler, more secure, and more cost-effective option.

**Remember**: Good software is not about writing more code, but about solving problems with the least amount of appropriate code while maintaining quality, security, and cost-effectiveness. 