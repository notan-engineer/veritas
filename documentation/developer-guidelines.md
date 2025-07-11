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
- **Use free tiers** and cost-optimized services (Railway)
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
   - Any project expected to be complex or multi-step

2. **Planning File Management:**
   - **Create** with initial plan date in filename
   - **Update** plan status section with each implementation milestone
   - **Rename** to add "- DONE" when fully implemented (user must rename file)
   - **Keep** planning history - never delete completed plans
   - **Reference** in commit messages when implementing planned changes

3. **Status Tracking:**
   - Update "Last Updated" date with each status change to actual execution time
   - Maintain "Plan Status" section with current progress
   - Document any deviations from original plan
   - Record lessons learned and recommendations

4. **Time Estimation Policy:**
   - **NEVER include time estimations** in planning documents
   - **NEVER use projected timelines** like "July 15-17, 2025" 
   - **ALWAYS use actual execution dates** when updating status
   - **Focus on task dependencies** and logical sequence, not time predictions
   - **Update timestamps only when tasks are actually executed**

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

### Git Workflow Optimization

**CRITICAL**: Follow this optimized git workflow to prevent conflicts and reduce development time:

#### Conflict Prevention Strategy

**Before Starting Work:**
```bash
# Always start from fresh main branch
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**During Development:**
```bash
# Commit frequently with meaningful messages
git add .
git commit -m "type(scope): specific change description"

# Stay up to date with main (run daily)
git fetch origin main
git rebase origin/main      # Preferred over merge to keep history clean
```

**Before Pushing:**
```bash
# Final sync with main to prevent conflicts
git fetch origin main
git rebase origin/main
npm run precommit          # Run tests before pushing
git push origin feature/your-feature-name
```

#### Efficient Git Commands

**Daily Git Workflow:**
```bash
# Start of day - sync with main
git checkout main && git pull origin main

# Quick status check
git status --porcelain      # Short format status

# Clean commit with testing
git add . && npm run precommit && git commit -m "feat: description"

# Push with upstream tracking
git push -u origin feature/branch-name
```

**Conflict Resolution:**
```bash
# If conflicts occur during rebase
git status                  # See conflicted files
# Edit conflicted files, then:
git add .
git rebase --continue

# If rebase gets complex, abort and merge instead
git rebase --abort
git merge origin/main
```

#### Commit Message Standards (Enhanced)

**Format:**
```
type(scope): concise description

Optional body with:
- What was changed and why
- Breaking changes noted
- Documentation updates
- Testing performed

Examples:
feat(ui): add responsive navigation menu
- Add mobile-first navigation
- Update layout for tablet breakpoint
- Test on Chrome, Firefox, Safari
- Update component documentation

fix(database): resolve connection pool exhaustion
- Increase max connections from 10 to 20
- Add connection timeout handling
- Monitor resource usage
- No breaking changes

docs(guidelines): optimize git workflow section
- Add conflict prevention strategies
- Include daily workflow commands
- Address merge vs rebase decisions
- Based on development experience feedback
```

#### Git Configuration for Efficiency

**Recommended Git Settings:**
```bash
# One-time setup for better git experience
git config --global pull.rebase true          # Rebase by default on pull
git config --global rebase.autoStash true     # Auto-stash during rebase
git config --global merge.tool vscode         # Use VS Code for merge conflicts
git config --global init.defaultBranch main   # Use main as default branch
```

#### Documentation Update Strategy

**Prevent Documentation Conflicts:**
- **Update documentation in same commit** as code changes
- **Use specific file sections** when multiple people work on docs
- **Planning documents**: Only one person updates at a time
- **Technical design**: Coordinate updates via chat/issues first

#### Branch Management

**Clean Branch Practices:**
```bash
# Delete merged branches locally
git branch -d feature/completed-feature

# Delete remote tracking branches
git remote prune origin

# Clean up local branches that are merged
git branch --merged main | grep -v "main" | xargs git branch -d
```

**Emergency Recovery:**
```bash
# If you accidentally commit to main
git reset --soft HEAD~1     # Undo last commit, keep changes
git checkout -b feature/fix-commit
git commit -m "fix: move changes to proper branch"

# If you need to discard local changes
git stash                   # Save changes temporarily
git checkout .              # Discard changes
git stash pop               # Restore changes if needed
```

#### File Ignore Strategy

**Prevent Unnecessary Commits:**
```gitignore
# Already in .gitignore, but ensure these are covered:
node_modules/
.next/
.env
.env.local
*.log
.DS_Store
.vscode/settings.json
.idea/
```

#### Pull Request Workflow

**Before Creating PR:**
```bash
# Ensure clean, up-to-date branch
git checkout main && git pull origin main
git checkout feature/your-branch
git rebase origin/main
npm run test:all            # Full test suite
git push origin feature/your-branch --force-with-lease
```

**PR Best Practices:**
- **Small, focused PRs** - easier to review and merge
- **Clear description** with what, why, and how
- **Reference issues** or planning documents
- **Include testing notes** and validation steps
- **Update documentation** in the same PR

### Commit Message Reference

**Note:** See "Git Workflow Optimization" section above for enhanced commit message standards and examples.

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
└── railway-database.ts      # Database client configuration

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
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
DATABASE_PROVIDER=railway

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

### Testing Workflow Optimization

**CRITICAL**: Follow this optimized testing workflow to avoid repetitive actions and ensure quality:

#### Quick Testing (Before Each Commit)
```bash
# From project root - works from any directory
npm run precommit          # Runs linting and environment validation
```

#### Comprehensive Testing (Before Push)
```bash
# From project root - works from any directory
npm run test:all           # Full test suite: env, lint, type-check, build
```

#### Individual Test Commands
```bash
# Environment and configuration validation
npm run test:env           # Validate environment variables
npm run test:db            # Test database connection

# Code quality checks
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix linting issues (UI directory)
npm run type-check         # TypeScript type checking (UI directory)

# Build validation
npm run test:smoke         # Build test
npm run build              # Production build
```

#### Directory Navigation Optimization
**Problem Solved**: No more confusion about which directory to run commands from!

- **Always run from project root** - all commands are configured to work from root
- **Root package.json** automatically navigates to correct subdirectories
- **Consistent command interface** across all testing operations

#### Testing Checklist Templates

**Before Each Commit:**
- [ ] `npm run precommit` passes
- [ ] Changes align with cursorrules principles
- [ ] Documentation updated (if applicable)

**Before Push:**
- [ ] `npm run test:all` passes
- [ ] All TypeScript errors resolved
- [ ] No ESLint warnings
- [ ] Build completes successfully

**Before Pull Request:**
- [ ] Full testing workflow completed
- [ ] Feature branch up to date with main
- [ ] Documentation updated
- [ ] Planning document updated (if applicable)

## Cost Management Guidelines

### Cost Monitoring Requirements

- **Monthly cost review** of Railway usage
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
DATABASE_URL=                # Database connection
DATABASE_PROVIDER=           # Database provider
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
# Optimized pre-deployment checklist
npm run predeploy        # Comprehensive pre-deployment validation
# Or individual commands:
npm run test:all         # Full test suite
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
- **Monitor query performance** through Railway dashboard
- **Optimize slow queries** before they impact users
- **Use proper JOIN strategies** for related data

### Current Database Schema

**Railway PostgreSQL Schema Overview:**
- **11 Tables Total**: 6 core content tables + 5 user management tables
- **Full-text Search**: GIN indexes with weighted search vectors on factoids
- **Hierarchical Tags**: Support for 10-level tag hierarchy with circular reference prevention
- **Authentication Ready**: Complete user management schema implemented
- **Performance Optimized**: 25+ indexes for optimal query performance

**Core Content Tables:**
```sql
factoids              -- Primary content with search_vector TSVECTOR
sources               -- News sources with domain UNIQUE constraint  
scraped_content       -- Raw content from sources
tags                  -- Hierarchical tags (level 0-10)
factoid_tags          -- Many-to-many with confidence_score DECIMAL(3,2)
factoid_sources       -- Many-to-many with relevance_score DECIMAL(3,2)
```

**User Management Tables:**
```sql
users                 -- User accounts with JSONB preferences
user_subscriptions    -- User source subscriptions
user_tag_preferences  -- Tag preferences (follow/block/mute)
user_actions          -- Private actions (read/bookmark/hide/report)
user_interactions     -- Public interactions (like/dislike/comment)
```

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