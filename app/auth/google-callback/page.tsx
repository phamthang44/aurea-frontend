"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loginWithGoogleAction } from "@/app/actions/auth";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthenticated } from "@/lib/store/authSlice";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
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
        // Call our BFF server action to exchange code for tokens
        const result = await loginWithGoogleAction(code);

        if (result.success) {
          // Update Redux state
          dispatch(setAuthenticated({}));

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
        setErrorMessage("An unexpected error occurred. Please try again.");
        console.error("Google callback error:", err);
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
                Completing your sign in
              </h1>
              <p className="text-sm text-muted-foreground font-light">
                Please wait while we authenticate with Google...
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
                Authentication Failed
              </h1>
              <p className="text-sm text-muted-foreground font-light">
                {errorMessage}
              </p>
              <p className="text-xs text-muted-foreground font-light">
                Redirecting to sign in page...
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
