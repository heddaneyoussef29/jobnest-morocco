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
 * In production, this should send to a proper logging service
 */
export function logSecurityEvent(event: string, details?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    details,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  }
  
  // Log to console in development
  console.warn(`[Security Event] ${timestamp}:`, logEntry)
  
  // Store in localStorage for debugging (limited to last 50 entries)
  if (typeof localStorage !== 'undefined') {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
      existingLogs.unshift(logEntry)
      // Keep only last 50 entries
      if (existingLogs.length > 50) {
        existingLogs.splice(50)
      }
      localStorage.setItem('securityLogs', JSON.stringify(existingLogs))
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }
  
  // In production, send to monitoring service (e.g., Sentry, LogRocket)
  // Example: fetch('/api/security-log', { method: 'POST', body: JSON.stringify(logEntry) })
}

/**
 * Get stored security logs (for admin review)
 */
export function getSecurityLogs(): Array<{timestamp: string, event: string, details?: Record<string, any>}> {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('securityLogs') || '[]')
  } catch {
    return []
  }
}

/**
 * Clear security logs
 */
export function clearSecurityLogs(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('securityLogs')
  }
}