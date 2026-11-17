import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export interface AdminSession {
  username: string;
  role: string;
  expires: string;
  [key: string]: unknown;
}

/**
 * Validates the adorous_admin_session HTTP-only cookie.
 * Returns decrypted session payload if valid, null otherwise.
 */
export async function verifyAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adorous_admin_session')?.value;
    if (!token) return null;

    const session = await decrypt(token);
    if (!session || typeof session !== 'object') return null;

    return session as unknown as AdminSession;
  } catch {
    return null;
  }
}
