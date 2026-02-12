"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Home,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserAddress, AddressType } from "@/lib/types/profile";

interface AddressCardProps {
  address: UserAddress;
  index: number;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  disableDelete?: boolean;
}

const addressTypeConfig: Record<
  AddressType,
  { icon: typeof Home; bg: string; text: string }
> = {
  HOME: {
    icon: Home,
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-400",
  },
  WORKSPACE: {
    icon: Building2,
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-400",
  },
  OFFICE: {
    icon: Briefcase,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
  },
  OTHER: {
    icon: MapPin,
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-600 dark:text-slate-400",
  },
};

export function AddressCard({
  address,
  index,
  onEdit,
  onDelete,
  onSetDefault,
  disableDelete = false,
}: AddressCardProps) {
  const { t } = useTranslation();
  const config = addressTypeConfig[address.addressType];
  const Icon = config.icon;

  const fullAddress =
    address.fullAddress ||
    [
      address.detailAddress,
      address.wardName,
      address.districtName,
      address.provinceName,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group relative flex flex-col rounded-xl transition-all duration-300",
        "bg-card border",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)]",
        address.isDefault
          ? "border-accent ring-1 ring-accent/20"
          : "border-border/60 hover:border-border",
      )}
    >
      {/* Card Body */}
      <div className="p-6 flex-1">
        {/* Top: Badges + Set Default */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Address Type Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                config.bg,
                config.text,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(`profile.addresses.${address.addressType.toLowerCase()}`, {
                defaultValue: address.addressType,
              })}
            </span>

            {/* Default Badge */}
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent dark:bg-accent/25">
                <Star className="w-3 h-3 fill-current" />
                {t("profile.addresses.default", { defaultValue: "Default" })}
              </span>
            )}

            {/* Custom Label */}
            {address.label && (
              <span className="text-xs text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-full">
                {address.label}
              </span>
            )}
          </div>

          {/* Set as Default link */}
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-[11px] font-medium text-muted-foreground/60 hover:text-accent transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              {t("profile.addresses.setDefault", {
                defaultValue: "Set as default",
              })}
            </button>
          )}
        </div>

        {/* Recipient Name — Bold, primary hierarchy */}
        <h3 className="text-[15px] font-semibold text-foreground mb-3.5">
          {address.recipientName}
        </h3>

        {/* Info Rows */}
        <div className="space-y-2.5">
          {/* Phone */}
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            <span className="text-sm text-muted-foreground">
              {address.phoneNumber}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {fullAddress}
            </p>
          </div>

          {/* Notes (if any) */}
          {address.notes && (
            <p className="text-xs text-muted-foreground/50 italic pl-[26px]">
              {address.notes}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer — always visible */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-muted/20 rounded-b-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
          className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent px-2 h-8"
        >
          <Edit2 className="w-3.5 h-3.5" />
          {t("common.edit", { defaultValue: "Edit" })}
        </Button>

        {!disableDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            className="gap-1.5 text-xs font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 px-2 h-8"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("common.delete", { defaultValue: "Delete" })}
          </Button>
        ) : (
          <span />
        )}
      </div>
    </motion.div>
  );
}
