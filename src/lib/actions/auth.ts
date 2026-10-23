'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const authSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function signIn(formData: FormData) {
  const parsed = authSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) throw new Error('Invalid credentials');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) throw new Error(error.message);
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const parsed = authSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) throw new Error('Invalid credentials');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email, password: parsed.data.password,
    options: { data: { display_name: formData.get('display_name') } }
  });
  if (error) throw new Error(error.message);
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
