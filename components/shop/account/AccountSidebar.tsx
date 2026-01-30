"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { User, ShoppingBag, Heart, LogOut } from "lucide-react";
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
      icon: User,
    },
    {
      href: "/account/orders",
      label: "navbar.myOrders",
      icon: ShoppingBag,
    },
    {
      href: "/wishlist",
      label: "navbar.wishlist",
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
    <aside className="w-full lg:w-64 shrink-0 space-y-8">
      {/* Menu Groups */}
      <div className="space-y-1">
        <p className="px-4 py-2 text-xs font-light tracking-widest uppercase text-muted-foreground">
          {t("profile.title", { defaultValue: "My Account" })}
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-lg group",
                  isActive
                    ? "bg-accent/5 text-accent font-medium border-l-2 border-accent rounded-l-none"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {t(item.label)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-black/5 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-destructive" />
          {t("navbar.logout", { defaultValue: "Logout" })}
        </button>
      </div>
    </aside>
  );
}
