# Knowledge Export Scripts

## Purpose
These scripts aggregate project context for external LLM consultation, enabling:
1. Requirements refinement with comprehensive project context
2. Detailed implementation planning with technical specifications

## Features
- **Automatic file validation**: Ensures all referenced files exist
- **Context mapping**: Clear explanation of what's included and why
- **Metadata tracking**: Timestamps, git commit hash, and expiry dates
- **Structured output**: Collapsible markdown sections for easy navigation
- **Security checks**: Warns about potential sensitive data

## Pre-requisites
- Node.js installed
- Git repository (for commit hash)
- Run from project root directory

## Usage

### Consultation Context (Requirements Refinement)
```bash
cd /path/to/veritas
node keystone/knowledge-export/export-consultation-context.js
```
Creates: `documentation/exported-knowledge/DD-MM-YY - External Consultation.md`

### Planning Context (Implementation Guidance)
```bash
cd /path/to/veritas
node keystone/knowledge-export/export-planning-context.js
```
Creates: `documentation/exported-knowledge/DD-MM-YY - External Planning.md`

## Best Practices
1. Run from project root directory only
2. Ensure git is up to date before export
3. Review export for sensitive data before sharing
4. Use exports within 7 days for accuracy
5. Include export file when requesting help from external LLMs

## Workflow Example
1. Export consultation context
2. Share with external LLM along with your capability ideas
3. Receive refined requirements
4. Export planning context
5. Share with external LLM to generate implementation plan
6. Paste generated plan to project AI agent

## Validation
Both scripts perform pre-export validation:
- ✅ Verifies all required files exist
- ⚠️  Warns about missing optional files  
- ❌ Exits with error if critical files are missing
- 🔍 Scans for potential sensitive data patterns

## Troubleshooting
- **"Required files missing"**: Ensure you're running from project root
- **"Git not found"**: Scripts require git for commit hash
- **Large export warning**: Consider if all sections are needed

## Export Types

### External Consultation
**Purpose**: Help external LLMs understand your project to refine new capability ideas

**Includes**:
- Project overview and vision
- Current features and capabilities
- Development philosophy and principles
- Historical decisions and completed work
- Active development projects

**Use when**: You have rough ideas for new features and want help refining them

### External Planning
**Purpose**: Help external LLMs generate detailed implementation plans

**Includes**:
- Product vision (high-level context)
- Technical architecture and deployment
- All development procedures
- Code patterns and examples
- Project structure templates
- Infrastructure and dependencies

**Use when**: You have refined requirements and need a detailed implementation plan 