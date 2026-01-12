"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { LuxuryNavBar } from "@/components/layout/LuxuryNavBar";
import { LuxuryInput } from "@/components/auth/LuxuryInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LuxuryButton } from "@/components/auth/LuxuryButton";
import { OtpInput } from "@/components/auth/OtpInput";
import { useTranslation } from "react-i18next";

// Dynamically import GoogleLoginButton to avoid SSR issues
const GoogleLoginButton = dynamic(
  () =>
    import("@/components/auth/GoogleLoginButton").then(
      (mod) => mod.GoogleLoginButton
    ),
  { ssr: false }
);
import {
  loginWithPasswordAction,
  requestOtpAction,
  verifyOtpAction,
  finishRegistrationAction,
  fetchUserProfileAction,
} from "@/app/actions/auth";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthenticated } from "@/lib/store/authSlice";
import Link from "next/link";

type AuthMode = "password" | "otp";
type OtpStep = "email" | "otp" | "register";

export default function AuthPage() {
  const { t } = useTranslation();
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

      if (result.success && result.data) {
        // Fetch user profile from backend (single source of truth)
        const profileResult = await fetchUserProfileAction();

        if (profileResult.success && profileResult.data) {
          // Merge roles from login response with profile data
          const userData = {
            ...profileResult.data,
            roles: result.data.roles || profileResult.data.roles || [],
          };

          console.log("[Auth Page] User profile fetched:", userData);
          dispatch(setAuthenticated({ user: userData }));
        } else {
          // If profile fetch fails, still set authenticated with roles from login
          console.warn(
            "[Auth Page] Profile fetch failed, using roles from login:",
            result.data.roles
          );
          dispatch(
            setAuthenticated({
              user: {
                email: identifier, // Fallback to identifier
                roles: result.data.roles || [],
              },
            })
          );
        }

        // Merge guest cart after successful login
        const { mergeGuestCartOnLogin } = await import("@/lib/utils/cartMerge");
        await mergeGuestCartOnLogin();
        router.push("/shop");
        router.refresh();
      } else {
        setPasswordError(result.error || t("error.invalidCredentials"));
      }
    } catch (err: any) {
      setPasswordError(t("error.unexpectedError"));
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
        setOtpError(result.error || t("error.failedToSendOtp"));
      }
    } catch (err: any) {
      setOtpError(t("error.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP: Verify Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError(t("validation.otp6Digits"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOtpAction(otpEmail, otp);

      if (result.success && result.data) {
        // Case A: LOGIN_SUCCESS - User exists
        if (!result.data.requiresRegistration) {
          // Fetch user profile from backend (single source of truth)
          const profileResult = await fetchUserProfileAction();

          if (profileResult.success && profileResult.data) {
            // Merge roles from OTP response with profile data
            const userData = {
              ...profileResult.data,
              roles: result.data.roles || profileResult.data.roles || [],
            };

            console.log(
              "[Auth Page] OTP Login - User profile fetched:",
              userData
            );
            dispatch(setAuthenticated({ user: userData }));
          } else {
            // If profile fetch fails, still set authenticated with roles from OTP
            console.warn(
              "[Auth Page] Profile fetch failed, using roles from OTP:",
              result.data.roles
            );
            dispatch(
              setAuthenticated({
                user: {
                  email: otpEmail, // Use email from form
                  roles: result.data.roles || [],
                },
              })
            );
          }

          // Merge guest cart after successful OTP login
          const { mergeGuestCartOnLogin } = await import(
            "@/lib/utils/cartMerge"
          );
          await mergeGuestCartOnLogin();
          router.push("/shop");
          router.refresh();
          return;
        }

        // Case B: REQUIRE_REGISTRATION - New user
        if (result.data.requiresRegistration) {
          setOtpStep("register");
        }
      } else {
        setOtpError(result.error || t("error.invalidOtpCode"));
      }
    } catch (err: any) {
      setOtpError(t("error.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP: Finish Registration
  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!fullName.trim()) {
      setRegisterError(t("validation.fullNameRequired"));
      return;
    }

    if (regPassword.length < 10) {
      setRegisterError(t("validation.passwordMinLength"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await finishRegistrationAction(
        otpEmail,
        regPassword,
        fullName
      );

      if (result.success && result.data) {
        // Fetch user profile from backend (single source of truth)
        const profileResult = await fetchUserProfileAction();

        if (profileResult.success && profileResult.data) {
          // Merge roles from registration response with profile data
          const userData = {
            ...profileResult.data,
            roles: result.data.roles || profileResult.data.roles || [],
          };

          console.log(
            "[Auth Page] Registration - User profile fetched:",
            userData
          );
          dispatch(setAuthenticated({ user: userData }));
        } else {
          // If profile fetch fails, still set authenticated with roles from registration
          console.warn(
            "[Auth Page] Profile fetch failed, using roles from registration:",
            result.data.roles
          );
          dispatch(
            setAuthenticated({
              user: {
                email: otpEmail, // Use email from form
                fullName: fullName, // Use fullName from form
                roles: result.data.roles || [],
              },
            })
          );
        }

        // Merge guest cart after successful registration
        const { mergeGuestCartOnLogin } = await import("@/lib/utils/cartMerge");
        await mergeGuestCartOnLogin();
        router.push("/shop");
        router.refresh();
      } else {
        setRegisterError(result.error || t("error.registrationFailed"));
      }
    } catch (err: any) {
      setRegisterError(t("error.unexpectedError"));
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
      <LuxuryNavBar />

      {/* Blurred "Orb" of Color in Background Corner */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="pt-20 min-h-screen flex relative z-10 overflow-hidden">
        {/* Left Side - Fashion Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="sticky top-1 h-[91vh] rounded-lg ">
            <Image
              src="/background-4.jpg"
              alt="Luxury Fashion"
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="
                absolute inset-0
                bg-gradient-to-t
                from-white/40 via-white/10 to-transparent
                dark:from-black/60 dark:via-black/30
              "
            />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 lg:px-16 py-24">
          <div className="w-full max-w-md space-y-8">
            {/* Mode Toggle - Luxury Design */}
            <div className="relative flex items-center justify-center gap-1.5 p-1.5 bg-gradient-to-br from-white/40 to-white/20 dark:from-[#1A1A1A]/60 dark:to-[#1A1A1A]/40 border border-[#D4AF37]/30 dark:border-[#D4AF37]/40 rounded-xl backdrop-blur-md shadow-lg shadow-[#D4AF37]/5">
              <button
                onClick={() => switchMode("password")}
                className={`
                  relative flex-1 px-5 py-2.5 text-sm font-light tracking-wide transition-all duration-300 rounded-lg z-10
                  ${
                    authMode === "password"
                      ? "text-[#D4AF37] dark:text-[#E5C96B]"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {t("auth.mode.password")}
                {authMode === "password" && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/40 dark:border-[#D4AF37]/50 shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => switchMode("otp")}
                className={`
                  relative flex-1 px-5 py-2.5 text-sm font-light tracking-wide transition-all duration-300 rounded-lg z-10
                  ${
                    authMode === "otp"
                      ? "text-[#D4AF37] dark:text-[#E5C96B]"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {t("auth.mode.otp")}
                {authMode === "otp" && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/40 dark:border-[#D4AF37]/50 shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
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
                    {t("auth.password.welcomeBack")}
                  </h1>
                  <p className="text-sm font-light tracking-wide text-muted-foreground">
                    {t("auth.password.subtitle")}
                  </p>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-6">
                  <LuxuryInput
                    id="identifier"
                    label={t("auth.password.emailOrUsername")}
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                  />

                  <div className="space-y-2">
                    <PasswordInput
                      id="password"
                      label={t("auth.password.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t("auth.password.passwordPlaceholder")}
                      error={passwordError}
                    />
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-xs font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 no-underline"
                      >
                        {t("auth.password.forgotPassword")}
                      </Link>
                    </div>
                  </div>

                  <LuxuryButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-6"
                  >
                    {t("auth.password.signIn")}
                  </LuxuryButton>
                </form>

                {/* Divider */}
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border bg-background/40 dark:bg-background/40" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#121212] px-6 py-1 text-muted-foreground font-light tracking-wider">
                      {t("auth.orContinueWith")}
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
                        {t("auth.otp.welcome")}
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        {t("auth.otp.enterEmail")}
                      </p>
                    </div>

                    <form onSubmit={handleRequestOtp} className="space-y-8">
                      <LuxuryInput
                        id="otp-email"
                        label={t("auth.otp.email")}
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
                        {t("auth.otp.sendCode")}
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
                        â† {t("common.back")}
                      </button>
                      <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                        {t("auth.otp.verifyEmail")}
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        {t("auth.otp.enterCode", { email: otpEmail })}
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
                        {t("auth.otp.verify")}
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
                        â† {t("common.back")}
                      </button>
                      <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em]">
                        {t("auth.register.completeProfile")}
                      </h1>
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        {t("auth.register.welcome")}
                      </p>
                    </div>

                    <form
                      onSubmit={handleFinishRegistration}
                      className="space-y-8"
                    >
                      <LuxuryInput
                        id="fullName"
                        label={t("auth.register.fullName")}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="John Doe"
                      />

                      <PasswordInput
                        id="reg-password"
                        label={t("auth.register.password")}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder={t("auth.register.passwordPlaceholder")}
                        error={registerError}
                      />

                      <p className="text-xs font-light text-muted-foreground">
                        {t("auth.register.passwordRequirements")}
                      </p>

                      <LuxuryButton
                        type="submit"
                        isLoading={isLoading}
                        className="w-full py-6"
                      >
                        {t("auth.register.createAccount")}
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



