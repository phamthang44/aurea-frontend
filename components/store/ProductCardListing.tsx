"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, ShoppingBag, Plus, Check } from "lucide-react";
import { ProductListingDto } from "@/lib/types/product";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface ProductCardListingProps {
  product: ProductListingDto;
  showQuickView?: boolean;
  onQuickView?: (product: ProductListingDto) => void;
}

/**
 * Format currency to VND (Vietnamese Dong) with luxury styling
 * Example: 1500000 -> "1.500.000₫"
 */
function formatVND(amount: number): string {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/,/g, ".") + "₫"
  );
}

export function ProductCardListing({
  product,
  showQuickView = true,
  onQuickView,
}: ProductCardListingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { t } = useTranslation();

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    // Add to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.thumbnail,
      brand: "AUREA",
    });

    // Show success animation
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
      toast.success(t("cart.addToCartSuccess"), {
        description: product.name,
        duration: 2000,
      });

      // Reset after animation
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    }, 600);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block no-underline focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 rounded-lg"
      >
        <div className="flex flex-col space-y-3">
          {/* Image Container - 3:4 Aspect Ratio with Luxury Border */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525] rounded-lg border-2 border-[#D4AF37]/20 group-hover:border-[#D4AF37]/60 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-[#D4AF37]/20">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={product.thumbnail.startsWith("http")}
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525]">
                <ShoppingBag className="h-16 w-16 text-[#D4AF37]/30 mb-3" />
                <p className="text-sm font-light text-[#D4AF37]/50 tracking-wider">
                  {t("cart.noImage", { defaultValue: "No Image" })}
                </p>
              </div>
            )}

            {/* Luxury Overlay on Hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Action Buttons - Centered on hover with luxury styling */}
            {showQuickView && (
              <div
                className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-6 z-30 transition-all duration-500 ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isAdding || justAdded}
                  className={`
                    bg-white/95 dark:bg-zinc-900/95 
                    border-2 transition-all duration-300
                    ${
                      justAdded
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                    }
                    shadow-lg backdrop-blur-sm font-light tracking-wide
                    ${isAdding ? "scale-95" : "scale-100"}
                  `}
                >
                  {isAdding ? (
                    <div className="h-4 w-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t("cart.addToCartSuccess", { defaultValue: "Added" })}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("cart.addToCart")}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-900 border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] shadow-lg backdrop-blur-sm"
                  onClick={handleQuickViewClick}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Product Info - Luxury Typography */}
          <div className="flex flex-col space-y-2 px-1">
            {/* Category with luxury accent */}
            {product.categoryName && (
              <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#D4AF37] dark:text-[#E5C96B]">
                {product.categoryName}
              </p>
            )}

            {/* Product Name */}
            <h3 className="text-sm font-normal text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-[#D4AF37] transition-colors duration-300 leading-relaxed">
              {product.name}
            </h3>

            {/* Price with luxury formatting */}
            <div className="flex items-baseline gap-2">
              <p className="text-base font-semibold text-[#D4AF37] dark:text-[#E5C96B] tracking-wide">
                <span className="text-xs font-normal text-gray-500 mr-1">
                  {t("cart.from", { defaultValue: "From" })}
                </span>
                {formatVND(product.price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
