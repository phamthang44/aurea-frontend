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
import { clearCartData } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { MegaMenu } from './MegaMenu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const megaMenuItems = [
  {
    label: 'navbar.megaMenu.newArrivals.label',
    href: '/collections/new',
    children: [
      {
        title: 'navbar.megaMenu.newArrivals.women.title',
        links: [
          {
            label: 'navbar.megaMenu.newArrivals.women.latestDresses',
            href: '/collections/new/women/dresses',
          },
          {
            label: 'navbar.megaMenu.newArrivals.women.newTops',
            href: '/collections/new/women/tops',
          },
          {
            label: 'navbar.megaMenu.newArrivals.women.accessories',
            href: '/collections/new/women/accessories',
          },
        ],
      },
      {
        title: 'navbar.megaMenu.newArrivals.men.title',
        links: [
          {
            label: 'navbar.megaMenu.newArrivals.men.latestShirts',
            href: '/collections/new/men/shirts',
          },
          {
            label: 'navbar.megaMenu.newArrivals.men.newJackets',
            href: '/collections/new/men/jackets',
          },
          {
            label: 'navbar.megaMenu.newArrivals.men.accessories',
            href: '/collections/new/men/accessories',
          },
        ],
      },
      {
        title: 'navbar.megaMenu.newArrivals.featured.title',
        links: [
          {
            label: 'navbar.megaMenu.newArrivals.featured.editorsPick',
            href: '/collections/editors-pick',
          },
          {
            label: 'navbar.megaMenu.newArrivals.featured.limitedEdition',
            href: '/collections/limited',
          },
        ],
      },
    ],
  },
  {
    label: 'navbar.megaMenu.clothing.label',
    href: '/collections/clothing',
    children: [
      {
        title: 'navbar.megaMenu.clothing.women.title',
        links: [
          {
            label: 'navbar.megaMenu.clothing.women.dresses',
            href: '/collections/women/dresses',
          },
          {
            label: 'navbar.megaMenu.clothing.women.topsAndBlouses',
            href: '/collections/women/tops',
          },
          {
            label: 'navbar.megaMenu.clothing.women.bottoms',
            href: '/collections/women/bottoms',
          },
          {
            label: 'navbar.megaMenu.clothing.women.outerwear',
            href: '/collections/women/outerwear',
          },
        ],
      },
      {
        title: 'navbar.megaMenu.clothing.men.title',
        links: [
          {
            label: 'navbar.megaMenu.clothing.men.shirts',
            href: '/collections/men/shirts',
          },
          {
            label: 'navbar.megaMenu.clothing.men.pants',
            href: '/collections/men/pants',
          },
          {
            label: 'navbar.megaMenu.clothing.men.jackets',
            href: '/collections/men/jackets',
          },
          {
            label: 'navbar.megaMenu.clothing.men.suits',
            href: '/collections/men/suits',
          },
        ],
      },
    ],
  },
  {
    label: 'navbar.megaMenu.accessories.label',
    href: '/collections/accessories',
    children: [
      {
        title: 'navbar.megaMenu.accessories.categories.title',
        links: [
          {
            label: 'navbar.megaMenu.accessories.categories.bagsAndHandbags',
            href: '/collections/accessories/bags',
          },
          {
            label: 'navbar.megaMenu.accessories.categories.jewelry',
            href: '/collections/accessories/jewelry',
          },
          {
            label: 'navbar.megaMenu.accessories.categories.shoes',
            href: '/collections/accessories/shoes',
          },
          {
            label: 'navbar.megaMenu.accessories.categories.watches',
            href: '/collections/accessories/watches',
          },
        ],
      },
      {
        title: 'navbar.megaMenu.accessories.byStyle.title',
        links: [
          {
            label: 'navbar.megaMenu.accessories.byStyle.minimalist',
            href: '/collections/accessories?style=minimalist',
          },
          {
            label: 'navbar.megaMenu.accessories.byStyle.statement',
            href: '/collections/accessories?style=statement',
          },
        ],
      },
    ],
  },
  {
    label: 'navbar.megaMenu.about.label',
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
  const [mounted, setMounted] = useState(false);
  
  // Use shared cart state from CartProvider
  // Cart is automatically fetched on mount and when auth state changes
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    // Clear cart state before logout to prevent data leakage to next user
    const cartStore = useCartStore.getState();
    cartStore.clearCart();
    cartStore.setAuthenticated(false);
    
    // Clear all cart-related localStorage data
    clearCartData();
    
    // Clear auth state
    dispatch(clearAuth());
    
    // Call logout action (clears server-side cookies)
    await logoutAction();
    
    // Navigate to home
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
                  suppressHydrationWarning
                >
                  {mounted ? t("navbar.signIn") : "Sign In"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

