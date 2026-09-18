'use server';

import { cookies } from 'next/headers';
import { encrypt } from '@/lib/session';

export async function adminLogin(pin: string, username: string = 'admin') {
  const MASTER_PIN = process.env.ADMIN_PIN || 'adorous2026';
  const MASTER_USERNAME = process.env.ADMIN_USER || 'admin';
  
  const cleanUser = username.trim().toLowerCase();
  const cleanPin = pin.trim();

  const isValidUser = cleanUser === MASTER_USERNAME || cleanUser === 'atelier@adorous.com';
  const isValidPin = cleanPin === MASTER_PIN;

  if (isValidUser && isValidPin) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({ 
      username: cleanUser, 
      role: 'Atelier Director',
      expires: expires.toISOString() 
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

  return {
    success: false,
    error: 'Invalid atelier credentials. Please check username or passcode PIN.',
  };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('adorous_admin_session');
  return { success: true };
}
