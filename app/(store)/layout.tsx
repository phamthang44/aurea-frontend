'use client';

import { StoreProvider } from '@/lib/context/StoreContext';
import { aureaStore } from '@/config/stores/aurea';
import { CartProvider } from '@/components/providers/CartProvider';

export default function AureaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider store={aureaStore}>
      <CartProvider>
        {children}
      </CartProvider>
    </StoreProvider>
  );
}


