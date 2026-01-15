"use client";

import { InventoryTable } from "@/components/admin/inventory/InventoryTable";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t("admin.inventory.title", "Inventory Management")}</h2>
          <p className="text-slate-500 dark:text-slate-400">
            {t("admin.inventory.subtitle", "Manage stock levels, imports, and adjustments across all products.")}
          </p>
        </div>
      </div>
      
      <InventoryTable />
    </div>
  );
}
