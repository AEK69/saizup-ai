// SAIZUP AI Security & Protection Middleware
// Rate limiting, sanitization, CSRF check, and input boundary validation

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter
 * Limits requests per IP / Client to protect against DDoS, brute force, and API abuse.
 */
export function checkRateLimit(
  req: NextRequest,
  limit: number = 30, // max requests
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetInSec: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const route = req.nextUrl.pathname;
  const key = `${ip}:${route}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Sanitize untrusted user text inputs to prevent XSS and script injection
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 5000);
}

/**
 * Validate Base64 Audio payload size
 * Max 10MB to prevent heap exhaustion / denial of service
 */
export function validateBase64Audio(base64Str?: string, maxBytes: number = 10 * 1024 * 1024): boolean {
  if (!base64Str) return true;
  // Each base64 char is ~0.75 byte
  const approxBytes = (base64Str.length * 3) / 4;
  return approxBytes <= maxBytes;
}

/**
 * Verify Origin / Referer for CSRF protection on mutation requests
 */
export function verifyCsrf(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin || !host) return true; // Non-browser / same-origin default
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
