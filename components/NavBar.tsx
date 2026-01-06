'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { logoutAction } from '@/app/actions/auth';
import { clearAuth } from '@/lib/store/authSlice';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth.user?.roles);
  const isAdmin = userRole?.includes('ADMIN');
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);


  const handleLogout = async () => {
    dispatch(clearAuth());
    await logoutAction();
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
            {/* Theme Toggle */}
            <ModeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Admin Dashboard Link - Only visible for ADMIN users */}
                {isAdmin && (
                  <Link href="/admin/products">
                    <Button
                      variant="ghost"
                      className="font-light tracking-wide px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border/50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border hover:bg-accent"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="font-light tracking-wide px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="font-light tracking-wide px-6 py-2 border border-border hover:bg-accent"
                >
                  {mounted ? t("navbar.signIn", { defaultValue: "Sign In" }) : "Sign In"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

