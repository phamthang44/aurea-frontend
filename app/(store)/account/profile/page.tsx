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
    const result = await profileApi.deleteAddress(id);
    if (!result.error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
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
    const result = await profileApi.setDefaultAddress(id);
    if (result.data) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        })),
      );
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
            <h2
              className="text-xl md:text-2xl font-light tracking-wide text-foreground"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {t("profile.addresses.title", {
                defaultValue: "Delivery Addresses",
              })}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddAddress}
            className="group gap-2.5 text-xs tracking-[0.15em] uppercase font-normal text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors duration-500"
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
            {t("profile.addresses.addNew", { defaultValue: "Add New" })}
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
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border/50">
            <MapPin className="w-8 h-8 mx-auto mb-4 text-muted-foreground/30 stroke-[1.5]" />
            <p
              className="text-sm text-muted-foreground/60 tracking-wide mb-6"
              style={{ fontFamily: "var(--font-sans), sans-serif" }}
            >
              {t("profile.addresses.noAddresses", {
                defaultValue: "No delivery addresses saved",
              })}
            </p>
            <button
              onClick={handleAddAddress}
              className="text-xs tracking-[0.2em] uppercase text-accent hover:text-accent/80 transition-colors duration-300 underline underline-offset-4 decoration-accent/30 hover:decoration-accent/60"
            >
              {t("profile.addresses.addFirst", {
                defaultValue: "Add your first address",
              })}
            </button>
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
