#!/usr/bin/env node

/**
 * Railway Utilities for Veritas Project
 * 
 * Provides secure, reusable commands for Railway operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load Railway configuration
const configPath = path.join(__dirname, '../infrastructure/railway-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Execute Railway CLI command with project context
 */
function railwayExec(command, options = {}) {
  const fullCommand = `npx @railway/cli ${command}`;
  console.log(`🚄 Executing: ${fullCommand}`);
  
  try {
    const result = execSync(fullCommand, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    return result;
  } catch (error) {
    console.error(`❌ Railway command failed: ${error.message}`);
    throw error;
  }
}

/**
 * Link to Railway project
 */
function linkProject() {
  console.log(`🔗 Linking to Railway project: ${config.projectName}`);
  return railwayExec(`link -p ${config.projectId}`);
}

/**
 * Get environment variables
 */
function getVariables() {
  console.log('📋 Getting Railway environment variables...');
  return railwayExec('variables');
}

/**
 * Run database seeding
 */
function seedDatabase() {
  console.log('🌱 Seeding Railway PostgreSQL database...');
  return railwayExec('run node database/seed-railway.js');
}

/**
 * Deploy application
 */
function deploy() {
  console.log('🚀 Deploying to Railway...');
  return railwayExec('up');
}

/**
 * Get service logs
 */
function getLogs(service = config.serviceName, lines = 100) {
  console.log(`📊 Getting logs for ${service} (last ${lines} lines)...`);
  return railwayExec(`logs --service ${service} --lines ${lines}`);
}

/**
 * Open Railway dashboard
 */
function openDashboard() {
  console.log('🌐 Opening Railway dashboard...');
  return railwayExec('open');
}

/**
 * Check Railway connection status
 */
function checkStatus() {
  console.log('🔍 Checking Railway project status...');
  try {
    const variables = railwayExec('variables', { silent: true });
    if (variables && variables.includes('DATABASE_PROVIDER')) {
      console.log(`✅ Connected to Railway project: ${config.projectName}`);
      console.log(`🌐 Public URL: https://${config.publicDomain}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Not connected to Railway project');
    return false;
  }
}

/**
 * Run environment validation
 */
function validateEnvironment() {
  console.log('🔍 Validating Railway environment...');
  return railwayExec('run npm run test:env');
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'link':
      linkProject();
      break;
    case 'variables':
    case 'vars':
      getVariables();
      break;
    case 'seed':
      seedDatabase();
      break;
    case 'deploy':
      deploy();
      break;
    case 'logs':
      const lines = process.argv[3] || 100;
      getLogs(config.serviceName, lines);
      break;
    case 'open':
      openDashboard();
      break;
    case 'status':
      checkStatus();
      break;
    case 'validate':
      validateEnvironment();
      break;
    default:
      console.log(`
🚄 Railway Utilities for ${config.projectName}

Usage: node scripts/railway-utils.js <command>

Commands:
  link       - Link to Railway project
  variables  - Show environment variables
  seed       - Seed database with mock data
  deploy     - Deploy application to Railway
  logs       - Show application logs
  open       - Open Railway dashboard
  status     - Check connection status
  validate   - Validate environment configuration

Examples:
  node scripts/railway-utils.js link
  node scripts/railway-utils.js seed
  node scripts/railway-utils.js logs 50
  node scripts/railway-utils.js status
      `);
  }
}

module.exports = {
  linkProject,
  getVariables,
  seedDatabase,
  deploy,
  getLogs,
  openDashboard,
  checkStatus,
  validateEnvironment,
  config
}; 