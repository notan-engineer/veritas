/**
 * Input Validation & Security Utilities
 * 
 * Provides comprehensive input validation and sanitization for Railway PostgreSQL
 * to prevent SQL injection and ensure data integrity.
 */

// Validation schema types
interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: RegExp;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: Record<string, unknown>;
}

/**
 * Validate factoid input data
 */
export function validateFactoidInput(data: unknown): ValidationResult {
  const schema: ValidationSchema = {
    title: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 200 
    },
    description: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 1000 
    },
    bullet_points: { 
      type: 'array', 
      required: false, 
      maxLength: 10 
    },
    language: { 
      type: 'string', 
      required: true, 
      enum: ['en', 'he', 'ar', 'other'] 
    },
    confidence_score: { 
      type: 'number', 
      required: true, 
      min: 0, 
      max: 100 
    },
    status: { 
      type: 'string', 
      required: false, 
      enum: ['draft', 'published', 'archived', 'flagged'] 
    }
  };

  return validateAgainstSchema(data, schema);
}

/**
 * Validate tag input data
 */
export function validateTagInput(data: unknown): ValidationResult {
  const schema: ValidationSchema = {
    name: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 100 
    },
    slug: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 100,
      pattern: /^[a-z0-9-]+$/ // URL-safe slug pattern
    },
    description: { 
      type: 'string', 
      required: false, 
      maxLength: 500 
    },
    parent_id: { 
      type: 'string', 
      required: false 
    },
    level: { 
      type: 'number', 
      required: true, 
      min: 0, 
      max: 10 
    },
    is_active: { 
      type: 'boolean', 
      required: false 
    }
  };

  return validateAgainstSchema(data, schema);
}

/**
 * Validate source input data
 */
export function validateSourceInput(data: unknown): ValidationResult {
  const schema: ValidationSchema = {
    name: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 200 
    },
    domain: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 100,
      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/ // Domain pattern
    },
    url: { 
      type: 'string', 
      required: true, 
      minLength: 1, 
      maxLength: 500,
      pattern: /^https?:\/\/.+/ // URL pattern
    },
    description: { 
      type: 'string', 
      required: false, 
      maxLength: 1000 
    },
    is_active: { 
      type: 'boolean', 
      required: false 
    }
  };

  return validateAgainstSchema(data, schema);
}

/**
 * Generic schema validation function
 */
export function validateAgainstSchema(data: unknown, schema: ValidationSchema): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Input must be an object']
    };
  }

  const inputData = data as Record<string, unknown>;

  // Validate each field in the schema
  for (const [fieldName, rule] of Object.entries(schema)) {
    const fieldValue = inputData[fieldName];

    // Check required fields
    if (rule.required && (fieldValue === undefined || fieldValue === null)) {
      errors.push(`Field '${fieldName}' is required`);
      continue;
    }

    // Skip validation for optional undefined fields
    if (!rule.required && (fieldValue === undefined || fieldValue === null)) {
      continue;
    }

    // Type validation
    if (!validateFieldType(fieldValue, rule.type)) {
      errors.push(`Field '${fieldName}' must be of type ${rule.type}`);
      continue;
    }

    // String validations
    if (rule.type === 'string' && typeof fieldValue === 'string') {
      if (rule.minLength && fieldValue.length < rule.minLength) {
        errors.push(`Field '${fieldName}' must be at least ${rule.minLength} characters`);
        continue;
      }
      if (rule.maxLength && fieldValue.length > rule.maxLength) {
        errors.push(`Field '${fieldName}' must not exceed ${rule.maxLength} characters`);
        continue;
      }
      if (rule.enum && !rule.enum.includes(fieldValue)) {
        errors.push(`Field '${fieldName}' must be one of: ${rule.enum.join(', ')}`);
        continue;
      }
      if (rule.pattern && !rule.pattern.test(fieldValue)) {
        errors.push(`Field '${fieldName}' format is invalid`);
        continue;
      }

      // Sanitize string input
      sanitizedData[fieldName] = sanitizeInput(fieldValue);
    }

    // Number validations
    if (rule.type === 'number' && typeof fieldValue === 'number') {
      if (rule.min !== undefined && fieldValue < rule.min) {
        errors.push(`Field '${fieldName}' must be at least ${rule.min}`);
        continue;
      }
      if (rule.max !== undefined && fieldValue > rule.max) {
        errors.push(`Field '${fieldName}' must not exceed ${rule.max}`);
        continue;
      }

      sanitizedData[fieldName] = fieldValue;
    }

    // Array validations
    if (rule.type === 'array' && Array.isArray(fieldValue)) {
      if (rule.maxLength && fieldValue.length > rule.maxLength) {
        errors.push(`Field '${fieldName}' must not exceed ${rule.maxLength} items`);
        continue;
      }

      // Sanitize array items if they are strings
      sanitizedData[fieldName] = fieldValue.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    }

    // Boolean validation
    if (rule.type === 'boolean') {
      sanitizedData[fieldName] = fieldValue;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

/**
 * Validate field type
 */
function validateFieldType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Sanitize string input to prevent XSS and other attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .substring(0, 10000); // Limit maximum length
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: unknown): ValidationResult {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      errors: ['Search query must be a string']
    };
  }

  const sanitizedQuery = sanitizeInput(query);

  if (sanitizedQuery.length === 0) {
    return {
      isValid: false,
      errors: ['Search query cannot be empty']
    };
  }

  if (sanitizedQuery.length > 200) {
    return {
      isValid: false,
      errors: ['Search query must not exceed 200 characters']
    };
  }

  // Check for potential SQL injection patterns
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitizedQuery)) {
      return {
        isValid: false,
        errors: ['Search query contains invalid characters']
      };
    }
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: { query: sanitizedQuery }
  };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: unknown): boolean {
  if (typeof uuid !== 'string') {
    return false;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePaginationParams(params: unknown): ValidationResult {
  const schema: ValidationSchema = {
    page: { 
      type: 'number', 
      required: false, 
      min: 1, 
      max: 10000 
    },
    limit: { 
      type: 'number', 
      required: false, 
      min: 1, 
      max: 100 
    },
    sort: { 
      type: 'string', 
      required: false, 
      enum: ['created_at', 'updated_at', 'title', 'confidence_score'] 
    },
    order: { 
      type: 'string', 
      required: false, 
      enum: ['asc', 'desc'] 
    }
  };

  return validateAgainstSchema(params, schema);
}

/**
 * Rate limiting validation (for API routes)
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(config: RateLimitConfig): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = config.identifier;

  // Clean up old entries
  if (rateLimitStore.has(key)) {
    const entry = rateLimitStore.get(key)!;
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  // Get or create entry
  const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs };

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  // Increment count and update store
  entry.count++;
  rateLimitStore.set(key, entry);

  return { allowed: true };
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
} as const; 