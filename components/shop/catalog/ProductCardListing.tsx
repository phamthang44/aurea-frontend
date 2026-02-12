'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, ShoppingBag, Plus, Heart, Star } from "lucide-react";
import { ProductListingDto } from "@/lib/types/product";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { cn } from "@/lib/utils";

interface ProductCardListingProps {
  product: ProductListingDto;
  showQuickView?: boolean;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/,/g, ".") + "đ";
}

// Luxury placeholder component for missing/broken images
function LuxuryPlaceholder() {
  return (
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
}

export function ProductCardListing({
  product,
  showQuickView = true,
}: ProductCardListingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  
  const isInStock = product.inStock !== undefined ? product.inStock : true;
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 12;
  const colors = product.availableColors || ["#D4AF37", "#121212", "#E5E5E5"];

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <ProductQuickViewModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <div
        className="group relative flex flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative block aspect-[3/4] overflow-hidden bg-zinc-50 dark:bg-zinc-900 rounded-sm">
          {/* Link for navigation - covers the image */}
          <Link
            href={`/product/${product.slug}-i.${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${product.name}`}
          >
            {/* Main Image */}
            {product.thumbnail && !imageError ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <LuxuryPlaceholder />
            )}
          </Link>

          {/* Luxury Badge (Sale/New) - pointer-events-none so clicks pass through */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
            {product.isNew && (
              <span className="bg-[#D4AF37] text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 items-center justify-center flex shadow-xl">
                New
              </span>
            )}
            {product.onSale && (
              <span className="bg-white text-black text-[8px] font-bold uppercase tracking-widest px-3 py-1 items-center justify-center flex shadow-xl">
                Sale
              </span>
            )}
            {/* Low Stock Badge - Show when stock is low (<= 10) but not sold out */}
            {isInStock && product.availableStock !== undefined && product.availableStock > 0 && product.availableStock <= 10 && (
               <span className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[8px] font-bold uppercase tracking-widest px-3 py-1 items-center justify-center flex shadow-xl backdrop-blur-sm">
                 Only {product.availableStock} Left
               </span>
            )}
          </div>

          {/* Wishlist Button - outside Link with higher z-index */}
          <button
            onClick={toggleWishlist}
            className={cn(
               "absolute top-4 right-4 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md",
               isWishlisted 
                ? "bg-[#D4AF37] text-white" 
                : "bg-white/50 text-black hover:bg-white"
            )}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </button>

          {/* Action Overlay - outside Link with higher z-index, pointer-events-none on wrapper */}
          <div className={cn(
            "absolute inset-0 z-30 bg-black/5 flex flex-col items-center justify-center gap-4 transition-all duration-500 backdrop-blur-[2px] pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
              <Button
                onClick={handleAddToCart}
                className="bg-black text-white hover:bg-[#D4AF37] rounded-none px-8 py-6 text-xs uppercase tracking-widest transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              {showQuickView && (
                <button 
                  onClick={handleQuickViewClick}
                  className="text-white text-[10px] uppercase font-bold tracking-widest hover:text-[#D4AF37] underline transition-colors"
                >
                  Quick View
                </button>
              )}
            </div>
          </div>

          {/* Sold Out */}
          {!isInStock && (
            <div className="absolute inset-0 bg-white/80 dark:bg-[#0D0D0D]/80 flex items-center justify-center z-20 pointer-events-none">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] border border-zinc-200 px-6 py-3">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-6 pb-2 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              {product.categoryName && (
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                  {product.categoryName}
                </p>
              )}
              <h3 className="text-sm font-light text-zinc-900 dark:text-zinc-100 hover:text-[#D4AF37] transition-colors leading-snug">
                <Link href={`/product/${product.slug}-i.${product.id}`}>{product.name}</Link>
              </h3>
            </div>
            <div className="text-right">
              {typeof product.minPrice === 'number' && 
               typeof product.maxPrice === 'number' && 
               !isNaN(product.minPrice) && 
               !isNaN(product.maxPrice) && 
               product.minPrice !== product.maxPrice ? (
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-serif italic pr-4">
                  {formatVND(product.minPrice)} - {formatVND(product.maxPrice)}
                </p>
              ) : (
                product.onSale && 
                typeof product.discountPrice === 'number' && 
                !isNaN(product.discountPrice) ? (
                  <>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatVND(product.discountPrice)}
                    </p>
                    <p className="text-[10px] text-zinc-400 line-through">
                      {formatVND(product.minPrice || product.price || 0)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-serif italic pr-4">
                    {formatVND(product.minPrice || product.price || 0)}
                  </p>
                )
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={cn(
                    "h-2.5 w-2.5", 
                    s <= Math.floor(rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-zinc-300"
                  )} 
                />
              ))}
            </div>
            <span className="text-[9px] text-zinc-400 font-light">({reviewCount})</span>
          </div>

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 pt-1">
            {colors.map((color, i) => (
              <div 
                key={i}
                className="w-3 h-3 rounded-full border border-zinc-200 p-0.5"
                title={color}
              >
                <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
              </div>
            ))}
            {colors.length > 3 && (
              <span className="text-[8px] text-zinc-400">+{colors.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
