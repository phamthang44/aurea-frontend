import { Separator } from "@/components/ui/separator";
import { CartItemResponse } from "@/lib/api/cart";
import { OrderSummaryItem } from "./OrderSummaryItem";
import { SectionHeader } from "./SectionHeader";

interface OrderSummaryProps {
  items: CartItemResponse[];
  subTotal: number;
  shippingFee: number;
  discount: number;
  finalTotalPrice: number;
  isSubmitting: boolean;
  formatVND: (amount: number) => string;
  labels: {
    orderSummary: string;
    subtotal: string;
    discount: string;
    shipping: string;
    free: string;
    total: string;
    placeOrder: string;
    processing: string;
    noImage: string;
  };
}

export function OrderSummary({
  items,
  subTotal,
  shippingFee,
  discount,
  finalTotalPrice,
  isSubmitting,
  formatVND,
  labels,
}: OrderSummaryProps) {
  return (
    <div className="lg:sticky lg:top-24 lg:h-fit">
      <div className="backdrop-blur-2xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-6 shadow-xl dark:shadow-2xl">
        <SectionHeader>{labels.orderSummary}</SectionHeader>

        {/* Products List */}
        <div className="space-y-4">
          {items.map((item) => (
            <OrderSummaryItem
              key={item.id}
              item={item}
              formatVND={formatVND}
              noImageLabel={labels.noImage}
            />
          ))}
        </div>

        <Separator className="border-dashed border-gray-300 dark:border-white/20" />

        {/* Price Breakdown */}
        <div
          className="space-y-3"
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-zinc-400">
              {labels.subtotal}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatVND(subTotal)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-zinc-400">
                {labels.discount}
              </span>
              <span className="font-medium text-emerald-900 dark:text-emerald-400">
                -{formatVND(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{labels.shipping}</span>
            <span className="font-medium text-white">
              {shippingFee === 0 ? (
                <span className="text-emerald-400">{labels.free}</span>
              ) : (
                formatVND(shippingFee)
              )}
            </span>
          </div>
        </div>

        <Separator className="border-dashed border-gray-300 dark:border-white/20" />

        {/* Total */}
        <div
          className="flex justify-between text-lg"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          <span className="font-medium text-gray-900 dark:text-white">
            {labels.total}
          </span>
          <span className="font-bold text-2xl text-[#d4b483]">
            {formatVND(finalTotalPrice)}
          </span>
        </div>

        {/* Place Order Button */}
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full bg-[#181818] dark:bg-white text-white dark:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] h-14 text-base font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              {labels.processing}
            </div>
          ) : (
            labels.placeOrder
          )}
        </button>
      </div>
    </div>
  );
}

