# Veritas Deployment Procedures

## Overview

This document outlines the deployment procedures for the Veritas application on Railway, including setup, configuration, and maintenance procedures.

## Prerequisites

- Railway account with project access
- GitHub repository access
- Railway CLI installed and authenticated
- Node.js 18+ installed locally

## Initial Deployment Setup

### 1. Railway Project Configuration

```bash
# Install Railway CLI
npm install -g @railway/cli

# Authenticate with Railway
railway login

# Link to existing project
railway link [PROJECT_ID]
```

### 2. Service Configuration

#### UI Service Setup
- **Source Directory**: `services/ui`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `services/ui`

#### Environment Variables
```
NODE_ENV=production
PORT=${{PORT}}
NEXT_PUBLIC_SUPABASE_URL=${{NEXT_PUBLIC_SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${{NEXT_PUBLIC_SUPABASE_ANON_KEY}}
```

### 3. Domain Configuration

1. Generate Railway domain or configure custom domain
2. Update DNS records if using custom domain
3. Verify SSL certificate configuration

## Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Railway automatically**:
   - Detects changes via GitHub webhook
   - Builds the application in `services/ui/`
   - Deploys to production environment
   - Updates the live application

### Manual Deployment

```bash
# From project root
railway up

# Or from services/ui directory
cd services/ui
railway up
```

### Deployment Verification

1. **Check deployment logs**:
   ```bash
   railway logs
   ```

2. **Verify application health**:
   ```bash
   curl https://[your-domain]/
   ```

3. **Test core functionality**:
   - Homepage loads correctly
   - Article pages render
   - Settings page accessible
   - Database connectivity working

## Environment Management

### Production Environment
- **Railway Project**: veritas-production
- **Domain**: https://veritas-production-e04f.up.railway.app
- **Database**: Supabase PostgreSQL (Phase 1)

### Environment Variables Management

```bash
# View current variables
railway variables

# Set new variable
railway variables --set "KEY=value"

# Set multiple variables
railway variables --set "KEY1=value1" --set "KEY2=value2"
```

## Database Deployment

### Current (Phase 1): Supabase
- Database migrations handled via Supabase dashboard
- Connection via environment variables
- Backup managed by Supabase

### Future (Phase 2): Railway PostgreSQL
- Database provisioning: `railway add postgresql`
- Migration execution via Railway
- Backup configuration through Railway

## Monitoring and Observability

### Railway Built-in Monitoring
- Application logs: `railway logs`
- Performance metrics via Railway dashboard
- Deployment history and rollback capabilities

### Health Checks
- Railway automatically monitors application health
- Custom health check endpoint: `/api/health` (future implementation)
- Restart policies configured for automatic recovery

### Alerts and Notifications
- Configure webhook notifications for deployment events
- Set up email alerts for application errors
- Monitor resource usage and set limits

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   railway logs --filter build
   
   # Verify package.json and dependencies
   npm install
   npm run build
   ```

2. **Environment Variable Issues**:
   ```bash
   # List all variables
   railway variables
   
   # Check variable values (be careful with sensitive data)
   railway run printenv | grep NEXT_PUBLIC
   ```

3. **Port Configuration Issues**:
   - Ensure start command uses Railway's PORT variable
   - Verify Next.js configuration for port binding

4. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check network connectivity
   - Review database URL format

### Rollback Procedures

1. **Via Railway Dashboard**:
   - Go to Deployments tab
   - Select previous successful deployment
   - Click "Redeploy"

2. **Via CLI**:
   ```bash
   # List recent deployments
   railway status
   
   # Redeploy specific deployment
   railway redeploy [DEPLOYMENT_ID]
   ```

3. **Via Git**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

## Security Considerations

### Deployment Security
- Environment variables encrypted at rest
- HTTPS enforced for all connections
- Railway access controls and team permissions

### Secrets Management
- Never commit sensitive data to repository
- Use Railway environment variables for all secrets
- Rotate API keys and tokens regularly

## Performance Optimization

### Build Optimization
- Use Railway's build cache
- Optimize Docker layers (future)
- Minimize bundle size

### Runtime Optimization
- Configure appropriate resource allocation
- Monitor memory and CPU usage
- Implement caching strategies

## Maintenance Procedures

### Regular Maintenance
- Weekly review of deployment logs
- Monthly security updates
- Quarterly performance reviews

### Updates and Upgrades
- Test in development environment first
- Use blue-green deployment for major updates
- Coordinate database migrations with application updates

### Backup and Recovery
- Database backups managed by Supabase/Railway
- Code repository serves as application backup
- Document recovery procedures and test regularly

## Future Enhancements (Phase 2)

### Multi-Service Deployment
- Scraping service deployment
- LLM service deployment  
- Inter-service communication setup

### Advanced Monitoring
- Custom metrics collection
- Performance dashboards
- Automated testing in deployment pipeline

### Infrastructure as Code
- Railway configuration files
- Automated environment provisioning
- Infrastructure versioning 