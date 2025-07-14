## Veritas Project: Maximizing Efficiency and Minimizing Token Usage in Cursor Max Mode

This analysis cross-references strategies from the "Cursor Max Mode Token Optimization" guide with the structure and contents of the Veritas repository (<https://github.com/notan-engineer/veritas>) to provide actionable insights for reducing token consumption in Cursor's Max Mode.

### 🔧 1. Concrete Steps to Decrease Token Usage in Cursor (Max Mode)

Cursor's Max Mode, while powerful for complex tasks by offering context windows up to 1 million tokens <sup>1</sup>, operates on a token-based pricing system (API cost + 20%)<sup>2</sup>. This makes token efficiency crucial, as unmanaged usage can rapidly consume quotas<sup>3</sup>.

#### High Token Usage Patterns in Veritas & General Practices

- **Large Documentation and Planning Files:** The Veritas repository contains extensive markdown files (e.g., planning/10-07-25 - Project Simplification - DONE.md, removed-code-and-features.md). While informative, including these entirely in context consumes significant tokens.
- **Verbose Comments and Boilerplate:** While the Veritas code is relatively clean, any excessive commenting or standard boilerplate in files (e.g., services/ui/lib/data-service.ts) adds to the token count when those files are indexed or attached.
- **Unfocused Context:** Automatically including large folders or entire codebases without filtering increases noise, which can dilute the AI's attention (the "murky middle" problem) and waste tokens<sup>4</sup>.  

- **Repetitive Instructions in Prompts:** Continuously instructing the AI on project standards or architecture in every chat session is inefficient<sup>5</sup>.  

#### Step-by-Step Changes for Lower Token Count

**A. Implement Surgical Context Management:**

1. **Default to Minimal Context:** Avoid attaching entire folders (@Folder). Instead, use precise  
    @file references (e.g., @services/ui/app/page.tsx) or specific line ranges (@services/ui/lib/utils.ts:10-25) to provide only the necessary code<sup>6</sup>.  

2. **Leverage @Docs for High-Level Context:** Instead of attaching large code sections for architectural overview, reference centralized documentation<sup>7</sup>.  
    - _Example:_ @documentation/technical-design.md instead of @services/ui/app/.
3. **Manage Open Tabs:** Close unnecessary files. Cursor may implicitly include open tabs as context; keeping only relevant files open helps focus the AI and reduces potential token leakage<sup>8</sup>.  

**B. Optimize Project Structure and Content:**

1. **Centralize Knowledge in .notes:** Create and utilize a .notes directory (or use the existing documentation/ folder in Veritas) for high-level overviews, task lists, and architectural summaries<sup>9</sup>.  

2. **Modularize Code:** Break down large files into smaller, single-responsibility units. This reduces the tokens required when referencing specific functionality<sup>10</sup>.  
    - _Veritas Example:_ If services/ui/lib/data-service.ts grows, split fetching logic from type definitions.
3. **Optimize Comments:** Remove redundant or verbose comments. Ensure comments add value without excessive length.

**C. Workflow Adjustments:**

1. **Plan Before Implementation:** Ask the LLM to generate a plan or outline _before_ writing code. This structured approach often leads to more concise and accurate generation, reducing iterative token use<sup>11</sup>.  

2. **Strategic Session Reset:** Start a new chat session for each distinct task. This clears the conversation history, preventing irrelevant context accumulation and unnecessary token charges on past interactions<sup>12</sup>.  

3. **Utilize Local Caching (External Tools):** For frequently accessed static information like API specifications, consider using external caching tools (like Apidog's MCP Server) to reference data locally rather than sending the full specs in every request<sup>13</sup>.  

### 📁 2. How to Edit Project-Specific Cursor Files for Optimization (Veritas Context)

By optimizing Cursor-specific configuration and documentation files within the Veritas project, token consumption can be significantly reduced.

#### .cursorrules

.cursorrules act as a persistent system prompt for the project, eliminating the need to repeat instructions in every chat session, thereby saving tokens<sup>14</sup>.

**Optimization Strategy for Veritas:**

- **Format:** Use JSON for .cursorrules as it is more token-efficient and easier for the AI to parse than plain text<sup>15</sup>.  

- **Consolidate Core Directives:** Ensure the AI always knows the project structure and core constraints.

**Proposed .cursorrules (JSON Format):**

JSON

{  
"rules": \[  
{  
"id": "build-directory",  
"description": "CRITICAL: All npm commands MUST be run from the 'services/ui' directory. Builds fail from the project root.",  
"severity": "critical"  
},  
{  
"id": "architecture",  
"description": "Project is a simplified Next.js application ('services/ui') using Railway PostgreSQL. Focus only on existing, minimal architecture."  
},  
{  
"id": "database-access",  
"description": "Use 'lib/railway-database.ts' for server-side DB access and 'lib/data-service.ts' for client-side API calls. Do not access the database directly in components."  
},  
{  
"id": "rtl-support",  
"description": "Always use 'lib/rtl-utils.ts' functions (getRTLClasses, getRTLContainerClasses) when handling multilingual content (Hebrew/Arabic)."  
},  
{  
"id": "documentation-reference",  
"description": "Always consult 'documentation/technical-design.md' for architecture and 'documentation/developer-guidelines.md' for coding standards before starting tasks."  
},  
{  
"id": "simplicity-principle",  
"description": "Adhere to 'Simplicity First'. Implement only necessary features and avoid over-engineering. Refer to 'documentation/removed-code-and-features.md' before adding complexity."  
}  
\]  
}  

#### .cursorignore

.cursorignore is fundamental for reducing noise and preventing irrelevant files from consuming tokens in the context window<sup>16</sup>.

**Specific Ignore Entries for Veritas:**

\# Build Artifacts & Dependencies (already in .gitignore, reinforce for Cursor)  
\*\*/node_modules  
.next/  
/out/  
/build  
\*\*/dist  
<br/>\# Environment and Secrets (Crucial for security and token reduction)  
.env\*.local  
<br/>\# Logs and Debugging  
npm-debug.log\*  
yarn-\*.log\*  
<br/>\# Large Configuration/Lock Files (Rarely needed for code context)  
services/ui/package-lock.json  
services/scraper/package-lock.json  
<br/>\# Extensive Planning & Historical Docs (Reference via @Docs instead)  
documentation/planning/\*.md  
documentation/removed-code-and-features.md  
<br/>\# Database Migration/Cleanup Scripts (Usually irrelevant for application logic)  
database/migrations/\*.sql  
database/cleanup-\*.sql  
database/cleanup-db.js  

#### developer-guidelines.md

Rewrite key sections of documentation/developer-guidelines.md to embed token-conscious practices.

**Original (Implicit):**

### 2\. Incremental Development

- Add features only when actually needed
- Start with minimal viable implementation

**Rewritten (Token-Conscious):**

### 2\. Incremental & Token-Efficient Development

- **Task Modularization:** Break large tasks into minimal, focused steps. Start a new Cursor chat session for each discrete task to keep context clean and minimize token usage<sup>17</sup>.  

- **Minimal Context:** Use @file and @code surgically. Do not attach entire folders unless absolutely necessary for broad architectural changes. Rely on  
    .cursorrules for general guidelines instead of repeating them in prompts<sup>18</sup>.  

- **Simplicity = Efficiency:** Implement only what is needed. Concise, modular code is easier for the AI to parse, reducing token consumption during analysis and generation<sup>19</sup>.  

#### Planning Framework

Large, monolithic planning documents consume substantial tokens if referenced entirely. Restructuring the planning format (documentation/planning/\*.md) can improve LLM context efficiency.

**Token-Efficient Planning Format Proposal:**

Use a structured, sectioned approach that allows the AI to quickly locate the status and specific tasks without processing historical summaries.

**Veritas Planning Document Optimization (Before/After Example):**

- **Before (Verbose Summary in 11-07-25 - Systematic Merge Resolution and Final Cleanup.md):**Executive Summary  
    Objective: Resolve merge conflicts systematically and apply additional simplification improvements including file removal, deployment optimization, date handling fixes, and documentation enhancement.  
    \[...Rationale, Outcome, and multiple paragraphs...\]
- **After (Token-Efficient Structure):**

# Plan: Systematic Merge Resolution and Final Cleanup

**Date**: 11-07-25 | **Status**: ✅ IMPLEMENTED

### 🎯 Core Objectives

- Resolve merge conflicts.
- Simplify: Remove files, optimize deployment, fix date handling, enhance docs.

### 📊 Outcome Summary

- Conflicts resolved.
- 3 service directories removed.
- Dynamic date handling implemented.
- Documentation enhanced; build warnings added.
- Consolidated into single commit.

## Implementation Phases

### Phase 1: Merge Resolution ✅

- **Strategy**: Clean slate reset and reapplication.
- **Files Restored**: .cursorrules, database/railway-schema.sql, documentation/\*.md, services/ui/lib/mock-data.ts.
- **Files Removed**: package.json (root).

\[...Continue with concise, bulleted phases...\]

### 💡 3. Summarize Key Insights into a Step-by-Step Optimization Plan

A prioritized checklist for reducing token usage in the Veritas project using Cursor Max Mode.

**High Impact / Low Effort:**

- \[ \] **Configure .cursorignore Immediately:** Add the recommended entries (build artifacts, lock files, planning docs) to prevent indexing and accidental inclusion of high-token, low-value files.
- \[ \] **Adopt Surgical Context:** Strictly use @file or @code snippets. Stop using  
    @Folder or @Codebase unless reviewing architecture<sup>20</sup>.  

- \[ \]  
    **Implement Session Resetting:** Start a new chat for every new feature or bug fix to clear conversational history tokens<sup>21</sup>.  

- \[ \]  
    **Close Unnecessary Tabs:** Keep only the files relevant to the immediate task open<sup>22</sup>.  

**Medium Impact / Medium Effort:**

- \[ \] **Implement .cursorrules (JSON):** Create the proposed JSON .cursorrules file. This shifts repeated instructions out of prompts and into persistent context<sup>23</sup>.  

- \[ \] **Refine Documentation Structure:** Centralize key architecture and guidelines in documentation/ (acting as .notes). Restructure planning documents (documentation/planning/) to the token-efficient format.
- \[ \] **Adopt "Plan First" Prompting:** Before requesting code, ask the AI to outline the steps. This structures the AI's approach and often results in cleaner implementation<sup>24</sup>.  

**Lower Impact / Higher Effort:**

- \[ \]  
    **Refactor Large Files:** Analyze files like services/ui/lib/data-service.ts or services/ui/app/page.tsx for opportunities to split into smaller modules, reducing tokens per included file<sup>25</sup>.  

- \[ \]  
    **Explore Local LLM Pre-filtering (Advanced):** Investigate using a local LLM to pre-filter context before sending optimized prompts to Max Mode<sup>26</sup>.  

**Tradeoffs and Risks:**

- **Overly Aggressive Ignoring:** Ignoring too many files via .cursorignore might cause the AI to miss necessary context, requiring manual intervention.
- **Manual Overhead:** Surgical context management requires more developer effort than relying on automatic indexing<sup>27</sup>.  

- **Cost vs. Accuracy:** Extreme token reduction might slightly decrease accuracy on complex tasks that require broad context<sup>28</sup>.  

### 📚 4. External Resources Section

The following external resources were referenced in the "Cursor Max Mode Token Optimization" document and are relevant to this analysis:

**Cursor Documentation and Guides:**

- [Cursor Models & Pricing](https://docs.cursor.com/models) <sup>29</sup>  

- [Working with Context in Cursor](https://docs.cursor.com/guides/working-with-context) <sup>30</sup>  

- [@Files & Folders](https://docs.cursor.com/context/@-symbols/@-files-and-folders) <sup>31</sup>  

- [Security and Codebase Indexing](https://cursor.com/security) <sup>32</sup>  

**GitHub Discussions/Issues:**

- [GitHub Community: Visible token/context usage indicator](https://github.com/orgs/community/discussions/162496) <sup>33</sup>  

**Community Insights (Reddit & Forums):**

- [Cursor Forum: My Detailed Guide On How to work with long codebases](https://forum.cursor.com/t/my-detailed-guide-on-how-to-work-with-long-codebases/52404) <sup>34</sup>  

- [Reddit: Maximizing Cursor AI – What's Your Best Workflow Hack?](https://www.reddit.com/r/cursor/comments/1ipqiyg/maximizing_cursor_ai_whats_your_best_workflow_hack/) <sup>35</sup>  

- [Reddit: How to make Cursor 10x more useful](https://www.reddit.com/r/cursor/comments/1kmormv/how_to_make_cursor_10x_more_useful/) <sup>36</sup>  

- [Reddit: PSA for anyone using Cursor (or similar tools): you're probably wasting most of your AI requests](https://www.reddit.com/r/ChatGPTCoding/comments/1l8m8e9/psa_for_anyone_using_cursor_or_similar_tools/) <sup>37</sup>  

- [Reddit: Cursor Sonnet 4 Max Mode - is BEAST!](https://www.reddit.com/r/cursor/comments/1lgwcza/cursor_sonnet_4_max_mode_is_beast/) <sup>38</sup>  

**Articles and Blog Posts:**

- [Maximizing Your Cursor Use: Advanced Prompting, Cursor Rules, and Tooling Integration](https://extremelysunnyyk.medium.com/maximizing-your-cursor-use-advanced-prompting-cursor-rules-and-tooling-integration-496181fa919c) <sup>39</sup>  

- [How Top 1% Developers Use Cursor AI](https://medium.com/@weber-stephen/how-top-1-developers-use-cursor-ai-a-complete-guide-to-10x-your-coding-productivity-a0316bdb108a) <sup>40</sup>  

- [Apidog: Save 20% on Cursor AI Costs](https://apidog.com/blog/save-cursor-costs/) <sup>41</sup>  

- [The perverse incentives of Vibe Coding](https://uxdesign.cc/the-perverse-incentives-of-vibe-coding-23efbaf75aee) <sup>42</sup>