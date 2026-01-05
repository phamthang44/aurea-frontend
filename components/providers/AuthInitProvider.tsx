"use client";

import { useEffect, useRef } from "react";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useCartStore } from "@/lib/store/cartStore";

/**
 * Client component that initializes auth state on app load
 * This component should be placed inside ReduxProvider
 * Shows loading overlay while auth is being initialized to prevent premature redirects
 */
export function AuthInitProvider({ children }: { children: React.ReactNode }) {
  // This hook will fetch user profile if token exists but user data is missing
  const { isAuthenticated, isInitializing } = useAuthInit();
  const hasMergedRef = useRef(false); // Track if we've already merged cart

  // Sync cart state with auth state
  useEffect(() => {
    // Skip if still initializing to avoid race conditions
    if (isInitializing) return;

    const cartStore = useCartStore.getState();

    if (isAuthenticated && !cartStore.isAuthenticated) {
      // User just logged in - merge guest cart
      // Only merge once to prevent duplicate items on refresh
      if (!hasMergedRef.current) {
        const guestItems = [...cartStore.items];
        cartStore.setAuthenticated(true);

        if (guestItems.length > 0) {
          // Merge guest cart items (only once on login transition)
          cartStore.mergeGuestCart(guestItems);
          console.log("[Cart Sync] Merged guest cart on login:", guestItems);
        }
        hasMergedRef.current = true;
      }
    } else if (!isAuthenticated && cartStore.isAuthenticated) {
      // User just logged out - clear auth flag but keep items as guest cart
      cartStore.setAuthenticated(false);
      hasMergedRef.current = false; // Reset merge flag on logout
      console.log("[Cart Sync] User logged out - cart saved as guest cart");
    } else if (isAuthenticated) {
      // Already authenticated - just ensure flag is set
      cartStore.setAuthenticated(true);
      // Reset merge flag if user is already authenticated (page refresh while logged in)
      hasMergedRef.current = true;
    } else {
      // Not authenticated - reset merge flag
      hasMergedRef.current = false;
    }
  }, [isAuthenticated, isInitializing]);

  // Show loading overlay while initializing auth state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Luxury spinner with gold color */}
            <div className="h-16 w-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
          </div>
          <p className="text-sm font-light tracking-wider text-muted-foreground">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
