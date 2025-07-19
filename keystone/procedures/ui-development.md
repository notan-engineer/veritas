# UI Development Procedure

## Context Selection (2-4 files max)
```
Primary: @services/ui/components/ui/[component].tsx
Utilities: @services/ui/lib/utils.ts (if needed)
Styling: @services/ui/app/globals.css (if needed)
Integration: @services/ui/app/[page].tsx (where used)
```

## Quick Procedure
- [ ] Close all non-UI files
- [ ] Request specific component file
- [ ] Add dependencies only as needed
- [ ] Test: `cd services/ui && npm run build`
- [ ] Complete → Start new session

## Common Patterns

### Standard Component Structure
```typescript
// Use shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  return (
    <Card className="dark:border-gray-800">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

## UI Requirements Checklist
- [ ] Beautiful, clean, pixel-perfect design
- [ ] Dark mode support (use dark: variants)
- [ ] Uses shadcn/ui components
- [ ] No hardcoded values
- [ ] Responsive design
- [ ] RTL support where applicable

## Testing
1. Visual inspection in browser
2. Test dark/light mode toggle
3. Check responsive breakpoints
4. Verify no TypeScript errors: `npm run build`
5. Ensure proper data flow from props

## Common Issues
- **Dark mode not working**: Check className includes dark: variants
- **Build errors**: Verify all imports are correct
- **Component not rendering**: Check parent page imports
- **Style conflicts**: Use Tailwind classes, avoid custom CSS 