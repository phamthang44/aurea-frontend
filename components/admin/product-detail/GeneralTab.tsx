"use client";

import { useCategories } from "@/lib/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface GeneralTabProps {
  data: {
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
    slug?: string;
  };
  onChange: (updates: any, skipChangeTracking?: boolean) => void;
  errors?: Record<string, string>;
}

import { FormField } from "../FormField";

export function GeneralTab({ data, onChange, errors = {} }: GeneralTabProps) {
  const { t } = useTranslation();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("admin.productDetail.generalTab.title")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.productDetail.generalTab.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
          {/* Product Name */}
          <FormField
            label={t("admin.productDetail.generalTab.productName")}
            required
            error={errors.name}
            hint={t("admin.productDetail.generalTab.productNameHint")}
            className="md:col-span-8"
          >
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t("admin.productDetail.generalTab.productNamePlaceholder")}
              aria-invalid={!!errors.name}
              className={cn(
                "h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base",
                errors.name && "border-rose-500 focus:ring-rose-500/20"
              )}
            />
          </FormField>

          {/* Base Price */}
          <FormField
            label={t("admin.productDetail.generalTab.basePrice")}
            required
            error={errors.basePrice}
            hint={t("admin.productDetail.generalTab.basePriceHint")}
            className="md:col-span-4"
          >
            <div className="relative">
              <Input
                id="basePrice"
                type="number"
                value={data.basePrice || 0}
                onChange={(e) => onChange({ basePrice: Number(e.target.value) })}
                aria-invalid={!!errors.basePrice}
                className={cn(
                  "h-11 pl-4 pr-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base font-mono",
                  errors.basePrice && "border-rose-500 focus:ring-rose-500/20"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VND</span>
            </div>
          </FormField>

          {/* Category Selection */}
          <FormField
            label={t("admin.productDetail.generalTab.category")}
            required
            error={errors.categoryId}
            hint={t("admin.productDetail.generalTab.categoryHint")}
            className="md:col-span-12"
          >
            <select
              id="categoryId"
              value={data.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              disabled={loadingCategories}
              aria-invalid={!!errors.categoryId}
              className={cn(
                "flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-base text-slate-900 dark:text-slate-100 outline-none transition-all",
                "focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]",
                "disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                errors.categoryId && "border-rose-500 focus:ring-rose-500/20"
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="" disabled>
                {loadingCategories ? t("admin.productDetail.generalTab.loadingCategories") : t("admin.productDetail.generalTab.selectCategory")}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField
            label={t("admin.productDetail.generalTab.descriptionLabel")}
            required
            error={errors.description}
            hint={t("admin.productDetail.generalTab.descriptionHint")}
            className="md:col-span-12"
          >
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder={t("admin.productDetail.generalTab.descriptionPlaceholder")}
              rows={12}
              aria-invalid={!!errors.description}
              className={cn(
                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-base leading-relaxed resize-none p-4",
                errors.description && "border-rose-500 focus:ring-rose-500/20"
              )}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
