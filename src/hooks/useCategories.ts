import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES } from '../constants/services';
import type { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoadingCategories(false);
      return;
    }

    supabase
      .from('categories')
      .select('id,slug,name_uz,name_ru,desc_uz,desc_ru,sort_order,is_active')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCategories(data as Category[]);
        }
        setLoadingCategories(false);
      });
  }, []);

  const getCategoryBySlug = (slug: string): Category | undefined =>
    categories.find((c) => c.slug === slug);

  return { categories, loadingCategories, getCategoryBySlug };
}
