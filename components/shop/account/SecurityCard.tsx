"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Shield, Key, Smartphone, ChevronRight, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Link from "next/link";
import type { SecuritySettings, ChangePasswordRequest } from "@/lib/types/profile";

interface SecurityCardProps {
  settings: SecuritySettings;
  onChangePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; error?: string }>;
  onToggle2FA: (enabled: boolean) => Promise<void>;
}

export function SecurityCard({
  settings,
  onChangePassword,
  onToggle2FA,
}: SecurityCardProps) {
  const { t } = useTranslation();
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 2FA state
  const [is2FALoading, setIs2FALoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // Validation
    if (newPassword.length < 10) {
      setPasswordError(t("validation.passwordMinLength", { defaultValue: "Password must be at least 10 characters" }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("validation.passwordMismatch", { defaultValue: "Passwords do not match" }));
      return;
    }

    setIsSaving(true);
    try {
      const result = await onChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      if (result.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(result.error || t("error.unexpectedError", { defaultValue: "An error occurred" }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    setIs2FALoading(true);
    try {
      await onToggle2FA(enabled);
    } finally {
      setIs2FALoading(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: t("security.weak", { defaultValue: "Weak" }), color: "bg-red-500" };
    if (score <= 4) return { score: 2, label: t("security.fair", { defaultValue: "Fair" }), color: "bg-yellow-500" };
    return { score: 3, label: t("security.strong", { defaultValue: "Strong" }), color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-lg font-light tracking-wide text-foreground">
          {t("profile.security.title", { defaultValue: "Security & Privacy" })}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Change Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("profile.security.changePassword", { defaultValue: "Change Password" })}
                </p>
                {settings.lastPasswordChange && (
                  <p className="text-xs text-muted-foreground">
                    {t("profile.security.lastChanged", { defaultValue: "Last changed" })}:{" "}
                    {new Date(settings.lastPasswordChange).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {!isChangingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
              >
                {t("common.change", { defaultValue: "Change" })}
              </Button>
            )}
          </div>

          {/* Password Change Form */}
          {isChangingPassword && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4 pt-4 border-t border-border"
            >
              <PasswordInput
                id="currentPassword"
                label={t("profile.security.currentPassword", { defaultValue: "Current Password" })}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="space-y-2">
                <PasswordInput
                  id="newPassword"
                  label={t("profile.security.newPassword", { defaultValue: "New Password" })}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-300", passwordStrength.color)}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <PasswordInput
                id="confirmPassword"
                label={t("profile.security.confirmPassword", { defaultValue: "Confirm New Password" })}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* Error/Success Messages */}
              {passwordError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  {t("profile.security.passwordChanged", { defaultValue: "Password changed successfully!" })}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  disabled={isSaving}
                >
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving
                    ? t("common.saving", { defaultValue: "Saving..." })
                    : t("profile.security.updatePassword", { defaultValue: "Update Password" })}
                </Button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("profile.security.twoFactor", { defaultValue: "Two-Factor Authentication" })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.security.twoFactorDesc", { defaultValue: "Add an extra layer of security to your account" })}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.twoFactorEnabled}
            onCheckedChange={handle2FAToggle}
            disabled={is2FALoading}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Account Recovery */}
        <Link
          href="/forgot-password"
          className="flex items-center justify-between py-2 group no-underline"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {t("profile.security.accountRecovery", { defaultValue: "Account Recovery Options" })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.security.accountRecoveryDesc", { defaultValue: "Set up recovery options for your account" })}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </motion.div>
  );
}
