// Test script for enhanced logging
import * as dotenv from 'dotenv';
dotenv.config();

import { pool } from './database';

interface LogRow {
  log_level: string;
  message: string;
  event_type: string;
  event_name: string;
  source_name: string | null;
  created_at: string;
}

async function testEnhancedLogging() {
  console.log('Testing enhanced logging implementation...\n');
  
  try {
    // Query recent logs to see the new event types
    const result = await pool.query<LogRow>(`
      SELECT 
        log_level,
        message,
        additional_data->>'event_type' as event_type,
        additional_data->>'event_name' as event_name,
        additional_data->>'source_name' as source_name,
        created_at
      FROM scraping_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
        AND additional_data->>'event_type' IN ('extraction', 'persistence', 'lifecycle')
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    if (result.rows.length === 0) {
      console.log('No recent enhanced logs found. Run a scraping job to generate logs.');
      return;
    }
    
    console.log(`Found ${result.rows.length} enhanced log entries:\n`);
    
    // Group by event type
    const byEventType = result.rows.reduce((acc, row) => {
      const type = row.event_type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(row);
      return acc;
    }, {} as Record<string, LogRow[]>);
    
    // Display logs by type
    for (const [type, logs] of Object.entries(byEventType)) {
      console.log(`\n=== ${type.toUpperCase()} Events ===`);
      logs.forEach((log) => {
        console.log(`[${log.log_level}] ${log.message}`);
        console.log(`  Event: ${log.event_name}`);
        if (log.source_name) console.log(`  Source: ${log.source_name}`);
        console.log(`  Time: ${new Date(log.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check for extraction vs persistence discrepancies
    const extractionCompleted = result.rows.filter(r => r.event_name === 'extraction_completed').length;
    const persistenceCompleted = result.rows.filter(r => r.event_name === 'source_persistence_completed').length;
    
    console.log('\n=== Summary ===');
    console.log(`Extraction completed events: ${extractionCompleted}`);
    console.log(`Persistence completed events: ${persistenceCompleted}`);
    
    if (extractionCompleted !== persistenceCompleted) {
      console.log('\n⚠️  Discrepancy detected between extraction and persistence events!');
    }
    
  } catch (error) {
    console.error('Error testing enhanced logging:', error);
  } finally {
    await pool.end();
  }
}

testEnhancedLogging();