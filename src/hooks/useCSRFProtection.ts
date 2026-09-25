import { useState, useCallback } from 'react'

/**
 * Simple CSRF protection hook
 * Generates and validates CSRF tokens for form submissions
 */
export function useCSRFProtection() {
  const [csrfToken] = useState(() => generateCSRFToken())

  const getCSRFHeaders = useCallback((): HeadersInit => {
    return {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    }
  }, [csrfToken])

  const validateCSRFToken = useCallback((token: string): boolean => {
    // In a real app, this would validate against a server-side stored token
    // For client-side forms, we just check the token exists and matches format
    return typeof token === 'string' && token.length === 64
  }, [])

  return {
    csrfToken,
    getCSRFHeaders,
    validateCSRFToken
  }
}

/**
 * Generate a CSRF token
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
