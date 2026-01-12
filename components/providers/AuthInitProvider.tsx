"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useCartStore } from "@/lib/store/cartStore";
import { useTranslation } from "react-i18next";

export function AuthInitProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuthInit();
  const hasMergedRef = useRef(false);
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync cart state with auth state
  useEffect(() => {
    if (isInitializing) return;

    const cartStore = useCartStore.getState();

    if (isAuthenticated && !cartStore.isAuthenticated) {
      if (!hasMergedRef.current) {
        const guestItems = [...cartStore.items];
        cartStore.setAuthenticated(true);

        if (guestItems.length > 0) {
          cartStore.mergeGuestCart(guestItems);
          console.log("[Cart Sync] Merged guest cart on login:", guestItems);
        }
        hasMergedRef.current = true;
      }
    } else if (!isAuthenticated && cartStore.isAuthenticated) {
      cartStore.setAuthenticated(false);
      hasMergedRef.current = false;
      console.log("[Cart Sync] User logged out - cart saved as guest cart");
    } else if (isAuthenticated) {
      cartStore.setAuthenticated(true);
      hasMergedRef.current = true;
    } else {
      hasMergedRef.current = false;
    }
  }, [isAuthenticated, isInitializing]);

  if (mounted && isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
            </div>
          <p className="text-sm font-light tracking-wider text-muted-foreground">
            {t("auth.loading")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
