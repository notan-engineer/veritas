#!/usr/bin/env node

/**
 * Analyze All Sources - Run extraction analyzer for each source
 *
 * This script runs the extraction analyzer for each source in the database,
 * analyzing 3 articles from each source and generating HTML reports.
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// List of sources to analyze
const sources = [
  'BBC News',
  'CNN',
  'Fox News',
  'NY Times',
  'The Guardian',
  'WSJ'
];

async function analyzeAllSources() {
  log('\n🔍 Extraction Analysis for All Sources', 'blue');
  log('=' .repeat(50), 'gray');
  log('Analyzing 3 articles from each source...', 'cyan');
  log('=' .repeat(50), 'gray');

  const results = [];
  const outputDir = path.join(__dirname, 'utility-output');

  // Ensure output directory exists
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (e) {
    // Directory already exists
  }

  for (const source of sources) {
    log(`\n📰 Processing: ${source}`, 'yellow');
    log('-'.repeat(40), 'gray');

    try {
      // Generate unique filename for this source
      const timestamp = Date.now();
      const sourceSlug = source.toLowerCase().replace(/\s+/g, '-');
      const outputFile = `extraction-${sourceSlug}-${timestamp}.html`;

      // Run the extraction analyzer
      const command = `node 07-extraction-analyzer.js "${source}" "${outputFile}"`;

      log(`  ⏳ Running extraction analyzer...`, 'gray');

      const output = execSync(command, {
        cwd: __dirname,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse output to find the generated file
      const fileMatch = output.match(/File: (.+\.html)/);
      if (fileMatch) {
        const filePath = fileMatch[1];
        results.push({
          source,
          status: 'success',
          file: filePath
        });
        log(`  ✅ Success! Report generated`, 'green');
        log(`  📁 File: ${path.basename(filePath)}`, 'gray');
      } else {
        results.push({
          source,
          status: 'warning',
          message: 'File generated but path not found in output'
        });
        log(`  ⚠️  Report generated but path unclear`, 'yellow');
      }

      // Extract some stats from the output
      const articlesMatch = output.match(/Articles analyzed: (\d+)/);
      if (articlesMatch) {
        log(`  📊 Articles analyzed: ${articlesMatch[1]}`, 'cyan');
      }

    } catch (error) {
      results.push({
        source,
        status: 'error',
        message: error.message
      });
      log(`  ❌ Error: ${error.message}`, 'red');

      // Continue with next source
      continue;
    }

    // Small delay between sources to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  log('\n' + '=' .repeat(50), 'gray');
  log('📊 Analysis Summary', 'blue');
  log('=' .repeat(50), 'gray');

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  log(`✅ Successful: ${successful}/${sources.length}`, 'green');
  if (warnings > 0) {
    log(`⚠️  Warnings: ${warnings}`, 'yellow');
  }
  if (failed > 0) {
    log(`❌ Failed: ${failed}`, 'red');
  }

  // List generated files
  log('\n📁 Generated Reports:', 'cyan');
  for (const result of results) {
    if (result.status === 'success' && result.file) {
      log(`  • ${result.source}: ${path.basename(result.file)}`, 'gray');
    } else if (result.status === 'error') {
      log(`  • ${result.source}: Failed - ${result.message}`, 'red');
    }
  }

  // List all HTML files in the output directory
  log('\n📂 All files in utility-output:', 'cyan');
  try {
    const files = await fs.readdir(outputDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    log(`  Found ${htmlFiles.length} HTML report(s)`, 'gray');

    // Show the most recent files
    const recentFiles = htmlFiles
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 10);

    if (recentFiles.length > 0) {
      log('\n  Recent reports:', 'gray');
      for (const file of recentFiles) {
        const fullPath = path.join(outputDir, file);
        const stats = await fs.stat(fullPath);
        const size = (stats.size / 1024).toFixed(1);
        log(`    - ${file} (${size} KB)`, 'gray');
      }
    }
  } catch (error) {
    log(`  Error reading directory: ${error.message}`, 'red');
  }

  log('\n💡 Open the HTML files in your browser to view the extraction analysis', 'yellow');
  log(`📁 Location: ${outputDir}`, 'cyan');
}

// Run the analysis
analyzeAllSources().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});