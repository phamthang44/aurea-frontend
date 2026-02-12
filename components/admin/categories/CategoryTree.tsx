'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryNode } from './CategoryNode';
import { CategoryDialog } from './CategoryDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CategoryResponse } from '@/lib/types/product';
import { categoryApi } from '@/lib/api/category';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CategoryApiResponse {
  data?: CategoryResponse[];
}

export default function CategoryTree() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  
  // Delete States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await categoryApi.getAllCategories();
      const rawData = result.data as CategoryResponse[] | CategoryApiResponse;
      if (rawData) {
        // Handle both direct array or wrapped data: { data: [...] }
        const dataArray = Array.isArray(rawData) ? rawData : ((rawData as CategoryApiResponse).data || []);
        setCategories(dataArray);
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (idOrSet: string | Set<string>) => {
    if (idOrSet instanceof Set) {
      setExpandedNodes(idOrSet);
      return;
    }
    const next = new Set(expandedNodes);
    if (next.has(idOrSet)) {
      next.delete(idOrSet);
    } else {
      next.add(idOrSet);
    }
    setExpandedNodes(next);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (cats: CategoryResponse[]) => {
      cats.forEach(c => {
        if (c.children && c.children.length > 0) {
          allIds.add(c.id);
          collectIds(c.children);
        }
      });
    };
    collectIds(categories);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => setExpandedNodes(new Set());

  const handleAddRoot = () => {
    setSelectedCategory(null);
    setDefaultParentId(null);
    setIsDialogOpen(true);
  };

  const handleAddChild = (parent: CategoryResponse) => {
    if (parent.productCount && parent.productCount > 0) {
      toast.error(t('admin.categories.form.validation.leafProductWarn'));
      return;
    }
    setSelectedCategory(null);
    setDefaultParentId(parent.id);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (category: CategoryResponse) => {
    if (category.children && category.children.length > 0) {
      toast.error(t('admin.categories.deleteModal.errorHasChildren'));
      return;
    }
    if (category.productCount && category.productCount > 0) {
      toast.error(t('admin.categories.deleteModal.errorHasProducts'));
      return;
    }

    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const result = await categoryApi.deleteCategory(categoryToDelete.id);
      if (result.error) throw new Error(result.error.message);
      
      toast.success(t('common.success'));
      fetchCategories();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || t('common.error'));
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async (category: CategoryResponse) => {
    try {
      const result = await categoryApi.updateCategoryStatus(category.id, { isActive: !category.isActive });
      if (result.error) throw new Error(result.error.message);
      
      toast.success(t('common.success'));
      fetchCategories();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || t('common.error'));
    }
  };

  // Search logic: filter tree
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const lowerQuery = searchQuery.toLowerCase();
    
    const filterNode = (cat: CategoryResponse): CategoryResponse | null => {
      const match = cat.name.toLowerCase().includes(lowerQuery) || cat.slug.toLowerCase().includes(lowerQuery);
      
      const filteredChildren = cat.children
        ? cat.children.map(filterNode).filter((c): c is CategoryResponse => c !== null)
        : [];

      if (match || filteredChildren.length > 0) {
        return { ...cat, children: filteredChildren };
      }
      return null;
    };

    return categories.map(filterNode).filter((c): c is CategoryResponse => c !== null);
  }, [categories, searchQuery]);

  // If searching, auto-expand all matched nodes
  useEffect(() => {
    if (searchQuery) {
       const matchedIds = new Set<string>();
       const collectMatched = (cats: CategoryResponse[]) => {
          cats.forEach(c => {
             if (c.children && c.children.length > 0) {
               matchedIds.add(c.id);
               collectMatched(c.children);
             }
          });
       };
       collectMatched(filteredCategories);
       setExpandedNodes(matchedIds);
    }
  }, [searchQuery, filteredCategories]);

  const handleReorderRoot = async (index: number, direction: number) => {
    try {
      if (searchQuery) return;
      
      const items = [...categories];
      const targetIndex = index + direction;
      
      if (targetIndex < 0 || targetIndex >= items.length) return;
      
      const temp = items[index];
      items[index] = items[targetIndex];
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
      fetchCategories();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Global Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-100 dark:border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={t('admin.categories.searchPlaceholder')} 
            className="pl-11 pr-4 py-6 rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 font-light"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={fetchCategories} className="rounded-xl border-slate-200 dark:border-white/10 h-12 w-12">
            <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
          </Button>
          <Button variant="outline" onClick={expandAll} className="rounded-xl border-slate-200 dark:border-white/10 gap-2 h-12">
            <Maximize2 className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">{t('admin.categories.expandAll')}</span>
          </Button>
          <Button variant="outline" onClick={collapseAll} className="rounded-xl border-slate-200 dark:border-white/10 gap-2 h-12">
            <Minimize2 className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">{t('admin.categories.collapseAll')}</span>
          </Button>
          <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />
          <Button onClick={handleAddRoot} className="rounded-xl bg-slate-900 dark:bg-[#D4AF37] text-white gap-2 px-6 h-12 shadow-lg hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" />
            <span>{t('admin.categories.addRoot')}</span>
          </Button>
        </div>
      </div>

      {/* Categories Tree */}
      <div className="min-h-[400px]">
        {loading && categories.length === 0 ? (
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                <LayoutGrid className="h-10 w-10 text-slate-200" />
             </div>
             <p className="text-slate-400 font-light">{t('admin.categories.noCategoriesFound')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCategories.map((category, index) => (
              <CategoryNode
                key={category.id}
                category={category}
                level={0}
                onAddChild={handleAddChild}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMove={handleEdit}
                onToggleStatus={handleToggleStatus}
                expandedNodes={expandedNodes}
                onToggleExpand={toggleExpand}
                
                isFirst={!searchQuery && index === 0}
                isLast={!searchQuery && index === filteredCategories.length - 1}
                onMoveUp={!searchQuery ? () => handleReorderRoot(index, -1) : undefined}
                onMoveDown={!searchQuery ? () => handleReorderRoot(index, 1) : undefined}
                onRefresh={fetchCategories}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        initialParentId={defaultParentId}
        categories={categories}
        onSuccess={fetchCategories}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={t('admin.categories.deleteModal.title')}
        description={t('admin.categories.deleteModal.desc', { name: categoryToDelete?.name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
