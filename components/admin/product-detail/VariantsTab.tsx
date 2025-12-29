"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Plus, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantsTabProps {
  data: {
    basePrice: number;
    variants?: any[];
  };
  onChange: (updates: any) => void;
}

export function VariantsTab({ data, onChange }: VariantsTabProps) {
  const [hasVariants, setHasVariants] = useState((data.variants?.length || 0) > 0);
  const [variants, setVariants] = useState(data.variants || []);

  const handleToggleVariants = () => {
    if (hasVariants) {
      // Switching to simple product
      if (confirm("This will remove all variants. Continue?")) {
        setHasVariants(false);
        setVariants([]);
        onChange({ variants: [] });
      }
    } else {
      // Switching to product with variants
      setHasVariants(true);
      const defaultVariant = {
        id: Date.now().toString(),
        sku: "",
        attributes: { size: "M", color: "Black" },
        priceOverride: 0,
        quantity: 0,
        isActive: true,
      };
      setVariants([defaultVariant]);
      onChange({ variants: [defaultVariant] });
    }
  };

  const addVariant = () => {
    const newVariant = {
      id: Date.now().toString(),
      sku: "",
      attributes: { size: "", color: "" },
      priceOverride: 0,
      quantity: 0,
      isActive: true,
    };
    const updated = [...variants, newVariant];
    setVariants(updated);
    onChange({ variants: updated });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field.startsWith("attributes.")) {
      const attrKey = field.split(".")[1];
      updated[index].attributes = {
        ...updated[index].attributes,
        [attrKey]: value,
      };
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
    onChange({ variants: updated });
  };

  const removeVariant = (index: number) => {
    if (confirm("Remove this variant?")) {
      const updated = variants.filter((_, i) => i !== index);
      setVariants(updated);
      onChange({ variants: updated });
    }
  };

  return (
    <div className="space-y-8 max-w-full">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Variants & Pricing
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure product pricing and inventory
        </p>
      </div>

      {/* Toggle: Simple vs Variants */}
      <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg border border-border">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">Product Type</h3>
          <p className="text-sm text-muted-foreground">
            {hasVariants
              ? "This product has multiple variants (size, color, etc.)"
              : "This is a simple product with a single price"}
          </p>
        </div>
        <Button
          onClick={handleToggleVariants}
          variant="outline"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10"
        >
          {hasVariants ? "Convert to Simple" : "Add Variants"}
        </Button>
      </div>

      {/* Simple Product Pricing */}
      {!hasVariants && (
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-foreground font-medium">
                Price (VND) <span className="text-red-500">*</span>
              </Label>
              <CurrencyInput
                id="basePrice"
                value={data.basePrice}
                onChange={(value) => onChange({ basePrice: value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-foreground font-medium">
                Stock Quantity
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-foreground font-medium">
              SKU (Stock Keeping Unit)
            </Label>
            <Input
              id="sku"
              placeholder="e.g., SHIRT-001"
              className="bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* Variants Table */}
      {hasVariants && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
              Variants Matrix
            </h3>
            <Button
              onClick={addVariant}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Price (VND)
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant, index) => (
                  <tr key={variant.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <Input
                        value={variant.attributes?.size || ""}
                        onChange={(e) =>
                          updateVariant(index, "attributes.size", e.target.value)
                        }
                        placeholder="M"
                        className="h-9 bg-background"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={variant.attributes?.color || ""}
                        onChange={(e) =>
                          updateVariant(index, "attributes.color", e.target.value)
                        }
                        placeholder="Black"
                        className="h-9 bg-background"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={variant.sku || ""}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        placeholder="SKU-001"
                        className="h-9 bg-background"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={variant.priceOverride || 0}
                        onChange={(e) =>
                          updateVariant(index, "priceOverride", Number(e.target.value))
                        }
                        placeholder="0"
                        className="h-9 bg-background text-right"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={variant.quantity || 0}
                        onChange={(e) =>
                          updateVariant(index, "quantity", Number(e.target.value))
                        }
                        placeholder="0"
                        className="h-9 bg-background text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          updateVariant(index, "isActive", !variant.isActive)
                        }
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          variant.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        )}
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="h-8 w-8 text-red-600 hover:bg-red-600/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {variants.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No variants yet</p>
              <Button onClick={addVariant} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Variant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

