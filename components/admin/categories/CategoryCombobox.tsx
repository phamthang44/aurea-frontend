'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Search, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CategoryResponse } from '@/lib/types/product';
import { categoryApi } from '@/lib/api/category';

interface CategoryComboboxProps {
  categories: CategoryResponse[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function CategoryCombobox({
  categories,
  value,
  onValueChange,
  excludeIds = [],
  placeholder,
  disabled = false,
}: CategoryComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten categories for searching
  const flatCategories = useMemo(() => {
    return categoryApi.flattenCategories(categories).filter(
      (c) => !excludeIds.includes(c.id)
    );
  }, [categories, excludeIds]);

  // Filter by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return flatCategories;
    const lowerQuery = searchQuery.toLowerCase();
    return flatCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.slug.toLowerCase().includes(lowerQuery)
    );
  }, [flatCategories, searchQuery]);

  // Find selected category name
  const selectedCategory = useMemo(() => {
    if (!value) return null;
    return flatCategories.find((c) => c.id === value);
  }, [flatCategories, value]);

  const handleSelect = (categoryId: string | null) => {
    onValueChange(categoryId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between rounded-2xl border-slate-200 dark:border-slate-800',
            'bg-slate-50/50 dark:bg-white/5 py-6 px-4 font-normal',
            !selectedCategory && 'text-muted-foreground'
          )}
        >
          <span className="truncate">
            {selectedCategory
              ? `${'\u00A0'.repeat(selectedCategory.level * 2)}${selectedCategory.name}`
              : placeholder || t('admin.categories.form.root')}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A]"
        align="start"
      >
        <div className="p-3 border-b border-slate-100 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('admin.categories.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5"
            />
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {/* Root option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer group hover:translate-x-1 active:scale-95',
                value === null 
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium hover:bg-[#D4AF37]/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                value === null ? "bg-[#D4AF37]/20" : "bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10"
              )}>
                <FolderTree className="h-4 w-4 shrink-0" />
              </div>
              <span className="flex-1">{t('admin.categories.form.root')}</span>
              {value === null && <Check className="h-4 w-4 shrink-0" />}
            </button>

            {/* Category list */}
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2 text-slate-400">
                <Search className="h-8 w-8 opacity-20" />
                <span className="text-xs">{t('admin.categories.noCategoriesFound')}</span>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = value === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer group hover:translate-x-1 active:scale-95',
                      isSelected
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium hover:bg-[#D4AF37]/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    )}
                    style={{ paddingLeft: `${(category.level * 16) + 12}px` }}
                  >
                    <div className="relative flex items-center">
                      {category.level > 0 && (
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-slate-200 dark:bg-white/10" />
                      )}
                      <span className="flex-1 truncate">{category.name}</span>
                    </div>
                    
                    {category.slug && (
                      <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[80px] ml-auto mr-2">
                         {category.slug}
                      </span>
                    )}
                    
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[#D4AF37]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

