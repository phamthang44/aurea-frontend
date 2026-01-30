"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Home, Building2, MapPin, Phone, User, Star, Edit2, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const addressTypeColors = {
  HOME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OFFICE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-300 cursor-pointer",
        address.isDefault
          ? "border-accent/50 bg-accent/5"
          : "border-border hover:border-accent/30 bg-card/50"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Type Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              addressTypeColors[address.type]
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {t(`profile.addresses.${address.type.toLowerCase()}`, {
              defaultValue: address.type,
            })}
          </span>

          {/* Default Badge */}
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
              <Star className="w-3 h-3 fill-current" />
              {t("profile.addresses.default", { defaultValue: "Default" })}
            </span>
          )}

          {/* Label */}
          {address.label && (
            <span className="text-xs text-muted-foreground">
              ({address.label})
            </span>
          )}
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(address)}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t("common.edit", { defaultValue: "Edit" })}
            </DropdownMenuItem>
            {!address.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(address.id)}>
                <Star className="w-4 h-4 mr-2" />
                {t("profile.addresses.setDefault", { defaultValue: "Set as Default" })}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(address.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("common.delete", { defaultValue: "Delete" })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recipient Info */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{address.recipientName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{address.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{fullAddress}</span>
        </div>
      </div>
    </motion.div>
  );
}
