'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryResponse } from '@/lib/types/product';
import { categoryApi } from '@/lib/api/category';
import { slugify } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoryCombobox } from './CategoryCombobox';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().or(z.literal('')),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryResponse | null; 
  initialParentId?: string | null;
  categories: CategoryResponse[]; 
  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  initialParentId,
  categories,
  onSuccess,
}: CategoryDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          parentId: category.parentId || null,
          isActive: category.isActive,
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          description: '',
          parentId: initialParentId || null,
          isActive: true,
        });
      }
    }
  }, [category, initialParentId, form, open]);

  const name = form.watch('name');
  useEffect(() => {
    if (!category && name && open) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, category, form, open]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (category) {
        const result = await categoryApi.updateCategory(category.id, {
          name: values.name,
          description: values.description,
          parentId: values.parentId,
        });
        
        if (result.error) throw new Error(result.error.message);

        if (values.isActive !== category.isActive) {
           const statusResult = await categoryApi.updateCategoryStatus(category.id, { isActive: values.isActive });
           if (statusResult.error) throw new Error(statusResult.error.message);
        }
      } else {
        const result = await categoryApi.createCategory({
          name: values.name,
          slug: values.slug,
          description: values.description,
          parentId: values.parentId,
        });
        if (result.error) throw new Error(result.error.message);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || error?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recursive function to find all descendant IDs
  const excludedIds = React.useMemo(() => {
    if (!category) return [];
    
    const getDescendantIds = (cat: CategoryResponse): string[] => {
      let ids = [cat.id];
      if (cat.children) {
        cat.children.forEach(child => {
          ids = [...ids, ...getDescendantIds(child)];
        });
      }
      return ids;
    };
    
    return getDescendantIds(category);
  }, [category]);

  const eligibleParents = React.useMemo(() => {
    const flat = categoryApi.flattenCategories(categories);

    return flat.filter(c => {
       // Cannot select itself or descendants
       if (excludedIds.includes(c.id)) return false;
       
       // Rules: Categories that contain products cannot become parent nodes
       if (c.productCount && c.productCount > 0) return false;

       return true;
    });
  }, [categories, excludedIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0A0A0A]">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
          <DialogTitle className="text-2xl font-light italic">
            {category ? t('admin.categories.form.editTitle') : t('admin.categories.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="font-light text-slate-500">
            {t('admin.categories.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 dark:bg-red-900/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      {t('admin.categories.form.name')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('admin.categories.form.namePlaceholder')} 
                        className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6 px-4"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      {t('admin.categories.form.slug')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        disabled={!!category} 
                        className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 py-6 px-4 font-mono text-xs"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-[9px] font-medium tracking-tight text-slate-400">
                      {t('admin.categories.form.slugHint')}
                    </FormDescription>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      {t('admin.categories.form.parent')}
                    </FormLabel>
                    <FormControl>
                      <CategoryCombobox
                        categories={categories}
                        value={field.value}
                        onValueChange={field.onChange}
                        excludeIds={excludedIds}
                        placeholder={t('admin.categories.form.root')}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      {t('admin.categories.form.description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 min-h-[100px] p-4"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-5 border border-slate-100 dark:border-white/10 rounded-3xl bg-slate-50/30 dark:bg-white/2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-light">
                        {t('admin.categories.form.activeLabel')}
                      </FormLabel>
                      <FormDescription className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                        {field.value ? t('admin.categories.status.active') : t('admin.categories.status.inactive')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#D4AF37]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6 border-t border-slate-100 dark:border-white/10 gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-light h-12 px-6">
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-2xl bg-slate-900 dark:bg-[#D4AF37] text-white px-10 h-12 font-light shadow-xl shadow-slate-900/10 dark:shadow-[#D4AF37]/20 hover:opacity-90 transition-all"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? t('common.save') : t('common.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
