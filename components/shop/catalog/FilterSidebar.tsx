"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFilters } from "@/hooks/shop/useProductStorefront";
import { X, Check, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => void;
  onReset: () => void;
  categories?: CategoryResponse[];
  categoriesLoading?: boolean;
}

const LUXURY_COLORS = [
  { name: "Gold", hex: "#D4AF37" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Midnight", hex: "#121212" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Ruby", hex: "#E0115F" },
  { name: "Royal", hex: "#002366" },
];

const LUXURY_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

function CategoryTreeItem({
  category,
  selectedCategorySlug,
  onSelect,
  level = 0,
  expandedCategories,
  onToggleExpand,
}: {
  category: CategoryResponse;
  selectedCategorySlug: string | null;
  onSelect: (categorySlug: string) => void;
  level?: number;
  expandedCategories: Set<string>;
  onToggleExpand: (categoryId: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategorySlug === category.slug;
  const isExpanded = expandedCategories.has(category.id);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(category.id);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full flex items-center justify-between py-2 px-3 rounded-md transition-all duration-300 group",
          level > 0 ? "ml-4" : "",
          isSelected
            ? "bg-[#D4AF37]/10 text-[#D4AF37] font-medium"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
        )}
      >
        <button
          type="button"
          onClick={() => onSelect(category.slug)}
          className="flex-1 text-left"
        >
          <span className="text-xs uppercase tracking-widest">
            {category.name}
          </span>
        </button>

        <div
          className={cn(
            "flex items-center gap-1",
            !hasChildren && "pr-6", // Add padding when no expand button
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-[#D4AF37]" />}

          {hasChildren && (
            <button
              type="button"
              onClick={handleToggleExpand}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-300",
                  isExpanded ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Children */}
      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="mt-1 space-y-1 border-l-2 border-[#D4AF37]/10 ml-3">
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                selectedCategorySlug={selectedCategorySlug}
                onSelect={onSelect}
                level={level + 1}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { ChevronRight, ChevronDown } from "lucide-react";

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  categories = [],
  categoriesLoading = false,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  const [minPrice, setMinPrice] = useState<string>(
    filters.priceRange[0]?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.priceRange[1]?.toString() || "",
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

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
    if (filters.categorySlug === categorySlug) {
      onFilterChange("categorySlug", null);
    } else {
      onFilterChange("categorySlug", categorySlug);
    }
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const hasActiveFilters =
    filters.categorySlug !== null ||
    filters.priceRange[0] !== null ||
    filters.priceRange[1] !== null ||
    filters.size !== null ||
    filters.color !== null ||
    filters.inStock !== null;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/10 pb-4">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] dark:text-[#F5F5F3]">
          {t("shop.filters")}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-[10px] uppercase tracking-widest text-[#D4AF37] hover:bg-transparent p-0 h-auto"
          >
            {t("shop.resetFilters")}
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "size", "color"]}
        className="w-full"
      >
        {/* Categories */}
        <AccordionItem
          value="categories"
          className="border-zinc-100 dark:border-zinc-900"
        >
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.15em] hover:no-underline py-4">
            {t("shop.categories")}
          </AccordionTrigger>
          <AccordionContent>
            {categoriesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((category: CategoryResponse) => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    selectedCategorySlug={filters.categorySlug}
                    onSelect={handleCategorySelect}
                    expandedCategories={expandedCategories}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem
          value="price"
          className="border-zinc-100 dark:border-zinc-900"
        >
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.15em] hover:no-underline py-4">
            {t("shop.filters.priceRange", { defaultValue: "Price Range" })}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">
                    ₫
                  </span>
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="pl-8 h-10 text-xs border-zinc-100 dark:border-zinc-900 rounded-none focus-visible:ring-[#D4AF37]"
                  />
                </div>
                <div className="h-px w-3 bg-zinc-200" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">
                    ₫
                  </span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="pl-8 h-10 text-xs border-zinc-100 dark:border-zinc-900 rounded-none focus-visible:ring-[#D4AF37]"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePriceChange}
                className="w-full text-[10px] uppercase tracking-widest border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-white transition-all"
              >
                Apply Range
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size */}
        <AccordionItem
          value="size"
          className="border-zinc-100 dark:border-zinc-900"
        >
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.15em] hover:no-underline py-4">
            Size
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {LUXURY_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    onFilterChange("size", filters.size === size ? null : size)
                  }
                  className={cn(
                    "h-10 text-[10px] font-medium border transition-all duration-300",
                    filters.size === size
                      ? "bg-[#D4AF37] border-[#D4AF37] text-white"
                      : "border-zinc-100 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-[#D4AF37]/50",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color */}
        <AccordionItem
          value="color"
          className="border-zinc-100 dark:border-zinc-900"
        >
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.15em] hover:no-underline py-4">
            Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {LUXURY_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() =>
                    onFilterChange(
                      "color",
                      filters.color === color.name ? null : color.name,
                    )
                  }
                  className="group flex flex-col items-center gap-2"
                  title={color.name}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 p-0.5 transition-all duration-300",
                      filters.color === color.name
                        ? "border-[#D4AF37] scale-110"
                        : "border-transparent group-hover:border-zinc-200",
                    )}
                  >
                    <div
                      className="w-full h-full rounded-full shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                  </div>
                  <span className="text-[8px] uppercase tracking-tighter text-zinc-400">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand */}
      </Accordion>

      {/* Toggles */}
      <div className="pt-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox
            id="in-stock"
            checked={filters.inStock === true}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              onFilterChange("inStock", checked === true ? true : null)
            }
            className="border-zinc-300 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
          />
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-400 group-hover:text-[#D4AF37] transition-colors">
            In Stock Only
          </span>
        </label>
      </div>
    </div>
  );
}
