import { cookies } from 'next/headers';

/**
 * Server-side auth helper
 * Use this in Server Components to check authentication status
 */
export async function getServerAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  
  return {
    isAuthenticated: !!accessToken,
    accessToken: accessToken?.value || null,
  };
}

/**
 * Get access token for server-side API calls
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}

