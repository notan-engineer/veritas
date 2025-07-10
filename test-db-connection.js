const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_HOST 
  });
  
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(r => r.tablename));
    
    // Check if factoids table exists and has data
    if (tablesResult.rows.some(r => r.tablename === 'factoids')) {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM factoids');
      console.log('📰 Factoids count:', countResult.rows[0].count);
    } else {
      console.log('❌ Factoids table not found');
    }
    
    // Check if other tables exist
    const expectedTables = ['sources', 'tags', 'scraped_content', 'factoid_tags', 'factoid_sources'];
    for (const table of expectedTables) {
      if (tablesResult.rows.some(r => r.tablename === table)) {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table} count:`, countResult.rows[0].count);
      } else {
        console.log(`❌ ${table} table not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 