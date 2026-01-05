"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/lib/api/category";
import { CategoryResponse } from "@/lib/types/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductFilters } from "@/hooks/useProductStorefront";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => void;
  onReset: () => void;
}

/**
 * Recursive component to render category tree
 */
function CategoryTreeItem({
  category,
  selectedCategorySlug,
  onSelect,
  level = 0,
}: {
  category: CategoryResponse;
  selectedCategorySlug: string | null;
  onSelect: (categorySlug: string) => void;
  level?: number;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategorySlug === category.slug;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => onSelect(category.slug)}
        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
          level > 0 ? "pl-6" : ""
        } ${
          isSelected
            ? "bg-[#D4AF37] text-white font-medium hover:bg-[#C19B2B]"
            : "text-[#555] dark:text-[#bbb] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#333] dark:hover:text-[#ddd]"
        }`}
      >
        {category.name}
        {isSelected && <X className="inline-block ml-2 h-3 w-3" />}
      </button>
      {hasChildren && (
        <div className="ml-4 mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedCategorySlug={selectedCategorySlug}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  const [minPrice, setMinPrice] = useState<string>(
    filters.priceRange[0]?.toString() || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.priceRange[1]?.toString() || ""
  );

  // Fetch categories
  const {
    data: categoriesResult,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getAllCategories();
      // console.log("Categories API Response:", result);
      // console.log("result.data:", result.data);
      // console.log("Type of result.data:", typeof result.data);

      if (result.error) {
        console.error("Categories fetch error:", result.error);
        return [];
      }

      // Backend returns { data: { data: [...categories] } }
      const categories = (result.data as any)?.data || [];

      // console.log("Final categories array:", categories);
      return categories;
    },
  });

  // Sync local price state with filters
  useEffect(() => {
    setMinPrice(filters.priceRange[0]?.toString() || "");
    setMaxPrice(filters.priceRange[1]?.toString() || "");
  }, [filters.priceRange]);

  const handlePriceChange = () => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    onFilterChange("priceRange", [min, max]);
  };

  const handleCategorySelect = (categorySlug: string) => {
    // Toggle: if already selected, deselect
    if (filters.categorySlug === categorySlug) {
      onFilterChange("categorySlug", null);
    } else {
      onFilterChange("categorySlug", categorySlug);
    }
  };

  const hasActiveFilters =
    filters.categorySlug !== null ||
    filters.priceRange[0] !== null ||
    filters.priceRange[1] !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("filters.title")}</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            {t("filters.clearAll")}
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      <div>
        <Accordion
          type="single"
          collapsible
          defaultValue="categories"
          className="w-full"
        >
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium">
              {t("filters.categories")}
            </AccordionTrigger>
            <AccordionContent>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : categoriesError ? (
                <p className="text-sm text-destructive">
                  {t("filters.errorLoadingCategories")}
                </p>
              ) : categoriesResult && categoriesResult.length > 0 ? (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {(categoriesResult as CategoryResponse[]).map(
                    (category: CategoryResponse) => (
                      <CategoryTreeItem
                        key={category.id}
                        category={category}
                        selectedCategorySlug={filters.categorySlug}
                        onSelect={handleCategorySelect}
                      />
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("filters.noCategoriesAvailable")}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Price Filter */}
      <div>
        <Accordion
          type="single"
          collapsible
          defaultValue="price"
          className="w-full"
        >
            <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-medium">
              {t("filters.priceRange")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min-price" className="text-xs">
                      {t("filters.min")} (₫)
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={handlePriceChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handlePriceChange();
                        }
                      }}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-price" className="text-xs">
                      {t("filters.max")} (₫)
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder={t("filters.noLimit")}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={handlePriceChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handlePriceChange();
                        }
                      }}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePriceChange}
                  className="w-full"
                >
                  {t("filters.applyPriceRange")}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
