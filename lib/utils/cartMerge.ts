import { useCartStore, CartItem } from '@/lib/store/cartStore';

/**
 * Merges guest cart (from localStorage) into authenticated user's cart
 * This is called after successful login
 */
export async function mergeGuestCartOnLogin() {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  const cartStore = useCartStore.getState();
  
  // Get guest cart from localStorage
  const guestCartData = localStorage.getItem('aurea-guest-cart');
  
  if (!guestCartData) {
    return; // No guest cart to merge
  }

  try {
    const parsed = JSON.parse(guestCartData);
    const guestItems: CartItem[] = parsed.state?.items || [];
    
    if (guestItems.length > 0) {
      // Merge guest cart into authenticated cart
      await cartStore.mergeGuestCart(guestItems);
      
      // Note: Don't remove localStorage here - Zustand persist will handle it
      // The cart store will now sync to server
    }
  } catch (error) {
    console.error('Failed to merge guest cart:', error);
  }
}

