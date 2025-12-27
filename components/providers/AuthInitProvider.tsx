"use client";

import { useAuthInit } from "@/hooks/useAuthInit";

/**
 * Client component that initializes auth state on app load
 * This component should be placed inside ReduxProvider
 */
export function AuthInitProvider({ children }: { children: React.ReactNode }) {
  // This hook will fetch user profile if token exists but user data is missing
  useAuthInit();

  return <>{children}</>;
}

