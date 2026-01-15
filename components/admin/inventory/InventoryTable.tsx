"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, History, ArrowDownToLine, ArrowRightLeft, RefreshCw, Loader2 } from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { ProductResponse, VariantResponse } from "@/lib/types/product";
import { useTranslation } from "react-i18next";
import { ImportStockDialog } from "./ImportStockDialog";
import { AdjustStockDialog } from "./AdjustStockDialog";
import { TransactionHistoryDialog } from "./TransactionHistoryDialog";

interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableStock: number;
  productName: string;
  categoryName?: string;
  attributes: Record<string, string>;
}

export function InventoryTable() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getInventories({ 
        page: currentPage,
        size: pageSize,
        keyword: searchTerm 
      });

      if (response.data) {
        const inventoryData = response.data as any;
        setItems(inventoryData.data || []);
        setTotalElements(inventoryData.meta?.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch inventory data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
        if (currentPage === 0) {
            fetchData();
        } else {
            setCurrentPage(0); // Reset to first page on search
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
      fetchData();
  }, [currentPage, pageSize]);

  const handleAction = (action: 'import' | 'adjust' | 'history', item: InventoryItem) => {
      setSelectedItem(item);
      if (action === 'import') setImportDialogOpen(true);
      if (action === 'adjust') setAdjustDialogOpen(true);
      if (action === 'history') setHistoryDialogOpen(true);
  };

  const handleRefresh = () => {
      fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder={t("admin.inventory.searchPlaceholder", "Search product or SKU...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("common.refresh")}
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <TableHead className="w-[300px]">{t("admin.inventory.product")}</TableHead>
              <TableHead>{t("admin.inventory.sku")}</TableHead>
              <TableHead>{t("admin.inventory.category")}</TableHead>
              <TableHead className="text-right">{t("admin.inventory.available")}</TableHead>
              <TableHead className="text-right">{t("admin.inventory.reserved")}</TableHead>
              <TableHead className="text-right">{t("admin.inventory.total")}</TableHead>
              <TableHead className="text-right">{t("admin.inventory.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  {t("admin.inventory.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-slate-100">{item.productName}</span>
                        <div className="flex gap-2 text-xs text-slate-500">
                           {item.attributes && Object.entries(item.attributes).map(([key, val]) => (
                               <span key={key} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{val}</span>
                           ))}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{item.categoryName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${item.availableStock > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {item.availableStock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-amber-600 font-medium">
                     {item.reservedQuantity ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                     {item.quantity ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <DropdownMenuLabel>{t("admin.inventory.actionsTitle")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('import', item)}>
                          <ArrowDownToLine className="mr-2 h-4 w-4" />
                          {t("admin.inventory.menuActions.import")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('adjust', item)}>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          {t("admin.inventory.menuActions.adjust")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('history', item)}>
                          <History className="mr-2 h-4 w-4" />
                          {t("admin.inventory.menuActions.history")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-slate-500">
          {t("common.pagination.showing", { 
            count: items.length, 
            total: totalElements 
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            {t("common.pagination.prev")}
          </Button>
          <div className="text-sm font-medium">
            {t("common.pagination.page", { current: currentPage + 1, total: Math.ceil(totalElements / pageSize) })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={(currentPage + 1) * pageSize >= totalElements || isLoading}
          >
            {t("common.pagination.next")}
          </Button>
        </div>
      </div>

      {selectedItem && (
          <>
            <ImportStockDialog 
                open={importDialogOpen} 
                onOpenChange={setImportDialogOpen} 
                variantId={selectedItem.variantId}
                variantSku={selectedItem.sku}
                productName={selectedItem.productName}
                onSuccess={handleRefresh}
            />
            <AdjustStockDialog 
                open={adjustDialogOpen} 
                onOpenChange={setAdjustDialogOpen} 
                variantId={selectedItem.variantId}
                variantSku={selectedItem.sku}
                currentStock={selectedItem.quantity || 0}
                productName={selectedItem.productName}
                onSuccess={handleRefresh}
            />
            <TransactionHistoryDialog 
                open={historyDialogOpen} 
                onOpenChange={setHistoryDialogOpen} 
                variantId={selectedItem.variantId}
                variantSku={selectedItem.sku}
                productName={selectedItem.productName}
            />
          </>
      )}
    </div>
  );
}
