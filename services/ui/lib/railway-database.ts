import 'server-only';

/**
 * Railway PostgreSQL Database Client
 * 
 * ⚠️ SERVER-SIDE ONLY - This module cannot be used in browser environments
 * Handles connection pooling and query execution for Railway PostgreSQL
 */

// Ensure this runs only on server-side
if (typeof window !== 'undefined') {
  throw new Error('Railway database client can only be used on the server side');
}

import type { Pool, PoolClient, QueryResult } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

class RailwayDatabase {
  private pool: Pool | null = null;
  private isInitialized = false;

  /**
   * Get PostgreSQL Pool class (server-side only)
   */
  private getPoolClass(): new (config: object) => Pool {
    // Dynamic import for server-side only to prevent browser bundling
    const pg = eval('require')('pg');
    return pg.Pool;
  }

  /**
   * Get database configuration from environment variables
   */
  private getDatabaseConfig(): DatabaseConfig {
    console.log('[DB] Getting database configuration...');
    // Check for DATABASE_URL first (Railway's preferred format)
    if (process.env.DATABASE_URL) {
      console.log('[DB] DATABASE_URL found. Parsing...');
      try {
        const url = new URL(process.env.DATABASE_URL);
        return {
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1),
          user: url.username,
          password: url.password,
          ssl: true // Railway requires SSL
        };
      } catch (error) {
        console.error('[DB] Error parsing DATABASE_URL:', error);
      }
    } else {
      console.log('[DB] DATABASE_URL not found. Using individual variables.');
    }

    // Fallback to individual environment variables
    const config = {
      host: process.env.DATABASE_HOST || '',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || '',
      user: process.env.DATABASE_USER || '',
      password: process.env.DATABASE_PASSWORD || '',
      ssl: process.env.DATABASE_SSL === 'true'
    };
    console.log(`[DB] Config constructed: host=${config.host}, port=${config.port}, db=${config.database}, user=${config.user}, ssl=${config.ssl}`);
    return config;
  }

  /**
   * Initialize the connection pool
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }
    console.log('[DB] Initializing connection pool...');
    
    const config = this.getDatabaseConfig();

    // Validate configuration
    if (!config.host || !config.database || !config.user || !config.password) {
      console.error('[DB] Missing required database configuration.');
      throw new Error('Missing required database configuration. Please check your environment variables.');
    }

    const PoolClass = this.getPoolClass();
    this.pool = new PoolClass({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      
      // Connection pool settings
      max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
      idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '2000')
    });

    // Test connection
    try {
      console.log('[DB] Testing connection pool...');
      await this.pool.query('SELECT 1');
      this.isInitialized = true;
      console.log('✅ [DB] Railway PostgreSQL connection pool initialized');
    } catch (error) {
      console.error('❌ [DB] Failed to connect to Railway PostgreSQL:', error);
      this.pool = null;
      throw new Error(`Failed to connect to Railway PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a query
   */
  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    await this.initialize();
    
    if (!this.pool) {
      console.error('[DB] Query attempted but pool not initialized.');
      throw new Error('Database pool not initialized');
    }
    console.log(`[DB] Executing query: ${text.substring(0, 100).replace(/\s+/g, ' ')}...`);

    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection pool status
   */
  getPoolStatus() {
    if (!this.pool) {
      return { totalConnections: 0, idleConnections: 0, waitingClients: 0 };
    }

    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount
    };
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('🔌 Railway PostgreSQL connection pool closed');
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('Railway PostgreSQL connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const railwayDb = new RailwayDatabase();

/**
 * Helper function for executing queries (server-side only)
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  return railwayDb.query(text, params);
}

/**
 * Helper function for transactions (server-side only)
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  return railwayDb.transaction(callback);
}

/**
 * Database health check (server-side only)
 */
export async function checkDatabaseHealth() {
  try {
    const isConnected = await railwayDb.testConnection();
    const poolStatus = railwayDb.getPoolStatus();
    
    return {
      connected: isConnected,
      provider: 'railway',
      poolStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      provider: 'railway',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
} 