#!/usr/bin/env tsx
/**
 * Database initialization script for Railway deployment
 * 
 * This script sets up the database schema and seeds it with sample data
 * if the database is empty. It's designed to be run during Railway deployment.
 */

import { railwayDb } from '../lib/railway-database';
import { readFile } from 'fs/promises';
import { join } from 'path';

const DATABASE_SCHEMA_PATH = join(process.cwd(), '../../database/railway-schema.sql');
const SAMPLE_DATA_PATH = join(process.cwd(), '../../database/migrations/veritas-migration.sql');

async function checkDatabaseExists(): Promise<boolean> {
  try {
    const result = await railwayDb.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1', ['public']);
    const tableCount = parseInt(result.rows[0].count);
    console.log(`📊 Found ${tableCount} tables in database`);
    return tableCount > 0;
  } catch (error) {
    console.error('❌ Error checking database existence:', error);
    return false;
  }
}

async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await railwayDb.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('factoids', 'tags', 'sources', 'scraped_content', 'factoid_tags', 'factoid_sources')
    `);
    const tableCount = parseInt(result.rows[0].count);
    console.log(`📊 Found ${tableCount}/6 required tables`);
    return tableCount === 6;
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}

async function checkDataExists(): Promise<boolean> {
  try {
    const result = await railwayDb.query('SELECT COUNT(*) FROM factoids WHERE status = $1', ['published']);
    const factoidCount = parseInt(result.rows[0].count);
    console.log(`📊 Found ${factoidCount} published factoids`);
    return factoidCount > 0;
  } catch (error) {
    console.log('ℹ️  No factoids table found or no data');
    return false;
  }
}

async function createSchema(): Promise<void> {
  try {
    console.log('🔧 Creating database schema...');
    const schemaSQL = await readFile(DATABASE_SCHEMA_PATH, 'utf-8');
    await railwayDb.query(schemaSQL);
    console.log('✅ Database schema created successfully');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  }
}

async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Seeding database with sample data...');
    const migrationSQL = await readFile(SAMPLE_DATA_PATH, 'utf-8');
    
    // Extract only the INSERT statements from the migration file
    const insertStatements = migrationSQL
      .split('\n')
      .filter(line => line.trim().startsWith('INSERT INTO'))
      .join('\n');
    
    if (insertStatements) {
      await railwayDb.query(insertStatements);
      console.log('✅ Database seeded with sample data');
    } else {
      console.log('ℹ️  No sample data found in migration file');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    // Don't throw here - seeding is optional
  }
}

async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Check if database connection works
    const connectionTest = await railwayDb.testConnection();
    if (!connectionTest) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection established');
    
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log('📋 Tables do not exist, creating schema...');
      await createSchema();
    } else {
      console.log('✅ Required tables already exist');
    }
    
    // Check if data exists
    const dataExists = await checkDataExists();
    if (!dataExists) {
      console.log('📋 No data found, seeding database...');
      await seedDatabase();
    } else {
      console.log('✅ Database already has data');
    }
    
    console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase, checkDatabaseExists, checkTablesExist, checkDataExists }; 