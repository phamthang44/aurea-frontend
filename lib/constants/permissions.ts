/**
 * Permission constants mirroring backend PermissionsConstants.java
 * Used for type-safe permission checks in frontend components.
 *
 * Structure: DOMAIN_RESOURCE_ACTION
 * Example: SHOP_PRODUCT_VIEW = "shop.product.view"
 */

export const PERMISSIONS = {
  // ==================== IAM ====================
  // User Management
  IAM_USER_VIEW: "iam.user.view",
  IAM_USER_CREATE: "iam.user.create",
  IAM_USER_UPDATE: "iam.user.update",
  IAM_USER_DELETE: "iam.user.delete",

  // Role Management
  IAM_ROLE_VIEW: "iam.role.view",
  IAM_ROLE_CREATE: "iam.role.create",
  IAM_ROLE_UPDATE: "iam.role.update",
  IAM_ROLE_DELETE: "iam.role.delete",
  IAM_ROLE_ASSIGN: "iam.role.assign",

  // Permission Management
  IAM_PERMISSION_VIEW: "iam.permission.view",
  IAM_PERMISSION_CREATE: "iam.permission.create",
  IAM_PERMISSION_UPDATE: "iam.permission.update",
  IAM_PERMISSION_DELETE: "iam.permission.delete",

  // ==================== FILE ====================
  FILE_VIEW: "file.view",
  FILE_UPLOAD: "file.upload",

  // ==================== SHOP ====================
  // Product
  SHOP_PRODUCT_VIEW: "shop.product.view",
  SHOP_PRODUCT_CREATE: "shop.product.create",
  SHOP_PRODUCT_UPDATE: "shop.product.update",
  SHOP_PRODUCT_DELETE: "shop.product.delete",

  // Category
  SHOP_CATEGORY_VIEW: "shop.category.view",
  SHOP_CATEGORY_CREATE: "shop.category.create",
  SHOP_CATEGORY_UPDATE: "shop.category.update",
  SHOP_CATEGORY_DELETE: "shop.category.delete",

  // Order
  SHOP_ORDER_VIEW: "shop.order.view",
  SHOP_ORDER_PROCESS: "shop.order.process",
  SHOP_ORDER_CANCEL: "shop.order.cancel",
  SHOP_ORDER_CREATE: "shop.order.create",

  // Report / Dashboard
  SHOP_DASHBOARD_VIEW: "shop.dashboard.view",
  SHOP_REVENUE_VIEW: "shop.revenue.view",
  SHOP_REPORT_EXPORT: "shop.report.export",

  // ==================== INVENTORY ====================
  // Stock
  INVENTORY_STOCK_VIEW: "inventory.stock.view",
  INVENTORY_STOCK_ALERT: "inventory.stock.alert",

  // Receipt
  INVENTORY_RECEIPT_VIEW: "inventory.receipt.view",
  INVENTORY_RECEIPT_CREATE: "inventory.receipt.create",
  INVENTORY_RECEIPT_APPROVE: "inventory.receipt.approve",

  // Supplier
  INVENTORY_SUPPLIER_VIEW: "inventory.supplier.view",
  INVENTORY_SUPPLIER_MANAGE: "inventory.supplier.manage",
} as const;

/**
 * Type for permission values
 */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Grouped permissions for convenience
 */
export const PERMISSION_GROUPS = {
  // Admin access - requires any admin-level permission
  ADMIN_ACCESS: [
    PERMISSIONS.SHOP_PRODUCT_VIEW,
    PERMISSIONS.SHOP_CATEGORY_VIEW,
    PERMISSIONS.SHOP_ORDER_VIEW,
    PERMISSIONS.IAM_USER_VIEW,
    PERMISSIONS.INVENTORY_STOCK_VIEW,
  ],

  // Product management
  PRODUCT_MANAGEMENT: [
    PERMISSIONS.SHOP_PRODUCT_VIEW,
    PERMISSIONS.SHOP_PRODUCT_CREATE,
    PERMISSIONS.SHOP_PRODUCT_UPDATE,
    PERMISSIONS.SHOP_PRODUCT_DELETE,
  ],

  // Order management
  ORDER_MANAGEMENT: [
    PERMISSIONS.SHOP_ORDER_VIEW,
    PERMISSIONS.SHOP_ORDER_PROCESS,
    PERMISSIONS.SHOP_ORDER_CANCEL,
  ],

  // User management
  USER_MANAGEMENT: [
    PERMISSIONS.IAM_USER_VIEW,
    PERMISSIONS.IAM_USER_CREATE,
    PERMISSIONS.IAM_USER_UPDATE,
    PERMISSIONS.IAM_USER_DELETE,
  ],

  // Inventory management
  INVENTORY_MANAGEMENT: [
    PERMISSIONS.INVENTORY_STOCK_VIEW,
    PERMISSIONS.INVENTORY_RECEIPT_VIEW,
    PERMISSIONS.INVENTORY_RECEIPT_CREATE,
    PERMISSIONS.INVENTORY_RECEIPT_APPROVE,
  ],
} as const;
