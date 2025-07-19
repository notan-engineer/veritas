# Feature: Multilingual Support

## Overview
Comprehensive multilingual content support with RTL (Right-to-Left) language handling for Hebrew and Arabic, ensuring proper text direction and UI layout.

## User Story
As a multilingual user, I want to read news in my preferred language with proper text direction so that content is displayed naturally and readably.

## Technical Implementation

### Language Detection
- **Location**: `services/scraper/src/utils.ts`
- **Method**: `detectLanguage()`
- **Supported**: English, Hebrew, Arabic, Others

### RTL Support Utilities
- **Location**: `services/ui/lib/rtl-utils.ts`
- **Functions**:
  - `getRTLClasses()` - Text direction classes
  - `getRTLFlexDirection()` - Flex layout direction
  - `getRTLContainerClasses()` - Container styling
  - `getRTLGridClasses()` - Grid layouts

### Implementation Patterns

1. **Text Direction**
   ```typescript
   // Automatic RTL for Hebrew/Arabic
   className={getRTLClasses(language)}
   // Returns: "text-right rtl:text-right" or "text-left"
   ```

2. **Layout Direction**
   ```typescript
   // Flex containers
   className={getRTLFlexDirection(language)}
   // Returns: "flex-row-reverse" or "flex-row"
   ```

3. **Container Alignment**
   ```typescript
   // Full container styling
   className={getRTLContainerClasses(language)}
   // Includes direction, alignment, spacing
   ```

### Language-Specific Features

1. **Hebrew (he)**
   - Full RTL layout
   - Right-aligned text
   - Mirrored UI components
   - Hebrew date formatting

2. **Arabic (ar)**
   - Full RTL layout
   - Right-aligned text
   - Arabic numerals option
   - Cultural date formats

3. **English (en)**
   - Standard LTR layout
   - Left-aligned text
   - Western date formats

### Content Processing
1. **Scraping Phase**
   - Language detection during scraping
   - Storage with language tag
   - Proper encoding handling

2. **Display Phase**
   - Dynamic class application
   - Locale-specific formatting
   - Font selection

### Date Formatting
```typescript
const formatDate = (date, language) => {
  const locale = language === 'he' ? 'he-IL' : 
                language === 'ar' ? 'ar-SA' : 
                'en-US';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

### UI Components Affected

1. **News Feed Cards**
   - Title alignment
   - Description direction
   - Date positioning
   - Tag layout

2. **Article Detail Page**
   - Full content RTL
   - Bullet point alignment
   - Source attribution
   - Navigation buttons

3. **Navigation**
   - Menu direction
   - Icon positioning
   - Button alignment

### CSS Considerations
```css
/* RTL-specific styles */
[dir="rtl"] .component {
  /* Mirrored margins/padding */
  margin-right: 1rem;
  margin-left: 0;
}

/* Bidirectional icons */
.icon-chevron {
  transform: scaleX(-1);
}
```

## Best Practices
1. **Always use utility functions**
2. **Test with real RTL content**
3. **Consider cultural differences**
4. **Maintain consistent spacing**
5. **Use logical properties when possible**

## Testing Requirements
- Hebrew content display
- Arabic content display
- Mixed language feeds
- UI mirroring verification
- Date format checking

## Future Enhancements
- More language support
- User language preferences
- Translation integration
- Locale-specific features

## Related Features
- [News Feed](./01-news-feed.md)
- [Article Detail View](./02-article-detail.md)
- [Settings Page](./07-settings-page.md) 