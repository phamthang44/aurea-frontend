"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function GoogleOAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always wrap with provider, even if client ID is missing
  // This prevents "must be used within GoogleOAuthProvider" errors
  // The hook will handle the missing client ID gracefully
  if (!GOOGLE_CLIENT_ID) {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google login will not work."
    );
    // Use a placeholder client ID to prevent errors
    // The button will be disabled anyway
    return (
      <GoogleOAuthProvider clientId="placeholder-client-id">
        {children}
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
