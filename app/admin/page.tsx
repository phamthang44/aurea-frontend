'use client';

import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { AdminErrorDisplay } from "@/components/admin/AdminErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  href: string;
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  const stats: StatCard[] = useMemo(() => [
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
  ], [t]);

  const recentActivities = useMemo(() => [
    {
      id: 1,
      type: "order",
      message: t("admin.dashboard.recentActivities.newOrder", { id: "12345" }),
      time: "5 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "product",
      message: t("admin.dashboard.recentActivities.productUpdated", { name: "Luxury Handbag" }),
      time: "1 hour ago",
      status: "info",
    },
    {
      id: 3,
      type: "user",
      message: t("admin.dashboard.recentActivities.newUser"),
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 4,
      type: "alert",
      message: t("admin.dashboard.recentActivities.lowStock", { name: "Designer Watch" }),
      time: "3 hours ago",
      status: "warning",
    },
    {
      id: 5,
      type: "order",
      message: t("admin.dashboard.recentActivities.orderCancelled", { id: "12340" }),
      time: "5 hours ago",
      status: "error",
    },
  ], [t]);

  const [activeAlerts, setActiveAlerts] = useState([
    {
       id: 'api-sync-01',
       title: t("admin.dashboard.operationalAlerts.curationThrottled"),
       description: t("admin.dashboard.operationalAlerts.curationThrottledDesc"),
       items: [
         { label: t("admin.dashboard.operationalAlerts.latency"), message: t("admin.dashboard.operationalAlerts.latencyMsg") },
         { label: t("admin.dashboard.operationalAlerts.affectedService"), message: t("admin.dashboard.operationalAlerts.affectedServiceMsg") }
       ],
       variant: 'warning' as const
    },
    {
       id: 'stock-error-01',
       title: t("admin.dashboard.operationalAlerts.inventoryConflict"),
       description: t("admin.dashboard.operationalAlerts.inventoryConflictDesc"),
       items: [
         { label: 'SKU: AUR-772', message: t("admin.dashboard.operationalAlerts.stockLevels") },
         { label: t("admin.dashboard.operationalAlerts.actionTaken"), message: t("admin.dashboard.operationalAlerts.actionTakenMsg") }
       ],
       variant: 'error' as const
    }
  ]);

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 mb-2 italic">
            {t("admin.dashboard.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-lg">
            {t("admin.dashboard.welcome", { name: "Administrator" })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
             {t("admin.dashboard.systemsOperational")}
           </span>
        </div>
      </div>

      {/* Operational Alerts */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                 {t("admin.dashboard.operationalIntegrity")}
               </h2>
               <button 
                onClick={() => setActiveAlerts([])}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
               >
                 {t("admin.dashboard.acknowledgeAll")}
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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group block no-underline"
            >
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:border-[#D4AF37]/50 relative overflow-hidden">
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
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-xl font-light tracking-wide text-slate-900 dark:text-slate-100">
            {t("admin.dashboard.recentActivity")}
          </h2>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-900 dark:text-slate-100 mb-1">
                    {activity.message}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {activity.time}
                  </p>
                </div>
                <div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    activity.status === 'success' && "bg-green-50 dark:bg-green-900/20 text-green-600",
                    activity.status === 'info' && "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
                    activity.status === 'warning' && "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
                    activity.status === 'error' && "bg-red-50 dark:bg-red-900/20 text-red-600"
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
          className="group bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-500 hover:border-[#D4AF37]/50 no-underline"
        >
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-light text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.dashboard.manageProducts")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            {t("admin.dashboard.manageProductsDesc")}
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-500 hover:border-[#D4AF37]/50 no-underline"
        >
          <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-light text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.dashboard.userManagement")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            {t("admin.dashboard.userManagementDesc")}
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="group bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-500 hover:border-[#D4AF37]/50 no-underline"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-light text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.dashboard.settings")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            {t("admin.dashboard.settingsDesc")}
          </p>
        </Link>
      </div>
    </div>
  );
}
