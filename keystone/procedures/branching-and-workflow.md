# Branching and Workflow Procedure

## Absolute Rules
- **NEVER push directly to main branch**
- **Always create feature branches**
- **Test thoroughly before requesting merge**
- **Update documentation in same branch as code**
- **Manual merge only by project maintainer**

## Branch Naming Convention

```bash
feature/short-description     # New features
fix/bug-description          # Bug fixes
refactor/area-description    # Code refactoring
docs/section-update          # Documentation updates
```

### Examples
```bash
feature/add-search
fix/api-error-handling
refactor/database-queries
docs/update-setup-guide
```

## Workflow Steps

### 1. Create Feature Branch
```bash
# Ensure you're on latest main
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name
```

### 2. Development Process
- [ ] Write code following development principles
- [ ] Test locally: `cd services/ui && npm run build && npm run lint`
- [ ] Update relevant documentation files
- [ ] Commit with clear messages

### 3. Commit Guidelines
```bash
# Good commit messages
git commit -m "feat: add search functionality to factoid feed"
git commit -m "fix: resolve API timeout on large queries"
git commit -m "docs: update database schema documentation"

# Use conventional commits format
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
```

### 4. Push and Review Request
```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request via GitHub
# Include:
# - Clear description of changes
# - Link to related issues
# - Testing performed
# - Documentation updates
```

## Documentation Requirements

### CRITICAL: Update these files with every relevant commit
1. **`software-architecture.md`** - When architecture/database changes
2. **`developer-guidelines.md`** - When development practices change
3. **`product-requirements.md`** - When features/UX changes

### Documentation Checklist
- [ ] Is the change user-facing? → Update product docs
- [ ] Does it change architecture? → Update technical docs
- [ ] New development pattern? → Update guidelines
- [ ] API changes? → Update API documentation
- [ ] Project completion? → Follow documentation procedure

## Testing Before Merge

### Required Checks
```bash
# From services/ui directory
cd services/ui
npm run build    # Must pass
npm run lint     # Must pass

# For scraper changes
cd services/scraper
npm run build    # Must pass
```

### Manual Testing
- [ ] Feature works as intended
- [ ] No regressions in existing features
- [ ] UI components support dark mode
- [ ] Responsive design maintained
- [ ] Error handling works properly

## Merge Process

### Pre-Merge Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Documentation story assigned (for projects)
- [ ] Code reviewed (if team environment)
- [ ] No merge conflicts with main
- [ ] Deployment considerations documented

### Post-Merge
- [ ] Verify deployment successful
- [ ] Test in production environment
- [ ] Monitor for any issues
- [ ] Update project status if needed

## Handling Conflicts

### Merge Conflict Resolution
```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/your-feature
git merge main

# Resolve conflicts in editor
# Test thoroughly after resolution
# Commit the merge
git add .
git commit -m "merge: resolve conflicts with main"
```

## Emergency Procedures

### Reverting Changes
```bash
# If issues found after merge
git revert <commit-hash>
git push origin main

# Document what went wrong
# Plan fix in new feature branch
``` 