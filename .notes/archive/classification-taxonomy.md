# Classification Taxonomy for Cursor Framework Procedures

## [BASIC] Classification Criteria
A procedure is classified as [BASIC] if it meets ANY of these criteria:
1. **Used Daily**: Required for routine development tasks
2. **Error Prevention**: Prevents common mistakes that waste tokens
3. **Quick Reference**: Information needed within 30 seconds
4. **Universal Application**: Applies to all development scenarios
5. **Foundation Knowledge**: Required before doing any [ADVANCED] work

## [ADVANCED] Classification Criteria
A procedure is classified as [ADVANCED] if it meets ANY of these criteria:
1. **Used Weekly or Less**: Complex scenarios, not daily work
2. **Planning Required**: Needs upfront design or architecture
3. **Multi-Step Process**: Requires 4+ steps or 30+ minutes
4. **Edge Cases**: Handles unusual or error recovery scenarios
5. **Optimization Analysis**: Metrics, measurements, or deep analysis

## Classification Matrix

| Procedure Type | Classification | Reasoning |
|---|---|---|
| @file vs @folder | [BASIC] | Daily use, error prevention |
| Session reset triggers | [BASIC] | Daily use, token savings |
| Tab management (3-5 files) | [BASIC] | Daily use, universal |
| Build commands | [BASIC] | Daily use, error prevention |
| Error context templates | [BASIC] | Common scenarios |
| API/UI/DB file templates | [BASIC] | Daily development |
| Plan-first procedures | [ADVANCED] | Used for complex features |
| Documentation hierarchy | [ADVANCED] | Reference strategy |
| Token impact calculations | [ADVANCED] | Analysis/metrics |
| Emergency procedures | [ADVANCED] | Edge cases |
| Refactoring templates | [ADVANCED] | Multi-step process |
| Framework maintenance | [ADVANCED] | Weekly/monthly tasks |

## Escalation Rules
- Start with [BASIC] procedures
- Escalate to [ADVANCED] only when [BASIC] insufficient
- [ADVANCED] sections should reference [BASIC] foundations
- No circular dependencies between sections 