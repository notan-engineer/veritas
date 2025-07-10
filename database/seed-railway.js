/**
 * Railway PostgreSQL Database Seeding Script
 * 
 * Seeds the Railway PostgreSQL database with mock data from mock-data.ts
 * Handles all table relationships and ensures data integrity.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Import mock data (we'll need to convert this from TypeScript)
const mockData = {
  mockFactoids: [
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
      language: "en",
      confidence_score: 0.95,
      status: "published",
      created_at: "2024-12-15T10:30:00Z",
      updated_at: "2024-12-15T10:30:00Z",
      tags: [
        { id: "tag-1", name: "Technology", slug: "technology", description: "Technology and innovation", level: 1, is_active: true },
        { id: "tag-2", name: "AI", slug: "ai", description: "Artificial Intelligence", level: 1, is_active: true },
        { id: "tag-3", name: "Hardware", slug: "hardware", description: "Computer hardware and devices", level: 2, is_active: true }
      ],
      sources: [
        { id: "source-1", name: "TechCrunch", domain: "techcrunch.com", url: "https://techcrunch.com", description: "Technology news and analysis", is_active: true }
      ]
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
      language: "en",
      confidence_score: 0.92,
      status: "published",
      created_at: "2024-12-14T14:00:00Z",
      updated_at: "2024-12-14T14:00:00Z",
      tags: [
        { id: "tag-4", name: "Finance", slug: "finance", description: "Financial news and markets", level: 1, is_active: true },
        { id: "tag-5", name: "Economy", slug: "economy", description: "Economic news and trends", level: 2, is_active: true }
      ],
      sources: [
        { id: "source-2", name: "Reuters", domain: "reuters.com", url: "https://reuters.com", description: "International news and business", is_active: true }
      ]
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
      language: "en",
      confidence_score: 0.94,
      status: "published",
      created_at: "2024-12-13T20:15:00Z",
      updated_at: "2024-12-13T20:15:00Z",
      tags: [
        { id: "tag-6", name: "Space", slug: "space", description: "Space exploration and astronomy", level: 1, is_active: true },
        { id: "tag-1", name: "Technology", slug: "technology", description: "Technology and innovation", level: 1, is_active: true }
      ],
      sources: [
        { id: "source-3", name: "The Verge", domain: "theverge.com", url: "https://theverge.com", description: "Technology, science, art, and culture", is_active: true }
      ]
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
      language: "en",
      confidence_score: 0.91,
      status: "published",
      created_at: "2024-12-12T16:45:00Z",
      updated_at: "2024-12-12T16:45:00Z",
      tags: [
        { id: "tag-7", name: "Environment", slug: "environment", description: "Environmental news and climate", level: 1, is_active: true }
      ],
      sources: [
        { id: "source-4", name: "Bloomberg", domain: "bloomberg.com", url: "https://bloomberg.com", description: "Business and financial news", is_active: true }
      ]
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
      language: "he",
      confidence_score: 0.88,
      status: "published",
      created_at: "2024-12-15T08:30:00Z",
      updated_at: "2024-12-15T08:30:00Z",
      tags: [
        { id: "tag-8", name: "ישראל", slug: "israel", description: "Israeli news and developments", level: 1, is_active: true },
        { id: "tag-1", name: "Technology", slug: "technology", description: "Technology and innovation", level: 1, is_active: true },
        { id: "tag-9", name: "Startups", slug: "startups", description: "Startup companies and funding", level: 2, is_active: true }
      ],
      sources: [
        { id: "source-5", name: "Ynet", domain: "ynet.co.il", url: "https://ynet.co.il", description: "Israeli news portal", is_active: true }
      ]
    }
  ]
};

// Configuration - Handle both DATABASE_URL and individual variables
function getDatabaseConfig() {
  // Check if DATABASE_HOST is actually a full URL (Railway format)
  if (process.env.DATABASE_HOST && process.env.DATABASE_HOST.startsWith('postgresql://')) {
    try {
      const url = new URL(process.env.DATABASE_HOST);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading '/'
        user: url.username,
        password: url.password,
        ssl: process.env.DATABASE_SSL === 'true'
      };
    } catch (error) {
      console.error('Error parsing DATABASE_HOST URL:', error.message);
      throw new Error('Invalid DATABASE_HOST URL format');
    }
  }
  
  // Use individual environment variables
  return {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true'
  };
}

const config = getDatabaseConfig();

/**
 * Create PostgreSQL connection pool
 */
async function createConnection() {
  console.log('🔌 Connecting to Railway PostgreSQL...');
  
  if (!config.host || !config.database || !config.user || !config.password) {
    throw new Error('Missing Railway database configuration. Please set DATABASE_* environment variables.');
  }
  
  const pool = new Pool(config);
  
  // Test connection
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to Railway PostgreSQL successfully');
    return pool;
  } catch (error) {
    throw new Error(`Failed to connect to Railway PostgreSQL: ${error.message}`);
  }
}

/**
 * Clear existing data (for clean seeding)
 */
async function clearExistingData(pool) {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Delete in reverse order of dependencies
    await pool.query('DELETE FROM factoid_sources');
    await pool.query('DELETE FROM factoid_tags');
    await pool.query('DELETE FROM factoids');
    await pool.query('DELETE FROM scraped_content');
    await pool.query('DELETE FROM tags');
    await pool.query('DELETE FROM sources');
    
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error.message);
    throw error;
  }
}

/**
 * Extract unique sources from all factoids
 */
function extractUniqueSources(factoids) {
  const sourceMap = new Map();
  
  factoids.forEach(factoid => {
    factoid.sources.forEach(source => {
      if (!sourceMap.has(source.id)) {
        sourceMap.set(source.id, source);
      }
    });
  });
  
  return Array.from(sourceMap.values());
}

/**
 * Extract unique tags from all factoids
 */
function extractUniqueTags(factoids) {
  const tagMap = new Map();
  
  factoids.forEach(factoid => {
    factoid.tags.forEach(tag => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
      }
    });
  });
  
  return Array.from(tagMap.values());
}

/**
 * Seed sources table
 */
async function seedSources(pool, sources) {
  console.log(`📊 Seeding ${sources.length} sources...`);
  
  for (const source of sources) {
    const query = `
      INSERT INTO sources (id, name, domain, url, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        url = EXCLUDED.url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;
    
    await pool.query(query, [
      source.id,
      source.name,
      source.domain,
      source.url,
      source.description || null,
      source.is_active
    ]);
  }
  
  console.log('✅ Sources seeded successfully');
}

/**
 * Seed tags table
 */
async function seedTags(pool, tags) {
  console.log(`🏷️ Seeding ${tags.length} tags...`);
  
  for (const tag of tags) {
    const query = `
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
    `;
    
    await pool.query(query, [
      tag.id,
      tag.name,
      tag.slug,
      tag.description || null,
      tag.parent_id || null,
      tag.level,
      tag.is_active
    ]);
  }
  
  console.log('✅ Tags seeded successfully');
}

/**
 * Seed scraped_content table (create content entries for each source)
 */
async function seedScrapedContent(pool, factoids) {
  console.log('📄 Seeding scraped content...');
  
  const scrapedContentMap = new Map();
  
  for (const factoid of factoids) {
    for (const source of factoid.sources) {
      const contentId = `content-${factoid.id}-${source.id}`;
      
      if (!scrapedContentMap.has(contentId)) {
        const query = `
          INSERT INTO scraped_content (id, source_id, source_url, title, content, content_type, language, processing_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            source_id = EXCLUDED.source_id,
            source_url = EXCLUDED.source_url,
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            content_type = EXCLUDED.content_type,
            language = EXCLUDED.language,
            processing_status = EXCLUDED.processing_status,
            updated_at = NOW()
        `;
        
        await pool.query(query, [
          contentId,
          source.id,
          `${source.url}/article/${factoid.id}`,
          factoid.title,
          `${factoid.description}\n\n${factoid.bullet_points.join('\n')}`,
          'article',
          factoid.language,
          'completed'
        ]);
        
        scrapedContentMap.set(contentId, {
          id: contentId,
          source_id: source.id,
          factoid_id: factoid.id
        });
      }
    }
  }
  
  console.log(`✅ Scraped content seeded successfully (${scrapedContentMap.size} entries)`);
  return scrapedContentMap;
}

/**
 * Seed factoids table
 */
async function seedFactoids(pool, factoids) {
  console.log(`📰 Seeding ${factoids.length} factoids...`);
  
  for (const factoid of factoids) {
    const query = `
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
    `;
    
    // Convert confidence score from 0-1 to 0-100
    const confidenceScore = Math.round(factoid.confidence_score * 100);
    
    await pool.query(query, [
      factoid.id,
      factoid.title,
      factoid.description,
      factoid.bullet_points,
      factoid.language,
      confidenceScore,
      factoid.status,
      factoid.created_at,
      factoid.updated_at
    ]);
  }
  
  console.log('✅ Factoids seeded successfully');
}

/**
 * Seed factoid_tags relationships
 */
async function seedFactoidTags(pool, factoids) {
  console.log('🔗 Seeding factoid-tag relationships...');
  
  let relationshipCount = 0;
  
  for (const factoid of factoids) {
    for (const tag of factoid.tags) {
      const query = `
        INSERT INTO factoid_tags (factoid_id, tag_id, confidence_score)
        VALUES ($1, $2, $3)
        ON CONFLICT (factoid_id, tag_id) DO UPDATE SET
          confidence_score = EXCLUDED.confidence_score
      `;
      
      await pool.query(query, [
        factoid.id,
        tag.id,
        tag.confidence_score ? Math.round(tag.confidence_score * 100) : 100
      ]);
      
      relationshipCount++;
    }
  }
  
  console.log(`✅ Factoid-tag relationships seeded successfully (${relationshipCount} relationships)`);
}

/**
 * Seed factoid_sources relationships
 */
async function seedFactoidSources(pool, factoids, scrapedContentMap) {
  console.log('🔗 Seeding factoid-source relationships...');
  
  let relationshipCount = 0;
  
  for (const factoid of factoids) {
    for (const source of factoid.sources) {
      const contentId = `content-${factoid.id}-${source.id}`;
      const scrapedContent = scrapedContentMap.get(contentId);
      
      if (scrapedContent) {
        const query = `
          INSERT INTO factoid_sources (factoid_id, scraped_content_id, relevance_score)
          VALUES ($1, $2, $3)
          ON CONFLICT (factoid_id, scraped_content_id) DO UPDATE SET
            relevance_score = EXCLUDED.relevance_score
        `;
        
        await pool.query(query, [
          factoid.id,
          scrapedContent.id,
          source.relevance_score ? Math.round(source.relevance_score * 100) : 100
        ]);
        
        relationshipCount++;
      }
    }
  }
  
  console.log(`✅ Factoid-source relationships seeded successfully (${relationshipCount} relationships)`);
}

/**
 * Verify seeded data
 */
async function verifySeededData(pool) {
  console.log('🔍 Verifying seeded data...');
  
  try {
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
    
    // Test a sample query
    const testQuery = await pool.query(`
      SELECT f.title, array_agg(t.name) as tags, array_agg(s.name) as sources
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
    
  } catch (error) {
    console.error('❌ Error verifying seeded data:', error.message);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedRailwayDatabase() {
  console.log('🌱 Starting Railway PostgreSQL database seeding...\n');
  
  let pool;
  
  try {
    // Validate environment
    if (!process.env.DATABASE_PROVIDER || process.env.DATABASE_PROVIDER !== 'railway') {
      throw new Error('DATABASE_PROVIDER must be set to "railway" for seeding');
    }
    
    // Create connection
    pool = await createConnection();
    
    // Extract unique data
    const factoids = mockData.mockFactoids;
    const sources = extractUniqueSources(factoids);
    const tags = extractUniqueTags(factoids);
    
    console.log(`📋 Seeding Summary:`);
    console.log(`   ${factoids.length} factoids`);
    console.log(`   ${sources.length} unique sources`);
    console.log(`   ${tags.length} unique tags\n`);
    
    // Clear existing data
    await clearExistingData(pool);
    
    // Seed in dependency order
    await seedSources(pool, sources);
    await seedTags(pool, tags);
    const scrapedContentMap = await seedScrapedContent(pool, factoids);
    await seedFactoids(pool, factoids);
    await seedFactoidTags(pool, factoids);
    await seedFactoidSources(pool, factoids, scrapedContentMap);
    
    // Verify seeded data
    await verifySeededData(pool);
    
    console.log('\n🎉 Railway PostgreSQL database seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test your application with the seeded data');
    console.log('2. Verify all API endpoints work correctly');
    console.log('3. Check that search functionality works');
    console.log('4. Test multilingual content (Hebrew/Arabic support)\n');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Show usage information
function showUsage() {
  console.log('🌱 Railway PostgreSQL Database Seeding Script\n');
  console.log('Required Environment Variables:');
  console.log('  DATABASE_PROVIDER=railway');
  console.log('  DATABASE_HOST=<railway_postgres_host>');
  console.log('  DATABASE_PORT=5432');
  console.log('  DATABASE_NAME=<railway_postgres_database>');
  console.log('  DATABASE_USER=<railway_postgres_user>');
  console.log('  DATABASE_PASSWORD=<railway_postgres_password>');
  console.log('  DATABASE_SSL=true\n');
  console.log('Usage:');
  console.log('  node database/seed-railway.js\n');
}

// Run seeding if called directly
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  seedRailwayDatabase();
}

module.exports = {
  seedRailwayDatabase,
  clearExistingData,
  extractUniqueSources,
  extractUniqueTags
}; 