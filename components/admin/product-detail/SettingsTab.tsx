"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SettingsTabProps {
  data: {
    productStatus: "draft" | "active" | "inactive" | "archived";
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  };
  onChange: (updates: Partial<SettingsTabProps['data']>, skipChangeTracking?: boolean) => void;
  errors?: Record<string, string>;
}

import { FormField } from "../FormField";

export function SettingsTab({ data, onChange, errors = {} }: SettingsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("admin.productDetail.visibilityMetadata")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.productDetail.visibilitySubtitle")}</p>
        </div>

        {/* Product Status Matrix */}
        <div className="flex flex-col gap-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{t("admin.productDetail.globalStatus")}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'draft', color: 'bg-amber-400', label: t("admin.productDetail.status.draft"), desc: t("admin.productDetail.status.draftDesc"), activeClass: 'border-amber-400 ring-4 ring-amber-400/10' },
              { id: 'active', color: 'bg-emerald-500', label: t("admin.productDetail.status.active"), desc: t("admin.productDetail.status.activeDesc"), activeClass: 'border-emerald-500 ring-4 ring-emerald-400/10' },
              { id: 'inactive', color: 'bg-slate-400', label: t("admin.productDetail.status.inactive"), desc: t("admin.productDetail.status.inactiveDesc"), activeClass: 'border-slate-400 ring-4 ring-slate-400/10' },
              { id: 'archived', color: 'bg-rose-500', label: t("admin.productDetail.status.archived"), desc: t("admin.productDetail.status.archivedDesc"), activeClass: 'border-rose-500 ring-4 ring-rose-400/10' }
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => onChange({ productStatus: status.id as SettingsTabProps['data']['productStatus'] })}
                className={cn(
                  "p-5 rounded-2xl border-2 transition-all text-left group relative backdrop-blur-sm",
                  data.productStatus === status.id
                    ? status.activeClass + " bg-white dark:bg-slate-900"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900/10"
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center shadow-lg", status.color)}>
                     <div className="h-2 w-2 rounded-full bg-white opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{status.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors uppercase tracking-tight">{status.desc}</p>
                  </div>
                </div>
                {data.productStatus === status.id && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-current" style={{ backgroundColor: status.color.replace('bg-', '') }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="flex flex-col gap-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{t("admin.productDetail.storefrontSeo")}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 flex flex-col gap-6">
              <FormField
                label={t("admin.productDetail.searchTitle")}
                error={errors.seoTitle}
                hint={t("admin.productDetail.seo.titleHint")}
              >
                <div className="relative">
                  <Input
                    id="seoTitle"
                    value={data.seoTitle || ""}
                    onChange={(e) => onChange({ seoTitle: e.target.value })}
                    placeholder={t("admin.productDetail.seo.titlePlaceholder")}
                    className={cn(
                      "h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-all focus:ring-[#D4AF37] focus:border-[#D4AF37]",
                      errors.seoTitle && "border-rose-500 focus:ring-rose-500/20"
                    )}
                    maxLength={100} // Allow typing more to show counter but validate at 60
                  />
                  <p className={cn(
                    "absolute right-3 top-3 text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
                    (data.seoTitle?.length || 0) > 60 ? "text-rose-500 bg-rose-500/10" : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                  )}>
                    {(data.seoTitle || "").length}/60
                  </p>
                </div>
              </FormField>

              <FormField
                label={t("admin.productDetail.metaDescription")}
                error={errors.seoDescription}
                hint={t("admin.productDetail.seo.descHint")}
              >
                <div className="relative">
                  <Textarea
                    id="seoDescription"
                    value={data.seoDescription || ""}
                    onChange={(e) => onChange({ seoDescription: e.target.value })}
                    placeholder={t("admin.productDetail.seo.descPlaceholder")}
                    rows={4}
                    className={cn(
                      "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-all focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none pr-12",
                      errors.seoDescription && "border-rose-500 focus:ring-rose-500/20"
                    )}
                    maxLength={300}
                  />
                  <p className={cn(
                    "absolute right-3 bottom-3 text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
                    (data.seoDescription?.length || 0) > 160 ? "text-rose-500 bg-rose-500/10" : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                  )}>
                    {(data.seoDescription || "").length}/160
                  </p>
                </div>
              </FormField>
            </div>

            <div className="md:col-span-5">
              <div className="sticky top-4 bg-white dark:bg-[#0B0F1A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                   {t("admin.productDetail.googlePreview")}
                </h5>
                
                <div className="flex flex-col gap-1">
                  <span className="text-blue-700 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer transition-colors line-clamp-1">
                    {data.seoTitle || t("admin.productDetail.seo.googlePreviewTitle")}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-500 text-xs font-medium truncate mb-2">
                    https://aurea.vn/luxury-products/{data.seoTitle?.toLowerCase().replace(/ /g, '-') || 'product-slug'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {data.seoDescription || t("admin.productDetail.seo.googlePreviewDesc")}
                  </span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                      <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <div className="h-3 w-12 bg-slate-100 dark:bg-slate-900 rounded-full" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
