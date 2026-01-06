// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import viTranslations from "./locales/vi.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  vi: {
    translation: viTranslations,
  },
};

// Chỉ khởi tạo nếu chưa được khởi tạo
if (!i18n.isInitialized) {
  // Always use a consistent default language for SSR hydration
  // We'll update it from localStorage after mount to avoid hydration mismatches
  const defaultLanguage = "vi";

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage, // Always start with consistent default for SSR
      fallbackLng: "en", // Ngôn ngữ dự phòng
      interpolation: {
        escapeValue: false, // React đã tự động escape
      },
      react: {
        useSuspense: false, // Tắt Suspense để tránh lỗi trong Next.js
      },
    });
  
  // Note: Language restoration from localStorage is handled in LangUpdater component
  // after mount to prevent hydration mismatches
}

export default i18n;