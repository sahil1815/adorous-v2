import { cookies } from 'next/headers';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const CUSTOMER_COOKIE_NAME = 'adorous_customer_token';
const CUSTOMER_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || 'adorous-luxury-customer-session-secret-2026';
const encodedKey = new TextEncoder().encode(CUSTOMER_SECRET);

export interface CustomerTokenPayload {
  sub: string; // CustomerUser ID
  phone: string;
  name: string;
  email?: string | null;
}

// ── Password Hashing using Node.js crypto scrypt ──
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// ── Customer JWT Session ──
export async function signCustomerToken(payload: CustomerTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encodedKey);
}

export async function verifyCustomerToken(token: string): Promise<CustomerTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
    if (!payload || !payload.sub || typeof payload.sub !== 'string') return null;
    return {
      sub: payload.sub,
      phone: (payload.phone as string) || '',
      name: (payload.name as string) || '',
      email: (payload.email as string) || null,
    };
  } catch {
    return null;
  }
}

// ── Cookie Helpers ──
export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

export async function getCustomerSessionFromCookie(): Promise<CustomerTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}
