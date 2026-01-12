'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  label: string;
  href: string;
  children?: {
    title: string;
    links: { label: string; href: string }[];
  }[];
}

interface MegaMenuProps {
  items: MenuItem[];
  activePath?: string;
}

export function MegaMenu({ items, activePath }: MegaMenuProps) {
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className="relative flex items-center">
      <ul className="flex items-center gap-1 md:gap-4 lg:gap-8 m-0 p-0 list-none">
        {items.map((item) => {
          const isActive = activePath === item.href;
          const isHovered = hoveredItem === item.label;
          const hasChildren = item.children && item.children.length > 0;

          return (
            <li
              key={item.label}
              className="relative py-2"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-2 text-[11px] md:text-xs font-light tracking-[0.25em] transition-all duration-300 no-underline uppercase',
                  isActive 
                    ? 'text-[#D4AF37]' 
                    : isHovered 
                      ? 'text-[#D4AF37]' 
                      : 'text-[#1A1A1A] dark:text-[#F5F5F3] hover:text-[#D4AF37]'
                )}
              >
                {t(item.label)}
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 opacity-60 transition-transform duration-500',
                      isHovered && 'rotate-180 opacity-100 text-[#D4AF37]'
                    )}
                  />
                )}

                {/* Animated Dash Underline */}
                <span className={cn(
                  "absolute bottom-0 left-4 right-4 h-px bg-[#D4AF37] transform origin-right transition-transform duration-500",
                  (isActive || isHovered) ? "scale-x-100 origin-left" : "scale-x-0"
                )} />
              </Link>

              {/* Enhanced Mega Menu Dropdown */}
              <AnimatePresence>
                {hasChildren && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for a luxury feel
                    }}
                    className="absolute top-full left-0 pt-4 z-[100]"
                  >
                    <div className="w-[640px] bg-white/98 dark:bg-[#161616]/98 backdrop-blur-3xl border border-[#D4AF37]/20 dark:border-white/5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] p-10 flex overflow-hidden">
                      {/* Side Decoration/Highlight Section */}
                      <div className="hidden sm:block w-1/3 pr-10 border-r border-[#D4AF37]/10">
                        <p className="text-[10px] text-[#B8A072] font-semibold tracking-widest uppercase mb-4">{t('megaMenu.featured.badge')}</p>
                        <h4 className="text-xl font-light text-[#1A1A1A] dark:text-[#F5F5F3] leading-tight mb-4">{t('megaMenu.featured.title')}</h4>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed mb-6">{t('megaMenu.featured.description')}</p>
                        <Link href={item.href} className="text-[10px] text-[#D4AF37] font-bold tracking-[0.2em] uppercase hover:underline">
                          {t('megaMenu.featured.cta')}
                        </Link>
                      </div>

                      {/* Links Grid */}
                      <div className="flex-1 pl-10 grid grid-cols-2 gap-x-12 gap-y-10">
                        {item.children?.map((column, colIndex) => (
                          <div key={colIndex} className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]">
                              {t(column.title)}
                            </h3>
                            <ul className="space-y-4 m-0 p-0 list-none">
                              {column.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    className="text-sm font-light text-zinc-500 hover:text-[#D4AF37] dark:text-zinc-400 dark:hover:text-[#F5F5F3] transition-all duration-300 no-underline block hover:translate-x-1"
                                  >
                                    {t(link.label)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
