"use client";

import { useEffect } from "react";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useCartStore } from "@/lib/store/cartStore";

/**
 * Client component that initializes auth state on app load
 * This component should be placed inside ReduxProvider
 */
export function AuthInitProvider({ children }: { children: React.ReactNode }) {
  // This hook will fetch user profile if token exists but user data is missing
  const { isAuthenticated } = useAuthInit();

  // Sync cart state with auth state
  useEffect(() => {
    const cartStore = useCartStore.getState();

    if (isAuthenticated && !cartStore.isAuthenticated) {
      // User just logged in - merge guest cart
      const guestItems = [...cartStore.items];
      cartStore.setAuthenticated(true);

      if (guestItems.length > 0) {
        // Merge guest cart items
        cartStore.mergeGuestCart(guestItems);
        console.log("[Cart Sync] Merged guest cart on login:", guestItems);
      }
    } else if (!isAuthenticated && cartStore.isAuthenticated) {
      // User just logged out - clear auth flag but keep items as guest cart
      cartStore.setAuthenticated(false);
      console.log("[Cart Sync] User logged out - cart saved as guest cart");
    } else if (isAuthenticated) {
      // Already authenticated - just ensure flag is set
      cartStore.setAuthenticated(true);
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
