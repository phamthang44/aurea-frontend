"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { clientApi } from "@/lib/api-client";
import { toast } from "sonner";

interface VariantsTabProps {
  data: {
    id: string;
    basePrice: number;
    variants?: any[];
  };
  onChange: (updates: any, skipChangeTracking?: boolean) => void;
}

export function VariantsTab({ data, onChange }: VariantsTabProps) {
  const [hasVariants, setHasVariants] = useState(
    (data.variants?.length || 0) > 0
  );
  const [variants, setVariants] = useState(data.variants || []);
  const [isSaving, setIsSaving] = useState(false);

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
        id: null, // New variant, no ID yet
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
      id: null, // New variant, no ID yet
      attributes: { size: "", color: "" },
      priceOverride: 0,
      quantity: 0,
      isActive: true,
    };
    const updated = [...variants, newVariant];
    setVariants(updated);
    onChange({ variants: updated });
  };

  const updateVariant = (
    index: number,
    field: string,
    value: any,
    skipChangeTracking: boolean = false
  ) => {
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
    onChange({ variants: updated }, skipChangeTracking);
  };

  const saveVariant = async (index: number) => {
    const variant = variants[index];
    setIsSaving(true);

    // Debug logging
    console.log("=== SAVE VARIANT DEBUG ===");
    console.log("Variant object:", variant);
    console.log("Variant ID:", variant.id);
    console.log("Variant ID type:", typeof variant.id);
    console.log("Boolean(variant.id):", Boolean(variant.id));
    console.log("All variant keys:", Object.keys(variant));
    console.log("=========================");

    try {
      // Check if variant has an ID (existing variant) or is new
      // Use truthy check - if ID exists and is not empty string, it's existing
      const isExisting = Boolean(variant.id);

      console.log("Saving variant:", {
        index,
        variantId: variant.id,
        variantIdType: typeof variant.id,
        isExisting,
        variant,
      });

      if (isExisting) {
        // Update existing variant via event-driven architecture
        console.log("Updating existing variant:", variant.id);

        // Update variant price & quantity (quantity triggers VariantStockUpdatedEvent)
        const variantResponse = await clientApi.updateVariant(variant.id, {
          priceOverride: variant.priceOverride,
          quantity: variant.quantity, // ✅ Backend publishes event → Inventory listener updates stock
          // ❌ DO NOT send attributes - they are immutable (SKU is derived from them)
          // ❌ DO NOT send imageUrl - images are saved at product level via main "Save Changes" button
        });

        if (variantResponse.error) {
          toast.error(
            variantResponse.error.message || "Failed to update variant"
          );
          setIsSaving(false);
          return;
        }

        toast.success("Variant updated successfully");

        // Update local state with backend response
        const result = variantResponse.data as any;
        const updatedVariant = result?.data;
        if (updatedVariant) {
          const updated = [...variants];
          updated[index] = { ...updatedVariant, quantity: variant.quantity };
          setVariants(updated);
          // ❌ DO NOT call onChange - variant already saved to DB
          // Calling onChange triggers parent to include this in next bulk save,
          // which can cause duplicate/update issues
        }
      } else {
        // Create new variant - quantity IS used for initial stock
        console.log("Creating new variant for product:", data.id);
        const response = await clientApi.createVariant(data.id, {
          priceOverride: variant.priceOverride || null,
          quantity: variant.quantity, // ✅ Initial stock for new variants
          attributes: variant.attributes,
          // ❌ DO NOT send imageUrl - images are saved at product level via main "Save Changes" button
        });

        if (response.error) {
          toast.error(response.error.message || "Failed to create variant");
        } else {
          toast.success("Variant created successfully with initial stock!");
          const result = response.data as any;
          const newVariant = result?.data;
          console.log("Created variant data:", newVariant);
          if (newVariant) {
            const updated = [...variants];
            updated[index] = newVariant;
            setVariants(updated);
            // ❌ DO NOT call onChange - variant already saved to DB
          }
        }
      }
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("An error occurred while saving variant");
    } finally {
      setIsSaving(false);
    }
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];

    if (!confirm("Remove this variant?")) {
      return;
    }

    if (variant.id) {
      // Delete from backend if it has an ID
      setIsSaving(true);
      try {
        const response = await clientApi.deleteVariant(variant.id);

        if (response.error) {
          toast.error(response.error.message || "Failed to delete variant");
          setIsSaving(false);
          return;
        }

        toast.success("Variant deleted successfully");
      } catch (error) {
        toast.error("An error occurred while deleting variant");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    // Remove from local state
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    onChange({ variants: updated });
  };

  const toggleVariantStatus = async (index: number) => {
    const variant = variants[index];
    const newStatus = !variant.isActive;

    if (!variant.id) {
      // Just update locally if not saved yet
      updateVariant(index, "isActive", newStatus); // Keep change tracking for unsaved variants
      return;
    }

    setIsSaving(true);
    try {
      const response = await clientApi.updateVariantStatus(variant.id, {
        isActive: newStatus,
      });

      if (response.error) {
        toast.error(
          response.error.message || "Failed to update variant status"
        );
      } else {
        updateVariant(index, "isActive", newStatus, true); // Skip change tracking - already saved
        toast.success(`Variant ${newStatus ? "activated" : "deactivated"}`);
      }
    } catch (error) {
      toast.error("An error occurred while updating variant status");
    } finally {
      setIsSaving(false);
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
              <Label
                htmlFor="basePrice"
                className="text-foreground font-medium"
              >
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
                    Image
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Color
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Price (VND)
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Stock Quantity
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
                  <tr
                    key={variant.id || `new-${index}`}
                    className="hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3">
                      {variant.imageUrl ? (
                        <div className="w-16 h-16 rounded border overflow-hidden">
                          <img
                            src={variant.imageUrl}
                            alt="Variant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 border border-dashed border-border rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={variant.attributes?.size || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "attributes.size",
                            e.target.value
                          )
                        }
                        placeholder="M"
                        className="h-9 bg-background"
                        disabled={Boolean(variant.id)}
                        title={
                          variant.id
                            ? "Cannot change attributes of existing variant (SKU is derived from attributes)"
                            : "Set variant size"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={variant.attributes?.color || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "attributes.color",
                            e.target.value
                          )
                        }
                        placeholder="Black"
                        className="h-9 bg-background"
                        disabled={Boolean(variant.id)}
                        title={
                          variant.id
                            ? "Cannot change attributes of existing variant (SKU is derived from attributes)"
                            : "Set variant color"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CurrencyInput
                        value={variant.priceOverride || 0}
                        onChange={(value) =>
                          updateVariant(index, "priceOverride", value || 0)
                        }
                        placeholder="0"
                        className="h-9 bg-background text-right"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CurrencyInput
                        value={variant.quantity || 0}
                        onChange={(value) =>
                          updateVariant(index, "quantity", value || 0)
                        }
                        placeholder="0"
                        className="h-9 bg-background text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVariantStatus(index)}
                        disabled={isSaving}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          variant.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                          isSaving && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveVariant(index)}
                          disabled={isSaving}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-600/10"
                          title="Save variant"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          disabled={isSaving}
                          className="h-8 w-8 text-red-600 hover:bg-red-600/10"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
