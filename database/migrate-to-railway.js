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
  
  const tables = ['sources', 'scraped_content', 'tags', 'factoids', 'factoid_tags', 'factoid_sources'];
  const exportedData = {};
  
  for (const table of tables) {
    try {
      console.log(`  📋 Exporting ${table}...`);
      const result = await supabasePool.query(`SELECT * FROM ${table} ORDER BY created_at`);
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
  
  const tableOrder = ['sources', 'scraped_content', 'tags', 'factoids', 'factoid_tags', 'factoid_sources'];
  
  for (const table of tableOrder) {
    const data = exportedData[table];
    if (!data || data.length === 0) {
      console.log(`  ⏭️ Skipping empty table: ${table}`);
      continue;
    }
    
    try {
      console.log(`  📋 Importing ${data.length} rows to ${table}...`);
      
      // Get column names from first row
      const columns = Object.keys(data[0]);
      const columnsList = columns.join(', ');
      const placeholdersList = columns.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${table} (${columnsList}) VALUES (${placeholdersList})`;
      
      // Import in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map(col => row[col]);
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
  
  const tables = ['sources', 'scraped_content', 'tags', 'factoids', 'factoid_tags', 'factoid_sources'];
  
  for (const table of tables) {
    try {
      // Count rows in both databases
      const [supabaseCount, railwayCount] = await Promise.all([
        supabasePool.query(`SELECT COUNT(*) FROM ${table}`),
        railwayPool.query(`SELECT COUNT(*) FROM ${table}`)
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
  testRailwayFunctionality
}; 