'use server';

import { createClient } from '@/lib/supabase/server';

export type ActiveCategory = {
  id: string;
  name: string;
  slug: string;
};

export async function getActiveCategories(): Promise<ActiveCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return data as ActiveCategory[];
}
