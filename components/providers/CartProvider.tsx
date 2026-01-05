"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getMyCart,
  addToCart,
  updateItem,
  removeItem,
  removeAllItems,
  CartResponse,
  CartItemResponse,
} from "@/lib/api/cart";
import { useAppSelector } from "@/lib/store/hooks";

/**
 * Cart state interface
 */
interface CartState {
  items: CartItemResponse[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
  cartId: number | null;
  userId: number | null;
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
  }) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  removeAllCartItems: () => Promise<void>;
  clearError: () => void;
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
  const [state, setState] = useState<CartState>({
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
    cartId: null,
    userId: null,
    sessionId: null,
  });

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
        // Backend returns ApiResult<CartResponse>
        const cart = (response.data as any).data as CartResponse;

        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

        // Calculate total amount if not provided by backend
        const total =
          cart.totalAmount ||
          cart.items.reduce(
            (sum: number, item: CartItemResponse) =>
              sum + (item.price || 0) * item.quantity,
            0
          );

        setState({
          items: sortCartItems(cart.items || []),
          totalAmount: total,
          loading: false,
          error: null,
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        });
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
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.error?.message || "Failed to add item to cart",
          }));
          return;
        }

        if (response.data) {
          const cart = (response.data as any).data as CartResponse;
          if (!cart) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Invalid cart response format",
            }));
            return;
          }

          const total =
            cart.totalAmount ||
            cart.items.reduce(
              (sum: number, item: CartItemResponse) =>
                sum + (item.price || 0) * item.quantity,
              0
            );

          setState({
            items: sortCartItems(cart.items || []),
            totalAmount: total,
            loading: false,
            error: null,
            cartId: cart.id,
            userId: cart.userId || null,
            sessionId: cart.sessionId || null,
          });
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to add item to cart",
        }));
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
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.error?.message || "Failed to update cart item",
          }));
          return;
        }

        if (response.data) {
          const cart = (response.data as any).data as CartResponse;
          if (!cart) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Invalid cart response format",
            }));
            return;
          }

          const total =
            cart.totalAmount ||
            cart.items.reduce(
              (sum: number, item: CartItemResponse) =>
                sum + (item.price || 0) * item.quantity,
              0
            );

          setState({
            items: sortCartItems(cart.items || []),
            totalAmount: total,
            loading: false,
            error: null,
            cartId: cart.id,
            userId: cart.userId || null,
            sessionId: cart.sessionId || null,
          });
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
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error?.message || "Failed to remove item from cart",
        }));
        return;
      }

      if (response.data) {
        const cart = (response.data as any).data as CartResponse;
        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

        const total =
          cart.totalAmount ||
          cart.items.reduce(
            (sum: number, item: CartItemResponse) =>
              sum + (item.price || 0) * item.quantity,
            0
          );

        setState({
          items: sortCartItems(cart.items || []),
          totalAmount: total,
          loading: false,
          error: null,
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        });
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
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            response.error?.message || "Failed to remove all items from cart",
        }));
        return;
      }

      if (response.data) {
        const cart = (response.data as any).data as CartResponse;
        if (!cart) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid cart response format",
          }));
          return;
        }

        const total =
          cart.totalAmount ||
          cart.items.reduce(
            (sum: number, item: CartItemResponse) =>
              sum + (item.price || 0) * item.quantity,
            0
          );

        setState({
          items: sortCartItems(cart.items || []),
          totalAmount: total,
          loading: false,
          error: null,
          cartId: cart.id,
          userId: cart.userId || null,
          sessionId: cart.sessionId || null,
        });
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
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

  const value: CartContextType = {
    ...state,
    fetchCart,
    syncCartAfterLogin,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    removeAllCartItems,
    clearError,
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

