'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, Heart, ShoppingBag, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { useCartStore } from '@/lib/store/cartStore';
import { MegaMenu } from './MegaMenu';
import Link from 'next/link';
import { useEffect } from 'react';

const megaMenuItems = [
  {
    label: 'New Arrivals',
    href: '/collections/new',
    children: [
      {
        title: 'Women',
        links: [
          { label: 'Latest Dresses', href: '/collections/new/women/dresses' },
          { label: 'New Tops', href: '/collections/new/women/tops' },
          { label: 'Accessories', href: '/collections/new/women/accessories' },
        ],
      },
      {
        title: 'Men',
        links: [
          { label: 'Latest Shirts', href: '/collections/new/men/shirts' },
          { label: 'New Jackets', href: '/collections/new/men/jackets' },
          { label: 'Accessories', href: '/collections/new/men/accessories' },
        ],
      },
      {
        title: 'Featured',
        links: [
          { label: 'Editor\'s Pick', href: '/collections/editors-pick' },
          { label: 'Limited Edition', href: '/collections/limited' },
        ],
      },
    ],
  },
  {
    label: 'Clothing',
    href: '/collections/clothing',
    children: [
      {
        title: 'Women',
        links: [
          { label: 'Dresses', href: '/collections/women/dresses' },
          { label: 'Tops & Blouses', href: '/collections/women/tops' },
          { label: 'Bottoms', href: '/collections/women/bottoms' },
          { label: 'Outerwear', href: '/collections/women/outerwear' },
        ],
      },
      {
        title: 'Men',
        links: [
          { label: 'Shirts', href: '/collections/men/shirts' },
          { label: 'Pants', href: '/collections/men/pants' },
          { label: 'Jackets', href: '/collections/men/jackets' },
          { label: 'Suits', href: '/collections/men/suits' },
        ],
      },
    ],
  },
  {
    label: 'Accessories',
    href: '/collections/accessories',
    children: [
      {
        title: 'Categories',
        links: [
          { label: 'Bags & Handbags', href: '/collections/accessories/bags' },
          { label: 'Jewelry', href: '/collections/accessories/jewelry' },
          { label: 'Shoes', href: '/collections/accessories/shoes' },
          { label: 'Watches', href: '/collections/accessories/watches' },
        ],
      },
      {
        title: 'By Style',
        links: [
          { label: 'Minimalist', href: '/collections/accessories?style=minimalist' },
          { label: 'Statement', href: '/collections/accessories?style=statement' },
        ],
      },
    ],
  },
  {
    label: 'About',
    href: '/about',
  },
];

export function LuxuryNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const userRoles = useAppSelector((state) => state.auth.user?.roles);
  const isAdmin = userRoles?.includes('ADMIN') ?? false;
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Debugging logs - will appear in browser console
  useEffect(() => {
    console.log("=== LuxuryNavBar Debug ===");
    console.log("Header Rendered. User:", user);
    console.log("User Roles:", userRoles);
    console.log("Is Admin?", isAdmin);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("========================");
  }, [user, userRoles, isAdmin, isAuthenticated]);

  const handleLogout = async () => {
    dispatch(clearAuth());
    useCartStore.getState().setAuthenticated(false);
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  // Sync cart store with auth state
  useEffect(() => {
    useCartStore.getState().setAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-[#3D3D3D]/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-light tracking-wider text-[#F5F5F5] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
          >
            AUREA
          </Link>

          {/* Mega Menu Navigation */}
          <div className="hidden lg:block">
            <MegaMenu items={megaMenuItems} activePath={pathname} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle - Always visible */}
            <ModeToggle />
            
            {isAuthenticated ? (
              <>
                {/* Admin Dashboard Link - Only visible for ADMIN users */}
                {isAdmin && user && (
                  <Link href="/admin/products">
                    <Button
                      variant="ghost"
                      className="font-light tracking-wide px-4 py-2 text-xs text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#3D3D3D]/50 transition-colors duration-300"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* Wishlist */}
                <Link href="/wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors duration-300"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors duration-300"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] text-xs font-medium flex items-center justify-center">
                        {cartItemCount > 9 ? '9+' : cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Avatar */}
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-[#3D3D3D] text-[#B8A072] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-colors duration-300"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Logout */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="font-light tracking-wide px-4 py-2 text-xs text-[#B8A072] hover:text-[#D4AF37] transition-colors duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button
                  className="font-light tracking-wide px-6 py-2 border border-[#3D3D3D] bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#B8A072] hover:border-[#B8A072] transition-colors duration-300"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

