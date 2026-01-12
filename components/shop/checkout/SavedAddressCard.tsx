import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SavedAddress {
  id: number;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

interface SavedAddressCardProps {
  address: SavedAddress;
  isSelected: boolean;
  onSelect: (addressId: number) => void;
  defaultLabel: string;
}

export function SavedAddressCard({
  address,
  isSelected,
  onSelect,
  defaultLabel,
}: SavedAddressCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={cn(
        "text-left p-5 border transition-all duration-300 rounded-lg",
        "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10",
        isSelected
          ? "border-[#d4b483] dark:border-white border-2 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          : "border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40"
      )}
      style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-[#d4b483]" />
            <span className="font-medium text-gray-900 dark:text-white">
              {address.recipientName}
            </span>
            {address.isDefault && (
              <span className="text-xs text-[#d4b483] border border-[#d4b483]/50 px-2 py-0.5 rounded uppercase tracking-wide">
                {defaultLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {address.street}
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {address.ward}, {address.district}, {address.city}
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {address.phone}
          </p>
        </div>
        {isSelected && (
          <Check className="h-5 w-5 text-[#d4b483] flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
