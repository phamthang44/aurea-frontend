/**
 * My Orders API Service
 * Handles fetching customer order history and details
 */

import apiClient from "@/lib/api-client";

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
  size?: string;
  color?: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
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
 * Get current user's orders with filtering and pagination
 * GET /api/v1/me/orders
 */
export async function getMyOrders(
  params: MyOrderSearchParams = {}
): Promise<ApiResult<PaginatedResponse<OrderSummary>>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append("size", params.size.toString());
    }
    // Backend expects UPPERCASE enum constant names for query params: PENDING, CONFIRMED, SHIPPING, etc.
    // Note: Spring binds query params to enum constant names, not @JsonValue
    if (params.status && params.status !== "ALL") {
      queryParams.append("status", params.status);
    }
    // Backend expects sort values: newest, oldest, total_asc, total_desc, last_updated, status
    if (params.sort) {
      queryParams.append("sort", params.sort);
    }

    const query = queryParams.toString();
    const response = await apiClient.get<PaginatedResponse<OrderSummary>>(
      `me/orders${query ? `?${query}` : ""}`
    );

    return response;
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
 * Get order detail by order code
 * GET /api/v1/me/orders/{orderCode}
 */
export async function getMyOrderDetail(
  orderCode: string
): Promise<ApiResult<OrderDetail>> {
  try {
    const response = await apiClient.get<OrderDetail>(`me/orders/${orderCode}`);
    return response;
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.error?.message || "Failed to fetch order detail",
        code: error.response?.data?.error?.code,
      },
    };
  }
}

/**
 * Cancel an order
 * POST /api/v1/me/orders/{orderCode}/cancel
 */
export async function cancelOrder(
  orderCode: string
): Promise<ApiResult<{ success: boolean }>> {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      `me/orders/${orderCode}/cancel`
    );
    return response;
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.error?.message || "Failed to cancel order",
        code: error.response?.data?.error?.code,
      },
    };
  }
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
