/**
 * Message sanitization utilities - prevents XSS and malicious content
 */

// HTML entity map for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Escapes HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Removes potential script injections and dangerous patterns
 */
export function sanitizeMessage(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let sanitized = content.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: and data: protocol URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');

  // Remove HTML tags entirely (chat messages should be plain text)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Limit message length (prevent abuse)
  const MAX_MESSAGE_LENGTH = 4096;
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}

/**
 * Validates and sanitizes user input fields (name, bio, etc.)
 */
export function sanitizeUserInput(input: string, maxLength = 255): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número' };
  }
  return { valid: true, message: '' };
}
