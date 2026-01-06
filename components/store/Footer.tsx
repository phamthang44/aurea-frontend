"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border py-12 px-6 sm:px-8 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm font-light tracking-wide text-muted-foreground">
            {t("footer.copyright", {
              year: new Date().getFullYear(),
              brand: "AUREA",
            })}
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-sm font-light tracking-wide text-muted-foreground hover:text-[#D4AF37] transition-all duration-300 ease-out no-underline"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm font-light tracking-wide text-muted-foreground hover:text-[#D4AF37] transition-all duration-300 ease-out no-underline"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/contact"
              className="text-sm font-light tracking-wide text-muted-foreground hover:text-[#D4AF37] transition-all duration-300 ease-out no-underline"
            >
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
