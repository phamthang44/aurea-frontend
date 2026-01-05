'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { ProductResponse } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface ProductCardProps {
  product: ProductResponse;
  showQuickView?: boolean;
  onQuickView?: (product: ProductResponse) => void;
}

/**
 * Format currency to VND (Vietnamese Dong)
 * Example: 1500000 -> "1,500,000 ₫"
 */
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if product is recently created (within last 30 days)
 */
function isNewProduct(createdAt?: string): boolean {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdDate >= thirtyDaysAgo;
}

/**
 * Check if product is sold out
 * Uses inStock field from backend if available, otherwise falls back to variant calculation
 */
function isSoldOut(product: ProductResponse): boolean {
  // Prefer backend computed inStock field
  if (product.inStock !== undefined) {
    return !product.inStock;
  }
  
  // Fallback: calculate from variants (for backward compatibility)
  const variants = product.variants;
  if (!variants || variants.length === 0) return false;
  return variants.every(
    (variant) => variant.quantity === 0 || !variant.isActive
  );
}

/**
 * Get product images from assets array or fallback to deprecated images
 */
function getProductImages(product: ProductResponse): string[] {
  // Prefer assets array (new structure)
  if (product.assets && product.assets.length > 0) {
    // Filter only IMAGE type and sort by position
    const images = product.assets
      .filter((asset) => asset.type === 'IMAGE' && !asset.variantId)
      .sort((a, b) => a.position - b.position)
      .map((asset) => asset.url);
    if (images.length > 0) return images;
  }

  // Fallback to deprecated images array
  if (product.images && product.images.length > 0) {
    return product.images;
  }

  // Fallback to deprecated thumbnail
  if (product.thumbnail) {
    return [product.thumbnail];
  }

  return [];
}

/**
 * Get the primary image URL (first image or placeholder)
 */
function getPrimaryImage(images: string[]): string | null {
  return images[0] || null;
}

/**
 * Get the secondary image URL for hover effect
 */
function getSecondaryImage(images: string[]): string | null {
  return images.length >= 2 ? images[1] : null;
}

export function ProductCard({
  product,
  showQuickView = true,
  onQuickView,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = getProductImages(product);
  const primaryImage = getPrimaryImage(images);
  const secondaryImage = getSecondaryImage(images);
  const soldOut = isSoldOut(product);
  const isNew = isNewProduct(product.createdAt);

  // Calculate display price (use lowest variant price if available, otherwise basePrice)
  const activeVariants =
    product.variants?.filter((v) => v.isActive && v.quantity > 0) || [];
  const displayPrice =
    activeVariants.length > 0
      ? Math.min(
          ...activeVariants.map((v) => v.priceOverride || product.basePrice)
        )
      : product.basePrice;

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      // Open modal for variant selection
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <ProductQuickViewModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <Link
        href={`/products/${product.slug}`}
        className="block no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <div className="flex flex-col space-y-3">
          {/* Image Container - 3:4 Aspect Ratio */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted/30 rounded-lg border border-border/50 group-hover:border-primary/50 transition-all duration-300">
            {/* Primary Image */}
            {primaryImage ? (
              <div className="absolute inset-0">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isHovered && secondaryImage
                      ? 'opacity-0 scale-110'
                      : 'opacity-100 scale-100'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
              </div>
            ) : (
              /* Placeholder if no images */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}

            {/* Secondary Image (on hover) */}
            {secondaryImage && primaryImage && (
              <div className="absolute inset-0">
                <Image
                  src={secondaryImage}
                  alt={`${product.name} - View 2`}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isNew && (
                <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-md shadow-sm">
                  New
                </span>
              )}
            </div>

            {soldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <span className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-destructive text-destructive-foreground rounded-md shadow-lg">
                  Sold Out
                </span>
              </div>
            )}

            {/* Quick View Button - Appears on hover */}
            {showQuickView && !soldOut && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-30 transition-all duration-300 ${
                  isHovered
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="bg-black/40 dark:bg-white/40 backdrop-blur-sm rounded-lg p-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-900 border-2 border-primary/50 hover:border-primary shadow-lg"
                    onClick={handleQuickViewClick}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Quick View
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-1.5">
            {/* Category */}
            {product.categoryName && (
              <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground line-clamp-1">
                {product.categoryName}
              </p>
            )}

            {/* Product Name */}
            <h3 className="text-base font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>

            {/* Price */}
            <p className="text-lg font-bold text-foreground">
              {formatVND(displayPrice)}
            </p>
          </div>
        </div>
      </Link>
    </div>
    </>
  );
}

