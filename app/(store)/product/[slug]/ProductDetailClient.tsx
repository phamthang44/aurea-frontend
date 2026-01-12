'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  Minus, 
  Plus,
  ZoomIn,
  Star,
  Truck,
  RotateCcw,
  Shield,
  ChevronLeft as ChevronLeftIcon,
  X
} from 'lucide-react';
import { ProductResponse, VariantResponse, ProductAsset } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/components/providers/CartProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductDetailClientProps {
  product: ProductResponse;
}

// Helper to format VND
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/,/g, '.') + 'đ';
}

// Extract unique attribute values from variants
function extractUniqueAttributes(variants: VariantResponse[]) {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  
  variants.forEach(v => {
    if (v.attributes?.color) colors.add(v.attributes.color);
    if (v.attributes?.size) sizes.add(v.attributes.size);
  });
  
  return {
    colors: Array.from(colors),
    sizes: Array.from(sizes),
  };
}

// Find variant by selected attributes
function findVariant(
  variants: VariantResponse[], 
  selectedColor: string | null, 
  selectedSize: string | null
): VariantResponse | null {
  return variants.find(v => 
    v.attributes?.color === selectedColor && 
    v.attributes?.size === selectedSize &&
    v.isActive
  ) || null;
}

// Check if a size is available for a given color
function isSizeAvailableForColor(
  variants: VariantResponse[], 
  color: string | null, 
  size: string
): boolean {
  if (!color) return variants.some(v => v.attributes?.size === size && v.quantity > 0 && v.isActive);
  return variants.some(v => 
    v.attributes?.color === color && 
    v.attributes?.size === size && 
    v.quantity > 0 &&
    v.isActive
  );
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { t } = useTranslation();
  const { addItemToCart, loading: cartLoading } = useCart();
  
  // Image Gallery State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Wishlist State (local for now)
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Luxury placeholder for missing/failed images
  const LuxuryPlaceholder = ({ isThumbnail = false }: { isThumbnail?: boolean }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-hidden">
      {/* Decorative Pattern - hidden on tiny thumbnails */}
      {!isThumbnail && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)' 
          }} />
        </div>
      )}
      
      {/* Logo Area */}
      <div className={cn("relative flex flex-col items-center z-10", isThumbnail ? "gap-1" : "gap-4")}>
        <div className={cn(
          "rounded-full border border-[#D4AF37]/30 flex items-center justify-center",
          isThumbnail ? "w-8 h-8" : "w-16 h-16"
        )}>
          <ShoppingBag className={cn("text-[#D4AF37]/40", isThumbnail ? "h-4 w-4" : "h-8 w-8")} />
        </div>
        <div className="text-center">
          <p className={cn("font-bold tracking-[0.3em] uppercase text-[#D4AF37]/60", isThumbnail ? "text-[6px]" : "text-[10px]")}>
            Aurea
          </p>
          {!isThumbnail && (
            <p className="text-[8px] tracking-widest uppercase text-zinc-400 mt-1">
              Image Coming Soon
            </p>
          )}
        </div>
      </div>
      
      {/* Corner Accents - hidden on tiny thumbnails */}
      {!isThumbnail && (
        <>
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#D4AF37]/20" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#D4AF37]/20" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#D4AF37]/20" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#D4AF37]/20" />
        </>
      )}
    </div>
  );

  // Dedicated component for product images with local error state
  const ProductImage = ({ 
    src, 
    alt, 
    fill = true, 
    className = "", 
    isThumbnail = false,
    priority = false,
    sizes,
    onImageError,
    style
  }: { 
    src?: string; 
    alt: string; 
    fill?: boolean; 
    className?: string; 
    isThumbnail?: boolean;
    priority?: boolean;
    sizes?: string;
    onImageError?: () => void;
    style?: React.CSSProperties;
  }) => {
    const [localError, setLocalError] = useState(false);

    if (!src || localError) {
      return <LuxuryPlaceholder isThumbnail={isThumbnail} />;
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        style={style}
        priority={priority}
        sizes={sizes}
        quality={isThumbnail ? 60 : 100}
        onError={() => {
          setLocalError(true);
          onImageError?.();
        }}
      />
    );
  };
  
  // Derive values
  const { colors, sizes } = useMemo(() => extractUniqueAttributes(product.variants || []), [product.variants]);
  
  const selectedVariant = useMemo(() => 
    findVariant(product.variants || [], selectedColor, selectedSize),
    [product.variants, selectedColor, selectedSize]
  );
  
  const currentPrice = selectedVariant?.priceOverride || product.basePrice;
  const isInStock = selectedVariant ? selectedVariant.quantity > 0 : (product.variants || []).some(v => v.quantity > 0);
  const maxQuantity = selectedVariant?.quantity || 10;
  
  // Images - sort by position, prioritize product-level images
  const images: ProductAsset[] = useMemo(() => {
    const allAssets = product.assets || [];
    return allAssets
      .filter(a => a.type === 'IMAGE')
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [product.assets]);
  
  const currentImage = images[selectedImageIndex]?.url || product.thumbnail || '';
  
  // Handlers
  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    // Reset size if current size is not available for new color
    if (selectedSize && !isSizeAvailableForColor(product.variants || [], color, selectedSize)) {
      setSelectedSize(null);
    }
  }, [product.variants, selectedSize]);
  
  const handleSizeSelect = useCallback((size: string) => {
    if (isSizeAvailableForColor(product.variants || [], selectedColor, size)) {
      setSelectedSize(size);
    }
  }, [product.variants, selectedColor]);
  
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, maxQuantity)));
  }, [maxQuantity]);
  
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error(t('product.selectVariant', { defaultValue: 'Please select size and color' }));
      return;
    }
    
    try {
      await addItemToCart({
        productId: product.id,
        productVariantId: selectedVariant.id,
        quantity,
      });
      toast.success(t('product.addedToCart', { defaultValue: 'Added to cart!' }), {
        description: `${product.name} - ${selectedColor}, ${selectedSize} x ${quantity}`,
      });
    } catch (error) {
      toast.error(t('product.addToCartError', { defaultValue: 'Failed to add to cart' }));
    }
  };
  
  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast.error(t('product.selectVariant', { defaultValue: 'Please select size and color' }));
      return;
    }
    
    try {
      await addItemToCart({
        productId: product.id,
        productVariantId: selectedVariant.id,
        quantity,
      });
      // Navigate to checkout
      window.location.href = '/checkout';
    } catch (error) {
      toast.error(t('product.addToCartError', { defaultValue: 'Failed to add to cart' }));
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };
  
  const canAddToCart = selectedColor && selectedSize && selectedVariant && selectedVariant.quantity > 0;

  return (
    <>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/80 hover:text-white"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-8 w-8" />
            </button>
            
            <button 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
              }}
            >
              <ChevronLeftIcon className="h-10 w-10" />
            </button>
            
            <div className="relative w-[80vw] h-[80vh]">
              <ProductImage
                src={currentImage}
                alt={product.name}
                className="object-contain"
                priority
              />
            </div>
            
            <button 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
              }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">
            {t('nav.home', { defaultValue: 'Home' })}
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">
            {t('nav.shop', { defaultValue: 'Shop' })}
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link 
                href={`/shop?categorySlug=${product.categoryName.toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-[#D4AF37] transition-colors whitespace-nowrap"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-zinc-800 dark:text-zinc-200 truncate">{product.name}</span>
        </nav>
        
        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden cursor-zoom-in group"
              onMouseEnter={() => currentImage && setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => currentImage && setLightboxOpen(true)}
            >
              <ProductImage
                src={currentImage}
                alt={product.name}
                className={cn(
                  "object-cover transition-transform duration-300",
                  isZoomed && "scale-150"
                )}
                style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Zoom indicator - only show if image exists */}
              {currentImage && (
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </div>
              )}
              
              {/* Out of Stock Overlay */}
              {!isInStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-bold uppercase tracking-widest px-6 py-3 border-2 border-white">
                    {t('product.soldOut', { defaultValue: 'Sold Out' })}
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                      selectedImageIndex === index 
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20" 
                        : "border-transparent hover:border-zinc-300"
                    )}
                  >
                    <ProductImage
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="object-cover"
                      sizes="80px" 
                      isThumbnail
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* RIGHT: Product Info */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
            {/* Category */}
            {product.categoryName && (
              <Link 
                href={`/shop?categorySlug=${product.categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37] hover:text-[#B8962E] transition-colors"
              >
                {product.categoryName}
              </Link>
            )}
            
            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                {formatVND(currentPrice)}
              </span>
              {selectedVariant?.priceOverride && selectedVariant.priceOverride !== product.basePrice && (
                <span className="text-lg text-zinc-400 line-through">
                  {formatVND(product.basePrice)}
                </span>
              )}
            </div>
            
            {/* Rating - Hidden for MVP (uncomment when reviews API is available)
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "h-4 w-4",
                      star <= 4 ? "fill-[#D4AF37] text-[#D4AF37]" : "text-zinc-300"
                    )} 
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-500">(0 reviews)</span>
            </div>
            */}
            
            {/* Short Description */}
            {product.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
            
            <hr className="border-zinc-200 dark:border-zinc-800" />
            
            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t('product.color', { defaultValue: 'Color' })}
                  </span>
                  {selectedColor && (
                    <span className="text-sm text-zinc-500">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "relative px-4 py-2 text-sm border rounded-md transition-all",
                        selectedColor === color
                          ? "border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      )}
                    >
                      {color}
                      {selectedColor === color && (
                        <Check className="absolute -top-1 -right-1 h-4 w-4 text-[#D4AF37] bg-white dark:bg-zinc-900 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t('product.size', { defaultValue: 'Size' })}
                  </span>
                  <button className="text-xs text-[#D4AF37] hover:underline">
                    {t('product.sizeGuide', { defaultValue: 'Size Guide' })}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const isAvailable = isSizeAvailableForColor(product.variants || [], selectedColor, size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={cn(
                          "w-12 h-12 text-sm font-medium border rounded-md transition-all",
                          !isAvailable && "opacity-40 cursor-not-allowed line-through",
                          selectedSize === size
                            ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                            : isAvailable
                              ? "border-zinc-200 dark:border-zinc-700 hover:border-[#D4AF37]"
                              : "border-zinc-200 dark:border-zinc-700"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Stock Status */}
            {selectedVariant && (
              <div className="flex items-center gap-2 text-sm">
                {selectedVariant.quantity > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t('product.inStock', { defaultValue: 'In Stock' })} 
                      {selectedVariant.quantity <= 5 && ` - ${t('product.onlyLeft', { count: selectedVariant.quantity, defaultValue: `Only ${selectedVariant.quantity} left` })}`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-600 dark:text-red-400">
                      {t('product.outOfStock', { defaultValue: 'Out of Stock' })}
                    </span>
                  </>
                )}
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('product.quantity', { defaultValue: 'Quantity' })}
              </span>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-md">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart || cartLoading}
                className="flex-1 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-none text-sm font-medium uppercase tracking-widest disabled:opacity-50"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {t('product.addToCart', { defaultValue: 'Add to Cart' })}
              </Button>
              
              <Button
                onClick={handleBuyNow}
                disabled={!canAddToCart || cartLoading}
                className="flex-1 h-14 bg-[#D4AF37] text-white hover:bg-[#B8962E] rounded-none text-sm font-medium uppercase tracking-widest disabled:opacity-50"
              >
                {t('product.buyNow', { defaultValue: 'Buy Now' })}
              </Button>
            </div>
            
            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#D4AF37] transition-colors"
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-[#D4AF37] text-[#D4AF37]")} />
                {t('product.addToWishlist', { defaultValue: 'Add to Wishlist' })}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t('product.linkCopied', { defaultValue: 'Link copied!' }));
                }}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#D4AF37] transition-colors"
              >
                <Share2 className="h-5 w-5" />
                {t('product.share', { defaultValue: 'Share' })}
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-6 w-6 text-[#D4AF37]" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  {t('product.freeShipping', { defaultValue: 'Free Shipping' })}
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-6 w-6 text-[#D4AF37]" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  {t('product.easyReturns', { defaultValue: '30-Day Returns' })}
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-6 w-6 text-[#D4AF37]" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  {t('product.securePayment', { defaultValue: 'Secure Payment' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Below: Full Description, Size Guide, Reviews, etc. */}
        <div className="mt-20 space-y-16">
          {/* Full Description */}
          <section>
            <h2 className="text-xl font-light text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">
              {t('product.description', { defaultValue: 'Description' })}
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {product.description || t('product.noDescription', { defaultValue: 'No description available.' })}
              </p>
            </div>
          </section>
          
          {/* Size Guide - Placeholder */}
          <section>
            <h2 className="text-xl font-light text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">
              {t('product.sizeGuide', { defaultValue: 'Size Guide' })}
            </h2>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-lg">
              <p className="text-zinc-500 text-center">
                {t('product.sizeGuideComingSoon', { defaultValue: 'Size guide coming soon...' })}
              </p>
            </div>
          </section>
          
          {/* Reviews - Placeholder with API Feedback */}
          <section>
            <h2 className="text-xl font-light text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">
              {t('product.reviews', { defaultValue: 'Reviews' })}
            </h2>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-lg text-center">
              <Star className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500">
                {t('product.noReviewsYet', { defaultValue: 'No reviews yet. Be the first to review this product!' })}
              </p>
              {/* API FEEDBACK: Need ReviewController for GET /api/v1/products/{id}/reviews */}
            </div>
          </section>
          
          {/* Related Products - Placeholder with API Feedback */}
          <section>
            <h2 className="text-xl font-light text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">
              {t('product.youMayAlsoLike', { defaultValue: 'You May Also Like' })}
            </h2>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-lg text-center">
              <p className="text-zinc-500">
                {t('product.relatedComingSoon', { defaultValue: 'Related products coming soon...' })}
              </p>
              {/* API FEEDBACK: Need GET /api/v1/products/{id}/related or category-based filtering */}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
