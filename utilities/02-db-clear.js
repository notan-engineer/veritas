#!/usr/bin/env node

/**
 * Database Cleanup Utility
 * Clears all scraped content and job-related data from the database
 * Usage: node 02-db-clear.js [--confirm]
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local'
});

async function clearJobAndScrapedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database cleanup...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete in correct order to respect foreign key constraints
    const operations = [
      { table: 'scraping_logs', description: 'scraping logs' },
      { table: 'scraping_jobs', description: 'scraping jobs' },
      { table: 'factoid_sources', description: 'factoid-source relationships' },
      { table: 'scraped_content', description: 'scraped content items' },
      { table: 'scraped_content_archive', description: 'archived content items' }
    ];
    
    for (const op of operations) {
      try {
        const result = await client.query(`DELETE FROM ${op.table}`);
        console.log(`✓ Deleted ${result.rowCount || 0} ${op.description}`);
      } catch (err) {
        if (err.code === '42P01') { // Table doesn't exist
          console.log(`⚠ Table ${op.table} doesn't exist - skipping`);
        } else {
          throw err;
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ All job-related data and scraped content cleared successfully!');
    
    // Show current counts to verify
    console.log('\nVerifying cleanup:');
    const tables = ['scraping_jobs', 'scraping_logs', 'scraped_content'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`- ${table}: ${result.rows[0].count} rows remaining`);
      } catch (err) {
        console.log(`- ${table}: table not found`);
      }
    }
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error clearing data:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Main function with confirmation
async function main() {
  console.log('⚠️  DATABASE CLEANUP WARNING ⚠️\n');
  console.log('This will permanently delete:');
  console.log('  • All scraping jobs');
  console.log('  • All scraping logs');
  console.log('  • All scraped content');
  console.log('  • All scraped content archive');
  console.log('  • All factoid-source relationships\n');
  
  console.log('Database:', process.env.DATABASE_URL ? 'Using DATABASE_URL from .env' : 'Using local database');
  console.log('\nThis action cannot be undone!\n');
  
  if (process.argv[2] === '--confirm') {
    await clearJobAndScrapedData();
    await pool.end();
    process.exit(0);
  } else {
    console.log('To confirm deletion, run:');
    console.log('  node 02-db-clear.js --confirm\n');
    await pool.end();
    process.exit(1);
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('Fatal error:', error.message);
  pool.end();
  process.exit(1);
});