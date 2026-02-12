"use client";

import { useState, useEffect, SyntheticEvent } from "react";
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
import { useCart } from "@/components/providers/CartProvider";
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
  const { addItemToCart } = useCart();
  const [fullProduct, setFullProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Fetch full product data (ProductResponse) when modal opens
  // ProductListingDto is only for listings - we need full ProductResponse with variants
  useEffect(() => {
    if (open && product) {
      // If product is already ProductResponse with variants, use it directly
      if ("minPrice" in product && "variants" in product && (product as ProductResponse).variants) {
        const productResponse = product as ProductResponse;
        setFullProduct(productResponse);
        
        // Auto-select first available variant
        const firstAvailable = productResponse.variants?.find(
          (v) => v.isActive && v.quantity > 0
        );
        if (firstAvailable) {
          setSelectedVariant(firstAvailable);
        }
        return;
      }

      // ProductListingDto - need to fetch full ProductResponse from API
      setIsLoading(true);
      
      productApi
        .getProductById(product.id)
        .then((result) => {
          if (result.data) {
            const fetchedProduct: ProductResponse = result.data;
            setFullProduct(fetchedProduct);
            
            // Auto-select first available variant
            const firstAvailable = fetchedProduct.variants?.find(
              (v) => v.isActive && v.quantity > 0
            );
            if (firstAvailable) {
              setSelectedVariant(firstAvailable);
            }
          } else {
            toast.error(t("cart.addToCartFailed"), {
              description: "Failed to load product details",
            });
          }
        })
        .catch((error) => {
          toast.error(t("cart.addToCartFailed"), {
            description: t("cart.addToCartFailedDescription"),
          });
        })
        .finally(() => {
          setIsLoading(false);
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

    // Determine product variant ID - required for backend API
    // Ensure IDs are strings (they should already be strings from API, but ensure type safety)
    const productId = String(fullProduct.id);
    const productVariantId = String(selectedVariant?.id || fullProduct.id);
    
    // Add to cart using new API
    addItemToCart({
      productId: productId,
      productVariantId: productVariantId,
      quantity: 1,
    })
      .then(() => {
        // Cart state is automatically updated via shared context
        // Navigation bar will reflect the change immediately
        
        // Show success animation
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
      })
      .catch((error: any) => {
        setIsAdding(false);
        
        // Robust error message extraction
        let description = error?.message || "An unexpected error occurred";
        if (!error?.message && typeof error === 'string') {
          description = error;
        } else if (!error?.message && t) {
          description = t("cart.addToCartFailedDescription", { defaultValue: "Could not add item to cart. Please try again." });
        }

        let title = t ? t("cart.addToCartFailed", { defaultValue: "Add to Cart Failed" }) : "Add to Cart Failed";
        
        // Check for specific error code or message content for Out of Stock
        // Handle "CART_004" as generic Out of Stock
        const isOutOfStock = error?.code === 'CART_004' || 
                             description.toLowerCase().includes("không đủ hàng") || 
                             description.toLowerCase().includes("not enough stock") ||
                             description.toLowerCase().includes("sold out");

        if (isOutOfStock) {
          title = t ? t("cart.soldOut", { defaultValue: "Out of Stock" }) : "Out of Stock";
          
          // Try to extract remaining quantity from backend message
          const match = description.match(/Còn lại:\s*(\d+)/i) || description.match(/Remaining:\s*(\d+)/i);
          if (match && match[1]) {
            const remaining = parseInt(match[1]);
            if (remaining === 0) {
              description = t ? t("cart.itemSoldOut", { defaultValue: "This item is currently sold out" }) : "This item is currently sold out";
              // Update local state to reflect sold out
              if (selectedVariant) {
                 setSelectedVariant({...selectedVariant, quantity: 0, isActive: false});
              }
            } else {
              description = t ? t("cart.onlyRemaining", { 
                count: remaining, 
                defaultValue: `Only ${remaining} left in stock` 
              }) : `Only ${remaining} left in stock`;
              // Update local state to reflect accurate quantity
              if (selectedVariant) {
                 setSelectedVariant({...selectedVariant, quantity: remaining});
              }
            }
          } else {
             // Fallback if we can't parse the number but know it's out of stock
             description = t ? t("cart.itemOutOfStock", { defaultValue: "Not enough stock available" }) : "Not enough stock available";
          }
        }

        // Display the error toast
        toast.error(title, {
          description: description,
          duration: 3000,
        });
      });
  };

  if (!product) return null;

  // IMPORTANT: ProductListingDto is ONLY for listings (shop/home page)
  // ProductResponse is the full product details with variants
  // Modal MUST use ProductResponse - if we only have ProductListingDto, we fetch ProductResponse
  
  // Wait for ProductResponse to load if we're still loading
  if (isLoading || !fullProduct) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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
  const minPrice = displayProduct.minPrice || 0;
  
  // Get thumbnail from ProductResponse assets
  // Try: 1) thumbnail asset, 2) deprecated thumbnail field, 3) first asset, 4) fallback to ProductListingDto thumbnail
  const thumbnail =
    displayProduct.assets?.find((a) => a.isThumbnail)?.url ||
    displayProduct.thumbnail ||
    displayProduct.assets?.[0]?.url ||
    ("thumbnail" in product ? product.thumbnail : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-none">
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
                  unoptimized={thumbnail.startsWith("http")}
                  onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
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

              {/* Price Section - Dynamic based on selection */}
              <div className="flex flex-col gap-1 pb-4 border-b border-border">
                {selectedVariant ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-semibold text-[#D4AF37]">
                      {formatVND(selectedVariant.sellingPrice)}
                    </span>
                    {selectedVariant.originalPrice > selectedVariant.sellingPrice && (
                      <>
                        <span className="text-sm text-muted-foreground line-through decoration-zinc-400/50">
                          {formatVND(selectedVariant.originalPrice)}
                        </span>
                        <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                          -{Math.round(((selectedVariant.originalPrice - selectedVariant.sellingPrice) / selectedVariant.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                     {/* Show Range if min != max, otherwise single price */}
                     {(() => {
                        // Calculate range from variants if available
                        let calculatedMin = minPrice;
                        let calculatedMax = minPrice;
                        
                        if (hasVariants) {
                           const prices = variants.map(v => v.sellingPrice).filter(p => typeof p === 'number' && !isNaN(p));
                           if (prices.length > 0) {
                             calculatedMin = Math.min(...prices);
                             calculatedMax = Math.max(...prices);
                           }
                        }

                        if (calculatedMin !== calculatedMax) {
                          return (
                            <span className="text-2xl font-semibold text-[#D4AF37]">
                              {formatVND(calculatedMin)} - {formatVND(calculatedMax)}
                            </span>
                          );
                        }
                        return (
                          <span className="text-2xl font-semibold text-[#D4AF37]">
                             {formatVND(calculatedMin)}
                          </span>
                        );
                     })()}
                  </div>
                )}
                
                {/* Stock Status */}
                <div className="text-sm mt-1">
                  {selectedVariant ? (
                     selectedVariant.isActive && selectedVariant.quantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {t("cart.inStock", { defaultValue: "In Stock" })}
                          </span>
                          
                          {/* Low Stock Indicator - Matches ProductCardListing Luxury Badge Style */}
                          {selectedVariant.quantity <= 10 && (
                            <span className="ml-2 border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                              {t("cart.onlyRemaining", { count: selectedVariant.quantity, defaultValue: `Only ${selectedVariant.quantity} Left` })}
                            </span>
                          )}
                        </div>
                     ) : (
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] border border-zinc-200 px-3 py-1.5 inline-block">
                          {t("cart.soldOut", { defaultValue: "Sold Out" })}
                        </span>
                     )
                  ) : (
                    // General stock status
                    "inStock" in displayProduct && displayProduct.inStock === false ? (
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] border border-zinc-200 px-3 py-1.5 inline-block">
                        {t("cart.soldOut", { defaultValue: "Sold Out" })}
                      </span>
                    ) : (
                       <span className="text-muted-foreground text-xs italic">
                         {hasVariants ? "Select a variant to see availability" : "In Stock"}
                       </span>
                    )
                  )}
                </div>
              </div>

              {/* Description */}
              {"description" in displayProduct && displayProduct.description && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2 uppercase tracking-wide text-foreground/80">Description</h3>
                  <div 
                    className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: displayProduct.description }} // Ensure HTML description is rendered if backend sends HTML
                  />
                </div>
              )}

              {/* Variant Selector */}
              {hasVariants && (
                <VariantSelector
                  variants={variants}
                  minPrice={minPrice || 0}
                  onVariantSelect={setSelectedVariant}
                  selectedVariant={selectedVariant}
                />
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





