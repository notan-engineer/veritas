import * as dotenv from 'dotenv';
dotenv.config();

import { pool } from './database';

async function clearJobAndScrapedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting data cleanup...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Delete all scraping logs (cascades from jobs)
    const logsResult = await client.query('DELETE FROM scraping_logs');
    console.log(`✓ Deleted ${logsResult.rowCount} scraping logs`);
    
    // 2. Delete all scraping jobs
    const jobsResult = await client.query('DELETE FROM scraping_jobs');
    console.log(`✓ Deleted ${jobsResult.rowCount} scraping jobs`);
    
    // 3. Delete all factoid sources (relationships)
    const factoidSourcesResult = await client.query('DELETE FROM factoid_sources');
    console.log(`✓ Deleted ${factoidSourcesResult.rowCount} factoid-source relationships`);
    
    // 4. Delete all scraped content
    const contentResult = await client.query('DELETE FROM scraped_content');
    console.log(`✓ Deleted ${contentResult.rowCount} scraped content items`);
    
    // 5. Delete all scraped content archive (if any)
    const archiveResult = await client.query('DELETE FROM scraped_content_archive');
    console.log(`✓ Deleted ${archiveResult.rowCount} archived content items`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ All job-related data and scraped content cleared successfully!');
    
    // Show current counts to verify
    console.log('\nVerifying cleanup:');
    const jobCount = await client.query('SELECT COUNT(*) FROM scraping_jobs');
    const logCount = await client.query('SELECT COUNT(*) FROM scraping_logs');
    const contentCount = await client.query('SELECT COUNT(*) FROM scraped_content');
    
    console.log(`- Scraping jobs remaining: ${jobCount.rows[0].count}`);
    console.log(`- Scraping logs remaining: ${logCount.rows[0].count}`);
    console.log(`- Scraped content remaining: ${contentCount.rows[0].count}`);
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Confirmation prompt
async function main() {
  console.log('⚠️  WARNING: This will permanently delete:');
  console.log('- All scraping jobs');
  console.log('- All scraping logs');
  console.log('- All scraped content');
  console.log('- All scraped content archive');
  console.log('- All factoid-source relationships\n');
  
  console.log('This action cannot be undone!\n');
  
  // Simple confirmation without readline
  if (process.argv[2] === '--confirm') {
    await clearJobAndScrapedData();
    process.exit(0);
  } else {
    console.log('To confirm deletion, run: npm run clear:data -- --confirm');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});