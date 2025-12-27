"use client";

import { useState, useEffect } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
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
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResult,
} from "@/lib/types/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getProducts({ page: 1, size: 100 });
      
      if (response.error) {
        toast.error(response.error.message || "Failed to fetch products");
        setProducts([]);
      } else if (response.data?.error) {
        toast.error(response.data.error.message || "Failed to fetch products");
        setProducts([]);
      } else {
        // Handle ApiResult structure
        const result = response.data as ApiResult<ProductResponse[]>;
        if (result?.data) {
          setProducts(result.data);
        } else if (Array.isArray(response.data)) {
          // Fallback if response.data is directly an array
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred while fetching products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle create/update
  const handleSubmit = async (
    data: CreateProductRequest | UpdateProductRequest
  ) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        // Update
        const response = await clientApi.updateProduct(selectedProduct.id, data);
        
        if (response.error) {
          toast.error(response.error.message || "Failed to update product");
        } else if (response.data?.error) {
          toast.error(response.data.error.message || "Failed to update product");
        } else {
          toast.success("Product updated successfully");
          setIsModalOpen(false);
          setSelectedProduct(null);
          fetchProducts();
        }
      } else {
        // Create
        const response = await clientApi.createProduct(data);
        
        if (response.error) {
          toast.error(response.error.message || "Failed to create product");
        } else if (response.data?.error) {
          toast.error(response.data.error.message || "Failed to create product");
        } else {
          toast.success("Product created successfully");
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await clientApi.deleteProduct(selectedProduct.id);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to delete product");
      } else if (response.data?.error) {
        toast.error(response.data.error.message || "Failed to delete product");
      } else {
        toast.success("Product deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      {/* Products Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

