const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function cleanupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('🔌 Connecting to database...');
    
    // Read the cleanup SQL script
    const cleanupSQL = fs.readFileSync(path.join(__dirname, 'cleanup-search-vector.sql'), 'utf8');
    
    console.log('🧹 Running search_vector cleanup...');
    
    // Execute the cleanup script
    const result = await pool.query(cleanupSQL);
    
    console.log('✅ Cleanup completed successfully!');
    console.log('📋 Result:', result.rows);
    
    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sources', 'scraped_content', 'factoids', 'factoid_sources', 'tags', 'factoid_tags')
      ORDER BY table_name
    `);
    
    console.log('📊 Existing tables:', tablesResult.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDatabase().catch(console.error);
}

module.exports = { cleanupDatabase }; 