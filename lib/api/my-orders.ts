/**
 * My Orders API Service
 * Handles fetching customer order history and details
 */

import fetchClient from "@/lib/fetch-client";

// ============================================================================
// Types
// ============================================================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "COD"
  | "BANK_TRANSFER"
  | "VN_PAY"
  | "MOMO"
  | "E_WALLET";

export interface OrderSummary {
  id: string;
  code: string;
  status: OrderStatus;
  finalAmount: number;
  totalItems: number;
  createdAt: string;
  firstProductThumbnail?: string;
  firstProductName?: string;
}

export interface OrderShippingAddress {
  recipientName: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  detailAddress: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  variantId: string;
  variantName?: string;
  variantAttributes?: {
    size?: string;
    color?: string;
  };
  thumbnail?: string;
  quantity: number;
  subtotal: number;
  sellingPrice: number;
  totalPrice: number;
}

export interface OrderDetail {
  id: string;
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  note?: string;
  contactEmail?: string;
}

export interface MyOrderSearchParams {
  page?: number;
  size?: number;
  status?: OrderStatus | "ALL";
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResult<T> {
  data?: T;
  meta?: PaginationMeta;
  error?: {
    message?: string;
    code?: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get current user's orders with filtering and pagination
 * GET /api/v1/me/orders
 */
export async function getMyOrders(
  params: MyOrderSearchParams = {},
): Promise<ApiResult<OrderSummary[]>> {
  const queryParams: Record<string, string | number | undefined> = {};

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.size !== undefined) queryParams.size = params.size;
  if (params.status && params.status !== "ALL")
    queryParams.status = params.status;
  if (params.sort) queryParams.sort = params.sort;

  return fetchClient.get<OrderSummary[]>("me/orders", {
    params: queryParams,
  });
}

/**
 * Get order detail by order code
 * GET /api/v1/me/orders/{orderCode}
 */
export async function getMyOrderDetail(
  orderCode: string,
): Promise<ApiResult<OrderDetail>> {
  return fetchClient.get<OrderDetail>(`me/orders/${orderCode}`);
}

/**
 * Cancel an order
 * POST /api/v1/me/orders/{orderCode}/cancel
 */
export async function cancelOrder(
  orderCode: string,
): Promise<ApiResult<{ success: boolean }>> {
  return fetchClient.post<{ success: boolean }>(
    `me/orders/${orderCode}/cancel`,
  );
}

// ============================================================================
// Export as default object for cleaner imports
// ============================================================================

export const myOrdersApi = {
  getMyOrders,
  getMyOrderDetail,
  cancelOrder,
};

export default myOrdersApi;
