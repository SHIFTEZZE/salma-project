'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ProductWithVariants } from '@/types/database';

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v), 10)),
  price_adj: z.union([z.number(), z.string()]).transform((v) => Math.round(parseFloat(String(v || '0')) * 100)),
});

const productInputSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  base_price: z.union([z.number(), z.string()]).transform((v) => Math.round(parseFloat(String(v)) * 100)),
  status: z.enum(['draft', 'active']),
});

// Helper to generate public URLs for images
function getImageUrls(images: { storage_path: string; position: number }[] | undefined): string[] {
  if (!images || images.length === 0) return [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucket = 'product-images';
  return images
    .sort((a, b) => a.position - b.position)
    .map((img) => `${supabaseUrl}/storage/v1/object/public/${bucket}/${img.storage_path}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: shop, error: shopError } = await supabase
    .from('shops').select('id, name').eq('owner_id', user.id).single();
  if (shopError || !shop) throw new Error('You must create a shop first');

  let rawVariants: unknown[];
  try {
    rawVariants = JSON.parse(formData.get('variants') as string);
    if (!Array.isArray(rawVariants)) throw new Error('Variants must be an array');
  } catch (e: any) {
    throw new Error(`Invalid variants format: ${e.message}`);
  }

  let rawImages: string[];
  try {
    rawImages = JSON.parse(formData.get('images') as string);
    if (!Array.isArray(rawImages)) rawImages = [];
  } catch {
    rawImages = [];
  }

  const parsedProduct = productInputSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    base_price: formData.get('base_price'),
    status: formData.get('status'),
  });

  if (!parsedProduct.success) {
    const errors = parsedProduct.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs?.join(', ')}`)
      .join('; ');
    throw new Error(message || 'Invalid product data');
  }

  const validatedVariants = [];
  for (let i = 0; i < rawVariants.length; i++) {
    const result = variantSchema.safeParse(rawVariants[i]);
    if (!result.success) throw new Error(`Variant ${i + 1}: Invalid data`);
    validatedVariants.push(result.data);
  }

  if (validatedVariants.length === 0) throw new Error('At least one variant is required');

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      shop_id: shop.id,
      title: parsedProduct.data.title,
      description: parsedProduct.data.description,
      base_price_cents: parsedProduct.data.base_price,
      status: parsedProduct.data.status,
    })
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  const variantsToInsert = validatedVariants.map((v) => ({
    product_id: product.id,
    size: v.size || null,
    color: v.color || null,
    stock_quantity: v.stock,
    price_adjustment_cents: v.price_adj,
  }));

  const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert);
  if (variantError) throw new Error(variantError.message);

  if (rawImages.length > 0) {
    const finalPaths: string[] = [];
    for (const path of rawImages) {
      if (path.includes('/temp/')) {
        const newPath = path.replace('/products/temp/', `products/${product.id}/`);
        await supabase.storage.from('product-images').move(path, newPath);
        finalPaths.push(newPath);
      } else {
        finalPaths.push(path);
      }
    }

    const imagesToInsert = finalPaths.map((storagePath, index) => ({
      product_id: product.id,
      storage_path: storagePath,
      position: index,
      alt_text: parsedProduct.data.title,
    }));

    const { error: imageError } = await supabase.from('product_images').insert(imagesToInsert);
    if (imageError) throw new Error(imageError.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/products');
  revalidatePath('/');
  return product;
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: shop, error: shopError } = await supabase
    .from('shops').select('id, name').eq('owner_id', user.id).single();
  if (shopError || !shop) throw new Error('No shop found');

  const productId = formData.get('productId') as string;
  if (!productId) throw new Error('Missing Product ID');

  // Verify ownership
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id, shop_id')
    .eq('id', productId)
    .eq('shop_id', shop.id)
    .single();
  
  if (!existingProduct) throw new Error('Unauthorized or product not found');

  let rawVariants: unknown[];
  try {
    rawVariants = JSON.parse(formData.get('variants') as string);
  } catch {
    throw new Error('Invalid variants format');
  }

  let rawImages: string[];
  try {
    rawImages = JSON.parse(formData.get('images') as string);
  } catch {
    rawImages = [];
  }

  const parsedProduct = productInputSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    base_price: formData.get('base_price'),
    status: formData.get('status'),
  });

  if (!parsedProduct.success) throw new Error('Invalid product data');

  const validatedVariants = [];
  for (let i = 0; i < rawVariants.length; i++) {
    const result = variantSchema.safeParse(rawVariants[i]);
    if (!result.success) throw new Error(`Variant ${i + 1}: Invalid data`);
    validatedVariants.push(result.data);
  }

  // 1. Update Product Record
  const { error: updateError } = await supabase
    .from('products')
    .update({
      title: parsedProduct.data.title,
      description: parsedProduct.data.description,
      base_price_cents: parsedProduct.data.base_price,
      status: parsedProduct.data.status,
    })
    .eq('id', productId);

  if (updateError) throw new Error(updateError.message);

  // 2. Handle Variants (Delete old, Insert new)
  await supabase.from('product_variants').delete().eq('product_id', productId);
  
  const variantsToInsert = validatedVariants.map((v) => ({
    product_id: productId,
    size: v.size || null,
    color: v.color || null,
    stock_quantity: v.stock,
    price_adjustment_cents: v.price_adj,
  }));

  const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert);
  if (variantError) throw new Error(variantError.message);

  // 3. Handle Images Sync
  const { data: existingImages } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId);

  const existingPaths = existingImages?.map(i => i.storage_path) || [];
  
  // Find paths to remove
  const pathsToRemove = existingPaths.filter(p => !rawImages.includes(p));
  if (pathsToRemove.length > 0) {
    await supabase.storage.from('product-images').remove(pathsToRemove);
    await supabase.from('product_images').delete().in('storage_path', pathsToRemove);
  }

  // Find paths to add
  const pathsToAdd = rawImages.filter(p => !existingPaths.includes(p));
  if (pathsToAdd.length > 0) {
    const imagesToInsert = pathsToAdd.map((path, index) => ({
      product_id: productId,
      storage_path: path,
      position: existingPaths.length + index,
      alt_text: parsedProduct.data.title,
    }));
    await supabase.from('product_images').insert(imagesToInsert);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/products/${productId}`);
  revalidatePath('/products');
  revalidatePath('/');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user.id).single();
  if (!shop) throw new Error('No shop found');

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, shop_id')
    .eq('id', productId)
    .eq('shop_id', shop.id)
    .single();

  if (fetchError || !product) throw new Error('Product not found or unauthorized');

  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId);

  if (images && images.length > 0) {
    const paths = images.map(img => img.storage_path);
    await supabase.storage.from('product-images').remove(paths);
  }

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (deleteError) throw new Error(deleteError.message);

  revalidatePath('/dashboard');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function getPublicProducts(categorySlug?: string): Promise<ProductWithVariants[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select(`
    *,
    shop:shops!inner(name, slug, status),
    variants:product_variants(*),
    images:product_images(storage_path, position)
  `);
  query = query.eq('status', 'active').eq('shop.status', 'approved').order('created_at', { ascending: false });
  if (categorySlug) {
    const { data: category } = await supabase.from('categories').select('id, name').eq('slug', categorySlug).maybeSingle();
    if (!category) return [];
    query = query.eq('category_id', category.id);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as any[]).map((p) => ({
    ...p,
    image_urls: getImageUrls(p.images),
  })) as unknown as ProductWithVariants[];
}

export async function getShopPublicProducts(shopId: string): Promise<ProductWithVariants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select(`
    *,
    shop:shops!inner(name, slug, status),
    variants:product_variants(*),
    images:product_images(storage_path, position)
  `).eq('shop_id', shopId).eq('status', 'active').eq('shop.status', 'approved').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (data as any[]).map((p) => ({
    ...p,
    image_urls: getImageUrls(p.images),
  })) as unknown as ProductWithVariants[];
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select(`
    *,
    shop:shops!inner(name, slug, status),
    variants:product_variants(*),
    images:product_images(storage_path, position)
  `).eq('id', id).eq('status', 'active').eq('shop.status', 'approved').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    image_urls: getImageUrls(data.images),
  } as unknown as ProductWithVariants;
}

export async function getSellerProducts(): Promise<ProductWithVariants[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!shop) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      images:product_images(storage_path, position)
    `)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as any[]).map((p) => ({
    ...p,
    image_urls: getImageUrls(p.images),
    shop: { name: shop.name, slug: '', status: '' } 
  })) as unknown as ProductWithVariants[];
}



export async function getProductForEditing(productId: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user.id).single();
  if (!shop) return null;

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      images:product_images(storage_path, position)
    `)
    .eq('id', productId)
    .eq('shop_id', shop.id) // Strict ownership check
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    image_urls: getImageUrls(data.images),
    shop: { name: shop.name, slug: '', status: '' } 
  } as unknown as ProductWithVariants;
}
