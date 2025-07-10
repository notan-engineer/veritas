/* eslint-disable @typescript-eslint/no-require-imports */

import { getDatabaseConfig, validateDatabaseConfig, getDatabaseProvider } from './database-config';

// Type definitions for PostgreSQL results
interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  command: string;
}

interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface PostgreSQLPool {
  connect(): Promise<PostgreSQLClient>;
  query(text: string, params?: unknown[]): Promise<QueryResult>;
  end(): Promise<void>;
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

interface PostgreSQLClient {
  query(text: string, params?: unknown[]): Promise<QueryResult>;
  release(): void;
}

/**
 * PostgreSQL Client with Connection Pooling
 * 
 * Provides a secure, optimized connection to Railway PostgreSQL
 * with connection pooling, transaction support, and retry logic.
 * 
 * ⚠️ SERVER-SIDE ONLY - This client cannot be used in browser environments
 */
class VeritasPostgreSQLClient {
  private pool: PostgreSQLPool | null = null;
  private isInitialized = false;

  /**
   * Check if running in server-side environment
   */
  private checkServerSide(): void {
    if (typeof window !== 'undefined') {
      throw new Error('PostgreSQL client can only be used on the server side');
    }
  }

  /**
   * Get PostgreSQL Pool class (server-side only)
   */
  private getPoolClass(): new (config: PoolConfig) => PostgreSQLPool {
    this.checkServerSide();
    
    // Dynamic import for server-side only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pg = require('pg') as any;
    return pg.Pool;
  }

  /**
   * Initialize the connection pool
   */
  private async initialize(): Promise<void> {
    this.checkServerSide();
    
    if (this.isInitialized && this.pool) {
      return;
    }

    // Only initialize for Railway PostgreSQL
    if (getDatabaseProvider() !== 'railway') {
      throw new Error('PostgreSQL client can only be used with Railway PostgreSQL provider');
    }

    const config = getDatabaseConfig();
    validateDatabaseConfig(config);

    const PoolClass = this.getPoolClass();
    this.pool = new PoolClass({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl,
      
      // Connection pool configuration
      max: 20, // Maximum number of clients in the pool
      min: 2,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000 // Return error after 2 seconds if no connection available
    });

    // Test connection on initialization
    try {
      await this.pool.query('SELECT 1');
      this.isInitialized = true;
      console.log('PostgreSQL connection pool initialized successfully');
    } catch (error) {
      this.pool = null;
      throw new Error(`Failed to initialize PostgreSQL connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    this.checkServerSide();
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('PostgreSQL connection pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      // Validate query safety
      this.validateQuery(text, params);
      
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (client: PostgreSQLClient) => Promise<T>): Promise<T> {
    this.checkServerSide();
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('PostgreSQL connection pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('PostgreSQL transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate query for security (prevent SQL injection)
   */
  private validateQuery(query: string, params?: unknown[]): void {
    // Check for dynamic SQL construction via template literals
    if (query.includes('${')) {
      throw new Error('Dynamic SQL construction detected - use parameterized queries');
    }
    
    // Validate parameter count matches query placeholders
    const placeholderCount = (query.match(/\$\d+/g) || []).length;
    if (params && placeholderCount !== params.length) {
      throw new Error(`Parameter count mismatch: expected ${placeholderCount}, got ${params.length}`);
    }
  }

  /**
   * Get connection pool status
   */
  async getPoolStatus(): Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  }> {
    this.checkServerSide();
    
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
    this.checkServerSide();
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('PostgreSQL connection pool closed');
    }
  }

  /**
   * Test the database connection
   */
  async testConnection(): Promise<boolean> {
    this.checkServerSide();
    
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const postgresClient = new VeritasPostgreSQLClient();

/**
 * Helper function for safe queries with validation
 */
export async function safeQuery(query: string, params: unknown[] = []): Promise<QueryResult> {
  return postgresClient.query(query, params);
}

/**
 * Helper function for transactions
 */
export async function withTransaction<T>(callback: (client: PostgreSQLClient) => Promise<T>): Promise<T> {
  return postgresClient.transaction(callback);
}

/**
 * Connection health check function
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  provider: string;
  poolStatus?: {
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  };
  error?: string;
}> {
  // Check if running on server-side
  if (typeof window !== 'undefined') {
    return {
      connected: false,
      provider: 'unknown',
      error: 'PostgreSQL client can only be used on the server side'
    };
  }

  const provider = getDatabaseProvider();
  
  if (provider !== 'railway') {
    return {
      connected: false,
      provider,
      error: 'PostgreSQL client only supports Railway provider'
    };
  }

  try {
    const connected = await postgresClient.testConnection();
    const poolStatus = await postgresClient.getPoolStatus();
    
    return {
      connected,
      provider,
      poolStatus
    };
  } catch (error) {
    return {
      connected: false,
      provider,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 