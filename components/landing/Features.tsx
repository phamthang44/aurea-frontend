"use client";

import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Gem,
  Globe,
  Headphones,
  Undo2,
  Leaf
} from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  {
    icon: Gem,
    key: "quality",
  },
  {
    icon: ShieldCheck,
    key: "secure",
  },
  {
    icon: Truck,
    key: "shipping",
  },
  {
    icon: Undo2,
    key: "returns",
  },
  {
    icon: Leaf,
    key: "sustainable",
  },
  {
    icon: ShoppingBag,
    key: "designs",
  },
  {
    icon: Globe,
    key: "international",
  },
  {
    icon: Headphones,
    key: "support",
  },
];

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FDFCF8] dark:bg-[#161616]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4 text-[10px] sm:text-xs font-light tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10">
            {t("landing.features.badge", { defaultValue: "Why Choose Aurea" })}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5] mb-4 sm:mb-6">
            {t("landing.features.title", { defaultValue: "The Aurea Difference" })}
          </h2>
          <p className="max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base lg:text-lg font-light text-[#666666] dark:text-[#A0A0A0] px-2">
            {t("landing.features.subtitle", { defaultValue: "Experience luxury shopping redefined with our commitment to quality and service." })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 hover:border-[#D4AF37]/40 dark:hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 dark:hover:bg-[#D4AF37]/5 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/20 dark:border-[#D4AF37]/25 flex items-center justify-center group-hover:bg-[#D4AF37]/20 dark:group-hover:bg-[#D4AF37]/25 transition-colors duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
                </div>
                
                <h3 className="text-base sm:text-lg font-light tracking-wide text-[#1A1A1A] dark:text-[#F5F5F5] mb-1.5 sm:mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {t(`landing.features.items.${feature.key}.title`)}
                </h3>
                <p className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#A0A0A0] leading-relaxed">
                  {t(`landing.features.items.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
