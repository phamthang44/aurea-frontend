"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Lock, Mail, Phone, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="space-y-12">
      {/* Section Label */}
      <div className="space-y-2">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60"
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          Profile
        </p>
        <h2
          className="text-xl md:text-2xl font-light tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {t("profile.info.title", { defaultValue: "Personal Information" })}
        </h2>
      </div>

      {/* Profile Content - Asymmetric Layout */}
      <div className="grid lg:grid-cols-[280px,1fr] gap-16 items-start">
        {/* Left Column - Avatar & Identity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center lg:items-start space-y-6"
        >
          {/* Avatar with elegant border */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 via-transparent to-accent/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div
              className={cn(
                "relative w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden",
                "border border-border/50",
                "flex items-center justify-center bg-muted/30",
              )}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/40 stroke-[1.5]" />
              )}
            </div>
          </div>

          {/* Name & Email */}
          <div className="text-center lg:text-left space-y-2">
            <h3
              className="text-xl font-light tracking-wide text-foreground"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {profile.fullName || "Guest"}
            </h3>
            <p className="text-sm text-muted-foreground/70 font-light tracking-wide">
              {profile.email}
            </p>
          </div>

          {/* Edit Button - Minimal */}
          <button
            onClick={() => setIsDialogOpen(true)}
            className="text-xs tracking-[0.2em] uppercase text-accent hover:text-accent/80 transition-colors duration-300 underline underline-offset-4 decoration-accent/30 hover:decoration-accent/60"
          >
            {t("common.edit", { defaultValue: "Edit Profile" })}
          </button>
        </motion.div>

        {/* Right Column - Details Grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Info Items - Clean Layout */}
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {/* Email */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                  {t("profile.info.email", { defaultValue: "Email" })}
                </label>
              </div>
              <div className="flex items-center gap-2 pl-5.5">
                <span className="text-sm text-foreground/90 tracking-wide">
                  {profile.email}
                </span>
                <Lock className="w-3 h-3 text-muted-foreground/30" />
              </div>
              <div className="h-px bg-border/30 mt-3 group-hover:bg-accent/20 transition-colors duration-500" />
            </div>

            {/* Phone */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                  {t("profile.info.phone", { defaultValue: "Phone" })}
                </label>
              </div>
              <p className="text-sm text-foreground/90 tracking-wide pl-5.5">
                {profile.phoneNumber || (
                  <span className="text-muted-foreground/50 italic">
                    {t("profile.info.notSet", { defaultValue: "Not provided" })}
                  </span>
                )}
              </p>
              <div className="h-px bg-border/30 mt-3 group-hover:bg-accent/20 transition-colors duration-500" />
            </div>

            {/* Gender */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                  {t("profile.info.gender", { defaultValue: "Gender" })}
                </label>
              </div>
              <p className="text-sm text-foreground/90 tracking-wide pl-5.5 capitalize">
                {profile.gender ? (
                  profile.gender.toLowerCase()
                ) : (
                  <span className="text-muted-foreground/50 italic">
                    {t("profile.info.notSet", { defaultValue: "Not provided" })}
                  </span>
                )}
              </p>
              <div className="h-px bg-border/30 mt-3 group-hover:bg-accent/20 transition-colors duration-500" />
            </div>

            {/* Birthday */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 stroke-[1.5]" />
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                  {t("profile.info.birthDate", { defaultValue: "Birthday" })}
                </label>
              </div>
              <p className="text-sm text-foreground/90 tracking-wide pl-5.5">
                {profile.birthDate ? (
                  new Date(profile.birthDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                ) : (
                  <span className="text-muted-foreground/50 italic">
                    {t("profile.info.addBirthday", {
                      defaultValue: "Add for special offers",
                    })}
                  </span>
                )}
              </p>
              <div className="h-px bg-border/30 mt-3 group-hover:bg-accent/20 transition-colors duration-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <EditProfileDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={profile}
        onSave={onUpdate}
      />
    </div>
  );
}
