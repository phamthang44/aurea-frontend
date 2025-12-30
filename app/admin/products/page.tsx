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
import { clientApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { ProductResponse, ApiResult } from "@/lib/types/product";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch products - Simple: just call API and use backend data directly
  const fetchProducts = async (
    page: number = currentPage,
    size: number = pageSize
  ) => {
    setIsLoading(true);
    try {
      const response = await clientApi.getProducts({ page, size });

      if (response.error) {
        toast.error(response.error.message || "Failed to fetch products");
        setProducts([]);
        setTotalItems(0);
        setTotalPages(0);
      } else {
        // response.data now contains the full backend structure { data, meta }
        const result = response.data as ApiResult<ProductResponse[]>;
        // Trust backend data completely - no frontend calculations
        setProducts(result?.data || []);
        setTotalItems(result?.meta?.totalElements || 0);
        setTotalPages(result?.meta?.totalPages || 0);
      }
    } catch {
      toast.error("An unexpected error occurred while fetching products");
      setProducts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

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
        fetchProducts(currentPage, pageSize);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (product: ProductResponse) => {
    // Navigate to admin detail page using ID
    router.push(`/admin/products/${product.id}`);
  };

  const handleDeleteClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Luxury Design */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-amber-900/20">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-amber-200 dark:via-yellow-100 dark:to-amber-200 bg-clip-text text-transparent">
            Product Collection
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-amber-100/60 font-light tracking-wide">
              Curated luxury catalog management
            </p>
            {totalItems > 0 && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30 border-0 font-semibold tracking-wide h-11 px-6"
        >
          <Plus className="h-5 w-5" />
          New Product
        </Button>
      </div>

      {/* Products Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Luxury Pagination */}
      {!isLoading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-amber-900/30 rounded-xl px-8 py-5 shadow-md dark:shadow-amber-950/20">
          {/* Left: Results info and page size selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-amber-100/70 font-light">
              Displaying{" "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {(currentPage - 1) * pageSize + 1}
              </span>
              {" – "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>
              {" of "}
              <span className="font-semibold text-gray-900 dark:text-amber-200">
                {totalItems}
              </span>
            </p>

            {/* Luxury Page size selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-amber-100/60 whitespace-nowrap font-light">
                View:
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
              <span className="hidden sm:inline">Previous</span>
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
              <span className="hidden sm:inline">Next</span>
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
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-amber-100/60">
              Are you certain you wish to remove &quot;{selectedProduct?.name}
              &quot; from your collection? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10"
            >
              Cancel
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
                  Removing...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
