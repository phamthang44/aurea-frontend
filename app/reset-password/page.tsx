"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuxuryInput } from "@/components/AuthForms/LuxuryInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LuxuryButton } from "@/components/AuthForms/LuxuryButton";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { resetPasswordAction } from "@/app/actions/auth";
import { CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token/otp and email from URL params
  const tokenFromUrl = searchParams.get("token") || searchParams.get("otp");
  const emailFromUrl = searchParams.get("email");

  const [email, setEmail] = useState(emailFromUrl || "");
  const [otp, setOtp] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate password strength
  const validatePassword = (password: string): string | null => {
    if (password.length < 10) {
      return "Password must be at least 10 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!otp.trim()) {
      setError("OTP code is required");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP code must be 6 digits");
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPasswordAction(email, otp, newPassword);

      if (result.success) {
        setIsSuccess(true);
        // Redirect to log in after 2 seconds
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LuxuryNavBar />

      {/* Blurred "Orb" of Color in Background Corner */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="pt-20 min-h-screen flex items-center justify-center px-6 sm:px-8 py-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {!isSuccess ? (
            <>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                  Reset Password
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  Enter your email, OTP code, and new password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <LuxuryInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  disabled={!!emailFromUrl}
                />

                <LuxuryInput
                  id="otp"
                  label="OTP Code"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    // Only allow digits, max 6 characters
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  required
                  placeholder="123456"
                  maxLength={6}
                  disabled={!!tokenFromUrl}
                  autoFocus={!tokenFromUrl}
                />

                <PasswordInput
                  id="newPassword"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 10 characters"
                  error={error}
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                />

                {error && (
                  <div className="flex items-center gap-2 text-xs text-destructive font-light">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <p className="text-xs font-light text-muted-foreground">
                  Password must contain uppercase, lowercase, number, and
                  special character
                </p>

                <LuxuryButton
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-6"
                >
                  Reset Password
                </LuxuryButton>
              </form>

              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 no-underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                  Password Reset Successful
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  Your password has been reset successfully. Redirecting to sign
                  in...
                </p>
              </div>

              <LuxuryButton
                onClick={() => router.push("/auth")}
                className="w-full py-6"
              >
                Go to Sign In
              </LuxuryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-light text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

