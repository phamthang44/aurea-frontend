"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuxuryInput } from "@/components/AuthForms/LuxuryInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LuxuryButton } from "@/components/AuthForms/LuxuryButton";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { OtpInput } from "@/components/AuthForms/OtpInput";
import { clientApi } from "@/lib/api-client";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      toast.error("Email is required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await clientApi.forgotPassword(email);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to send OTP");
      } else if (response.data?.error) {
        toast.error(response.data.error.message || "Failed to send OTP");
      } else {
        toast.success("OTP has been sent to your email");
        setStep(2);
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP code");
      setIsLoading(false);
      return;
    }

    // Note: We don't have a separate "verify password reset OTP" endpoint
    // The OTP will be verified when we submit the password reset
    // So we just validate format and move to next step
    setStep(3);
    setIsLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!newPassword) {
      toast.error("New password is required");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 10) {
      toast.error("Password must be at least 10 characters");
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      toast.error("Password must contain at least one lowercase letter");
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter");
      setIsLoading(false);
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      toast.error("Password must contain at least one number");
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[^A-Za-z0-9])/.test(newPassword)) {
      toast.error("Password must contain at least one special character");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await clientApi.resetPassword(email, otp, newPassword);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to reset password");
      } else if (response.data?.error) {
        toast.error(response.data.error.message || "Failed to reset password");
      } else {
        toast.success("Password has been reset successfully");
        setTimeout(() => {
          router.push("/auth");
        }, 1500);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const response = await clientApi.forgotPassword(email);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to resend OTP");
      } else if (response.data?.error) {
        toast.error(response.data.error.message || "Failed to resend OTP");
      } else {
        toast.success("OTP has been resent to your email");
        setResendCooldown(60);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
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
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    step >= stepNum
                      ? "bg-foreground"
                      : "bg-muted"
                  }`}
                />
                {stepNum < 3 && (
                  <div
                    className={`h-0.5 w-4 transition-all duration-300 ${
                      step > stepNum ? "bg-foreground" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Input Email */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                  Reset Password
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  Enter your email address and we'll send you an OTP code to
                  reset your password
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <LuxuryInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  autoFocus
                />

                <LuxuryButton
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-6"
                >
                  Send OTP
                </LuxuryButton>
              </form>

              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 no-underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-1 mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                  Verify OTP
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                />

                <LuxuryButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={otp.length !== 6}
                  className="w-full py-6"
                >
                  Verify
                </LuxuryButton>

                <div className="text-center space-y-2">
                  <p className="text-xs font-light text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "Resend OTP"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 inline-flex items-center gap-1 mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                  New Password
                </h1>
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  Enter your new password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <PasswordInput
                  id="newPassword"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 10 characters"
                  autoFocus
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                />

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
