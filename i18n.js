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
  // Lấy ngôn ngữ từ localStorage nếu có (chỉ chạy trên client)
  let defaultLanguage = "vi";
  if (typeof window !== "undefined") {
    const savedLanguage = localStorage.getItem("i18nextLng");
    if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
      defaultLanguage = savedLanguage;
    }
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage, // Ngôn ngữ mặc định hoặc từ localStorage
      fallbackLng: "en", // Ngôn ngữ dự phòng
      interpolation: {
        escapeValue: false, // React đã tự động escape
      },
      react: {
        useSuspense: false, // Tắt Suspense để tránh lỗi trong Next.js
      },
    });
}

export default i18n;