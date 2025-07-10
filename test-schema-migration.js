const { Pool } = require('pg');

// Test configuration - use local PostgreSQL or Railway connection
const testConfig = {
  host: 'localhost',
  port: 5432,
  database: 'veritas_test',
  user: 'postgres',
  password: 'postgres',
  ssl: false
};

/**
 * Test: Create OLD schema (without is_active and search_vector columns)
 */
async function createOldSchema(pool) {
  console.log('🔄 Creating OLD schema (simulating existing Railway database)...');
  
  const oldSchemaSQL = `
    -- Drop existing tables for clean test
    DROP TABLE IF EXISTS factoid_sources CASCADE;
    DROP TABLE IF EXISTS factoid_tags CASCADE;
    DROP TABLE IF EXISTS factoids CASCADE;
    DROP TABLE IF EXISTS scraped_content CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
    DROP TABLE IF EXISTS sources CASCADE;
    DROP FUNCTION IF EXISTS update_factoid_search_vector() CASCADE;
    
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- OLD Sources table (without is_active)
    CREATE TABLE sources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(200) NOT NULL,
        domain VARCHAR(100) NOT NULL UNIQUE,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- OLD Tags table (without is_active)
    CREATE TABLE tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- OLD Factoids table (without search_vector)
    CREATE TABLE factoids (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        bullet_points TEXT[] DEFAULT '{}',
        language VARCHAR(10) DEFAULT 'en',
        confidence_score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Relationship tables
    CREATE TABLE scraped_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
        source_url VARCHAR(500) NOT NULL,
        title TEXT,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE factoid_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        confidence_score INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(factoid_id, tag_id)
    );
    
    CREATE TABLE factoid_sources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
        scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
        relevance_score INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(factoid_id, scraped_content_id)
    );
    
    -- Insert some test data
    INSERT INTO sources (id, name, domain, url, description)
    VALUES ('old-source-1', 'Test Source', 'test.com', 'https://test.com', 'Test source');
    
    INSERT INTO tags (id, name, slug, description, level)
    VALUES ('old-tag-1', 'Test Tag', 'test-tag', 'Test tag', 1);
    
    INSERT INTO factoids (id, title, description, bullet_points, language, status)
    VALUES ('old-factoid-1', 'Test Factoid', 'Test description', ARRAY['Test bullet point'], 'en', 'published');
  `;
  
  await pool.query(oldSchemaSQL);
  console.log('✅ OLD schema created with test data');
}

/**
 * Test: Apply NEW schema migration (our seeding script logic)
 */
async function applyNewSchemaMigration(pool) {
  console.log('🔄 Applying NEW schema migration...');
  
  // Test 1: Base schema (should not affect existing tables)
  console.log('📋 Step 1: Base schema creation...');
  const baseSchemaSQL = `
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";

    -- Sources table (should not modify existing)
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

    -- Tags table (should not modify existing)
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

    -- Factoids table (should not modify existing)
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
  `;
  
  await pool.query(baseSchemaSQL);
  console.log('✅ Step 1: Base schema applied');
  
  // Test 2: Add missing columns
  console.log('🔧 Step 2: Adding missing columns...');
  
  await pool.query(`
    ALTER TABLE sources 
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
  `);
  
  await pool.query(`
    ALTER TABLE tags 
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
  `);
  
  await pool.query(`
    ALTER TABLE factoids 
    ADD COLUMN IF NOT EXISTS search_vector tsvector;
  `);
  
  console.log('✅ Step 2: Missing columns added');
  
  // Test 3: Create search function and trigger
  console.log('🔍 Step 3: Setting up search functionality...');
  
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
  console.log('✅ Step 3: Search functionality set up');
  
  // Test 4: Create indexes
  console.log('📊 Step 4: Creating indexes...');
  
  const indexSQL = `
    CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
    CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
    CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
    CREATE INDEX IF NOT EXISTS idx_factoids_language ON factoids(language);
    CREATE INDEX IF NOT EXISTS idx_factoids_search_vector ON factoids USING gin(search_vector);
  `;
  
  await pool.query(indexSQL);
  console.log('✅ Step 4: Indexes created successfully');
}

/**
 * Test: Verify migration worked correctly
 */
async function verifyMigration(pool) {
  console.log('🔍 Verifying migration results...');
  
  // Check if all columns exist
  const columnsResult = await pool.query(`
    SELECT 
      table_name,
      column_name,
      data_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN ('sources', 'tags', 'factoids')
    ORDER BY table_name, column_name;
  `);
  
  console.log('\n📊 Database columns after migration:');
  columnsResult.rows.forEach(row => {
    console.log(`   ${row.table_name}.${row.column_name}: ${row.data_type}`);
  });
  
  // Check if indexes exist
  const indexesResult = await pool.query(`
    SELECT 
      indexname,
      tablename,
      indexdef
    FROM pg_indexes 
    WHERE tablename IN ('sources', 'tags', 'factoids')
    ORDER BY tablename, indexname;
  `);
  
  console.log('\n📊 Database indexes after migration:');
  indexesResult.rows.forEach(row => {
    console.log(`   ${row.tablename}.${row.indexname}`);
  });
  
  // Test that search_vector is working
  await pool.query(`
    UPDATE factoids SET title = title WHERE id = 'old-factoid-1';
  `);
  
  const searchTest = await pool.query(`
    SELECT id, title, search_vector IS NOT NULL as has_search_vector
    FROM factoids 
    WHERE id = 'old-factoid-1';
  `);
  
  console.log('\n📊 Search vector test:');
  console.log(`   Factoid: ${searchTest.rows[0].title}`);
  console.log(`   Has search_vector: ${searchTest.rows[0].has_search_vector}`);
  
  // Test that is_active columns work
  await pool.query(`UPDATE sources SET is_active = false WHERE id = 'old-source-1'`);
  await pool.query(`UPDATE tags SET is_active = false WHERE id = 'old-tag-1'`);
  
  const activeTest = await pool.query(`
    SELECT 
      'sources' as table_name, is_active 
    FROM sources WHERE id = 'old-source-1'
    UNION ALL
    SELECT 
      'tags' as table_name, is_active 
    FROM tags WHERE id = 'old-tag-1';
  `);
  
  console.log('\n📊 is_active columns test:');
  activeTest.rows.forEach(row => {
    console.log(`   ${row.table_name}.is_active: ${row.is_active}`);
  });
}

/**
 * Main test runner
 */
async function runMigrationTest() {
  console.log('🧪 Starting Railway Schema Migration Test\n');
  
  let pool;
  
  try {
    // Connect to test database
    pool = new Pool(testConfig);
    await pool.query('SELECT 1');
    console.log('✅ Connected to test database');
    
    // Test 1: Create old schema (simulate existing Railway database)
    await createOldSchema(pool);
    
    // Test 2: Apply new schema migration
    await applyNewSchemaMigration(pool);
    
    // Test 3: Verify migration worked
    await verifyMigration(pool);
    
    console.log('\n🎉 Migration test completed successfully!');
    console.log('✅ The schema migration should work correctly on Railway.');
    
  } catch (error) {
    console.error('\n❌ Migration test failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Test database connection closed');
    }
  }
}

// Run test if called directly
if (require.main === module) {
  runMigrationTest().catch(console.error);
}

module.exports = { runMigrationTest }; 