"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductResponse } from "@/lib/types/product";
import { Pencil, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: ProductResponse[];
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  isLoading?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="w-[100px] font-semibold text-gray-900">ID</TableHead>
            <TableHead className="font-semibold text-gray-900">Name</TableHead>
            <TableHead className="font-semibold text-gray-900">Category</TableHead>
            <TableHead className="text-right font-semibold text-gray-900">Price</TableHead>
            <TableHead className="text-center font-semibold text-gray-900">Variants</TableHead>
            <TableHead className="text-right w-[120px] font-semibold text-gray-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-mono text-xs text-gray-800">
                {product.id.slice(-8)}
              </TableCell>
              <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
              <TableCell className="text-gray-600">
                {product.categoryName || "N/A"}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {formatPrice(product.basePrice)}
              </TableCell>
              <TableCell className="text-center text-sm text-gray-600">
                {product.variants?.length || 0}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

