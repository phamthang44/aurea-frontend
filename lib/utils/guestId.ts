/**
 * Utility to get or generate a Guest ID for cart operations
 * Stores the guest ID in localStorage for persistence across sessions
 */

const GUEST_ID_KEY = 'x-guest-id';

/**
 * Gets the existing guest ID from localStorage, or generates a new one if missing
 * @returns The guest ID string (UUID)
 */
export function getOrCreateGuestId(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // Server-side: generate a temporary ID (will be replaced on client)
    return 'temp-guest-id';
  }

  // Check localStorage for existing guest ID
  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    // Generate a new UUID v4
    guestId = generateUUID();
    // Save to localStorage
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
}

/**
 * Generates a UUID v4
 * @returns A UUID string
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clears the guest ID from localStorage
 * Useful when user logs out or wants to reset their guest session
 */
export function clearGuestId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_ID_KEY);
  }
}

