'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { User, Menu, X, ShoppingBag, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { MegaMenu } from './MegaMenu';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartOptional } from '@/components/providers/CartProvider';

const checkNavItems = [
  {
    label: 'navbar.shop',
    href: '/shop',
    children: [
      {
        title: 'shop.men',
        links: [
          { label: 'shop.allCollections', href: '/shop' },
          { label: 'shop.newArrivals', href: '/shop?sort=newest' },
          { label: 'shop.essentials', href: '/shop?category=essentials' },
        ]
      },
      {
        title: 'shop.categories',
        links: [
          { label: 'shop.jewelry', href: '/shop?category=jewelry' },
          { label: 'shop.apparel', href: '/shop?category=apparel' },
          { label: 'shop.lifestyle', href: '/shop?category=lifestyle' },
        ]
      }
    ]
  },
  {
    label: 'navbar.about',
    href: '/about',
  },
];

export function LuxuryNavBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const cartContext = useCartOptional();
  const cartItems = cartContext?.items ?? [];
  
  // Track mounted state for animations
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform values for scroll-linked animations
  const backdropBlur = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(16px)']);
  const navHeight = useTransform(scrollY, [0, 50], ['5.5rem', '4.5rem']);
  const shadow = useTransform(scrollY, [0, 50], ['none', '0 10px 30px -10px rgba(0,0,0,0.1)']);

  // Client-only state updates
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change  
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  const cartItemCount = cartItems?.length || 0;

  return (
    <motion.nav
      style={{
        height: navHeight,
        backdropFilter: backdropBlur,
        boxShadow: shadow,
      }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex items-center border-b border-transparent",
        "bg-[#FDFCF8]/80 dark:bg-[#111111]/80 border-b-[#D4AF37]/10"
      )}
    >
      <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 flex items-center justify-between relative">
        {/* Left: Navigation Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <MegaMenu items={checkNavItems} activePath={pathname} />
        </div>

        {/* Center: Brand Identity */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group no-underline"
        >
          <motion.span 
            className="text-2xl md:text-3xl font-light tracking-[0.3em] text-[#1A1A1A] dark:text-[#F5F5F3] selection:bg-[#D4AF37]/30 transition-all duration-500 group-hover:tracking-[0.4em]"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            AUREA
          </motion.span>
          <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-all duration-700 mt-0.5" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search Icon - Always Luxury */}
          <button className="hidden md:flex p-2 text-[#1A1A1A] dark:text-[#F5F5F3] hover:text-[#D4AF37] transition-colors duration-300">
            <Search className="h-[1.1rem] w-[1.1rem] stroke-1" />
          </button>

          {/* Cart with Count Badge - Only show on store pages */}
          {cartContext && (
            <Link href="/cart" className="relative group p-2">
              <ShoppingBag className="h-[1.2rem] w-[1.2rem] stroke-1 text-[#1A1A1A] dark:text-[#F5F5F3] group-hover:text-[#D4AF37] transition-colors duration-300" />
              <AnimatePresence>
                {mounted && cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#D4AF37] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg shadow-[#D4AF37]/20 border border-white dark:border-[#111]"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {/* User / Settings Section */}
          <div className="hidden md:flex items-center gap-3 ml-2 border-l border-[#D4AF37]/20 pl-6 h-8">
             {isAuthenticated ? (
                <Link href="/account" className="flex items-center gap-3 group no-underline">
                  <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 p-0.5 group-hover:border-[#D4AF37] transition-colors duration-300 overflow-hidden bg-white dark:bg-zinc-800">
                    {user?.avatarUrl ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image src={user.avatarUrl} alt="User" fill className="object-cover" />
                        </div>
                    ) : (
                        <User className="w-full h-full text-[#D4AF37] p-1" />
                    )}
                  </div>
                  <span className="text-xs font-light tracking-widest uppercase text-[#1A1A1A] dark:text-zinc-400 group-hover:text-[#D4AF37] transition-colors duration-300 hidden xl:block">
                     {user?.fullName?.split(' ')[0] || 'Member'}
                  </span>
                </Link>
             ) : (
                <Link href="/login" className="no-underline">
                  <span className="text-xs font-light tracking-[0.2em] uppercase text-[#1A1A1A] dark:text-[#F5F5F3] hover:text-[#D4AF37] transition-colors duration-300">
                    {t('navbar.signIn')}
                  </span>
                </Link>
             )}
             <SettingsButton />
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1A1A1A] dark:text-[#F5F5F3]"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="h-6 w-6 stroke-1" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="h-6 w-6 stroke-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-[4.5rem] bg-white dark:bg-[#111111] z-[40] lg:hidden flex flex-col p-8 space-y-12"
          >
            <div className="flex flex-col space-y-8">
              {checkNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="text-3xl font-light tracking-[0.1em] text-[#1A1A1A] dark:text-zinc-200 no-underline border-b border-zinc-100 dark:border-zinc-800 pb-4"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center justify-between"
                  >
                    {t(item.label)}
                    <ChevronDown className="h-5 w-5 -rotate-90 text-[#D4AF37]" />
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  {!isAuthenticated && (
                     <Link href="/login" className="no-underline">
                        <Button className="w-full h-14 bg-[#1A1A1A] dark:bg-zinc-100 text-white dark:text-black rounded-none uppercase tracking-widest text-xs">
                          {t('navbar.signIn')}
                        </Button>
                     </Link>
                  )}
                  <Link href="/cart" className="no-underline">
                    <Button variant="outline" className="w-full h-14 border-[#D4AF37] text-[#D4AF37] rounded-none uppercase tracking-widest text-xs">
                      {t('navbar.cart', { defaultValue: 'Cart' })}
                    </Button>
                  </Link>
               </div>
               
               <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-8">
                 <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Global Shop</p>
                    <p className="text-sm font-light uppercase tracking-widest text-[#B8A072]">Aurea International</p>
                 </div>
                 <SettingsButton />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
