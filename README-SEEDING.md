# Railway PostgreSQL Database Seeding Guide

This guide explains how to seed your Railway PostgreSQL database with mock data for the Veritas application.

## Prerequisites

1. **Railway PostgreSQL database** must be provisioned and configured
2. **Environment variables** must be set for Railway connection
3. **Node.js 18+** and npm installed

## Required Environment Variables

Create a `.env.local` file in the project root with these variables:

```env
# Railway PostgreSQL Configuration (Required for Seeding)
DATABASE_PROVIDER=railway
DATABASE_HOST=your_railway_postgres_host
DATABASE_PORT=5432
DATABASE_NAME=your_railway_database_name
DATABASE_USER=your_railway_username
DATABASE_PASSWORD=your_railway_password
DATABASE_SSL=true
```

### Getting Railway Database Credentials

1. Go to your Railway project dashboard
2. Navigate to your PostgreSQL service
3. Copy the connection details from the **Connect** tab
4. Set the environment variables above

## Seeding Process

The seeding script will insert:

- **5 Sources**: TechCrunch, Reuters, The Verge, Bloomberg, Ynet
- **9 Tags**: Technology, AI, Hardware, Finance, Economy, Space, Environment, Israel, Startups
- **5 Scraped Content entries**: One for each factoid-source relationship
- **5 Factoids**: Including English and Hebrew content with:
  - NVIDIA AI chip announcement
  - Federal Reserve interest rates
  - SpaceX Starlink launch
  - COP28 climate agreement
  - Israeli tech startup funding (Hebrew)
- **Relationships**: Factoid-tag and factoid-source connections

## How to Run Seeding

### Option 1: Using npm script (from services/ui directory)

```bash
cd services/ui
npm run seed:railway
```

### Option 2: Direct command (from project root)

```bash
node database/seed-railway.js
```

### Option 3: With explicit environment variables

```bash
DATABASE_PROVIDER=railway \
DATABASE_HOST=your_host \
DATABASE_NAME=your_db \
DATABASE_USER=your_user \
DATABASE_PASSWORD=your_password \
DATABASE_SSL=true \
node database/seed-railway.js
```

## Expected Output

The script will show:

```
🌱 Starting Railway PostgreSQL database seeding...

🔌 Connecting to Railway PostgreSQL...
✅ Connected to Railway PostgreSQL successfully

📋 Seeding Summary:
   5 factoids
   5 unique sources
   9 unique tags

🧹 Clearing existing data...
✅ Existing data cleared

📊 Seeding 5 sources...
✅ Sources seeded successfully

🏷️ Seeding 9 tags...
✅ Tags seeded successfully

📄 Seeding scraped content...
✅ Scraped content seeded successfully (5 entries)

📰 Seeding 5 factoids...
✅ Factoids seeded successfully

🔗 Seeding factoid-tag relationships...
✅ Factoid-tag relationships seeded successfully (13 relationships)

🔗 Seeding factoid-source relationships...
✅ Factoid-source relationships seeded successfully (5 relationships)

🔍 Verifying seeded data...

📊 Seeded Data Summary:
   Sources: 5
   Tags: 9
   Scraped Content: 5
   Factoids: 5
   Factoid-Tag Relationships: 13
   Factoid-Source Relationships: 5

✅ Sample verification: "NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost"
   Tags: Technology, AI, Hardware
   Sources: TechCrunch

🎉 Railway PostgreSQL database seeding completed successfully!
```

## Verification

After seeding, you can verify the data by:

1. **Testing API endpoints:**
   ```bash
   # Get all factoids
   curl http://localhost:3000/api/railway/factoids
   
   # Search factoids
   curl "http://localhost:3000/api/railway/factoids/search?q=NVIDIA"
   
   # Get tags
   curl http://localhost:3000/api/railway/tags
   ```

2. **Using the web application:**
   - Visit `http://localhost:3000`
   - Browse factoids by tag
   - Test search functionality
   - Check Hebrew content display

3. **Direct database queries:**
   ```sql
   -- Count all data
   SELECT 
     (SELECT COUNT(*) FROM factoids) as factoids,
     (SELECT COUNT(*) FROM sources) as sources,
     (SELECT COUNT(*) FROM tags) as tags;
   
   -- Sample factoid with relationships
   SELECT f.title, array_agg(t.name) as tags
   FROM factoids f
   LEFT JOIN factoid_tags ft ON f.id = ft.factoid_id
   LEFT JOIN tags t ON ft.tag_id = t.id
   GROUP BY f.id, f.title;
   ```

## Troubleshooting

### "Missing Railway database configuration"
- Ensure all `DATABASE_*` environment variables are set
- Check that `DATABASE_PROVIDER=railway`

### "Failed to connect to Railway PostgreSQL"
- Verify your Railway database is running
- Check connection credentials
- Ensure `DATABASE_SSL=true` for Railway

### "pg module not found"
- Install dependencies: `npm install` in `services/ui`

### Permission errors
- Ensure your Railway database user has CREATE, INSERT, DELETE permissions
- Check that your Railway PostgreSQL service is accessible

## Data Structure

The seeded data includes:

### Factoids
- **English**: Technology, finance, space, and climate news
- **Hebrew**: Israeli tech startup funding news
- All factoids have confidence scores, bullet points, and proper categorization

### Sources
- Major news outlets with proper domain mapping
- Hebrew source (Ynet) for multilingual testing

### Tags
- Hierarchical structure (level 1 and 2 tags)
- Support for English and Hebrew tag names
- Proper slug generation for URL routing

### Search Testing
- Full-text search across title, description, and bullet points
- Multilingual content support
- Tag-based filtering capabilities

## Next Steps After Seeding

1. **Test the application** with real data
2. **Verify search functionality** works properly
3. **Check RTL support** for Hebrew content
4. **Test API endpoints** in your frontend
5. **Monitor query performance** in Railway dashboard
6. **Set up automated backups** in Railway settings 