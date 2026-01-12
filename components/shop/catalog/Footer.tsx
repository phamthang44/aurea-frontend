"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { labelKey: "footer.links.product.features", href: "/#features" },
    { labelKey: "navbar.shop", href: "/shop" },
  ],
  company: [
    { labelKey: "footer.links.company.about", href: "/about" },
    { labelKey: "footer.links.company.contact", href: "/contact" },
  ],
  resources: [
    { labelKey: "footer.links.resources.helpCenter", href: "/help" },
    { labelKey: "footer.links.resources.community", href: "/community" },
  ],
  legal: [
    { labelKey: "footer.links.legal.privacy", href: "/privacy" },
    { labelKey: "footer.links.legal.terms", href: "/terms" },
    { labelKey: "footer.links.legal.cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@aurea.com", label: "Email" },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[#E8E4DD] dark:border-[#2A2A2A] bg-[#F8F5F0] dark:bg-[#0D0D0D]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link
              href="/"
              className="inline-block text-xl sm:text-2xl font-light tracking-wider text-[#D4AF37] hover:text-[#C19B2B] transition-colors duration-300 no-underline"
            >
              AUREA
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888] leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D4AF37]/20 dark:border-[#D4AF37]/15 flex items-center justify-center text-[#8B7355] dark:text-[#888888] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 dark:hover:bg-[#D4AF37]/10 transition-all duration-300 no-underline"
                    aria-label={social.label}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F5F5] mb-3 sm:mb-4">
              {t("footer.sections.product")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F5F5] mb-3 sm:mb-4">
              {t("footer.sections.company")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F5F5] mb-3 sm:mb-4">
              {t("footer.sections.resources")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium tracking-wide text-[#1A1A1A] dark:text-[#F5F5F5] mb-3 sm:mb-4">
              {t("footer.sections.legal")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888]">
              {t("footer.copyright", {
                year: new Date().getFullYear(),
                brand: "AUREA",
              })}
            </p>
            <p className="text-xs sm:text-sm font-light text-[#666666] dark:text-[#888888]">
              {t("footer.madeWith")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}


