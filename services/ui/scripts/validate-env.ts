/**
 * Environment validation script for Veritas Railway Migration
 * 
 * Validates required environment variables for Railway PostgreSQL
 * and ensures proper configuration before deployment.
 */

const requiredEnvVars = [
  'DATABASE_PROVIDER',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_SSL'
];

const optionalEnvVars = [
  'NODE_ENV',
  'USE_LOCAL_DB',
  'LOCAL_DB_HOST',
  'LOCAL_DB_PORT',
  'LOCAL_DB_NAME',
  'LOCAL_DB_USER',
  'LOCAL_DB_PASSWORD'
];

function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...\n');

  // Check if using Railway provider
  const databaseProvider = process.env.DATABASE_PROVIDER;
  
  if (databaseProvider !== 'railway' && databaseProvider !== 'supabase') {
    console.warn('⚠️  DATABASE_PROVIDER not set. Falling back to Supabase configuration.');
    
    // Validate Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration incomplete:');
      if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL is missing');
      if (!supabaseKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
      process.exit(1);
    }
    
    console.log('✅ Supabase configuration validated');
    return;
  }

  if (databaseProvider === 'railway') {
    console.log('🚄 Validating Railway PostgreSQL configuration...\n');

    // Check required Railway variables
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables for Railway PostgreSQL:');
      missing.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\nPlease ensure all required variables are set in your environment.');
      console.error('Check env.example for the complete list of required variables.\n');
      process.exit(1);
    }

    // Validate NODE_ENV in production
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      // Validate SSL is enabled in production
      if (process.env.DATABASE_SSL !== 'true') {
        console.error('❌ DATABASE_SSL must be true in production environment');
        process.exit(1);
      }

      // Validate password strength in production
      const password = process.env.DATABASE_PASSWORD!;
      if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        console.warn('⚠️  Database password should be at least 12 characters with uppercase and numbers for production');
      }
    }

    // Validate development local database configuration if enabled
    if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true') {
      console.log('🔧 Validating local development database configuration...');
      
      const localDbVars = ['LOCAL_DB_HOST', 'LOCAL_DB_PORT', 'LOCAL_DB_NAME', 'LOCAL_DB_USER'];
      const missingLocal = localDbVars.filter(varName => !process.env[varName]);
      
      if (missingLocal.length > 0) {
        console.error('❌ Missing required local database environment variables:');
        missingLocal.forEach(varName => {
          console.error(`   - ${varName}`);
        });
        process.exit(1);
      }
    }

    // Display configuration summary
    console.log('✅ Environment validation passed!\n');
    console.log('📋 Configuration Summary:');
    console.log(`   Database Provider: ${databaseProvider}`);
    console.log(`   Environment: ${nodeEnv || 'development'}`);
    console.log(`   Database Host: ${process.env.DATABASE_HOST}`);
    console.log(`   Database Name: ${process.env.DATABASE_NAME}`);
    console.log(`   SSL Enabled: ${process.env.DATABASE_SSL}`);
    
    if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true') {
      console.log(`   Local DB Enabled: ${process.env.USE_LOCAL_DB}`);
      console.log(`   Local DB Host: ${process.env.LOCAL_DB_HOST}`);
    }
    
    console.log('');
  }
}

/**
 * Display environment variable template
 */
function showEnvTemplate(): void {
  console.log('📝 Railway PostgreSQL Environment Variables Template:\n');
  console.log('# Database Configuration');
  console.log('DATABASE_PROVIDER=railway');
  console.log('DATABASE_HOST=<railway_postgres_host>');
  console.log('DATABASE_PORT=5432');
  console.log('DATABASE_NAME=<railway_postgres_database>');
  console.log('DATABASE_USER=<railway_postgres_user>');
  console.log('DATABASE_PASSWORD=<railway_postgres_password>');
  console.log('DATABASE_SSL=true\n');
  
  console.log('# Development Database (Optional)');
  console.log('USE_LOCAL_DB=false');
  console.log('LOCAL_DB_HOST=localhost');
  console.log('LOCAL_DB_PORT=5432');
  console.log('LOCAL_DB_NAME=veritas_dev');
  console.log('LOCAL_DB_USER=postgres');
  console.log('LOCAL_DB_PASSWORD=\n');
  
  console.log('# Application');
  console.log('NODE_ENV=production');
  console.log('NEXT_PUBLIC_APP_URL=https://veritas-production.railway.app\n');
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