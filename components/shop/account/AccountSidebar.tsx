"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { User, ShoppingBag, Heart, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearAuth } from "@/lib/store/authSlice";
import { logoutAction } from "@/app/actions/auth";
import { useCartStore } from "@/lib/store/cartStore";
import { clearCartData } from "@/lib/utils";

export function AccountSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const menuItems = [
    {
      href: "/account/profile",
      label: "profile.title",
      defaultLabel: "Profile",
      icon: User,
    },
    {
      href: "/account/orders",
      label: "navbar.myOrders",
      defaultLabel: "Orders",
      icon: ShoppingBag,
    },
    {
      href: "/wishlist",
      label: "navbar.wishlist",
      defaultLabel: "Wishlist",
      icon: Heart,
    },
  ];

  const handleLogout = async () => {
    const cartStore = useCartStore.getState();
    cartStore.clearCart();
    cartStore.setAuthenticated(false);
    clearCartData();
    dispatch(clearAuth());
    await logoutAction();
    router.push("/shop");
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-56 shrink-0">
      {/* Navigation */}
      <nav className="space-y-1">
        {/* Section Label */}
        <p
          className="px-4 py-3 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50"
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          {t("profile.title", { defaultValue: "Account" })}
        </p>

        {/* Menu Items */}
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3.5 text-sm transition-all duration-500",
                  "tracking-wide",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-foreground",
                )}
              >
                {/* Active indicator - vertical line */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-px transition-all duration-500",
                    isActive
                      ? "h-6 bg-accent"
                      : "h-0 bg-accent/50 group-hover:h-4",
                  )}
                />

                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-300 stroke-[1.5]",
                    isActive
                      ? "text-accent"
                      : "text-muted-foreground/40 group-hover:text-muted-foreground/70",
                  )}
                />

                <span
                  className="flex-1"
                  style={{ fontFamily: "var(--font-sans), sans-serif" }}
                >
                  {t(item.label, { defaultValue: item.defaultLabel })}
                </span>

                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-all duration-300 stroke-[1.5]",
                    isActive
                      ? "opacity-100 text-accent"
                      : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div className="my-6 mx-4 h-px bg-border/30" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="group relative w-full flex items-center gap-3 px-4 py-3.5 text-sm tracking-wide text-muted-foreground/50 hover:text-foreground transition-all duration-500"
      >
        <LogOut className="w-4 h-4 stroke-[1.5] transition-colors duration-300 group-hover:text-destructive/70" />
        <span style={{ fontFamily: "var(--font-sans), sans-serif" }}>
          {t("navbar.logout", { defaultValue: "Sign Out" })}
        </span>
      </button>
    </aside>
  );
}
