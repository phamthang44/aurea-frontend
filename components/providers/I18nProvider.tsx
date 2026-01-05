"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import "@/i18n"; // Import để khởi tạo i18n
import i18n from "@/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on("initialized", () => {
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <>{children}</>; // Render children even if i18n not ready yet
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

