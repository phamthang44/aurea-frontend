'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/context/StoreContext';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, Heart, ShoppingBag, Search, Menu, X, LogOut, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { useCart } from '@/components/providers/CartProvider';
import { clearCartData } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function StorefrontNavBar() {
  const { t } = useTranslation();
  const { store } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const storefrontNavItems = [
    { label: 'demo.nav.newArrivals', href: `/shop` },
    { label: 'demo.nav.women', href: `/products?category=women` },
    { label: 'demo.nav.men', href: `/products?category=men` },
    { label: 'demo.nav.collections', href: `/products?category=collections` },
    { label: 'demo.nav.sale', href: `/products?category=sale` },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const cartStore = useCartStore.getState();
    cartStore.clearCart();
    cartStore.setAuthenticated(false);
    clearCartData();
    dispatch(clearAuth());
    await logoutAction();
    router.push(`/shop`);
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF8]/98 dark:bg-[#0D0D0D]/98 backdrop-blur-xl border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
      {/* Top Banner */}
      <div 
        className="text-white dark:text-[#1A1A1A] text-center py-2 px-4"
        style={{ backgroundColor: store.theme?.primaryColor || '#1A1A1A' }}
      >
        <p className="text-[10px] sm:text-xs font-light tracking-widest uppercase">
          {t('demo.nav.banner', { defaultValue: 'Free Shipping on Orders Over $200 • Complimentary Gift Wrapping' })}
        </p>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left - Mobile Menu + Search */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#1A1A1A] dark:text-[#F5F5F5]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Link
              href={`/shop`}
              className="text-xl sm:text-2xl font-light tracking-[0.3em] hover:opacity-80 transition-opacity duration-300 no-underline"
              style={{ color: store.theme?.primaryColor || '#D4AF37' }}
            >
              {store.name}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {storefrontNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-light tracking-widest uppercase text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5] transition-colors duration-300 no-underline"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5]"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Language Switcher - Desktop only */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Wishlist */}
            <Link href={`/wishlist`}>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-9 w-9 text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5]"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 text-[#D4AF37] hover:text-[#C19B2B] hover:bg-[#D4AF37]/10"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2 bg-[#FDFCF8] dark:bg-[#1A1A1A] border border-[#E8E4DD] dark:border-[#2A2A2A]">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium truncate text-[#1A1A1A] dark:text-[#F5F5F5]">{user?.fullName || user?.email || 'Customer'}</p>
                  </div>
                  <div className="h-px bg-[#E8E4DD] dark:bg-[#2A2A2A] my-1" />
                  <Link 
                    href="/account" 
                    className="flex items-center gap-2 px-2 py-2 text-sm font-light text-[#666666] dark:text-[#A0A0A0] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-md transition-colors w-full no-underline"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('navbar.account', { defaultValue: 'My Account' })}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-2 text-sm font-light text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navbar.logout', { defaultValue: 'Logout' })}</span>
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link href="/login" title={t('navbar.signIn', { defaultValue: 'Sign In' })}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex h-9 w-9 text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5]"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href={`/cart`} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5]"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItemCount > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full text-white text-[9px] sm:text-[10px] font-medium flex items-center justify-center"
                    style={{ backgroundColor: store.theme?.primaryColor || '#D4AF37' }}
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#FDFCF8] dark:bg-[#0D0D0D] border-b border-[#E8E4DD] dark:border-[#2A2A2A] p-4 sm:p-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
            <Input
              type="text"
              placeholder={t('demo.nav.searchPlaceholder', { defaultValue: 'Search for products...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white dark:bg-[#1A1A1A] border-[#E8E4DD] dark:border-[#2A2A2A] text-sm"
              autoFocus
            />
            <Button 
              type="submit" 
              className="text-white dark:text-[#1A1A1A] hover:opacity-90 dark:hover:opacity-90"
              style={{ backgroundColor: store.theme?.primaryColor || '#1A1A1A' }}
            >
              {t('demo.nav.search', { defaultValue: 'Search' })}
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#FDFCF8] dark:bg-[#0D0D0D] border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
          <div className="px-4 py-6 space-y-1">
            {storefrontNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-sm font-light tracking-widest uppercase text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5] transition-colors duration-200 no-underline border-b border-[#E8E4DD]/50 dark:border-[#2A2A2A]/50"
              >
                {t(item.label)}
              </Link>
            ))}
            
            <div className="pt-4 flex items-center gap-4">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm text-[#666666]"
                >
                  {t('navbar.logout', { defaultValue: 'Logout' })}
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="text-sm text-[#666666]">
                    {t('navbar.signIn', { defaultValue: 'Sign In' })}
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




