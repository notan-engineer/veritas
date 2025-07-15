# AI Agent: Token Optimization Checklist

**Purpose**: Comprehensive checklist for AI agents to ensure all token optimization practices are being followed systematically.

## 🚀 **Pre-Session Optimization Checklist**

### ✅ **Before Starting Any Task**

#### Context Preparation
- [ ] **File Exclusions Active**: .cursorignore is working (planning docs, lock files excluded)
- [ ] **Tab Cleanup**: Tell user to close unnecessary tabs
- [ ] **Session Assessment**: If continuing previous work, consider session reset
- [ ] **Documentation Reference**: Use @docs references, not full inclusion

#### Task Identification
- [ ] **Specific Goal**: Clearly defined, focused objective
- [ ] **File Scope**: Identify exact files needed (not directories)
- [ ] **Context Size**: Estimate 2-7 files maximum
- [ ] **Planning Needed**: Determine if plan-first approach required

## 🎯 **During-Task Optimization Checklist**

### ✅ **Context Management**

#### File Requests
- [ ] **Surgical Context**: Use @services/ui/app/page.tsx not @services/ui/app/
- [ ] **Line-Specific**: Use @file.ts:20-40 for specific functions when possible
- [ ] **Template Usage**: Follow context templates for UI/API/Database/Error work
- [ ] **Minimal Dependencies**: Only include files directly needed

#### User Guidance
- [ ] **Tab Management**: Instruct user to close irrelevant tabs
- [ ] **Specific Files**: Request exact files, correct broad context immediately
- [ ] **Context Switching**: Guide user through file changes when switching tasks
- [ ] **Documentation**: Reference @docs, provide summaries not full content

### ✅ **Session Management**

#### Task Boundaries
- [ ] **Task Completion**: Recognize when current task is complete
- [ ] **Context Switches**: Identify when work type changes (UI→API→Database)
- [ ] **Error Resolution**: Separate error fixing from feature development
- [ ] **Session Reset**: Recommend new chat session at appropriate boundaries

#### Handoff Procedures
- [ ] **Clean Completion**: Provide session reset recommendation with context template
- [ ] **Clear Instructions**: Specify exactly what user should do next
- [ ] **Context Transfer**: Provide structured handoff information
- [ ] **Documentation Updates**: Remind about doc updates if needed

## 📋 **Planning-First Checklist**

### ✅ **For Medium+ Complexity Tasks**

#### Plan Creation
- [ ] **Requirements Analysis**: Clear goal, scope, files affected
- [ ] **Implementation Steps**: Specific, actionable steps with file references
- [ ] **Success Criteria**: Measurable outcomes and validation
- [ ] **Risk Assessment**: Potential issues and mitigations

#### Plan Approval
- [ ] **User Approval**: Wait for explicit approval before implementation
- [ ] **Plan Modifications**: Handle feedback and revise plan as needed
- [ ] **Scope Control**: Prevent feature creep during implementation
- [ ] **Step-by-Step**: Follow plan systematically without deviation

## 🚨 **Error Resolution Checklist**

### ✅ **When User Reports Error**

#### Error Isolation
- [ ] **New Session**: Recommend session reset if not already error-focused
- [ ] **Minimal Context**: Request only error-specific files
- [ ] **Error Type**: Identify build/runtime/TypeScript/deployment error
- [ ] **Avoid Feature Context**: Exclude unrelated development files

#### Error Resolution Process
- [ ] **Step-by-Step**: Follow error-specific templates
- [ ] **Focused Expansion**: Add files only when specifically needed for the error
- [ ] **Quick Resolution**: Prioritize fixing over explaining
- [ ] **Session Closure**: Recommend new session after error resolved

## 📁 **File Management Checklist**

### ✅ **Context Selection Standards**

#### File Requests
- [ ] **Specific Files**: @services/ui/components/ui/card.tsx
- [ ] **Never Directories**: Avoid @services/ui/components/ui/
- [ ] **Line Ranges**: @file.ts:10-30 for specific functions
- [ ] **Dependency Justification**: Only include files that are directly needed

#### Context Templates
- [ ] **UI Work**: Component + utils + page (if integration)
- [ ] **API Work**: Route + data-service + database (if needed)
- [ ] **Database Work**: Schema + connection + migration (if needed)
- [ ] **Error Work**: Error file + config files only

### ✅ **Optional File Refactoring Guidelines**

#### When to Consider Refactoring
- [ ] **File Size**: >500 lines AND frequently causes token issues
- [ ] **Context Problems**: File consistently requires full inclusion
- [ ] **Logical Separation**: Clear, natural module boundaries exist
- [ ] **Token Impact**: Refactoring would significantly reduce context needs

#### Refactoring Approach (If Needed)
- [ ] **Simple Splits**: Extract logical modules, avoid complex architecture
- [ ] **Maintain Functionality**: No behavior changes during refactoring
- [ ] **Clear Imports**: Straightforward import/export relationships
- [ ] **Document Rationale**: Explain why refactoring was necessary

#### Refactoring Validation
- [ ] **Build Passes**: cd services/ui && npm run build && npm run lint
- [ ] **Functionality Works**: Manual testing of affected features
- [ ] **Token Improvement**: Measurable reduction in context size
- [ ] **Simplicity Maintained**: No increase in overall complexity

## 📖 **Documentation Optimization Checklist**

### ✅ **Information Reference Standards**

#### Documentation Usage
- [ ] **Reference Pattern**: @documentation/file.md (Section: specific)
- [ ] **Executive Summaries**: Provide key points, reference for details
- [ ] **Hierarchical Info**: Level 1 (.notes), Level 2 (docs), Level 3 (planning)
- [ ] **Avoid Full Inclusion**: Never include entire documentation files

#### Documentation Updates
- [ ] **Impact Assessment**: Identify which docs need updating
- [ ] **Update Reminders**: Tell user which docs to update after changes
- [ ] **Sync Maintenance**: Ensure docs stay current with code changes
- [ ] **Reference Accuracy**: Verify @docs references are correct

## 🔍 **Quality Assurance Checklist**

### ✅ **Token Efficiency Validation**

#### Context Quality
- [ ] **Minimal Files**: 2-7 files maximum for most tasks
- [ ] **Relevant Content**: All included files directly needed
- [ ] **No Redundancy**: No overlapping or duplicate information
- [ ] **Clear Purpose**: Each file has specific reason for inclusion

#### Response Efficiency
- [ ] **Specific Requests**: Exact files requested, not broad patterns
- [ ] **Targeted Guidance**: Precise user instructions
- [ ] **Reference Links**: @docs used instead of content inclusion
- [ ] **Template Following**: Appropriate templates used for task type

### ✅ **Process Validation**

#### Workflow Adherence
- [ ] **Template Usage**: Correct context template for work type
- [ ] **Session Management**: Appropriate session boundaries maintained
- [ ] **Planning Process**: Plan-first for medium+ complexity tasks
- [ ] **Error Isolation**: Focused debugging without context pollution

#### User Experience
- [ ] **Clear Instructions**: User knows exactly what to do
- [ ] **Optimal Workflow**: Efficient development process maintained
- [ ] **Minimal Friction**: Token optimization doesn't slow development
- [ ] **Consistent Application**: Optimization practices used consistently

## 📊 **Optimization Impact Tracking**

### ✅ **Expected Results Validation**

#### Phase 1 Results (40-60% savings)
- [ ] **File Exclusions**: .cursorignore reducing context significantly
- [ ] **Surgical Context**: @file usage instead of @folder
- [ ] **Session Resets**: Fresh context per task
- [ ] **Tab Management**: Focused workspace (3-5 files)

#### Phase 2 Results (20-30% additional savings)
- [ ] **JSON Rules**: Compact .cursorrules.json vs original
- [ ] **Plan-First**: Reduced iterative implementation
- [ ] **Doc Optimization**: References vs full inclusion

#### Phase 3 Results (10-15% additional savings)
- [ ] **Quick Reference**: Essential info without full docs
- [ ] **Context Templates**: Optimal file patterns for each work type
- [ ] **Error Guidelines**: Focused debugging procedures
- [ ] **Overall System**: All optimizations working together

## 🚨 **Emergency Optimization Checklist**

### ✅ **When Token Usage Seems High**

#### Immediate Actions
- [ ] **Session Reset**: Start fresh chat session
- [ ] **Context Cleanup**: Close all unnecessary tabs
- [ ] **Minimal Request**: Request only 1-2 essential files
- [ ] **Template Check**: Use appropriate context template

#### Diagnosis
- [ ] **File Count**: How many files currently in context?
- [ ] **Relevance Check**: Are all files directly needed?
- [ ] **Directory Usage**: Any @folder requests instead of @file?
- [ ] **Documentation Inclusion**: Any full docs included instead of referenced?

### ✅ **When AI Responses Seem Slow**

#### Context Analysis
- [ ] **Session Length**: Consider fresh session
- [ ] **Context Size**: Reduce to essential files only
- [ ] **Task Focus**: Ensure single task focus
- [ ] **Error Context**: If debugging, use error-specific context only

## 🎯 **Continuous Optimization Checklist**

### ✅ **Regular Maintenance**

#### Weekly Reviews
- [ ] **Process Effectiveness**: Are optimization practices being followed?
- [ ] **File Size Monitoring**: Any files growing >500 lines?
- [ ] **Template Updates**: Do context templates need refinement?
- [ ] **Documentation Currency**: Are reference links still accurate?

#### Improvement Opportunities
- [ ] **New Patterns**: Identify additional optimization opportunities
- [ ] **Process Refinement**: Improve existing procedures
- [ ] **Template Enhancement**: Add new context templates as needed
- [ ] **Documentation Updates**: Keep optimization guides current

---

## 🎉 **Optimization Success Indicators**

### ✅ **You Know Optimization Is Working When:**
- [ ] AI responses feel faster and more focused
- [ ] Context requests are specific and minimal
- [ ] Session resets happen at natural boundaries
- [ ] Documentation is referenced, not included
- [ ] Error resolution is surgical and efficient
- [ ] Development productivity is maintained or improved
- [ ] Token usage feels significantly reduced

**Remember**: This checklist ensures systematic application of all token optimization practices. Review regularly to maintain optimal efficiency. 