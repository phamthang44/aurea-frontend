"use client";

import { useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useTranslation } from "react-i18next";
import { ForbiddenPage } from "@/components/errors/Forbidden";
import { hasPermission, hasAnyPermission } from "@/lib/utils/permissions";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  /** @deprecated Use requiredPermission instead */
  requireAdmin?: boolean;
  /** Single permission required to access this route */
  requiredPermission?: string;
  /** Multiple permissions - user needs ANY of these to access */
  requiredPermissions?: string[];
  redirectTo?: string;
}

/**
 * Component to guard routes that require authentication and/or specific permissions.
 * Supports permission-based authorization with wildcard matching.
 *
 * @example
 * // Require authentication only
 * <AuthGuard requireAuth={true}>{children}</AuthGuard>
 *
 * @example
 * // Require specific permission
 * <AuthGuard requiredPermission="shop.product.view">{children}</AuthGuard>
 *
 * @example
 * // Require any of multiple permissions
 * <AuthGuard requiredPermissions={["shop.product.view", "shop.order.view"]}>{children}</AuthGuard>
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requiredPermission,
  requiredPermissions,
  redirectTo = "/auth",
}: AuthGuardProps) {
  const router = useRouter();
  const { isInitializing } = useAuthInit();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.permissions,
  );
  const userRoles = useAppSelector((state) => state.auth.user?.roles);
  const { t } = useTranslation();

  // Permission check logic
  const hasRequiredPermission = useMemo(() => {
    // If no permission requirements, always pass
    if (!requiredPermission && !requiredPermissions && !requireAdmin) {
      return true;
    }

    // Legacy: requireAdmin support (backward compatibility)
    // Check if user has any admin-level permission
    if (requireAdmin) {
      // First try permissions-based check
      if (userPermissions && userPermissions.length > 0) {
        return hasAnyPermission(userPermissions, [
          "shop.*",
          "iam.*",
          "inventory.*",
          "*",
          "shop.product.view",
          "shop.order.view",
          "iam.user.view",
        ]);
      }
      // Fallback to role-based check for backward compatibility
      return userRoles?.includes("ADMIN") ?? false;
    }

    // New: permission-based check
    if (requiredPermission) {
      return hasPermission(userPermissions, requiredPermission);
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      return hasAnyPermission(userPermissions, requiredPermissions);
    }

    return true;
  }, [
    userPermissions,
    userRoles,
    requiredPermission,
    requiredPermissions,
    requireAdmin,
  ]);

  const shouldShowForbidden = useMemo(
    () => !isInitializing && isAuthenticated && !hasRequiredPermission,
    [isInitializing, isAuthenticated, hasRequiredPermission],
  );

  useEffect(() => {
    // Only check auth after initialization is complete
    if (!isInitializing) {
      if (requireAuth && !isAuthenticated) {
        console.log(
          "[Auth Guard] User not authenticated, redirecting to:",
          redirectTo,
        );
        router.push(redirectTo);
      }
    }
  }, [
    isInitializing,
    isAuthenticated,
    hasRequiredPermission,
    requireAuth,
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
