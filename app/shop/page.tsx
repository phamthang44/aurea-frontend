"use client";

import { useState, useEffect } from "react";
import { useProductStorefront } from "@/hooks/useProductStorefront";
import { ProductCardListing } from "@/components/store/ProductCardListing";
import { ProductCardSkeleton } from "@/components/store/ProductCardSkeleton";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { Footer } from "@/components/store/Footer";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, ShoppingBag, Search, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/lib/api/category";
import Link from "next/link";

export default function ShopPage() {
  const {
    products,
    isLoading,
    error,
    filters,
    setFilter,
    pagination,
    setPage,
    resetFilters,
    hasNextPage,
    hasPreviousPage,
  } = useProductStorefront();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync searchQuery with filters.keyword
  useEffect(() => {
    setSearchQuery(filters.keyword);
  }, [filters.keyword]);

  // Get category name for title
  const { data: categoriesResult } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getAllCategories();
      if (result.error) {
        return [];
      }
      // Backend returns { data: { data: [...categories] } }
      return (result.data as any)?.data || [];
    },
  });

  // Find selected category name
  const findCategoryName = (
    categories: any[],
    categoryId: string | null
  ): string | null => {
    if (!categoryId || !categories) return null;
    for (const cat of categories) {
      if (cat.id === categoryId) return cat.name;
      if (cat.children) {
        const found = findCategoryName(cat.children, categoryId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategoryName = findCategoryName(
    categoriesResult || [],
    filters.categoryId
  );

  // Calculate showing range
  const startItem =
    pagination.totalElements > 0
      ? (pagination.page - 1) * pagination.limit + 1
      : 0;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalElements
  );

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <LuxuryNavBar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-1 mt-20">
        {/* Breadcrumb & Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors duration-200 no-underline group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategoryName || "All Products"}
              </h1>
              {pagination.totalElements > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing {startItem}-{endItem} of {pagination.totalElements}{" "}
                  {pagination.totalElements === 1 ? "product" : "products"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={setFilter}
                      onReset={resetFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select
                value={filters.sort || "newest"}
                onValueChange={(value: any) => setFilter("sort", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFilter("keyword", e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex gap-8">
          {/* Left Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilter}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {error ? (
              <div className="text-center py-12">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg max-w-md mx-auto">
                  <p className="font-medium">Error loading products</p>
                  <p className="text-sm mt-1">{error.message}</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCardListing key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={!hasPreviousPage}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <div key={index}>
                            {page === "..." ? (
                              <span className="px-2 py-1 text-muted-foreground">
                                ...
                              </span>
                            ) : (
                              <Button
                                variant={
                                  page === pagination.page ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => setPage(page as number)}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={!hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
