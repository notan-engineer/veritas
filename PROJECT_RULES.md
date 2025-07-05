# Veritas Project Rules

## UI Framework Standards

This project uses **shadcn/ui** with **Next.js** as the primary UI framework. All components and styling should follow these established patterns.

### Core Technologies

- **Next.js 15** - React framework with App Router
- **shadcn/ui** - Component library built on Radix UI and Tailwind CSS
- **Tailwind CSS v4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Lucide React** - Icon library

### Component Architecture

#### 1. shadcn/ui Components

All UI components should use shadcn/ui components located in `src/components/ui/`. Available components:

- `Button` - All button interactions
- `Card` - Content containers and layouts
- `Badge` - Status indicators and tags
- `Avatar` - User profile images
- `Switch` - Toggle controls
- `Skeleton` - Loading states
- `ThemeToggle` - Dark/light mode switching

#### 2. Component Usage Patterns

```tsx
// ✅ Correct: Import from ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ❌ Incorrect: Don't create custom components for basic UI elements
// Don't create custom buttons, cards, etc. when shadcn/ui provides them
```

#### 3. Styling Guidelines

- Use Tailwind CSS classes for all styling
- Follow the established design system colors and spacing
- Use CSS variables for theme-aware styling
- Maintain RTL support for Hebrew content

```tsx
// ✅ Correct: Use Tailwind classes with theme variables
<Card className="bg-background border-border hover:shadow-lg transition-all">
  <CardContent className="p-6 space-y-4">
    <h2 className="text-foreground text-xl font-semibold">
      Content Title
    </h2>
  </CardContent>
</Card>
```

### Layout Patterns

#### 1. Page Structure

```tsx
// Standard page layout pattern
export default function PageName() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Page Title
        </h1>
        <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
          Page description
        </p>
      </div>

      {/* Content Section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Content items */}
      </div>
    </div>
  );
}
```

#### 2. Responsive Design

- Use mobile-first responsive design
- Standard breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Maintain consistent spacing and typography scales
- Test on multiple screen sizes

```tsx
// ✅ Responsive design pattern
<div className="px-4 sm:px-0"> {/* Container padding */}
  <div className="text-sm sm:text-base md:text-lg"> {/* Responsive text */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Responsive grid */}
    </div>
  </div>
</div>
```

### Data Integration

#### 1. Supabase Integration

- Use the data service functions from `src/lib/data-service.ts`
- Handle loading states with skeleton components
- Implement error boundaries for database failures
- Use async/await for data fetching

```tsx
// ✅ Data fetching pattern
const [articles, setArticles] = React.useState<Article[]>([]);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

#### 2. Loading States

```tsx
// ✅ Loading state pattern
{loading ? (
  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-64" />
    ))}
  </div>
) : (
  // Actual content
)}
```

### Accessibility Standards

#### 1. Semantic HTML

- Use proper heading hierarchy (h1, h2, h3, etc.)
- Include alt text for images
- Use ARIA labels where appropriate
- Ensure keyboard navigation works

#### 2. RTL Support

- Use RTL utility functions from `src/lib/rtl-utils.ts`
- Test Hebrew content layout
- Ensure proper text direction and alignment

```tsx
// ✅ RTL support pattern
import { getRTLClasses, getRTLContainerClasses } from "@/lib/rtl-utils";

<div className={`${getRTLContainerClasses(article.language)}`}>
  <h2 className={`${getRTLClasses(article.language)}`}>
    {article.title}
  </h2>
</div>
```

### Performance Guidelines

#### 1. Image Optimization

- Use Next.js Image component for optimized images
- Provide proper alt text and loading states
- Use appropriate image formats (WebP, AVIF)

#### 2. Code Splitting

- Use dynamic imports for heavy components
- Implement proper loading boundaries
- Optimize bundle size with tree shaking

### File Organization

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── data-service.ts    # Database operations
│   ├── supabase.ts        # Supabase client
│   ├── utils.ts           # Utility functions
│   └── rtl-utils.ts       # RTL support utilities
└── types/                 # TypeScript type definitions
```

### Development Workflow

#### 1. Adding New Components

1. Check if shadcn/ui provides the component
2. If not, create a custom component following shadcn/ui patterns
3. Use Radix UI primitives when possible
4. Document component usage and props

#### 2. Styling New Features

1. Use existing Tailwind classes and design tokens
2. Follow the established spacing and color scales
3. Ensure responsive design
4. Test with both light and dark themes

#### 3. Database Integration

1. Add new functions to `data-service.ts`
2. Use proper TypeScript types
3. Implement error handling
4. Add loading states

### Quality Assurance

#### 1. Code Review Checklist

- [ ] Uses shadcn/ui components appropriately
- [ ] Follows responsive design patterns
- [ ] Implements proper loading states
- [ ] Includes error handling
- [ ] Supports RTL languages
- [ ] Uses TypeScript types correctly
- [ ] Follows accessibility guidelines

#### 2. Testing Requirements

- Test on multiple screen sizes
- Verify RTL layout for Hebrew content
- Check loading and error states
- Validate accessibility with screen readers
- Test dark/light theme switching

### Common Patterns

#### 1. Card Layout

```tsx
<Card className="h-fit hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
  <CardHeader className="pb-3">
    <CardTitle className="text-base sm:text-lg leading-tight">
      {title}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3 pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

#### 2. Button Groups

```tsx
<div className="flex gap-2 overflow-x-auto whitespace-nowrap sm:overflow-visible sm:whitespace-normal sm:flex-wrap sm:justify-center">
  {items.map((item) => (
    <Button
      key={item.id}
      variant={selected === item.id ? "default" : "outline"}
      size="sm"
      onClick={() => handleSelect(item.id)}
      className="transition-colors whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
    >
      {item.name}
    </Button>
  ))}
</div>
```

#### 3. Loading Skeletons

```tsx
function ContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted-foreground/20 rounded" />
        <div className="h-4 w-1/2 bg-muted-foreground/10 rounded" />
        <div className="h-3 w-full bg-muted-foreground/10 rounded" />
      </div>
    </div>
  );
}
```

This document should be updated as the project evolves and new patterns emerge. 