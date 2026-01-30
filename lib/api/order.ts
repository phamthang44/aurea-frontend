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

export interface OrderSummaryResponse {
  id: number;
  code: string;
  status: OrderStatus;
  finalAmount: number;
  createdAt: string;
  totalItems: number;
  firstProductThumbnail?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  variantId: number;
  sku: string;
  productName: string;
  thumbnailUrl?: string;
  variantAttributes: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddressSnapshot {
  recipientName: string;
  phone: string;
  fullAddress: string;
  provinceCode: string;
  provinceName: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  detailAddress: string;
}

export interface OrderDetailResponse {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItemResponse[];
  paymentInfo: PaymentInfoResponse;
}

export interface MyOrderSearchRequest {
  status?: OrderStatus;
  sort?: string;
  page?: number;
  size?: number;
}

export interface ApiResult<T> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages?: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new order
 * POST /api/v1/me/orders
 *
 * @param request Order creation request
 * @returns Order creation response with payment info
 */
export async function createOrder(
  request: OrderCreateRequest
): Promise<ApiResult<OrderCreationResponse>> {
  try {
    // API updated to /me/orders based on MyOrderController.java
    return await apiClient.post<OrderCreationResponse>("me/orders", request);
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

/**
 * Get current user's orders
 * GET /api/v1/me/orders
 */
export async function getMyOrders(
  params: MyOrderSearchRequest = {}
): Promise<ApiResult<OrderSummaryResponse[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.size !== undefined) queryParams.append("size", params.size.toString());

    const query = queryParams.toString();
    return await apiClient.get<OrderSummaryResponse[]>(`me/orders${query ? `?${query}` : ""}`);
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.error?.message || "Failed to fetch orders",
        code: error.response?.data?.error?.code,
      },
    };
  }
}

/**
 * Get order detail by code
 * GET /api/v1/me/orders/{orderCode}
 */
export async function getOrderDetails(orderCode: string): Promise<ApiResult<OrderDetailResponse>> {
  try {
    return await apiClient.get<OrderDetailResponse>(`me/orders/${orderCode}`);
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.error?.message || "Failed to fetch order details",
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
  getMyOrders,
  getOrderDetails,
};

export default orderApi;
