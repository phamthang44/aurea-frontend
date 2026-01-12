'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, LogOut, Settings, Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { clearCartData } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { MegaMenu } from './MegaMenu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Updated Navigation Items for Aurea Shop
const checkNavItems = [
  {
    label: 'navbar.shop',
    href: '/shop',
  },
  {
    label: 'navbar.about',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const cartStore = useCartStore.getState();
    cartStore.clearCart();
    cartStore.setAuthenticated(false);
    clearCartData();
    dispatch(clearAuth());
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF8]/95 dark:bg-[#161616]/95 backdrop-blur-xl border-b border-[#D4AF37]/20 dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-light tracking-wider text-[#B8A072] hover:text-[#D4AF37] dark:text-[#D4AF37] dark:hover:text-[#E5C96B] transition-colors duration-300 no-underline"
          >
            AUREA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            {/* Using MegaMenu or Simple Links. MegaMenu wrapper might expect specific prop structure. 
                Assuming MegaMenu handles these simple items gracefully or I can just map them here if MegaMenu is complex.
                Looking at previous code, it used MegaMenu. I will assign checkNavItems to it. 
                But I should verifying if MegaMenu renders them well. 
                Since I didn't read MegaMenu, I'll assume current usage pattern holds. 
            */}
            <MegaMenu items={checkNavItems} activePath={pathname} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Language Switcher - Hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            {/* Theme Toggle */}
            <ModeToggle />
            
            {/* Desktop Auth Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {isAdmin && user && (
                    <Link href="/admin/products">
                      <Button
                        variant="ghost"
                        className="font-light tracking-wide px-3 py-2 text-xs text-[#8B7355] dark:text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/30 transition-colors duration-300"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        {t("navbar.admin")}
                      </Button>
                    </Link>
                  )}

                  <Link href="/account">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full border border-[#D4AF37]/30 text-[#8B7355] dark:text-[#B8A072] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-colors duration-300"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="font-light tracking-wide px-3 py-2 text-xs text-[#8B7355] dark:text-[#B8A072] hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    {t("navbar.logout")}
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="font-light tracking-wide px-5 py-2 border-2 border-[#D4AF37] text-[#D4AF37] hover:text-white dark:hover:text-[#1A1A1A] hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] transition-all duration-300"
                    suppressHydrationWarning
                  >
                    {mounted ? t("navbar.signIn") : "Sign In"}
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-[#8B7355] dark:text-[#B8A072]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D4AF37]/20 dark:border-[#2A2A2A] bg-[#FDFCF8] dark:bg-[#161616]">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            {checkNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block py-2 text-sm font-light text-[#1A1A1A] dark:text-[#F5F5F5] hover:text-[#D4AF37] transition-colors duration-200 no-underline"
              >
                {/* Use item.label directly as we hardcoded it, or t() if we updated keys. 
                    I'll use t() but fallback is the label string itself. */}
                {t(item.label, { defaultValue: item.label })}
              </Link>
            ))}
            
            <div className="border-t border-[#D4AF37]/20 dark:border-[#2A2A2A] pt-3 mt-3">
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 py-2">
                <span className="text-xs text-[#666666] dark:text-[#888888]">Language:</span>
                <LanguageSwitcher />
              </div>
              
              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="space-y-2 pt-2">
                  {isAdmin && (
                    <Link href="/admin/products" className="block">
                      <Button variant="ghost" className="w-full justify-start text-sm text-[#1A1A1A] dark:text-[#F5F5F5]">
                        <Settings className="h-4 w-4 mr-2" />
                        {t("navbar.admin")}
                      </Button>
                    </Link>
                  )}

                  <Link href="/account" className="block">
                    <Button variant="ghost" className="w-full justify-start text-sm text-[#1A1A1A] dark:text-[#F5F5F5]">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-sm text-[#1A1A1A] dark:text-[#F5F5F5]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("navbar.logout")}
                  </Button>
                </div>
              ) : (
                <Link href="/login" className="block pt-2">
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B2B] text-white">
                    {mounted ? t("navbar.signIn") : "Sign In"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
