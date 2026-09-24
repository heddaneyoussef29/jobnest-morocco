// Security utilities for input sanitization and validation

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize HTML content (for rich text editors)
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (except images)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '')
  
  return sanitized
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  if (!url) return true // Optional field
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return true // Optional field
  const phoneRegex = /^\+?[\d\s-()]{10,20}$/
  return phoneRegex.test(phone)
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Check if a string contains potentially malicious content
 */
export function containsMaliciousContent(str: string): boolean {
  const maliciousPatterns = [
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\(/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(str))
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
}

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }>
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.attempts = new Map()
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (attempt.count >= this.maxAttempts) {
      return false
    }

    attempt.count++
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * Create a secure headers object for fetch requests
 */
export function getSecureHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}

/**
 * Log security events (for monitoring)
 */
export function logSecurityEvent(event: string, details?: Record<string, any>) {
  console.log(`[Security] ${event}`, details)
  // In production, send to security monitoring service
}