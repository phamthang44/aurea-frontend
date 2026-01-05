import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  brand?: string;
  // Stock information from ProductListingDto
  inStock?: boolean; // Whether product has any available stock
  availableStock?: number; // Total available stock across all variants
  // Variant information (for products with variants)
  variantId?: string; // Selected variant ID
  variantSku?: string; // Selected variant SKU
  variantAttributes?: Record<string, string>; // Selected variant attributes (e.g., { Size: "M", Color: "Red" })
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
  updateItemStock: (itemId: string, inStock: boolean, availableStock: number) => void;
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
            // For products with variants, check if same variant already exists
            // For products without variants, check by product ID only
            const existingItem = item.variantId
              ? state.items.find(
                  (i) => i.id === item.id && i.variantId === item.variantId
                )
              : state.items.find((i) => i.id === item.id && !i.variantId);
            
            const newItems = existingItem
              ? state.items.map((i) =>
                  i.id === item.id &&
                  (item.variantId
                    ? i.variantId === item.variantId
                    : !i.variantId)
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
            // For products with variants, check if same variant already exists
            // For products without variants, check by product ID only
            const existingItem = item.variantId
              ? state.items.find(
                  (i) => i.id === item.id && i.variantId === item.variantId
                )
              : state.items.find((i) => i.id === item.id && !i.variantId);
            
            const newItems = existingItem
              ? state.items.map((i) =>
                  i.id === item.id &&
                  (item.variantId
                    ? i.variantId === item.variantId
                    : !i.variantId)
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
        // Only merge if items are different to prevent duplicates
        set((state) => {
          // Check if guestItems are the same as current items (prevent self-merge)
          const currentItemIds = new Set(state.items.map(i => i.id));
          const guestItemIds = new Set(guestItems.map(i => i.id));
          
          // If all guest items already exist with same quantities, skip merge
          const isDuplicate = guestItems.every(guestItem => {
            const existing = state.items.find(i => i.id === guestItem.id);
            return existing && existing.quantity === guestItem.quantity;
          });
          
          if (isDuplicate && currentItemIds.size === guestItemIds.size) {
            console.log("[Cart Merge] Skipping duplicate merge - items already in cart");
            return state; // No changes needed
          }
          
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

      updateItemStock: (itemId, inStock, availableStock) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, inStock, availableStock }
              : item
          ),
        }));
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items, isAuthenticated: false }), // Only persist items, not auth state
    }
  )
);

