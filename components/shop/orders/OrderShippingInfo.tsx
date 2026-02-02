"use client";

import { useTranslation } from "react-i18next";
import { MapPin, Phone, User, Mail } from "lucide-react";

import { OrderShippingAddress } from "@/lib/api/my-orders";

interface OrderShippingInfoProps {
  address: OrderShippingAddress;
  contactEmail?: string;
}

/**
 * Reusable component for displaying shipping/delivery address
 */
export function OrderShippingInfo({
  address,
  contactEmail,
}: OrderShippingInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Shipping Address */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-accent/70 stroke-[1.5]" />
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
            {t("orders.shippingAddress", {
              defaultValue: "Delivery Address",
            })}
          </h2>
        </div>

        <div className="space-y-3 pl-7">
          <div className="flex items-center gap-2.5">
            <User className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
            <span className="text-sm font-medium text-foreground tracking-wide">
              {address.recipientName}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
            <span className="text-sm text-muted-foreground/70 tracking-wide">
              {address.phone}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5] mt-0.5" />
            <span className="text-sm text-muted-foreground/70 leading-relaxed">
              {address.detailAddress}, {address.wardName},{" "}
              {address.districtName}, {address.provinceName}
            </span>
          </div>
        </div>
      </section>

      {/* Contact Email */}
      {contactEmail && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-accent/70 stroke-[1.5]" />
            <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
              {t("orders.contactEmail", {
                defaultValue: "Contact Email",
              })}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground/70 pl-7 tracking-wide">
            {contactEmail}
          </p>
        </section>
      )}
    </div>
  );
}
