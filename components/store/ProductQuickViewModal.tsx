"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { ProductListingDto, ProductResponse, VariantResponse } from "@/lib/types/product";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { productApi } from "@/lib/api/product";
import { ShoppingBag, Plus, Check, Loader2 } from "lucide-react";

interface ProductQuickViewModalProps {
  product: ProductListingDto | ProductResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Format currency to VND
 */
function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn("formatVND received invalid amount:", amount);
    return "Price unavailable";
  }
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

export function ProductQuickViewModal({
  product,
  open,
  onOpenChange,
}: ProductQuickViewModalProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const [fullProduct, setFullProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Fetch full product data (ProductResponse) when modal opens
  // ProductListingDto is only for listings - we need full ProductResponse with variants
  useEffect(() => {
    if (open && product) {
      console.log("=== ProductQuickViewModal DEBUG ===");
      console.log("1. Initial product data (from listing):", product);
      console.log("2. Product type check:", {
        isProductListingDto: "price" in product && !("basePrice" in product),
        isProductResponse: "basePrice" in product && "variants" in product,
        hasVariants: "variants" in product && (product as any).variants,
        hasBasePrice: "basePrice" in product,
        hasPrice: "price" in product,
        productKeys: Object.keys(product),
      });

      // If product is already ProductResponse with variants, use it directly
      if ("basePrice" in product && "variants" in product && (product as ProductResponse).variants) {
        console.log("3. Product is already ProductResponse with variants - using directly");
        const productResponse = product as ProductResponse;
        console.log("   Base price:", productResponse.basePrice);
        console.log("   Variants count:", productResponse.variants?.length || 0);
        console.log("   Variants:", productResponse.variants);
        setFullProduct(productResponse);
        
        // Auto-select first available variant
        const firstAvailable = productResponse.variants?.find(
          (v) => v.isActive && v.quantity > 0
        );
        if (firstAvailable) {
          console.log("   Auto-selected first available variant:", firstAvailable);
          setSelectedVariant(firstAvailable);
        }
        return;
      }

      // ProductListingDto - need to fetch full ProductResponse from API
      console.log("4. ProductListingDto detected - fetching full ProductResponse from API...");
      console.log("   Product ID:", product.id);
      setIsLoading(true);
      
      productApi
        .getProductById(product.id)
        .then((result) => {
          console.log("5. API Response received:", result);
          console.log("   Result.data:", result.data);
          console.log("   Result.error:", result.error);
          
          if (result.data) {
            const fetchedProduct: ProductResponse = result.data;
            console.log("6. Fetched ProductResponse details:", {
              id: fetchedProduct.id,
              name: fetchedProduct.name,
              basePrice: fetchedProduct.basePrice,
              basePriceType: typeof fetchedProduct.basePrice,
              basePriceIsNaN: isNaN(Number(fetchedProduct.basePrice)),
              variants: fetchedProduct.variants,
              variantsCount: fetchedProduct.variants?.length || 0,
              firstVariant: fetchedProduct.variants?.[0],
              assets: fetchedProduct.assets,
              assetsCount: fetchedProduct.assets?.length || 0,
            });
            
            // Validate basePrice
            if (!fetchedProduct.basePrice || isNaN(Number(fetchedProduct.basePrice))) {
              console.error("⚠️ Invalid basePrice in ProductResponse:", fetchedProduct.basePrice);
            }
            
            setFullProduct(fetchedProduct);
            
            // Auto-select first available variant
            const firstAvailable = fetchedProduct.variants?.find(
              (v) => v.isActive && v.quantity > 0
            );
            if (firstAvailable) {
              console.log("7. Auto-selected first available variant:", firstAvailable);
              setSelectedVariant(firstAvailable);
            } else {
              console.log("7. No available variants found");
            }
          } else {
            console.error("6. No data in result:", result);
            toast.error(t("cart.addToCartFailed"), {
              description: "Failed to load product details",
            });
          }
        })
        .catch((error) => {
          console.error("5. Failed to fetch ProductResponse:", error);
          console.error("   Error details:", {
            message: error.message,
            stack: error.stack,
            response: error.response,
            data: error.response?.data,
          });
          toast.error(t("cart.addToCartFailed"), {
            description: t("cart.addToCartFailedDescription"),
          });
        })
        .finally(() => {
          setIsLoading(false);
          console.log("=== End ProductQuickViewModal DEBUG ===");
        });
    } else if (!open) {
      // Reset state when modal closes
      setFullProduct(null);
      setSelectedVariant(null);
      setIsAdding(false);
      setJustAdded(false);
    }
  }, [open, product, t]);

  const handleAddToCart = () => {
    if (!fullProduct) {
      console.error("Cannot add to cart: fullProduct is null");
      return;
    }

    // For products with variants, require selection
    if (hasVariants && !selectedVariant) {
      toast.error(t("cart.addToCartFailed"), {
        description: t("cart.selectVariantFirst", {
          defaultValue: "Please select a variant first",
        }),
      });
      return;
    }

    // Check variant availability if variant is selected
    if (selectedVariant && (!selectedVariant.isActive || selectedVariant.quantity <= 0)) {
      toast.error(t("cart.soldOut"), {
        description: t("cart.variantOutOfStock", {
          defaultValue: "This variant is out of stock",
        }),
      });
      return;
    }

    // For products without variants, check product-level stock
    if (!hasVariants && "inStock" in displayProduct && !displayProduct.inStock) {
      toast.error(t("cart.soldOut"), {
        description: t("cart.productOutOfStock", {
          defaultValue: "This product is out of stock",
        }),
      });
      return;
    }

    setIsAdding(true);

    // Get variant image if available
    const variantImage =
      (selectedVariant && fullProduct.assets?.find((a) => a.variantId === selectedVariant.id)?.url) ||
      fullProduct.assets?.find((a) => a.isThumbnail)?.url ||
      ("thumbnail" in fullProduct ? fullProduct.thumbnail : null) ||
      undefined;

    // Add to cart with variant information (if applicable)
    addItem({
      id: fullProduct.id,
      name: fullProduct.name,
      price: selectedVariant
        ? selectedVariant.priceOverride || fullProduct.basePrice
        : basePrice,
      quantity: 1,
      imageUrl: variantImage,
      brand: "AUREA",
      inStock: selectedVariant
        ? selectedVariant.isActive && selectedVariant.quantity > 0
        : "inStock" in displayProduct
        ? displayProduct.inStock
        : true,
      availableStock: selectedVariant
        ? selectedVariant.quantity
        : "availableStock" in displayProduct
        ? displayProduct.availableStock
        : undefined,
      // Variant information (only for products with variants)
      variantId: selectedVariant?.id,
      variantSku: selectedVariant?.sku,
      variantAttributes: selectedVariant?.attributes,
    });

      // Show success animation
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
      const variantDescription = selectedVariant
        ? ` - ${Object.values(selectedVariant.attributes).join(", ")}`
        : "";
      toast.success(t("cart.addToCartSuccess"), {
        description: `${fullProduct.name}${variantDescription}`,
        duration: 2000,
      });

      // Reset after animation
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    }, 600);
  };

  if (!product) return null;

  // IMPORTANT: ProductListingDto is ONLY for listings (shop/home page)
  // ProductResponse is the full product details with variants
  // Modal MUST use ProductResponse - if we only have ProductListingDto, we fetch ProductResponse
  
  // Wait for ProductResponse to load if we're still loading
  if (isLoading || !fullProduct) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            ) : (
              <p className="text-destructive">Failed to load product details</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Now we have ProductResponse - use it for everything
  const displayProduct: ProductResponse = fullProduct;
  const variants = displayProduct.variants || [];
  const hasVariants = variants.length > 0;
  const basePrice = displayProduct.basePrice || 0;
  
  console.log("=== Price Calculation Debug ===");
  console.log("fullProduct (ProductResponse):", fullProduct);
  console.log("product (initial - ProductListingDto):", product);
  console.log("basePrice from ProductResponse:", basePrice);
  console.log("typeof basePrice:", typeof basePrice);
  console.log("isNaN(basePrice):", isNaN(basePrice));
  console.log("variants count:", variants.length);
  
  // Get thumbnail from ProductResponse assets
  const thumbnail =
    displayProduct.assets?.find((a) => a.isThumbnail)?.url ||
    displayProduct.thumbnail ||
    undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            {displayProduct.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525] rounded-lg overflow-hidden border border-[#D4AF37]/20">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={displayProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-[#D4AF37]/30 mb-3" />
                  <p className="text-sm font-light text-[#D4AF37]/50 tracking-wider">
                    {t("cart.noImage", { defaultValue: "No Image" })}
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category */}
              {displayProduct.categoryName && (
                <p className="text-sm font-medium tracking-[0.15em] uppercase text-[#D4AF37]">
                  {displayProduct.categoryName}
                </p>
              )}

              {/* Description */}
              {"description" in displayProduct && displayProduct.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {displayProduct.description}
                  </p>
                </div>
              )}

              {/* Variant Selector */}
              {hasVariants ? (
                <VariantSelector
                  variants={variants}
                  basePrice={basePrice || 0}
                  onVariantSelect={setSelectedVariant}
                  selectedVariant={selectedVariant}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="text-lg font-semibold text-[#D4AF37]">
                      {basePrice && !isNaN(basePrice) ? formatVND(basePrice) : "Price unavailable"}
                    </span>
                  </div>
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      [Dev] basePrice: {basePrice}, type: {typeof basePrice}, isNaN: {String(isNaN(basePrice))}
                    </div>
                  )}
                  {/* For products without variants, check stock from ProductListingDto */}
                  {"inStock" in displayProduct && (
                    <div className="text-sm">
                      {displayProduct.inStock ? (
                        <p className="text-green-600 dark:text-green-400">
                          {t("cart.inStock", { defaultValue: "In Stock" })}
                        </p>
                      ) : (
                        <p className="text-destructive">
                          {t("cart.soldOut", { defaultValue: "Sold Out" })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={
                  isAdding ||
                  justAdded ||
                  (hasVariants && !selectedVariant) ||
                  (hasVariants &&
                    selectedVariant &&
                    (!selectedVariant.isActive || selectedVariant.quantity <= 0)) ||
                  (!hasVariants && "inStock" in displayProduct && !displayProduct.inStock)
                }
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-base font-medium"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("cart.adding", { defaultValue: "Adding..." })}
                  </>
                ) : justAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t("cart.addToCartSuccess", { defaultValue: "Added to Cart" })}
                  </>
                ) : hasVariants && !selectedVariant ? (
                  t("cart.selectVariantFirst", { defaultValue: "Select a variant" })
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("cart.addToCart")}
                  </>
                )}
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}

