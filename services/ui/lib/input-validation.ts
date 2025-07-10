/**
 * Input Validation Utilities
 * 
 * Comprehensive validation functions for user inputs to ensure security,
 * performance, and user experience across the Veritas application.
 */

export interface SearchValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedQuery?: string;
}

/**
 * Comprehensive search query validation
 * 
 * Validates search queries for length, characters, and potential security issues
 * while providing clear error messages for different validation failures.
 */
export function validateSearchQuery(query: string | null): SearchValidationResult {
  // Check if query exists
  if (!query) {
    return {
      isValid: false,
      error: 'Search query is required'
    };
  }

  // Trim whitespace and check for empty string
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return {
      isValid: false,
      error: 'Search query cannot be empty'
    };
  }

  // Minimum length validation (prevent single character searches that may be too broad)
  const MIN_QUERY_LENGTH = 2;
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Search query must be at least ${MIN_QUERY_LENGTH} characters long`
    };
  }

  // Maximum length validation (prevent excessively long queries)
  const MAX_QUERY_LENGTH = 200;
  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Search query cannot exceed ${MAX_QUERY_LENGTH} characters`
    };
  }

  // Check for invalid characters (potential SQL injection or XSS attempts)
  const invalidCharacterPattern = /[<>{}[\]\\\/\x00-\x1f\x7f]/;
  if (invalidCharacterPattern.test(trimmedQuery)) {
    return {
      isValid: false,
      error: 'Search query contains invalid characters'
    };
  }

  // Check for potential SQL injection patterns
  const sqlInjectionPattern = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)|(-{2})|\/\*|\*\/|;/i;
  if (sqlInjectionPattern.test(trimmedQuery)) {
    return {
      isValid: false,
      error: 'Search query contains potentially harmful content'
    };
  }

  // Check for excessive special characters (potential noise)
  const specialCharCount = (trimmedQuery.match(/[!@#$%^&*()+=|{}[\]:";'<>?,.\/]/g) || []).length;
  const specialCharRatio = specialCharCount / trimmedQuery.length;
  if (specialCharRatio > 0.5) {
    return {
      isValid: false,
      error: 'Search query contains too many special characters'
    };
  }

  // Check for excessive whitespace (prevent formatting abuse)
  const consecutiveSpaces = /\s{3,}/;
  if (consecutiveSpaces.test(trimmedQuery)) {
    return {
      isValid: false,
      error: 'Search query contains excessive whitespace'
    };
  }

  // Sanitize the query by normalizing whitespace
  const sanitizedQuery = trimmedQuery
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Final trim

  return {
    isValid: true,
    sanitizedQuery
  };
}

/**
 * Validate and sanitize tag slug input
 */
export function validateTagSlug(slug: string | null): SearchValidationResult {
  if (!slug) {
    return {
      isValid: false,
      error: 'Tag slug is required'
    };
  }

  const trimmedSlug = slug.trim();
  if (trimmedSlug.length === 0) {
    return {
      isValid: false,
      error: 'Tag slug cannot be empty'
    };
  }

  // Tag slugs should follow URL-safe patterns
  const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!validSlugPattern.test(trimmedSlug)) {
    return {
      isValid: false,
      error: 'Invalid tag slug format'
    };
  }

  // Length validation for tag slugs
  if (trimmedSlug.length > 50) {
    return {
      isValid: false,
      error: 'Tag slug cannot exceed 50 characters'
    };
  }

  return {
    isValid: true,
    sanitizedQuery: trimmedSlug
  };
}

/**
 * Validate factoid ID parameter
 */
export function validateFactoidId(id: string | null): SearchValidationResult {
  if (!id) {
    return {
      isValid: false,
      error: 'Factoid ID is required'
    };
  }

  const trimmedId = id.trim();
  if (trimmedId.length === 0) {
    return {
      isValid: false,
      error: 'Factoid ID cannot be empty'
    };
  }

  // UUIDs or similar ID patterns (adjust based on your ID format)
  const validIdPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validIdPattern.test(trimmedId)) {
    return {
      isValid: false,
      error: 'Invalid factoid ID format'
    };
  }

  // Length validation for IDs
  if (trimmedId.length > 100) {
    return {
      isValid: false,
      error: 'Factoid ID too long'
    };
  }

  return {
    isValid: true,
    sanitizedQuery: trimmedId
  };
}

/**
 * Rate limiting helper - track search attempts per IP
 * Note: In production, this should use Redis or similar for distributed rate limiting
 */
const searchAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkSearchRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxAttempts = 30; // Maximum 30 searches per minute

  const attempts = searchAttempts.get(clientId);
  
  if (!attempts) {
    searchAttempts.set(clientId, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset counter if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    searchAttempts.set(clientId, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Increment counter
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitCache(): void {
  const now = Date.now();
  const windowMs = 60000;

  for (const [clientId, attempts] of searchAttempts.entries()) {
    if (now - attempts.lastAttempt > windowMs) {
      searchAttempts.delete(clientId);
    }
  }
}

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