'use client';

import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { AdminErrorDisplay } from "@/components/admin/AdminErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  href: string;
}

// Stats will be translated in component
const getStats = (t: any): StatCard[] => [
  {
    label: t("admin.dashboard.totalProducts"),
    value: "248",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "bg-blue-500",
    href: "/admin/products",
  },
  {
    label: t("admin.dashboard.totalUsers"),
    value: "1,234",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "bg-green-500",
    href: "/admin/users",
  },
  {
    label: t("admin.dashboard.totalOrders"),
    value: "567",
    change: "-3%",
    trend: "down",
    icon: ShoppingCart,
    color: "bg-purple-500",
    href: "/admin/orders",
  },
  {
    label: t("admin.dashboard.revenue"),
    value: "$45,678",
    change: "+15%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-[#D4AF37]",
    href: "/admin/revenue",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "order",
    message: "New order #12345 received",
    time: "5 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "product",
    message: "Product 'Luxury Handbag' updated",
    time: "1 hour ago",
    status: "info",
  },
  {
    id: 3,
    type: "user",
    message: "New user registration",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: 4,
    type: "alert",
    message: "Low stock alert: 'Designer Watch'",
    time: "3 hours ago",
    status: "warning",
  },
  {
    id: 5,
    type: "order",
    message: "Order #12340 cancelled",
    time: "5 hours ago",
    status: "error",
  },
];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [activeAlerts, setActiveAlerts] = useState([
    {
       id: 'api-sync-01',
       title: 'Curation Pipeline Throttled',
       description: 'The automated product curation engine is processing at 40% capacity due to high volume.',
       items: [
         { label: 'Latency', message: 'Current curation delay is ~45 minutes' },
         { label: 'Affected Service', message: 'Bulk Media Optimization' }
       ],
       variant: 'warning' as const
    },
    {
       id: 'stock-error-01',
       title: 'Inventory Synchronization Conflict',
       description: 'Discrepancies detected between the boutique POS and online inventory records.',
       items: [
         { label: 'SKU: AUR-772', message: 'Conflicting stock levels (Store: 14, Web: 12)' },
         { label: 'Action Taken', message: 'Boutique stock prioritized for preservation' }
       ],
       variant: 'error' as const
    }
  ]);

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.dashboard.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-lg">
            Welcome back, Administrator. Here is your boutique's operational overview.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Systems Operational</span>
        </div>
      </div>

      {/* Operational Alerts - New Section */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                 Operational Integrity
               </h2>
               <button 
                onClick={() => setActiveAlerts([])}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
               >
                 Acknowledge All
               </button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeAlerts.map(alert => (
                  <AdminErrorDisplay
                    key={alert.id}
                    title={alert.title}
                    variant={alert.variant}
                    description={alert.description}
                    items={alert.items}
                    onClose={() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    onRetry={() => console.log('Retrying sync...')}
                    className="shadow-xl shadow-slate-200/50 dark:shadow-none"
                  />
                ))}
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats(t).map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group block no-underline"
            >
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:border-[#D4AF37]/50 relative overflow-hidden">
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-slate-200/50 dark:shadow-none",
                    stat.color
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm",
                    stat.trend === 'up'
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600"
                  )}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-light text-slate-900 dark:text-slate-100 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-light tracking-wide text-foreground">
            {t("admin.dashboard.recentActivity")}
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-6 hover:bg-secondary/50 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-foreground mb-1">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    activity.status === 'success' && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                    activity.status === 'info' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                    activity.status === 'warning' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
                    activity.status === 'error' && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  )}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="group bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-600/30 no-underline"
        >
          <Package className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("admin.dashboard.manageProducts")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.dashboard.manageProductsDesc")}
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-600/30 no-underline"
        >
          <Users className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("admin.dashboard.userManagement")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.dashboard.userManagementDesc")}
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="group bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-600/30 no-underline"
        >
          <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("admin.dashboard.settings")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.dashboard.settingsDesc")}
          </p>
        </Link>
      </div>
    </div>
  );
}

