/**
 * Order-related formatting utilities
 */

/**
 * Format currency to VND
 */
export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "0đ";
  }

  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(Number(amount))
      .replace(/,/g, ".") + "đ"
  );
}

/**
 * Format date to readable format (Vietnamese locale)
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date to short format
 */
export function formatDateShort(dateString: string | undefined | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Payment method labels
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
  VN_PAY: "VNPay",
  MOMO: "MoMo",
  E_WALLET: "E-Wallet",
};

/**
 * Get payment method display name
 */
export function getPaymentMethodLabel(
  method: string | undefined | null,
): string {
  if (!method) return "Unknown";
  return PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "text-emerald-600 dark:text-emerald-400",
  },
  UNPAID: {
    label: "Unpaid",
    className: "text-amber-600 dark:text-amber-400",
  },
  PENDING: {
    label: "Pending",
    className: "text-blue-600 dark:text-blue-400",
  },
  FAILED: {
    label: "Failed",
    className: "text-red-600 dark:text-red-400",
  },
  REFUNDED: {
    label: "Refunded",
    className: "text-gray-600 dark:text-gray-400",
  },
};

/**
 * Get payment status styling and label
 */
export function getPaymentStatusStyle(status: string | undefined | null): {
  label: string;
  className: string;
} {
  if (!status) return { label: "Unknown", className: "text-gray-600" };
  return (
    PAYMENT_STATUS_CONFIG[status] || {
      label: status,
      className: "text-gray-600",
    }
  );
}
