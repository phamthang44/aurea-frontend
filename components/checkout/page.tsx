"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { Footer } from "@/components/store/Footer";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./SectionHeader";
import { SavedAddressCard, type SavedAddress } from "./SavedAddressCard";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { FormField } from "./FormField";
import { AddressFormFields } from "./AddressFormFields";
import { OrderSummary } from "./OrderSummary";

/**
 * Format currency to VND with luxury styling
 */
function formatVND(amount: number): string {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/,/g, ".") + "₫"
  );
}

/**
 * Mock saved addresses data
 */
const mockSavedAddresses: SavedAddress[] = [
  {
    id: 1,
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    street: "123 Đường Nguyễn Huệ",
    isDefault: true,
  },
  {
    id: 2,
    recipientName: "Trần Thị B",
    phone: "0987654321",
    city: "Hà Nội",
    district: "Quận Hoàn Kiếm",
    ward: "Phường Hàng Bông",
    street: "456 Phố Hàng Đào",
    isDefault: false,
  },
];

type CheckoutFormData = {
  email: string;
  phone: string;
  recipientName: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  paymentMethod: "COD" | "BANKING";
  note?: string;
  savedAddressId?: number;
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, subTotal, shippingFee, discount, finalTotalPrice } = useCart();

  // Create validation schema with translated messages (memoized)
  const checkoutSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("checkout.validation.emailRequired"))
          .email(t("checkout.validation.emailInvalid")),
        phone: z
          .string()
          .min(1, t("checkout.validation.phoneRequired"))
          .regex(
            /^(0|\+84)[0-9]{9,10}$/,
            t("checkout.validation.phoneInvalid")
          ),
        recipientName: z
          .string()
          .min(1, t("checkout.validation.recipientNameRequired")),
        city: z.string().min(1, t("checkout.validation.cityRequired")),
        district: z.string().min(1, t("checkout.validation.districtRequired")),
        ward: z.string().min(1, t("checkout.validation.wardRequired")),
        street: z.string().min(1, t("checkout.validation.streetRequired")),
        paymentMethod: z.enum(["COD", "BANKING"], {
          message: t("checkout.validation.paymentMethodRequired"),
        }),
        note: z.string().optional(),
        savedAddressId: z.number().optional(),
      }),
    [t]
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    mockSavedAddresses.find((addr) => addr.isDefault)?.id || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "COD",
      savedAddressId: mockSavedAddresses.find((addr) => addr.isDefault)?.id,
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Auto-fill form when saved address is selected
  const handleSelectAddress = (addressId: number) => {
    const address = mockSavedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setValue("savedAddressId", addressId);
      setValue("recipientName", address.recipientName);
      setValue("phone", address.phone);
      setValue("city", address.city);
      setValue("district", address.district);
      setValue("ward", address.ward);
      setValue("street", address.street);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Format payload for backend
    const payload = {
      recipientName: data.recipientName,
      phone: data.phone,
      email: data.email,
      shippingAddress: {
        city: data.city,
        district: data.district,
        ward: data.ward,
        street: data.street,
      },
      paymentMethod: data.paymentMethod,
      note: data.note || "",
    };

    // Log formatted payload
    console.log("=== CHECKOUT PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("========================");

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Gradient Blobs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/40 dark:from-purple-900/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/30 dark:from-[#d4b483]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300/30 dark:from-purple-800/20 to-transparent rounded-full blur-3xl" />
      </div>

      <LuxuryNavBar />

      <div className="flex-1 mt-20 relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1
              className="text-5xl font-bold uppercase tracking-[0.2em] mb-3 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {t("checkout.title")}
            </h1>
            <p
              className="text-gray-600 dark:text-zinc-400 text-sm"
              style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
            >
              {t("checkout.subtitle")}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-[58%_40%] gap-12">
              {/* Left Column - Checkout Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-12"
              >
                {/* Contact Information */}
                <section className="space-y-6">
                  <SectionHeader>
                    {t("checkout.contactInformation")}
                  </SectionHeader>
                  <div className="space-y-4">
                    <FormField
                      id="email"
                      label={t("checkout.email")}
                      type="email"
                      placeholder={t("checkout.emailPlaceholder")}
                      register={register("email")}
                      error={errors.email}
                    />
                    <FormField
                      id="phone"
                      label={t("checkout.phoneNumber")}
                      type="tel"
                      placeholder={t("checkout.phonePlaceholder")}
                      register={register("phone")}
                      error={errors.phone}
                    />
                  </div>
                </section>

                <Separator className="border-dashed border-gray-300 dark:border-white/20" />

                {/* Shipping Address */}
                <section className="space-y-6">
                  <SectionHeader>{t("checkout.shippingAddress")}</SectionHeader>

                  {/* Saved Addresses */}
                  {mockSavedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <Label
                        className="text-sm text-gray-600 dark:text-zinc-400"
                        style={{
                          fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                        }}
                      >
                        {t("checkout.savedAddresses")}
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {mockSavedAddresses.map((address) => (
                          <SavedAddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedAddressId === address.id}
                            onSelect={handleSelectAddress}
                            defaultLabel={t("checkout.default")}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label
                      className="text-sm text-gray-600 dark:text-zinc-400 block mb-4"
                      style={{
                        fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                      }}
                    >
                      {t("checkout.orEnterNewAddress")}
                    </Label>
                    <AddressFormFields
                      recipientName={{
                        register: register("recipientName"),
                        error: errors.recipientName,
                      }}
                      city={{
                        register: register("city"),
                        error: errors.city,
                      }}
                      district={{
                        register: register("district"),
                        error: errors.district,
                      }}
                      ward={{
                        register: register("ward"),
                        error: errors.ward,
                      }}
                      street={{
                        register: register("street"),
                        error: errors.street,
                      }}
                      labels={{
                        recipientName: t("checkout.recipientName"),
                        recipientNamePlaceholder: t(
                          "checkout.recipientNamePlaceholder"
                        ),
                        city: t("checkout.city"),
                        cityPlaceholder: t("checkout.cityPlaceholder"),
                        district: t("checkout.district"),
                        districtPlaceholder: t("checkout.districtPlaceholder"),
                        ward: t("checkout.ward"),
                        wardPlaceholder: t("checkout.wardPlaceholder"),
                        street: t("checkout.streetAddress"),
                        streetPlaceholder: t("checkout.streetPlaceholder"),
                      }}
                    />
                  </div>
                </section>

                <Separator className="border-dashed border-gray-300 dark:border-white/20" />

                {/* Payment Method */}
                <section className="space-y-6">
                  <SectionHeader>{t("checkout.paymentMethod")}</SectionHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PaymentMethodCard
                      icon={Wallet}
                      title={t("checkout.cashOnDelivery")}
                      description={t("checkout.payWhenReceive")}
                      isSelected={paymentMethod === "COD"}
                      onSelect={() => setValue("paymentMethod", "COD")}
                    />
                    <PaymentMethodCard
                      icon={CreditCard}
                      title={t("checkout.bankingTransfer")}
                      description={t("checkout.transferToBank")}
                      isSelected={paymentMethod === "BANKING"}
                      onSelect={() => setValue("paymentMethod", "BANKING")}
                    />
                  </div>
                  {errors.paymentMethod && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </section>

                <Separator className="border-dashed border-gray-300 dark:border-white/20" />

                {/* Order Note */}
                <section className="space-y-4">
                  <FormField
                    id="note"
                    label={t("checkout.orderNote")}
                    type="textarea"
                    placeholder={t("checkout.orderNotePlaceholder")}
                    register={register("note")}
                    error={errors.note}
                  />
                </section>
              </motion.div>

              {/* Right Column - Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <OrderSummary
                  items={items}
                  subTotal={subTotal ?? 0}
                  shippingFee={shippingFee ?? 0}
                  discount={discount ?? 0}
                  finalTotalPrice={finalTotalPrice ?? 0}
                  isSubmitting={isSubmitting}
                  formatVND={formatVND}
                  labels={{
                    orderSummary: t("checkout.orderSummary"),
                    subtotal: t("checkout.subtotal"),
                    discount: t("checkout.discount"),
                    shipping: t("checkout.shipping"),
                    free: t("checkout.free"),
                    total: t("checkout.total"),
                    placeOrder: t("checkout.placeOrder"),
                    processing: t("checkout.processing"),
                    noImage: t("cart.noImage"),
                  }}
                />
              </motion.div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
