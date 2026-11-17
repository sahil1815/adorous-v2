'use server';

import { cookies, headers } from 'next/headers';
import { encrypt } from '@/lib/session';

interface AttemptRecord {
  attempts: number;
  lockUntil: number;
  lastAttempt: number;
}

// In-memory sliding window rate limiter for admin login attempts
const failedAttemptsMap = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Periodic memory hygiene
let lastCleanup = Date.now();
function cleanupStaleAttempts() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [key, record] of failedAttemptsMap.entries()) {
      if (record.lockUntil < now && now - record.lastAttempt > LOCKOUT_WINDOW_MS) {
        failedAttemptsMap.delete(key);
      }
    }
  }
}

export async function adminLogin(pin: string, username: string = 'admin') {
  cleanupStaleAttempts();

  // 1. Resolve client IP for rate limiting
  const headerList = await headers();
  const rawIp =
    headerList.get('cf-connecting-ip') ||
    headerList.get('x-real-ip') ||
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';
  const ipKey = `admin_ip_${rawIp}`;

  const now = Date.now();
  const record = failedAttemptsMap.get(ipKey);

  // 2. Enforce lockout if maximum attempts exceeded
  if (record && record.lockUntil > now) {
    const remainingMinutes = Math.max(1, Math.ceil((record.lockUntil - now) / (60 * 1000)));
    return {
      success: false,
      error: `Too many failed login attempts. Terminal locked for security. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
    };
  }

  const MASTER_PIN = (process.env.ADMIN_PIN || 'adorous2026').trim();
  const MASTER_USERNAME = (process.env.ADMIN_USER || 'admin').trim().toLowerCase();

  const cleanUser = username.trim().toLowerCase();
  const cleanPin = pin.trim();

  const isValidUser = cleanUser === MASTER_USERNAME || cleanUser === 'atelier@adorous.com';
  const isValidPin = cleanPin === MASTER_PIN;

  if (isValidUser && isValidPin) {
    // Reset rate limiter on successful authentication
    failedAttemptsMap.delete(ipKey);

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({
      username: cleanUser,
      role: 'Atelier Director',
      expires: expires.toISOString(),
    });

    const cookieStore = await cookies();
    cookieStore.set('adorous_admin_session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  // 3. Failed attempt: increment counter and apply timing defense
  const currentAttempts =
    record && record.lockUntil <= now && now - record.lastAttempt < LOCKOUT_WINDOW_MS
      ? record.attempts + 1
      : 1;

  if (currentAttempts >= MAX_ATTEMPTS) {
    failedAttemptsMap.set(ipKey, {
      attempts: currentAttempts,
      lockUntil: now + LOCKOUT_WINDOW_MS,
      lastAttempt: now,
    });

    return {
      success: false,
      error: `Too many failed login attempts. Terminal locked for 15 minutes.`,
    };
  }

  failedAttemptsMap.set(ipKey, {
    attempts: currentAttempts,
    lockUntil: 0,
    lastAttempt: now,
  });

  // Artificial 500ms delay to deter automated brute-force scripts
  await new Promise((resolve) => setTimeout(resolve, 500));

  const remaining = MAX_ATTEMPTS - currentAttempts;
  return {
    success: false,
    error: `Invalid atelier credentials. Please check username or passcode PIN. (${remaining} attempt${remaining > 1 ? 's' : ''} remaining before temporary lockout).`,
  };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('adorous_admin_session');
  return { success: true };
}
