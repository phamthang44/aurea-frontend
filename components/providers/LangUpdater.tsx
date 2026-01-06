"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LangUpdater() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Restore language from localStorage after mount (prevents hydration mismatch)
    // This ensures server and client render with the same initial language
    const savedLanguage = localStorage.getItem("i18nextLng");
    if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
      if (i18n.language !== savedLanguage) {
        // Change language silently (without triggering re-renders during hydration)
        i18n.changeLanguage(savedLanguage);
      }
    }

    // Update HTML lang attribute when language changes
    const updateLang = () => {
      if (typeof document !== "undefined") {
        const htmlElement = document.documentElement;
        const currentLang = i18n.language || "vi";
        htmlElement.setAttribute("lang", currentLang);
      }
    };

    // Set initial lang
    updateLang();

    // Listen for language changes
    i18n.on("languageChanged", updateLang);

    // Cleanup
    return () => {
      i18n.off("languageChanged", updateLang);
    };
  }, [i18n]);

  return null; // This component doesn't render anything
}

