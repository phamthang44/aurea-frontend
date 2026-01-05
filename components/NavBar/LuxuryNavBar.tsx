'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, Heart, ShoppingBag, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { useCart } from '@/hooks/useCart';
import { MegaMenu } from './MegaMenu';
import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const userRoles = useAppSelector((state) => state.auth.user?.roles);
  const isAdmin = userRoles?.includes('ADMIN') ?? false;
  
  // Use shared cart state from CartProvider
  // Cart is automatically fetched on mount and when auth state changes
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    dispatch(clearAuth());
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border-b border-[#D4AF37]/30 dark:border-[#3D3D3D]/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-light tracking-wider text-[#B8A072] hover:text-[#D4AF37] dark:text-[#D4AF37] dark:hover:text-[#E5C96B] transition-colors duration-300 no-underline"
          >
            AUREA
          </Link>

          {/* Mega Menu Navigation */}
          <div className="hidden lg:block">
            <MegaMenu items={megaMenuItems} activePath={pathname} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher - Always visible */}
            <LanguageSwitcher />
            
            {/* Theme Toggle - Always visible */}
            <ModeToggle />
            
            {/* Cart - Always visible for both guest and authenticated users */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors duration-300"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D4AF37] text-white text-xs font-medium flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Admin Dashboard Link - Only visible for ADMIN users */}
                {isAdmin && user && (
                  <Link href="/admin/products">
                    <Button
                      variant="ghost"
                      className="font-light tracking-wide px-4 py-2 text-xs text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/30 dark:border-[#3D3D3D]/50 transition-colors duration-300"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t("navbar.admin")}
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

                {/* User Avatar */}
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-[#D4AF37]/30 dark:border-[#3D3D3D] text-[#B8A072] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-colors duration-300"
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
                  {t("navbar.logout")}
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="font-light tracking-wide px-6 py-2 border-2 border-[#D4AF37] text-[#D4AF37] hover:text-white hover:bg-[#D4AF37] dark:text-[#D4AF37] dark:hover:text-[#1A1A1A] dark:hover:bg-[#D4AF37] transition-all duration-300"
                >
                  {t("navbar.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

