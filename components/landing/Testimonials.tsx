"use client";

import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      index: 0,
      author: "Isabella Ross",
      location: "New York, USA",
      avatar: "IR",
    },
    {
      index: 1,
      author: "Marcus Chen",
      location: "Singapore",
      avatar: "MC",
    },
    {
      index: 2,
      author: "Sophia Laurent",
      location: "Paris, France",
      avatar: "SL",
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FDFCF8] dark:bg-[#161616]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4 text-[10px] sm:text-xs font-light tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10">
            {t("landing.testimonials.badge", { defaultValue: "Reviews" })}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5] mb-4 sm:mb-6">
            {t("landing.testimonials.title", { defaultValue: "What Our Customers Say" })}
          </h2>
          <p className="max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base lg:text-lg font-light text-[#666666] dark:text-[#A0A0A0] px-2">
            {t("landing.testimonials.subtitle", { defaultValue: "Stories from our valued community." })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.index}
              className="relative p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 hover:border-[#D4AF37]/40 dark:hover:border-[#D4AF37]/30 transition-all duration-300"
            >
              <div className="absolute -top-3 sm:-top-4 left-6 sm:left-8">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                  <Quote className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>

              <blockquote className="text-sm sm:text-base font-light leading-relaxed text-[#1A1A1A] dark:text-[#E5E5E5] mb-5 sm:mb-6 pt-3 sm:pt-4">
                &ldquo;{t(`landing.testimonials.items.${testimonial.index}.quote`)}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/20 dark:border-[#D4AF37]/25 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-[#D4AF37]">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">
                    {testimonial.author}
                  </div>
                  <div className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#A0A0A0]">
                    {t(`landing.testimonials.items.${testimonial.index}.role`)}, {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
