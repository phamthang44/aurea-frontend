"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FDFCF8] dark:bg-[#161616]">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] p-8 sm:p-12 md:p-16 lg:p-20">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-[#D4AF37]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-[#B8A072]/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-light tracking-wide text-[#D4AF37]">
                {t("landing.cta.badge", { defaultValue: "Limited Time Offer" })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-4 sm:mb-6">
              {t("landing.cta.title", { defaultValue: "Elevate Your Wardrobe Today" })}
            </h2>

            <p className="max-w-lg sm:max-w-xl mx-auto text-sm sm:text-base lg:text-lg font-light text-white/70 mb-8 sm:mb-10 px-2">
              {t("landing.cta.subtitle", { defaultValue: "Join the Aurea Club for exclusive access to new arrivals, member-only discounts, and personalized styling advice." })}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-light tracking-wide bg-[#D4AF37] hover:bg-[#E5C96B] text-[#1A1A1A] transition-all duration-300 shadow-lg shadow-[#D4AF37]/30"
                >
                  {t("landing.cta.ctaPrimary", { defaultValue: "Start Shopping" })}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/auth" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-light tracking-wide border-2 border-[#D4AF37]/50 text-[#1A1A1A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/20 dark:text-[#D4AF37] dark:hover:text-white dark:hover:bg-[#D4AF37]/20 dark:hover:border-[#D4AF37] transition-all duration-300"
                >
                  {t("landing.cta.ctaSecondary", { defaultValue: "Sign Up Free" })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
