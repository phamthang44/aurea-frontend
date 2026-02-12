'use client';

import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Edit2, 
  Trash2, 
  Move,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Package
} from 'lucide-react';
import { categoryApi } from '@/lib/api/category';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CategoryResponse } from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface CategoryNodeProps {
  category: CategoryResponse;
  level: number;
  onAddChild: (parent: CategoryResponse) => void;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
  onMove: (category: CategoryResponse) => void;
  onToggleStatus: (category: CategoryResponse) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string | Set<string>) => void;
  
  // Reorder props
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRefresh?: () => void;
}

export function CategoryNode({
  category,
  level,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
  onToggleStatus,
  expandedNodes,
  onToggleExpand,

  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRefresh
}: CategoryNodeProps) {
  const { t } = useTranslation();

  const handleReorderChildren = async (childIndex: number, direction: number) => {
    try {
      if (!category.children) return;
      
      const items = [...category.children];
      const targetIndex = childIndex + direction;
      
      if (targetIndex < 0 || targetIndex >= items.length) return;
      
      const temp = items[childIndex];
      items[childIndex] = items[targetIndex];
      items[targetIndex] = temp;
      
      const payload = items.map((item, idx) => ({
        id: item.id,
        position: idx
      }));
      
      const result = await categoryApi.reorderCategories(payload);
      
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      
      toast.success(t('common.success'));
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };
  const hasChildren = category.children && category.children.length > 0;
  const isLeaf = !hasChildren;
  const isExpanded = expandedNodes.has(category.id);

  return (
    <div className="group">
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 border border-transparent",
          "hover:bg-white dark:hover:bg-white/5 hover:border-slate-100 dark:hover:border-white/10 hover:shadow-sm",
          !category.isActive && "opacity-60"
        )}
        style={{ paddingLeft: `${(level * 24) + 12}px` }}
      >
        {/* Expand/Collapse Toggle */}
        <div className="w-6 h-6 flex items-center justify-center">
          {hasChildren ? (
            <button 
              onClick={() => onToggleExpand(category.id)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 ml-1.5" />
          )}
        </div>

        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          category.isActive 
            ? "bg-slate-50 dark:bg-white/5 text-[#D4AF37]" 
            : "bg-slate-100 dark:bg-white/5 text-slate-400"
        )}>
          {hasChildren ? <Folder className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium truncate",
                category.isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
              )}>
                {category.name}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-slate-200 dark:border-slate-800 text-slate-400">
                {category.slug}
              </Badge>
              {!category.isActive && (
                <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 uppercase tracking-tighter">
                  {t("admin.categories.status.inactive")}
                </Badge>
              )}
              {isLeaf && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-100/50 dark:border-amber-900/30">
                  <Package className="h-2.5 w-2.5" />
                  {t("admin.categories.leaf")}
                </div>
              )}
            </div>
            {category.description && (
              <p className="text-[11px] text-slate-400 font-light truncate max-w-md">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
             {/* Stats */}
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {category.productCount || 0}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-light">
                  {t("admin.categories.products")}
                </span>
             </div>

             {/* Actions */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl p-2 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md space-y-1">
                  <DropdownMenuItem onClick={() => onAddChild(category)} className="rounded-xl gap-2 cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] transition-all duration-200 font-medium">
                    <Plus className="h-4 w-4" />
                    <span>{t("admin.categories.addChild")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                  <DropdownMenuItem onClick={() => onEdit(category)} className="rounded-xl gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/10 transition-all duration-200 group">
                    <Edit2 className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" />
                    <span>{t("admin.categories.edit")}</span>
                  </DropdownMenuItem>
                  
                  {/* Reorder Actions */}
                  {(onMoveUp || onMoveDown) && (
                     <>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} 
                          disabled={isFirst}
                          className="rounded-xl gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/10 transition-all duration-200 group disabled:opacity-50"
                        >
                          <ArrowUp className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" />
                          <span>{t("admin.categories.moveUp")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                          disabled={isLast} 
                          className="rounded-xl gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/10 transition-all duration-200 group disabled:opacity-50"
                        >
                          <ArrowDown className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" />
                          <span>{t("admin.categories.moveDown")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                     </>
                  )}

                  <DropdownMenuItem onClick={() => onMove(category)} className="rounded-xl gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/10 transition-all duration-200 group">
                    <Move className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" />
                    <span>{t("admin.categories.move")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(category)} className="rounded-xl gap-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/10 transition-all duration-200 group">
                    {category.isActive 
                      ? <EyeOff className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" /> 
                      : <Eye className="h-4 w-4 text-slate-400 group-focus:text-slate-700 dark:group-focus:text-slate-200 transition-colors" />
                    }
                    <span>{category.isActive ? t("admin.categories.deactivate") : t("admin.categories.activate")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                  <DropdownMenuItem 
                    onClick={() => onDelete(category)}
                    className="rounded-xl gap-2 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t("admin.categories.delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {category.children.map((child, index) => (
              <CategoryNode
                key={child.id}
                category={child}
                level={level + 1}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                onToggleStatus={onToggleStatus}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                // Recursive props
                isFirst={index === 0}
                isLast={index === (category.children?.length || 0) - 1}
                onMoveUp={() => handleReorderChildren(index, -1)}
                onMoveDown={() => handleReorderChildren(index, 1)}
                onRefresh={onRefresh}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
