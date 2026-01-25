"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductTable } from "@/components/admin/ProductTable";
import { CreateProductDialog } from "@/components/admin/CreateProductDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientApi } from "@/lib/api-client";
import { useAdminProducts } from "@/lib/hooks/useAdminData";
import { toast } from "sonner";
import { Plus, Loader2, Search, UserCircle2, AlertTriangle, Pencil, Trash2, Package, ChevronLeft, ChevronRight, XCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminErrorDisplay } from "@/components/admin/AdminErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProductResponse,
  ProductResponseAdmin,
  ProductSearchRequest,
  ApiResult,
} from "@/lib/types/product";
import { Trans, useTranslation } from "react-i18next";

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponseAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchParams, setSearchParams] = useState<ProductSearchRequest>({
    page: 1,
    size: 10,
    sort: "newest",
  });

  // Use the React Query hook
  const { 
    data: result, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useAdminProducts(searchParams);

  const [deleteError, setDeleteError] = useState<{ title: string; items: any[] } | null>(null);

  const products = result?.data || [];
  const totalItems = result?.meta?.totalElements || 0;
  const totalPages = result?.meta?.totalPages || 0;
  const currentPage = result?.meta?.page || 1;
  const pageSize = result?.meta?.size || 10;



  // Handle search
  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, keyword: searchKeyword, page: 1 }));
  };

  // Handle status filter
  const handleStatusFilter = (status?: ProductSearchRequest["status"]) => {
    setSearchParams((prev) => ({ ...prev, status, page: 1 }));
  };

  // Handle sort change
  const handleSortChange = (sort: ProductSearchRequest["sort"]) => {
    setSearchParams((prev) => ({ ...prev, sort, page: 1 }));
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await clientApi.deleteProduct(selectedProduct.id);

      if (response.error) {
        setDeleteError({
           title: "Deletion Failed",
           items: [{ label: selectedProduct.name, message: response.error.message || "Archive operation rejected by server." }]
        });
      } else {
        setDeleteError(null);
        toast.success(t("admin.products.deleteProductSuccess"));
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        refetch();
      }
    } catch {
      toast.error(t("admin.products.unexpectedError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (product: ProductResponseAdmin) => {
    // Navigate to admin detail page using ID
    router.push(`/admin/products/${product.id}`);
  };

  const handleDeleteClick = (product: ProductResponseAdmin) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setSearchParams((prev) => ({ ...prev, size, page: 1 }));
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Format currency to VND with decimal places
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format datetime to local format with seconds and AM/PM
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("admin.products.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t("admin.products.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#B8962D] text-white shadow-lg shadow-[#D4AF37]/20 border-0 h-11 px-6 font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t("admin.products.newProduct")}
        </Button>
      </div>

      {/* Global Alerts Center */}
      <AnimatePresence>
        {isError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <AdminErrorDisplay
              title="Failed to Sync Collection"
              description="A technical interruption occurred while retrieving the product database."
              items={[{ message: (error as Error)?.message || "Internal server connection failure." }]}
              onRetry={() => refetch()}
              className="shadow-lg shadow-red-500/5"
            />
          </motion.div>
        )}
        
        {deleteError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <AdminErrorDisplay
              title={deleteError.title}
              description="The product could not be permanently removed or archived."
              items={deleteError.items}
              onClose={() => setDeleteError(null)}
              className="shadow-lg shadow-red-500/5"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats/Quick Actions (Optional, but adds to Pro Max feel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("admin.products.totalProducts")}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-gray-100 mt-1">{totalItems}</p>
        </div>
        {/* Add more stats here if needed */}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("admin.products.searchPlaceholder")}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <Select
              value={searchParams.status || "all"}
              onValueChange={(value: string) =>
                handleStatusFilter(value === "all" ? undefined : (value as any))
              }
            >
              <SelectTrigger className="w-[160px] h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent">
                <SelectValue placeholder={t("admin.products.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.products.allStatus")}</SelectItem>
                <SelectItem value="ACTIVE">{t("admin.products.active")}</SelectItem>
                <SelectItem value="DRAFT">{t("admin.products.draft")}</SelectItem>
                <SelectItem value="INACTIVE">{t("admin.products.hidden")}</SelectItem>
                <SelectItem value="ARCHIVED">{t("admin.products.archived")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={searchParams.sort || "newest"}
              onValueChange={(value: string) => handleSortChange(value as any)}
            >
              <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent">
                <div className="flex items-center gap-2">
                  <SelectValue placeholder={t("shop.sortBy")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("admin.products.newestFirst")}</SelectItem>
                <SelectItem value="price_asc">{t("admin.products.priceLowToHigh")}</SelectItem>
                <SelectItem value="price_desc">{t("admin.products.priceHighToLow")}</SelectItem>
                <SelectItem value="name_asc">{t("admin.products.nameAToZ")}</SelectItem>
                <SelectItem value="name_desc">{t("admin.products.nameZToA")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              className="h-10 px-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              {t("admin.products.filter")}
            </Button>
          </div>
        </div>
      </div>

      {/* Notice Message */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
          <Trans
            i18nKey="admin.products.quantityUpdatesNoticeDescription"
            components={{ strong: <strong className="font-bold underline decoration-amber-500/30" /> }}
          />
        </p>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#0B0F1A] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <p className="text-sm text-slate-500 font-medium">{t("admin.products.fetchingProducts")}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <Package className="h-8 w-8" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">{t("admin.products.noResultsFound")}</p>
            <p className="text-sm text-slate-500 mt-1">{t("admin.products.noResultsDescription")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("admin.products.id")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("admin.products.productName")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("admin.products.category")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("admin.products.minPrice")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    {t("admin.products.status")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("admin.products.created")}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    {t("admin.products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        #{product.id.toString().slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#D4AF37] transition-colors">
                          {product.name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {product.variants?.length || 0} {t("admin.products.variants")} • {product.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatVND(product.minPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border",
                          product.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : product.status === "DRAFT"
                            ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        )}
                      >
                        {t(`admin.products.${product.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                          {product.createdBy?.username || "Admin"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(product.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
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
        )}
      </div>

      {/* Pagination Container */}
      {!isLoading && totalItems > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-6 bg-white dark:bg-[#0B0F1A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-sm text-slate-500 font-medium">
              {t("admin.products.showingXToYOfZ", {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, totalItems),
                total: totalItems
              })}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("admin.products.perPage")}</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-10 px-4 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 bg-white dark:bg-slate-900 transition-all font-semibold rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("admin.products.previous")}
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (p === 1 || p === totalPages) return true;
                  if (p >= currentPage - 1 && p <= currentPage + 1) return true;
                  return false;
                })
                .map((p, i, arr) => {
                  const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="text-slate-300 text-xs font-bold px-1">...</span>}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "h-10 min-w-[40px] px-3 rounded-lg text-sm font-bold transition-all duration-200",
                          currentPage === p
                            ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-10 px-4 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 bg-white dark:bg-slate-900 transition-all font-semibold rounded-lg disabled:opacity-50"
            >
              {t("admin.products.next")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Luxury Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-gray-900 dark:text-amber-100">
              {t("admin.products.confirmDeletion")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-amber-100/60">
              {t("admin.products.deleteConfirmMessage", { name: selectedProduct?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-700 dark:to-rose-700 dark:hover:from-red-800 dark:hover:to-rose-800 shadow-lg shadow-red-500/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.products.removing")}
                </>
              ) : (
                t("admin.products.deleteProduct")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

