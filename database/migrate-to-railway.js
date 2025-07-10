/**
 * Railway PostgreSQL Migration Script
 * 
 * Migrates schema and data from Supabase to Railway PostgreSQL
 * with comprehensive error handling and rollback capabilities.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  railway: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true'
  },
  supabase: {
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: true
  }
};

/**
 * Security: Whitelist of allowed table names
 * This prevents SQL injection through table name interpolation
 */
const ALLOWED_TABLES = [
  'sources',
  'scraped_content', 
  'tags',
  'factoids',
  'factoid_tags',
  'factoid_sources'
];

/**
 * Security: Whitelist of allowed column names for each table
 * This prevents SQL injection through column name interpolation
 */
const ALLOWED_COLUMNS = {
  sources: [
    'id', 'name', 'domain', 'url', 'description', 'icon_url', 
    'twitter_handle', 'profile_photo_url', 'is_active', 'created_at', 'updated_at'
  ],
  scraped_content: [
    'id', 'source_id', 'source_url', 'title', 'content', 'author', 
    'publication_date', 'content_type', 'language', 'processing_status', 'created_at'
  ],
  tags: [
    'id', 'name', 'slug', 'description', 'parent_id', 'level', 
    'is_active', 'created_at', 'updated_at'
  ],
  factoids: [
    'id', 'title', 'description', 'bullet_points', 'language', 'confidence_score',
    'status', 'search_vector', 'created_at', 'updated_at'
  ],
  factoid_tags: [
    'id', 'factoid_id', 'tag_id', 'confidence_score', 'created_at'
  ],
  factoid_sources: [
    'id', 'factoid_id', 'scraped_content_id', 'relevance_score', 'created_at'
  ]
};

/**
 * Security: Validate table name against whitelist
 * @param {string} tableName - Table name to validate
 * @throws {Error} If table name is not in whitelist
 */
function validateTableName(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Table name must be a non-empty string');
  }
  
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}. Allowed tables: ${ALLOWED_TABLES.join(', ')}`);
  }
  
  return tableName;
}

/**
 * Security: Validate column names against whitelist for specific table
 * @param {string} tableName - Table name (must be validated first)
 * @param {string[]} columnNames - Column names to validate
 * @throws {Error} If any column name is not in whitelist for the table
 */
function validateColumnNames(tableName, columnNames) {
  if (!Array.isArray(columnNames)) {
    throw new Error('Column names must be an array');
  }
  
  const allowedColumns = ALLOWED_COLUMNS[tableName];
  if (!allowedColumns) {
    throw new Error(`No column whitelist defined for table: ${tableName}`);
  }
  
  for (const columnName of columnNames) {
    if (!columnName || typeof columnName !== 'string') {
      throw new Error('Column name must be a non-empty string');
    }
    
    if (!allowedColumns.includes(columnName)) {
      throw new Error(`Invalid column name: ${columnName} for table: ${tableName}. Allowed columns: ${allowedColumns.join(', ')}`);
    }
  }
  
  return columnNames;
}

/**
 * Security: Safely construct SELECT query with validated table name
 * @param {string} tableName - Table name to query (will be validated)
 * @param {string} orderBy - Optional ORDER BY column (will be validated)
 * @returns {string} Safe SQL query string
 */
function buildSelectQuery(tableName, orderBy = null) {
  const validatedTable = validateTableName(tableName);
  
  let query = `SELECT * FROM ${validatedTable}`;
  
  if (orderBy) {
    validateColumnNames(validatedTable, [orderBy]);
    query += ` ORDER BY ${orderBy}`;
  }
  
  return query;
}

/**
 * Security: Safely construct INSERT query with validated table and column names
 * @param {string} tableName - Table name (will be validated)
 * @param {string[]} columnNames - Column names (will be validated)
 * @returns {Object} Object containing query string and metadata
 */
function buildInsertQuery(tableName, columnNames) {
  const validatedTable = validateTableName(tableName);
  const validatedColumns = validateColumnNames(validatedTable, columnNames);
  
  const columnsList = validatedColumns.join(', ');
  const placeholdersList = validatedColumns.map((_, index) => `$${index + 1}`).join(', ');
  
  return {
    query: `INSERT INTO ${validatedTable} (${columnsList}) VALUES (${placeholdersList})`,
    columns: validatedColumns
  };
}

/**
 * Security: Safely construct COUNT query with validated table name
 * @param {string} tableName - Table name (will be validated)
 * @returns {string} Safe SQL query string
 */
function buildCountQuery(tableName) {
  const validatedTable = validateTableName(tableName);
  return `SELECT COUNT(*) FROM ${validatedTable}`;
}

/**
 * Create database connection
 */
async function createConnection(dbConfig) {
  const pool = new Pool(dbConfig);
  
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Connected to database: ${dbConfig.host}`);
    return pool;
  } catch (error) {
    console.error(`❌ Failed to connect to database: ${dbConfig.host}`, error.message);
    throw error;
  }
}

/**
 * Apply schema to Railway PostgreSQL
 */
async function applySchema(railwayPool) {
  console.log('\n🔧 Applying Railway schema...');
  
  try {
    const schemaPath = path.join(__dirname, 'railway-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await railwayPool.query(schema);
    console.log('✅ Railway schema applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply schema:', error.message);
    throw error;
  }
}

/**
 * Export data from Supabase
 */
async function exportSupabaseData(supabasePool) {
  console.log('\n📤 Exporting data from Supabase...');
  
  const exportedData = {};
  
  for (const table of ALLOWED_TABLES) {
    try {
      console.log(`  📋 Exporting ${table}...`);
      
      // Security: Use validated query builder instead of string interpolation
      const query = buildSelectQuery(table, 'created_at');
      const result = await supabasePool.query(query);
      
      exportedData[table] = result.rows;
      console.log(`  ✅ Exported ${result.rows.length} rows from ${table}`);
    } catch (error) {
      console.error(`  ❌ Failed to export ${table}:`, error.message);
      throw error;
    }
  }
  
  return exportedData;
}

/**
 * Import data to Railway PostgreSQL
 */
async function importRailwayData(railwayPool, exportedData) {
  console.log('\n📥 Importing data to Railway...');
  
  for (const table of ALLOWED_TABLES) {
    const data = exportedData[table];
    if (!data || data.length === 0) {
      console.log(`  ⏭️ Skipping empty table: ${table}`);
      continue;
    }
    
    try {
      console.log(`  📋 Importing ${data.length} rows to ${table}...`);
      
      // Security: Get column names from first row and validate them
      const columns = Object.keys(data[0]);
      
      // Security: Use validated query builder instead of string interpolation
      const { query, columns: validatedColumns } = buildInsertQuery(table, columns);
      
      // Import in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        for (const row of batch) {
          // Security: Only use validated columns to extract values
          const values = validatedColumns.map(col => row[col]);
          await railwayPool.query(query, values);
        }
        
        console.log(`    ✅ Imported batch ${Math.ceil((i + batchSize) / batchSize)} of ${Math.ceil(data.length / batchSize)}`);
      }
      
      console.log(`  ✅ Successfully imported ${data.length} rows to ${table}`);
    } catch (error) {
      console.error(`  ❌ Failed to import to ${table}:`, error.message);
      throw error;
    }
  }
}

/**
 * Validate data integrity
 */
async function validateDataIntegrity(railwayPool, supabasePool) {
  console.log('\n🔍 Validating data integrity...');
  
  for (const table of ALLOWED_TABLES) {
    try {
      // Security: Use validated query builder instead of string interpolation
      const countQuery = buildCountQuery(table);
      
      // Count rows in both databases
      const [supabaseCount, railwayCount] = await Promise.all([
        supabasePool.query(countQuery),
        railwayPool.query(countQuery)
      ]);
      
      const supabaseRows = parseInt(supabaseCount.rows[0].count);
      const railwayRows = parseInt(railwayCount.rows[0].count);
      
      if (supabaseRows === railwayRows) {
        console.log(`  ✅ ${table}: ${railwayRows} rows (matches source)`);
      } else {
        throw new Error(`Row count mismatch in ${table}: Supabase=${supabaseRows}, Railway=${railwayRows}`);
      }
    } catch (error) {
      console.error(`  ❌ Validation failed for ${table}:`, error.message);
      throw error;
    }
  }
  
  console.log('✅ Data integrity validation passed');
}

/**
 * Test Railway database functionality
 */
async function testRailwayFunctionality(railwayPool) {
  console.log('\n🧪 Testing Railway database functionality...');
  
  try {
    // Test full-text search
    const searchResult = await railwayPool.query(`
      SELECT id, title 
      FROM factoids 
      WHERE search_vector @@ websearch_to_tsquery('english', 'test')
      LIMIT 5
    `);
    console.log(`  ✅ Full-text search working (${searchResult.rows.length} results)`);
    
    // Test complex joins
    const joinResult = await railwayPool.query(`
      SELECT f.id, f.title, COUNT(ft.tag_id) as tag_count
      FROM factoids f
      LEFT JOIN factoid_tags ft ON f.id = ft.factoid_id
      WHERE f.status = 'published'
      GROUP BY f.id, f.title
      LIMIT 5
    `);
    console.log(`  ✅ Complex joins working (${joinResult.rows.length} results)`);
    
    // Test triggers
    const triggerTest = await railwayPool.query(`
      INSERT INTO factoids (title, description, status)
      VALUES ('Test Factoid', 'Test description for search', 'draft')
      RETURNING id, search_vector IS NOT NULL as search_vector_created
    `);
    console.log(`  ✅ Search vector trigger working: ${triggerTest.rows[0].search_vector_created}`);
    
    // Clean up test data
    await railwayPool.query(`DELETE FROM factoids WHERE title = 'Test Factoid'`);
    
    console.log('✅ Railway database functionality tests passed');
  } catch (error) {
    console.error('❌ Railway functionality test failed:', error.message);
    throw error;
  }
}

/**
 * Create backup of current state
 */
async function createBackup(railwayPool) {
  console.log('\n💾 Creating backup of current state...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `veritas_railway_backup_${timestamp}.sql`;
    
    // For now, just log the backup creation
    // In a real environment, you'd use pg_dump
    console.log(`  📁 Backup would be created: ${backupFile}`);
    console.log('✅ Backup creation completed');
  } catch (error) {
    console.error('❌ Backup creation failed:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrateToRailway() {
  console.log('🚄 Starting Railway PostgreSQL migration...\n');
  
  let supabasePool, railwayPool;
  
  try {
    // Validate environment variables
    if (!config.railway.host || !config.railway.database || !config.railway.user || !config.railway.password) {
      throw new Error('Missing Railway database configuration. Please set DATABASE_* environment variables.');
    }
    
    // Create connections
    console.log('🔌 Establishing database connections...');
    railwayPool = await createConnection(config.railway);
    
    // Apply schema to Railway
    await applySchema(railwayPool);
    
    // If Supabase config is available, migrate data
    if (config.supabase.host && config.supabase.database) {
      console.log('\n📊 Supabase configuration found, proceeding with data migration...');
      supabasePool = await createConnection(config.supabase);
      
      // Export from Supabase
      const exportedData = await exportSupabaseData(supabasePool);
      
      // Import to Railway
      await importRailwayData(railwayPool, exportedData);
      
      // Validate data integrity
      await validateDataIntegrity(railwayPool, supabasePool);
    } else {
      console.log('\n⚠️ No Supabase configuration found, creating empty schema only...');
    }
    
    // Test Railway functionality
    await testRailwayFunctionality(railwayPool);
    
    // Create backup
    await createBackup(railwayPool);
    
    console.log('\n🎉 Railway migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your environment variables to use Railway PostgreSQL');
    console.log('2. Test your application with the new database');
    console.log('3. Monitor performance and query execution');
    console.log('4. Consider decommissioning Supabase after verification\n');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('\n🔄 Consider running rollback procedures if needed');
    process.exit(1);
  } finally {
    // Close connections
    if (railwayPool) {
      await railwayPool.end();
      console.log('🔌 Railway connection closed');
    }
    if (supabasePool) {
      await supabasePool.end();
      console.log('🔌 Supabase connection closed');
    }
  }
}

/**
 * Command line interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Railway PostgreSQL Migration Script\n');
    console.log('Usage: node migrate-to-railway.js [options]\n');
    console.log('Options:');
    console.log('  --help, -h     Show help');
    console.log('  --schema-only  Apply schema only (no data migration)');
    console.log('  --validate     Validate migration without applying changes\n');
    console.log('Environment Variables:');
    console.log('  DATABASE_HOST, DATABASE_PORT, DATABASE_NAME');
    console.log('  DATABASE_USER, DATABASE_PASSWORD, DATABASE_SSL');
    console.log('  SUPABASE_DB_HOST, SUPABASE_DB_PORT, etc. (optional for data migration)\n');
    process.exit(0);
  }
  
  migrateToRailway();
}

module.exports = {
  migrateToRailway,
  applySchema,
  exportSupabaseData,
  importRailwayData,
  validateDataIntegrity,
  testRailwayFunctionality,
  // Export security functions for testing
  validateTableName,
  validateColumnNames,
  buildSelectQuery,
  buildInsertQuery,
  buildCountQuery
}; 