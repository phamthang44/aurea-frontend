"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuxuryInput } from "@/components/auth/LuxuryInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LuxuryButton } from "@/components/auth/LuxuryButton";
import { LuxuryNavBar } from "@/components/layout/navbar/LuxuryNavBar";
import { resetPasswordAction } from "@/app/actions/auth";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

function ResetPasswordContent() {
  const { t } = useTranslation();
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
      return t("validation.passwordMinLength");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return t("validation.passwordLowercase");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return t("validation.passwordUppercase");
    }
    if (!/(?=.*\d)/.test(password)) {
      return t("validation.passwordNumber");
    }
    if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
      return t("validation.passwordSpecialChar");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError(t("validation.emailRequired"));
      return;
    }

    if (!otp.trim()) {
      setError(t("validation.otpRequired"));
      return;
    }

    if (otp.length !== 6) {
      setError(t("validation.otpMustBe6Digits"));
      return;
    }

    if (!newPassword) {
      setError(t("validation.passwordRequired"));
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("validation.passwordsDoNotMatch"));
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
        setError(result.error || t("error.failedToResetPassword"));
      }
    } catch (err) {
      setError(t("error.unexpectedError"));
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
                  {t("resetPassword.title")}
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  {t("resetPassword.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <LuxuryInput
                  id="email"
                  label={t("resetPassword.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  disabled={!!emailFromUrl}
                />

                <LuxuryInput
                  id="otp"
                  label={t("resetPassword.otpCode")}
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
                  label={t("resetPassword.newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder={t("resetPassword.newPassword")}
                  error={error}
                />

                <PasswordInput
                  id="confirmPassword"
                  label={t("resetPassword.confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t("resetPassword.confirmPassword")}
                />

                {error && (
                  <div className="flex items-center gap-2 text-xs text-destructive font-light">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <p className="text-xs font-light text-muted-foreground">
                  {t("resetPassword.passwordRequirements")}
                </p>

                <LuxuryButton
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-6"
                >
                  {t("resetPassword.resetPassword")}
                </LuxuryButton>
              </form>

              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 no-underline"
                >
                  {t("resetPassword.backToSignIn")}
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
                  {t("resetPassword.successTitle")}
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  {t("resetPassword.successMessage")}
                </p>
              </div>

              <LuxuryButton
                onClick={() => router.push("/auth")}
                className="w-full py-6"
              >
                {t("resetPassword.goToSignIn")}
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




