/**
 * Environment validation script for Veritas
 * 
 * Validates required environment variables for Supabase
 * and ensures proper configuration before deployment.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...\n');

  // Validate Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuration incomplete:');
    if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL is missing');
    if (!supabaseKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    console.error('\nPlease ensure all required variables are set in your environment.');
    console.error('Check env.example for the complete list of required variables.\n');
    process.exit(1);
  }
  
  // Validate URLs are properly formatted
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    process.exit(1);
  }

  // Display configuration summary
  console.log('✅ Environment validation passed!\n');
  console.log('📋 Configuration Summary:');
  console.log(`   Database Provider: Supabase`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Supabase Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');
}

/**
 * Display environment variable template
 */
function showEnvTemplate(): void {
  console.log('📝 Supabase Environment Variables Template:\n');
  console.log('# Supabase Configuration');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n');
  console.log('# Application');
  console.log('NODE_ENV=production\n');
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