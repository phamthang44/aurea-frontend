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
import { searchAdminProducts } from "@/lib/api/products";
import { toast } from "sonner";
import { Plus, Loader2, Search, UserCircle2 } from "lucide-react";
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
  const [products, setProducts] = useState<ProductResponseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch products using new admin API
  // Authentication is handled via HttpOnly cookies automatically
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await searchAdminProducts(searchParams);

      setProducts(result.data);
      // Backend calculates everything in meta object
      setTotalItems(result.meta?.totalElements || 0);
      setTotalPages(result.meta?.totalPages || 0);
      setCurrentPage(result.meta?.page || 1);
      setPageSize(result.meta?.size || 10);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
      setProducts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        toast.error(response.error.message || "Failed to delete product");
      } else {
        toast.success("Product deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch {
      toast.error("An unexpected error occurred");
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
    setPageSize(size);
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
    <div className="space-y-8">
      {/* Header with Luxury Design */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-amber-900/20">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-amber-200 dark:via-yellow-100 dark:to-amber-200 bg-clip-text text-transparent">
            {t("admin.products.title")}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-amber-100/60 font-light tracking-wide">
              {t("admin.products.subtitle")}
            </p>
            {totalItems > 0 && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
                {totalItems} {totalItems === 1 ? t("admin.products.item") : t("admin.products.items")}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30 border-0 font-semibold tracking-wide h-11 px-6"
        >
          <Plus className="h-5 w-5" />
          {t("admin.products.newProduct")}
        </Button>
      </div>
      {/* Warning Message for Products Table */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-amber-600 dark:text-amber-400 text-lg sm:text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
              {t("admin.products.quantityUpdatesNotice")}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed">
              <Trans
                i18nKey="admin.products.quantityUpdatesNoticeDescription"
                components={{
                  strong: <strong />
                }}
              />
            </p>
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-gray-200 dark:border-amber-900/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("admin.products.searchPlaceholder")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-900/30 border-0 font-semibold px-6"
            >
              {t("common.search")}
            </Button>
          </div>

          {/* Status Filter */}
          <Select
            value={searchParams.status || "all"}
            onValueChange={(value: string) =>
              handleStatusFilter(value === "all" ? undefined : (value as any))
            }
          >
            <SelectTrigger>
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

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-amber-200 whitespace-nowrap">
              {t("admin.products.sort")}
            </label>
            <Select
              value={searchParams.sort || "newest"}
              onValueChange={(value: string) => handleSortChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("shop.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("admin.products.newestFirst")}</SelectItem>
                <SelectItem value="price_asc">{t("admin.products.priceLowToHigh")}</SelectItem>
                <SelectItem value="price_desc">{t("admin.products.priceHighToLow")}</SelectItem>
                <SelectItem value="name_asc">{t("admin.products.nameAToZ")}</SelectItem>
                <SelectItem value="name_desc">{t("admin.products.nameZToA")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Table - Custom implementation for ProductResponseAdmin */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-gray-200 dark:border-amber-900/30 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-amber-100/60">
            {t("admin.products.noProductsFound")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-amber-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.id")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.name")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.category")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.price")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.variants")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.created")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.updated")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-amber-200 uppercase">
                    {t("admin.products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-amber-900/20">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-amber-100">
                      {product.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-amber-100">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-amber-100/60">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-amber-100">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-amber-100">
                      {formatVND(product.basePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : product.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : product.status === "HIDDEN"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {product.variants && product.variants.length > 0 ? (
                          product.variants.map((variant) => (
                            <span
                              key={variant.id}
                              className="text-xs text-gray-600 dark:text-amber-100/70"
                            >
                              {variant.attributes.size &&
                                `Size: ${variant.attributes.size}`}
                              {variant.attributes.size &&
                                variant.attributes.color &&
                                " | "}
                              {variant.attributes.color &&
                                `Color: ${variant.attributes.color}`}
                              {!variant.attributes.size &&
                                !variant.attributes.color &&
                                `SKU: ${variant.sku}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-amber-100/40">
                            No variants
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.createdBy ? (
                        <div className="flex items-center gap-2">
                          {product.createdBy.avatarUrl ? (
                            <img
                              src={product.createdBy.avatarUrl}
                              alt={product.createdBy.username}
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-amber-700/40"
                            />
                          ) : (
                            <UserCircle2 className="w-8 h-8 text-gray-400 dark:text-amber-600" />
                          )}
                          <div className="flex flex-col">
                            <a
                              href={`/admin/users/${product.createdBy.id}`}
                              className="text-sm text-blue-600 dark:text-amber-400 font-medium hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {product.createdBy.username ||
                                product.createdBy.email}
                            </a>
                            <div className="text-xs text-gray-500 dark:text-amber-100/60">
                              {formatDateTime(product.createdAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400 dark:text-amber-100/40 italic">
                            Unknown
                          </span>
                          <div className="text-xs text-gray-500 dark:text-amber-100/60">
                            {formatDateTime(product.createdAt)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.updatedBy ? (
                        <div className="flex items-center gap-2">
                          {product.updatedBy.avatarUrl ? (
                            <img
                              src={product.updatedBy.avatarUrl}
                              alt={product.updatedBy.username}
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-amber-700/40"
                            />
                          ) : (
                            <UserCircle2 className="w-8 h-8 text-gray-400 dark:text-amber-600" />
                          )}
                          <div className="flex flex-col">
                            <a
                              href={`/admin/users/${product.updatedBy.id}`}
                              className="text-sm text-blue-600 dark:text-amber-400 font-medium hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {product.updatedBy.username ||
                                product.updatedBy.email}
                            </a>
                            <div className="text-xs text-gray-500 dark:text-amber-100/60">
                              {formatDateTime(product.updatedAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400 dark:text-amber-100/40 italic">
                            Unknown
                          </span>
                          <div className="text-xs text-gray-500 dark:text-amber-100/60">
                            {formatDateTime(product.updatedAt)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t("common.delete")}
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

      {/* Luxury Pagination */}
      {!isLoading && (totalItems > 0 || products.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-amber-900/30 rounded-xl px-8 py-5 shadow-md dark:shadow-amber-950/20">
          {/* Left: Results info and page size selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-amber-100/70 font-light">
              {t("admin.products.displaying")}{" "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {(currentPage - 1) * pageSize + 1}
              </span>
              {" – "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>
              {" "}{t("admin.products.of")}{" "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {totalItems}
              </span>
            </p>

            {/* Luxury Page size selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-amber-100/60 whitespace-nowrap font-light">
                {t("admin.products.view")}
              </span>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-300 dark:border-amber-700/40 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-amber-100 transition-all hover:border-amber-400 dark:hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer shadow-sm"
              >
                <option
                  value={5}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100"
                >
                  5 items
                </option>
                <option
                  value={10}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100"
                >
                  10 items
                </option>
                <option
                  value={20}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100"
                >
                  20 items
                </option>
                <option
                  value={50}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100"
                >
                  50 items
                </option>
                <option
                  value={100}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100"
                >
                  100 items
                </option>
              </select>
            </div>
          </div>

          {/* Right: Luxury Page navigation */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-10 px-4 gap-2 font-medium border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span className="hidden sm:inline">{t("common.previous")}</span>
            </Button>

            {/* Page numbers with luxury styling */}
            <div className="flex items-center gap-1.5 mx-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1)
                    return true;
                  return false;
                })
                .map((page, index, array) => {
                  const showEllipsisBefore =
                    index > 0 && page - array[index - 1] > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-2 text-sm text-gray-400 dark:text-amber-500/50">
                          •••
                        </span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`h-10 min-w-[40px] px-3 font-semibold transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600 hover:from-amber-600 hover:to-yellow-600 dark:hover:from-amber-700 dark:hover:to-yellow-700 text-white border-0 shadow-lg shadow-amber-500/30 dark:shadow-amber-900/40"
                            : "border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600"
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="h-10 px-4 gap-2 font-medium border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">{t("common.next")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
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
