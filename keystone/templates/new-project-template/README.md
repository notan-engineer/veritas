# New Project Template

This template provides the structure for new development projects following the Keystone framework.

## Project Structure

```
[Project Number]. [Project Name] - [DD/MM/YY] - [Status]
├── README.md                 # This file - project overview
├── requirements.md           # High-level requirements
├── high-level-plan.md       # Overall project plan
└── stories/                 # Individual user stories
    ├── 1. [Story Name] - [Status].md
    ├── 2. [Story Name] - [Status].md
    └── ...
```

## Status Values
- `New`: Not yet started
- `In-Progress`: Currently being worked on
- `Done`: Completed and deployed

## Creating a New Project

1. Copy this template directory
2. Rename following convention: `1. First Project - 19/07/25 - New`
3. Update README.md with project details
4. Create requirements.md with:
   - Project overview
   - Success criteria
   - Proposed database changes
   - Test scenarios
5. Create high-level-plan.md with phased approach
6. Break down into user stories in stories/ directory

## User Story Guidelines

Each story should be:
- Self-contained and deployable
- Written from user perspective
- Testable end-to-end
- Incremental (builds on previous stories)

## Story Template

See `stories/story-template.md` for the standard format.

## Important Notes

- Stories should be very incremental
- Each story must include UI aspects for testing
- Infrastructure work should be minimal
- Always include debugging and documentation stories
- During debugging, never change DB schema unless in a story 