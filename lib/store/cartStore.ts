import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  brand?: string;
}

interface CartState {
  items: CartItem[];
  isAuthenticated: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setAuthenticated: (isAuth: boolean) => void;
  mergeGuestCart: (guestItems: CartItem[]) => void;
  syncToServer: () => Promise<void>;
}

const CART_STORAGE_KEY = 'aurea-guest-cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false,

      addItem: (item) => {
        const state = get();
        if (state.isAuthenticated) {
          // If authenticated, sync to server immediately
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);
            const newItems = existingItem
              ? state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...state.items, item];
            return { items: newItems };
          });
          // Sync to server in background
          get().syncToServer();
        } else {
          // Guest mode: save to localStorage only
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);
            const newItems = existingItem
              ? state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...state.items, item];
            return { items: newItems };
          });
        }
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
        if (get().isAuthenticated) {
          get().syncToServer();
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
        if (get().isAuthenticated) {
          get().syncToServer();
        }
      },

      clearCart: () => {
        set({ items: [] });
        if (get().isAuthenticated) {
          get().syncToServer();
        }
      },

      setAuthenticated: (isAuth) => {
        set({ isAuthenticated: isAuth });
      },

      mergeGuestCart: async (guestItems) => {
        if (guestItems.length === 0) return;
        
        // Merge guest items into current cart
        set((state) => {
          const mergedItems = [...state.items];
          guestItems.forEach((guestItem) => {
            const existingItem = mergedItems.find((i) => i.id === guestItem.id);
            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              mergedItems.push(guestItem);
            }
          });
          return { items: mergedItems };
        });

        // Sync merged cart to server
        await get().syncToServer();
      },

      syncToServer: async () => {
        // TODO: Implement API call to sync cart to backend
        // This will be called when user is authenticated
        const state = get();
        if (!state.isAuthenticated) return;
        
        try {
          // Example API call structure:
          // await fetch('/api/proxy/cart', {
          //   method: 'PUT',
          //   body: JSON.stringify({ items: state.items }),
          // });
          console.log('Syncing cart to server:', state.items);
        } catch (error) {
          console.error('Failed to sync cart to server:', error);
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items, isAuthenticated: false }), // Only persist items, not auth state
    }
  )
);

