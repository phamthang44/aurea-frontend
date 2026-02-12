"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RefreshCw, Plus, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ProfileInfoCard,
  AddressCard,
  AddressDialog,
  AureaFeaturesCard,
} from "@/components/shop/account";

import { profileApi } from "@/lib/api/profile";
import type {
  UserProfile,
  UserAddress,
  AddressRequest,
  UserVoucher,
} from "@/lib/types/profile";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/authSlice";

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const globalUser = useAppSelector((state) => state.auth.user);

  // Data states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null,
  );

  // Initialize profile from global state if available
  useEffect(() => {
    if (globalUser && !profile) {
      setProfile({
        id: (globalUser as any).userId,
        email: globalUser.email || "",
        fullName: globalUser.fullName || "",
        avatarUrl: globalUser.avatarUrl,
        phoneNumber: globalUser.phoneNumber || "",
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [globalUser, profile]);

  // Fetch all profile data
  const fetchProfileData = useCallback(
    async (showLoading = true) => {
      if (showLoading && !globalUser) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [profileRes, addressesRes, vouchersRes] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getAddresses(),
          profileApi.getUserVouchers(),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          if (globalUser) {
            dispatch(
              setUser({
                ...globalUser,
                fullName: profileRes.data.fullName,
                avatarUrl: profileRes.data.avatarUrl,
                phoneNumber: profileRes.data.phoneNumber,
              }),
            );
          }
        }
        if (addressesRes.data) setAddresses(addressesRes.data);
        if (vouchersRes.data) setVouchers(vouchersRes.data);

        const errors = [profileRes, addressesRes, vouchersRes]
          .filter((r) => r.error)
          .map((r) => r.error?.message);

        if (errors.length > 0) {
          toast.error(
            errors[0] ||
              t("error.fetchFailed", { defaultValue: "Failed to load data" }),
          );
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(
          t("error.unexpectedError", {
            defaultValue: "An unexpected error occurred",
          }),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t, globalUser, dispatch],
  );

  useEffect(() => {
    if (!profile) {
      setIsLoading(true);
    }
    fetchProfileData(false);
  }, []);

  // Profile handlers
  const handleProfileUpdate = async (data: {
    fullName?: string;
    phoneNumber?: string;
  }) => {
    const result = await profileApi.updateProfile(data);
    if (result.data) {
      setProfile(result.data);

      if (globalUser) {
        dispatch(
          setUser({
            ...globalUser,
            fullName: result.data.fullName,
            phoneNumber: result.data.phoneNumber,
          }),
        );
      }

      toast.success(
        t("profile.updateSuccess", {
          defaultValue: "Profile updated successfully",
        }),
      );
    } else if (result.error) {
      toast.error(
        result.error.message ||
          t("error.updateFailed", { defaultValue: "Failed to update profile" }),
      );
    }
  };

  const handleAvatarChange = async (file: File) => {
    const result = await profileApi.uploadAvatar(file);
    if (result.data && profile) {
      setProfile({ ...profile, avatarUrl: result.data.avatarUrl });

      if (globalUser) {
        dispatch(
          setUser({
            ...globalUser,
            avatarUrl: result.data.avatarUrl,
          }),
        );
      }

      toast.success(
        t("profile.avatarUpdated", { defaultValue: "Avatar updated" }),
      );
    } else if (result.error) {
      toast.error(
        result.error.message ||
          t("error.uploadFailed", { defaultValue: "Failed to upload avatar" }),
      );
    }
  };

  // Address handlers
  const handleAddAddress = () => {
    if (addresses.length >= 5) {
      toast.error(
        t("profile.addresses.limitReached", {
          defaultValue: "You can only save up to 5 addresses",
        }),
      );
      return;
    }
    setEditingAddress(null);
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = async (data: AddressRequest) => {
    let result;
    if (editingAddress) {
      result = await profileApi.updateAddress(editingAddress.id, data);
    } else {
      result = await profileApi.createAddress(data);
    }

    if (result.data) {
      await fetchProfileData(false);
      toast.success(
        editingAddress
          ? t("profile.addresses.updated", { defaultValue: "Address updated" })
          : t("profile.addresses.added", { defaultValue: "Address added" }),
      );
    } else if (result.error) {
      toast.error(
        result.error.message ||
          t("error.saveFailed", { defaultValue: "Failed to save address" }),
      );
      throw new Error(result.error.message);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (addr && addr.isDefault && addresses.length <= 1) {
      toast.error(
        t("profile.addresses.deleteDefaultDenied", {
          defaultValue: "You cannot delete your only default address",
        }),
      );
      return;
    }
    const result = await profileApi.deleteAddress(id);
    if (!result.error) {
      await fetchProfileData(false);
      toast.success(
        t("profile.addresses.deleted", { defaultValue: "Address deleted" }),
      );
    } else {
      toast.error(
        result.error.message ||
          t("error.deleteFailed", { defaultValue: "Failed to delete address" }),
      );
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;

    const result = await profileApi.updateAddress(id, {
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      provinceCode: addr.provinceCode,
      provinceName: addr.provinceName,
      districtName: addr.districtName,
      wardCode: addr.wardCode,
      wardName: addr.wardName,
      detailAddress: addr.detailAddress,
      addressType: addr.addressType,
      isDefault: true,
      label: addr.label,
      notes: addr.notes,
    });

    if (result.data) {
      await fetchProfileData(false);
      toast.success(
        t("profile.addresses.defaultSet", {
          defaultValue: "Default address set",
        }),
      );
    } else if (result.error) {
      toast.error(
        result.error.message ||
          t("error.updateFailed", { defaultValue: "Failed to update" }),
      );
    }
  };

  // Luxury Loading skeleton
  if (isLoading && !profile) {
    return (
      <div className="space-y-16">
        {/* Header skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-px w-12 bg-accent/30" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Profile section skeleton */}
        <div className="grid lg:grid-cols-[1fr,2fr] gap-16">
          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="w-36 h-36 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Addresses skeleton */}
        <div className="space-y-8">
          <Skeleton className="h-6 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* Luxury Page Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Decorative line */}
        <div className="w-12 h-px bg-accent/60 mb-6" />

        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <h1
              className="text-3xl md:text-4xl font-light tracking-[0.02em] text-foreground"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {t("profile.title", { defaultValue: "My Account" })}
            </h1>
            <p
              className="text-sm tracking-[0.1em] uppercase text-muted-foreground/70 font-light"
              style={{ fontFamily: "var(--font-sans), sans-serif" }}
            >
              {t("profile.subtitle", {
                defaultValue: "Personal details & preferences",
              })}
            </p>
          </div>

          <button
            onClick={() => fetchProfileData(false)}
            disabled={isRefreshing}
            className="group p-3 -m-3 text-muted-foreground/50 hover:text-accent transition-colors duration-500"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform duration-700 ${
                isRefreshing ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </button>
        </div>
      </motion.header>

      {/* Profile Information Section */}
      {profile && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProfileInfoCard
            profile={profile}
            isLoading={isLoading}
            onUpdate={handleProfileUpdate}
          />
        </motion.section>
      )}

      {/* Rewards & Benefits Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <AureaFeaturesCard vouchers={vouchers} />
      </motion.section>

      {/* Delivery Addresses Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-10"
      >
        {/* Section Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60"
              style={{ fontFamily: "var(--font-sans), sans-serif" }}
            >
              Shipping
            </p>
            <div className="flex items-baseline gap-3">
              <h2
                className="text-xl md:text-2xl font-light tracking-wide text-foreground"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                {t("profile.addresses.title", {
                  defaultValue: "Address Book",
                })}
              </h2>
              {addresses.length > 0 && (
                <span className="text-xs font-medium text-muted-foreground/50 tabular-nums">
                  {addresses.length}/5
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAddress}
            disabled={addresses.length >= 5}
            className="gap-2 text-xs font-medium rounded-lg border-border hover:border-accent hover:text-accent transition-colors duration-300"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("profile.addresses.addNew", { defaultValue: "Add Address" })}
          </Button>
        </div>

        {/* Addresses Grid */}
        {addresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <AddressCard
                key={address.id}
                address={address}
                index={index}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
                disableDelete={address.isDefault && addresses.length <= 1}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10">
            <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground/80 mb-1.5">
              {t("profile.addresses.noAddresses", {
                defaultValue: "No addresses yet",
              })}
            </p>
            <p className="text-xs text-muted-foreground/60 mb-6">
              {t("profile.addresses.noAddressesDesc", {
                defaultValue: "Add a delivery address to get started",
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              className="gap-2 text-xs font-medium rounded-lg border-accent/40 text-accent hover:bg-accent/10 hover:border-accent transition-colors duration-300"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("profile.addresses.addFirst", {
                defaultValue: "Add your first address",
              })}
            </Button>
          </div>
        )}
      </motion.section>

      {/* Address Dialog */}
      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        address={editingAddress}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
