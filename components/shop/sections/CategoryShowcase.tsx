'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

import { useStore } from '@/lib/context/StoreContext';

export function CategoryShowcase() {
  const { t } = useTranslation();
  const { store } = useStore();

  const categories = [
    {
      id: 'women',
      titleKey: 'demo.categories.women',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
      href: `/products?category=women`,
    },
    {
      id: 'men',
      titleKey: 'demo.categories.men',
      image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
      href: `/products?category=men`,
    },
    {
      id: 'accessories',
      titleKey: 'demo.categories.accessories',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80',
      href: `/products?category=accessories`,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <span 
            className="text-[10px] sm:text-xs font-light tracking-[0.3em] uppercase"
            style={{ color: store.theme?.primaryColor || '#8B7355' }}
          >
            {t('demo.categories.badge', { defaultValue: 'Explore' })}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5]">
            {t('demo.categories.title', { defaultValue: 'Shop by Category' })}
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative block aspect-[3/4] overflow-hidden bg-[#F0EDE8] dark:bg-[#1A1A1A] cursor-pointer"
            >
              {/* Image */}
              <Image
                src={category.image}
                alt={t(category.titleKey)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-light tracking-widest uppercase text-white mb-2">
                  {t(category.titleKey)}
                </h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:text-[#D4AF37] transition-colors duration-300">
                  <span className="text-xs font-light tracking-wider uppercase">
                    {t('demo.categories.shopNow', { defaultValue: 'Shop Now' })}
                  </span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


