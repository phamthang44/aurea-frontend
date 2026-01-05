"use client";

import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", langCode);
    }
    setOpen(false);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-[#D4AF37]/30 dark:border-[#3D3D3D] text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors duration-300"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-[#D4AF37]/30 dark:border-[#3D3D3D] text-[#B8A072] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/50 transition-all duration-300"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right"
        className="w-[320px] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border-l border-[#D4AF37]/30 dark:border-[#3D3D3D]"
      >
        <SheetHeader>
          <SheetTitle className="text-[#D4AF37] dark:text-[#E5C96B] font-light tracking-wide">
            {t("language.selectLanguage")}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                "hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20",
                "border border-transparent hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/40",
                i18n.language === language.code &&
                  "bg-[#D4AF37]/15 dark:bg-[#D4AF37]/25 border-[#D4AF37]/40 dark:border-[#D4AF37]/50 text-[#D4AF37] dark:text-[#E5C96B]"
              )}
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="flex-1 text-sm font-light tracking-wide">
                {language.label}
              </span>
              {i18n.language === language.code && (
                <Check className="h-4 w-4 text-[#D4AF37] dark:text-[#E5C96B]" />
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
