'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FashionProductCardProps {
  id: string;
  imageUrl: string;
  brand: string;
  name: string;
  price: number;
  currency?: string;
  spanCols?: number;
  // Stock information (optional)
  availableStock?: number;
  inStock?: boolean;
}

export function FashionProductCard({
  id,
  imageUrl,
  brand,
  name,
  price,
  currency = 'USD',
  spanCols = 1,
  availableStock,
  inStock = true, // Default to true if not provided
}: FashionProductCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);

  return (
    <div
      className={spanCols === 2 ? 'col-span-1 sm:col-span-2 lg:col-span-2' : ''}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group flex flex-col space-y-3">
        {/* Image Container - Tall aspect ratio (3:4) */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted/30 rounded-sm border border-[#D4AF37]/10 dark:border-[#3D3D3D]/50">
          {/* Link wraps the image for navigation */}
          <Link 
            href={`/product/${id}`} 
            className="absolute inset-0 z-10"
            aria-label={`View ${name}`}
          >
            <Image
              src={imageUrl}
              alt={`${brand} - ${name}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </Link>
          
          {/* Dark overlay to reduce brightness in dark mode */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />

          {/* Sold Out Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
              <span className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-destructive text-destructive-foreground rounded-md shadow-lg">
                {t("cart.soldOut", { defaultValue: "Sold Out" })}
              </span>
            </div>
          )}

          {/* Quick View Button - OUTSIDE Link with higher z-index */}
          {inStock && (
            <div
              className={`
                absolute inset-0 flex items-center justify-center z-30
                pointer-events-none
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 pointer-events-auto">
                <Button
                  variant="outline"
                  className="rounded-sm border-2 border-[#D4AF37] bg-white hover:bg-zinc-100 dark:bg-[#1A1A1A] dark:hover:bg-zinc-800 text-zinc-900 hover:text-[#B8962E] dark:text-[#D4AF37] dark:hover:text-white font-medium transition-all duration-300 shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Quick view logic would go here
                  }}
                >
                  <Eye className="h-4 w-4 mr-2 text-[#D4AF37]" />
                  {t("productCard.quickView")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Product Info - Link wraps for navigation */}
        <Link href={`/product/${id}`} className="block no-underline">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-light tracking-wider text-[#B8A072] uppercase">
              {brand}
            </p>
            <h3 className="text-sm font-light tracking-wide text-foreground group-hover:text-[#D4AF37] transition-all duration-300">
              {name}
            </h3>
            <p className="text-sm font-light tracking-wide text-[#D4AF37] dark:text-[#D4AF37]">
              {formattedPrice}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

