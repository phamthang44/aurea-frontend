"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/utils/permissions";

/**
 * React hook for permission-based authorization checks.
 * Uses the current user's permissions from Redux store.
 *
 * @example
 * // Check single permission
 * const { can } = usePermission();
 * if (can("shop.product.create")) { ... }
 *
 * @example
 * // Check in component
 * const { canAny, canAll } = usePermission();
 * const canManageProducts = canAny(["shop.product.create", "shop.product.update"]);
 */
export function usePermission() {
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.permissions,
  );
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  /**
   * Check if user has a specific permission
   */
  const can = useMemo(
    () => (permission: string) => hasPermission(userPermissions, permission),
    [userPermissions],
  );

  /**
   * Check if user has ANY of the provided permissions
   */
  const canAny = useMemo(
    () => (permissions: string[]) =>
      hasAnyPermission(userPermissions, permissions),
    [userPermissions],
  );

  /**
   * Check if user has ALL of the provided permissions
   */
  const canAll = useMemo(
    () => (permissions: string[]) =>
      hasAllPermissions(userPermissions, permissions),
    [userPermissions],
  );

  /**
   * Check if user can access admin area
   * Returns true if user has any admin-level permission
   */
  const canAccessAdmin = useMemo(() => {
    if (!isAuthenticated || !userPermissions) return false;

    // Check for wildcard permissions or any admin-level permission
    return (
      hasPermission(userPermissions, "shop.product.view") ||
      hasPermission(userPermissions, "shop.order.view") ||
      hasPermission(userPermissions, "iam.user.view") ||
      hasPermission(userPermissions, "inventory.stock.view") ||
      hasAnyPermission(userPermissions, ["shop.*", "iam.*", "inventory.*", "*"])
    );
  }, [isAuthenticated, userPermissions]);

  return {
    permissions: userPermissions,
    isAuthenticated,
    can,
    canAny,
    canAll,
    canAccessAdmin,
  };
}

/**
 * Hook for checking a specific permission and returning boolean
 * Useful for simple conditional rendering
 *
 * @example
 * const canCreate = useCanAccess("shop.product.create");
 * {canCreate && <CreateButton />}
 */
export function useCanAccess(permission: string): boolean {
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.permissions,
  );
  return useMemo(
    () => hasPermission(userPermissions, permission),
    [userPermissions, permission],
  );
}

/**
 * Hook for checking multiple permissions (ANY)
 *
 * @example
 * const canManage = useCanAccessAny(["shop.product.create", "shop.product.update"]);
 */
export function useCanAccessAny(permissions: string[]): boolean {
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.permissions,
  );
  return useMemo(
    () => hasAnyPermission(userPermissions, permissions),
    [userPermissions, permissions],
  );
}
