'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className="relative">
      <div className="flex items-center gap-8">
        {items.map((item) => {
          const isActive = activePath === item.href;
          const isHovered = hoveredItem === item.label;
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1 px-3 py-2 text-sm font-light tracking-wide transition-colors duration-300 no-underline',
                  isActive || isHovered
                    ? 'text-[var(--accent-bright,#D4AF37)]'
                    : 'text-[var(--muted-foreground,#B8A072)] hover:text-[var(--accent-bright,#D4AF37)]'
                )}
              >
                {item.label}
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform duration-300',
                      isHovered && 'rotate-180'
                    )}
                  />
                )}

                {/* Floating Pill Background - Sliding Highlight */}
                {(isActive || isHovered) && (
                  <motion.div
                    layoutId="floating-pill"
                    className="absolute inset-0 rounded-md bg-[var(--accent-bright,#D4AF37)]/10 -z-10"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>

              {/* Mega Menu Dropdown */}
              {hasChildren && (
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-[600px] bg-[var(--card,#3D3D3D)]/95 backdrop-blur-xl border border-[var(--border,#3D3D3D)] rounded-lg shadow-2xl p-8 z-50"
                      onMouseEnter={() => setHoveredItem(item.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="grid grid-cols-3 gap-8">
                        {item.children?.map((column, colIndex) => (
                          <div key={colIndex} className="space-y-4">
                            <h3 className="text-xs font-medium tracking-wider uppercase text-[var(--muted-foreground,#B8A072)] mb-3">
                              {column.title}
                            </h3>
                            <ul className="space-y-3">
                              {column.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    className="text-sm font-light text-[var(--foreground,#F5F5F5)] hover:text-[var(--accent-bright,#D4AF37)] transition-colors duration-300 no-underline"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

