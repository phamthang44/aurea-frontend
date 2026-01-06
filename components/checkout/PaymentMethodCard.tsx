import { LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function PaymentMethodCard({
  icon: Icon,
  title,
  description,
  isSelected,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "p-6 border transition-all duration-300 text-left rounded-lg",
        "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10",
        isSelected
          ? "border-[#d4b483] dark:border-white border-2 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          : "border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40"
      )}
    >
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-[#d4b483] flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3
            className="font-medium mb-1 text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {title}
          </h3>
          <p
            className="text-sm text-gray-600 dark:text-zinc-400"
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          >
            {description}
          </p>
        </div>
        {isSelected && (
          <Check className="h-5 w-5 text-[#d4b483] flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
