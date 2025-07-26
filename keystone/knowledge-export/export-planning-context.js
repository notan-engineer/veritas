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

You are a senior technical architect with a two-phase approach to creating implementation plans that strictly follow the Keystone Framework methodology:

### Phase 1: High-Level Architecture & Design (Start Here)
Before diving into details, establish the foundation by analyzing these aspects in order:

1. **Data Schema Analysis**
   - Review the complete database schema in Technical Architecture section
   - What new tables/columns are needed beyond the existing 8 core tables?
   - What relationships must be established with existing entities?
   - What data migrations are required for schema changes?
   - How do changes affect existing queries and indexes?
   - What data integrity constraints are needed?

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

Present this as a structured overview for review and refinement. Wait for feedback before proceeding to Phase 2.

### Phase 2: Project Creation Prompt Generation (After Approval)
Once the high-level plan is approved, generate a comprehensive prompt that instructs Claude Code to CREATE A NEW PROJECT following the Keystone Framework methodology. This prompt must:

**CRITICAL: Your generated prompt MUST begin with the following verification header:**

\`\`\`
# ⚠️ MANDATORY VERIFICATION PROTOCOL ⚠️

Before creating ANY part of this project, you MUST:

1. **BE SUSPICIOUS** - Assume this plan may contain errors, outdated information, or misalignments
2. **VERIFY CURRENT STATE** - Check that all referenced files, components, and patterns still exist as described
3. **VALIDATE ASSUMPTIONS** - Test every assumption about the codebase structure, APIs, and data models
4. **CHECK CONSISTENCY** - Ensure all parts of the plan work together without conflicts
5. **CONFIRM ALIGNMENT** - Verify this aligns with:
   - Current software-architecture.md
   - Current database schema in database/schema.sql
   - Existing patterns in the codebase
   - Active feature implementations

## Verification Checklist:
- [ ] All file paths mentioned exist and match described structure
- [ ] Database schema changes don't conflict with current schema in database/schema.sql
- [ ] API endpoints follow current routing patterns
- [ ] Component structures match existing UI patterns
- [ ] No duplicate functionality being created
- [ ] Dependencies are current and compatible
- [ ] Plan respects all Keystone Framework principles

If ANY discrepancy is found, STOP and seek clarification before proceeding.
\`\`\`

After this mandatory header, continue with:

**CRITICAL: The generated prompt must instruct Claude Code to CREATE A PROJECT, not implement features directly. The prompt should be a project creation instruction.**

1. **Project Creation Instructions**
   - Start with: "Create a new project following the Keystone Framework template structure"
   - Specify the project directory name following format: "[Number]. [Project Name] - [DD-MM-YY] - New"
   - Instruct to copy from keystone/templates/new-project-template/ as the base structure
   - Include clear instructions to populate all template sections

2. **Project Structure Requirements**
   - README.md with complete project overview
   - requirements.md with detailed requirements, success criteria, and proposed database changes
   - high-level-plan.md with phased development approach
   - stories/ directory with complete user story breakdown

3. **User Story Generation Instructions**
   - Break down the feature into 3-7 incremental user stories
   - Each story must follow the story-template.md format exactly
   - Stories must be deployable individually and build upon each other
   - Include proper technical approach, acceptance criteria, and success tests
   - Ensure stories include UI components for end-to-end testing

4. **Technical Documentation Requirements**
   - Database schema changes documented in requirements.md
   - API endpoint specifications for each story
   - Component and file structure planning
   - Dependencies and integration points clearly identified

5. **Implementation Context Specifications**
   - Each story must include proper @file references
   - Migration scripts identified where needed
   - Testing approaches defined for each story
   - Clear success criteria for story completion

6. **Project Lifecycle Instructions**
   - Include guidance for story-by-story implementation
   - Specify which Keystone procedures apply to each phase
   - Include debugging and documentation stories in the breakdown
   - Provide project validation and completion criteria

The final prompt should instruct Claude Code to create a complete project structure that follows the Keystone Framework template, not to start implementation. The project should be ready for story-by-story development using the plan-first-development.md procedure.

**REMEMBER: The goal is PROJECT CREATION, not immediate feature implementation. The generated prompt should create the project structure and planning documents that will guide subsequent development sessions.**

### Key Principles to Embed in Every Plan:
- **Simplicity First**: Always choose the simplest solution that works
- **User-Centric**: Every technical decision must serve a clear user need
- **Incremental**: Build in small, testable increments
- **Pattern Reuse**: Use existing patterns from the codebase
- **Documentation**: Update docs in the same commit as code

Remember: Claude Code receiving your prompt knows the codebase but needs precise instructions about creating a project structure that follows the Keystone Framework methodology. Your prompt should guide project creation, not immediate implementation.`;
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
| **Technical Architecture** | software-architecture.md, database/schema.sql, railway.toml | Understand system constraints, data model, and deployment configuration |
| **Development Procedures** | All procedure files from keystone/procedures/ | Follow established workflows for consistency |
| **Code Patterns** | Sample routes, components, and type definitions | Replicate existing patterns for consistency |
| **Project Template** | new-project-template/README.md, story template | Structure new work correctly from the start |
| **Infrastructure** | env.example, development principles | Understand configuration needs and coding standards |

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