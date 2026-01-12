/**
 * Order API Service
 * Handles order creation and management
 */

import apiClient from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VN_PAY" | "MOMO" | "E_WALLET";

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED" | "RETURNED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface AddressRequest {
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  districtName: string;
  detailAddress: string;
}

export interface OrderCreateRequest {
  promoCode?: string;
  contactEmail: string;
  address: AddressRequest;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface PaymentInfoResponse {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentUrl?: string;
  transferContent?: string;
  qrCodeUrl?: string;
  bankAccountInfo?: string;
  expiredAt?: string; // ISO 8601 date string
}

export interface OrderCreationResponse {
  orderId: string; // Used internally for database queries (TSID format)
  orderCode: string; // Displayed to customers (e.g., "ORD-123456")
  status: OrderStatus;
  totalAmount: number;
  itemSummary: string;
  paymentInfo: PaymentInfoResponse;
}

export interface ApiResult<T> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new order
 * POST /api/v1/orders
 *
 * @param request Order creation request
 * @returns Order creation response with payment info
 *
 * @example
 * ```ts
 * const result = await orderApi.createOrder({
 *   contactEmail: "user@example.com",
 *   address: {
 *     recipientName: "Nguyá»…n VÄƒn A",
 *     phone: "0901234567",
 *     provinceCode: "79",
 *     provinceName: "ThÃ nh phá»‘ Há»“ ChÃ­ Minh",
 *     wardCode: "27307",
 *     wardName: "PhÆ°á»ng Báº¿n NghÃ©",
 *     districtName: "Quáº­n 1",
 *     detailAddress: "123 ÄÆ°á»ng Nguyá»…n Huá»‡"
 *   },
 *   paymentMethod: "COD",
 *   note: "Giao giá» hÃ nh chÃ­nh"
 * });
 * ```
 */
export async function createOrder(
  request: OrderCreateRequest
): Promise<ApiResult<OrderCreationResponse>> {
  try {
    return await apiClient.post<OrderCreationResponse>("orders", request);
  } catch (error: any) {
    return {
      error: {
        message:
          error.response?.data?.error?.message || "Failed to create order",
        code: error.response?.data?.error?.code,
      },
    };
  }
}

// ============================================================================
// Export as default object for cleaner imports
// ============================================================================

export const orderApi = {
  createOrder,
};

export default orderApi;




