'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const shopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(50),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
});

export async function createShop(formData: FormData) {
  const rawSlug = (formData.get('slug') as string) || '';
  const formattedSlug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const parsed = shopSchema.safeParse({
    name: formData.get('name'),
    slug: formattedSlug,
    description: formData.get('description'),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');

    throw new Error(message || 'Invalid shop details');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('shops').insert({
    owner_id: user.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('This shop URL slug is already taken. Please choose another one.');
    }

    throw new Error(error.message);
  }

  redirect('/dashboard');
}

export async function getMyShop() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function getPublicShopBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, description, status')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}
