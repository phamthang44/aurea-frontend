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
import { useTranslation } from "react-i18next";

interface VariantsTabProps {
  data: {
    id: string;
    basePrice: number;
    variants?: any[];
  };
  onChange: (updates: any, skipChangeTracking?: boolean) => void;
  errors?: Record<string, string>;
}

import { FormField } from "../FormField";

export function VariantsTab({ data, onChange, errors = {} }: VariantsTabProps) {
  const { t } = useTranslation();
  const [hasVariants, setHasVariants] = useState(
    (data.variants?.length || 0) > 0
  );
  const [variants, setVariants] = useState(data.variants || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleVariants = () => {
    if (hasVariants) {
      // Switching to simple product
      if (confirm(t("admin.productDetail.messages.confirmRemoveAllVariants"))) {
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

    try {
      // Check if variant has an ID (existing variant) or is new
      // Use truthy check - if ID exists and is not empty string, it's existing
      const isExisting = Boolean(variant.id);

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
            variantResponse.error.message || t("admin.productDetail.messages.variantUpdateFail")
          );
          setIsSaving(false);
          return;
        }

        toast.success(t("admin.productDetail.messages.variantUpdateSuccess"));

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
          toast.error(response.error.message || t("admin.productDetail.messages.variantCreateFail"));
        } else {
          toast.success(t("admin.productDetail.messages.variantCreateSuccess"));
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
      toast.error(t("admin.productDetail.messages.variantSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];

    if (!confirm(t("admin.productDetail.messages.confirmRemoveVariant"))) {
      return;
    }

    if (variant.id) {
      // Delete from backend if it has an ID
      setIsSaving(true);
      try {
        const response = await clientApi.deleteVariant(variant.id);

        if (response.error) {
          toast.error(response.error.message || t("admin.productDetail.messages.variantDeleteFail"));
          setIsSaving(false);
          return;
        }

        toast.success(t("admin.productDetail.messages.variantDeleteSuccess"));
      } catch (error) {
        toast.error(t("admin.productDetail.messages.variantDeleteError"));
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
          response.error.message || t("admin.productDetail.messages.variantUpdateStatusFail")
        );
      } else {
        updateVariant(index, "isActive", newStatus, true); // Skip change tracking - already saved
        toast.success(t(`admin.productDetail.messages.variant${newStatus ? "Activated" : "Deactivated"}`));
      }
    } catch (error) {
      toast.error(t("admin.productDetail.messages.variantUpdateStatusError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("admin.productDetail.pricingAndInventory")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.productDetail.manageVariations")}</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => hasVariants && handleToggleVariants()}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                !hasVariants 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t("admin.productDetail.simpleProduct")}
            </button>
            <button
              onClick={() => !hasVariants && handleToggleVariants()}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                hasVariants 
                  ? "bg-[#D4AF37] text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t("admin.productDetail.productWithVariants")}
            </button>
          </div>
        </div>

        {/* Simple Product Pricing */}
        {!hasVariants && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="md:col-span-12">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">{t("admin.productDetail.basePricing")}</h4>
            </div>

            <FormField
              label={t("admin.productDetail.retailPrice")}
              required
              error={errors.basePrice}
              className="md:col-span-6"
            >
              <div className="relative">
                <CurrencyInput
                  id="basePrice"
                  value={data.basePrice}
                  onChange={(value) => onChange({ basePrice: value })}
                  error={!!errors.basePrice}
                  className={cn(
                    "h-11 pl-4 pr-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base font-mono",
                    errors.basePrice && "border-rose-500 focus:ring-rose-500/20"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{t("common.vnd", "VND")}</span>
              </div>
            </FormField>

            <FormField
              label={t("admin.productDetail.skuReference")}
              className="md:col-span-6"
            >
              <Input
                id="sku"
                value={(data as any).sku || ""}
                onChange={(e) => onChange({ sku: e.target.value })}
                placeholder="PROD-LXX-001"
                className="h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base font-mono"
              />
            </FormField>

            <FormField
              label={t("admin.productDetail.initialStock")}
              error={errors.stock}
              hint={t("admin.productDetail.initialStockDesc")}
              className="md:col-span-6"
            >
              <Input
                id="stock"
                type="number"
                value={(data as any).stock || 0}
                onChange={(e) => onChange({ stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                aria-invalid={!!errors.stock}
                className={cn(
                  "h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base",
                  errors.stock && "border-rose-500 focus:ring-rose-500/20"
                )}
              />
            </FormField>
          </div>
        )}

        {/* Variants Matrix */}
        {hasVariants && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{t("admin.productDetail.variantsMatrix")}</h4>
              <Button
                onClick={addVariant}
                size="sm"
                className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 h-9 px-4 font-bold rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.productDetail.addVariant")}
              </Button>
            </div>

            <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("admin.productDetail.image")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("admin.productDetail.attributeSize")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("admin.productDetail.attributeColor")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t("admin.productDetail.priceOverride")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t("admin.productDetail.currentStock")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t("admin.productDetail.tableStatus")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t("admin.productDetail.tableActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {variants.map((variant, index) => (
                      <tr key={variant.id || `new-${index}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden group-hover:border-[#D4AF37]/50 transition-colors">
                            {variant.imageUrl ? (
                              <img src={variant.imageUrl} alt="Variant" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                <span className="text-[10px] text-slate-300 font-bold">{t("admin.productDetail.notAvailable")}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={variant.attributes?.size || ""}
                            onChange={(e) => updateVariant(index, "attributes.size", e.target.value)}
                            placeholder="M"
                            className="h-9 w-24 bg-transparent border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#D4AF37] transition-all font-bold text-slate-900 dark:text-slate-100"
                            disabled={Boolean(variant.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={variant.attributes?.color || ""}
                            onChange={(e) => updateVariant(index, "attributes.color", e.target.value)}
                            placeholder="Black"
                            className="h-9 w-32 bg-transparent border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#D4AF37] transition-all font-bold text-slate-900 dark:text-slate-100"
                            disabled={Boolean(variant.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <CurrencyInput
                              value={variant.priceOverride || 0}
                              onChange={(value) => updateVariant(index, "priceOverride", value || 0)}
                              error={!!errors[`variant_${index}_price`]}
                              className={cn(
                                "h-9 w-32 ml-auto bg-transparent border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#D4AF37] transition-all text-right font-mono font-bold text-slate-900 dark:text-slate-100",
                                errors[`variant_${index}_price`] && "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                              )}
                            />
                            {errors[`variant_${index}_price`] && (
                              <span className="text-[9px] text-rose-500 font-bold">{errors[`variant_${index}_price`]}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center justify-end gap-2 w-full">
                               <Input
                                type="number"
                                value={variant.quantity || 0}
                                onChange={(e) => updateVariant(index, "quantity", Number(e.target.value) || 0)}
                                aria-invalid={!!errors[`variant_${index}_stock`]}
                                className={cn(
                                  "h-9 w-20 bg-transparent border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#D4AF37] transition-all text-right font-bold text-slate-900 dark:text-slate-100",
                                  errors[`variant_${index}_stock`] && "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                                )}
                              />
                              {variant.quantity < 5 && variant.quantity > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                            {errors[`variant_${index}_stock`] && (
                              <span className="text-[9px] text-rose-500 font-bold">{errors[`variant_${index}_stock`]}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleVariantStatus(index)}
                            disabled={isSaving}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                              variant.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                            )}
                          >
                            {variant.isActive ? t("admin.productDetail.active") : t("admin.productDetail.disabled")}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveVariant(index)}
                              disabled={isSaving}
                              className="h-8 w-8 text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(index)}
                              disabled={isSaving}
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
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
            </div>
          </div>
        )}

        {variants.length === 0 && hasVariants && (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-medium mb-4">{t("admin.productDetail.noVariantsDefined")}</p>
            <Button onClick={addVariant} className="bg-[#D4AF37] text-white h-10 px-6 font-bold rounded-xl shadow-lg shadow-[#D4AF37]/20">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.productDetail.initializeVariants")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
