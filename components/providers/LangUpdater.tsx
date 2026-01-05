"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LangUpdater() {
  const { i18n } = useTranslation();

  useEffect(() => {
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

