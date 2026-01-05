"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loginWithGoogleAction, fetchUserProfileAction } from "@/app/actions/auth";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthenticated } from "@/lib/store/authSlice";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

function GoogleCallbackContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      // Get the authorization code from query parameters
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Handle OAuth error from Google
      if (error) {
        setStatus("error");
        setErrorMessage(
          error === "access_denied"
            ? "Google login was cancelled"
            : "An error occurred during Google authentication"
        );
        // Redirect to auth page after 3 seconds
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
        return;
      }

      // Validate code exists
      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from Google");
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
        return;
      }

      try {
        console.log("[Google Callback] Authorization code received:", code ? `${code.substring(0, 20)}...` : "null");
        console.log("[Google Callback] Calling backend API...");
        
        // Call our BFF server action to exchange code for tokens
        const result = await loginWithGoogleAction(code);
        
        console.log("[Google Callback] Backend response:", result.success ? "SUCCESS" : "FAILED", result.error || "");

        if (result.success && result.data) {
          // Fetch user profile from backend (single source of truth)
          const profileResult = await fetchUserProfileAction();
          
          if (profileResult.success && profileResult.data) {
            // Merge roles from Google login response with profile data
            const userData = {
              ...profileResult.data,
              roles: result.data.roles || profileResult.data || [],
            };
            
            console.log("[Google Callback] User profile fetched:", userData);
            dispatch(setAuthenticated({ user: userData }));
          } else {
            // If profile fetch fails, still set authenticated with roles from Google login
            console.warn("[Google Callback] Profile fetch failed, using roles from Google login:", result.data.roles);
            dispatch(setAuthenticated({ 
              user: { 
                roles: result.data.roles || [],
              } 
            }));
          }
          
          // Merge guest cart after successful login
          const { mergeGuestCartOnLogin } = await import('@/lib/utils/cartMerge');
          await mergeGuestCartOnLogin();

          // Redirect to home page
          router.push("/");
          router.refresh();
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Google login failed");
          setTimeout(() => {
            router.push("/auth");
          }, 3000);
        }
      } catch (err: any) {
        setStatus("error");
        const errorMsg = err?.message || "An unexpected error occurred. Please try again.";
        setErrorMessage(errorMsg);
        console.error("[Google Callback] Error details:", {
          message: err?.message,
          stack: err?.stack,
          response: err?.response,
        });
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        {status === "loading" ? (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-foreground/60" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-light tracking-wide">
                {t("googleCallback.completingSignIn")}
              </h1>
              <p className="text-sm text-muted-foreground font-light">
                {t("googleCallback.pleaseWait")}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">✕</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-light tracking-wide text-destructive">
                {t("googleCallback.authenticationFailed")}
              </h1>
              <p className="text-sm text-muted-foreground font-light">
                {errorMessage}
              </p>
              <p className="text-xs text-muted-foreground font-light">
                {t("googleCallback.redirecting")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-foreground/60" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-light tracking-wide">Loading...</h1>
            </div>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
