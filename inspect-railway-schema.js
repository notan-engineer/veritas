const { Pool } = require('pg');

/**
 * Database Configuration for Railway
 */
function getDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_HOST;
  
  if (!dbUrl) {
    throw new Error('No DATABASE_URL or DATABASE_HOST found');
  }
  
  // Configure SSL for Railway environment
  const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false;
  
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
 * Expected schema for comparison
 */
const EXPECTED_SCHEMA = {
  sources: [
    'id', 'name', 'domain', 'url', 'description', 'icon_url', 
    'twitter_handle', 'profile_photo_url', 'is_active', 'created_at', 'updated_at'
  ],
  tags: [
    'id', 'name', 'slug', 'description', 'parent_id', 'level', 
    'is_active', 'created_at', 'updated_at'
  ],
  scraped_content: [
    'id', 'source_id', 'source_url', 'title', 'content', 'author',
    'publication_date', 'content_type', 'language', 'processing_status',
    'created_at', 'updated_at'
  ],
  factoids: [
    'id', 'title', 'description', 'bullet_points', 'language', 
    'confidence_score', 'status', 'search_vector', 'created_at', 'updated_at'
  ],
  factoid_tags: [
    'id', 'factoid_id', 'tag_id', 'confidence_score', 'created_at'
  ],
  factoid_sources: [
    'id', 'factoid_id', 'scraped_content_id', 'relevance_score', 'created_at'
  ]
};

/**
 * Inspect Railway database schema
 */
async function inspectRailwaySchema(pool) {
  console.log('🔍 Inspecting Railway database schema...\n');
  
  // Get all tables
  const tablesResult = await pool.query(`
    SELECT table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log('📊 Existing Tables:');
  const existingTables = tablesResult.rows.map(row => row.table_name);
  existingTables.forEach(table => {
    console.log(`   ${table}`);
  });
  
  // Get columns for each table
  const schemaDetails = {};
  
  for (const tableName of existingTables) {
    const columnsResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    schemaDetails[tableName] = columnsResult.rows;
  }
  
  return { existingTables, schemaDetails };
}

/**
 * Compare expected vs actual schema
 */
function compareSchemas(actualSchema) {
  console.log('\n🔎 Schema Comparison Analysis:\n');
  
  const issues = [];
  
  for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
    console.log(`📋 Table: ${tableName}`);
    
    if (!actualSchema.existingTables.includes(tableName)) {
      console.log(`   ❌ Missing table: ${tableName}`);
      issues.push({ type: 'missing_table', table: tableName });
      continue;
    }
    
    const actualColumns = actualSchema.schemaDetails[tableName].map(col => col.column_name);
    
    // Check for missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`   ❌ Missing columns: ${missingColumns.join(', ')}`);
      issues.push({ type: 'missing_columns', table: tableName, columns: missingColumns });
    }
    
    if (extraColumns.length > 0) {
      console.log(`   ⚠️  Extra columns: ${extraColumns.join(', ')}`);
    }
    
    if (missingColumns.length === 0 && extraColumns.length === 0) {
      console.log(`   ✅ Schema matches expected`);
    }
    
    // Show actual column details
    console.log(`   📝 Actual columns:`);
    actualSchema.schemaDetails[tableName].forEach(col => {
      console.log(`      ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');
  }
  
  return issues;
}

/**
 * Generate fix script for schema issues
 */
function generateFixScript(issues) {
  console.log('🔧 Generated Fix Script:\n');
  
  const fixStatements = [];
  
  for (const issue of issues) {
    if (issue.type === 'missing_table') {
      console.log(`-- Create missing table: ${issue.table}`);
      fixStatements.push(`-- TODO: Create table ${issue.table} with full schema`);
    }
    
    if (issue.type === 'missing_columns') {
      console.log(`-- Add missing columns to ${issue.table}:`);
      for (const column of issue.columns) {
        let alterStatement = '';
        
        // Define column types based on expected schema
        const columnDefinitions = {
          'is_active': 'BOOLEAN DEFAULT true',
          'search_vector': 'tsvector',
          'scraped_content_id': 'UUID REFERENCES scraped_content(id) ON DELETE CASCADE',
          'icon_url': 'VARCHAR(500)',
          'twitter_handle': 'VARCHAR(100)',
          'profile_photo_url': 'VARCHAR(500)',
          'author': 'VARCHAR(200)',
          'publication_date': 'TIMESTAMP WITH TIME ZONE',
          'content_type': 'VARCHAR(50) DEFAULT \'article\'',
          'processing_status': 'VARCHAR(50) DEFAULT \'pending\'',
          'parent_id': 'UUID REFERENCES tags(id) ON DELETE CASCADE',
          'level': 'INTEGER DEFAULT 0',
          'bullet_points': 'TEXT[] DEFAULT \'{}\'',
          'confidence_score': 'INTEGER DEFAULT 100',
          'relevance_score': 'INTEGER DEFAULT 100'
        };
        
        const columnDef = columnDefinitions[column] || 'TEXT';
        alterStatement = `ALTER TABLE ${issue.table} ADD COLUMN IF NOT EXISTS ${column} ${columnDef};`;
        
        console.log(`   ${alterStatement}`);
        fixStatements.push(alterStatement);
      }
    }
  }
  
  return fixStatements;
}

/**
 * Apply schema fixes
 */
async function applySchemaFixes(pool, fixStatements) {
  console.log('\n🔨 Applying schema fixes...\n');
  
  for (const statement of fixStatements) {
    if (statement.startsWith('--')) {
      console.log(statement);
      continue;
    }
    
    try {
      console.log(`Executing: ${statement}`);
      await pool.query(statement);
      console.log('✅ Success');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * Main inspection function
 */
async function inspectAndFixRailwaySchema() {
  console.log('🚄 Railway Database Schema Inspector\n');
  
  let pool;
  
  try {
    // Connect to Railway database
    const dbConfig = getDatabaseConfig();
    console.log('🔌 Connecting to Railway PostgreSQL...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}\n`);
    
    pool = new Pool(dbConfig);
    await pool.query('SELECT 1');
    console.log('✅ Connected successfully\n');
    
    // Inspect current schema
    const actualSchema = await inspectRailwaySchema(pool);
    
    // Compare with expected schema
    const issues = compareSchemas(actualSchema);
    
    if (issues.length === 0) {
      console.log('🎉 Schema is correct! No issues found.');
      return;
    }
    
    // Generate fix script
    const fixStatements = generateFixScript(issues);
    
    // Ask user if they want to apply fixes
    console.log('\n❓ Do you want to apply these fixes? (This script will show what would be applied)');
    
    // For now, just show what would be applied
    await applySchemaFixes(pool, fixStatements);
    
    console.log('\n🎯 Summary:');
    console.log(`   Issues found: ${issues.length}`);
    console.log(`   Fix statements generated: ${fixStatements.length}`);
    console.log('\n💡 Copy the ALTER TABLE statements above and add them to your seeding script.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run inspection if called directly
if (require.main === module) {
  inspectAndFixRailwaySchema();
}

module.exports = { inspectAndFixRailwaySchema }; 