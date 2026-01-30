"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Lock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserProfile, UpdateProfileRequest } from "@/lib/types/profile";
import { EditProfileDialog } from "./EditProfileDialog";

interface ProfileInfoCardProps {
  profile: UserProfile;
  isLoading?: boolean;
  onUpdate: (data: UpdateProfileRequest) => Promise<void>;
}

export function ProfileInfoCard({
  profile,
  isLoading,
  onUpdate,
}: ProfileInfoCardProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-light tracking-wide text-foreground">
          {t("profile.info.title", { defaultValue: "Profile Information" })}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="text-accent hover:text-accent/80"
        >
          {t("common.edit", { defaultValue: "Edit" })}
        </Button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={cn(
            "w-24 h-24 rounded-full overflow-hidden",
            "bg-muted border-2 border-accent/30",
            "flex items-center justify-center"
          )}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <h3 className="mt-4 text-xl font-medium text-foreground">
          {profile.fullName}
        </h3>
        <p className="text-sm text-muted-foreground font-light">
          {profile.email}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email (Read-only display) */}
        <div className="space-y-1">
          <label className="text-xs font-light tracking-wider uppercase text-muted-foreground flex items-center gap-2">
            {t("profile.info.email", { defaultValue: "Email Address" })}
          </label>
          <div className="flex items-center gap-2 text-sm">
             <span>{profile.email}</span>
             <Lock className="w-3 h-3 text-muted-foreground/50" />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
            {t("profile.info.phone", { defaultValue: "Phone Number" })}
          </label>
          <div className="text-sm">
             {profile.phoneNumber || (
               <span className="text-muted-foreground italic text-xs">
                 {t("profile.info.notSet", { defaultValue: "Not set" })}
               </span>
             )}
          </div>
        </div>

        {/* Gender */}
         <div className="space-y-1">
          <label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
            {t("profile.info.gender", { defaultValue: "Gender" })}
          </label>
          <div className="text-sm capitalize">
             {profile.gender ? profile.gender.toLowerCase() : (
               <span className="text-muted-foreground italic text-xs">
                 {t("profile.info.notSet", { defaultValue: "Not set" })}
               </span>
             )}
          </div>
        </div>

        {/* Birthdate */}
        <div className="space-y-1">
          <label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
            {t("profile.info.birthDate", { defaultValue: "Birthday" })}
          </label>
          <div className="text-sm">
             {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : (
               <span className="text-muted-foreground italic text-xs">
                 {t("profile.info.addBirthday", { defaultValue: "Add birthday for gifts 🎁" })}
               </span>
             )}
          </div>
        </div>
      </div>

      <EditProfileDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={profile}
        onSave={onUpdate}
      />
    </motion.div>
  );
}
