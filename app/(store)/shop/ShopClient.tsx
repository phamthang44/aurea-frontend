'use client';

import { useState } from 'react';
import { useProductStorefront } from '@/hooks/shop/useProductStorefront';
import { CategoryResponse } from '@/lib/types/product';
import { FilterSidebar } from '@/components/shop/catalog/FilterSidebar';
import { ProductCardListing } from '@/components/shop/catalog/ProductCardListing';
import { ProductCardSkeleton } from '@/components/shop/catalog/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ShopClientProps {
  categories: CategoryResponse[];
}

export function ShopClient({ categories }: ShopClientProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    products,
    isLoading,
    filters,
    setFilter,
    pagination,
    setPage,
    resetFilters,
    hasNextPage,
    hasPreviousPage,
  } = useProductStorefront();

  const activeFiltersCount = [
    filters.categorySlug,
    filters.priceRange[0],
    filters.priceRange[1],
    filters.size,
    filters.color,

    filters.inStock !== null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-5 py-10">
      {/* Search & Breadcrumbs */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F3] mb-2 uppercase italic">
            {t('navbar.shop')}
          </h1>
          <p className="text-sm text-zinc-500 font-light">
            {pagination.totalElements} {t('shop.allProducts').toLowerCase()}
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#D4AF37] transition-colors" />
          <Input
            placeholder={t('shop.searchPlaceholder')}
            value={filters.keyword}
            onChange={(e) => setFilter('keyword', e.target.value)}
            className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-full focus-visible:ring-[#D4AF37] transition-all"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-md border-y border-zinc-100 dark:border-zinc-900 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden border-zinc-200 dark:border-zinc-800">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('shop.filters')}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-[#D4AF37] text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r border-[#D4AF37]/20">
              <SheetHeader>
                <SheetTitle className="text-xl font-light tracking-widest uppercase italic">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-100px)]">
                <FilterSidebar 
                  filters={filters} 
                  onFilterChange={setFilter} 
                  onReset={resetFilters}
                  categories={categories}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* View Toggles (Desktop) */}
          <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select 
            value={filters.sort || 'newest'} 
            onValueChange={(val) => setFilter('sort', val as any)}
          >
            <SelectTrigger className="w-[180px] h-10 border-none bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors uppercase text-[10px] tracking-widest font-bold">
              <SelectValue placeholder={t('shop.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('shop.sort.newest')}</SelectItem>
              <SelectItem value="price_asc">{t('shop.sort.priceAsc')}</SelectItem>
              <SelectItem value="price_desc">{t('shop.sort.priceDesc')}</SelectItem>
              <SelectItem value="name_asc">{t('shop.sort.nameAsc')}</SelectItem>
              <SelectItem value="name_desc">{t('shop.sort.nameDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-40 scrollbar-luxury overflow-y-auto max-h-[calc(100vh-200px)]">
            <FilterSidebar 
              filters={filters} 
              onFilterChange={setFilter} 
              onReset={resetFilters}
              categories={categories}
            />
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          {/* Active Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.categorySlug && (() => {
                // Find category name recursively
                const findCategory = (cats: CategoryResponse[], slug: string): CategoryResponse | null => {
                  for (const cat of cats) {
                    if (cat.slug === slug) return cat;
                    if (cat.children?.length) {
                      const found = findCategory(cat.children, slug);
                      if (found) return found;
                    }
                  }
                  return null;
                };
                const category = findCategory(categories, filters.categorySlug);
                
                return (
                  <Badge variant="outline" className="pl-3 pr-1 py-1 rounded-full border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]">
                    Category: {category?.name || filters.categorySlug}
                    <X 
                      className="ml-2 h-3 w-3 cursor-pointer hover:text-black" 
                      onClick={() => setFilter('categorySlug', null)} 
                    />
                  </Badge>
                );
              })()}
              {filters.color && (
                <Badge variant="outline" className="pl-3 pr-1 py-1 rounded-full border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]">
                  Color: {filters.color}
                  <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => setFilter('color', null)} />
                </Badge>
              )}
              {/* Add more tag if needed */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-xs text-zinc-400 hover:text-black"
              >
                {t('shop.resetFilters')}
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
              : "flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
            }>
              {products.map((product) => (
                <ProductCardListing 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-zinc-300" />
              </div>
              <h3 className="text-xl font-light mb-2">{t('shop.noProductsFound')}</h3>
              <p className="text-zinc-500 mb-8">{t('shop.tryAdjustingFilters')}</p>
              <Button onClick={resetFilters} variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                {t('shop.resetFilters')}
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={!hasPreviousPage}
                onClick={() => setPage(pagination.page - 1)}
                className="rounded-full border-[#D4AF37]/20 hover:border-[#D4AF37]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 mx-4">
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Simple pagination logic: show current, first, last, and neighbors
                  if (
                    p === 1 || 
                    p === pagination.totalPages || 
                    (p >= pagination.page - 1 && p <= pagination.page + 1)
                  ) {
                    return (
                      <Button
                        key={p}
                        variant={pagination.page === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-full ${
                          pagination.page === p 
                            ? "bg-[#D4AF37] text-white hover:bg-[#B8962E]" 
                            : "text-zinc-500 hover:text-black font-light"
                        }`}
                      >
                        {p}
                      </Button>
                    );
                  }
                  if (p === pagination.page - 2 || p === pagination.page + 2) {
                    return <span key={p} className="text-zinc-300">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={!hasNextPage}
                onClick={() => setPage(pagination.page + 1)}
                className="rounded-full border-[#D4AF37]/20 hover:border-[#D4AF37]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
