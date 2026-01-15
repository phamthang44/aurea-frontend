"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  X,
  Upload,
  UserCircle2,
  LayoutGrid,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logoutAction } from "@/app/actions/auth";
import { clearAuth } from "@/lib/store/authSlice";
import { useCartStore } from "@/lib/store/cartStore";
import { cn, clearCartData } from "@/lib/utils";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { useTranslation } from "react-i18next";
import { SettingsButton } from "@/components/ui/SettingsButton";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: LayoutGrid,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    label: "Import",
    href: "/admin/imports",
    icon: Upload,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function getNavLabel(key: string): string {
  const labels: Record<string, string> = {
    Dashboard: "admin.layout.dashboard",
    Products: "admin.layout.products",
    Categories: "admin.layout.categories",
    Inventory: "admin.layout.inventory",
    Import: "admin.layout.import",
    Users: "admin.layout.users",
    Settings: "admin.layout.settings",
  };
  return labels[key] || key;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    router.push("/");
    router.refresh();
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { label, href };
    });
  };

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900">
        {/* Sidebar - Desktop */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-[#0B0F1A] border-r border-gray-200 dark:border-slate-800 transition-all duration-300 hidden lg:block shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-none",
            isSidebarCollapsed ? "w-[72px]" : "w-64"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-slate-800/50">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-2 no-underline transition-all duration-300",
                  isSidebarCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                  Aurea
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={cn(
                  "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  isSidebarCollapsed ? "mx-auto" : "ml-auto"
                )}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-none overflow-x-hidden">
              <div className={cn(
                "px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-opacity duration-300",
                isSidebarCollapsed ? "opacity-0" : "opacity-100"
              )}>
                {t("common.menu", { defaultValue: "Menu" })}
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isSidebarCollapsed ? t(getNavLabel(item.label)) : ""}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline group relative",
                      isActive
                        ? "bg-[#D4AF37]/10 text-[#D4AF37] dark:bg-[#D4AF37]/5"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center transition-colors",
                      isActive ? "text-[#D4AF37]" : "group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    )}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    
                    {!isSidebarCollapsed && (
                      <span className="flex-1 truncate">
                        {t(getNavLabel(item.label), { defaultValue: item.label })}
                      </span>
                    )}

                    {isActive && !isSidebarCollapsed && (
                      <div className="h-5 w-1 rounded-full bg-[#D4AF37]" />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl border border-slate-800 translate-x-1 group-hover:translate-x-0 z-[60]">
                        {t(getNavLabel(item.label), { defaultValue: item.label })}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-gray-100 dark:border-slate-800/50 space-y-1">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                )}
              >
                <div className="flex items-center justify-center">
                  <Home className="h-5 w-5 flex-shrink-0" />
                </div>
                {!isSidebarCollapsed && <span className="flex-1">{t("admin.layout.backToSite", { defaultValue: "Back to Site" })}</span>}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl border border-slate-800 translate-x-1 group-hover:translate-x-0 z-[60]">
                    {t("admin.layout.backToSite")}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                  </div>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 group relative"
                )}
              >
                <div className="flex items-center justify-center">
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                </div>
                {!isSidebarCollapsed && <span className="flex-1 text-left">{t("admin.layout.logout", { defaultValue: "Logout" })}</span>}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-rose-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl translate-x-1 group-hover:translate-x-0 z-[60]">
                    {t("admin.layout.logout")}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-rose-600 rotate-45" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
            isMobileSidebarOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-64 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-amber-900/20 transition-transform duration-300 shadow-xl dark:shadow-amber-950/30",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Logo */}
              <div className="h-16 flex items-center justify-between px-6 border-r border-border">
                <Link
                  href="/"
                  className="text-xl font-light tracking-wider text-[#D4AF37] no-underline"
                >
                  AUREA
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline",
                        isActive
                          ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                        )}
                      />
                      <span className="flex-1">{t(getNavLabel(item.label), { defaultValue: item.label })}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#D4AF37] text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="p-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 mb-2"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  <span>{t("admin.layout.backToSite", { defaultValue: "Back to Site" })}</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>{t("admin.layout.logout", { defaultValue: "Logout" })}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "transition-all duration-300",
            "lg:pl-64",
            isSidebarCollapsed && "lg:pl-20"
          )}
        >
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Breadcrumbs */}
                <nav className="hidden sm:flex items-center gap-2 text-sm font-medium">
                  <Link
                    href="/admin"
                    className="text-slate-400 hover:text-[#D4AF37] no-underline transition-colors"
                  >
                    {t("admin.layout.dashboard", { defaultValue: "Dashboard" })}
                  </Link>
                  {generateBreadcrumbs().map((crumb, index, array) => (
                    <div key={crumb.href} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      <Link
                        href={crumb.href}
                        className={cn(
                          "no-underline transition-colors",
                          index === array.length - 1
                            ? "text-slate-900 dark:text-slate-100 font-semibold cursor-default pointer-events-none"
                            : "text-slate-400 hover:text-[#D4AF37] dark:text-slate-500 dark:hover:text-[#D4AF37]"
                        )}
                      >
                        {crumb.label}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Right side - Theme Toggle and User Avatar */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Settings Button (Language & Theme) */}
                <SettingsButton />

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                {/* User Profile Hook */}
                <div className="flex items-center gap-3 pl-1">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {user?.fullName || t("admin.layout.admin")}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      {user?.roles?.[0] || t("admin.users.roles.admin")}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-gray-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 transition-transform hover:scale-105">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8962D] text-white font-bold text-sm">
                        {user?.fullName?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}



