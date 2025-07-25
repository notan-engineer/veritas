#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// File lists for planning export
const PLANNING_FILES = [
  // Product Vision (required)
  { path: 'documentation/the-product.md', required: true, section: 'Product Vision' },
  
  // Technical Architecture (required)
  { path: 'documentation/software-architecture.md', required: true, section: 'Technical Architecture' },
  { path: 'database/schema.sql', required: true, section: 'Technical Architecture' },
  { path: 'railway.toml', required: true, section: 'Technical Architecture' },
  
  // Development Procedures (all required)
  { path: 'keystone/procedures/ui-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/api-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/database-work.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/error-resolution.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/local-testing.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/plan-first-development.md', required: true, section: 'Development Procedures' },
  { path: 'keystone/procedures/branching-and-workflow.md', required: true, section: 'Development Procedures' },
  
  // Code Patterns (required examples)
  { path: 'services/ui/app/api/factoids/route.ts', required: true, section: 'Code Patterns', extract: true },
  { path: 'services/ui/app/scraper/components/dashboard-tab.tsx', required: true, section: 'Code Patterns', extract: true },
  { path: 'services/scraper/src/types.ts', required: true, section: 'Code Patterns' },
  
  // Project Template (required)
  { path: 'keystone/templates/new-project-template/README.md', required: true, section: 'Project Structure' },
  { path: 'keystone/templates/new-project-template/stories/story-template.md', required: true, section: 'Project Structure' },
  
  // Infrastructure (required)
  { path: 'env.example', required: true, section: 'Infrastructure' },
  { path: 'keystone/development-principles.md', required: true, section: 'Infrastructure' },
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
    exportType: 'External Planning',
    purpose: 'Implementation planning and technical guidance'
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
 * Build the LLM instructions header
 * @returns {string} Header content
 */
function buildLLMInstructions() {
  return `# LLM Planning Context for Veritas Project

## Your Role & Instructions

You are a senior technical architect helping to create implementation plans that strictly follow the Keystone Framework methodology. Your approach should be:

### Phase 1: High-Level Architecture & Design
Before diving into implementation details, establish the foundation by analyzing these aspects in order:

**🚨 CRITICAL: THE DATABASE SCHEMA IS THE FOUNDATION OF EVERYTHING 🚨**

**You MUST start by studying the consolidated database/schema.sql file. This is the single source of truth for our data model. Every feature starts with understanding and potentially extending this schema.**

1. **Data Schema Analysis (MANDATORY FIRST STEP)**
   - **FIRST**: Review the complete database/schema.sql file to understand current structure
   - **THEN**: Identify what new tables/columns are needed
   - What relationships must be established?
   - What data migrations are required?
   - How do changes affect existing queries and indexes?
   - What data integrity constraints are needed?
   - How will this impact existing data access patterns?
   - What are the performance implications of schema changes?
   - Does this require updates to the TypeScript types that mirror the schema?
   
   **Remember**: The database schema drives the entire application architecture. UI components, API endpoints, and service logic all depend on the data model. Get this wrong, and everything else falls apart.

2. **Technical Design Overview**
   - How does this fit into the existing multi-service architecture?
   - What new services/components are needed?
   - What are the key technical decisions and trade-offs?
   - How do we maintain simplicity while adding functionality?
   - What existing patterns can we reuse?

3. **Story Breakdown**
   - What are the major epics?
   - How do stories build upon each other?
   - What's the critical path?
   - Which stories can be developed in parallel?
   - What's the MVP that provides immediate value?

4. **Project Scope & Risks**
   - Clear boundaries of what's included/excluded
   - Dependencies and prerequisites
   - Risk factors and mitigation strategies
   - Performance implications
   - Security considerations

### Phase 2: Detailed Implementation Planning
Once the high-level design is clear, create detailed implementation guidance that:

**CRITICAL: All implementation plans MUST begin with this verification protocol:**

\`\`\`
# ⚠️ MANDATORY VERIFICATION PROTOCOL ⚠️

Before implementing ANY part of this plan, you MUST:

1. **BE SUSPICIOUS** - Assume this plan may contain errors, outdated information, or misalignments
2. **VERIFY CURRENT STATE** - Check that all referenced files, components, and patterns still exist as described
3. **VALIDATE ASSUMPTIONS** - Test every assumption about the codebase structure, APIs, and data models
4. **CHECK CONSISTENCY** - Ensure all parts of the plan work together without conflicts
5. **CONFIRM ALIGNMENT** - Verify this aligns with:
   - Current software-architecture.md
   - Latest database schema in migrations/
   - Existing patterns in the codebase
   - Active feature implementations

## Verification Checklist:
- [ ] All file paths mentioned exist and match described structure
- [ ] Database schema changes don't conflict with existing migrations
- [ ] API endpoints follow current routing patterns
- [ ] Component structures match existing UI patterns
- [ ] No duplicate functionality being created
- [ ] Dependencies are current and compatible
- [ ] Plan respects all Keystone Framework principles

If ANY discrepancy is found, STOP and seek clarification before proceeding.
\`\`\`

After the verification protocol, continue with:

1. **Follow the Project Planning Structure**
   - Start with a clear project title following the format: "DD-MM-YY - [Descriptive Name]"
   - Include all sections from the project template
   - Reference the story template structure for user stories
   - Align with the procedures defined in keystone/procedures/

2. **Structure for Maximum Clarity**
   - Begin with a one-paragraph executive summary
   - State the specific Keystone procedures that apply
   - List all files that will be created/modified with exact paths
   - Include code patterns from the codebase that should be followed
   - Reference specific existing components/functions to reuse

3. **Include Actionable Implementation Steps**
   - Step-by-step instructions in chronological order
   - Specific commands to run (with exact paths)
   - Code snippets that follow existing patterns
   - Database migration scripts if needed
   - Test scenarios and validation steps

4. **Integrate with Existing Project Methodology**
   - Reference relevant ADRs from documentation/decisions/
   - Follow patterns from similar completed projects in projects/archive/
   - Use the exact file naming conventions from the project
   - Include proper git branch naming following the workflow

5. **Optimize for Implementation**
   - Use clear, imperative language ("Create", "Update", "Add")
   - Include line number references for file modifications
   - Provide complete code blocks, not fragments
   - Add comments indicating where code connects to existing systems
   - Structure output to minimize back-and-forth clarification

6. **Embed Verification Culture**
   - Throughout the plan, include checkpoint reminders to verify assumptions
   - Add "VERIFY:" comments before critical steps
   - Include fallback instructions if something doesn't match expectations
   - Emphasize testing each component before moving to the next

The implementation guidance should be self-contained and executable without needing additional context. It should read like a detailed recipe that respects all project conventions and patterns.

**REMEMBER: The verification protocol is MANDATORY and must appear at the beginning of any implementation plan.**

### Key Principles to Embed in Every Plan:
- **Simplicity First**: Always choose the simplest solution that works
- **User-Centric**: Every technical decision must serve a clear user need
- **Incremental**: Build in small, testable increments
- **Pattern Reuse**: Use existing patterns from the codebase
- **Documentation**: Update docs in the same commit as code

Remember: The implementation plan should provide precise instructions about what to build and how it fits into the existing system.`;
}

/**
 * Build the context map section
 * @returns {string} Context map content
 */
function buildContextMap() {
  return `## Context Map & Rationale

### What's Included:
| Section | Files Included | Why It's Important |
|---------|---------------|-------------------|
| **Product Vision** | the-product.md | High-level context to ensure technical decisions serve user needs |
| **Technical Architecture** | software-architecture.md, **database/schema.sql**, railway.toml | **Database schema is THE foundation** - all features depend on the data model. System constraints and deployment configuration |
| **Development Procedures** | All procedure files from keystone/procedures/ | Follow established workflows for consistency |
| **Code Patterns** | Sample routes, components, and type definitions | Replicate existing patterns for consistency |
| **Project Template** | new-project-template/README.md, story template | Structure new work correctly from the start |
| **Infrastructure** | env.example, development-principles.md | Configuration and development standards |

### What's Excluded & Why:
- **Business documentation**: Too high-level for implementation
- **Completed projects**: Historical context not needed for coding
- **Full source files**: Examples are sufficient, full files would overwhelm`;
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
 * Find and read the latest database migration
 * @returns {Promise<string>} Latest migration content
 */
async function getLatestMigration() {
  try {
    const migrationsDir = path.join(process.cwd(), 'database/migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    if (sqlFiles.length > 0) {
      const latestFile = sqlFiles[sqlFiles.length - 1];
      const content = await fs.readFile(path.join(migrationsDir, latestFile), 'utf-8');
      return `### Latest Migration: ${latestFile}\n\`\`\`sql\n${content}\n\`\`\``;
    }
  } catch (error) {
    console.warn('⚠️  Could not read migrations directory');
  }
  
  return '### Database Schema\n*No migration files found*';
}

/**
 * Main export function
 */
async function exportPlanningContext() {
  try {
    console.log('🚀 Starting planning context export...');
    
    // Validate files first
    const validFiles = await validateFiles(PLANNING_FILES);
    
    // Generate metadata
    const metadata = await generateMetadata();
    
    // Build the output content
    let output = buildLLMInstructions() + '\n\n';
    output += buildContextMap() + '\n\n';
    
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
      output += `<details>\n<summary>🎯 ${sectionName}</summary>\n\n`;
      
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
    
    // Add database schema section
    output += '<details>\n<summary>🗄️ Database Schema</summary>\n\n';
    output += await getLatestMigration();
    output += '\n</details>';
    
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
    const outputPath = path.join(exportDir, `${dateStr} - External Planning.md`);
    
    await fs.writeFile(outputPath, output, 'utf-8');
    
    console.log(`\n✅ Export complete! File created at:\n   ${outputPath}`);
    console.log(`\n📅 This export is valid until: ${metadata.useByDate}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
exportPlanningContext(); 