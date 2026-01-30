"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RefreshCw, Plus, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ProfileInfoCard,
  AddressCard,
  AddressDialog,
  SecurityCard,
  AureaFeaturesCard,
} from "@/components/shop/account";

import {
  profileApi,
} from "@/lib/api/profile";
import type {
  UserProfile,
  UserAddress,
  AddressRequest,
  SecuritySettings,
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
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Initialize profile from global state if available to improve perceived performance
  useEffect(() => {
    // Debug log for global user state
    console.log("[ProfilePage] Global user changed:", globalUser);
    
    if (globalUser && !profile) {
      console.log("[ProfilePage] Initializing profile from global user:", globalUser);
      setProfile({
        id: (globalUser as any).userId,
        email: globalUser.email || "",
        fullName: globalUser.fullName || "",
        avatarUrl: globalUser.avatarUrl,
        // Fill properly when API loads or use global state if available
        phoneNumber: globalUser.phoneNumber || "",
        createdAt: "", 
        updatedAt: "",
      });
      // Don't set isLoading to false here, referencing full data fetch is still needed for addresses/phone
    }
  }, [globalUser, profile]);

  // Fetch all profile data
  const fetchProfileData = useCallback(async (showLoading = true) => {
    // If we have global user, we can skip the big loading skeleton for the top part
    // but we still need addresses etc.
    if (showLoading && !globalUser) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [profileRes, addressesRes, securityRes, vouchersRes] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getAddresses(),
        profileApi.getSecuritySettings(),
        profileApi.getUserVouchers(),
      ]);

      if (profileRes.data) {
        console.log("[ProfilePage] Profile API Response:", profileRes.data);
        setProfile(profileRes.data);
        // Sync back to global state if needed
        if (globalUser) {
           console.log("[ProfilePage] Syncing back to global store:", {
             fullName: profileRes.data.fullName,
             avatarUrl: profileRes.data.avatarUrl,
             phoneNumber: profileRes.data.phoneNumber
           });
           dispatch(setUser({
             ...globalUser,
             fullName: profileRes.data.fullName,
             avatarUrl: profileRes.data.avatarUrl,
             phoneNumber: profileRes.data.phoneNumber
           }));
        }
      }
      if (addressesRes.data) setAddresses(addressesRes.data);
      if (securityRes.data) setSecuritySettings(securityRes.data);
      if (vouchersRes.data) setVouchers(vouchersRes.data);

      // Check for errors
      const errors = [profileRes, addressesRes, securityRes, vouchersRes]
        .filter((r) => r.error)
        .map((r) => r.error?.message);

      if (errors.length > 0) {
        toast.error(errors[0] || t("error.fetchFailed", { defaultValue: "Failed to load data" }));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error(t("error.unexpectedError", { defaultValue: "An unexpected error occurred" }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t, globalUser, dispatch]);

  useEffect(() => {
    // If we already have a profile from global state, we might not want to show the full loader
    if (!profile) {
      setIsLoading(true);
    }
    fetchProfileData(false); 
  }, []); // Run once on mount

  // Profile handlers
  const handleProfileUpdate = async (data: { fullName?: string; phoneNumber?: string }) => {
    const result = await profileApi.updateProfile(data);
    if (result.data) {
      setProfile(result.data);
      
      // Update global store to sync with Navbar
      if (globalUser) {
        dispatch(setUser({
          ...globalUser,
          fullName: result.data.fullName,
          phoneNumber: result.data.phoneNumber,
        }));
      }

      toast.success(t("profile.updateSuccess", { defaultValue: "Profile updated successfully" }));
    } else if (result.error) {
      toast.error(result.error.message || t("error.updateFailed", { defaultValue: "Failed to update profile" }));
    }
  };

  const handleAvatarChange = async (file: File) => {
    const result = await profileApi.uploadAvatar(file);
    if (result.data && profile) {
      setProfile({ ...profile, avatarUrl: result.data.avatarUrl });
      
      // Update global store to sync with Navbar
      if (globalUser) {
        dispatch(setUser({
          ...globalUser,
          avatarUrl: result.data.avatarUrl,
        }));
      }

      toast.success(t("profile.avatarUpdated", { defaultValue: "Avatar updated" }));
    } else if (result.error) {
      toast.error(result.error.message || t("error.uploadFailed", { defaultValue: "Failed to upload avatar" }));
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
      // Refresh only addresses logic could be better but fetching all ensures consistency
      await fetchProfileData(false);
      toast.success(
        editingAddress
          ? t("profile.addresses.updated", { defaultValue: "Address updated" })
          : t("profile.addresses.added", { defaultValue: "Address added" })
      );
    } else if (result.error) {
      toast.error(result.error.message || t("error.saveFailed", { defaultValue: "Failed to save address" }));
      throw new Error(result.error.message);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const result = await profileApi.deleteAddress(id);
    if (!result.error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success(t("profile.addresses.deleted", { defaultValue: "Address deleted" }));
    } else {
      toast.error(result.error.message || t("error.deleteFailed", { defaultValue: "Failed to delete address" }));
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const result = await profileApi.setDefaultAddress(id);
    if (result.data) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      toast.success(t("profile.addresses.defaultSet", { defaultValue: "Default address set" }));
    } else if (result.error) {
      toast.error(result.error.message || t("error.updateFailed", { defaultValue: "Failed to update" }));
    }
  };

  // Security handlers
  const handleChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const result = await profileApi.changePassword(data);
    if (!result.error) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const handleToggle2FA = async (enabled: boolean) => {
    const result = await profileApi.toggleTwoFactor(enabled);
    if (result.data) {
      setSecuritySettings(result.data);
      toast.success(
        enabled
          ? t("profile.security.2faEnabled", { defaultValue: "Two-factor authentication enabled" })
          : t("profile.security.2faDisabled", { defaultValue: "Two-factor authentication disabled" })
      );
    } else if (result.error) {
      toast.error(result.error.message || t("error.updateFailed", { defaultValue: "Failed to update" }));
    }
  };

  // Loading skeleton
  if (isLoading && !profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/10">
        <div>
          <h1
            className="text-2xl md:text-3xl font-light tracking-wide text-foreground"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {t("profile.title", { defaultValue: "My Account" })}
          </h1>
          <p
            className="text-muted-foreground font-light text-sm mt-1"
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          >
            {t("profile.subtitle", { defaultValue: "Manage your profile and security settings" })}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchProfileData(false)}
          disabled={isRefreshing}
          className="rounded-full hover:bg-accent/10 hover:text-accent border-black/5 dark:border-white/10"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        {profile && (
          <section>
            <ProfileInfoCard
              profile={profile}
              isLoading={isLoading}
              onUpdate={handleProfileUpdate}
            />
          </section>
        )}
        
        {/* Aurea Features */}
        <section>
          <AureaFeaturesCard vouchers={vouchers} />
        </section>

        {/* Addresses Section */}
        <section className="bg-card/40 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-light tracking-wide text-foreground">
                {t("profile.addresses.title", { defaultValue: "Delivery Addresses" })}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Manage your shipping destinations
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              className="gap-2 hover:bg-accent/10 hover:text-accent border-accent/20"
            >
              <Plus className="w-4 h-4" />
              {t("profile.addresses.addNew", { defaultValue: "Add New" })}
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
            <div className="text-center py-12 rounded-xl border border-dashed border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm text-muted-foreground">
                {t("profile.addresses.noAddresses", { defaultValue: "No delivery addresses yet" })}
              </p>
              <Button
                variant="link"
                onClick={handleAddAddress}
                className="mt-2 text-accent"
              >
                {t("profile.addresses.addFirst", { defaultValue: "Add your first address" })}
              </Button>
            </div>
          )}
        </section>

        {/* Security Settings */}
        {securitySettings && (
          <section>
            <SecurityCard
              settings={securitySettings}
              onChangePassword={handleChangePassword}
              onToggle2FA={handleToggle2FA}
            />
          </section>
        )}
      </div>

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
