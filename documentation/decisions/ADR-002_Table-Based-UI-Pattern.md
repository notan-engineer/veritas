# ADR-002: Adopt Table-Based UI Pattern for Data Lists

## Status
Accepted (2025-07-26)

## Context
The original implementation used card-based list interfaces for displaying jobs and sources in the scraper dashboard. These lists were:
- Difficult to scan quickly when containing many items
- Lacking sorting capabilities
- Space-inefficient for displaying tabular data
- Inconsistent with modern data management UIs

Users needed to scroll through unsorted lists to find specific items, making it challenging to identify patterns or locate particular entries efficiently.

## Decision
Replace all data list interfaces with sortable tables using the shadcn/ui Table component.

### Specific Changes:
1. **Jobs List** → Jobs Table with sortable columns
2. **Sources List** → Sources Table with inline actions
3. Implement client-side sorting for all columns
4. Add visual indicators for sort direction
5. Maintain responsive design with horizontal scroll

## Consequences

### Positive
- **Improved Data Scannability**: Users can quickly scan rows of aligned data
- **Client-Side Sorting**: Instant sorting without server calls improves performance
- **Consistent UI Patterns**: Tables provide familiar interaction patterns
- **Better Information Density**: More data visible without scrolling
- **Enhanced Functionality**: Sort by any column to find patterns
- **Professional Appearance**: Aligns with enterprise data management tools

### Negative
- **Mobile Experience**: Tables require horizontal scrolling on small screens
- **Component Complexity**: Table components have more complexity than simple lists
- **Migration Effort**: Existing card-based UIs need complete restructuring

### Neutral
- **Design System Alignment**: Uses existing shadcn/ui components
- **Learning Curve**: Developers need to understand table component patterns
- **Accessibility**: Tables require proper ARIA attributes and keyboard navigation

## Implementation Details

### Technology Choices
- **Component Library**: shadcn/ui Table component
- **Sorting**: Client-side using React state
- **Styling**: Tailwind CSS with responsive utilities
- **Icons**: Lucide React for sort indicators

### Code Example
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead onClick={() => handleSort('timestamp')}>
        Timestamp {getSortIcon('timestamp')}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sortedData.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.timestamp}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Alternatives Considered

1. **Enhanced Card Lists**: Add sorting to existing card layout
   - Rejected: Cards still inefficient for tabular data

2. **Data Grid Library**: Use AG-Grid or similar
   - Rejected: Overkill for current needs, adds dependency

3. **Custom Table Component**: Build from scratch
   - Rejected: shadcn/ui provides sufficient functionality

## References
- [shadcn/ui Table Documentation](https://ui.shadcn.com/docs/components/table)
- [User Story #5: Modernize Source Management](../projects/archive/25-07-25%20-%20Scraper%20Engine%20and%20UI%20Refinement%20-%20COMPLETED/stories/5.%20Modernize%20Source%20Management%20-%20COMPLETED.md)
- [Material Design Data Tables](https://material.io/components/data-tables)