"use client";

import { useState, useMemo, useEffect } from "react";
import { VariantResponse, VariantAttributes } from "@/lib/types/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface VariantSelectorProps {
  variants: VariantResponse[];
  minPrice: number;
  onVariantSelect: (variant: VariantResponse | null) => void;
  selectedVariant?: VariantResponse | null;
}

/**
 * Extract unique attribute keys from all variants
 * Example: { "Size": ["S", "M", "L"], "Color": ["Red", "Blue"] }
 */
function extractAttributeOptions(variants: VariantResponse[]): Record<string, string[]> {
  const options: Record<string, Set<string>> = {};
  
  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([key, value]) => {
      if (!options[key]) {
        options[key] = new Set();
      }
      options[key].add(value);
    });
  });
  
  return Object.fromEntries(
    Object.entries(options).map(([key, values]) => [key, Array.from(values).sort()])
  );
}

/**
 * Find variant matching selected attributes
 */
function findMatchingVariant(
  variants: VariantResponse[],
  selectedAttributes: VariantAttributes
): VariantResponse | null {
  return (
    variants.find((variant) => {
      return Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      );
    }) || null
  );
}

export function VariantSelector({
  variants,
  minPrice,
  onVariantSelect,
  selectedVariant,
}: VariantSelectorProps) {
  const { t } = useTranslation();
  const [selectedAttributes, setSelectedAttributes] = useState<VariantAttributes>(() => {
    // Initialize with first variant's attributes if available
    if (selectedVariant) {
      return { ...selectedVariant.attributes };
    }
    return variants.length > 0 ? { ...variants[0].attributes } : {};
  });

  const attributeOptions = useMemo(() => extractAttributeOptions(variants), [variants]);

  // Find matching variant based on selected attributes
  const currentVariant = useMemo(() => {
    return findMatchingVariant(variants, selectedAttributes);
  }, [variants, selectedAttributes]);

  // Update parent when variant changes
  useEffect(() => {
    onVariantSelect(currentVariant);
  }, [currentVariant, onVariantSelect]);

  const handleAttributeChange = (attributeKey: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attributeKey]: value };
    setSelectedAttributes(newAttributes);
    
    // Find matching variant and notify parent
    const matchingVariant = findMatchingVariant(variants, newAttributes);
    onVariantSelect(matchingVariant);
  };

  // Calculate display price
  const displayPrice = currentVariant
    ? currentVariant.sellingPrice || minPrice
    : minPrice;

  // Check if variant is available
  const isAvailable = currentVariant
    ? currentVariant.isActive && currentVariant.quantity > 0
    : false;

  return (
    <div className="space-y-4">
      {/* Attribute Selectors */}
      {Object.entries(attributeOptions).map(([attributeKey, values]) => (
        <div key={attributeKey} className="space-y-2">
          <label className="text-sm font-medium text-foreground capitalize">
            {attributeKey}:
            {currentVariant && (
              <span className="ml-2 text-muted-foreground">
                {currentVariant.attributes[attributeKey]}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedAttributes[attributeKey] === value;
              // Check if this option is available in any variant
              const hasAvailableVariant = variants.some(
                (v) =>
                  v.attributes[attributeKey] === value &&
                  v.isActive &&
                  v.quantity > 0
              );

              return (
                <Button
                  key={value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAttributeChange(attributeKey, value)}
                  disabled={!hasAvailableVariant}
                  className={cn(
                    "min-w-[60px] transition-all",
                    isSelected
                      ? "bg-[#D4AF37] hover:bg-[#B8941F] text-white border-[#D4AF37]"
                      : "border-gray-300 dark:border-gray-600",
                    !hasAvailableVariant && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price Display - Moved to Parent Modal */}
      {/* <div className="pt-2 border-t border-border">...</div> */}

      {/* Stock Status - Moved to Parent Modal */}
      {/* {currentVariant && (...)} */}

      {/* Warning if no variant matches */}
      {!currentVariant && Object.keys(selectedAttributes).length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {t("cart.variantNotAvailable", {
            defaultValue: "This combination is not available",
          })}
        </p>
      )}
    </div>
  );
}

