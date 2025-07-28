#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Comprehensive file lists for general context export
const GENERAL_CONTEXT_FILES = [
  // Product Documentation (all required)
  { path: 'README.md', required: true, section: 'Product Documentation' },
  { path: 'documentation/the-product.md', required: true, section: 'Product Documentation' },
  { path: 'documentation/business-logic-and-glossary.md', required: true, section: 'Product Documentation' },
  
  // Technical Architecture (all required)
  { path: 'documentation/software-architecture.md', required: true, section: 'Technical Architecture' },
  { path: 'database/schema.sql', required: true, section: 'Technical Architecture' },
  { path: 'railway.toml', required: true, section: 'Technical Architecture' },
  { path: 'env.example', required: true, section: 'Technical Architecture' },
  
  // Feature Documentation (optional)
  { path: 'documentation/features/01-news-feed.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/02-article-detail.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/03-content-scraping.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/04-scraper-dashboard.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/04a-job-triggering.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/05-source-management.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/06-content-management.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/07-settings-page.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/08-api-system.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/09-dark-mode.md', required: false, section: 'Feature Documentation' },
  { path: 'documentation/features/10-multilingual-support.md', required: false, section: 'Feature Documentation' },
  
  // Development Framework (all required)
  { path: 'keystone/development-principles.md', required: true, section: 'Development Framework' },
  { path: 'keystone/agentic-principles.md', required: true, section: 'Development Framework' },
  
  // Development Procedures (all required)
  { path: 'keystone/procedures/ui-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/api-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/database-work.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/error-resolution.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/local-testing.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/plan-first-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/branching-and-workflow.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/documentation.md', required: true, section: 'Development Procedures' },
  
  // Code Examples (required examples)
  { path: 'services/ui/app/api/factoids/route.ts', required: true, section: 'Code Examples', extract: true },
  { path: 'services/ui/app/scraper/components/dashboard-tab.tsx', required: true, section: 'Code Examples', extract: true },
  { path: 'services/scraper/src/types.ts', required: true, section: 'Code Examples' },
  
  // Project Template (required)
  { path: 'keystone/templates/new-project-template/README.md', required: true, section: 'Project Templates' },
  { path: 'keystone/templates/new-project-template/stories/story-template.md', required: true, section: 'Project Templates' },
];

// Security patterns to detect
const SENSITIVE_PATTERNS = [
  // Direct patterns
  /password\s*[:=]\s*["']([^"']+)["']/gi,
  /api[_-]?key\s*[:=]\s*["']([^"']+)["']/gi,
  /secret\s*[:=]\s*["']([^"']+)["']/gi,
  /token\s*[:=]\s*["']([^"']+)["']/gi,
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  
  // Environment variables
  /process\.env\.[A-Z_]*(?:KEY|TOKEN|SECRET|PASSWORD)/g,
  
  // Connection strings
  /(?:postgresql|postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/gi,
  
  // Private keys
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
  
  // AWS credentials
  /AKIA[0-9A-Z]{16}/g,
  
  // Generic secrets
  /(?:auth|credential|private|secret).*[:=].*["'][^"']{10,}["']/gi
];

/**
 * Validate that all required files exist
 * @param {Array} files - Array of file objects with path and required properties
 * @returns {Promise<Array>} Array of valid file objects
 */
async function validateFiles(files) {
  console.log('🔍 Validating files...');
  const missing = [];
  const found = [];
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file.path);
    try {
      await fs.access(fullPath);
      found.push(file);
    } catch {
      if (file.required) {
        missing.push(file.path);
      } else {
        console.log(`⚠️  Optional file not found: ${file.path}`);
      }
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Required files missing:');
    missing.forEach(f => console.error(`   - ${f}`));
    process.exit(1);
  }
  
  console.log(`✅ Validated ${found.length} files`);
  return found;
}

/**
 * Generate metadata for the export
 * @returns {Object} Metadata object
 */
async function generateMetadata() {
  const now = execSync('powershell -Command "Get-Date -Format \'dd-MM-yy HH:mm:ss\'"').toString().trim();
  const gitCommit = execSync('git rev-parse HEAD').toString().trim().substring(0, 7);
  
  // Calculate expiry date (7 days from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  const expiryFormatted = execSync(`powershell -Command "Get-Date '${expiryDate.toISOString()}' -Format 'dd-MM-yy'"`)
    .toString().trim();
  
  return {
    exportDate: now,
    gitCommit: gitCommit,
    useByDate: expiryFormatted,
    exportType: 'General Context',
    purpose: 'Comprehensive product and technical documentation'
  };
}

/**
 * Scan content for sensitive data patterns
 * @param {string} content - File content to scan
 * @param {string} filePath - Path of the file being scanned
 * @returns {Array} Array of warnings
 */
function scanForSensitiveData(content, filePath) {
  const warnings = [];
  const lines = content.split('\n');
  
  SENSITIVE_PATTERNS.forEach(pattern => {
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const matches = line.match(pattern);
      
      if (matches) {
        // Redact the sensitive part
        let redactedLine = line;
        matches.forEach(match => {
          // Keep first 3 chars and redact the rest
          const redacted = match.substring(0, 3) + '*'.repeat(Math.max(0, match.length - 3));
          redactedLine = redactedLine.replace(match, redacted);
        });
        
        warnings.push({
          file: filePath,
          lineNumber: lineNumber,
          line: redactedLine.trim(),
          pattern: pattern.source.substring(0, 50) + '...',
          matches: matches.length
        });
      }
    });
  });
  
  return warnings;
}

/**
 * Extract relevant code snippets from a file
 * @param {string} content - Full file content
 * @param {string} filePath - Path of the file
 * @returns {string} Extracted relevant portions
 */
function extractRelevantCode(content, filePath) {
  const lines = content.split('\n');
  const fileName = path.basename(filePath);
  
  if (fileName === 'route.ts') {
    // For API routes, extract the main functions and interfaces
    let extractedLines = [];
    let inFunction = false;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      if (line.includes('export') || line.includes('interface') || line.includes('type ')) {
        inFunction = true;
        extractedLines.push(line);
      } else if (inFunction) {
        extractedLines.push(line);
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        if (braceCount === 0 && line.includes('}')) {
          inFunction = false;
          extractedLines.push(''); // Add blank line between functions
        }
      }
    });
    
    return extractedLines.join('\n');
  } else if (fileName.includes('component')) {
    // For components, extract props interface and main component
    let extractedLines = [];
    let capturing = false;
    
    lines.forEach((line) => {
      if (line.includes('interface') && line.includes('Props')) {
        capturing = true;
      }
      if (line.includes('export function') || line.includes('export const')) {
        capturing = true;
      }
      if (capturing) {
        extractedLines.push(line);
      }
      if (capturing && line === '}' && !lines[lines.indexOf(line) + 1]?.trim()) {
        capturing = false;
      }
    });
    
    return extractedLines.join('\n');
  }
  
  return content;
}

/**
 * Build the documentation header
 * @returns {string} Header content
 */
function buildDocumentationHeader() {
  return `# Veritas Project - General Context Documentation

## Overview

This document provides comprehensive context about the Veritas project, including product vision, technical architecture, features, and development practices. It serves as a general reference for understanding the project without specific guidance for external LLMs.

## Document Purpose

This export contains detailed information about:
- Product vision and business logic
- Technical architecture and infrastructure
- Current features and capabilities
- Development framework and procedures
- Code patterns and examples
- Historical decisions and active development

The information is presented factually without instructional guidance, making it suitable for various use cases including:
- Project onboarding
- Technical reviews
- Architecture discussions
- Feature planning
- Knowledge transfer`;
}

/**
 * Build the project overview section
 * @returns {string} Project overview content
 */
function buildProjectOverview() {
  return `## Project Overview

### What is Veritas?

Veritas is a news aggregation and factoid extraction platform that helps users discover and track important information from various sources. The platform consists of three main services:

1. **UI Service**: A Next.js 15.3.5 frontend application providing the user interface
2. **Scraper Service**: A Crawlee-based content aggregation service with monitoring capabilities
3. **Database Service**: A PostgreSQL instance shared by both services

### Key Characteristics

- **No Authentication**: Simplified public access without user management
- **Direct Database Access**: Both services connect directly to PostgreSQL
- **Service Communication**: UI proxies scraper API calls via internal Railway URLs
- **Minimal Dependencies**: Only essential packages to reduce complexity
- **Incremental Development**: Features built in small, testable increments
- **User-Centric Design**: Every feature serves a clear user need

### Target Users

The platform is designed for individuals who:
- Need to stay informed about specific topics
- Want curated, factual information from multiple sources
- Prefer clean, distraction-free reading experiences
- Value source transparency and verification`;
}

/**
 * Extract dependencies from package.json files
 * @returns {Promise<Object>} Dependencies by service
 */
async function extractDependencies() {
  const dependencies = {};
  
  try {
    const uiPackage = JSON.parse(await fs.readFile(path.join(process.cwd(), 'services/ui/package.json'), 'utf-8'));
    dependencies['UI Service'] = {
      dependencies: Object.keys(uiPackage.dependencies || {}),
      devDependencies: Object.keys(uiPackage.devDependencies || {})
    };
  } catch (error) {
    console.warn('⚠️  Could not read UI package.json');
  }
  
  try {
    const scraperPackage = JSON.parse(await fs.readFile(path.join(process.cwd(), 'services/scraper/package.json'), 'utf-8'));
    dependencies['Scraper Service'] = {
      dependencies: Object.keys(scraperPackage.dependencies || {}),
      devDependencies: Object.keys(scraperPackage.devDependencies || {})
    };
  } catch (error) {
    console.warn('⚠️  Could not read Scraper package.json');
  }
  
  return dependencies;
}

/**
 * Main export function
 */
async function exportGeneralContext() {
  try {
    console.log('🚀 Starting general context export...');
    
    // Validate files first
    const validFiles = await validateFiles(GENERAL_CONTEXT_FILES);
    
    // Generate metadata
    const metadata = await generateMetadata();
    
    // Build the output content
    let output = buildDocumentationHeader() + '\n\n';
    output += buildProjectOverview() + '\n\n';
    
    // Add metadata section
    output += '## Metadata\n';
    output += `- **Export Date**: ${metadata.exportDate}\n`;
    output += `- **Git Commit**: ${metadata.gitCommit}\n`;
    output += `- **Use By Date**: ${metadata.useByDate} (context valid for 7 days)\n`;
    output += `- **Export Type**: ${metadata.exportType}\n`;
    output += `- **Purpose**: ${metadata.purpose}\n\n`;
    
    // Group files by section
    const sections = {};
    for (const file of validFiles) {
      if (!sections[file.section]) {
        sections[file.section] = [];
      }
      sections[file.section].push(file);
    }
    
    // Process each section
    const allWarnings = [];
    
    for (const [sectionName, files] of Object.entries(sections)) {
      const sectionId = sectionName.toLowerCase().replace(/\s+/g, '-');
      output += `<details>\n<summary>📂 ${sectionName}</summary>\n\n`;
      
      for (const file of files) {
        try {
          let content = await fs.readFile(path.join(process.cwd(), file.path), 'utf-8');
          
          // Extract relevant portions if needed
          if (file.extract) {
            content = extractRelevantCode(content, file.path);
          }
          
          const warnings = scanForSensitiveData(content, file.path);
          allWarnings.push(...warnings);
          
          const fileName = path.basename(file.path);
          const fileExt = path.extname(file.path).substring(1) || 'text';
          
          output += `### ${fileName}\n`;
          if (file.extract) {
            output += `*Note: Showing relevant excerpts only*\n`;
          }
          output += `\`\`\`${fileExt}\n${content}\n\`\`\`\n\n`;
        } catch (error) {
          console.warn(`⚠️  Error reading ${file.path}: ${error.message}`);
        }
      }
      
      output += '</details>\n\n';
    }
    
    // Add dependencies section
    output += '<details>\n<summary>📦 Service Dependencies</summary>\n\n';
    const dependencies = await extractDependencies();
    
    for (const [service, deps] of Object.entries(dependencies)) {
      output += `### ${service}\n`;
      output += '**Dependencies:**\n';
      deps.dependencies.forEach(dep => output += `- ${dep}\n`);
      output += '\n**Dev Dependencies:**\n';
      deps.devDependencies.forEach(dep => output += `- ${dep}\n`);
      output += '\n';
    }
    
    output += '</details>\n\n';
    
    // Add historical context section
    output += '<details>\n<summary>📜 Historical Context</summary>\n\n';
    
    // List completed projects
    output += '### Completed Projects\n';
    try {
      const archiveDir = path.join(process.cwd(), 'projects/archive');
      const archiveFiles = await fs.readdir(archiveDir);
      const mdFiles = archiveFiles.filter(f => f.endsWith('.md'));
      
      for (const file of mdFiles) {
        const name = file.replace('.md', '');
        output += `- ${name}\n`;
      }
    } catch (error) {
      console.warn('⚠️  Could not read archive directory');
    }
    
    // Include ADRs
    output += '\n### Architecture Decisions\n';
    try {
      const adrDir = path.join(process.cwd(), 'documentation/decisions');
      const adrFiles = await fs.readdir(adrDir);
      const adrMdFiles = adrFiles.filter(f => f.endsWith('.md') && f.startsWith('ADR-'));
      
      for (const file of adrMdFiles) {
        const content = await fs.readFile(path.join(adrDir, file), 'utf-8');
        const warnings = scanForSensitiveData(content, `documentation/decisions/${file}`);
        allWarnings.push(...warnings);
        
        output += `\n#### ${file}\n`;
        output += `\`\`\`markdown\n${content}\n\`\`\`\n`;
      }
    } catch (error) {
      console.warn('⚠️  Could not read ADR directory');
    }
    
    output += '\n</details>\n\n';
    
    // Add active development section
    output += '<details>\n<summary>🔄 Active Development</summary>\n\n';
    output += '### Current Projects\n';
    
    try {
      const projectsDir = path.join(process.cwd(), 'projects');
      const projectFiles = await fs.readdir(projectsDir);
      const activeMdFiles = projectFiles.filter(f => f.endsWith('.md'));
      
      for (const file of activeMdFiles) {
        const content = await fs.readFile(path.join(projectsDir, file), 'utf-8');
        const warnings = scanForSensitiveData(content, `projects/${file}`);
        allWarnings.push(...warnings);
        
        output += `\n#### ${file}\n`;
        output += `\`\`\`markdown\n${content}\n\`\`\`\n`;
      }
    } catch (error) {
      console.warn('⚠️  Could not read projects directory');
    }
    
    output += '\n</details>\n\n';
    
    // Add API endpoints overview
    output += '<details>\n<summary>🔌 API Endpoints</summary>\n\n';
    output += `### UI Service Endpoints (/api/)

- \`GET /api/factoids\` - Fetch all factoids with relationships
- \`GET /api/tags\` - Fetch all active tags
- \`POST /api/scraper/*\` - Proxy endpoints to scraper service

### Scraper Service Endpoints (:3001/api/)

- **Content Management**:
  - \`GET /api/content\` - Retrieve scraped content
  - \`POST /api/scrape\` - Trigger scraping operation
  
- **Job Management**:
  - \`GET /api/jobs\` - List scraping jobs
  - \`POST /api/jobs\` - Create new scraping job
  - \`DELETE /api/jobs/:id\` - Cancel running job
  
- **Source Management**:
  - \`GET /api/sources\` - List all sources
  - \`POST /api/sources\` - Create new source
  - \`PUT /api/sources/:id\` - Update source
  - \`DELETE /api/sources/:id\` - Delete source
  
- **Monitoring**:
  - \`GET /api/monitoring/stats\` - System statistics
  - \`GET /api/monitoring/logs\` - Recent logs
  - \`GET /health\` - Health check endpoint
  
- **Cleanup**:
  - \`POST /api/cleanup/logs\` - Clean old logs
  - \`POST /api/cleanup/content\` - Clean old content

</details>\n\n`;
    
    // Check for sensitive data warnings
    if (allWarnings.length > 0) {
      console.warn('\n⚠️  Potential sensitive data detected:');
      
      // Group warnings by file
      const warningsByFile = {};
      allWarnings.forEach(w => {
        if (!warningsByFile[w.file]) {
          warningsByFile[w.file] = [];
        }
        warningsByFile[w.file].push(w);
      });
      
      // Display warnings grouped by file
      Object.entries(warningsByFile).forEach(([file, fileWarnings]) => {
        console.warn(`\n   📄 ${file}:`);
        fileWarnings.forEach(w => {
          console.warn(`      Line ${w.lineNumber}: ${w.line}`);
        });
      });
      
      // For now, continue anyway but log the warning
      console.log('\n⚠️  Please review the output for sensitive data before sharing.');
    }
    
    // Ensure the export directory exists
    const exportDir = path.join(process.cwd(), 'documentation/exported-knowledge');
    await fs.mkdir(exportDir, { recursive: true });
    
    // Write the output file
    const dateStr = execSync('powershell -Command "Get-Date -Format \'dd-MM-yy\'"').toString().trim();
    const outputPath = path.join(exportDir, `${dateStr} - General Context.md`);
    
    await fs.writeFile(outputPath, output, 'utf-8');
    
    console.log(`\n✅ Export complete! File created at:\n   ${outputPath}`);
    console.log(`\n📅 This export is valid until: ${metadata.useByDate}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
exportGeneralContext();