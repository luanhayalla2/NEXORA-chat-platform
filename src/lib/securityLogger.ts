/**
 * Security Logger - Logs important security events
 * In production, these would be sent to a backend logging service
 */

type SecurityEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'SIGNUP_SUCCESS'
  | 'SIGNUP_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED_ACCESS'
  | 'MESSAGE_SANITIZED'
  | 'INVALID_INPUT'
  | 'RATE_LIMIT_HIT'
  | 'PROFILE_UPDATED';

interface SecurityLogEntry {
  event: SecurityEvent;
  timestamp: string;
  userId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

const LOG_STORAGE_KEY = 'nexora_security_logs';
const MAX_LOG_ENTRIES = 500;

function getStoredLogs(): SecurityLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistLog(entry: SecurityLogEntry) {
  try {
    const logs = getStoredLogs();
    logs.push(entry);
    // Keep only the last N entries
    const trimmed = logs.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable - silent fail
  }
}

export function logSecurityEvent(
  event: SecurityEvent,
  userId?: string,
  details?: Record<string, unknown>
) {
  const entry: SecurityLogEntry = {
    event,
    timestamp: new Date().toISOString(),
    userId,
    details,
  };

  // Console log for dev visibility
  const style = event.includes('FAILED') || event === 'UNAUTHORIZED_ACCESS'
    ? 'color: #ef4444; font-weight: bold;'
    : 'color: #22c55e;';

  console.log(`%c[Security] ${event}`, style, {
    timestamp: entry.timestamp,
    userId: userId || 'anonymous',
    ...details,
  });

  // Persist locally
  persistLog(entry);
}

export function getSecurityLogs(): SecurityLogEntry[] {
  return getStoredLogs();
}

export function clearSecurityLogs() {
  localStorage.removeItem(LOG_STORAGE_KEY);
}

/**
 * Simple rate limiter for sensitive actions
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(action: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(action);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(action, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    logSecurityEvent('RATE_LIMIT_HIT', undefined, { action, attempts: entry.count });
    return false; // blocked
  }

  return true; // allowed
}
