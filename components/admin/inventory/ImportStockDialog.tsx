// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { ArrowRight, Loader2, Package } from "lucide-react";
// import { toast } from "sonner";
// import { clientApi } from "@/lib/api-client";
// import { useTranslation } from "react-i18next";

// interface ImportStockDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   variantId: string;
//   variantSku: string;
//   productName: string;
//   currentStock: number;
//   onSuccess: () => void;
// }

// export function ImportStockDialog({
//   open,
//   onOpenChange,
//   variantId,
//   variantSku,
//   productName,
//   currentStock,
//   onSuccess,
// }: ImportStockDialogProps) {
//   const { t } = useTranslation();
//   const [quantity, setQuantity] = useState<number>(0);
//   const [note, setNote] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const afterImport = currentStock + (quantity || 0);

//   const handleClose = () => {
//     onOpenChange(false);
//     // Reset form after close animation
//     setTimeout(() => {
//       setQuantity(0);
//       setNote("");
//     }, 200);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!quantity || quantity <= 0) {
//       toast.error(t("admin.inventory.import.quantityRequired"));
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await clientApi.importStock({
//         variantId,
//         quantity,
//         100,
//         note,
//       });

//       if (response.error) {
//         toast.error(response.error.message || t("admin.inventory.import.error"));
//       } else {
//         toast.success(t("admin.inventory.import.success"));
//         onSuccess();
//         handleClose();
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(t("admin.inventory.import.unexpectedError"));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[440px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 gap-0 overflow-hidden">
//         {/* Header */}
//         <DialogHeader className="px-6 pt-6 pb-4">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
//               <Package className="h-5 w-5 text-emerald-600" />
//             </div>
//             <div>
//               <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
//                 {t("admin.inventory.import.title")}
//               </DialogTitle>
//               <DialogDescription className="text-sm mt-0.5">
//                 {t("admin.inventory.import.description", { sku: variantSku, product: productName })}
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <Separator />

//         {/* Current Stock Display */}
//         <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
//           <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
//             {t("admin.inventory.import.currentStock")}
//           </p>
//           <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
//             {currentStock}
//           </p>
//         </div>

//         <Separator />

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//               {t("admin.inventory.import.quantity")}
//             </Label>
//             <Input
//               id="quantity"
//               type="number"
//               min="1"
//               value={quantity || ""}
//               onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
//               className="h-11 text-lg font-semibold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
//               placeholder="0"
//               autoFocus
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="note" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//               {t("admin.inventory.import.note")}
//             </Label>
//             <Textarea
//               id="note"
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
//               placeholder={t("admin.inventory.import.notePlaceholder")}
//               rows={2}
//             />
//           </div>

//           {/* Preview */}
//           {quantity > 0 && (
//             <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
//               <div className="text-center">
//                 <p className="text-xs text-slate-500 dark:text-slate-400">{t("admin.inventory.import.before")}</p>
//                 <p className="text-lg font-bold text-slate-600 dark:text-slate-400 tabular-nums">{currentStock}</p>
//               </div>
//               <ArrowRight className="h-4 w-4 text-emerald-600" />
//               <div className="text-center">
//                 <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("admin.inventory.import.after")}</p>
//                 <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{afterImport}</p>
//               </div>
//             </div>
//           )}
//         </form>

//         <Separator />

//         {/* Footer */}
//         <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
//           <Button
//             type="button"
//             variant="ghost"
//             onClick={handleClose}
//             disabled={isSubmitting}
//             className="text-slate-600"
//           >
//             {t("common.cancel")}
//           </Button>
//           <Button 
//             type="submit" 
//             disabled={isSubmitting || quantity <= 0} 
//             className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
//             onClick={handleSubmit}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 {t("admin.inventory.import.adding")}
//               </>
//             ) : (
//               t("admin.inventory.import.submit")
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
