"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Check,
  Globe,
  Languages,
  LogOut,
  User,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, clearCartData } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { clearAuth } from "@/lib/store/authSlice";
import { useCartStore } from "@/lib/store/cartStore";
import { useRouter } from "next/navigation";
import { usePermission } from "@/lib/hooks/usePermission";

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export function SettingsButton() {
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { canAccessAdmin } = usePermission();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-border hover:bg-accent transition-all duration-300"
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", langCode);
    }
  };

  const handleLogout = async () => {
    const cartStore = useCartStore.getState();
    cartStore.clearCart();
    cartStore.setAuthenticated(false);
    clearCartData();
    dispatch(clearAuth());
    await logoutAction();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const themes = [
    {
      name: "light",
      icon: Sun,
      label: t("settings.theme.light", { defaultValue: "Light" }),
    },
    {
      name: "dark",
      icon: Moon,
      label: t("settings.theme.dark", { defaultValue: "Dark" }),
    },
    {
      name: "system",
      icon: Monitor,
      label: t("settings.theme.system", { defaultValue: "System" }),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-[#D4AF37]/30 dark:border-[#3D3D3D] text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all duration-300 relative group"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#D4AF37]/30 dark:border-[#3D3D3D] rounded-2xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-light tracking-widest uppercase text-[#D4AF37] dark:text-[#E5C96B] flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("settings.title", { defaultValue: "Settings" })}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Theme Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B7355] dark:text-amber-200/50">
              {t("settings.appearance", { defaultValue: "Appearance" })}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((tMode) => {
                const Icon = tMode.icon;
                const isActive = theme === tMode.name;
                return (
                  <button
                    key={tMode.name}
                    onClick={() => setTheme(tMode.name)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300",
                      isActive
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] dark:text-[#E5C96B]"
                        : "bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#D4AF37]/50",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium tracking-wider uppercase">
                      {tMode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B7355] dark:text-amber-200/50 flex items-center gap-2">
              {t("settings.language", { defaultValue: "Language" })}
            </h3>
            <div className="space-y-2">
              {languages.map((language) => {
                const isActive = i18n.language === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                      isActive
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#B8A072] dark:text-[#E5C96B]"
                        : "bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#D4AF37]/30",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{language.flag}</span>
                      <span className="text-sm font-light tracking-wide">
                        {language.label}
                      </span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Section - Only for users with admin permissions */}
          {canAccessAdmin && (
            <div className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B7355] dark:text-amber-200/50 flex items-center gap-2">
                {t("settings.administration", {
                  defaultValue: "Administration",
                })}
              </h3>
              <Link
                href="/admin/products"
                className="no-underline"
                onClick={() => setOpen(false)}
              >
                <div className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 text-[#B8A072] dark:text-[#E5C96B] hover:bg-[#D4AF37]/15 transition-all duration-300">
                  <LayoutDashboard className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-wide">
                      {t("settings.adminDashboard", {
                        defaultValue: "Admin Dashboard",
                      })}
                    </span>
                    <span className="text-[10px] opacity-70 uppercase tracking-tighter">
                      {t("settings.adminSubtitle", {
                        defaultValue: "Manage products, users & more",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Account/Session Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B7355] dark:text-amber-200/50 flex items-center gap-2">
              {t("settings.account", { defaultValue: "Account" })}
            </h3>
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <div className="h-10 w-10 rounded-full border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center bg-white dark:bg-zinc-900">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-[#D4AF37]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {user?.fullName || user?.email}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate uppercase tracking-tighter">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account/profile"
                    className="no-underline"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11 rounded-xl border-gray-200 dark:border-white/10 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]/30"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-xs">
                        {t("settings.myAccount", {
                          defaultValue: "My Account",
                        })}
                      </span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 h-11 rounded-xl border-gray-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-xs">
                      {t("settings.logout", { defaultValue: "Logout" })}
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="no-underline"
                onClick={() => setOpen(false)}
              >
                <Button className="w-full justify-center gap-2 h-12 rounded-xl bg-[#D4AF37] hover:bg-[#C19B2B] text-white shadow-lg shadow-[#D4AF37]/20 border-none">
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm font-medium uppercase tracking-widest">
                    {t("settings.signIn", { defaultValue: "Sign In" })}
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-black/20 flex justify-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light tracking-widest uppercase">
            © {new Date().getFullYear()} Aurea Luxury • Crafted with Excellence
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
