'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useStore } from '@/lib/context/StoreContext';

export function StorefrontFooter() {
  const { t } = useTranslation();
  const { store } = useStore();

  const footerLinks = {
    shop: [
      { labelKey: 'demo.footer.links.newArrivals', href: `/shop?sort=newest` },
      { labelKey: 'demo.footer.links.women', href: `/shop?categorySlug=women` },
      { labelKey: 'demo.footer.links.men', href: `/shop?categorySlug=men` },
      { labelKey: 'demo.footer.links.accessories', href: `/shop` },
      { labelKey: 'demo.footer.links.sale', href: `/shop` },
    ],
    help: [
      { labelKey: 'demo.footer.links.contact', href: `/about` },
      { labelKey: 'demo.footer.links.faq', href: `/about` },
      { labelKey: 'demo.footer.links.shipping', href: `/about` },
      { labelKey: 'demo.footer.links.returns', href: `/about` },
      { labelKey: 'demo.footer.links.sizeGuide', href: `/about` },
    ],
    about: [
      { labelKey: 'demo.footer.links.ourStory', href: `/about` },
      { labelKey: 'demo.footer.links.sustainability', href: `/about` },
      { labelKey: 'demo.footer.links.careers', href: `/about` },
      { labelKey: 'demo.footer.links.press', href: `/about` },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-lg sm:text-xl font-light tracking-wide">
                {t('demo.footer.newsletter.title', { defaultValue: 'Join Our Community' })}
              </h3>
              <p className="mt-2 text-sm font-light text-white/60">
                {t('demo.footer.newsletter.subtitle', { defaultValue: 'Subscribe for exclusive access to new arrivals and special offers.' })}
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Input
                type="email"
                placeholder={t('demo.footer.newsletter.placeholder', { defaultValue: 'Enter your email' })}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4AF37]"
              />
              <Button
                type="submit"
                className="bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#E5C96B] font-light tracking-wider uppercase text-sm"
                style={{ backgroundColor: store.theme?.primaryColor || '#D4AF37' }}
              >
                {t('demo.footer.newsletter.subscribe', { defaultValue: 'Subscribe' })}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-6 lg:mb-0">
            <Link 
              href={`/shop`} 
              className="inline-block text-2xl font-light tracking-[0.3em] hover:opacity-80 transition-opacity duration-300 no-underline"
              style={{ color: store.theme?.primaryColor || '#D4AF37' }}
            >
              {store.name}
            </Link>
            <p className="mt-4 text-sm font-light text-white/60 leading-relaxed max-w-xs">
              {t('demo.footer.description', { defaultValue: 'Timeless elegance meets modern luxury. Crafted for those who appreciate the finer things.' })}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 mb-4">
              {t('demo.footer.sections.shop', { defaultValue: 'Shop' })}
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/60 hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 mb-4">
              {t('demo.footer.sections.help', { defaultValue: 'Help' })}
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/60 hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 mb-4">
              {t('demo.footer.sections.about', { defaultValue: 'About' })}
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/60 hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 mb-4">
              {t('demo.footer.sections.contact', { defaultValue: 'Contact' })}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-sm font-light text-white/60">
                  123 Luxury Avenue<br />District 1, HCMC
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="text-sm font-light text-white/60">+84 0965 957 245</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="text-sm font-light text-white/60">aurea@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-xs font-light text-white/40">
              Â© {new Date().getFullYear()} AUREA. {t('demo.footer.rights', { defaultValue: 'All rights reserved.' })}
            </p>
            <p className="text-xs font-light text-white/40">
              {t('demo.footer.tagline', { defaultValue: 'Luxury Fashion & Lifestyle' })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}


