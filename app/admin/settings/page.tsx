'use client';

import { useState } from "react";
import { 
  Save, 
  Globe, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Store, 
  CreditCard, 
  Truck, 
  ChevronRight,
  ExternalLink,
  Smartphone,
  Check,
  Type,
  Upload,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SettingsTab = 'general' | 'branding' | 'payments' | 'shipping' | 'notifications' | 'security' | 'theme';

const Switch = ({ defaultChecked, className }: { defaultChecked?: boolean; className?: string }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2",
        checked ? "bg-[#D4AF37]" : "bg-slate-200 dark:bg-slate-800",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: t("admin.settings.saving"),
      success: t("admin.settings.saveSuccess"),
      error: t("admin.settings.saveError")
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const navItems = [
    { id: 'general', icon: Store, label: t("admin.settings.tabs.general.label"), desc: t("admin.settings.tabs.general.desc") },
    { id: 'branding', icon: Palette, label: t("admin.settings.tabs.branding.label"), desc: t("admin.settings.tabs.branding.desc") },
    { id: 'payments', icon: CreditCard, label: t("admin.settings.tabs.payments.label"), desc: t("admin.settings.tabs.payments.desc") },
    { id: 'shipping', icon: Truck, label: t("admin.settings.tabs.shipping.label"), desc: t("admin.settings.tabs.shipping.desc") },
    { id: 'notifications', icon: Bell, label: t("admin.settings.tabs.notifications.label"), desc: t("admin.settings.tabs.notifications.desc") },
    { id: 'security', icon: Shield, label: t("admin.settings.tabs.security.label"), desc: t("admin.settings.tabs.security.desc") },
    { id: 'theme', icon: Smartphone, label: t("admin.settings.tabs.appearance.label"), desc: t("admin.settings.tabs.appearance.desc") },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Store className="h-6 w-6 text-[#D4AF37]" />
                {t("admin.settings.general.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.general.storeName")}</Label>
                  <Input defaultValue="AUREA" className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6" />
                  <p className="text-[10px] text-slate-500 font-light">{t("admin.settings.general.storeNameHint")}</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.general.publicUrl")}</Label>
                  <div className="relative">
                    <Input defaultValue="https://aurea.luxury" className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6 pl-10" />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-light">{t("admin.settings.general.publicUrlHint")}</p>
                </div>
                <div className="col-span-full space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.general.mission")}</Label>
                  <Textarea 
                    defaultValue="Providing timeless elegance through curated luxury experiences." 
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 min-h-[120px]" 
                  />
                  <p className="text-[10px] text-slate-500 font-light">{t("admin.settings.general.missionHint")}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Mail className="h-6 w-6 text-[#D4AF37]" />
                {t("admin.settings.general.contacts")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.general.inquiryEmail")}</Label>
                  <Input defaultValue="concierge@aurea.luxury" className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.general.orderAlerts")}</Label>
                  <Input defaultValue="alerts@aurea.luxury" className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'branding':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Palette className="h-6 w-6 text-[#D4AF37]" />
                {t("admin.settings.branding.title")}
              </h2>
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.branding.logo")}</Label>
                    <div className="h-40 w-64 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 group cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                      <p className="text-[10px] font-bold tracking-widest text-[#D4AF37] mb-2">AUREA</p>
                      <Upload className="h-5 w-5 text-slate-300 group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.branding.palette")}</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 border border-white/20" />
                        <Input defaultValue="#D4AF37" className="w-32 rounded-lg" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-light italic">{t("admin.settings.branding.paletteHint")}</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400">{t("admin.settings.branding.theme")}</Label>
                      <div className="flex gap-3">
                         <div className="h-10 w-24 rounded-lg border-2 border-slate-900 dark:border-[#D4AF37] bg-slate-900 flex items-center justify-center cursor-pointer">
                            <span className="text-[10px] text-white font-bold">{t("admin.settings.branding.themeDark")}</span>
                         </div>
                         <div className="h-10 w-24 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer">
                            <span className="text-[10px] text-slate-600 font-bold">{t("admin.settings.branding.themeLight")}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Type className="h-6 w-6 text-[#D4AF37]" />
                {t("admin.settings.branding.typography.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">{t("admin.settings.branding.typography.serif")}</p>
                  <p className="text-3xl font-serif text-slate-900 dark:text-slate-100 mb-2">Cormorant Garamond</p>
                  <p className="text-xs text-slate-500">{t("admin.settings.branding.typography.serifDesc")}</p>
                </div>
                <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-2xl border-[#D4AF37]/40 bg-[#D4AF37]/5 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">{t("admin.settings.branding.typography.sans")}</p>
                    <Check className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-3xl font-sans text-slate-900 dark:text-slate-100 mb-2">Inter / Outfit</p>
                  <p className="text-xs text-slate-500">{t("admin.settings.branding.typography.sansDesc")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Bell className="h-6 w-6 text-[#D4AF37]" />
                {t("admin.settings.notifications.title")}
              </h2>
              <div className="space-y-4">
                {[
                  { title: t("admin.settings.notifications.items.orders.title"), desc: t("admin.settings.notifications.items.orders.desc"), active: true },
                  { title: t("admin.settings.notifications.items.vip.title"), desc: t("admin.settings.notifications.items.vip.desc"), active: true },
                  { title: t("admin.settings.notifications.items.inventory.title"), desc: t("admin.settings.notifications.items.inventory.desc"), active: false },
                  { title: t("admin.settings.notifications.items.reviews.title"), desc: t("admin.settings.notifications.items.reviews.desc"), active: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 border border-slate-50 dark:border-slate-900 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500 font-light">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.active} className="data-[state=checked]:bg-[#D4AF37]" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="h-[500px] border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-slate-50/30 dark:bg-white/5"
          >
            <div className="h-16 w-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
               <Globe className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-light text-slate-900 dark:text-slate-100 mb-2">{t("admin.settings.expansion.title")}</h3>
            <p className="text-sm text-slate-500 font-light max-w-sm mb-6">
              {t("admin.settings.expansion.desc", { tab: activeTab })}
            </p>
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 border-2">
              {t("admin.settings.expansion.request")}
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
       {/* Page Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.settings.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-light">
            {t("admin.settings.description")}
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-slate-900 dark:bg-[#D4AF37] text-white hover:opacity-90 px-10 py-7 rounded-2xl text-lg font-light transition-all shadow-xl shadow-slate-900/10 dark:shadow-[#D4AF37]/5"
        >
          {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Save className="h-5 w-5 mr-3" />}
          {t("admin.settings.updateChanges")}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group border border-transparent",
                  isActive 
                    ? "bg-white dark:bg-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none border-slate-100 dark:border-white/10" 
                    : "hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-[#D4AF37] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-bold text-xs uppercase tracking-widest",
                    isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-light truncate">
                    {item.desc}
                  </p>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
                  </motion.div>
                )}
              </button>
            );
          })}
          
          <div className="mt-10 p-6 bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-3xl">
             <div className="flex items-center gap-3 mb-3">
                <Shield className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{t("admin.settings.advisory.title")}</span>
             </div>
             <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-light mb-4">
                {t("admin.settings.advisory.desc")}
             </p>
             <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline">
               {t("admin.settings.advisory.readPolicies")} <ExternalLink className="h-3 w-3" />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
