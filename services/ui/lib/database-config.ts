interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

/**
 * Parse PostgreSQL connection URL into DatabaseConfig
 * Format: postgresql://username:password@host:port/database
 */
function parsePostgreSQLUrl(url: string): DatabaseConfig {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== 'postgresql:') {
      throw new Error('Invalid PostgreSQL URL protocol');
    }
    
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1), // Remove leading '/'
      username: parsed.username,
      password: parsed.password,
      ssl: true // Railway always uses SSL
    };
  } catch (error) {
    throw new Error(`Failed to parse DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get database configuration based on environment
 * Supports both Railway PostgreSQL and Supabase configurations
 */
export function getDatabaseConfig(): DatabaseConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Development local database option
  if (isDevelopment && process.env.USE_LOCAL_DB === 'true') {
    return {
      host: process.env.LOCAL_DB_HOST || 'localhost',
      port: parseInt(process.env.LOCAL_DB_PORT || '5432'),
      database: process.env.LOCAL_DB_NAME || 'veritas_dev',
      username: process.env.LOCAL_DB_USER || 'postgres',
      password: process.env.LOCAL_DB_PASSWORD || '',
      ssl: false
    };
  }
  
  // Railway PostgreSQL configuration
  if (process.env.DATABASE_PROVIDER === 'railway') {
    // Option 1: Use DATABASE_URL (Railway's preferred method)
    if (process.env.DATABASE_URL) {
      return parsePostgreSQLUrl(process.env.DATABASE_URL);
    }
    
    // Option 2: Use individual environment variables
    if (!process.env.DATABASE_HOST || !process.env.DATABASE_NAME || 
        !process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD) {
      throw new Error('Missing required Railway PostgreSQL environment variables');
    }
    
    return {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true'
    };
  }
  
  // Fallback to Supabase configuration (for migration compatibility)
  // Note: This extracts connection details from Supabase URL if needed
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // For now, we'll continue using Supabase client
    // This configuration is for future direct PostgreSQL connection to Supabase
    throw new Error('Direct PostgreSQL connection to Supabase not implemented yet. Use Supabase client.');
  }
  
  throw new Error('No valid database configuration found. Please set DATABASE_PROVIDER=railway or configure Supabase.');
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.host || !config.database || !config.username || !config.password) {
    throw new Error('Missing required database configuration');
  }
  
  if (!config.ssl && process.env.NODE_ENV === 'production') {
    throw new Error('SSL must be enabled in production');
  }
  
  if (config.password.length < 8) {
    console.warn('Database password should be at least 8 characters');
  }
}

/**
 * Get the database provider being used
 */
export function getDatabaseProvider(): 'railway' | 'supabase' | 'local' {
  if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true') {
    return 'local';
  }
  
  if (process.env.DATABASE_PROVIDER === 'railway') {
    return 'railway';
  }
  
  return 'supabase';
} 