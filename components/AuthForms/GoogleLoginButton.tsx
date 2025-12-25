"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { LuxuryButton } from "./LuxuryButton";
import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

export function GoogleLoginButton({
  disabled = false,
}: GoogleLoginButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if Google Client ID is available
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    setIsGoogleAvailable(!!clientId && clientId !== "placeholder-client-id");
  }, []);

  // Get redirect URI - use environment variable or default to localhost
  const redirectUri =
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    `${
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    }/auth/google-callback`;

  // Initialize the hook with redirect flow
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code", // CRITICAL: Use authorization code flow
    ux_mode: "redirect", // NEW: Use redirect flow instead of popup
    redirect_uri: redirectUri, // Must match Google Console configuration
    onError: (error) => {
      console.error("Google OAuth error:", error);
    },
  });

  // Wrapper to check if Google is available before triggering login
  const handleClick = () => {
    if (!isGoogleAvailable) {
      console.warn("Google OAuth is not configured");
      return;
    }
    // This will redirect the entire page to Google OAuth
    handleGoogleLogin();
  };

  // Always show the button, but disable it if Google is not available
  return (
    <LuxuryButton
      variant="outline"
      onClick={isMounted && isGoogleAvailable ? handleClick : undefined}
      disabled={disabled || !isMounted || !isGoogleAvailable}
      className="w-full py-6 select-none"
    >
      <LogIn className="h-5 w-5 mr-2" />
      <span className="select-none">Continue with Google</span>
    </LuxuryButton>
  );
}
