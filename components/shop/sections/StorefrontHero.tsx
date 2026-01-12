'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/context/StoreContext';

export function StorefrontHero() {
  const { t } = useTranslation();
  const { store } = useStore();

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF8] via-[#FDFCF8]/80 to-transparent dark:from-[#0D0D0D] dark:via-[#0D0D0D]/80 dark:to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-2/3">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
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
          <div className="inline-block">
            <span 
              className="text-[10px] sm:text-xs font-light tracking-[0.3em] uppercase"
              style={{ color: store.theme?.primaryColor || '#8B7355' }}
            >
              {t('demo.hero.season', { defaultValue: 'Spring/Summer 2026' })}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] text-[#1A1A1A] dark:text-[#F5F5F5]">
            {t('demo.hero.title', { defaultValue: 'Timeless' })}
            <br />
            <span 
              className="font-normal italic"
              style={{ color: store.theme?.primaryColor || '#D4AF37' }}
            >
              {t('demo.hero.titleHighlight', { defaultValue: 'Elegance' })}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-light text-[#666666] dark:text-[#A0A0A0] max-w-md leading-relaxed">
            {t('demo.hero.subtitle', { defaultValue: 'Discover our curated collection of luxury pieces, thoughtfully designed for the modern connoisseur.' })}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-10 py-6 text-sm font-light tracking-widest uppercase bg-[#1A1A1A] dark:bg-[#D4AF37] text-white dark:text-[#1A1A1A] hover:bg-[#333] dark:hover:bg-[#E5C96B] transition-all duration-300"
                style={{ backgroundColor: store.theme?.primaryColor || '#1A1A1A' }}
              >
                {t('demo.hero.shopNow', { defaultValue: 'Shop Now' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop?sort=newest" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-10 py-6 text-sm font-light tracking-widest uppercase border-2 border-[#1A1A1A] dark:border-[#D4AF37]/50 text-[#1A1A1A] dark:text-[#F5F5F5] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#D4AF37]/10 transition-all duration-300"
              >
                {t('demo.hero.newArrivals', { defaultValue: 'New Arrivals' })}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-light tracking-widest uppercase text-[#666666] dark:text-[#888888]">
          {t('demo.hero.scroll', { defaultValue: 'Scroll' })}
        </span>
        <ChevronDown className="h-4 w-4 text-[#666666] dark:text-[#888888]" />
      </div>
    </section>
  );
}


