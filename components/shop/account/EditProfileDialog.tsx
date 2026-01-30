"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Camera, Lock, User, Save, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LuxuryInput } from "@/components/auth/LuxuryInput";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { profileApi } from "@/lib/api/profile";
import type { UserProfile, UpdateProfileRequest } from "@/lib/types/profile";

// Validation Schema
const normalizePhoneNumber = (phone: string) => {
  if (!phone) return "";
  let clean = phone.replace(/[^\d]/g, "");
  if (clean.startsWith("84")) clean = "0" + clean.slice(2);
  return clean;
};

const createProfileSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z
      .string()
      .min(2, t("validation.fullNameMin") || "Name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => {
        if (!val) return true;
        const normalized = normalizePhoneNumber(val);
        return /^(0)(3|5|7|8|9)[0-9]{8}$/.test(normalized);
      }, t("validation.phoneInvalid") || "Invalid phone number"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    birthDate: z.string().optional().or(z.literal("")),
    avatarUrl: z.string().optional(),
  });

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditProfileDialogProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Determine if birthdate is locked (already set in DB)
  // We assume if profile.birthDate is present and valid, it's locked.
  const isBirthDateLocked = !!profile.birthDate;

  const schema = createProfileSchema(t);
  type FormData = z.infer<ReturnType<typeof createProfileSchema>>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      gender: "OTHER",
      birthDate: "",
      avatarUrl: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && profile) {
      reset({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender || "OTHER",
        // Ensure date format is YYYY-MM-DD for input type="date"
        birthDate: profile.birthDate ? profile.birthDate.split("T")[0] : "",
        avatarUrl: profile.avatarUrl || "",
      });
      setPreviewUrl(profile.avatarUrl || null);
    }
  }, [open, profile, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      await onSave({
        fullName: data.fullName,
        phoneNumber: normalizePhoneNumber(data.phoneNumber || "") || undefined,
        gender: data.gender,
        // Only send birthDate if it wasn't locked (meaning checking specifically if we edited it)
        birthDate: data.birthDate || undefined,
        avatarUrl: data.avatarUrl || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsAvatarUploading(true);
        try {
          // Upload to FileController to get temp URL
          const result = await profileApi.uploadFile(file);
          
          if (result.data) {
             const url = result.data;
             setPreviewUrl(url);
             setValue("avatarUrl", url, { shouldDirty: true });
          } else {
             // Handle error
             console.error("Upload failed", result.error);
          }
        } catch (error) {
           console.error("Upload error", error);
        } finally {
          setIsAvatarUploading(false);
        }
      }
    };
    input.click();
  };

  const currentGender = watch("gender");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#09090b] border-gray-200 dark:border-white/10 p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-light tracking-wide uppercase text-center" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
            {t("profile.edit.title", { defaultValue: "Edit Profile" })}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative group cursor-pointer outline-none"
              disabled={isAvatarUploading}
            >
              <div
                className={cn(
                  "w-28 h-28 rounded-full overflow-hidden",
                  "bg-muted border border-gray-200 dark:border-white/10",
                  "flex items-center justify-center",
                  "transition-all duration-300 group-hover:border-[#D4AF37] group-focus:ring-2 group-focus:ring-[#D4AF37]/50"
                )}
              >
                {/* Show Spinner while uploading */}
                {isAvatarUploading ? (
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "absolute inset-0 rounded-full",
                  "bg-black/40 opacity-0 group-hover:opacity-100",
                  "flex items-center justify-center",
                  "transition-opacity duration-300 pointer-events-none"
                )}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-0 right-1 bg-white dark:bg-zinc-800 rounded-full p-1.5 border border-gray-200 dark:border-white/10 shadow-sm">
                 <Camera className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              </div>
            </button>
            <p className="mt-2 text-xs text-muted-foreground font-light text-center max-w-[200px]">
              {t("profile.edit.avatarHint", { defaultValue: "Tap to update your profile photo" })}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <LuxuryInput
              id="fullName"
              label={t("profile.info.fullName", { defaultValue: "Full Name" })}
              {...register("fullName")}
              error={errors.fullName?.message}
              required
            />

            {/* Email (Read Only) */}
            <div className="space-y-2 opacity-80">
              <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                {t("profile.info.email", { defaultValue: "Email (Read-only)" })}
                <Lock className="w-3 h-3 text-muted-foreground/70" />
              </Label>
              <div className="w-full bg-muted/30 border-b border-dashed border-gray-300 dark:border-white/10 py-2 px-1 text-sm text-muted-foreground font-light cursor-not-allowed flex items-center justify-between">
                {profile.email}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("profile.edit.emailLocked", { defaultValue: "Email cannot be changed" })}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Phone */}
            <LuxuryInput
              id="phoneNumber"
              label={t("profile.info.phone", { defaultValue: "Phone Number" })}
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
              type="tel"
              placeholder="+84..."
            />

            {/* Gender Chips */}
            <div className="space-y-3">
              <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground block">
                {t("profile.info.gender", { defaultValue: "Gender" })}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                ].map((option) => {
                  const isSelected = currentGender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("gender", option.value as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-sm"
                          : "bg-transparent text-foreground border-gray-200 dark:border-white/20 hover:border-[#D4AF37]/50"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Birthdate (Conditional Lock) */}
            <div className="space-y-2">
               <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                {t("profile.info.birthDate", { defaultValue: "Birthday" })}
                {isBirthDateLocked && <Lock className="w-3 h-3 text-muted-foreground/70" />}
              </Label>
              
              {isBirthDateLocked ? (
                 <div className="relative group">
                    <input 
                      type="text" 
                      value={profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : ""} 
                      readOnly
                      disabled
                      className="w-full bg-transparent border-b border-border py-2 px-1 text-sm text-muted-foreground font-light cursor-not-allowed focus:outline-none"
                    />
                    <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <span className="text-xs text-orange-500 flex items-center gap-1 cursor-help">
                                  <Info className="w-3 h-3" />
                                  {t("profile.edit.birthDateLocked", { defaultValue: "Birthdate can only be updated once" })}
                               </span>
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>{t("profile.edit.contactSupport", { defaultValue: "Contact support to change your birthdate" })}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                 </div>
              ) : (
                <div className="space-y-1">
                   <input
                      type="date"
                      {...register("birthDate")}
                      className="w-full bg-transparent border-0 border-b border-border pb-2 pt-1 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#D4AF37] transition-colors font-light appearance-none"
                   />
                   <p className="text-[10px] text-[#D4AF37] italic">
                      {t("profile.edit.birthDateBonus", { defaultValue: "Add your birthday to receive special gifts 🎁" })}
                   </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-6 gap-3 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-[#000000] dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                {isSaving && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
                {t("common.save", { defaultValue: "Save Changes" })}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
