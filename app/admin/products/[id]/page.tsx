"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, X as CloseIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GeneralTab } from "@/components/admin/product-detail/GeneralTab";
import { MediaTab } from "@/components/admin/product-detail/MediaTab";
import { VariantsTab } from "@/components/admin/product-detail/VariantsTab";
import { SettingsTab } from "@/components/admin/product-detail/SettingsTab";
import { clientApi } from "@/lib/api-client";
import { ProductResponse, ApiResult, ProductAsset } from "@/lib/types/product";
import { productApi } from "@/lib/api/product";
import { useTranslation, Trans } from "react-i18next";
import { AdminErrorDisplay } from "@/components/admin/AdminErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "general" | "media" | "variants" | "settings";

interface ProductData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  minPrice: number;
  assets?: ProductAsset[];
  variants?: any[];
  slug?: string;
  productStatus: "draft" | "active" | "inactive" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  stock?: number;
  sku?: string;
  /** @deprecated Use assets array instead */
  thumbnail?: string;
  /** @deprecated Use assets array instead */
  images?: string[];
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [originalData, setOriginalData] = useState<ProductData | null>(null);
  const [pageError, setPageError] = useState<{ title: string; description?: string; items?: any[] } | null>(null);

  const [productData, setProductData] = useState<ProductData>({
    id: productId,
    name: "",
    description: "",
    categoryId: "",
    minPrice: 0,
    assets: [],
    variants: [],
    slug: "",
    productStatus: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await clientApi.getProductById(productId);

        if (response.error) {
          const errorMsg = response.error.message || t("admin.productDetail.loadProductError");
          setPageError({
             title: "Access Denied or Connection Failure",
             description: "We couldn't retrieve the requested boutique item from the vault.",
             items: [{ label: "Product ID", message: productId }, { label: "Error", message: errorMsg }]
          });
        } else {
          const result = response.data as ApiResult<ProductResponse>;
          const product = result?.data;

          if (product) {
            const assets: ProductAsset[] = product.assets
              ? product.assets.map((asset: any) => ({
                  id: asset.id?.toString(),
                  url: asset.url,
                  publicId: asset.publicId || null,
                  type: asset.type || "IMAGE",
                  isThumbnail: asset.isThumbnail || false,
                  position: asset.position || 0,
                  variantId: asset.variantId?.toString() || null,
                  metaData: asset.metaData || null,
                }))
              : [];

            const enrichedVariants = (product.variants || []).map((v: any) => {
              const variantAsset = assets.find(
                (a) => a.variantId === v.id?.toString() || a.variantId === v.sku
              );
              return {
                ...v,
                imageUrl: variantAsset?.url || null,
              };
            });

            const loadedData: ProductData = {
              id: product.id,
              name: product.name || "",
              description: product.description || "",
              categoryId: product.categoryId || "",
              minPrice: product.minPrice || 0,
              assets: assets,
              variants: enrichedVariants,
              slug: product.slug || "",
              productStatus: (
                (product as any).status || (product as any).productStatus || "DRAFT"
              ).toLowerCase() as "draft" | "active" | "inactive" | "archived",
              seoTitle: "",
              seoDescription: "",
              seoKeywords: "",
            };

            setProductData(loadedData);
            setOriginalData(JSON.parse(JSON.stringify(loadedData)));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        setPageError({
           title: "Access Denied or Connection Failure",
           description: "We couldn't retrieve the requested boutique item from the vault.",
           items: [{ label: "Product ID", message: productId }, { label: "Error", message: errorMsg }]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, t]);

  const tabs = [
    { id: "general" as Tab, label: t("admin.productDetail.general"), icon: "📝" },
    { id: "media" as Tab, label: t("admin.productDetail.media.label"), icon: "🖼️" },
    { id: "variants" as Tab, label: t("admin.productDetail.variants"), icon: "💰" },
    { id: "settings" as Tab, label: t("admin.productDetail.settings"), icon: "⚙️" },
  ];

  const validateProductData = () => {
    const newErrors: Record<string, string> = {};

    if (!productData.name?.trim()) {
      newErrors.name = t("admin.productDetail.createDialog.validation.nameRequired");
    } else if (productData.name.trim().length < 3) {
      newErrors.name = t("admin.productDetail.createDialog.validation.nameTooShort");
    }

    if (!productData.categoryId) {
      newErrors.categoryId = t("admin.productDetail.createDialog.validation.categoryRequired");
    }

    if (!productData.minPrice || productData.minPrice < 1000) {
      newErrors.minPrice = t("admin.productDetail.createDialog.validation.pricePositive");
    }

    if (!productData.description?.trim()) {
      newErrors.description = t("admin.productDetail.createDialog.validation.descriptionRequired");
    } else if (productData.description.trim().length < 20) {
      newErrors.description = t("admin.productDetail.createDialog.validation.descriptionTooShort");
    }

    if (productData.variants && productData.variants.length > 0) {
      productData.variants.forEach((v, idx) => {
        const quantity = v.quantity ?? v.stock ?? 0;
        if (quantity < 0) {
          newErrors[`variant_${idx}_stock`] = t("admin.productDetail.createDialog.validation.stockNonNegative");
        }
        if (v.sellingPrice !== null && v.sellingPrice !== undefined && v.sellingPrice > 0 && v.sellingPrice < 1000) {
          newErrors[`variant_${idx}_price`] = t("admin.productDetail.createDialog.validation.priceOverridePositive");
        }
      });
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error(t("admin.productDetail.createDialog.validation.genericError"));
      if (newErrors.name || newErrors.categoryId || newErrors.minPrice || newErrors.description) {
        setActiveTab("general");
      } else if (newErrors.thumbnail) {
        setActiveTab("media");
      }
      return false;
    }
    
    return true;
  };

  const detectChanges = () => {
    if (!originalData) return { type: "none" };

    const changes = {
      status: productData.productStatus !== originalData.productStatus,
      generalInfo:
        productData.name !== originalData.name ||
        productData.description !== originalData.description ||
        productData.minPrice !== originalData.minPrice ||
        productData.categoryId !== originalData.categoryId,
      media:
        JSON.stringify(productData.assets) !==
        JSON.stringify(originalData.assets),
      variants:
        JSON.stringify(productData.variants) !==
        JSON.stringify(originalData.variants),
    };

    if (changes.status && !changes.generalInfo && !changes.media && !changes.variants) {
      return { type: "status" };
    }
    if (changes.variants) {
      return { type: "full" };
    }
    if (changes.media && !changes.generalInfo) {
      return { type: "media" };
    }
    if (changes.generalInfo || changes.media) {
      return { type: "generalInfo" };
    }

    return { type: "none" };
  };

  const handleSave = async () => {
    if (!validateProductData()) return;

    setIsSaving(true);
    setErrors({});
    try {
      let response: any;
      const changeType = detectChanges();

      if (changeType.type === "none") {
        toast.info(t("admin.productDetail.noChangesToSave"));
        setIsSaving(false);
        return;
      }

      if (changeType.type === "status") {
        response = await productApi.updateProductStatus(productId, {
          productStatus: productData.productStatus.toUpperCase(),
        });
      }
      else if (changeType.type === "full") {
        const assetsToSend = (productData.assets || []).map((asset) => ({
          id: asset.id,
          url: asset.url,
          type: asset.type,
          isThumbnail: asset.isThumbnail,
          position: asset.position || 0,
          variantId: asset.variantId || null,
        }));

        const variantsToSend = (productData.variants || [])
          .map((variant: any) => {
            const variantPayload: any = {
              id: variant.id,
              attributes: variant.attributes || {},
              sellingPrice: variant.sellingPrice || variant.price,
              originalPrice: variant.originalPrice || 0,
              costPrice: variant.costPrice || 0,
              isActive: variant.isActive !== false,
            };
            
            if (!variant.id && (variant.quantity !== undefined && variant.quantity !== null)) {
              variantPayload.quantity = variant.quantity;
            }
            
            return variantPayload;
          });

        const updatePayload = {
          name: productData.name,
          description: productData.description,
          minPrice: productData.minPrice,
          categoryId: productData.categoryId,
          assets: assetsToSend,
          isActive: productData.productStatus === "active",
          variants: variantsToSend,
        };

        response = await productApi.updateProduct(productId, updatePayload as any);
      }
      else if (changeType.type === "media" || changeType.type === "generalInfo") {
        const assetsToSend = (productData.assets || []).map((asset) => ({
          id: asset.id,
          url: asset.url,
          type: asset.type,
          isThumbnail: asset.isThumbnail,
          position: asset.position || 0,
          variantId: asset.variantId || null,
        }));

        const generalInfoPayload = {
          name: productData.name,
          description: productData.description,
          minPrice: productData.minPrice,
          categoryId: productData.categoryId,
          assets: assetsToSend,
        };

        response = await productApi.updateProductInfo(productId, generalInfoPayload);
      }

      if (response?.error) {
        const errorMsg = response.error.message || t("admin.productDetail.saveProductError");
        setPageError({
          title: "Save Operation Failed",
          description: "Changes could not be committed to the collection.",
          items: [{ message: errorMsg }]
       });
      } else {
        toast.success(t("admin.productDetail.saveProductSuccess", { type: t(`admin.productDetail.updateType.${changeType.type}`) }));
        setHasChanges(false);

        const result = response?.data as ApiResult<ProductResponse>;
        const updatedProduct = result?.data;

        if (updatedProduct) {
          const assets: ProductAsset[] = updatedProduct.assets
            ? updatedProduct.assets.map((asset: any) => ({
                id: asset.id?.toString(),
                url: asset.url,
                type: asset.type || "IMAGE",
                isThumbnail: asset.isThumbnail || false,
                position: asset.position || 0,
                variantId: asset.variantId?.toString() || null,
              }))
            : [];

          const enrichedVariants = (updatedProduct.variants || []).map((v: any) => {
            const variantAsset = assets.find((a) => a.variantId === v.id?.toString() || a.variantId === v.sku);
            return { ...v, imageUrl: variantAsset?.url || null };
          });

          const refreshedData: ProductData = {
            id: updatedProduct.id,
            name: updatedProduct.name || "",
            description: updatedProduct.description || "",
            categoryId: updatedProduct.categoryId || "",
            minPrice: updatedProduct.minPrice || 0,
            assets: assets,
            variants: enrichedVariants,
            slug: updatedProduct.slug || "",
            productStatus: ((updatedProduct as any).status || (updatedProduct as any).productStatus || "DRAFT").toLowerCase() as any,
            seoTitle: "",
            seoDescription: "",
            seoKeywords: "",
          };

          setProductData(refreshedData);
          setOriginalData(JSON.parse(JSON.stringify(refreshedData)));
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(t("admin.productDetail.saveProductError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !confirm(t("admin.productDetail.unsavedChangesConfirm"))) return;
    router.push("/admin/products");
  };

  const updateProductData = (updates: Partial<ProductData>, skipChangeTracking: boolean = false) => {
    setProductData((prev) => ({ ...prev, ...updates }));
    if (!skipChangeTracking) setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-amber-200 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-amber-100/60">{t("common.loading")}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
              {/* Top Bar: Back, Title, Actions */}
              <div className="flex items-center justify-between gap-4 py-4">
                {/* Left: Back + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleCancel} 
                    className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0">
                    <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {productData.name || t("admin.products.newProduct")}
                    </h1>
                    <p className="text-xs text-slate-400 font-mono truncate">ID: {productId}</p>
                  </div>
                  {hasChanges && (
                    <span className="ml-2 px-2.5 py-1 text-[10px] rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50 uppercase font-bold tracking-wider shrink-0">
                      {t("admin.productDetail.unsavedChanges")}
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    disabled={isSaving} 
                    className="h-9 px-4 text-sm font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <CloseIcon className="h-4 w-4 mr-1.5" />
                    {t("admin.productDetail.cancel")}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !hasChanges} 
                    className="h-9 px-4 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                    {isSaving ? t("admin.productDetail.saving") : t("admin.productDetail.saveChanges")}
                  </Button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-1 pb-0 -mb-px overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-all duration-150 whitespace-nowrap outline-none",
                      activeTab === tab.id
                        ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700"
                        : "bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence>
              {pageError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <AdminErrorDisplay
                    title={pageError.title}
                    description={pageError.description}
                    items={pageError.items}
                    onClose={() => setPageError(null)}
                    onRetry={handleSave}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 min-h-[600px]">
              {activeTab === "variants" && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    {t("admin.productDetail.quantityUpdatesNotice")}
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90">
                    <Trans i18nKey="admin.productDetail.quantityUpdatesNoticeDescription" components={{ strong: <strong /> }} />
                  </p>
                </div>
              )}
              
              {activeTab === "general" && <GeneralTab data={productData} onChange={updateProductData} errors={errors} />}
              {activeTab === "media" && <MediaTab data={productData} onChange={updateProductData} />}
              {activeTab === "variants" && <VariantsTab data={productData as any} onChange={updateProductData} errors={errors} />}
              {activeTab === "settings" && <SettingsTab data={productData as any} onChange={updateProductData} errors={errors} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
