"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();

  const stats = [
    { value: "500+", label: t("landing.hero.stats.products") },
    { value: "100%", label: t("landing.hero.stats.materials") },
    { value: "24h", label: t("landing.hero.stats.shipping") },
    { value: "24/7", label: t("landing.hero.stats.support") },
  ];

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF8] via-[#FDFCF8]/80 to-transparent dark:from-[#0D0D0D] dark:via-[#0D0D0D]/80 dark:to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-2/3">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="Luxury Fashion"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-screen flex items-center">
        <div className="max-w-xl space-y-6 sm:space-y-8">
          {/* Season Badge */}
          <div className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-xs sm:text-sm font-light tracking-wide text-[#8B7355] dark:text-[#D4AF37] px-3 py-1 border border-[#8B7355]/20 dark:border-[#D4AF37]/20 rounded-full">
              {t("landing.hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] text-[#1A1A1A] dark:text-[#F5F5F5] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t("landing.hero.titlePart1")}
            <br />
            <span className="font-normal italic text-[#D4AF37]">
              {t("landing.hero.titlePart2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-light text-[#666666] dark:text-[#A0A0A0] max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {t("landing.hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-10 py-6 text-sm font-light tracking-widest uppercase bg-[#1A1A1A] dark:bg-[#D4AF37] text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#E5C96B] transition-all duration-300"
              >
                {t("landing.hero.ctaPrimary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-10 py-6 text-sm font-light tracking-widest uppercase border-2 border-[#1A1A1A] dark:border-[#D4AF37]/50 text-[#1A1A1A] dark:text-[#F5F5F5] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#D4AF37]/10 transition-all duration-300"
              >
                {t("landing.hero.ctaSecondary")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#E8E4DD] dark:border-[#2A2A2A] animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A] dark:text-[#F5F5F5] mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-light tracking-wider text-[#666666] dark:text-[#A0A0A0] uppercase">
                  {stat.label}
                </p>
              </div>
            ))} 
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-light tracking-widest uppercase text-[#666666] dark:text-[#888888]">
          Scroll
        </span>
        <ChevronDown className="h-4 w-4 text-[#666666] dark:text-[#888888]" />
      </div>
    </section>
  );
}
