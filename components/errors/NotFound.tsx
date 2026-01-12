'use client';

import Link from "next/link";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide mb-3">
          {t("errorPages.notFound.title", {
            defaultValue: "Page Not Found",
          })}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          {t("errorPages.notFound.description", {
            defaultValue:
              "The page you're looking for doesn't exist or may have been moved.",
          })}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#D4AF37] text-white hover:bg-[#c29b2f] transition-colors no-underline"
          >
            {t("errorPages.notFound.backToHome", {
              defaultValue: "Back to Home",
            })}
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors no-underline"
          >
            {t("errorPages.notFound.browseCollection", {
              defaultValue: "Browse Collection",
            })}
          </Link>
        </div>
      </div>
    </div>
  );
}




