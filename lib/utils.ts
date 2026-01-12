import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Clears all cart-related data from localStorage
 * This should be called when user logs out to prevent cart data from persisting to the next user
 */
export function clearCartData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear guest cart from localStorage (used by cartStore)
  localStorage.removeItem('aurea-guest-cart');
  
  // Clear guest ID from localStorage
  localStorage.removeItem('x-guest-id');
  
  // Clear any other cart-related localStorage keys if they exist
  // This ensures a clean slate for the next user
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('cart') || key.includes('guest'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Enhanced slugify function with Vietnamese diacritics removal
 * Converts Vietnamese characters to their base Latin equivalents
 */
export function slugify(text: string): string {
  if (!text) return "";

  let slug = text.toString().toLowerCase().trim();

  // Map of Vietnamese characters to their non-diacritic versions
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

  for (let i = 0, l = from.length; i < l; i++) {
    slug = slug.replace(new RegExp(from[i], "g"), to[i]);
  }

  return slug
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars (now safe as diacritics are gone)
    .replace(/--+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
}
