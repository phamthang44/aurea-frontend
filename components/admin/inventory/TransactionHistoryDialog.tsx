"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Loader2 } from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

interface InventoryTransaction {
  id: string;
  type: string;
  quantityDelta: number;
  beforeQuantity: number;
  afterQuantity: number;
  reference: string;
  note: string;
  performedBy: string;
  createdAt: string;
}

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
}

export function TransactionHistoryDialog({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
}: TransactionHistoryDialogProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (open && variantId) {
      fetchHistory();
    } else {
        setData([]);
        setPage(0);
    }
  }, [open, variantId, page, pageSize]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getInventoryTransactions(variantId, page, pageSize);
      if (response.data) {
        const result = response.data as any;
        setData(result.data || []);
        setTotalElements(result.meta?.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'IMPORT': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
          case 'ADJUST': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
          case 'RESERVE': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
          case 'CONFIRM': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
          case 'RELEASE': return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
          case 'DAMAGED': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
          case 'RETURN': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20';
          case 'OPENING_BALANCE': return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20';
          default: return 'text-gray-600 bg-gray-50';
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{t("admin.inventory.history.title")}</DialogTitle>
          <DialogDescription>
             {t("admin.inventory.history.description", { sku: variantSku, product: productName })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto mt-4">
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center p-12 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                    <div className="text-slate-400 font-medium">
                        {t("admin.inventory.history.noData", "Stock initialized, no movements yet.")}
                    </div>
                </div>
            ) : (
                <>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="w-[180px]">{t("admin.inventory.history.date")}</TableHead>
                            <TableHead>{t("admin.inventory.history.type")}</TableHead>
                            <TableHead className="text-right">{t("admin.inventory.history.change")}</TableHead>
                            <TableHead className="text-right">{t("admin.inventory.history.balance")}</TableHead>
                            <TableHead>{t("admin.inventory.history.reference")}</TableHead>
                            <TableHead>{t("admin.inventory.history.performedBy")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((tx) => (
                            <TableRow key={tx.id} className="border-slate-200 dark:border-slate-800">
                                <TableCell className="whitespace-nowrap font-mono text-[11px] text-slate-500">
                                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(tx.type)}`}>
                                        {tx.type}
                                    </span>
                                </TableCell>
                                <TableCell className={`text-right font-bold ${tx.quantityDelta > 0 ? 'text-emerald-600' : tx.quantityDelta < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {tx.quantityDelta > 0 ? "+" : ""}{tx.quantityDelta}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-900 dark:text-slate-100 font-bold">{tx.afterQuantity}</span>
                                        <span className="text-[10px] text-slate-400">{tx.beforeQuantity} → {tx.afterQuantity}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">{tx.reference || "-"}</div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5" title={tx.note}>{tx.note}</div>
                                </TableCell>
                                <TableCell className="text-[11px] text-slate-500 font-medium">
                                    {tx.performedBy}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {/* Pagination UI */}
                <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500">
                        {t("common.pagination.showing", { count: data.length, total: totalElements })}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setPage(prev => Math.max(0, prev - 1))}
                            disabled={page === 0 || isLoading}
                        >
                            {t("common.pagination.prev")}
                        </Button>
                        <div className="text-[11px] font-bold px-2">
                            {page + 1} / {Math.ceil(totalElements / pageSize) || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={(page + 1) * pageSize >= totalElements || isLoading}
                        >
                            {t("common.pagination.next")}
                        </Button>
                    </div>
                </div>
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
