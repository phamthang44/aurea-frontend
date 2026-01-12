"use client";

import { useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useTranslation } from "react-i18next";
import { ForbiddenPage } from "@/components/errors/Forbidden";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Component to guard routes that require authentication
 * Waits for auth initialization before redirecting
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/auth",
}: AuthGuardProps) {
  const router = useRouter();
  const { isInitializing } = useAuthInit();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userRoles = useAppSelector((state) => state.auth.user?.roles);
  const isAdmin = userRoles?.includes("ADMIN") ?? false;
  const { t } = useTranslation();

  const shouldShowForbidden = useMemo(
    () => !isInitializing && requireAdmin && isAuthenticated && !isAdmin,
    [isInitializing, requireAdmin, isAuthenticated, isAdmin]
  );

  useEffect(() => {
    // Only check auth after initialization is complete
    if (!isInitializing) {
      if (requireAuth && !isAuthenticated) {
        console.log(
          "[Auth Guard] User not authenticated, redirecting to:",
          redirectTo
        );
        router.push(redirectTo);
      } 
    }
  }, [
    isInitializing,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    router,
    redirectTo,
  ]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
          </div>
          <p className="text-sm font-light tracking-wider text-muted-foreground">
          {t("auth.verifyingAccess")}
          </p>
        </div>
      </div>
    );
  }

  // After initialization, check permissions
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (shouldShowForbidden) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}


