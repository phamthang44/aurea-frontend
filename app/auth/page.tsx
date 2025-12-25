"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { LuxuryInput } from "@/components/AuthForms/LuxuryInput";
import { LuxuryButton } from "@/components/AuthForms/LuxuryButton";
import { OtpInput } from "@/components/AuthForms/OtpInput";

// Dynamically import GoogleLoginButton to avoid SSR issues
const GoogleLoginButton = dynamic(
  () =>
    import("@/components/AuthForms/GoogleLoginButton").then(
      (mod) => mod.GoogleLoginButton
    ),
  { ssr: false }
);
import {
  loginWithPasswordAction,
  requestOtpAction,
  verifyOtpAction,
  finishRegistrationAction,
} from "@/app/actions/auth";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthenticated } from "@/lib/store/authSlice";
import Link from "next/link";

type AuthMode = "password" | "otp";
type OtpStep = "email" | "otp" | "register";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Mode: Password or OTP
  const [authMode, setAuthMode] = useState<AuthMode>("password");

  // Password Login State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // OTP Flow State
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");

  // Registration State
  const [fullName, setFullName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setIsLoading(true);

    try {
      const result = await loginWithPasswordAction(identifier, password);

      if (result.success) {
        dispatch(setAuthenticated({}));
        router.push("/");
        router.refresh();
      } else {
        setPasswordError(result.error || "Invalid credentials");
      }
    } catch (err: any) {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login now uses redirect flow - handled by /auth/google-callback page

  // OTP: Request Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setIsLoading(true);

    try {
      const result = await requestOtpAction(otpEmail);

      if (result.success) {
        setOtpStep("otp");
      } else {
        setOtpError(result.error || "Failed to send OTP");
      }
    } catch (err: any) {
      setOtpError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP: Verify Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOtpAction(otpEmail, otp);

      if (result.success && result.data) {
        // Case A: LOGIN_SUCCESS - User exists
        if (!result.data.requiresRegistration) {
          dispatch(setAuthenticated({}));
          router.push("/");
          router.refresh();
          return;
        }

        // Case B: REQUIRE_REGISTRATION - New user
        if (result.data.requiresRegistration) {
          setOtpStep("register");
        }
      } else {
        setOtpError(result.error || "Invalid OTP code");
      }
    } catch (err: any) {
      setOtpError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP: Finish Registration
  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!fullName.trim()) {
      setRegisterError("Full name is required");
      return;
    }

    if (regPassword.length < 10) {
      setRegisterError(
        "Password must be at least 10 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await finishRegistrationAction(
        otpEmail,
        regPassword,
        fullName
      );

      if (result.success) {
        dispatch(setAuthenticated({}));
        router.push("/");
        router.refresh();
      } else {
        setRegisterError(result.error || "Registration failed");
      }
    } catch (err: any) {
      setRegisterError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset OTP flow
  const resetOtpFlow = () => {
    setOtpStep("email");
    setOtp("");
    setOtpError("");
    setFullName("");
    setRegPassword("");
    setRegisterError("");
  };

  // Switch between password and OTP modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    if (mode === "otp") {
      resetOtpFlow();
    } else {
      setPasswordError("");
      setIdentifier("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NavBar />

      {/* Blurred "Orb" of Color in Background Corner */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="pt-20 min-h-screen flex relative z-10">
        {/* Left Side - Fashion Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="sticky top-0 h-screen">
            <Image
              src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop"
              alt="Luxury Fashion"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 lg:px-16 py-24">
          <div className="w-full max-w-md space-y-8">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 bg-muted/30 rounded-sm">
              <button
                onClick={() => switchMode("password")}
                className={`
                  flex-1 px-4 py-2 text-sm font-light tracking-wide transition-all duration-300
                  ${
                    authMode === "password"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                Password
              </button>
              <button
                onClick={() => switchMode("otp")}
                className={`
                  flex-1 px-4 py-2 text-sm font-light tracking-wide transition-all duration-300
                  ${
                    authMode === "otp"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                OTP / Magic Link
              </button>
            </div>

            {/* Password Login Form */}
            {authMode === "password" && (
              <div
                key="password-form"
                className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                    Welcome Back
                  </h1>
                  <p className="text-sm font-light tracking-wide text-muted-foreground">
                    Sign in to continue your journey with AUREA
                  </p>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-6">
                  <LuxuryInput
                    id="identifier"
                    label="Email or Username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                  />

                  <div className="space-y-2">
                    <LuxuryInput
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      error={passwordError}
                    />
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 no-underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <LuxuryButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-6"
                  >
                    Sign In
                  </LuxuryButton>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-light tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login - Uses redirect flow */}
                <GoogleLoginButton disabled={isLoading} />
              </div>
            )}

            {/* OTP Flow */}
            {authMode === "otp" && (
              <div
                key="otp-form"
                className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                {/* Step 1: Request OTP */}
                {otpStep === "email" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                        Welcome to AUREA
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Enter your email to join the exclusive circle
                      </p>
                    </div>

                    <form onSubmit={handleRequestOtp} className="space-y-8">
                      <LuxuryInput
                        id="otp-email"
                        label="Email"
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        placeholder="your.email@example.com"
                        error={otpError}
                      />

                      <LuxuryButton
                        type="submit"
                        isLoading={isLoading}
                        className="w-full py-6"
                      >
                        Send Code
                      </LuxuryButton>
                    </form>
                  </div>
                )}

                {/* Step 2: Verify OTP */}
                {otpStep === "otp" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <button
                        onClick={resetOtpFlow}
                        className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 mb-4"
                      >
                        ← Back
                      </button>
                      <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                        Verify Your Email
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Enter the 6-digit code sent to {otpEmail}
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        error={otpError}
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
                    </form>
                  </div>
                )}

                {/* Step 3: Complete Registration */}
                {otpStep === "register" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <button
                        onClick={() => setOtpStep("otp")}
                        className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 mb-4"
                      >
                        ← Back
                      </button>
                      <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                        Complete Your Profile
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Welcome! Let's finish setting up your account
                      </p>
                    </div>

                    <form
                      onSubmit={handleFinishRegistration}
                      className="space-y-8"
                    >
                      <LuxuryInput
                        id="fullName"
                        label="Full Name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="John Doe"
                      />

                      <LuxuryInput
                        id="reg-password"
                        label="Password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder="At least 10 characters"
                        error={registerError}
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
                        Create Account
                      </LuxuryButton>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
