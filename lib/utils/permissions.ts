/**
 * Permission utility functions with wildcard support.
 * Mirrors backend SecurityP.java wildcard matching logic.
 *
 * Wildcard Rules:
 * 1. "*" → GOD MODE, matches everything
 * 2. "shop.*" → matches any permission starting with "shop."
 * 3. Exact match → "shop.product.view" === "shop.product.view"
 */

/**
 * Check if a user permission matches a required permission.
 * Supports wildcard matching.
 *
 * @param userPerm - The permission the user has (may contain wildcards)
 * @param required - The specific permission required
 * @returns true if the user permission grants access to the required permission
 */
function matchesPermission(userPerm: string, required: string): boolean {
  // 1. Super Admin / God Mode
  if (userPerm === "*") {
    return true;
  }

  // 2. Exact Match
  if (userPerm === required) {
    return true;
  }

  // 3. Wildcard Logic: "shop.*" matches "shop.product.create"
  if (userPerm.endsWith(".*")) {
    const prefix = userPerm.slice(0, -2); // Remove ".*" → "shop"
    // Ensure prefix + "." to handle "shop" vs "shopify" edge case
    return required.startsWith(prefix + ".");
  }

  return false;
}

/**
 * Check if the user has the required permission.
 * Supports wildcard matching on user permissions.
 *
 * @param userPermissions - Array of permissions the user has
 * @param required - The specific permission required
 * @returns true if authorized, false otherwise
 *
 * @example
 * hasPermission(["shop.*"], "shop.product.create") // true
 * hasPermission(["shop.product.view"], "shop.product.create") // false
 * hasPermission(["*"], "anything") // true
 */
export function hasPermission(
  userPermissions: string[] | undefined | null,
  required: string,
): boolean {
  if (!required || required.trim() === "") {
    return false;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return userPermissions.some((userPerm) =>
    matchesPermission(userPerm, required),
  );
}

/**
 * Check if the user has ANY of the required permissions.
 * Supports wildcard matching on user permissions.
 *
 * @param userPermissions - Array of permissions the user has
 * @param required - Array of permissions to check (OR logic)
 * @returns true if at least one permission is granted
 *
 * @example
 * hasAnyPermission(["shop.product.view"], ["shop.product.view", "shop.order.view"]) // true
 * hasAnyPermission(["shop.*"], ["inventory.stock.view"]) // false
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined | null,
  required: string[],
): boolean {
  if (!required || required.length === 0) {
    return false;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return required.some((req) => hasPermission(userPermissions, req));
}

/**
 * Check if the user has ALL of the required permissions.
 * Supports wildcard matching on user permissions.
 *
 * @param userPermissions - Array of permissions the user has
 * @param required - Array of permissions to check (AND logic)
 * @returns true if all permissions are granted
 *
 * @example
 * hasAllPermissions(["shop.*"], ["shop.product.view", "shop.order.view"]) // true
 * hasAllPermissions(["shop.product.view"], ["shop.product.view", "shop.order.view"]) // false
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined | null,
  required: string[],
): boolean {
  if (!required || required.length === 0) {
    return true; // No requirements means access granted
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return required.every((req) => hasPermission(userPermissions, req));
}
