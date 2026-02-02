/**
 * Cart API - Unified cart operations for both User and Guest
 * All endpoints automatically handle X-Guest-ID and Authorization headers via fetch client
 */

import fetchClient from "@/lib/fetch-client";

/**
 * Cart Item Response from backend
 */
export interface CartItemResponse {
  id: number;
  productId: number;
  productVariantId: number;
  quantity: number;
  // Enriched fields from backend
  productName?: string;
  price?: number;
  thumbnail?: string;
  sku?: string;
  availableStock?: number;
  stockStatus?: string;
  subtotalPrice?: number; // Calculated subtotal for this item (price * quantity)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Cart Response from backend
 * All pricing calculations are done by the backend including promotions
 */
export interface CartResponse {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItemResponse[];
  // Promotion & Calculation fields (calculated by backend)
  subTotal?: number; // Sum of all item subtotals
  shippingFee?: number; // Shipping fee (calculated by promotion service)
  discount?: number; // Discount amount (calculated by promotion service)
  finalTotalPrice?: number; // Final total: subTotal + shippingFee - discount
  promotionNote?: string; // Promotion description/note
  createdAt?: string;
  updatedAt?: string;
  // Deprecated: Use finalTotalPrice instead
  totalAmount?: number;
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

/**
 * Add to Cart Request
 * IDs are strings to safely handle large numbers (JavaScript Number.MAX_SAFE_INTEGER limit)
 */
export interface AddToCartRequest {
  productId: string;
  productVariantId: string;
  quantity: number;
}

/**
 * Update Cart Item Request
 */
export interface UpdateCartItemRequest {
  quantity: number;
}

/**
 * Get the current cart (for both User and Guest)
 * Backend automatically handles merge logic when both userId and guestId are present
 * @returns Cart response with enriched product details
 */
export async function getMyCart(): Promise<ApiResponse<CartResponse>> {
  return fetchClient.get<CartResponse>("carts");
}

/**
 * Add an item to the cart
 * Works for both authenticated users and guests
 * @param data - Add to cart request data
 * @returns Updated cart response
 */
export async function addToCart(
  data: AddToCartRequest,
): Promise<ApiResponse<CartResponse>> {
  return fetchClient.post<CartResponse>("carts/items", data);
}

/**
 * Update a cart item quantity
 * @param id - Cart item ID
 * @param quantity - New quantity
 * @returns Updated cart response
 */
export async function updateItem(
  id: number,
  quantity: number,
): Promise<ApiResponse<CartResponse>> {
  return fetchClient.put<CartResponse>(`carts/items/${id}`, { quantity });
}

/**
 * Remove an item from the cart
 * @param id - Cart item ID
 * @returns Updated cart response
 */
export async function removeItem(
  id: number,
): Promise<ApiResponse<CartResponse>> {
  return fetchClient.delete<CartResponse>(`carts/items/${id}`);
}

/**
 * Remove all items from the cart
 * Works for both authenticated users and guests
 * @returns Updated cart response (empty cart)
 */
export async function removeAllItems(): Promise<ApiResponse<CartResponse>> {
  return fetchClient.delete<CartResponse>("carts/items");
}

/**
 * Apply promotion code to the cart
 * Works for both authenticated users and guests
 * @param promotionCode - Promotion code to apply
 * @returns Updated cart response with applied promotion
 */
export async function applyPromotionCode(
  promotionCode: string,
): Promise<ApiResponse<CartResponse>> {
  return fetchClient.put<CartResponse>("carts/promotion", { promotionCode });
}
