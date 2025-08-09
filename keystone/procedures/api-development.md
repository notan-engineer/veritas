# API Development Procedure

## Context Selection (2-3 files max)
```
Primary: @services/ui/app/api/[endpoint]/route.ts
Database: @services/ui/lib/railway-database.ts (if needed)
Client: @services/ui/lib/data-service.ts (for integration)
```

## Quick Procedure
- [ ] Close all UI component files
- [ ] Request specific API route file
- [ ] Add database client if needed
- [ ] Test endpoint functionality
- [ ] Complete → Start new session

## Common Patterns

### Standard API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { databaseFunction } from '@/lib/railway-database'

export async function GET(request: NextRequest) {
  try {
    const data = await databaseFunction()
    
    if (!data) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      )
    }
    
    const result = await databaseFunction(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## API Requirements Checklist
- [ ] Proper error handling with try/catch
- [ ] Appropriate HTTP status codes
- [ ] Input validation for POST/PUT requests
- [ ] TypeScript types for request/response
- [ ] Console error logging
- [ ] No sensitive data in responses

## Testing
1. Test with browser/Postman: `http://localhost:3000/api/[endpoint]`
2. Use test API server for isolated testing: `node utilities/04-test-api.js`
3. Test scraper integration: `node utilities/03-test-scraper.js`
4. Verify response format matches expectations
5. Test error cases (404, 400, 500)
6. Check TypeScript compilation: `npm run build`
7. Verify database queries work correctly
8. Analyze logs for failures: `node utilities/06-test-logs.js <job-id>`

## Common Issues
- **CORS errors**: Check Next.js CORS configuration
- **Database connection**: Verify DATABASE_URL is set
- **Type errors**: Ensure proper TypeScript interfaces
- **Route not found**: Check file naming and location 