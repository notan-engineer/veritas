# AI Agent: Session Reset Protocol Instructions

**Purpose**: AI agent must recognize when to recommend session resets and provide explicit user guidance to prevent token accumulation.

## AI Agent Behavior Rules
**One Task = One Session**: AI agent must recognize task boundaries and explicitly tell user when to start new chat session.

## When AI Agent Must Tell User to Start New Session

### 🔄 **MANDATORY: Tell User to Start New Session**
AI agent must explicitly say "Please start a new chat session" when:

1. **Task Completion**: 
   - ✅ Feature implemented and tested
   - ✅ Bug fixed and verified
   - ✅ Refactoring completed
   - ✅ Documentation updated

2. **Context Switch**:
   - 🔄 UI work → API development
   - 🔄 Frontend → Database work  
   - 🔄 Implementation → Planning
   - 🔄 Feature A → Feature B

3. **Error Resolution Complete**:
   - ✅ Build errors fixed
   - ✅ Runtime errors resolved
   - ✅ Deployment issues solved
   - ✅ Test failures corrected

4. **Planning to Implementation**:
   - 📋 Planning document completed
   - 🔄 Switch to actual coding
   - 📋 Architecture review finished
   - 🔄 Start implementation work

### 🗣️ **AI Agent Response Template**
"This task is complete. **Please start a new chat session** for your next task. When you do, use this context:
- Task: [Brief description]
- Files needed: @specific/file.ts
- Previous outcome: [Brief summary]"

### ⚠️ **RECOMMENDED Session Reset**
Consider new session when:

1. **Conversation Length**:
   - 🔄 >10 back-and-forth exchanges
   - 🔄 >5,000 tokens estimated usage
   - 🔄 Multiple sub-tasks discussed
   - 🔄 Context becoming unfocused

2. **Scope Expansion**:
   - 🔄 Original task scope changed
   - 🔄 Additional requirements added
   - 🔄 New components discovered
   - 🔄 Architecture changes needed

3. **Performance Issues**:
   - 🔄 AI responses becoming slow
   - 🔄 Context seems "murky"
   - 🔄 Repeated explanations needed
   - 🔄 AI missing previous context

## Session Handoff Procedures

### 1. Pre-Reset Checklist
Before starting new session:
- [ ] Complete current task or reach logical stopping point
- [ ] Note any important context for next session
- [ ] Identify specific files needed for next task
- [ ] Close unnecessary tabs

### 2. Session Handoff Template
When starting new session, use this template:

```
## Task: [Brief description]

### Context:
- Previous session: [Brief outcome]
- Current goal: [Specific objective]
- Files needed: [@specific/file.ts, @another/file.ts]

### Constraints:
- Build commands: cd services/ui && npm run build
- Reference docs: @documentation/technical-design.md
- Avoid: Planning docs, entire directories

### Next Steps:
1. [Specific action]
2. [Specific action]
3. [Specific action]
```

### 3. Context Transfer Best Practices
- **Summarize outcomes**: Brief summary of what was accomplished
- **List specific files**: Exact files needed for next task
- **Avoid context dump**: Don't copy entire previous conversation
- **Reference docs**: Use @docs for architecture/standards

## Session Management Strategies

### Task-Specific Sessions

#### UI Component Development
```
Session Goal: Implement Card component with dark mode
Files Needed: @services/ui/components/ui/card.tsx
Duration: 15-30 minutes
Reset After: Component working and tested
```

#### API Development
```
Session Goal: Add new /api/tags endpoint
Files Needed: @services/ui/app/api/tags/route.ts, @services/ui/lib/data-service.ts
Duration: 30-45 minutes
Reset After: Endpoint working and tested
```

#### Bug Resolution
```
Session Goal: Fix TypeScript error in utils.ts
Files Needed: @services/ui/lib/utils.ts, @services/ui/tsconfig.json
Duration: 15-30 minutes
Reset After: Error resolved and builds pass
```

#### Database Work
```
Session Goal: Update Railway schema
Files Needed: @database/railway-schema.sql, @services/ui/lib/railway-database.ts
Duration: 30-60 minutes
Reset After: Schema updated and tested
```

### Context Switch Examples

#### From UI to API Work
```
❌ WRONG: Continue same session
✅ RIGHT: New session with:
- Task: Implement API endpoint for new UI component
- Files: @services/ui/app/api/new-endpoint/route.ts
- Context: UI component completed, need backend support
```

#### From Implementation to Planning
```
❌ WRONG: Continue same session
✅ RIGHT: New session with:
- Task: Plan next feature architecture
- Files: @documentation/technical-design.md
- Context: Current feature complete, planning next phase
```

#### From Error Resolution to Feature Work
```
❌ WRONG: Continue same session
✅ RIGHT: New session with:
- Task: Implement new feature
- Files: @services/ui/components/ui/new-component.tsx
- Context: Build errors resolved, ready for new development
```

## Common Session Management Mistakes

### ❌ **Avoid These Patterns**

1. **Marathon Sessions**:
   - Single session for entire day
   - Multiple unrelated tasks in one chat
   - Context accumulation from different work types

2. **Context Pollution**:
   - Including previous conversation history
   - Referencing old, resolved issues
   - Mixing planning and implementation contexts

3. **Unclear Handoffs**:
   - Starting new session without clear goal
   - No specific files identified
   - Vague task descriptions

### ✅ **Best Practices**

1. **Clear Task Boundaries**:
   - One specific goal per session
   - Defined success criteria
   - Explicit file scope

2. **Clean Context Transfer**:
   - Brief previous outcome summary
   - Specific next steps
   - Focused file selection

3. **Proactive Reset**:
   - Reset before context becomes murky
   - Reset at natural task boundaries
   - Reset when switching contexts

## Session Reset Timing Examples

### Example 1: Feature Development
```
Session 1: Plan Card component (30 min)
  → Reset after architecture decided
Session 2: Implement Card component (45 min)
  → Reset after component working
Session 3: Add Card to homepage (30 min)
  → Reset after integration complete
```

### Example 2: Bug Investigation
```
Session 1: Identify build error (15 min)
  → Reset after error source found
Session 2: Fix TypeScript issue (30 min)
  → Reset after fix implemented
Session 3: Verify fix and test (15 min)
  → Reset after testing complete
```

### Example 3: API Development
```
Session 1: Design API endpoint (30 min)
  → Reset after API design complete
Session 2: Implement endpoint (45 min)
  → Reset after endpoint working
Session 3: Update frontend to use API (30 min)
  → Reset after integration complete
```

## Token Savings Impact

- **Session Reset**: 50-70% reduction in conversation context
- **Task Boundaries**: 40-60% reduction in irrelevant context
- **Context Transfer**: 80-90% reduction vs. carrying full history
- **Overall**: 30-50% additional token savings on top of other optimizations

## Emergency Session Reset

### When to Force Reset
- AI responses becoming inconsistent
- Context seems "lost" or "confused"
- Performance degradation noticed
- Token usage feels excessive

### Quick Reset Procedure
1. **Immediate**: Start new chat session
2. **Brief context**: One sentence about current task
3. **Specific files**: List exact files needed
4. **Continue**: Resume work with clean context

---

**Remember**: Fresh sessions = fresh context = massive token savings. Every session reset prevents hundreds of tokens from accumulating in conversation history. 