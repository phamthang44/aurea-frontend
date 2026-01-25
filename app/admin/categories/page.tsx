'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryTree from '@/components/admin/categories/CategoryTree';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Page Header */}
      <div className="pt-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
             <LayoutGrid className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
             <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 italic">
               {t('admin.categories.title')}
             </h1>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-light leading-relaxed">
          {t('admin.categories.description')}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm"
      >
        <CategoryTree />
      </motion.div>

      {/* Usage Policies / Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { title: t('admin.categories.policies.integrity.title'), desc: t('admin.categories.policies.integrity.desc') },
           { title: t('admin.categories.policies.leaf.title'), desc: t('admin.categories.policies.leaf.desc') },
           { title: t('admin.categories.policies.root.title'), desc: t('admin.categories.policies.root.desc') }
         ].map((pol, idx) => (
           <div key={idx} className="p-6 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">{pol.title}</h3>
              <p className="text-[11px] text-slate-500 font-light leading-relaxed">{pol.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
