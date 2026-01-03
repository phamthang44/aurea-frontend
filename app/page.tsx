"use client";

import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { ProductCardListing } from "@/components/store/ProductCardListing";
import { ProductCardSkeleton } from "@/components/store/ProductCardSkeleton";
import { Footer } from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { searchPublicProducts } from "@/lib/api/products";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  // Fetch featured/newest products for homepage
  const { data: productsResult, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const result = await searchPublicProducts({
        page: 1,
        size: 8,
        sort: "newest",
      });
      return result;
    },
  });

  const products = productsResult?.data || [];

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <LuxuryNavBar />

      {/* Hero Section - Full Viewport Height with Ken Burns Effect */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background-2.jpg"
            alt="Luxury Fashion"
            fill
            className="object-cover ken-burns"
            priority
            sizes="100vw"
          />
          {/* Overlay for better text visibility - Soft in both modes */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60 dark:from-black/70 dark:via-black/50 dark:to-black/70" />
        </div>

        {/* Subtle Radial Gradient Overlay - The "Aurea" Glow */}
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none text-[#D4AF37] mb-8 drop-shadow-2xl [text-shadow:_0_4px_20px_rgb(0_0_0_/60)]">
            AUREA
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-light tracking-wider text-black dark:text-[#E5C96B] max-w-2xl drop-shadow-lg [text-shadow:_0_2px_12px_rgb(0_0_0_/50)]">
            Where timeless elegance meets modern luxury
          </p>
        </div>
      </section>

      {/* New Arrivals Section - Masonry Grid */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-[0.05em] mb-4">
              New Arrivals
            </h2>
            <p className="text-base font-light tracking-wide text-muted-foreground mb-8">
              Discover our latest collection
            </p>
            <Link href="/shop">
              <Button
                variant="outline"
                className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
              {products.map((product) => (
                <ProductCardListing key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No products available yet
              </p>
              <Link href="/shop">
                <Button variant="outline">Browse Shop</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
