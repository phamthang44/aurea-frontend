'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { ProductResponse, ProductListingDto } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface ProductCardProps {
  product: ProductResponse | ProductListingDto;
  showQuickView?: boolean;
  onQuickView?: (product: ProductResponse) => void;
}

function isProductResponse(product: ProductResponse | ProductListingDto): product is ProductResponse {
  return 'variants' in product;
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
 * Uses a fixed reference date to avoid hydration mismatches
 */
function isNewProduct(createdAt?: string, referenceDate?: Date): boolean {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const thirtyDaysAgo = referenceDate || new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdDate >= thirtyDaysAgo;
}

/**
 * Check if product is sold out
 * Uses inStock field from backend if available, otherwise falls back to variant calculation
 */
function isSoldOut(product: ProductResponse | ProductListingDto): boolean {
  // Prefer backend computed inStock field
  if (product.inStock !== undefined) {
    return !product.inStock;
  }
  
  // Fallback: calculate from variants (only for ProductResponse)
  if (isProductResponse(product)) {
    const variants = product.variants;
    if (!variants || variants.length === 0) return false;
    return variants.every(
      (variant) => variant.quantity === 0 || !variant.isActive
    );
  }

  return false;
}

/**
 * Get product images from assets array or fallback to deprecated images
 */
function getProductImages(product: ProductResponse | ProductListingDto): string[] {
  // For ProductListingDto, we primarily rely on thumbnail
  if (!isProductResponse(product)) {
    return product.thumbnail ? [product.thumbnail] : [];
  }

  // Prefer assets array (new structure) for ProductResponse
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
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use useMemo to calculate date-dependent values only on client
  const isNew = useMemo(() => {
    if (!mounted) return false; // Return false during SSR to avoid mismatch
    // Only ProductResponse has createdAt
    const createdAt = isProductResponse(product) ? product.createdAt : undefined;
    return isNewProduct(createdAt);
  }, [product, mounted]);

  const images = getProductImages(product);
  const primaryImage = getPrimaryImage(images);
  const secondaryImage = getSecondaryImage(images);
  const soldOut = isSoldOut(product);

  // Calculate display price (use lowest variant price if available, otherwise basePrice)
  // Calculate display price (use lowest variant price if available, otherwise basePrice)
  let displayPrice = product.minPrice || (product as any).price || 0;
  
  if (isProductResponse(product)) {
    const activeVariants =
      product.variants?.filter((v) => v.isActive && v.quantity > 0) || [];
    
    if (activeVariants.length > 0) {
        const variantPrices = activeVariants
            .map((v) => v.sellingPrice)
            .filter((price): price is number => typeof price === 'number' && !isNaN(price));
        
        if (variantPrices.length > 0) {
            displayPrice = Math.min(...variantPrices);
        } else if (product.minPrice) {
            displayPrice = product.minPrice;
        }
    }
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      // Cast to ProductResponse if needed, or update onQuickView signature
      // For now, assuming handler can handle it or we pass what we have
      onQuickView(product as ProductResponse); 
    } else {
      // Open modal for variant selection
      setIsModalOpen(true);
    }
  };

  // Luxury placeholder component
  const LuxuryPlaceholder = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-[#D4AF37] rotate-45" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-[#D4AF37] rotate-12" />
      </div>
      
      {/* Icon & Text */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-[#D4AF37]/40" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37]/60">
            Aurea
          </p>
          <p className="text-[8px] tracking-widest uppercase text-zinc-400 mt-1">
            Image Coming Soon
          </p>
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#D4AF37]/20" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#D4AF37]/20" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#D4AF37]/20" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#D4AF37]/20" />
    </div>
  );

  return (
    <>
      <ProductQuickViewModal
        product={product as ProductResponse} 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with Quick View Button - positioned absolutely above Link */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted/30 rounded-lg border border-border/50 group-hover:border-primary/50 transition-all duration-300">
          {/* Link wraps only the image area for navigation */}
          <Link
            href={`/product/${product.slug}-i.${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${product.name}`}
          >
            {/* Primary Image */}
            {primaryImage && !imageError ? (
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
                  unoptimized
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <LuxuryPlaceholder />
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
                  unoptimized
                />
              </div>
            )}
          </Link>

          {/* Badges - above the link */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 pointer-events-none">
            {isNew && (
              <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-md shadow-sm">
                New
              </span>
            )}
          </div>

          {soldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
              <span className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-destructive text-destructive-foreground rounded-md shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick View Button - OUTSIDE Link, with higher z-index */}
          {showQuickView && !soldOut && (
            <div
              className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-none transition-all duration-300 ${
                isHovered
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1.5 pointer-events-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-2 border-[#D4AF37] hover:border-[#B8962E] text-zinc-900 dark:text-white font-medium shadow-lg"
                  onClick={handleQuickViewClick}
                >
                  <Eye className="h-4 w-4 mr-2 text-[#D4AF37]" />
                  Quick View
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Product Info - Link wraps this for SEO */}
        <Link
          href={`/product/${product.slug}-i.${product.id}`}
          className="block no-underline mt-3"
        >
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
              {typeof product.minPrice === 'number' && 
               typeof product.maxPrice === 'number' && 
               !isNaN(product.minPrice) &&
               !isNaN(product.maxPrice) &&
               product.minPrice !== product.maxPrice ? (
                <span>
                  From {formatVND(product.minPrice)}
                </span>
              ) : (
                formatVND(displayPrice || 0)
              )}
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}

