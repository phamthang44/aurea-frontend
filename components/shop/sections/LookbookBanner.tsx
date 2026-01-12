'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LookbookBanner() {
  const { t } = useTranslation();

  return (
    <section className="py-0 bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1A1A1A]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80"
              alt="Lookbook"
              fill
              className="object-cover opacity-60"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 lg:p-16">
            <div className="text-center lg:text-left max-w-lg">
              <span className="text-[10px] sm:text-xs font-light tracking-[0.3em] uppercase text-[#D4AF37]">
                {t('demo.lookbook.badge', { defaultValue: 'Editorial' })}
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight">
                {t('demo.lookbook.title', { defaultValue: 'The Spring' })}
                <br />
                <span className="italic font-normal text-[#D4AF37]">
                  {t('demo.lookbook.titleHighlight', { defaultValue: 'Lookbook' })}
                </span>
              </h2>
              <p className="mt-4 text-sm sm:text-base font-light text-white/70 leading-relaxed">
                {t('demo.lookbook.subtitle', { defaultValue: 'Explore our editorial collection featuring the season\'s most coveted pieces.' })}
              </p>
            </div>

            <Link href="/shop">
              <Button
                size="lg"
                className="px-8 sm:px-12 py-6 text-sm font-light tracking-widest uppercase bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
              >
                {t('demo.lookbook.explore', { defaultValue: 'Explore Collection' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
