'use client';

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center border border-red-100 dark:border-red-900/60">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide mb-3">
          {t("errorPages.forbidden.title", { defaultValue: "Access Denied" })}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          {t("errorPages.forbidden.description", {
            defaultValue:
              "You don't have permission to view this page. If you believe this is a mistake, please contact an administrator.",
          })}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors no-underline"
          >
            {t("errorPages.forbidden.backToHome", {
              defaultValue: "Back to Home",
            })}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#D4AF37] text-white hover:bg-[#c29b2f] transition-colors no-underline"
          >
            {t("errorPages.forbidden.switchAccount", {
              defaultValue: "Switch Account",
            })}
          </Link>
        </div>
      </div>
    </div>
  );
}


