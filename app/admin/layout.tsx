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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logoutAction } from "@/app/actions/auth";
import { clearAuth } from "@/lib/store/authSlice";
import { useCartStore } from "@/lib/store/cartStore";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

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
    dispatch(clearAuth());
    useCartStore.getState().setAuthenticated(false);
    await logoutAction();
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
            "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-amber-900/20 transition-all duration-300 hidden lg:block shadow-xl dark:shadow-amber-950/30",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 ">
              {!isSidebarCollapsed && (
                <Link
                  href="/"
                  className="text-xl font-light tracking-wider text-[#D4AF37] no-underline"
                >
                  AUREA
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-muted-foreground hover:text-foreground ml-auto"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline group relative",
                      isActive
                        ? "bg-[#D4AF37] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive && "text-white"
                      )}
                    />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="flex-1">{t(getNavLabel(item.label), { defaultValue: item.label })}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[#D4AF37] text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {t(getNavLabel(item.label), { defaultValue: item.label })}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-3">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline text-muted-foreground hover:text-foreground hover:bg-secondary mb-2"
                )}
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{t("admin.layout.backToSite", { defaultValue: "Back to Site" })}</span>}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{t("admin.layout.logout", { defaultValue: "Logout" })}</span>}
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
            <div className="flex flex-col h-full">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive && "text-white"
                        )}
                      />
                      <span className="flex-1">{t(getNavLabel(item.label), { defaultValue: item.label })}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline text-muted-foreground hover:text-foreground hover:bg-secondary mb-2"
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
          <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-amber-900/30 shadow-sm dark:shadow-amber-950/20">
            <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200 no-underline transition-colors"
                >
                  {t("admin.layout.home", { defaultValue: "Home" })}
                </Link>
                {generateBreadcrumbs().map((crumb, index) => {
                  const breadcrumbs = generateBreadcrumbs();
                  return (
                    <div key={crumb.href} className="flex items-center gap-2">
                      <span className="text-gray-400 dark:text-amber-500/50">
                        /
                      </span>
                      <Link
                        href={crumb.href}
                        className={cn(
                          "no-underline transition-colors",
                          index === breadcrumbs.length - 1
                            ? "text-gray-900 dark:text-amber-200 font-semibold"
                            : "text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200"
                        )}
                      >
                        {crumb.label}
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Right side - Theme Toggle and User Avatar */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ModeToggle />

                {/* User Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700 flex items-center justify-center text-white font-semibold shadow-lg shadow-amber-500/30 dark:shadow-amber-900/40 ring-2 ring-white dark:ring-slate-800">
                  {user?.fullName?.charAt(0).toUpperCase() || "A"}
                </div>

                {/* Language Selector */}
                <LanguageSwitcher />
              </div>
            </div>

            {/* Welcome Message - Below Navigation */}
            <div className="px-4 sm:px-6 lg:px-8 pb-3 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-amber-100/80">
                  {t("admin.layout.welcomeBack", { defaultValue: "Welcome back," })}{" "}
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent font-semibold">
                    {user?.fullName || t("admin.layout.admin", { defaultValue: "Admin" })}
                  </span>
                </p>
                <span className="text-gray-400 dark:text-amber-500/50">•</span>
                <p className="text-xs text-gray-500 dark:text-amber-200/50">
                  {user?.email || "admin@aurea.com"}
                </p>
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
