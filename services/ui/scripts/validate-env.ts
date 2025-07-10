/**
 * Environment validation script for Veritas
 * 
 * Validates required environment variables for Railway PostgreSQL
 * and ensures proper configuration before deployment.
 */

const requiredEnvVars = [
  'DATABASE_URL', // Railway's preferred format
];

const alternativeEnvVars = [
  'DATABASE_HOST',
  'DATABASE_PORT', 
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD'
];

function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...\n');

  // Check for DATABASE_URL first (Railway's preferred format)
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Validate DATABASE_URL format
    try {
      const url = new URL(databaseUrl);
      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        console.error('❌ DATABASE_URL must be a valid PostgreSQL connection string');
        process.exit(1);
      }
      
      console.log('✅ DATABASE_URL found and valid');
    } catch (error) {
      console.error('❌ DATABASE_URL is not a valid URL format');
      process.exit(1);
    }
  } else {
    // Check individual environment variables as fallback
    console.log('ℹ️  DATABASE_URL not found, checking individual database variables...');
    
    const missing = alternativeEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required database environment variables:');
      missing.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\nEither set DATABASE_URL or all individual database variables.');
      console.error('Check env.example for the complete list of required variables.\n');
      process.exit(1);
    }
    
    console.log('✅ Individual database variables found');
  }

  // Validate SSL setting for production
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    const databaseSsl = process.env.DATABASE_SSL;
    if (databaseSsl !== 'true' && !databaseUrl) {
      console.warn('⚠️  DATABASE_SSL should be true in production environment');
    }
  }

  // Display configuration summary
  console.log('\n✅ Environment validation passed!\n');
  console.log('📋 Configuration Summary:');
  console.log(`   Database Provider: Railway PostgreSQL`);
  console.log(`   Environment: ${nodeEnv || 'development'}`);
  
  if (databaseUrl) {
    const url = new URL(databaseUrl);
    console.log(`   Database Host: ${url.hostname}`);
    console.log(`   Database Name: ${url.pathname.slice(1)}`);
    console.log(`   Connection: DATABASE_URL`);
  } else {
    console.log(`   Database Host: ${process.env.DATABASE_HOST}`);
    console.log(`   Database Name: ${process.env.DATABASE_NAME}`);
    console.log(`   SSL Enabled: ${process.env.DATABASE_SSL || 'false'}`);
    console.log(`   Connection: Individual variables`);
  }
  
  console.log('');
}

/**
 * Display environment variable template
 */
function showEnvTemplate(): void {
  console.log('📝 Railway PostgreSQL Environment Variables Template:\n');
  
  console.log('# Option 1: DATABASE_URL (Recommended for Railway)');
  console.log('DATABASE_URL=postgresql://username:password@host:port/database\n');
  
  console.log('# Option 2: Individual Variables (Alternative)');
  console.log('DATABASE_HOST=your-railway-postgres-host');
  console.log('DATABASE_PORT=5432');
  console.log('DATABASE_NAME=railway');
  console.log('DATABASE_USER=postgres');
  console.log('DATABASE_PASSWORD=your-password');
  console.log('DATABASE_SSL=true\n');
  
  console.log('# Application');
  console.log('NODE_ENV=production\n');
  
  console.log('💡 Railway automatically provides DATABASE_URL, so you typically');
  console.log('   only need to ensure it\'s available in your deployment environment.');
}

// Main execution
if (require.main === module) {
  try {
    if (process.argv.includes('--template')) {
      showEnvTemplate();
    } else {
      validateEnvironment();
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

export { validateEnvironment, showEnvTemplate }; 