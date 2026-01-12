'use client';

import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ProductCardListing } from '@/components/shop/catalog/ProductCardListing';
import { ProductCardSkeleton } from '@/components/shop/catalog/ProductCardSkeleton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedProductsProps {
  limit?: number;
}

import { useStore } from '@/lib/context/StoreContext';

export function FeaturedProducts({ limit = 8 }: FeaturedProductsProps) {
  const { t } = useTranslation();
  const { store } = useStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const response = await fetch(`/api/bff/shop?page=1&size=${limit}&sort=newest`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const products = data?.products || [];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#F8F5F0] dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12 lg:mb-16">
          <div>
            <span 
              className="text-[10px] sm:text-xs font-light tracking-[0.3em] uppercase"
              style={{ color: store.theme?.primaryColor || '#8B7355' }}
            >
              {t('demo.featured.badge', { defaultValue: 'Curated Selection' })}
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5]">
              {t('demo.featured.title', { defaultValue: 'Featured Products' })}
            </h2>
          </div>
          <Link href="/shop">
            <Button
              variant="ghost"
              className="text-sm font-light tracking-wider text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F5] group"
            >
              {t('demo.featured.viewAll', { defaultValue: 'View All' })}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-[#666666] dark:text-[#A0A0A0]">
              {t('demo.featured.error', { defaultValue: 'Unable to load products' })}
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#666666] dark:text-[#A0A0A0]">
              {t('demo.featured.noProducts', { defaultValue: 'No products available' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: any) => (
              <ProductCardListing key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}



