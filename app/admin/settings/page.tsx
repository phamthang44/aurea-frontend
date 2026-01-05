'use client';

import { useState } from "react";
import { Save, Globe, Mail, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-wide text-foreground mb-2">
            {t("admin.settings.title", { defaultValue: "Settings" })}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.settings.subtitle", { defaultValue: "Configure your store settings and preferences" })}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D4AF37] hover:bg-[#B8A072] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? t("admin.settings.saving", { defaultValue: "Saving..." }) : t("admin.settings.saveChanges", { defaultValue: "Save Changes" })}
        </Button>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-foreground">
                {t("admin.settings.general.title", { defaultValue: "General Settings" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.general.subtitle", { defaultValue: "Basic store information and configuration" })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">{t("admin.settings.general.storeName", { defaultValue: "Store Name" })}</Label>
                <Input id="store-name" defaultValue="AUREA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-url">{t("admin.settings.general.storeUrl", { defaultValue: "Store URL" })}</Label>
                <Input id="store-url" defaultValue="https://aurea.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">{t("admin.settings.general.storeDescription", { defaultValue: "Store Description" })}</Label>
              <Textarea
                id="store-description"
                defaultValue="Luxury fashion and accessories"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-foreground">
                {t("admin.settings.email.title", { defaultValue: "Email Settings" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.email.subtitle", { defaultValue: "Configure email notifications and templates" })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-email">{t("admin.settings.email.fromEmail", { defaultValue: "From Email" })}</Label>
                <Input id="from-email" defaultValue="noreply@aurea.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">{t("admin.settings.email.supportEmail", { defaultValue: "Support Email" })}</Label>
                <Input id="support-email" defaultValue="support@aurea.com" type="email" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{t("admin.settings.email.orderConfirmation", { defaultValue: "Order Confirmation Emails" })}</p>
                <p className="text-xs text-muted-foreground">{t("admin.settings.email.orderConfirmationDesc", { defaultValue: "Send automatic emails when orders are placed" })}</p>
              </div>
              <div className="h-6 w-11 bg-[#D4AF37] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-foreground">
                {t("admin.settings.notifications.title", { defaultValue: "Notifications" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.notifications.subtitle", { defaultValue: "Manage notification preferences" })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: t("admin.settings.notifications.newOrders", { defaultValue: "New Orders" }), description: t("admin.settings.notifications.newOrdersDesc", { defaultValue: "Get notified when new orders arrive" }) },
              { label: t("admin.settings.notifications.lowStockAlerts", { defaultValue: "Low Stock Alerts" }), description: t("admin.settings.notifications.lowStockAlertsDesc", { defaultValue: "Receive alerts when products are running low" }) },
              { label: t("admin.settings.notifications.newUserRegistrations", { defaultValue: "New User Registrations" }), description: t("admin.settings.notifications.newUserRegistrationsDesc", { defaultValue: "Get notified about new user sign-ups" }) },
              { label: t("admin.settings.notifications.productReviews", { defaultValue: "Product Reviews" }), description: t("admin.settings.notifications.productReviewsDesc", { defaultValue: "Receive notifications for new product reviews" }) },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="h-6 w-11 bg-[#D4AF37] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-foreground">
                {t("admin.settings.security.title", { defaultValue: "Security" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.security.subtitle", { defaultValue: "Manage security and authentication settings" })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{t("admin.settings.security.twoFactorAuth", { defaultValue: "Two-Factor Authentication" })}</p>
                <p className="text-xs text-muted-foreground">{t("admin.settings.security.twoFactorAuthDesc", { defaultValue: "Add an extra layer of security to your account" })}</p>
              </div>
              <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                {t("admin.settings.security.enable", { defaultValue: "Enable" })}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{t("admin.settings.security.password", { defaultValue: "Password" })}</p>
                <p className="text-xs text-muted-foreground">{t("admin.settings.security.passwordDesc", { defaultValue: "Last changed 30 days ago" })}</p>
              </div>
              <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                {t("admin.settings.security.change", { defaultValue: "Change" })}
              </Button>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-wide text-foreground">
                {t("admin.settings.theme.title", { defaultValue: "Theme & Appearance" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.theme.subtitle", { defaultValue: "Customize the look and feel of your admin panel" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border-2 border-blue-600 rounded-lg cursor-pointer">
              <div className="h-20 bg-white rounded mb-2" />
              <p className="text-xs text-center font-medium">{t("admin.settings.theme.light", { defaultValue: "Light" })}</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-[#1A1A1A] rounded mb-2" />
              <p className="text-xs text-center font-medium">{t("admin.settings.theme.dark", { defaultValue: "Dark" })}</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-gradient-to-br from-white to-[#1A1A1A] rounded mb-2" />
              <p className="text-xs text-center font-medium">{t("admin.settings.theme.auto", { defaultValue: "Auto" })}</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-blue-600 rounded mb-2" />
              <p className="text-xs text-center font-medium">{t("admin.settings.theme.blue", { defaultValue: "Blue" })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

