"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Home,
  Building2,
  MapPin,
  Phone,
  User,
  Edit2,
  Trash2,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserAddress } from "@/lib/types/profile";

interface AddressCardProps {
  address: UserAddress;
  index: number;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const addressTypeIcons = {
  HOME: Home,
  OFFICE: Building2,
  OTHER: MapPin,
};

export function AddressCard({
  address,
  index,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const { t } = useTranslation();
  const Icon = addressTypeIcons[address.type];

  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.ward,
    address.district,
    address.city,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group relative p-6 transition-all duration-500",
        "border",
        address.isDefault
          ? "border-accent/30 bg-accent/[0.02]"
          : "border-border/40 hover:border-border/80 bg-transparent",
      )}
    >
      {/* Default Indicator - Elegant corner accent */}
      {address.isDefault && (
        <div className="absolute top-0 left-0 w-12 h-px bg-accent/60" />
      )}
      {address.isDefault && (
        <div className="absolute top-0 left-0 w-px h-12 bg-accent/60" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Type Icon */}
          <div className="p-2 border border-border/30 rounded-none bg-muted/20">
            <Icon className="w-4 h-4 text-muted-foreground/60 stroke-[1.5]" />
          </div>

          {/* Type & Default Labels */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground/70">
                {t(`profile.addresses.${address.type.toLowerCase()}`, {
                  defaultValue: address.type,
                })}
              </span>
              {address.label && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground/50">
                    {address.label}
                  </span>
                </>
              )}
            </div>
            {address.isDefault && (
              <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
                <Check className="w-3 h-3 stroke-[2]" />
                {t("profile.addresses.default", { defaultValue: "Primary" })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-none">
            <DropdownMenuItem
              onClick={() => onEdit(address)}
              className="text-xs tracking-wide"
            >
              <Edit2 className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
              {t("common.edit", { defaultValue: "Edit" })}
            </DropdownMenuItem>
            {!address.isDefault && (
              <DropdownMenuItem
                onClick={() => onSetDefault(address.id)}
                className="text-xs tracking-wide"
              >
                <Check className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
                {t("profile.addresses.setDefault", {
                  defaultValue: "Set as primary",
                })}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(address.id)}
              className="text-xs tracking-wide text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
              {t("common.delete", { defaultValue: "Remove" })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Address Content */}
      <div className="space-y-3">
        {/* Recipient */}
        <div className="flex items-center gap-2.5">
          <User className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
          <span className="text-sm font-medium text-foreground tracking-wide">
            {address.recipientName}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5">
          <Phone className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
          <span className="text-sm text-muted-foreground/80 tracking-wide">
            {address.phone}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5] mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground/70 leading-relaxed">
            {fullAddress}
          </span>
        </div>
      </div>

      {/* Hover line effect */}
      <div className="absolute bottom-0 left-0 w-0 h-px bg-accent/40 group-hover:w-full transition-all duration-700 ease-out" />
    </motion.div>
  );
}
