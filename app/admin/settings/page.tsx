'use client';

import { useState } from "react";
import { Save, Globe, Mail, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
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
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your store settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D4AF37] hover:bg-[#B8A072] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
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
                General Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Basic store information and configuration
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="AUREA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-url">Store URL</Label>
                <Input id="store-url" defaultValue="https://aurea.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
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
                Email Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure email notifications and templates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" defaultValue="noreply@aurea.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" defaultValue="support@aurea.com" type="email" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Order Confirmation Emails</p>
                <p className="text-xs text-muted-foreground">Send automatic emails when orders are placed</p>
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
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage notification preferences
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "New Orders", description: "Get notified when new orders arrive" },
              { label: "Low Stock Alerts", description: "Receive alerts when products are running low" },
              { label: "New User Registrations", description: "Get notified about new user sign-ups" },
              { label: "Product Reviews", description: "Receive notifications for new product reviews" },
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
                Security
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage security and authentication settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                Change
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
                Theme & Appearance
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of your admin panel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border-2 border-blue-600 rounded-lg cursor-pointer">
              <div className="h-20 bg-white rounded mb-2" />
              <p className="text-xs text-center font-medium">Light</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-[#1A1A1A] rounded mb-2" />
              <p className="text-xs text-center font-medium">Dark</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-gradient-to-br from-white to-[#1A1A1A] rounded mb-2" />
              <p className="text-xs text-center font-medium">Auto</p>
            </div>
            <div className="p-4 border border-border rounded-lg cursor-pointer hover:border-blue-600/50">
              <div className="h-20 bg-blue-600 rounded mb-2" />
              <p className="text-xs text-center font-medium">Blue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

