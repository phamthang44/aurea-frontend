"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getMyCart,
  addToCart,
  updateItem,
  removeItem,
  removeAllItems,
  applyPromotionCode,
  CartResponse,
  CartItemResponse,
  PromotionSummary,
} from "@/lib/api/cart";
import { useAppSelector } from "@/lib/store/hooks";
import { useTranslation } from "react-i18next";

/**
 * Cart state interface
 * All pricing calculations are provided by the backend
 */
interface CartState {
  items: CartItemResponse[];
  // Pricing fields (calculated by backend)
  subTotal?: number;
  shippingFee?: number;
  discount?: number;
  finalTotalPrice?: number;
  promotion?: PromotionSummary;
  promotionNote?: string;
  promotionCode?: string; // Applied promotion code
  // Deprecated: Use finalTotalPrice instead, kept for backward compatibility
  totalAmount: number;
  loading: boolean;
  error: string | null;
  cartId: number | null;
  userId: string | null;
  sessionId: string | null;
}

/**
 * Cart context interface
 */
interface CartContextType extends CartState {
  fetchCart: () => Promise<void>;
  syncCartAfterLogin: () => Promise<void>;
  addItemToCart: (data: {
    productId: number | string;
    productVariantId: number | string;
    quantity: number;
  }) => Promise<CartResponse | null>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  removeAllCartItems: () => Promise<void>;
  applyPromotionCode: (code: string) => Promise<CartResponse | null>;
  clearError: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Sort cart items by a stable field to preserve order
 * Uses createdAt if available, otherwise falls back to id
 * This prevents items from jumping around when their quantity is updated
 */
function sortCartItems(items: CartItemResponse[]): CartItemResponse[] {
  return [...items].sort((a, b) => {
    // First try to sort by createdAt (when item was added to cart)
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    // Fall back to id for stable ordering
    return a.id - b.id;
  });
}

/**
 * Cart Provider Component
 * Provides shared cart state to all child components
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const prevAuthenticatedRef = React.useRef<boolean | null>(null);
  const [state, setState] = useState<CartState>({
    items: [],
    subTotal: 0,
    shippingFee: 0,
    discount: 0,
    finalTotalPrice: 0,
    promotion: undefined,
    promotionNote: undefined,
    promotionCode: undefined,
    totalAmount: 0,
    loading: false,
    error: null,
    cartId: null,
    userId: null,
    sessionId: null,
  });

  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    // Initialize the ref with current auth state after mount
    prevAuthenticatedRef.current = isAuthenticated;
  }, []);

  /**
   * Fetch cart from backend
   */
  const fetchCart = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getMyCart();

      if (response.error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error?.message || "Failed to fetch cart",
        }));
        return;
      }

      if (response.data) {
        // fetch-client already unwraps ApiResult<T>.data
        const cart = response.data as CartResponse;

        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

          // Use backend-provided values (all calculations done by backend)
          const promotion = cart.promotion;
          const normalizedPromotionNote = promotion?.message?.trim() || undefined;
          // Preserve promotionCode if applied or if metadata exists (e.g. for expired codes)
          const appliedCode = promotion?.applied ? promotion.promoCode : (promotion?.promoCode || undefined);
        
          setState((prev) => ({
          items: sortCartItems(cart.items || []),
          subTotal: cart.subTotal ?? 0,
          shippingFee: cart.shippingFee ?? 0,
          discount: cart.discount ?? 0,
          finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
          promotion: promotion,
          promotionNote: normalizedPromotionNote,
          promotionCode: appliedCode,
          totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
          loading: false,
          error: null,
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch cart",
      }));
    }
  }, []);

  /**
   * Sync cart after login
   */
  const syncCartAfterLogin = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  /**
   * Add item to cart
   */
  const addItemToCart = useCallback(
    async (data: {
      productId: number | string;
      productVariantId: number | string;
      quantity: number;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await addToCart({
          productId: String(data.productId),
          productVariantId: String(data.productVariantId),
          quantity: data.quantity,
        });

        if (response.error) {
          const errorMessage = response.error?.message || "Failed to add item to cart";
          // Keep the state error simple for now, or use the full message
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          
          // Throw error with code so UI can handle i18n
          const error = new Error(errorMessage) as Error & { code?: string };
          if (response.error.code) {
             error.code = response.error.code;
          }
          throw error;
        }

        if (response.data) {
          const cart = response.data as CartResponse;
          if (!cart) {
            const errorMessage = "Invalid cart response format";
            setState((prev) => ({
              ...prev,
              loading: false,
              error: errorMessage,
            }));
            throw new Error(errorMessage);
          }

          // Use backend-provided values (all calculations done by backend)
          const promotion = cart.promotion;
          const normalizedPromotionNote = promotion?.message?.trim() || undefined;
          const appliedCode = promotion?.applied ? promotion.promoCode : undefined;
          
          setState((prev) => ({
            items: sortCartItems(cart.items || []),
            subTotal: cart.subTotal ?? 0,
            shippingFee: cart.shippingFee ?? 0,
            discount: cart.discount ?? 0,
            finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
            promotion: promotion,
            promotionNote: normalizedPromotionNote,
            // Preserve promotionCode if applied or if metadata exists
            promotionCode: appliedCode,
            totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
            loading: false,
            error: null,
            cartId: cart.id,
            userId: cart.userId || null,
            sessionId: cart.sessionId || null,
          }));

          return cart;
        }

        throw new Error("No data received from server");
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to add item to cart",
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(
    async (cartItemId: number, quantity: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await updateItem(cartItemId, quantity);

        if (response.error) {
          const errorMessage = response.error?.message || "Failed to update cart item";
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          const error = new Error(errorMessage) as Error & { code?: string };
          if (response.error.code) error.code = response.error.code;
          throw error;
        }

        if (response.data) {
          const cart = response.data as CartResponse;
          if (!cart) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Invalid cart response format",
            }));
            return;
          }

          // Use backend-provided values (all calculations done by backend)
          const promotion = cart.promotion;
          const normalizedPromotionNote = promotion?.message?.trim() || undefined;
          const appliedCode = promotion?.applied ? promotion.promoCode : undefined;
          
          setState((prev) => ({
            items: sortCartItems(cart.items || []),
            subTotal: cart.subTotal ?? 0,
            shippingFee: cart.shippingFee ?? 0,
            discount: cart.discount ?? 0,
            finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
            promotion: promotion,
            promotionNote: normalizedPromotionNote,
            // Preserve promotionCode if applied or if metadata exists
            promotionCode: appliedCode,
            totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
            loading: false,
            error: null,
            cartId: cart.id,
            userId: cart.userId || null,
            sessionId: cart.sessionId || null,
          }));
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to update cart item",
        }));
      }
    },
    []
  );

  /**
   * Remove item from cart
   */
  const removeCartItem = useCallback(async (cartItemId: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await removeItem(cartItemId);

      if (response.error) {
        const errorMessage = response.error?.message || "Failed to remove item from cart";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        const error = new Error(errorMessage) as Error & { code?: string };
        if (response.error.code) error.code = response.error.code;
        throw error;
      }

      if (response.data) {
        const cart = response.data as CartResponse;
        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

        // Use backend-provided values (all calculations done by backend)
        const promotion = cart.promotion;
        const normalizedPromotionNote = promotion?.message?.trim() || undefined;
        // Preserve promotionCode if applied or if metadata exists
        const appliedCode = promotion?.applied ? promotion.promoCode : (promotion?.promoCode || undefined);
        
        setState((prev) => ({
          items: sortCartItems(cart.items || []),
          subTotal: cart.subTotal ?? 0,
          shippingFee: cart.shippingFee ?? 0,
          discount: cart.discount ?? 0,
          finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
          promotion: promotion,
          promotionNote: normalizedPromotionNote,
          promotionCode: appliedCode,
          totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
          loading: false,
          error: null,  
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to remove item from cart",
      }));
    }
  }, []);

  /**
   * Remove all items from cart
   */
  const removeAllCartItems = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await removeAllItems();

      if (response.error) {
        const errorMessage = response.error?.message || "Failed to remove all items from cart";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        const error = new Error(errorMessage) as Error & { code?: string };
        if (response.error.code) error.code = response.error.code;
        throw error;
      }

      if (response.data) {
        const cart = response.data as CartResponse;
        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

        // Use backend-provided values (all calculations done by backend)
        const promotion = cart.promotion;
        const normalizedPromotionNote = promotion?.message?.trim() || undefined;
        // Preserve promotionCode if applied or if metadata exists
        const appliedCode = promotion?.applied ? promotion.promoCode : (promotion?.promoCode || undefined);
        
        setState((prev) => ({
          items: sortCartItems(cart.items || []),
          subTotal: cart.subTotal ?? 0,
          shippingFee: cart.shippingFee ?? 0,
          discount: cart.discount ?? 0,
          finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
          promotion: promotion,
          promotionNote: normalizedPromotionNote,
          promotionCode: appliedCode,
          totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
          loading: false,
          error: null,
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to remove all items from cart",
      }));
    }
  }, []);

  /**
   * Apply promotion code to cart
   */
  const applyPromotionCodeToCart = useCallback(
    async (code: string): Promise<CartResponse | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await applyPromotionCode(code);

        if (response.error) {
          const errorMessage = response.error?.message || "Failed to apply promotion code";
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          
          const error = new Error(errorMessage) as Error & { code?: string };
          if (response.error.code) {
             error.code = response.error.code;
          }
          throw error;
        }

        if (response.data) {
          const cart = response.data as CartResponse;
          if (!cart) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Invalid cart response format",
            }));
            return null;
          }

          // Use backend-provided values (all calculations done by backend)
          const promotion = cart.promotion;
          const normalizedPromotionNote = promotion?.message?.trim() || undefined;
          const appliedCode = promotion?.promoCode || undefined;

          setState({
            items: sortCartItems(cart.items || []),
            subTotal: cart.subTotal ?? 0,
            shippingFee: cart.shippingFee ?? 0,
            discount: cart.discount ?? 0,
            finalTotalPrice: cart.finalTotalPrice ?? cart.totalAmount ?? 0,
            promotion: promotion,
            promotionNote: normalizedPromotionNote,
            promotionCode: appliedCode, // Only set if applied successfully
            totalAmount: cart.finalTotalPrice ?? cart.totalAmount ?? 0, // For backward compatibility
            loading: false,
            error: null,
            cartId: cart.id,
            userId: cart.userId || null,
            sessionId: cart.sessionId || null,
          });

          return cart;
        }
        return null;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to apply promotion code",
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear cart state completely
   * Used when user logs out to prevent cart data from persisting to next user
   */
  const clearCart = useCallback(() => {
    setState({
      items: [],
      subTotal: 0,
      shippingFee: 0,
      discount: 0,
      finalTotalPrice: 0,
      promotion: undefined,
      promotionNote: undefined,
      promotionCode: undefined,
      totalAmount: 0,
      loading: false,
      error: null,
      cartId: null,
      userId: null,
      sessionId: null,
    });
  }, []);

  // Clear cart when user logs out (transitioning from authenticated to unauthenticated)
  useEffect(() => {
    if (!mounted) return;
    
    // Only clear cart when transitioning from authenticated to unauthenticated
    // This prevents clearing guest carts on initial page load
    if (prevAuthenticatedRef.current === true && !isAuthenticated) {
      // User just logged out - clear cart state to prevent data leakage to next user
      clearCart();
    }
    
    // Update the ref to track current auth state
    prevAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, mounted, clearCart]);

  // Fetch cart on mount and when auth state changes (only after mounted to avoid hydration issues)
  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated, mounted]);

  // Refetch cart when language changes to get updated promotion note (only after mounted)
  useEffect(() => {
    if (!mounted) return;

    const handleLanguageChange = (lng: string) => {
      // Use requestAnimationFrame to ensure i18n.language is fully updated and
      // the API client interceptor will read the correct language
      requestAnimationFrame(() => {
        // Double-check the language is actually updated before refetching
        // This ensures the Accept-Language header will have the correct value
        if (i18n.language === lng || i18n.resolvedLanguage === lng) {
          fetchCart();
        } else {
          // If language hasn't updated yet, wait a bit more
          setTimeout(() => {
            fetchCart();
          }, 50);
        }
      });
    };

    // Listen for language changes
    i18n.on("languageChanged", handleLanguageChange);

    // Cleanup listener on unmount
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, fetchCart, mounted]);

  const value: CartContextType = {
    ...state,
    fetchCart,
    syncCartAfterLogin,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    removeAllCartItems,
    applyPromotionCode: applyPromotionCodeToCart,
    clearError,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart Hook
 * Provides access to shared cart state and operations
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

/**
 * useCartOptional Hook
 * Same as useCart but returns null when used outside CartProvider
 * Useful for components that may be rendered in contexts without CartProvider
 */
export function useCartOptional() {
  return useContext(CartContext) ?? null;
}
