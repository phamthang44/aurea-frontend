'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { cn, clearCartData } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('ADMIN');
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

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
    
    // Navigate to login
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/collections', label: 'Collections' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-light tracking-wider magnetic-link no-underline">
            AUREA
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-light tracking-wide transition-all duration-300 ease-out relative no-underline",
                    isActive
                      ? "font-medium text-accent"
                      : "text-muted-foreground hover:text-accent"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-accent" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/account/profile" className="no-underline">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full border-2 border-accent p-0 overflow-hidden hover:scale-105 transition-all bg-background"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-accent" />
                    )}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="px-6 py-2 border-accent text-accent hover:bg-accent hover:text-white rounded-full transition-all"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Settings (Language & Theme) - Far Right */}
            <SettingsButton />
          </div>
        </div>
      </div>
    </nav>
  );
}


