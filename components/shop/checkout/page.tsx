"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { StorefrontFooter } from "@/components/shop/layout/StorefrontFooter";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./SectionHeader";
import { SavedAddressCard } from "./SavedAddressCard";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { FormField } from "./FormField";
import { AddressForm } from "./AddressForm";
import { OrderSummary } from "./OrderSummary";
import { profileApi } from "@/lib/api/profile";
import type { UserAddress } from "@/lib/types/profile";
import {
  orderApi,
  type PaymentMethod,
  type OrderCreationResponse,
} from "@/lib/api/order";

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
      .replace(/,/g, ".") + "đ"
  );
}

type CheckoutFormData = {
  email: string;
  // Address fields (matching AddressRequest structure)
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  districtName: string;
  detailAddress: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
  note?: string;
  savedAddressId?: string;
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, subTotal, shippingFee, discount, finalTotalPrice } = useCart();

  // Create validation schema with translated messages (memoized)
  const checkoutSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("checkout.validation.emailRequired"))
          .max(255, t("checkout.validation.emailMaxLength"))
          .email(t("checkout.validation.emailInvalid")),
        // Address fields validation
        recipientName: z
          .string()
          .min(1, t("checkout.validation.recipientNameRequired"))
          .max(255, t("checkout.validation.recipientNameMaxLength")),
        phone: z
          .string()
          .min(1, t("checkout.validation.phoneRequired"))
          .regex(/^\d{10,15}$/, t("checkout.validation.phoneInvalid")),
        provinceCode: z
          .string()
          .min(1, t("checkout.validation.cityRequired"))
          .max(20),
        provinceName: z.string().min(1).max(255),
        wardCode: z
          .string()
          .min(
            1,
            t("checkout.validation.wardRequired") || "Vui lòng chọn phường/xã",
          )
          .max(20),
        wardName: z.string().min(1).max(255),
        districtName: z
          .string()
          .min(
            1,
            t("checkout.validation.districtRequired") ||
              "Vui lòng nhập quận/huyện",
          )
          .max(255, t("checkout.validation.districtMaxLength")),
        detailAddress: z
          .string()
          .min(
            1,
            t("checkout.validation.streetRequired") ||
              "Vui lòng nhập địa chỉ chi tiết",
          )
          .max(255, t("checkout.validation.streetMaxLength")),
        paymentMethod: z.enum(["COD", "BANK_TRANSFER"], {
          message: t("checkout.validation.paymentMethodRequired"),
        }),
        note: z
          .string()
          .max(500, t("checkout.validation.noteMaxLength"))
          .optional(),
        savedAddressId: z.string().optional(),
      }),
    [t],
  );

  // Saved addresses from backend
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch saved addresses on mount
  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const result = await profileApi.getAddresses();
      if (result.data) {
        setSavedAddresses(result.data);
        // Auto-select default address
        const defaultAddr = result.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(String(defaultAddr.id));
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "COD",
    },
  });

  // Auto-fill form when default address is loaded
  useEffect(() => {
    if (selectedAddressId && savedAddresses.length > 0) {
      const addr = savedAddresses.find(
        (a) => String(a.id) === selectedAddressId,
      );
      if (addr) {
        setValue("recipientName", addr.recipientName, { shouldValidate: true });
        setValue("phone", addr.phoneNumber, { shouldValidate: true });
        setValue("provinceCode", addr.provinceCode, { shouldValidate: true });
        setValue("provinceName", addr.provinceName, { shouldValidate: true });
        setValue("districtName", addr.districtName, { shouldValidate: true });
        setValue("wardCode", addr.wardCode, { shouldValidate: true });
        setValue("wardName", addr.wardName, { shouldValidate: true });
        setValue("detailAddress", addr.detailAddress, { shouldValidate: true });
        setValue("savedAddressId", String(addr.id));
      }
    }
  }, [selectedAddressId, savedAddresses, setValue]);

  // Validate cart before allowing checkout
  const isCartValid = items.length > 0;

  const paymentMethod = watch("paymentMethod");

  // Auto-fill form when saved address is selected
  const handleSelectAddress = (addressId: string) => {
    const id = String(addressId);
    const address = savedAddresses.find((addr) => String(addr.id) === id);
    if (address) {
      setSelectedAddressId(id);
      setValue("savedAddressId", id, { shouldValidate: true });
      setValue("recipientName", address.recipientName, {
        shouldValidate: true,
      });
      setValue("phone", address.phoneNumber, { shouldValidate: true });
      setValue("provinceCode", address.provinceCode, { shouldValidate: true });
      setValue("provinceName", address.provinceName, { shouldValidate: true });
      setValue("districtName", address.districtName, { shouldValidate: true });
      setValue("wardCode", address.wardCode, { shouldValidate: true });
      setValue("wardName", address.wardName, { shouldValidate: true });
      setValue("detailAddress", address.detailAddress, {
        shouldValidate: true,
      });
    }
  };

  // Handle form validation errors — shows a toast so the user knows why submission didn't proceed
  const onFormError = (validationErrors: Record<string, any>) => {
    console.warn("Checkout validation errors:", validationErrors);

    // Collect user-friendly field names for the first few errors
    const fieldLabels: Record<string, string> = {
      email: t("checkout.email"),
      recipientName: t("checkout.recipientName"),
      phone: t("checkout.phoneNumber"),
      provinceCode: t("checkout.city"),
      provinceName: t("checkout.city"),
      wardCode: t("checkout.ward"),
      wardName: t("checkout.ward"),
      districtName: t("checkout.district"),
      detailAddress: t("checkout.streetAddress"),
      paymentMethod: t("checkout.paymentMethod"),
    };

    const errorKeys = Object.keys(validationErrors);
    const firstErrorField = errorKeys[0];
    const firstErrorMessage =
      validationErrors[firstErrorField]?.message ||
      t("checkout.validation.required") ||
      "This field is required";

    // Show toast with the first validation error
    toast.error(
      `${fieldLabels[firstErrorField] || firstErrorField}: ${firstErrorMessage}`,
    );

    // Scroll to the first errored field so the user can see it
    setTimeout(() => {
      const el = document.querySelector(`[name="${firstErrorField}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
    }, 100);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    // Validate cart
    if (!isCartValid) {
      toast.error(t("checkout.errors.cartEmpty"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Format payload for backend (matching OrderCreateRequest structure)
      const payload = {
        contactEmail: data.email,
        address: {
          recipientName: data.recipientName,
          phone: data.phone,
          provinceCode: data.provinceCode,
          provinceName: data.provinceName,
          wardCode: data.wardCode,
          wardName: data.wardName,
          districtName: data.districtName,
          detailAddress: data.detailAddress,
        },
        paymentMethod: data.paymentMethod as PaymentMethod,
        note: data.note || undefined,
      };

      // Call API to create order (backend endpoint is /api/v1/me/orders)
      const result = await orderApi.createOrder(payload);

      if (result.error) {
        // Handle API errors with user-friendly messages
        let errorMessage =
          result.error.message || t("checkout.errors.createOrderFailed");

        // Map common backend error codes to user-friendly messages
        if (result.error.code === "CART_NOT_FOUND") {
          errorMessage = t("checkout.errors.cartNotFound");
        } else if (result.error.code === "VARIANT_NOT_FOUND") {
          errorMessage = t("checkout.errors.variantNotFound");
        } else if (
          result.error.message?.includes("tá»“n kho") ||
          result.error.message?.includes("stock")
        ) {
          errorMessage = t("checkout.errors.insufficientStock");
        } else if (result.error.message) {
          // Use backend message but make it more user-friendly if needed
          errorMessage = result.error.message;
        }

        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Extract the actual order data from the nested response structure
      // API returns { data: { data: OrderCreationResponse, meta: {...} } }
      const orderData = (result.data as any)?.data as
        | OrderCreationResponse
        | undefined;

      if (orderData?.orderId) {
        // Order created successfully
        toast.success(t("checkout.success.orderCreated"));

        // Store order data in sessionStorage for the success page
        // TODO: Replace with API call to GET /orders/{orderId} when backend endpoint is available
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `order_${orderData.orderCode}`,
            JSON.stringify(orderData),
          );
        }

        // Redirect to order success page with order code
        router.push(`/orders/${orderData.orderCode}/success`);
      } else {
        toast.error(t("checkout.errors.createOrderFailed"));
        setIsSubmitting(false);
      }
    } catch (error: any) {
      // Handle network errors
      console.error("Order creation error:", error);

      let errorMessage = t("checkout.errors.createOrderFailed");
      if (!navigator.onLine) {
        errorMessage = t("checkout.errors.networkError");
      } else if (error.response?.status === 401) {
        errorMessage = t("checkout.errors.unauthorized");
      } else if (error.response?.status >= 500) {
        errorMessage = t("checkout.errors.serverError");
      }

      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Gradient Blobs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/40 dark:from-purple-900/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/30 dark:from-[#d4b483]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300/30 dark:from-purple-800/20 to-transparent rounded-full blur-3xl" />
      </div>

      <StorefrontNavBar />

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

          <form onSubmit={handleSubmit(onSubmit, onFormError)}>
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
                  </div>
                </section>

                <Separator className="border-dashed border-gray-300 dark:border-white/20" />

                {/* Shipping Address */}
                <section className="space-y-6">
                  <SectionHeader>{t("checkout.shippingAddress")}</SectionHeader>

                  {/* Saved Addresses */}
                  {!isLoadingAddresses && savedAddresses.length > 0 && (
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
                        {savedAddresses.map((address) => (
                          <SavedAddressCard
                            key={address.id}
                            address={address}
                            isSelected={
                              selectedAddressId === String(address.id)
                            }
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
                    <AddressForm
                      recipientName={{
                        register: register("recipientName"),
                        error: errors.recipientName,
                      }}
                      phone={{
                        register: register("phone"),
                        error: errors.phone,
                      }}
                      provinceCode={{
                        register: register("provinceCode"),
                        error: errors.provinceCode,
                      }}
                      provinceName={{
                        register: register("provinceName"),
                        error: errors.provinceName,
                      }}
                      wardCode={{
                        register: register("wardCode"),
                        error: errors.wardCode,
                      }}
                      wardName={{
                        register: register("wardName"),
                        error: errors.wardName,
                      }}
                      districtName={{
                        register: register("districtName"),
                        error: errors.districtName,
                      }}
                      detailAddress={{
                        register: register("detailAddress"),
                        error: errors.detailAddress,
                      }}
                      setValue={setValue}
                      control={control}
                      watch={watch}
                      labels={{
                        recipientName: t("checkout.recipientName"),
                        recipientNamePlaceholder: t(
                          "checkout.recipientNamePlaceholder",
                        ),
                        phone: t("checkout.phoneNumber"),
                        phonePlaceholder: t("checkout.phonePlaceholder"),
                        province: t("checkout.city") || "Tá»‰nh/ThÃ nh phá»‘",
                        provincePlaceholder:
                          t("checkout.cityPlaceholder") ||
                          "Chá»n tá»‰nh/thÃ nh phá»‘",
                        district: t("checkout.district"),
                        districtPlaceholder: t("checkout.districtPlaceholder"),
                        ward: t("checkout.ward"),
                        wardPlaceholder: t("checkout.wardPlaceholder"),
                        detailAddress: t("checkout.streetAddress"),
                        detailAddressPlaceholder: t(
                          "checkout.streetPlaceholder",
                        ),
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
                      isSelected={paymentMethod === "BANK_TRANSFER"}
                      onSelect={() =>
                        setValue("paymentMethod", "BANK_TRANSFER")
                      }
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

      <StorefrontFooter />
    </div>
  );
}
