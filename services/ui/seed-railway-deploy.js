/**
 * Railway PostgreSQL Database Seeding Script - Deployment Version
 * 
 * This version is designed to run within Railway's deployment environment
 * where it can access internal services like postgres.railway.internal
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Enhanced mock data embedded in the script for deployment
const deploymentMockData = {
  sources: [
    { id: "source-1", name: "TechCrunch", domain: "techcrunch.com", url: "https://techcrunch.com", description: "Technology news and analysis", is_active: true },
    { id: "source-2", name: "Reuters", domain: "reuters.com", url: "https://reuters.com", description: "International news and business", is_active: true },
    { id: "source-3", name: "The Verge", domain: "theverge.com", url: "https://theverge.com", description: "Technology, science, art, and culture", is_active: true },
    { id: "source-4", name: "Bloomberg", domain: "bloomberg.com", url: "https://bloomberg.com", description: "Business and financial news", is_active: true },
    { id: "source-5", name: "Ynet", domain: "ynet.co.il", url: "https://ynet.co.il", description: "Israeli news portal", is_active: true }
  ],
  
  tags: [
    { id: "tag-1", name: "Technology", slug: "technology", description: "Technology and innovation", level: 1, is_active: true },
    { id: "tag-2", name: "AI", slug: "ai", description: "Artificial Intelligence", level: 1, is_active: true },
    { id: "tag-3", name: "Hardware", slug: "hardware", description: "Computer hardware and devices", level: 2, is_active: true },
    { id: "tag-4", name: "Finance", slug: "finance", description: "Financial news and markets", level: 1, is_active: true },
    { id: "tag-5", name: "Economy", slug: "economy", description: "Economic news and trends", level: 2, is_active: true },
    { id: "tag-6", name: "Space", slug: "space", description: "Space exploration and astronomy", level: 1, is_active: true },
    { id: "tag-7", name: "Environment", slug: "environment", description: "Environmental news and climate", level: 1, is_active: true },
    { id: "tag-8", name: "ישראל", slug: "israel", description: "Israeli news and developments", level: 1, is_active: true },
    { id: "tag-9", name: "Startups", slug: "startups", description: "Startup companies and funding", level: 2, is_active: true }
  ],
  
  factoids: [
    {
      id: "nvidia-ai-chip-2024",
      title: "NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost",
      description: "NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads.",
      bullet_points: [
        "New H200 chip delivers 10x faster AI training compared to previous generation",
        "Features 141GB of HBM3 memory for large language model processing",
        "Expected to ship in Q2 2024 with major cloud providers already pre-ordering",
        "Priced at $40,000 per unit, targeting enterprise AI infrastructure",
        "Compatible with existing CUDA ecosystem for seamless integration"
      ],
      language: "en", confidence_score: 95, status: "published",
      created_at: "2024-12-15T10:30:00Z", updated_at: "2024-12-15T10:30:00Z",
      tag_ids: ["tag-1", "tag-2", "tag-3"], source_ids: ["source-1"]
    },
    {
      id: "fed-interest-rates-december",
      title: "Federal Reserve Maintains Interest Rates at 5.25-5.50%",
      description: "The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy.",
      bullet_points: [
        "Federal funds rate remains at 5.25-5.50% for the third consecutive meeting",
        "Fed Chair Powell indicates potential rate cuts in 2024 if inflation continues to decline",
        "Core inflation rate at 3.1%, down from 4.1% in September",
        "Unemployment rate stable at 3.7%, showing strong labor market",
        "Markets react positively with S&P 500 gaining 1.2% following announcement"
      ],
      language: "en", confidence_score: 92, status: "published",
      created_at: "2024-12-14T14:00:00Z", updated_at: "2024-12-14T14:00:00Z",
      tag_ids: ["tag-4", "tag-5"], source_ids: ["source-2"]
    },
    {
      id: "spacex-starlink-launch",
      title: "SpaceX Successfully Launches 60 Starlink Satellites",
      description: "SpaceX has completed another successful Starlink mission, expanding global internet coverage.",
      bullet_points: [
        "Falcon 9 rocket launches 60 Starlink satellites from Cape Canaveral",
        "First stage booster successfully lands on drone ship for 15th time",
        "Satellites deployed at 550km altitude for optimal internet coverage",
        "Starlink constellation now exceeds 4,000 active satellites",
        "Service now available in 60+ countries with 2+ million subscribers"
      ],
      language: "en", confidence_score: 94, status: "published",
      created_at: "2024-12-13T20:15:00Z", updated_at: "2024-12-13T20:15:00Z",
      tag_ids: ["tag-6", "tag-1"], source_ids: ["source-3"]
    },
    {
      id: "cop28-climate-agreement",
      title: "COP28 Reaches Historic Agreement on Fossil Fuel Phase-Out",
      description: "World leaders at COP28 have agreed to transition away from fossil fuels, marking a significant climate milestone.",
      bullet_points: [
        "195 countries agree to 'transition away from fossil fuels' by 2050",
        "Establishes $100 billion climate fund for developing nations",
        "Sets target of 60% reduction in global emissions by 2035",
        "Requires regular reporting on climate action progress",
        "Creates framework for carbon trading and offset mechanisms"
      ],
      language: "en", confidence_score: 91, status: "published",
      created_at: "2024-12-12T16:45:00Z", updated_at: "2024-12-12T16:45:00Z",
      tag_ids: ["tag-7"], source_ids: ["source-4"]
    },
    {
      id: "israel-tech-startup-funding",
      title: "ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון",
      description: "אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר.",
      bullet_points: [
        "חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024",
        "חברות בינה מלאכותית הובילו עם 40% מהגיוסים הכוללים",
        "חברות סייבר גייסו 800 מיליון דולר, עלייה של 25% מהרבעון הקודם",
        "מרכזי פיתוח של חברות בינלאומיות גדולות נפתחים בתל אביב וירושלים",
        "הממשלה הכריזה על תכנית חדשה לתמיכה בחברות טכנולוגיה צעירות"
      ],
      language: "he", confidence_score: 88, status: "published",
      created_at: "2024-12-15T08:30:00Z", updated_at: "2024-12-15T08:30:00Z",
      tag_ids: ["tag-8", "tag-1", "tag-9"], source_ids: ["source-5"]
    }
  ]
};

/**
 * Get database configuration - Railway deployment version
 */
function getDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_HOST;
  
  if (!dbUrl) {
    throw new Error('No DATABASE_URL or DATABASE_HOST found');
  }
  
  // Configure SSL for Railway environment
  const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Railway uses self-signed certificates
    : false;
  
  // Parse the database URL
  try {
    const url = new URL(dbUrl);
    return {
      connectionString: dbUrl,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: sslConfig
    };
  } catch (error) {
    // If URL parsing fails, try direct configuration
    return {
      host: process.env.DATABASE_HOST || process.env.PGHOST,
      port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || '5432'),
      database: process.env.DATABASE_NAME || process.env.PGDATABASE || 'railway',
      user: process.env.DATABASE_USER || process.env.PGUSER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.PGPASSWORD,
      ssl: sslConfig
    };
  }
}

/**
 * Create database schema
 */
async function createSchema(pool) {
  console.log('📋 Creating database schema...');
  
  // First, enable extensions and create tables
  const baseSchemaSQL = `
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";

    -- Sources table
    CREATE TABLE IF NOT EXISTS sources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(200) NOT NULL,
        domain VARCHAR(100) NOT NULL UNIQUE,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        twitter_handle VARCHAR(100),
        profile_photo_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Tags table
    CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Scraped content table
    CREATE TABLE IF NOT EXISTS scraped_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
        source_url VARCHAR(500) NOT NULL,
        title TEXT,
        content TEXT,
        author VARCHAR(200),
        publication_date TIMESTAMP WITH TIME ZONE,
        content_type VARCHAR(50) DEFAULT 'article' CHECK (content_type IN ('article', 'social_post', 'video', 'other')),
        language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
        processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Factoids table
    CREATE TABLE IF NOT EXISTS factoids (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        bullet_points TEXT[] DEFAULT '{}',
        language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'he', 'ar', 'other')),
        confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Factoid-Tag relationship table
    CREATE TABLE IF NOT EXISTS factoid_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(factoid_id, tag_id)
    );

    -- Factoid-Source relationship table
    CREATE TABLE IF NOT EXISTS factoid_sources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
        scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
        relevance_score INTEGER DEFAULT 100 CHECK (relevance_score >= 0 AND relevance_score <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(factoid_id, scraped_content_id)
    );

  `;
  
  await pool.query(baseSchemaSQL);
  console.log('✅ Base schema created successfully');
  
  // Add missing columns if they don't exist
  console.log('🔧 Adding missing columns...');
  
  try {
    // Add is_active column to sources table if it doesn't exist
    await pool.query(`
      ALTER TABLE sources 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    
    // Add is_active column to tags table if it doesn't exist
    await pool.query(`
      ALTER TABLE tags 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    
    // Add search_vector column to factoids table if it doesn't exist
    await pool.query(`
      ALTER TABLE factoids 
      ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `);
    
    console.log('✅ Missing columns added successfully');
  } catch (error) {
    console.warn('⚠️ Warning: Could not add missing columns:', error.message);
  }
  
  // Create search function and trigger (after ensuring search_vector column exists)
  console.log('🔍 Setting up search functionality...');
  
  try {
    const searchSQL = `
      -- Search vector update function
      CREATE OR REPLACE FUNCTION update_factoid_search_vector()
      RETURNS trigger AS $$
      BEGIN
          NEW.search_vector := 
              setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
              setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
              setweight(to_tsvector('english', COALESCE(array_to_string(NEW.bullet_points, ' '), '')), 'C');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger for search vector updates
      DROP TRIGGER IF EXISTS factoid_search_update ON factoids;
      CREATE TRIGGER factoid_search_update
          BEFORE INSERT OR UPDATE ON factoids
          FOR EACH ROW EXECUTE FUNCTION update_factoid_search_vector();
    `;
    
    await pool.query(searchSQL);
    console.log('✅ Search functionality set up successfully');
  } catch (error) {
    console.warn('⚠️ Warning: Could not set up search functionality:', error.message);
  }
  
  // Create indexes (only after ensuring columns exist)
  console.log('📊 Creating indexes...');
  const indexSQL = `
    CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
    CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
    CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
    CREATE INDEX IF NOT EXISTS idx_factoids_language ON factoids(language);
    CREATE INDEX IF NOT EXISTS idx_factoids_search_vector ON factoids USING gin(search_vector);
    CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
    CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);
  `;
  
  await pool.query(indexSQL);
  console.log('✅ Database schema and indexes created successfully');
}

/**
 * Clear existing data
 */
async function clearData(pool) {
  console.log('🧹 Clearing existing data...');
  
  const clearSQL = `
    DELETE FROM factoid_sources;
    DELETE FROM factoid_tags;
    DELETE FROM factoids;
    DELETE FROM scraped_content;
    DELETE FROM tags;
    DELETE FROM sources;
  `;
  
  await pool.query(clearSQL);
  console.log('✅ Existing data cleared');
}

/**
 * Seed all data
 */
async function seedData(pool) {
  console.log('🌱 Seeding database with mock data...');
  
  // Seed sources
  console.log('📊 Seeding sources...');
  for (const source of deploymentMockData.sources) {
    await pool.query(`
      INSERT INTO sources (id, name, domain, url, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        url = EXCLUDED.url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [source.id, source.name, source.domain, source.url, source.description, source.is_active]);
  }
  
  // Seed tags
  console.log('🏷️ Seeding tags...');
  for (const tag of deploymentMockData.tags) {
    await pool.query(`
      INSERT INTO tags (id, name, slug, description, parent_id, level, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        parent_id = EXCLUDED.parent_id,
        level = EXCLUDED.level,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [tag.id, tag.name, tag.slug, tag.description, tag.parent_id || null, tag.level, tag.is_active]);
  }
  
  // Seed factoids and relationships
  console.log('📰 Seeding factoids...');
  for (const factoid of deploymentMockData.factoids) {
    // Insert factoid
    await pool.query(`
      INSERT INTO factoids (id, title, description, bullet_points, language, confidence_score, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        bullet_points = EXCLUDED.bullet_points,
        language = EXCLUDED.language,
        confidence_score = EXCLUDED.confidence_score,
        status = EXCLUDED.status,
        updated_at = NOW()
    `, [
      factoid.id, factoid.title, factoid.description, factoid.bullet_points,
      factoid.language, factoid.confidence_score, factoid.status,
      factoid.created_at, factoid.updated_at
    ]);
    
    // Create scraped content for each source
    for (const sourceId of factoid.source_ids) {
      const contentId = `content-${factoid.id}-${sourceId}`;
      await pool.query(`
        INSERT INTO scraped_content (id, source_id, source_url, title, content, content_type, language, processing_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          source_id = EXCLUDED.source_id,
          source_url = EXCLUDED.source_url,
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          updated_at = NOW()
      `, [
        contentId, sourceId, `https://example.com/article/${factoid.id}`,
        factoid.title, `${factoid.description}\n\n${factoid.bullet_points.join('\n')}`,
        'article', factoid.language, 'completed'
      ]);
      
      // Link factoid to scraped content
      await pool.query(`
        INSERT INTO factoid_sources (factoid_id, scraped_content_id, relevance_score)
        VALUES ($1, $2, $3)
        ON CONFLICT (factoid_id, scraped_content_id) DO NOTHING
      `, [factoid.id, contentId, 100]);
    }
    
    // Link factoid to tags
    for (const tagId of factoid.tag_ids) {
      await pool.query(`
        INSERT INTO factoid_tags (factoid_id, tag_id, confidence_score)
        VALUES ($1, $2, $3)
        ON CONFLICT (factoid_id, tag_id) DO NOTHING
      `, [factoid.id, tagId, 100]);
    }
  }
  
  console.log('✅ Mock data seeded successfully');
}

/**
 * Verify seeded data
 */
async function verifyData(pool) {
  console.log('🔍 Verifying seeded data...');
  
  const counts = await Promise.all([
    pool.query('SELECT COUNT(*) FROM sources'),
    pool.query('SELECT COUNT(*) FROM tags'),
    pool.query('SELECT COUNT(*) FROM scraped_content'),
    pool.query('SELECT COUNT(*) FROM factoids'),
    pool.query('SELECT COUNT(*) FROM factoid_tags'),
    pool.query('SELECT COUNT(*) FROM factoid_sources')
  ]);
  
  console.log('\n📊 Seeded Data Summary:');
  console.log(`   Sources: ${counts[0].rows[0].count}`);
  console.log(`   Tags: ${counts[1].rows[0].count}`);
  console.log(`   Scraped Content: ${counts[2].rows[0].count}`);
  console.log(`   Factoids: ${counts[3].rows[0].count}`);
  console.log(`   Factoid-Tag Relationships: ${counts[4].rows[0].count}`);
  console.log(`   Factoid-Source Relationships: ${counts[5].rows[0].count}`);
  
  // Test sample query
  const testQuery = await pool.query(`
    SELECT f.title, array_agg(DISTINCT t.name) as tags, array_agg(DISTINCT s.name) as sources
    FROM factoids f
    LEFT JOIN factoid_tags ft ON f.id = ft.factoid_id
    LEFT JOIN tags t ON ft.tag_id = t.id
    LEFT JOIN factoid_sources fs ON f.id = fs.factoid_id
    LEFT JOIN scraped_content sc ON fs.scraped_content_id = sc.id
    LEFT JOIN sources s ON sc.source_id = s.id
    WHERE f.status = 'published'
    GROUP BY f.id, f.title
    LIMIT 1
  `);
  
  if (testQuery.rows.length > 0) {
    const sample = testQuery.rows[0];
    console.log(`\n✅ Sample verification: "${sample.title}"`);
    console.log(`   Tags: ${sample.tags.filter(t => t).join(', ')}`);
    console.log(`   Sources: ${sample.sources.filter(s => s).join(', ')}`);
  }
}

/**
 * Main deployment seeding function
 */
async function seedRailwayDeployment() {
  console.log('🚄 Starting Railway PostgreSQL deployment seeding...\n');
  
  // Safety check: Only run in production or when explicitly requested
  if (process.env.NODE_ENV !== 'production' && process.env.FORCE_SEED !== 'true') {
    console.log('⚠️  Skipping database seeding - not in production environment');
    console.log('   Set FORCE_SEED=true to override this safety check');
    return;
  }
  
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database provider: ${process.env.DATABASE_PROVIDER || 'unknown'}`);
  
  let pool;
  
  try {
    // Get database configuration
    const dbConfig = getDatabaseConfig();
    console.log('🔌 Connecting to Railway PostgreSQL...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   SSL: ${dbConfig.ssl}`);
    
    // Create connection pool
    pool = new Pool(dbConfig);
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to Railway PostgreSQL successfully');
    
    // Create schema
    await createSchema(pool);
    
    // Clear existing data
    await clearData(pool);
    
    // Seed data
    await seedData(pool);
    
    // Verify data
    await verifyData(pool);
    
    console.log('\n🎉 Railway PostgreSQL deployment seeding completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Deployment seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  seedRailwayDeployment();
}

module.exports = { seedRailwayDeployment }; 