#!/usr/bin/env node

/**
 * Database Cleanup Utility
 * Clears all scraped content and job-related data from the database
 * Usage: 
 *   node 02-db-clear.js [--confirm] [--production]
 *   node 02-db-clear.js --confirm          # Clear local database
 *   node 02-db-clear.js --confirm --production  # Clear production database
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
require('dotenv').config({ path: '../services/scraper/.env' });

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes('--production') || args.includes('--prod');
const isConfirmed = args.includes('--confirm');

// Get database URL based on environment
let connectionString;
if (isProduction) {
  try {
    // Get production database URL from Railway
    // Run from project root to ensure Railway link works
    const path = require('path');
    const projectRoot = path.resolve(__dirname, '..');
    const output = execSync('railway variables --service db', { 
      encoding: 'utf8',
      cwd: projectRoot 
    });
    
    // Handle multi-line URLs from Railway output
    const lines = output.split('\n');
    let url = '';
    let foundDatabasePublicUrl = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('DATABASE_PUBLIC_URL')) {
        foundDatabasePublicUrl = true;
        // Extract the part after the │ character, but before the last ║
        const match = line.match(/│\s*([^║]+)/);
        if (match) {
          url = match[1].trim();
        }
      } else if (foundDatabasePublicUrl && line.includes('│') && !line.includes('─')) {
        // This is a continuation of the DATABASE_PUBLIC_URL value
        // Look for lines that start with ║ followed by spaces, then │
        if (line.match(/^║\s*│/)) {
          const match = line.match(/│\s*([^║]+)/);
          if (match) {
            url += match[1].trim();
          }
        } else {
          // We've reached a new variable, stop collecting
          break;
        }
      } else if (foundDatabasePublicUrl && line.includes('─')) {
        // We've reached the separator line, stop collecting
        break;
      }
    }
    
    connectionString = url;
    
    if (!connectionString || !connectionString.startsWith('postgresql://')) {
      throw new Error('Could not get valid DATABASE_PUBLIC_URL from Railway');
    }
  } catch (error) {
    console.error('❌ Failed to get production database URL from Railway');
    console.error('Make sure you have Railway CLI installed and linked to the project:');
    console.error('  railway link -p 32900e57-b721-494d-8e68-d15ac01e5c03');
    console.error('\nError:', error.message);
    process.exit(1);
  }
} else {
  connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local';
}

// Database connection
const pool = new Pool({ connectionString });

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
  
  // Show which database is being targeted
  if (isProduction) {
    console.log('🔴 TARGET: PRODUCTION DATABASE');
    console.log('Database: Railway Production Database');
    console.log('URL:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
  } else {
    console.log('🟢 TARGET: LOCAL DATABASE');
    console.log('Database:', process.env.DATABASE_URL ? 'Using DATABASE_URL from .env' : 'Using default local database');
  }
  console.log('\nThis action cannot be undone!\n');
  
  if (isConfirmed) {
    await clearJobAndScrapedData();
    await pool.end();
    process.exit(0);
  } else {
    console.log('To confirm deletion, run:');
    if (isProduction) {
      console.log('  node 02-db-clear.js --confirm --production\n');
    } else {
      console.log('  node 02-db-clear.js --confirm\n');
      console.log('For production database, add --production flag:');
      console.log('  node 02-db-clear.js --confirm --production\n');
    }
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