import { Suspense } from "react";
import { getAllCategoriesServer } from "@/lib/api/categories-server";
import { ShopClient } from "./ShopClient";
import { LuxuryNavBar } from "@/components/layout/LuxuryNavBar";
import { Footer } from "@/components/shop/catalog/Footer";
import { ProductCardSkeleton } from "@/components/shop/catalog/ProductCardSkeleton";

export const metadata = {
  title: 'Shop All | AUREA Luxury Fashion',
  description: 'Explore the curated collection of AUREA. Timeless elegance and modern luxury fashion.',
};

// Loading skeleton for the shop grid
function ShopLoadingSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const categoriesResult = await getAllCategoriesServer();
  const categories = categoriesResult.data || [];

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      <LuxuryNavBar />
      
      <main className="pt-24 lg:pt-32">
        {/* Collection Hero */}
        <div className="w-full bg-[#1A1A1A] py-20 mb-10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 text-center relative z-10">
            <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.4em] uppercase mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
              The Collection
            </p>
            <h2 className="text-4xl md:text-6xl font-light text-white italic tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Timeless <span className="font-serif">Artisanship</span>
            </h2>
            <div className="w-20 h-px bg-[#D4AF37] mx-auto" />
          </div>
        </div>

        {/* ShopClient uses useSearchParams, must be wrapped in Suspense */}
        <Suspense fallback={<ShopLoadingSkeleton />}>
          <ShopClient categories={categories} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
