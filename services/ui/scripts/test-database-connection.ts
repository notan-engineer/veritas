#!/usr/bin/env tsx
/**
 * Quick database connection test script
 * Run this to verify if your app is using the database or mock data
 */

import { checkDatabaseHealth } from '../lib/railway-database';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    const health = await checkDatabaseHealth();
    
    console.log('📊 Database Status:');
    console.log(`   Connected: ${health.connected ? '✅ YES' : '❌ NO'}`);
    console.log(`   Provider: ${health.provider}`);
    console.log(`   Timestamp: ${health.timestamp}`);
    
    if (health.poolStatus) {
      console.log('\n📊 Connection Pool:');
      console.log(`   Total Connections: ${health.poolStatus.totalConnections}`);
      console.log(`   Idle Connections: ${health.poolStatus.idleConnections}`);
      console.log(`   Waiting Clients: ${health.poolStatus.waitingClients}`);
    }

    if (health.error) {
      console.log(`\n❌ Error: ${health.error}`);
    }

    console.log('\n🎯 Result:');
    if (health.connected) {
      console.log('✅ Your app is using the RAILWAY DATABASE');
    } else {
      console.log('⚠️  Your app is using MOCK DATA (database unavailable)');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('\n🎯 Result: Your app is using MOCK DATA (database unavailable)');
  }
}

// Run the test if this script is called directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testDatabaseConnection }; 