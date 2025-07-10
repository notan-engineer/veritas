const https = require('https');
const http = require('http');

/**
 * Test Railway API endpoints to verify deployment
 */
async function testRailwayEndpoints() {
  console.log('🚄 Testing Railway deployment endpoints...\n');
  
  // Replace with your actual Railway app URL
  const baseUrl = 'https://your-railway-app.railway.app'; // Update this with your Railway URL
  
  const endpoints = [
    '/api/railway/factoids',
    '/api/railway/tags',
    '/api/railway/factoids/search?q=NVIDIA'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint} - Success`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data items: ${Array.isArray(data) ? data.length : 'N/A'}`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample: ${data[0].title || data[0].name || JSON.stringify(data[0]).substring(0, 100)}`);
        }
      } else {
        console.log(`❌ ${endpoint} - Error`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ ${endpoint} - Network Error:`, error.message);
      console.log('');
    }
  }
}

/**
 * Check Railway deployment status
 */
async function checkRailwayStatus() {
  console.log('🔍 Checking Railway deployment status...\n');
  
  try {
    const response = await fetch('https://your-railway-app.railway.app/api/railway/factoids');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Railway deployment is working!');
      console.log(`📊 Found ${data.length} factoids in database`);
      
      // Check for multilingual content
      const languages = [...new Set(data.map(f => f.language))];
      console.log(`🌍 Languages: ${languages.join(', ')}`);
      
      // Check for search functionality
      const searchResponse = await fetch('https://your-railway-app.railway.app/api/railway/factoids/search?q=technology');
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`🔍 Search functionality working: ${searchData.length} results for "technology"`);
      }
      
      return true;
    } else {
      console.log('❌ Railway deployment has issues');
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot reach Railway deployment:', error.message);
    return false;
  }
}

// Simple fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = async function(url) {
    const { URL } = require('url');
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    return new Promise((resolve, reject) => {
      const req = client.request(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => JSON.parse(data)
          });
        });
      });
      
      req.on('error', reject);
      req.end();
    });
  };
}

// Run tests if called directly
if (require.main === module) {
  console.log('🧪 Railway Deployment Verification\n');
  console.log('ℹ️  Update the baseUrl in this script with your actual Railway URL\n');
  
  checkRailwayStatus()
    .then(success => {
      if (success) {
        return testRailwayEndpoints();
      } else {
        console.log('⚠️  Skipping detailed endpoint tests due to connection issues');
      }
    })
    .catch(console.error);
}

module.exports = { testRailwayEndpoints, checkRailwayStatus }; 