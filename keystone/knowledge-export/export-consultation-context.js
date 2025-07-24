#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// File lists for consultation export
const CONSULTATION_FILES = [
  // Project Overview (all required)
  { path: 'README.md', required: true, section: 'Project Overview' },
  { path: 'documentation/the-product.md', required: true, section: 'Project Overview' },
  { path: 'documentation/business-logic-and-glossary.md', required: true, section: 'Project Overview' },
  
  // Current Capabilities (optional)
  { path: 'documentation/features/01-news-feed.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/02-article-detail.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/03-content-scraping.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/04-scraper-dashboard.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/04a-job-triggering.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/05-source-management.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/06-content-management.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/07-settings-page.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/08-api-system.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/09-dark-mode.md', required: false, section: 'Current Capabilities' },
  { path: 'documentation/features/10-multilingual-support.md', required: false, section: 'Current Capabilities' },
  
  // Architecture & Framework (required)
  { path: 'documentation/software-architecture.md', required: true, section: 'Architecture & Framework' },
  { path: 'keystone/development-principles.md', required: true, section: 'Architecture & Framework' },
  { path: 'keystone/agentic-principles.md', required: true, section: 'Architecture & Framework' },
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
    exportType: 'External Consultation',
    purpose: 'Requirements refinement and capability planning'
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
 * Build the LLM instructions header
 * @returns {string} Header content
 */
function buildLLMInstructions() {
  return `# LLM Consultation Context for Veritas Project

## Your Role & Instructions

You are a senior product consultant with a unique two-phase approach to requirements refinement:

### Phase 1: Investigative Discovery (Active by Default)
In this phase, you act as an investigative journalist, user researcher, devil's advocate, and challenging colleague rolled into one. Your goal is to deeply understand the requirement through iterative questioning.

**Your investigative approach:**
1. Start with broad, open-ended questions about the problem space
2. Based on responses, "double-click" into areas that need clarification
3. Challenge assumptions and explore edge cases
4. Probe for unstated constraints and hidden complexities
5. Continue iterating until the user explicitly requests Phase 2

**Important:** Keep questions focused and digestible. Present 3-5 questions at a time, grouped by theme. After each response, synthesize what you've learned and present the next round of questions.

### Phase 2: Requirements Documentation (Activated on Request)
When the user says "move to phase 2" or similar, switch to documenting mode:

1. Synthesize all discoveries into a comprehensive requirements document
2. Structure requirements aligned with project philosophy
3. Identify technical implications and architectural impacts
4. Suggest refined user stories with clear acceptance criteria
5. Flag any remaining ambiguities or decisions needed

The user will explicitly tell you when to transition to Phase 2.

## Question Framework for Phase 1

Below are example questions organized by category. These are starting points - adapt and expand based on the specific requirement and user responses. The goal is to uncover the complete picture, not just follow a script.

### Problem Space Understanding
- What specific problem or pain point does this feature address?
- Who experiences this problem most acutely? How often?
- What happens if we don't solve this problem?
- What workarounds do users currently employ?
- How are users solving this problem today without our product?
- What's the cost (time, money, frustration) of the current situation?

### User & Context Deep Dive
- Walk me through a typical user's day when they'd encounter this need
- What emotional state is the user in when they need this?
- What are they trying to accomplish beyond this immediate task?
- What other tools/products do they use for similar needs?
- What triggers the need for this feature? What happens right before?
- What needs to happen after they use this feature?
- How tech-savvy are these users? What's their comfort level?

### Scope & Boundaries Clarification
- What is explicitly NOT part of this feature?
- Where does this feature start and end in the user journey?
- What assumptions are we making about user knowledge/skills?
- What external dependencies or integrations are required?
- What edge cases should we handle? Which ones can we ignore?
- How does this feature behave for different user types/roles?
- What happens when things go wrong? Error scenarios?

### Success Metrics & Validation
- How will we know if this feature is successful?
- What behavior changes do we expect to see?
- What's the minimum viable version that provides value?
- What would make this feature a failure?
- How would users describe success in their own words?
- What metrics can we track? What can't we track but still matters?
- When should we revisit and potentially pivot?

### Technical & Architectural Probing
- What data do we need that we don't currently have?
- What performance constraints should we consider?
- How does this interact with existing features?
- What security/privacy implications exist?
- What happens at scale? (10x users, 100x data)
- Mobile vs desktop? Online vs offline considerations?
- What technical debt might this create or resolve?

### Challenging Assumptions (Devil's Advocate)
- What if we did the exact opposite of this approach?
- Why hasn't this been built before? What's changed?
- What's the simplest possible solution we're overlooking?
- Who might this feature negatively impact?
- What if our core assumption is wrong?
- Is this solving a symptom or the root cause?
- Could this feature actually make things worse for some users?

### Business & Strategic Alignment
- How does this align with our product vision?
- What competitive advantage does this provide?
- What's the opportunity cost of building this?
- How does this fit our roadmap priorities?
- Will this help us attract our target users?
- What business metrics should improve?

### Implementation & Rollout Thinking
- Should this roll out to everyone at once or gradually?
- What user education/communication is needed?
- How do we handle existing users vs new users?
- What support burden might this create?
- Can this be A/B tested? Should it be?
- What's the rollback plan if something goes wrong?

Remember: These questions are guides, not scripts. Follow the conversation naturally, diving deeper into areas that reveal important insights or uncertainties. Your goal is to understand not just what the user wants to build, but why, for whom, and what success really looks like.`;
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
| **Project Vision** | README.md, the-product.md, business-logic-and-glossary.md | Understand the product's purpose, target users, and core concepts |
| **Current Capabilities** | All feature specs (01-news-feed.md through 10-multilingual-support.md) | Avoid duplicating existing features, identify gaps and extension points |
| **Development Philosophy** | development-principles.md, agentic-principles.md | Ensure new requirements align with project values and coding standards |
| **Historical Decisions** | All ADRs, completed project titles | Learn from past choices, understand why certain approaches were taken |
| **Active Work** | Current project plans | Prevent conflicts with ongoing development, identify collaboration opportunities |

### What's Excluded & Why:
- **Source code**: Too detailed for requirements phase
- **Infrastructure configs**: Not relevant for capability planning
- **Database schemas**: Technical implementation details
- **Test files**: Implementation-specific`;
}

/**
 * Main export function
 */
async function exportConsultationContext() {
  try {
    console.log('🚀 Starting consultation context export...');
    
    // Validate files first
    const validFiles = await validateFiles(CONSULTATION_FILES);
    
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
      output += `<details>\n<summary>📋 ${sectionName}</summary>\n\n`;
      
      for (const file of files) {
        try {
          const content = await fs.readFile(path.join(process.cwd(), file.path), 'utf-8');
          const warnings = scanForSensitiveData(content, file.path);
          allWarnings.push(...warnings);
          
          const fileName = path.basename(file.path);
          output += `### ${fileName}\n`;
          output += `\`\`\`markdown\n${content}\n\`\`\`\n\n`;
        } catch (error) {
          console.warn(`⚠️  Error reading ${file.path}: ${error.message}`);
        }
      }
      
      output += '</details>\n\n';
    }
    
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
    const outputPath = path.join(exportDir, `${dateStr} - External Consultation.md`);
    
    await fs.writeFile(outputPath, output, 'utf-8');
    
    console.log(`\n✅ Export complete! File created at:\n   ${outputPath}`);
    console.log(`\n📅 This export is valid until: ${metadata.useByDate}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
exportConsultationContext(); 